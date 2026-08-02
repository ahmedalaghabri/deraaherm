// ═══════════════════════════════════════════════════════════════
// Server mirror of src/components/ai/assistantData.ts
// Deterministic — identical numbers to the client-side engine
// ═══════════════════════════════════════════════════════════════

export const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

function seed(n: number) {
  return ((n * 9301 + 49297) % 233280) / 233280;
}
function strHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function rng(min: number, max: number, s: number) {
  return Math.round(min + s * (max - min));
}
function mk(...parts: number[]) {
  return parts.reduce((a, v, i) => (a ^ ((v + 1) * (i * 7919 + 1))) >>> 0, 0) % 233280;
}

export interface AsstEmployee {
  id: string;
  name: string;
  role: string;
  showroom: string;
}

export const ASST_EMPLOYEES: AsstEmployee[] = [
  { id: "e1", name: "احمد الاغبري",      role: "مدير المبيعات",  showroom: "معرض الرياض - العليا" },
  { id: "e2", name: "جهاد غانم",         role: "مدير عام",       showroom: "المركز الرئيسي" },
  { id: "e3", name: "محمد القحطاني",     role: "مشرف مبيعات",    showroom: "معرض الرياض - العليا" },
  { id: "e4", name: "خالد الشمري",       role: "بائع أول",       showroom: "معرض جدة - التحلية" },
  { id: "e5", name: "فهد العنزي",        role: "بائع",           showroom: "معرض الدمام - الشاطئ" },
  { id: "e6", name: "عبدالرحمن الدوسري", role: "بائع",           showroom: "معرض مكة - العزيزية" },
  { id: "e7", name: "سعد الحربي",        role: "بائع أول",       showroom: "معرض المدينة - قباء" },
  { id: "e8", name: "طلال الراشد",       role: "بائع",           showroom: "معرض أبها - الخالدية" },
  { id: "e9", name: "سلطان العتيبي",     role: "بائع",           showroom: "معرض تبوك - المروج" },
  { id: "e10", name: "نواف المطيري",     role: "بائع",           showroom: "معرض حائل - السمراء" },
  { id: "e11", name: "فاتن الراعي",      role: "موارد بشرية",    showroom: "المركز الرئيسي" },
  { id: "e12", name: "أحمد الحربي",      role: "مشرف مبيعات",    showroom: "معرض جدة - التحلية" },
];

export const ASST_SHOWROOMS = [
  "معرض الرياض - العليا",
  "معرض جدة - التحلية",
  "معرض الدمام - الشاطئ",
  "معرض مكة - العزيزية",
  "معرض المدينة - قباء",
  "معرض أبها - الخالدية",
  "معرض تبوك - المروج",
  "معرض حائل - السمراء",
];

export function employeeMonthlySales(empName: string, year: number, month: number): number {
  const h = strHash(empName);
  const base = rng(120_000, 480_000, seed(h % 1000));
  const monthFactor = 0.75 + seed(mk(h, year, month)) * 0.55;
  return Math.round((base * monthFactor) / 100) * 100;
}

export function employeeMonthlyTarget(empName: string, year: number, month: number): number {
  const sales = employeeMonthlySales(empName, year, month);
  const h = strHash(empName);
  return Math.round((sales * (0.85 + seed(mk(h, year, month, 7)) * 0.35)) / 1000) * 1000;
}

export function showroomMonthlySales(showroom: string, year: number, month: number): number {
  const h = strHash(showroom);
  const base = rng(800_000, 2_400_000, seed(h % 1000));
  const monthFactor = 0.72 + seed(mk(h, year, month)) * 0.6;
  return Math.round((base * monthFactor) / 1000) * 1000;
}

export function showroomDailySales(showroom: string, year: number, month: number, day: number): number {
  const monthly = showroomMonthlySales(showroom, year, month);
  const dim = new Date(year, month + 1, 0).getDate();
  const h = strHash(showroom);
  const dayFactor = 0.6 + seed(mk(h, year, month, day)) * 0.8;
  return Math.round((monthly / dim) * dayFactor);
}

export function showroomRangeSales(showroom: string, from: Date, to: Date): number {
  let total = 0;
  const cur = new Date(from);
  while (cur <= to) {
    total += showroomDailySales(showroom, cur.getFullYear(), cur.getMonth(), cur.getDate());
    cur.setDate(cur.getDate() + 1);
  }
  return total;
}

export interface AsstTask {
  id: string;
  title: string;
  assignee: string;
  status: "todo" | "in-progress" | "in-review" | "overdue" | "completed";
  dueDate: string;
  priority: "عالية" | "متوسطة" | "منخفضة";
}

