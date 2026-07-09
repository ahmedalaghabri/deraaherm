/**
 * ─────────────────────────────────────────────────────────────
 * Design System — نظام التصميم الموحد (فاتح + غامق)
 * المرجع: صفحة الأداء (SalesPerformancePage)
 *
 * الاستخدام:
 *   import { ds, brand, pctColor } from "@/lib/design-system";
 *   <div className={ds.card}>...</div>
 *   <div className={cn(ds.card, "p-4")}>...</div>
 *
 * كل صفحة جديدة يجب أن تستخدم هذه الرموز بدلاً من كتابة
 * الفئات يدوياً، لضمان توحيد الثيم الفاتح والغامق.
 * ─────────────────────────────────────────────────────────────
 */

// ── ألوان العلامة / الحالات (تُستخدم في الرسوم البيانية والشارات الملوّنة) ──
export const brand = {
  primary: "#4D8AFF",   // أزرق — أساسي / "جيد"
  success: "#00C9A7",   // أخضر مائي — نجاح / "ممتاز"
  warning: "#F9A825",   // كهرماني — تحذير / "متوسط"
  danger:  "#E91E8C",   // وردي — خطر / "ضعيف"
  accent:  "#B21063",   // عنّابي — روابط الجداول / الفرز / التثبيت
  info:    "#00B4D8",   // سماوي
  violet:  "#845EC2",   // بنفسجي
} as const;

/** لون نسبة التحقيق حسب القيمة (نفس منطق صفحة الأداء) */
export function pctColor(pct: number): string {
  if (pct >= 100) return brand.success;
  if (pct >= 80) return brand.primary;
  if (pct >= 60) return brand.warning;
  return brand.danger;
}

// ── رموز الفئات (Tailwind class tokens) ──
export const ds = {
  /* ── الصفحة ── */
  /** خلفية الصفحة الكاملة */
  page: "min-h-screen bg-neutral-0 dark:bg-neutral-900",
  /** حاوية المحتوى القصوى */
  container: "max-w-[1400px] mx-auto px-1 sm:px-2",

  /* ── الأسطح (Surfaces) ── */
  /** بطاقة قياسية (rounded-xl) — مثل KpiCard */
  card: "bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm",
  /** بطاقة كبيرة (rounded-2xl) — مثل بطاقات الرسوم البيانية والجداول */
  cardLg: "bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm",
  /** تأثير التحويم على البطاقات */
  cardHover: "hover:shadow-md transition-shadow",
  /** سطح ثانوي داخل بطاقة (لوحات داخلية) */
  panel: "bg-neutral-50 dark:bg-neutral-900/50 rounded-xl",
  /** سطح زجاجي (هيدر لاصق / شريط علوي) */
  glass: "bg-white/80 dark:bg-neutral-800/80 backdrop-blur border border-white/80 dark:border-neutral-700/80",

  /* ── الحدود ── */
  border: "border-neutral-100 dark:border-neutral-700",
  borderStrong: "border-neutral-200 dark:border-neutral-600",
  divider: "border-b border-neutral-100 dark:border-neutral-700",

  /* ── النصوص ── */
  /** عنوان رئيسي داخل بطاقة */
  textHeading: "text-neutral-800 dark:text-neutral-200 font-bold",
  /** نص أساسي / عنوان بطاقة إحصائية */
  textPrimary: "text-neutral-700 dark:text-neutral-300",
  /** نص ثانوي / تسميات */
  textSecondary: "text-neutral-600 dark:text-neutral-400",
  /** نص خافت / تلميحات */
  textMuted: "text-neutral-500 dark:text-neutral-400",
  /** قيمة رقمية كبيرة */
  textValue: "text-neutral-800 dark:text-neutral-200 font-bold tracking-tight tabular-nums",

  /* ── صندوق الأيقونة (نفس KpiCard) ── */
  iconBox: "flex items-center justify-center shrink-0 bg-neutral-100 dark:bg-neutral-700 rounded-lg",
  iconBoxIcon: "text-neutral-700 dark:text-neutral-300",

  /* ── الأزرار ── */
  /** زر أساسي (مثل تبويب نشط) */
  btnPrimary: "bg-neutral-900 text-white shadow-sm rounded-xl font-bold transition-all duration-150",
  /** زر ثانوي / خامل */
  btnGhost: "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white rounded-xl font-bold transition-all duration-150",
  /** زر أيقونة (جرس الإشعارات / الحساب) */
  btnIcon: "flex items-center justify-center rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors shrink-0",
  /** زر مخطط (تصدير / طباعة) */
  btnOutline: "rounded-2xl border dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors",

  /* ── الحقول ── */
  input: "rounded-2xl text-sm bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 dark:text-neutral-200",

  /* ── الجداول ── */
  tableHead: "bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-700",
  tableHeadCell: "px-2 sm:px-3 py-2 sm:py-3 text-right font-bold text-neutral-600 dark:text-neutral-400 whitespace-nowrap",
  tableRow: "border-b border-neutral-100 dark:border-neutral-700/60 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors",
  tableFoot: "bg-neutral-100 dark:bg-neutral-700 border-t-2 border-neutral-300 dark:border-neutral-600 font-bold",

  /* ── الشارات (Badges) ── */
  chip: "text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 px-2.5 py-0.5 rounded-full font-medium",
  badgeSuccess: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full",
  badgeInfo: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300 rounded-full",
  badgeWarning: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300 rounded-full",
  badgeDanger: "bg-rose-100 text-rose-900 dark:bg-rose-900/30 dark:text-rose-300 rounded-full",

  /* ── القوائم المنسدلة ── */
  dropdown: "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-2xl shadow-xl overflow-hidden",
  dropdownItem: "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors",
} as const;

export type DsToken = keyof typeof ds;
