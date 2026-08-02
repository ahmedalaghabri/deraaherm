// ====== Firestore-backed Client — Supabase-compatible API ======
// نفس واجهة Supabase (from/select/insert/update/eq/order) لكن التخزين على Firebase Firestore.
// يعمل دون اتصال بفضل التخزين المحلي الدائم في Firestore ويُزامن تلقائياً.

import {
  collection,
  doc,
  getDocs,
  query as fsQuery,
  where,
  orderBy,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

type Row = Record<string, any>;
type SupabaseResult = { data: Row[] | null; error: { message: string } | null };

function genId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// Firestore يرفض قيم undefined — نزيلها بعمق قبل أي كتابة
function stripUndefined(v: any): any {
  if (Array.isArray(v)) return v.map(stripUndefined);
  if (v && typeof v === 'object') {
    const out: Row = {};
    for (const [k, val] of Object.entries(v)) {
      if (val !== undefined) out[k] = stripUndefined(val);
    }
    return out;
  }
  return v;
}

class QueryBuilder {
  private _table: string;
  private _filters: Array<[string, any]> = [];
  private _orderCol?: string;
  private _orderAsc = true;
  private _op: 'select' | 'insert' | 'update' = 'select';
  private _insertData?: Row | Row[];
  private _updateData?: Row;

  constructor(table: string) {
    this._table = table;
  }

  select(_cols?: string): this {
    if (this._op !== 'insert' && this._op !== 'update') {
      this._op = 'select';
    }
    return this;
  }

  insert(data: Row | Row[]): this {
    this._op = 'insert';
    this._insertData = data;
    return this;
  }

  update(data: Row): this {
    this._op = 'update';
    this._updateData = data;
    return this;
  }

  eq(col: string, val: any): this {
    this._filters.push([col, val]);
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }): this {
    this._orderCol = col;
    this._orderAsc = opts?.ascending !== false;
    return this;
  }

  then<T1 = SupabaseResult, T2 = never>(
    onfulfilled?: ((v: SupabaseResult) => T1 | PromiseLike<T1>) | null,
    onrejected?: ((r: any) => T2 | PromiseLike<T2>) | null
  ): Promise<T1 | T2> {
    return this._exec().then(onfulfilled, onrejected);
  }

  catch<T = never>(
    onrejected?: ((r: any) => T | PromiseLike<T>) | null
  ): Promise<SupabaseResult | T> {
    return this._exec().catch(onrejected);
  }

  finally(onfinally?: (() => void) | null): Promise<SupabaseResult> {
    return this._exec().finally(onfinally);
  }

  private async _exec(): Promise<SupabaseResult> {
    try {
      const colRef = collection(db, this._table);

      if (this._op === 'select') {
        const constraints = [
          ...this._filters.map(([col, val]) => where(col, '==', val)),
          ...(this._orderCol ? [orderBy(this._orderCol, this._orderAsc ? 'asc' : 'desc')] : []),
        ];
        let rows: Row[];
        try {
          const snap = await getDocs(constraints.length ? fsQuery(colRef, ...constraints) : colRef);
          rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch {
          // قد يفشل الاستعلام المركّب لعدم وجود فهرس — نجلب الكل ونصفّي محلياً
          const snap = await getDocs(colRef);
          rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          for (const [col, val] of this._filters) rows = rows.filter(r => r[col] === val);
          if (this._orderCol) {
            const col = this._orderCol;
            const asc = this._orderAsc;
            rows = [...rows].sort((a, b) => {
              if (a[col] < b[col]) return asc ? -1 : 1;
              if (a[col] > b[col]) return asc ? 1 : -1;
              return 0;
            });
          }
        }
        return { data: rows, error: null };
      }

      if (this._op === 'insert') {
        const arr: Row[] = Array.isArray(this._insertData)
          ? (this._insertData as Row[])
          : [this._insertData as Row];
        const now = new Date().toISOString();
        const inserted: Row[] = [];
        for (const item of arr) {
          const id = (item.id as string) || genId();
          const row = { created_at: now, updated_at: now, ...stripUndefined(item), id };
          await setDoc(doc(db, this._table, id), row, { merge: true });
          inserted.push(row);
        }
        return { data: inserted, error: null };
      }

      if (this._op === 'update') {
        // نجلب الصفوف المطابقة ثم نحدّثها
        let rows: Row[];
        const snap = await getDocs(colRef);
        rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        for (const [col, val] of this._filters) rows = rows.filter(r => r[col] === val);
        const updated: Row[] = [];
        for (const r of rows) {
          const u = { ...r, ...this._updateData, updated_at: new Date().toISOString() };
          await updateDoc(doc(db, this._table, r.id), { ...stripUndefined(this._updateData), updated_at: u.updated_at });
          updated.push(u);
        }
        return { data: updated, error: null };
      }

      return { data: null, error: { message: 'Unknown operation' } };
    } catch (e: any) {
      return { data: null, error: { message: e?.message ?? 'Unknown error' } };
    }
  }
}

export const supabase = {
  from(table: string): QueryBuilder {
    return new QueryBuilder(table);
  },
};
