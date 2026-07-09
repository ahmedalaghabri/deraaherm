import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Printer, CalendarDays, Clock, Building2, User as User2, TrendingUp, AlertTriangle, CheckCircle2, Search, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import StatCard from "./ds/StatCard";
import { useAI } from "./ai/AIContext";

type DayStatus = "complete" | "late" | "absent" | "partial";

type AttendanceRow = {
  id: string;
  weekday: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  totalHours: number;
  workingHours: number;
  delayHours: number;
  overtimeHours: number;
  notes?: string;
  auditRate?: number;
};

const demoEmployee = {
  employeeId: "000045655",
  name: "أحمد عبدالقادر أحمد محي الدين",
  department: "الإدارة وإدارة تقنية المعلومات",
  from: "21/08/2025",
  to: "20/09/2025",
};

const demoData: AttendanceRow[] = [
  { id: "1", weekday: "الخميس", date: "21/08/2025", checkIn: "09:59:00", checkOut: "18:08:00", totalHours: 8.15, workingHours: 7.02, delayHours: 0, overtimeHours: 0, notes: "—" },
  { id: "2", weekday: "الجمعة", date: "22/08/2025", totalHours: 0, workingHours: 0, delayHours: 0, overtimeHours: 0, notes: "عطلة" },
  { id: "3", weekday: "السبت", date: "23/08/2025", totalHours: 0, workingHours: 0, delayHours: 0, overtimeHours: 0, notes: "إجازة" },
  { id: "4", weekday: "الأحد", date: "24/08/2025", checkIn: "11:29:00", checkOut: "17:51:00", totalHours: 6.37, workingHours: 5.37, delayHours: 1.63, overtimeHours: 0, notes: "تأخير" },
  { id: "5", weekday: "الإثنين", date: "25/08/2025", checkIn: "10:40:00", checkOut: "17:40:00", totalHours: 6.60, workingHours: 6.55, delayHours: 1.40, overtimeHours: 0, notes: "تأخير" },
  { id: "6", weekday: "الثلاثاء", date: "26/08/2025", checkIn: "08:48:00", checkOut: "16:52:00", totalHours: 7.70, workingHours: 7.05, delayHours: 0.30, overtimeHours: 0.65 },
  { id: "7", weekday: "الأربعاء", date: "27/08/2025", checkIn: "09:43:00", checkOut: "16:42:00", totalHours: 6.98, workingHours: 5.98, delayHours: 1.02, overtimeHours: 0, notes: "تأخير" },
  { id: "8", weekday: "الخميس", date: "28/08/2025", checkIn: "10:45:00", checkOut: "16:57:00", totalHours: 5.97, workingHours: 5.97, delayHours: 1.03, overtimeHours: 0, notes: "نصف دوام" },
  { id: "9", weekday: "الأحد", date: "31/08/2025", checkIn: "09:30:00", checkOut: "13:00:00", totalHours: 3.50, workingHours: 3.50, delayHours: 0, overtimeHours: 0, notes: "انصراف مبكر" },
  { id: "10", weekday: "الإثنين", date: "01/09/2025", checkIn: "09:56:00", checkOut: "16:30:00", totalHours: 6.93, workingHours: 5.94, delayHours: 1.07, overtimeHours: 0, notes: "تأخير" },
  { id: "11", weekday: "الثلاثاء", date: "02/09/2025", checkIn: "10:36:00", checkOut: "16:52:00", totalHours: 6.77, workingHours: 6.77, delayHours: 0.23, overtimeHours: 0, notes: "تأخير بسيط" },
  { id: "12", weekday: "الأربعاء", date: "03/09/2025", checkIn: "12:13:00", checkOut: "18:12:00", totalHours: 5.98, workingHours: 5.98, delayHours: 3.22, overtimeHours: 0 },
  { id: "13", weekday: "الخميس", date: "04/09/2025", checkIn: "10:30:00", checkOut: "18:17:00", totalHours: 7.78, workingHours: 6.50, delayHours: 1.50, overtimeHours: 1.00, notes: "تأخير + ساعة إضافية" },
  { id: "14", weekday: "الجمعة", date: "05/09/2025", totalHours: 0, workingHours: 0, delayHours: 0, overtimeHours: 0, notes: "عطلة" },
  { id: "15", weekday: "السبت", date: "06/09/2025", totalHours: 0, workingHours: 0, delayHours: 0, overtimeHours: 0, notes: "عطلة" },
  { id: "16", weekday: "الأحد", date: "07/09/2025", checkIn: "10:03:00", checkOut: "17:24:00", totalHours: 7.35, workingHours: 6.35, delayHours: 0.65, overtimeHours: 1.00 },
  { id: "17", weekday: "الإثنين", date: "08/09/2025", checkIn: "10:27:00", checkOut: "17:55:00", totalHours: 7.55, workingHours: 6.55, delayHours: 0.45, overtimeHours: 1.00 },
  { id: "18", weekday: "الثلاثاء", date: "09/09/2025", checkIn: "10:18:00", checkOut: "17:40:00", totalHours: 7.30, workingHours: 6.70, delayHours: 0.30, overtimeHours: 1.00 },
  { id: "19", weekday: "الأربعاء", date: "10/09/2025", checkIn: "10:40:00", checkOut: "17:16:00", totalHours: 6.70, workingHours: 6.03, delayHours: 1.30, overtimeHours: 1.00 },
  { id: "20", weekday: "الخميس", date: "11/09/2025", checkIn: "10:58:00", checkOut: "17:15:00", totalHours: 7.03, workingHours: 6.03, delayHours: 1.97, overtimeHours: 0 },
  { id: "21", weekday: "الجمعة", date: "12/09/2025", totalHours: 0, workingHours: 0, delayHours: 0, overtimeHours: 0, notes: "عطلة" },
  { id: "22", weekday: "السبت", date: "13/09/2025", totalHours: 0, workingHours: 0, delayHours: 0, overtimeHours: 0, notes: "عطلة" },
  { id: "23", weekday: "الأحد", date: "14/09/2025", checkIn: "10:08:00", checkOut: "16:55:00", totalHours: 6.78, workingHours: 5.79, delayHours: 1.22, overtimeHours: 0.99 },
  { id: "24", weekday: "الإثنين", date: "15/09/2025", checkIn: "11:01:00", checkOut: "17:15:00", totalHours: 6.23, workingHours: 5.52, delayHours: 1.00, overtimeHours: 0 },
  { id: "25", weekday: "الثلاثاء", date: "16/09/2025", checkIn: "10:29:00", checkOut: "16:55:00", totalHours: 6.77, workingHours: 6.77, delayHours: 0.23, overtimeHours: 0 },
  { id: "26", weekday: "الأربعاء", date: "17/09/2025", checkIn: "10:30:00", checkOut: "17:00:00", totalHours: 6.50, workingHours: 5.85, delayHours: 1.15, overtimeHours: 0 },
  { id: "27", weekday: "الخميس", date: "18/09/2025", checkIn: "10:29:00", checkOut: "17:20:00", totalHours: 6.85, workingHours: 5.85, delayHours: 1.15, overtimeHours: 0 },
  { id: "28", weekday: "الجمعة", date: "19/09/2025", totalHours: 0, workingHours: 0, delayHours: 0, overtimeHours: 0, notes: "عطلة" },
  { id: "29", weekday: "السبت", date: "20/09/2025", totalHours: 0, workingHours: 0, delayHours: 0, overtimeHours: 0, notes: "عطلة" },
];

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function getAuditRate(id: string): number | undefined {
  // Only assign audit rates to working days (not holidays/leaves)
  const seed = parseInt(id, 10);
  const rate = 30 + Math.round(seededRandom(seed) * 70);
  return rate;
}