export const ASST_TASKS: AsstTask[] = [
  { id: "t1", title: "تقرير مبيعات الربع الثاني",        assignee: "احمد الاغبري",  status: "in-progress", dueDate: "2026-07-25", priority: "عالية" },
  { id: "t2", title: "جرد معرض الرياض - العليا",          assignee: "محمد القحطاني", status: "overdue",     dueDate: "2026-07-10", priority: "عالية" },
  { id: "t3", title: "تحديث أسعار العطور",                assignee: "خالد الشمري",   status: "todo",        dueDate: "2026-07-28", priority: "متوسطة" },
  { id: "t4", title: "متابعة طلبات التحويل",              assignee: "احمد الاغبري",  status: "todo",        dueDate: "2026-07-30", priority: "منخفضة" },
  { id: "t5", title: "تدريب البائعين الجدد",              assignee: "أحمد الحربي",   status: "overdue",     dueDate: "2026-07-05", priority: "عالية" },
  { id: "t6", title: "مراجعة عقود الموردين",              assignee: "جهاد غانم",     status: "in-review",   dueDate: "2026-07-22", priority: "متوسطة" },
  { id: "t7", title: "خطة افتتاح معرض الخبر",             assignee: "احمد الاغبري",  status: "in-progress", dueDate: "2026-08-02", priority: "عالية" },
  { id: "t8", title: "تقييم أداء فريق جدة",               assignee: "أحمد الحربي",   status: "completed",   dueDate: "2026-07-12", priority: "متوسطة" },
  { id: "t9", title: "حصر العهد المستحقة",                assignee: "فاتن الراعي",   status: "todo",        dueDate: "2026-07-26", priority: "منخفضة" },
  { id: "t10", title: "إعداد عروض نهاية الموسم",          assignee: "خالد الشمري",   status: "completed",   dueDate: "2026-07-08", priority: "عالية" },
];

export const TASK_STATUS_AR: Record<AsstTask["status"], string> = {
  "todo": "معلقة",
  "in-progress": "قيد العمل",
  "in-review": "قيد المراجعة",
  "overdue": "متأخرة",
  "completed": "منتهية",
};

export function employeeMonthlyLateness(empName: string, year: number, month: number): { lateDays: number; lateMinutes: number } {
  const h = strHash(empName);
  const lateDays = rng(0, 7, seed(mk(h, year, month, 3)));
  const lateMinutes = lateDays === 0 ? 0 : rng(lateDays * 8, lateDays * 35, seed(mk(h, year, month, 5)));
  return { lateDays, lateMinutes };
}

export function employeeMonthlyAbsence(empName: string, year: number, month: number): number {
  const h = strHash(empName);
  return rng(0, 3, seed(mk(h, year, month, 9)));
}

export interface LeaveBalance {
  annualTotal: number;
  annualUsed: number;
  sickUsed: number;
  compensatory: number;
}

export function employeeLeaveBalance(empName: string): LeaveBalance {
  const h = strHash(empName);
  const annualTotal = 30;
  const annualUsed = rng(4, 22, seed(h % 900));
  return {
    annualTotal,
    annualUsed,
    sickUsed: rng(0, 5, seed((h + 17) % 900)),
    compensatory: rng(0, 4, seed((h + 31) % 900)),
  };
}

export interface AsstTransaction {
  id: string;
  title: string;
  type: string;
  direction: "وارد" | "صادر";
  status: "قيد المعالجة" | "منتهية" | "مرفوضة" | "معلقة";
  date: string;
  handlers: string[];
}

export const ASST_TRANSACTIONS: AsstTransaction[] = [
  { id: "2026-101", title: "موافقة على طلب إجازة - سالم أحمد",   type: "إجازة سنوية",   direction: "وارد", status: "معلقة",        date: "2026-07-16", handlers: ["فاتن الراعي", "احمد الاغبري"] },
  { id: "2026-102", title: "طلب مراجعة شهادة راتب - نورة محمد",  type: "شهادة",         direction: "وارد", status: "قيد المعالجة", date: "2026-07-15", handlers: ["فاتن الراعي"] },
  { id: "2026-103", title: "اعتماد ترقية موظف - عبدالله خالد",   type: "موارد بشرية",   direction: "وارد", status: "منتهية",       date: "2026-07-14", handlers: ["فاتن الراعي", "جهاد غانم", "احمد الاغبري"] },
  { id: "2026-104", title: "موافقة على طلب تدريب - ريم سعيد",    type: "تدريب",         direction: "وارد", status: "قيد المعالجة", date: "2026-07-13", handlers: ["أحمد الحربي", "احمد الاغبري"] },
  { id: "2026-105", title: "مراجعة طلب نقل - محمد عمر",          type: "إدارية",        direction: "وارد", status: "معلقة",        date: "2026-07-12", handlers: ["جهاد غانم"] },
  { id: "2026-106", title: "طلب بدل مواصلات - خالد أحمد",        type: "بدل مواصلات",   direction: "وارد", status: "معلقة",        date: "2026-07-18", handlers: ["احمد الاغبري"] },
  { id: "2026-107", title: "تعميم تحديث سياسة الدوام",           type: "تعميم",         direction: "صادر", status: "منتهية",       date: "2026-07-10", handlers: ["جهاد غانم", "فاتن الراعي"] },
  { id: "2026-108", title: "طلب صيانة معرض الدمام",              type: "صيانة",         direction: "وارد", status: "قيد المعالجة", date: "2026-07-09", handlers: ["فهد العنزي", "احمد الاغبري"] },
  { id: "2026-109", title: "اعتماد ميزانية التسويق Q3",          type: "مالية",         direction: "صادر", status: "قيد المعالجة", date: "2026-07-08", handlers: ["جهاد غانم", "احمد الاغبري"] },
  { id: "2026-110", title: "طلب إجازة اضطرارية - سعد الحربي",    type: "إجازة اضطرارية", direction: "وارد", status: "منتهية",       date: "2026-07-06", handlers: ["فاتن الراعي", "أحمد الحربي"] },
];
