import { useState } from "react";
import {
  User, Calendar, Briefcase, FileText,
  Award, Clock, Shield, AlertTriangle, TrendingUp, Package,
  Camera, CheckCircle, XCircle, Building2,
  Download, Eye, Banknote, Receipt, Star, ArrowLeft
} from "lucide-react";
import { cn } from "../lib/utils";
import { ds, brand, pctColor } from "../lib/design-system";
import StatCard from "./ds/StatCard";

type EmpTab =
  | "overview"
  | "data"
  | "financial"
  | "leaves"
  | "docs"
  | "assets"
  | "violations";

interface EmployeeProfilePageProps {
  onBack: () => void;
}

const TABS: [EmpTab, string][] = [
  ["overview",  "نظرة عامة"],
  ["data",      "البيانات"],
  ["financial", "التفاصيل المالية"],
  ["leaves",    "الإجازات"],
  ["docs",      "المستندات"],
  ["assets",    "العُهد"],
  ["violations","المخالفات"],
];

const emp = {
  name:        "احمد الاغبري",
  initials:    "مع",
  title:       "مدير المبيعات",
  id:          "2473392",
  status:      "نشط",
  reportsTo:   "جهاد غانم",
  location:    "الرياض بارك",
  workType:    "دوام كامل",
  department:  "قسم المبيعات",
  joinDate:    "2021-03-15",
  phone:       "+966 50 123 4567",
  email:       "m.alabdallah@deraah.com",
  nationality: "سعودي",
  dob:         "1988-06-20",
  iqama:       "",
  contract:    "غير محدد المدة",
  education:   "بكالوريوس إدارة أعمال",
  bank:        "مصرف الراجحي",
  iban:        "SA03 8000 0000 6080 1016 7519",
};

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className={cn(ds.cardLg, "p-4 sm:p-5 space-y-3")}>
      {title && <h3 className={cn("text-sm font-bold", ds.textHeading, "mb-1")}>{title}</h3>}
      {children}
    </div>
  );
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-700 last:border-0">
      <span className={cn("text-xs font-medium", ds.textMuted)}>{label}</span>
      <span className={cn("text-xs font-semibold", accent || ds.textPrimary)}>{value}</span>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: "green" | "blue" | "amber" | "red" | "neutral" }) {
  const colors = {
    green:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    blue:    "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
    amber:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    red:     "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    neutral: "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300",
  };
  return (
    <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full", colors[color])}>{label}</span>
  );
}