function formatHours(n: number) {
  return n.toFixed(2);
}

function statusOf(row: AttendanceRow): DayStatus {
  if (row.totalHours === 0) return "absent";
  if (row.delayHours >= 1.0) return "late";
  if (row.totalHours < 6.5) return "partial";
  return "complete";
}

function statusBadge(status: DayStatus) {
  switch (status) {
    case "complete":
      return (
        <Badge className="rounded-full" variant="secondary">
          <CheckCircle2 className="me-1 h-4 w-4" /> يوم مكتمل
        </Badge>
      );
    case "late":
      return (
        <Badge className="rounded-full bg-amber-100 text-amber-900 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/30">
          <AlertTriangle className="me-1 h-4 w-4" /> تأخير
        </Badge>
      );
    case "absent":
      return (
        <Badge className="rounded-full bg-rose-100 text-rose-900 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/30">
          غياب / عطلة
        </Badge>
      );
    case "partial":
      return (
        <Badge className="rounded-full bg-blue-100 text-blue-900 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/30">
          دوام جزئي
        </Badge>
      );
  }
}

function exportToCSV(rows: AttendanceRow[], filename = "attendance.csv") {
  const headers = [
    "اليوم",
    "التاريخ",
    "الدخول",
    "الخروج",
    "عدد الساعات",
    "ساعات العمل",
    "التأخير",
    "الإضافي",
    "الحالة",
    "ملاحظات",
  ];
  const lines = rows.map((r) => [
    r.weekday,
    r.date,
    r.checkIn ?? "—",
    r.checkOut ?? "—",
    formatHours(r.totalHours),
    formatHours(r.workingHours),
    formatHours(r.delayHours),
    formatHours(r.overtimeHours),
    statusOf(r),
    r.notes ?? "",
  ]);
  const csv = [headers, ...lines].map((arr) => arr.join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <div className="mt-1 rounded-2xl border dark:border-neutral-700 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:bg-neutral-800/60 dark:supports-[backdrop-filter]:bg-neutral-800/50 dark:text-neutral-200 px-3 py-2 text-sm shadow-sm">{value}</div>
    </div>
  );
}

