import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ListChecks, X } from "lucide-react";

export const DAILY_TASKS = [
  "تنظيف الواجهات والزجاج",
  "مسح وترتيب الأرفف",
  "التأكد من نظافة منطقة الكاشير",
  "مراجعة وترتيب المنتجات المعروضة",
  "تعبئة المنتجات الناقصة على الأرفف",
  "مطابقة الأسعار والعروض",
  "جرد الخزنة النقدية",
  "مراجعة المرتجعات والملاحظات",
  "إغلاق الحساب اليومي",
  "التأكد من إغلاق المعرض وتأمينه",
];

export const dailyRoutineStorageKey = () => `deraah-daily-routine-${new Date().toISOString().slice(0, 10)}`;

export function loadDailyCompleted(): Set<string> {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(dailyRoutineStorageKey()) || "[]"));
  } catch {
    return new Set<string>();
  }
}

interface DailyRoutineModalProps {
  open: boolean;
  onClose: () => void;
  completed: Set<string>;
  onToggle: (task: string) => void;
}

const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

export default function DailyRoutineModal({ open, onClose, completed, onToggle }: DailyRoutineModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const doneCount = completed.size;
  const pct = Math.round((doneCount / DAILY_TASKS.length) * 100);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-[9999] grid place-items-center p-4 bg-slate-900/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="daily-routine-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-neutral-100 dark:border-neutral-700">
              <div className="flex items-center gap-3">
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <ListChecks className="w-5 h-5" />
                </span>
                <div>
                  <h2 id="daily-routine-title" className="m-0 text-lg font-extrabold text-neutral-800 dark:text-neutral-100">المهام اليومية</h2>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">قائمة الأعمال الروتينية للبائع — {DAILY_TASKS.length} مهام — {(() => { const d = new Date(); return `${d.getDate()} ${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}`; })()}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="إغلاق"
                className="grid place-items-center w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-900/30">
              <div className="flex items-center justify-between mb-2 text-xs font-bold text-neutral-600 dark:text-neutral-300">
                <span>التقدم اليومي</span>
                <span className="tabular-nums">{doneCount} من {DAILY_TASKS.length} مكتملة</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 px-6 py-4 overflow-y-auto">
              {DAILY_TASKS.map((task) => {
                const isDone = completed.has(task);
                return (
                  <button
                    key={task}
                    type="button"
                    onClick={() => onToggle(task)}
                    aria-pressed={isDone}
                    className={
                      "flex items-center justify-between gap-3 min-h-[60px] px-3.5 py-3 rounded-xl border text-right transition-all duration-150 " +
                      (isDone
                        ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-900/20"
                        : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-emerald-300 dark:hover:border-emerald-700")
                    }
                  >
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-bold text-neutral-800 dark:text-neutral-100 leading-relaxed">{task}</span>
                      <span className={"block mt-0.5 text-[11px] font-semibold " + (isDone ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-400 dark:text-neutral-500")}>
                        {isDone ? "مكتمل" : "بانتظار التنفيذ"}
                      </span>
                    </span>
                    <span
                      className={
                        "inline-flex items-center gap-1.5 shrink-0 min-w-[72px] justify-center px-3 py-2 rounded-lg border text-[11px] font-bold whitespace-nowrap transition-colors " +
                        (isDone
                          ? "border-emerald-200 dark:border-emerald-700 bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                          : "border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900")
                      }
                    >
                      {isDone && <Check className="w-3 h-3" strokeWidth={3} />}
                      {isDone ? "تراجع" : "تم"}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