// ── Overview Tab ─────────────────────────────────────────────
function TabOverview() {
  const activities = [
    { icon: CheckCircle, text: "أنجز مهمة: جرد مخزون الفرع الرئيسي", date: "منذ يومين", color: "text-emerald-500" },
    { icon: Clock,       text: "حضر في الساعة 08:12 صباحاً",          date: "اليوم",     color: "text-sky-500" },
    { icon: FileText,    text: "أرسل معاملة: طلب إجازة سنوية",        date: "منذ 3 أيام", color: "text-indigo-500" },
    { icon: Star,        text: "حصل على تقييم أداء: ممتاز",           date: "هذا الشهر",  color: "text-amber-500" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="معدل الحضور"    value="97%"   icon={Clock}       progress={97}  color={brand.success} />
        <StatCard title="المهام المنجزة" value="24"    icon={CheckCircle} progress={80}  color={brand.primary} />
        <StatCard title="تقييم الأداء"   value="92%"   icon={TrendingUp}  progress={92}  color={pctColor(92)} />
        <StatCard title="رصيد الإجازة"   value="18 يوم" icon={Calendar}   animate={false} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Section title="ملخص الشهر الحالي">
          <InfoRow label="أيام الحضور"    value="21 من 22" />
          <InfoRow label="أيام الغياب"    value="0" />
          <InfoRow label="دقائق التأخير"  value="12 دقيقة" />
          <InfoRow label="ساعات إضافية"   value="4.5 ساعة" accent="text-emerald-600 dark:text-emerald-400" />
          <InfoRow label="المهام الجارية" value="3 مهام" />
          <InfoRow label="المعاملات المعلقة" value="1 معاملة" />
        </Section>

        <Section title="النشاط الأخير">
          <div className="space-y-2.5">
            {activities.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={cn(ds.iconBox, "w-7 h-7 shrink-0")}>
                  <a.icon className={cn("w-3.5 h-3.5", a.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-xs font-medium leading-tight", ds.textPrimary)}>{a.text}</p>
                  <p className={cn("text-[10px] mt-0.5", ds.textMuted)}>{a.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

// ── Data Tab ─────────────────────────────────────────────────
function TabData() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Section title="المعلومات الشخصية">
        <InfoRow label="الاسم الكامل"     value={emp.name} />
        <InfoRow label="تاريخ الميلاد"    value="20 يونيو 1988" />
        <InfoRow label="الجنسية"          value={emp.nationality} />
        <InfoRow label="الحالة الاجتماعية" value="متزوج" />
        <InfoRow label="المؤهل التعليمي"  value={emp.education} />
      </Section>
      <Section title="معلومات الاتصال">
        <InfoRow label="رقم الجوال"    value={emp.phone} />
        <InfoRow label="البريد الإلكتروني" value={emp.email} />
        <InfoRow label="المدينة"       value="الرياض" />
        <InfoRow label="الحي"          value="المحمدية" />
      </Section>
      <Section title="معلومات الوظيفة">
        <InfoRow label="رقم الموظف"    value={emp.id} />
        <InfoRow label="المسمى الوظيفي" value={emp.title} />
        <InfoRow label="القسم"          value={emp.department} />
        <InfoRow label="المعرض"         value={emp.location} />
        <InfoRow label="يتبع إلى"       value={emp.reportsTo} />
        <InfoRow label="نوع الدوام"     value={emp.workType} />
        <InfoRow label="نوع العقد"      value={emp.contract} />
        <InfoRow label="تاريخ التعيين"  value="15 مارس 2021" />
      </Section>
      <Section title="بيانات الراتب البنكية">
        <InfoRow label="البنك"  value={emp.bank} />
        <InfoRow label="رقم الآيبان" value={emp.iban} />
      </Section>
    </div>
  );
}

// ── Financial Tab ─────────────────────────────────────────────
function TabFinancial() {
  const salary = [
    { label: "الراتب الأساسي",    value: "12,000" },
    { label: "بدل السكن",         value: "4,800" },
    { label: "بدل المواصلات",     value: "1,000" },
    { label: "بدل التميز",        value: "600" },
  ];
  const deductions = [
    { label: "تأمينات اجتماعية",  value: "1,056" },
    { label: "ضريبة الدخل",       value: "0" },
    { label: "خصم تأخير",         value: "0" },
  ];
  const history = [
    { month: "مارس 2026", gross: "18,400", net: "17,344", status: "مُحوَّل" },
    { month: "فبراير 2026", gross: "18,400", net: "17,344", status: "مُحوَّل" },
    { month: "يناير 2026", gross: "18,400", net: "17,344", status: "مُحوَّل" },
    { month: "ديسمبر 2025", gross: "19,200", net: "18,144", status: "مُحوَّل" },
  ];
  const gross = 18400;
  const net = 17344;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard title="الراتب الإجمالي" value="18,400 ر.س" icon={Banknote}  animate={false} />
        <StatCard title="صافي الراتب"     value="17,344 ر.س" icon={Receipt}   animate={false} />
        <StatCard title="نسبة الخصومات"   value={`${(((gross - net) / gross) * 100).toFixed(1)}%`} icon={TrendingUp} animate={false} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Section title="مكوّنات الراتب">
          {salary.map(r => (
            <InfoRow key={r.label} label={r.label} value={`${r.value} ر.س`} />
          ))}
          <div className="flex items-center justify-between pt-2 mt-1 border-t border-neutral-200 dark:border-neutral-600">
            <span className={cn("text-xs font-bold", ds.textHeading)}>الإجمالي</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">18,400 ر.س</span>
          </div>
        </Section>
        <Section title="الاستقطاعات">
          {deductions.map(r => (
            <InfoRow key={r.label} label={r.label} value={`${r.value} ر.س`} accent={r.value !== "0" ? "text-rose-600 dark:text-rose-400" : undefined} />
          ))}
          <div className="flex items-center justify-between pt-2 mt-1 border-t border-neutral-200 dark:border-neutral-600">
            <span className={cn("text-xs font-bold", ds.textHeading)}>إجمالي الاستقطاعات</span>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 tabular-nums">1,056 ر.س</span>
          </div>
        </Section>
      </div>

      <Section title="سجل الرواتب">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={ds.tableHead}>
                {["الشهر", "الإجمالي", "صافي الراتب", "الحالة", ""].map(h => (
                  <th key={h} className={cn(ds.tableHeadCell, "text-xs")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map(r => (
                <tr key={r.month} className={ds.tableRow}>
                  <td className="px-3 py-2.5 text-xs font-medium text-neutral-700 dark:text-neutral-200">{r.month}</td>
                  <td className="px-3 py-2.5 text-xs tabular-nums text-neutral-700 dark:text-neutral-200">{r.gross} ر.س</td>
                  <td className="px-3 py-2.5 text-xs tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">{r.net} ر.س</td>
                  <td className="px-3 py-2.5"><Badge label={r.status} color="green" /></td>
                  <td className="px-3 py-2.5">
                    <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 transition-colors" title="تحميل">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

// ── Attendance Tab ─────────────────────────────────────────────
function TabAttendance() {
  const rows = [
    { day: "الأحد",    date: "01/06", in: "08:05", out: "17:02", status: "حاضر",   delay: 0 },
    { day: "الإثنين",  date: "02/06", in: "08:21", out: "17:00", status: "حاضر",   delay: 21 },
    { day: "الثلاثاء", date: "03/06", in: "08:00", out: "17:00", status: "حاضر",   delay: 0 },
    { day: "الأربعاء", date: "04/06", in: "—",     out: "—",     status: "إجازة",  delay: 0 },
    { day: "الخميس",   date: "05/06", in: "08:10", out: "17:05", status: "حاضر",   delay: 10 },
    { day: "الأحد",    date: "08/06", in: "07:58", out: "17:15", status: "حاضر",   delay: 0 },
    { day: "الإثنين",  date: "09/06", in: "08:45", out: "17:00", status: "حاضر",   delay: 45 },
    { day: "الثلاثاء", date: "10/06", in: "08:02", out: "17:00", status: "حاضر",   delay: 2 },
    { day: "الأربعاء", date: "11/06", in: "—",     out: "—",     status: "غياب",   delay: 0 },
    { day: "الخميس",   date: "12/06", in: "08:00", out: "17:00", status: "حاضر",   delay: 0 },
  ];
  const statusColor = (s: string) => {
    if (s === "حاضر")  return "text-emerald-600 dark:text-emerald-400";
    if (s === "غياب")  return "text-rose-600 dark:text-rose-400";
    if (s === "إجازة") return "text-sky-600 dark:text-sky-400";
    return ds.textMuted;
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="أيام الحضور"  value="21"     icon={CheckCircle} color={brand.success} />
        <StatCard title="أيام الغياب"  value="1"      icon={XCircle}     color={brand.danger} />
        <StatCard title="أيام الإجازة" value="1"      icon={Calendar}    color={brand.info} />
        <StatCard title="دقائق تأخير"  value="78 دق" icon={Clock}       animate={false} />
      </div>
      <Section title="سجل الحضور — يونيو 2026">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={ds.tableHead}>
                {["اليوم", "التاريخ", "وقت الحضور", "وقت الانصراف", "الحالة", "التأخير"].map(h => (
                  <th key={h} className={cn(ds.tableHeadCell, "text-xs")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={ds.tableRow}>
                  <td className="px-3 py-2.5 text-xs font-medium text-neutral-700 dark:text-neutral-200">{r.day}</td>
                  <td className="px-3 py-2.5 text-xs tabular-nums text-neutral-500 dark:text-neutral-400">{r.date}</td>
                  <td className="px-3 py-2.5 text-xs tabular-nums">{r.in}</td>
                  <td className="px-3 py-2.5 text-xs tabular-nums">{r.out}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn("text-xs font-semibold", statusColor(r.status))}>{r.status}</span>
                  </td>
                  <td className="px-3 py-2.5 text-xs tabular-nums">
                    {r.delay > 0
                      ? <span className="text-amber-600 dark:text-amber-400 font-semibold">{r.delay} دق</span>
                      : <span className="text-neutral-300 dark:text-neutral-600">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

// ── Leaves Tab ─────────────────────────────────────────────────
export const MY_LEAVE_BALANCES = [
  { type: "إجازة سنوية",  total: 30, used: 12 },
  { type: "إجازة مرضية",  total: 30, used: 2 },
  { type: "إجازة طارئة",  total: 5,  used: 1 },
];

export const MY_LEAVE_HISTORY = [
  { type: "سنوية",    from: "10/04/2026", to: "14/04/2026", days: 5, status: "مُعتمدة" },
  { type: "مرضية",    from: "02/02/2026", to: "03/02/2026", days: 2, status: "مُعتمدة" },
  { type: "طارئة",    from: "18/01/2026", to: "18/01/2026", days: 1, status: "مُعتمدة" },
  { type: "سنوية",    from: "22/12/2025", to: "28/12/2025", days: 7, status: "مُعتمدة" },
];

function TabLeaves() {
  const history = MY_LEAVE_HISTORY;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="رصيد سنوية"    value="18 يوم"  icon={Calendar}    animate={false} />
        <StatCard title="رصيد مرضية"    value="14 يوم"  icon={Shield}      animate={false} />
        <StatCard title="إجازات مستخدمة" value="15 يوم" icon={CheckCircle} color={brand.warning} />
        <StatCard title="طلبات معلقة"   value="0"       icon={Clock}       color={brand.success} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {MY_LEAVE_BALANCES.map((b, i) => ({ ...b, color: [brand.primary, brand.info, brand.warning][i] })).map(l => (
          <div key={l.type} className={cn(ds.card, "p-4 space-y-2")}>
            <p className={cn("text-xs font-semibold", ds.textPrimary)}>{l.type}</p>
            <div className="flex items-end justify-between">
              <span className={cn("text-xl font-bold tabular-nums", ds.textValue)}>{l.total - l.used}</span>
              <span className={cn("text-xs", ds.textMuted)}>من {l.total} يوم</span>
            </div>
            <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-700 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${(l.used / l.total) * 100}%`, backgroundColor: l.color }} />
            </div>
            <p className={cn("text-[10px]", ds.textMuted)}>مُستخدم: {l.used} يوم</p>
          </div>
        ))}
      </div>

      <Section title="سجل الإجازات">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={ds.tableHead}>
                {["نوع الإجازة", "من", "إلى", "الأيام", "الحالة"].map(h => (
                  <th key={h} className={cn(ds.tableHeadCell, "text-xs")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((r, i) => (
                <tr key={i} className={ds.tableRow}>
                  <td className="px-3 py-2.5 text-xs font-medium text-neutral-700 dark:text-neutral-200">{r.type}</td>
                  <td className="px-3 py-2.5 text-xs tabular-nums text-neutral-500 dark:text-neutral-400">{r.from}</td>
                  <td className="px-3 py-2.5 text-xs tabular-nums text-neutral-500 dark:text-neutral-400">{r.to}</td>
                  <td className="px-3 py-2.5 text-xs tabular-nums font-semibold text-neutral-700 dark:text-neutral-200">{r.days}</td>
                  <td className="px-3 py-2.5"><Badge label={r.status} color="green" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

// ── Performance Tab ────────────────────────────────────────────
function TabPerformance() {
  const kpis = [
    { label: "تحقيق الأهداف",        score: 95, max: 100 },
    { label: "جودة العمل",           score: 90, max: 100 },
    { label: "الالتزام والحضور",      score: 97, max: 100 },
    { label: "روح الفريق",           score: 88, max: 100 },
    { label: "المبادرة والإبداع",     score: 82, max: 100 },
    { label: "التواصل مع العملاء",    score: 93, max: 100 },
  ];
  const evals = [
    { period: "الربع الأول 2026",   score: 92, grade: "ممتاز",   evaluator: "احمد الاغبري" },
    { period: "الربع الرابع 2025",  score: 88, grade: "جيد جداً", evaluator: "احمد الاغبري" },
    { period: "الربع الثالث 2025",  score: 85, grade: "جيد جداً", evaluator: "أحمد الحربي" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="متوسط التقييم"   value="92%"   icon={Award}      progress={92}  color={pctColor(92)} />
        <StatCard title="أهداف مُحققة"    value="19/20" icon={TrendingUp}  animate={false} />
        <StatCard title="تقييم المبادرة"  value="82%"   icon={Star}       progress={82}  color={brand.warning} />
        <StatCard title="تقييم الالتزام"  value="97%"   icon={Shield}     progress={97}  color={brand.success} />
      </div>

      <Section title="مؤشرات الأداء الفردية">
        <div className="space-y-3">
          {kpis.map(k => (
            <div key={k.label} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className={cn("text-xs font-medium", ds.textPrimary)}>{k.label}</span>
                <span className={cn("text-xs font-bold tabular-nums")} style={{ color: pctColor(k.score) }}>{k.score}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-700 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${k.score}%`, backgroundColor: pctColor(k.score) }} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="سجل التقييمات">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={ds.tableHead}>
                {["الفترة", "الدرجة", "التقدير", "المُقيِّم"].map(h => (
                  <th key={h} className={cn(ds.tableHeadCell, "text-xs")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {evals.map((e, i) => (
                <tr key={i} className={ds.tableRow}>
                  <td className="px-3 py-2.5 text-xs font-medium text-neutral-700 dark:text-neutral-200">{e.period}</td>
                  <td className="px-3 py-2.5 text-xs font-bold tabular-nums" style={{ color: pctColor(e.score) }}>{e.score}%</td>
                  <td className="px-3 py-2.5">
                    <Badge label={e.grade} color={e.score >= 90 ? "green" : e.score >= 80 ? "blue" : "amber"} />
                  </td>
                  <td className="px-3 py-2.5 text-xs text-neutral-500 dark:text-neutral-400">{e.evaluator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

// ── Documents Tab ─────────────────────────────────────────────
function TabDocs() {
  const docs = [
    { name: "عقد العمل",              date: "15/03/2021", type: "PDF", status: "ساري" },
    { name: "شهادة الخبرة السابقة",   date: "10/03/2021", type: "PDF", status: "ساري" },
    { name: "الهوية الوطنية",         date: "01/01/2024", type: "IMG", status: "ساري" },
    { name: "السجل التجاري",          date: "01/01/2025", type: "PDF", status: "ساري" },
    { name: "شهادة التدريب على المبيعات", date: "20/05/2023", type: "PDF", status: "ساري" },
    { name: "تقرير الأداء السنوي 2025",  date: "05/01/2026", type: "PDF", status: "ساري" },
  ];
  return (
    <Section title="المستندات والوثائق">
      <div className="space-y-2">
        {docs.map((d, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700/40 transition-colors">
            <div className={cn(ds.iconBox, "w-9 h-9 shrink-0")}>
              <FileText className={cn("w-4 h-4", ds.iconBoxIcon)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-xs font-semibold", ds.textPrimary)}>{d.name}</p>
              <p className={cn("text-[10px]", ds.textMuted)}>{d.date} · {d.type}</p>
            </div>
            <Badge label={d.status} color="green" />
            <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 transition-colors">
              <Download className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 transition-colors">
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── Assets Tab ─────────────────────────────────────────────────
function TabAssets() {
  const assets = [
    { name: "لابتوب Dell XPS 15",         serial: "DL-2023-0412", date: "01/04/2023", status: "جيد" },
    { name: "جوال آيفون 14 Pro",           serial: "IP-2023-0888", date: "15/05/2023", status: "جيد" },
    { name: "سيارة تويوتا كامري",          serial: "1ABC234",      date: "01/01/2024", status: "جيد" },
    { name: "بطاقة SIM الشركة",           serial: "SIM-05511",    date: "15/03/2021", status: "نشطة" },
  ];
  return (
    <Section title="العُهد والأصول الموكلة">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={ds.tableHead}>
              {["الأصل", "الرقم التسلسلي", "تاريخ الاستلام", "الحالة"].map(h => (
                <th key={h} className={cn(ds.tableHeadCell, "text-xs")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assets.map((a, i) => (
              <tr key={i} className={ds.tableRow}>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(ds.iconBox, "w-7 h-7 shrink-0")}>
                      <Package className={cn("w-3.5 h-3.5", ds.iconBoxIcon)} />
                    </div>
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">{a.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-xs tabular-nums text-neutral-500 dark:text-neutral-400">{a.serial}</td>
                <td className="px-3 py-2.5 text-xs tabular-nums text-neutral-500 dark:text-neutral-400">{a.date}</td>
                <td className="px-3 py-2.5"><Badge label={a.status} color="green" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

// ── Violations Tab ─────────────────────────────────────────────
function TabViolations() {
  const violations = [
    { type: "تأخر عن الدوام", date: "09/06/2026", severity: "خفيفة", penalty: "تنبيه كتابي", status: "مُغلقة" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard title="إجمالي المخالفات" value="1"  icon={AlertTriangle} color={brand.warning} />
        <StatCard title="مخالفات مفتوحة"   value="0"  icon={XCircle}       color={brand.success} />
        <StatCard title="مخالفات مُغلقة"   value="1"  icon={CheckCircle}   color={brand.primary} />
      </div>

      {violations.length === 0 ? (
        <Section>
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
            <p className={cn("text-sm font-semibold", ds.textPrimary)}>لا توجد مخالفات مسجّلة</p>
            <p className={cn("text-xs", ds.textMuted)}>سجل الموظف نظيف تماماً</p>
          </div>
        </Section>
      ) : (
        <Section title="سجل المخالفات">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={ds.tableHead}>
                  {["نوع المخالفة", "التاريخ", "الدرجة", "الإجراء", "الحالة"].map(h => (
                    <th key={h} className={cn(ds.tableHeadCell, "text-xs")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {violations.map((v, i) => (
                  <tr key={i} className={ds.tableRow}>
                    <td className="px-3 py-2.5 text-xs font-medium text-neutral-700 dark:text-neutral-200">{v.type}</td>
                    <td className="px-3 py-2.5 text-xs tabular-nums text-neutral-500 dark:text-neutral-400">{v.date}</td>
                    <td className="px-3 py-2.5">
                      <Badge label={v.severity} color={v.severity === "خطيرة" ? "red" : v.severity === "متوسطة" ? "amber" : "neutral"} />
                    </td>
                    <td className="px-3 py-2.5 text-xs text-neutral-600 dark:text-neutral-400">{v.penalty}</td>
                    <td className="px-3 py-2.5"><Badge label={v.status} color="green" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function EmployeeProfilePage({ onBack }: EmployeeProfilePageProps) {
  const [activeTab, setActiveTab] = useState<EmpTab>("overview");

  const tabContent: Record<EmpTab, React.ReactNode> = {
    overview:   <TabOverview />,
    data:       <TabData />,
    financial:  <TabFinancial />,
    leaves:     <TabLeaves />,
    docs:       <TabDocs />,
    assets:     <TabAssets />,
    violations: <TabViolations />,
  };

  return (
    <div dir="rtl" className={cn(ds.page)}>

      {/* ── Employee Header Card ── */}
      <div className={cn(ds.glass, "sticky top-0 z-40")}>
        <div className="max-w-[var(--page-max-w)] mx-auto px-3 sm:px-4 py-4">
          {/* Back button + name row */}
          <div className="flex items-start gap-4">
            <button
              onClick={onBack}
              className={cn(ds.btnIcon, "w-9 h-9 mt-1 shrink-0")}
              title="رجوع"
            >
              <ArrowLeft className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
            </button>

            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center shadow-md">
                <span className="text-lg font-bold text-white dark:text-neutral-900 tracking-tight select-none">
                  {emp.initials}
                </span>
              </div>
              <button
                className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 shadow-sm flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors"
                title="تغيير الصورة"
              >
                <Camera className="w-2.5 h-2.5 text-neutral-500 dark:text-neutral-400" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className={cn("text-base sm:text-lg font-bold", ds.textHeading)}>{emp.name}</h1>
                <Badge label={emp.status} color="green" />
              </div>
              <p className={cn("text-xs mt-0.5", ds.textMuted)}>{emp.title}</p>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                  <Briefcase className="w-3 h-3" /> {emp.department}
                </span>
                <span className="text-neutral-300 dark:text-neutral-600">·</span>
                <span className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                  <Building2 className="w-3 h-3" /> {emp.location}
                </span>
                <span className="text-neutral-300 dark:text-neutral-600">·</span>
                <span className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                  <User className="w-3 h-3" /> يتبع: {emp.reportsTo}
                </span>
                <span className="text-neutral-300 dark:text-neutral-600">·</span>
                <span className={cn("text-[11px]", ds.textMuted)}>{emp.id}</span>
                <span className="text-neutral-300 dark:text-neutral-600">·</span>
                <span className={cn("text-[11px]", ds.textMuted)}>{emp.workType}</span>
              </div>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="mt-4 overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-1 min-w-max">
              {TABS.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150",
                    activeTab === key
                      ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm"
                      : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="max-w-[var(--page-max-w)] mx-auto px-3 sm:px-4 py-4">
        {tabContent[activeTab]}
      </div>
    </div>
  );
}