function AlertCard({ title, description, tone = "info" }: { title: string; description: string; tone?: "info" | "warn" | "ok" }) {
  const toneClasses = {
    info: "from-sky-50 to-white text-sky-900 border-sky-100 dark:from-sky-900/20 dark:to-neutral-800 dark:text-sky-300 dark:border-neutral-700",
    warn: "from-amber-50 to-white text-amber-900 border-amber-100 dark:from-amber-900/20 dark:to-neutral-800 dark:text-amber-300 dark:border-neutral-700",
    ok: "from-emerald-50 to-white text-emerald-900 border-emerald-100 dark:from-emerald-900/20 dark:to-neutral-800 dark:text-emerald-300 dark:border-neutral-700",
  } as const;
  return (
    <div className={cn("rounded-2xl border bg-gradient-to-b p-4 shadow-sm", toneClasses[tone])}>
      <div className="flex items-start gap-2">
        {tone === "warn" ? (
          <AlertTriangle className="h-4 w-4" />
        ) : tone === "ok" ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Info className="h-4 w-4" />
        )}
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm/6 opacity-90">{description}</div>
        </div>
      </div>
    </div>
  );
}

function AuditRateBadge({ rate }: { rate: number }) {
  const color =
    rate >= 80
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
      : rate >= 60
      ? "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300"
      : rate >= 45
      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums", color)}>
      {rate}%
    </span>
  );
}

