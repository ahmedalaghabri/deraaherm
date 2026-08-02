// ====== Hook مزامنة لحظية لمجموعة Firestore مع حالة React ======
// - مزامنة لحظية عبر onSnapshot: أي تغيير من جهاز آخر يظهر فوراً دون تحديث الصفحة
// - يبذر البيانات الافتراضية إذا كانت المجموعة فارغة عند أول تشغيل
// - يحفظ أي تغيير محلي إلى Firestore تلقائياً (كتابة مؤجلة debounced)
// - يعمل دون اتصال بفضل التخزين المحلي الدائم في Firestore

import { useEffect, useRef, useState, useCallback } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

type WithId = { id: string };

// Firestore يرفض قيم undefined — نزيلها بعمق قبل أي كتابة
function stripUndefined<V>(v: V): V {
  if (Array.isArray(v)) return v.map(stripUndefined) as V;
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (val !== undefined) out[k] = stripUndefined(val);
    }
    return out as V;
  }
  return v;
}

export function useFirestoreCollection<T extends WithId>(
  collectionName: string,
  getSeedData: () => T[],
  localCacheKey?: string
): [T[], React.Dispatch<React.SetStateAction<T[]>>, boolean] {
  const [items, setItems] = useState<T[]>(() => getSeedData());
  const [loaded, setLoaded] = useState(false);
  const dirty = useRef(false);            // توجد تعديلات محلية لم تُحفظ بعد
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const knownIds = useRef<Set<string>>(new Set());
  const seeded = useRef(false);

  // مزامنة لحظية: أي تغيير في Firestore (من أي جهاز) يصل فوراً
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, collectionName),
      async (snap) => {
        // بذر البيانات الافتراضية عند أول تشغيل (مرة واحدة فقط)
        if (snap.empty && !seeded.current) {
          seeded.current = true;
          try {
            const seed = getSeedData();
            const batch = writeBatch(db);
            seed.forEach(item => batch.set(doc(db, collectionName, item.id), stripUndefined(item)));
            await batch.commit(); // سيصل snapshot جديد بالبيانات المبذورة
          } catch (e) {
            console.warn(`[Firestore] تعذر بذر ${collectionName}:`, e);
          }
          setLoaded(true);
          return;
        }
        // مزامنة لمرة واحدة: رفع البيانات القديمة المحفوظة محلياً (localStorage) إن لم تكن في السحابة
        const migratedKey = `fs_migrated_${collectionName}`;
        if (localCacheKey && !localStorage.getItem(migratedKey) && localStorage.getItem(localCacheKey)) {
          try {
            const localRows: T[] = JSON.parse(localStorage.getItem(localCacheKey)!);
            const cloudIds = new Set(snap.docs.map(d => d.id));
            const missing = localRows.filter(r => r.id && !cloudIds.has(r.id));
            if (missing.length) {
              const batch = writeBatch(db);
              missing.forEach(item => batch.set(doc(db, collectionName, item.id), stripUndefined(item)));
              await batch.commit();
            }
            localStorage.setItem(migratedKey, "1");
            if (missing.length) return; // سيصل snapshot جديد شامل للمُرحّل
          } catch (e) {
            console.warn(`[Firestore] تعذر ترحيل بيانات ${collectionName}:`, e);
          }
        }
        // لا نطبّق الوارد أثناء وجود تعديلات محلية غير محفوظة (ستُكتب قريباً ويصل صداها)
        if (dirty.current) return;
        const rows = snap.docs.map(d => ({ ...(d.data() as T), id: d.id }));
        knownIds.current = new Set(rows.map(r => r.id));
        setItems(rows);
        setLoaded(true);
      },
      (e) => {
        console.warn(`[Firestore] تعذر الاستماع لـ ${collectionName}:`, e);
        setLoaded(true);
      }
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName]);

  // حفظ التعديلات المحلية إلى Firestore (مؤجل 400ms لتجميع التعديلات المتتالية)
  useEffect(() => {
    if (!dirty.current) return; // التغيير وارد من المزامنة اللحظية — لا حاجة للحفظ
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const snapshot = items;
    const doSave = async (attempt: number) => {
      try {
        const currentIds = new Set(snapshot.map(i => i.id));
        // حذف المستندات التي أُزيلت محلياً
        const removed = [...knownIds.current].filter(id => !currentIds.has(id));
        await Promise.all(removed.map(id => deleteDoc(doc(db, collectionName, id))));
        // حفظ/تحديث الكل (setDoc مع merge يضمن عدم فقدان الحقول)
        await Promise.all(snapshot.map(item => setDoc(doc(db, collectionName, item.id), stripUndefined(item), { merge: true })));
        knownIds.current = currentIds;
        dirty.current = false; // اكتمل الحفظ — نسمح بتطبيق المزامنة اللحظية مجدداً
      } catch (e) {
        console.warn(`[Firestore] تعذر حفظ ${collectionName} (محاولة ${attempt}):`, e);
        // نبقي dirty=true ونعيد المحاولة حتى لا تُمسح التعديلات المحلية
        if (attempt < 5) saveTimer.current = setTimeout(() => doSave(attempt + 1), 2000);
      }
    };
    saveTimer.current = setTimeout(() => doSave(1), 400);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, collectionName]);

  // أي تعديل عبر هذا المُعدّل يُعتبر تعديلاً محلياً يجب حفظه
  const setItemsWrapped = useCallback<React.Dispatch<React.SetStateAction<T[]>>>((action) => {
    dirty.current = true;
    setItems(action);
  }, []);

  return [items, setItemsWrapped, loaded];
}