export default function AttendanceDashboard() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const rows = useMemo(() => {
    return demoData.filter((r) => {
      const q = query.trim();
      const matchesQuery = q
        ? [r.weekday, r.date, r.checkIn ?? "", r.checkOut ?? "", r.notes ?? ""].some((x) => x.includes(q))
        : true;
      const s = statusOf(r);
      const matchesStatus = statusFilter === "all" ? true : s === (statusFilter as DayStatus);
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter]);

  const totals = useMemo(() => {
    const sum = (k: keyof AttendanceRow) => rows.reduce((acc, r) => acc + (Number(r[k]) || 0), 0);
    return {
      totalHours: sum("totalHours"),
      workingHours: sum("workingHours"),
      delayHours: sum("delayHours"),
      overtimeHours: sum("overtimeHours"),
      days: rows.length,
      absentDays: rows.filter((r) => statusOf(r) === "absent").length,
    };
  }, [rows]);

  const { setPageContext } = useAI();

  // Push attendance data to AI assistant
  useEffect(() => {
    const present = rows.filter((r) => statusOf(r) === "complete").length;
    const late = rows.filter((r) => statusOf(r) === "late").length;
    const absent = rows.filter((r) => statusOf(r) === "absent").length;
    const partial = rows.filter((r) => statusOf(r) === "partial").length;

    setPageContext({
      route: "attendance",
      title: "تقرير الحضور والانصراف",
      dataSummary: `الموظف: ${demoEmployee.name}\nالقسم: ${demoEmployee.department}\nالفترة: ${demoEmployee.from} - ${demoEmployee.to}\nأيام العمل: ${totals.days}\nالحضور الكامل: ${present}\nالتأخير: ${late}\nالغياب: ${absent}\nالدوام الجزئي: ${partial}\nإجمالي ساعات العمل: ${totals.workingHours.toFixed(1)}\nإجمالي ساعات التأخير: ${totals.delayHours.toFixed(1)}\nإجمالي ساعات إضافية: ${totals.overtimeHours.toFixed(1)}`,
    });
  }, [rows, totals]);

  return (
    <div dir="rtl" className="min-h-screen">
      <div className="mx-auto max-w-[1400px] p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="rounded-2xl border bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 shadow-sm">
              <CardHeader className="pb-3 px-4 sm:px-6">
                <CardTitle className="text-lg sm:text-xl dark:text-neutral-100">سجل الحضور والانصراف</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-5 px-4 sm:px-6">
                <div className="flex items-center gap-2 text-xs sm:text-sm dark:text-neutral-300"><User2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" /><span className="text-muted-foreground">الاسم:</span><span className="font-medium truncate dark:text-neutral-100">{demoEmployee.name}</span></div>
                <div className="flex items-center gap-2 text-xs sm:text-sm dark:text-neutral-300"><Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" /><span className="text-muted-foreground">القسم:</span><span className="font-medium truncate dark:text-neutral-100">{demoEmployee.department}</span></div>
                <div className="flex items-center gap-2 text-xs sm:text-sm"><Badge className="rounded-full bg-white/60 backdrop-blur border border-slate-200 text-slate-700 dark:bg-neutral-700/60 dark:border-neutral-600 dark:text-neutral-300 text-xs">الرقم الوظيفي: {demoEmployee.employeeId}</Badge></div>
                <div className="flex items-center gap-2 text-xs sm:text-sm dark:text-neutral-300"><CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" /><span className="text-muted-foreground">من:</span><span className="font-medium dark:text-neutral-100">{demoEmployee.from}</span></div>
                <div className="flex items-center gap-2 text-xs sm:text-sm dark:text-neutral-300"><CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" /><span className="text-muted-foreground">إلى:</span><span className="font-medium dark:text-neutral-100">{demoEmployee.to}</span></div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            <StatCard title="إجمالي ساعات الدوام" value={`${formatHours(totals.totalHours)} ساعة`} icon={Clock} />
            <StatCard title="ساعات العمل الفعلية" value={`${formatHours(totals.workingHours)} ساعة`} icon={TrendingUp} />
            <StatCard title="ساعات التأخير" value={`${formatHours(totals.delayHours)} ساعة`} icon={AlertTriangle} />
            <StatCard title="الساعات الإضافية" value={`${formatHours(totals.overtimeHours)} ساعة`} icon={CalendarDays} />
            <StatCard title="أيام الغياب" value={`${totals.absentDays} يوم`} icon={CalendarDays} />
          </motion.div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث بالتاريخ، اليوم، الملاحظة…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pr-9 pl-4 w-full sm:w-64 rounded-2xl text-sm dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-200"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44 rounded-2xl text-sm dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-200">
                <SelectValue placeholder="حالة اليوم" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="complete">يوم مكتمل</SelectItem>
                <SelectItem value="late">تأخير</SelectItem>
                <SelectItem value="partial">دوام جزئي</SelectItem>
                <SelectItem value="absent">غياب/عطلة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => window.print()} className="gap-2 rounded-2xl flex-1 sm:flex-initial text-sm">
              <Printer className="h-4 w-4" /> <span className="hidden sm:inline">طباعة</span>
            </Button>
            <Button onClick={() => exportToCSV(rows)} className="gap-2 rounded-2xl flex-1 sm:flex-initial text-sm">
              <Download className="h-4 w-4" /> <span className="hidden sm:inline">تصدير CSV</span>
            </Button>
          </div>
        </div>

        <Card className="rounded-2xl border dark:border-neutral-700 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-neutral-800/70 dark:supports-[backdrop-filter]:bg-neutral-800/60 shadow-sm">
          <CardContent className="p-0">
            {/* Desktop Table View */}
            <div className="hidden md:block w-full overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="sticky top-0 bg-gradient-to-b from-slate-50/70 to-white/80 dark:from-neutral-800 dark:to-neutral-800 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-neutral-800/80 dark:text-neutral-300">
                  <tr className="text-right">
                    <th className="px-4 py-3 font-medium text-right">اليوم</th>
                    <th className="px-4 py-3 font-medium text-right">التاريخ</th>
                    <th className="px-4 py-3 font-medium text-right">الدخول</th>
                    <th className="px-4 py-3 font-medium text-right">الخروج</th>
                    <th className="px-4 py-3 font-medium text-right">عدد الساعات</th>
                    <th className="px-4 py-3 font-medium text-right">ساعات العمل</th>
                    <th className="px-4 py-3 font-medium text-right">التأخير</th>
                    <th className="px-4 py-3 font-medium text-right">الإضافي</th>
                    <th className="px-4 py-3 font-medium text-right">نسبة التحقيق</th>
                    <th className="px-4 py-3 font-medium text-right">الحالة</th>
                    <th className="px-4 py-3 font-medium text-right">تفاصيل</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => {
                    const status = statusOf(r);
                    const isHoliday = !!(r.notes && (r.notes.includes("عطلة") || r.notes.includes("إجازة")));
                    const auditRate = isHoliday ? null : getAuditRate(r.id);
                    return (
                      <tr
                        key={r.id}
                        className={cn(
                          "border-t dark:border-neutral-700/60 dark:text-neutral-200",
                          isHoliday
                            ? "bg-gradient-to-r from-violet-50 to-white dark:from-violet-900/15 dark:to-neutral-800"
                            : idx % 2 === 0
                            ? "bg-background dark:bg-neutral-800"
                            : "bg-muted/10 dark:bg-neutral-700/20"
                        )}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">{r.weekday}</td>
                        <td className="px-4 py-3 whitespace-nowrap tabular-nums">{r.date}</td>
                        <td className="px-4 py-3 whitespace-nowrap tabular-nums">{r.checkIn ?? "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap tabular-nums">{r.checkOut ?? "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap tabular-nums">{formatHours(r.totalHours)}</td>
                        <td className="px-4 py-3 whitespace-nowrap tabular-nums">{formatHours(r.workingHours)}</td>
                        <td className="px-4 py-3 whitespace-nowrap tabular-nums">{formatHours(r.delayHours)}</td>
                        <td className="px-4 py-3 whitespace-nowrap tabular-nums">{formatHours(r.overtimeHours)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {auditRate !== null ? (
                            <AuditRateBadge rate={auditRate!} />
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isHoliday ? (
                            <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700">إجازة</Badge>
                          ) : (
                            statusBadge(status)
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button variant="outline" size="sm" className="rounded-xl dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700">عرض</Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full sm:max-w-xl dark:bg-neutral-800 dark:border-neutral-700">
                              <SheetHeader>
                                <SheetTitle className="dark:text-neutral-100">تفاصيل اليوم — {r.weekday} {r.date}</SheetTitle>
                                <SheetDescription>بيانات الحضور والانصراف لهذا اليوم.</SheetDescription>
                              </SheetHeader>
                              <div className="mt-6 grid grid-cols-2 gap-4">
                                <InfoBlock label="الدخول" value={r.checkIn ?? "—"} />
                                <InfoBlock label="الخروج" value={r.checkOut ?? "—"} />
                                <InfoBlock label="عدد الساعات" value={`${formatHours(r.totalHours)} ساعة`} />
                                <InfoBlock label="ساعات العمل" value={`${formatHours(r.workingHours)} ساعة`} />
                                <InfoBlock label="التأخير" value={`${formatHours(r.delayHours)} ساعة`} />
                                <InfoBlock label="الإضافي" value={`${formatHours(r.overtimeHours)} ساعة`} />
                                {auditRate !== null && (
                                  <div className="col-span-2">
                                    <Label className="text-sm text-muted-foreground">نسبة التحقيق</Label>
                                    <div className="mt-2 flex items-center gap-3">
                                      <AuditRateBadge rate={auditRate!} />
                                      <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-neutral-700 overflow-hidden">
                                        <div
                                          className={cn("h-full rounded-full transition-all", auditRate! >= 80 ? "bg-emerald-500" : auditRate! >= 60 ? "bg-sky-500" : auditRate! >= 45 ? "bg-amber-500" : "bg-rose-500")}
                                          style={{ width: `${auditRate}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <div className="col-span-2">
                                  <Label className="text-sm text-muted-foreground">الحالة</Label>
                                  <div className="mt-2">{isHoliday ? (<Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700">إجازة</Badge>) : statusBadge(status)}</div>
                                </div>
                                {r.notes && (
                                  <div className="col-span-2">
                                    <Label className="text-sm text-muted-foreground">ملاحظات</Label>
                                    <p className="mt-1 text-sm dark:text-neutral-200">{r.notes}</p>
                                  </div>
                                )}
                              </div>
                            </SheetContent>
                          </Sheet>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t dark:border-neutral-700 bg-gradient-to-r from-slate-50 to-white dark:from-neutral-800 dark:to-neutral-800 dark:text-neutral-200">
                    <td className="px-4 py-3 font-medium" colSpan={4}>الإجماليات</td>
                    <td className="px-4 py-3 tabular-nums font-semibold">{formatHours(totals.totalHours)}</td>
                    <td className="px-4 py-3 tabular-nums font-semibold">{formatHours(totals.workingHours)}</td>
                    <td className="px-4 py-3 tabular-nums font-semibold">{formatHours(totals.delayHours)}</td>
                    <td className="px-4 py-3 tabular-nums font-semibold">{formatHours(totals.overtimeHours)}</td>
                    <td className="px-4 py-3" colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-neutral-200 dark:divide-neutral-700">
              {rows.map((r) => {
                const status = statusOf(r);
                const isHoliday = !!(r.notes && (r.notes.includes("عطلة") || r.notes.includes("إجازة")));
                const auditRate = isHoliday ? null : getAuditRate(r.id);
                return (
                  <div key={r.id} className={cn("p-4", isHoliday && "bg-gradient-to-r from-slate-50 to-white dark:from-neutral-700/30 dark:to-neutral-800")}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-base mb-1 dark:text-neutral-100">{r.weekday}</div>
                        <div className="text-sm text-muted-foreground tabular-nums">{r.date}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {auditRate !== null && auditRate !== undefined && <AuditRateBadge rate={auditRate} />}
                        {isHoliday ? (
                          <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700 text-xs">إجازة</Badge>
                        ) : (
                          statusBadge(status)
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">الدخول</div>
                        <div className="font-medium tabular-nums dark:text-neutral-200">{r.checkIn ?? "—"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">الخروج</div>
                        <div className="font-medium tabular-nums dark:text-neutral-200">{r.checkOut ?? "—"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">عدد الساعات</div>
                        <div className="font-medium tabular-nums dark:text-neutral-200">{formatHours(r.totalHours)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">ساعات العمل</div>
                        <div className="font-medium tabular-nums dark:text-neutral-200">{formatHours(r.workingHours)}</div>
                      </div>
                    </div>

                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full rounded-xl text-xs dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700">
                          عرض التفاصيل الكاملة
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-full sm:max-w-xl dark:bg-neutral-800 dark:border-neutral-700">
                        <SheetHeader>
                          <SheetTitle className="dark:text-neutral-100">تفاصيل اليوم — {r.weekday} {r.date}</SheetTitle>
                          <SheetDescription>بيانات الحضور والانصراف لهذا اليوم.</SheetDescription>
                        </SheetHeader>
                        <div className="mt-6 grid grid-cols-2 gap-4">
                          <InfoBlock label="الدخول" value={r.checkIn ?? "—"} />
                          <InfoBlock label="الخروج" value={r.checkOut ?? "—"} />
                          <InfoBlock label="عدد الساعات" value={`${formatHours(r.totalHours)} ساعة`} />
                          <InfoBlock label="ساعات العمل" value={`${formatHours(r.workingHours)} ساعة`} />
                          <InfoBlock label="التأخير" value={`${formatHours(r.delayHours)} ساعة`} />
                          <InfoBlock label="الإضافي" value={`${formatHours(r.overtimeHours)} ساعة`} />
                          {auditRate !== null && auditRate !== undefined && (
                            <div className="col-span-2">
                              <Label className="text-sm text-muted-foreground">نسبة التحقيق</Label>
                              <div className="mt-2 flex items-center gap-3">
                                <AuditRateBadge rate={auditRate} />
                                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-neutral-700 overflow-hidden">
                                  <div
                                    className={cn("h-full rounded-full transition-all", (auditRate ?? 0) >= 80 ? "bg-emerald-500" : (auditRate ?? 0) >= 60 ? "bg-sky-500" : (auditRate ?? 0) >= 45 ? "bg-amber-500" : "bg-rose-500")}
                                    style={{ width: `${auditRate}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="col-span-2">
                            <Label className="text-sm text-muted-foreground">الحالة</Label>
                            <div className="mt-2">{isHoliday ? (<Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700">إجازة</Badge>) : statusBadge(status)}</div>
                          </div>
                          {r.notes && (
                            <div className="col-span-2">
                              <Label className="text-sm text-muted-foreground">ملاحظات</Label>
                              <p className="mt-1 text-sm dark:text-neutral-200">{r.notes}</p>
                            </div>
                          )}
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                );
              })}

              {/* Mobile Totals */}
              <div className="p-4 bg-gradient-to-r from-slate-50 to-white dark:from-neutral-700/30 dark:to-neutral-800">
                <div className="font-semibold mb-3 dark:text-neutral-100">الإجماليات</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">عدد الساعات</div>
                    <div className="font-semibold tabular-nums dark:text-neutral-200">{formatHours(totals.totalHours)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">ساعات العمل</div>
                    <div className="font-semibold tabular-nums dark:text-neutral-200">{formatHours(totals.workingHours)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">التأخير</div>
                    <div className="font-semibold tabular-nums dark:text-neutral-200">{formatHours(totals.delayHours)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">الإضافي</div>
                    <div className="font-semibold tabular-nums dark:text-neutral-200">{formatHours(totals.overtimeHours)}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <Card className="rounded-2xl border bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 shadow-sm">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg dark:text-neutral-100">ملاحظات وتنبيهات</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 px-4 sm:px-6">
              <AlertCard title="لا توجد ساعات إضافية مؤثرة" description="متوسط الإضافي خلال الفترة ضئيل جداً." />
              <AlertCard title="تأخير متكرر" description="لاحظنا تأخيراً يزيد عن ساعة في عدة أيام. يفضّل معالجة السبب." tone="warn" />
              <AlertCard title="لا يوجد غياب" description="لم يتم تسجيل غياب خلال الفترة المحددة." tone="ok" />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
