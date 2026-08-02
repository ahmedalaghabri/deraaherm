import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, X,
  Sun, Moon, Umbrella, Heart, AlertTriangle, Briefcase, LogIn, LogOut, FileText,
  Table, Pin, LayoutGrid, Rows, Users, CalendarDays, ArrowUpDown, Filter,
} from "lucide-react";
import { cn } from "../lib/utils";

// ─────────────────────────────────────────
// Filter data (exported for the TasksPage toolbar)
// ─────────────────────────────────────────
export const TA_REGIONS = ["إقليم الرياض", "إقليم الغربية", "إقليم الشرقية"];

export const TA_SHOWROOMS_BY_REGION: Record<string, string[]> = {
  "إقليم الرياض": ["معرض الرياض - العليا", "معرض الرياض - النخيل", "معرض الخرج - الوسطى"],
  "إقليم الغربية": ["معرض جدة - التحلية", "معرض مكة - العزيزية", "معرض المدينة - قباء"],
  "إقليم الشرقية": ["معرض الدمام - الشاطئ", "معرض الخبر - العقربية", "معرض الأحساء - المبرز"],
};

const _FIRST = ["أحمد", "محمد", "خالد", "فهد", "سعد", "عمر", "ناصر", "تركي", "بندر", "وليد", "فيصل", "ماجد"];
const _LAST = ["العتيبي", "الشمري", "الدوسري", "القحطاني", "الحربي", "الزهراني", "الغامدي", "المطيري", "العنزي", "السبيعي", "الرشيدي", "الجهني"];

function strHash(s: string) { return s.split("").reduce((a, c) => a + c.charCodeAt(0), 0); }
function seed(n: number) { return ((n * 9301 + 49297) % 233280) / 233280; }
function mkSeed(...parts: number[]) { return parts.reduce((a, v, i) => a ^ ((v + 1) * (i * 7919 + 1)), 0); }

export const TA_SELLERS_BY_SHOWROOM: Record<string, string[]> = (() => {
  const map: Record<string, string[]> = {};
  Object.values(TA_SHOWROOMS_BY_REGION).flat().forEach((sr) => {
    const h = strHash(sr);
    map[sr] = Array.from({ length: 4 }, (_, i) => {
      const f = _FIRST[Math.floor(seed(mkSeed(h, i, 11)) * _FIRST.length)];
      const l = _LAST[Math.floor(seed(mkSeed(h, i, 23)) * _LAST.length)];
      return `${f} ${l}`;
    });
  });
  return map;
})();

// ─────────────────────────────────────────
// Attendance model
// ─────────────────────────────────────────
export type AttStatus = "present" | "late" | "absent" | "weekly_leave" | "annual_leave" | "sick_leave" | "mission";

export const ATT_STATUS_LABELS: Record<AttStatus, string> = {
  present: "حضور",
  late: "حضور متأخر",
  absent: "غياب",
  weekly_leave: "راحة أسبوعية",
  annual_leave: "إجازة سنوية",
  sick_leave: "إجازة مرضية",
  mission: "مهمة عمل",
};

const STATUS_CONFIG: Record<AttStatus, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  present:      { label: "حضور", icon: Sun, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800" },
  late:         { label: "حضور متأخر", icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800" },
  absent:       { label: "غياب", icon: Moon, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20", border: "border-rose-200 dark:border-rose-800" },
  weekly_leave: { label: "راحة أسبوعية", icon: CalendarIcon, color: "text-slate-500 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-800/40", border: "border-slate-200 dark:border-slate-700" },
  annual_leave: { label: "إجازة سنوية", icon: Umbrella, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800" },
  sick_leave:   { label: "إجازة مرضية", icon: Heart, color: "text-slate-500 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800/40", border: "border-slate-200 dark:border-slate-700" },
  mission:      { label: "مهمة عمل", icon: Briefcase, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-900/20", border: "border-sky-200 dark:border-sky-800" },
};

const MONTHS_AR = ["يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const DAYS_SHORT = ["سبت", "أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة"];
const DAYS_FULL = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

const OFFICIAL_START = 10 * 60; // 10:00
export const OFFICIAL_HOURS = 8;

export interface DayAttendance {
  status: AttStatus;
  inMin: number | null;
  outMin: number | null;
  actualH: number;
  delayInH: number;
  totalDelayH: number;
  compH: number;
  dayDelayH: number;
  netH: number;
  personalPermitH: number;
  missionH: number;
}

export function getDayAttendance(empName: string, year: number, month: number, day: number): DayAttendance {
  const h = strHash(empName);
  const dow = new Date(year, month, day).getDay();
  const empty: Omit<DayAttendance, "status"> = { inMin: null, outMin: null, actualH: 0, delayInH: 0, totalDelayH: 0, compH: 0, dayDelayH: 0, netH: 0, personalPermitH: 0, missionH: 0 };

  if (dow === 5 || dow === 6) return { status: "weekly_leave", ...empty };

  const r = seed(mkSeed(h, year, month + 1, day, 3));
  if (r < 0.05) return { status: "absent", ...empty, netH: -OFFICIAL_HOURS, totalDelayH: OFFICIAL_HOURS, dayDelayH: OFFICIAL_HOURS };
  if (r < 0.08) return { status: "annual_leave", ...empty };
  if (r < 0.11) return { status: "sick_leave", ...empty };
  if (r < 0.14) return { status: "mission", ...empty, actualH: OFFICIAL_HOURS, missionH: OFFICIAL_HOURS };

  const inMin = 9 * 60 + 40 + Math.round(seed(mkSeed(h, year, month + 1, day, 7)) * 100); // 09:40–11:20
  const outMin = 17 * 60 + 15 + Math.round(seed(mkSeed(h, year, month + 1, day, 13)) * 105); // 17:15–19:00
  const actualH = (outMin - inMin) / 60;
  const delayInH = Math.max(0, inMin - OFFICIAL_START) / 60;
  const totalDelayH = Math.max(0, OFFICIAL_HOURS - actualH);
  const compH = totalDelayH > 0 ? Math.min(totalDelayH, seed(mkSeed(h, year, month + 1, day, 17)) * 2) : 0;
  const dayDelayH = totalDelayH - compH;
  const netH = actualH + compH - OFFICIAL_HOURS;
  const personalPermitH = seed(mkSeed(h, year, month + 1, day, 29)) < 0.08 ? 1 + seed(mkSeed(h, year, month + 1, day, 31)) : 0;
  const status: AttStatus = delayInH > 0.25 ? "late" : "present";

  return { status, inMin, outMin, actualH, delayInH, totalDelayH, compH, dayDelayH, netH, personalPermitH, missionH: 0 };
}

function to12(min: number | null) {
  if (min === null) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  const period = h >= 12 ? "م" : "ص";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function fmtH(n: number, showSign = false) {
  const v = Math.round(n * 100) / 100;
  if (v === 0) return "0.00";
  const s = Math.abs(v).toFixed(2);
  if (v < 0) return `${s}-`;
  return showSign ? `${s}+` : s;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function pctColor(p: number) {
  return p >= 95 ? "#00C9A7" : p >= 85 ? "#4D8AFF" : p >= 70 ? "#F9A825" : "#E91E8C";
}

const ALL_EMPS: { key: string; name: string; region: string; showroom: string }[] = (() => {
  const list: { key: string; name: string; region: string; showroom: string }[] = [];
  TA_REGIONS.forEach(r => (TA_SHOWROOMS_BY_REGION[r] || []).forEach(sr =>
    (TA_SELLERS_BY_SHOWROOM[sr] || []).forEach((n, i) => list.push({ key: `${sr}-${i}`, name: n, region: r, showroom: sr }))));
  return list;
})();

// ─────────────────────────────────────────
// Page
// ─────────────────────────────────────────
interface TeamAttendancePageProps {
  region: string;
  showroom: string;
  seller: string;
  allMode?: boolean;
  regions?: string[];
  onEmployeeClick?: (name: string, showroom: string) => void;
}

export default function TeamAttendancePage({ region: _region, showroom, seller, allMode = false, regions = [], onEmployeeClick }: TeamAttendancePageProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [dayDetail, setDayDetail] = useState<number | null>(null);
  const [tblView, setTblView] = useState<"default" | "pinned" | "cards" | "single">("default");
  const [period, setPeriod] = useState<"day" | "month">("day");
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());

  const sellers = useMemo(() => (showroom ? TA_SELLERS_BY_SHOWROOM[showroom] || [] : []), [showroom]);
  const visibleEmps = useMemo(() => (seller ? sellers.filter(s => s === seller) : sellers), [sellers, seller]);

  const [tableEmp, setTableEmp] = useState<string>("");
  useEffect(() => {
    if (seller) setTableEmp(seller);
    else if (sellers.length > 0 && !sellers.includes(tableEmp)) setTableEmp(sellers[0]);
    else if (sellers.length === 0) setTableEmp("");
  }, [seller, sellers]); // eslint-disable-line react-hooks/exhaustive-deps

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = (firstDayOfMonth + 1) % 7;

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setDayDetail(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setDayDetail(null);
  };

  // Monthly rows + totals for the detail table
  const monthRows = useMemo(() => {
    if (!tableEmp) return [];
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return { day, att: getDayAttendance(tableEmp, year, month, day) };
    });
  }, [tableEmp, year, month, daysInMonth]);

  const totals = useMemo(() => {
    let required = 0, actual = 0, comp = 0, personal = 0, missionPermit = 0, fullAbsences = 0;
    monthRows.forEach(({ att }) => {
      if (["present", "late", "absent"].includes(att.status)) required += OFFICIAL_HOURS;
      if (att.status === "mission") { required += OFFICIAL_HOURS; missionPermit += att.missionH; }
      actual += att.actualH;
      comp += att.compH;
      personal += att.personalPermitH;
      if (att.status === "absent") fullAbsences += 1;
    });
    const net = actual + comp - required;
    const absenceH = Math.min(0, net);
    return { required, actual, comp, personal, missionPermit, fullAbsences, net, absenceH };
  }, [monthRows]);

  const isFutureDay = (day: number) =>
    year > today.getFullYear() ||
    (year === today.getFullYear() && month > today.getMonth()) ||
    (year === today.getFullYear() && month === today.getMonth() && day > today.getDate());

  // ── All-employees mode data ──
  useEffect(() => {
    const dim = getDaysInMonth(year, month);
    let d = Math.min(selectedDay, dim);
    if (year === today.getFullYear() && month === today.getMonth() && d > today.getDate()) d = today.getDate();
    if (d !== selectedDay) setSelectedDay(d);
  }, [year, month]); // eslint-disable-line react-hooks/exhaustive-deps

  const allEmpsFiltered = useMemo(
    () => (regions.length > 0 ? ALL_EMPS.filter(e => regions.includes(e.region)) : ALL_EMPS),
    [regions]
  );

  const allDayPcts = useMemo(() => {
    if (!allMode) return [] as number[];
    return Array.from({ length: daysInMonth + 1 }, (_, d) => {
      if (d === 0) return -2;
      const dow = new Date(year, month, d).getDay();
      if (dow === 5 || dow === 6) return -1;
      if (isFutureDay(d)) return -2;
      let w = 0;
      allEmpsFiltered.forEach(e => { const st = getDayAttendance(e.name, year, month, d).status; if (["present", "late", "mission"].includes(st)) w++; });
      return Math.round((w / Math.max(allEmpsFiltered.length, 1)) * 100);
    });
  }, [allMode, year, month, daysInMonth, allEmpsFiltered]); // eslint-disable-line react-hooks/exhaustive-deps

  const allMonthPcts = useMemo(() => {
    if (!allMode) return [] as number[];
    return MONTHS_AR.map((_, mIdx) => {
      const dCount = getDaysInMonth(year, mIdx);
      let sum = 0, n = 0;
      for (let d = 1; d <= dCount; d++) {
        const dow = new Date(year, mIdx, d).getDay();
        if (dow === 5 || dow === 6) continue;
        const future = year > today.getFullYear() ||
          (year === today.getFullYear() && mIdx > today.getMonth()) ||
          (year === today.getFullYear() && mIdx === today.getMonth() && d > today.getDate());
        if (future) continue;
        let w = 0;
        allEmpsFiltered.forEach(e => { const st = getDayAttendance(e.name, year, mIdx, d).status; if (["present", "late", "mission"].includes(st)) w++; });
        sum += (w / Math.max(allEmpsFiltered.length, 1)) * 100; n++;
      }
      return n === 0 ? -2 : Math.round(sum / n);
    });
  }, [allMode, year, allEmpsFiltered]); // eslint-disable-line react-hooks/exhaustive-deps

  const empMonthSummaries = useMemo(() => {
    const map = new Map<string, { present: number; late: number; absent: number; leave: number; mission: number; actual: number; net: number }>();
    if (!allMode || period !== "month") return map;
    allEmpsFiltered.forEach(e => {
      let present = 0, late = 0, absent = 0, leave = 0, mission = 0, actual = 0, comp = 0, required = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        if (isFutureDay(d)) continue;
        const att = getDayAttendance(e.name, year, month, d);
        if (att.status === "present") present++;
        else if (att.status === "late") late++;
        else if (att.status === "absent") absent++;
        else if (att.status === "annual_leave" || att.status === "sick_leave") leave++;
        else if (att.status === "mission") mission++;
        if (["present", "late", "absent", "mission"].includes(att.status)) required += OFFICIAL_HOURS;
        actual += att.actualH; comp += att.compH;
      }
      map.set(e.key, { present, late, absent, leave, mission, actual, net: actual + comp - required });
    });
    return map;
  }, [allMode, period, year, month, daysInMonth, allEmpsFiltered]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── All-employees table: sort + column filters ──
  type AllRow = {
    key: string; name: string; region: string; showroom: string;
    status: AttStatus; statusLabel: string; inMin: number; outMin: number; actualH: number; netH: number;
    present: number; late: number; absent: number; leave: number; mission: number; actual: number; net: number;
  };
  type AllColDef = { key: string; label: string; num: boolean; sortVal: (r: AllRow) => number | string; text?: (r: AllRow) => string };

  const [allSort, setAllSort] = useState<{ key: string; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });
  const [allFilters, setAllFilters] = useState<Record<string, { min: string; max: string } | { value: string }>>({});
  const [allFilterCol, setAllFilterCol] = useState<string | null>(null);
  const [allFilterRect, setAllFilterRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    setAllFilters({}); setAllSort({ key: "name", dir: "asc" }); setAllFilterCol(null); setAllFilterRect(null);
  }, [period]);

  const allCols: AllColDef[] = useMemo(() => period === "day" ? [
    { key: "name", label: "الموظف", num: false, sortVal: r => r.name, text: r => r.name },
    { key: "region", label: "الإقليم", num: false, sortVal: r => r.region, text: r => r.region },
    { key: "showroom", label: "المعرض", num: false, sortVal: r => r.showroom, text: r => r.showroom },
    { key: "status", label: "الحالة", num: false, sortVal: r => r.statusLabel, text: r => r.statusLabel },
    { key: "inMin", label: "الحضور", num: false, sortVal: r => r.inMin, text: r => (r.inMin >= 0 ? to12(r.inMin) : "") },
    { key: "outMin", label: "الانصراف", num: false, sortVal: r => r.outMin, text: r => (r.outMin >= 0 ? to12(r.outMin) : "") },
    { key: "actualH", label: "الساعات الفعلية", num: true, sortVal: r => r.actualH },
    { key: "netH", label: "الصافي", num: true, sortVal: r => r.netH },
  ] : [
    { key: "name", label: "الموظف", num: false, sortVal: r => r.name, text: r => r.name },
    { key: "region", label: "الإقليم", num: false, sortVal: r => r.region, text: r => r.region },
    { key: "showroom", label: "المعرض", num: false, sortVal: r => r.showroom, text: r => r.showroom },
    { key: "present", label: "حضور", num: true, sortVal: r => r.present },
    { key: "late", label: "تأخير", num: true, sortVal: r => r.late },
    { key: "absent", label: "غياب", num: true, sortVal: r => r.absent },
    { key: "leave", label: "إجازات", num: true, sortVal: r => r.leave },
    { key: "mission", label: "مهام", num: true, sortVal: r => r.mission },
    { key: "actual", label: "الساعات الفعلية", num: true, sortVal: r => r.actual },
    { key: "net", label: "الصافي", num: true, sortVal: r => r.net },
  ], [period]);

  const allRows: AllRow[] = useMemo(() => {
    if (!allMode) return [];
    if (period === "day") {
      return allEmpsFiltered.map(e => {
        const att = getDayAttendance(e.name, year, month, selectedDay);
        return {
          key: e.key, name: e.name, region: e.region, showroom: e.showroom,
          status: att.status, statusLabel: STATUS_CONFIG[att.status].label,
          inMin: att.inMin ?? -1, outMin: att.outMin ?? -1, actualH: att.actualH, netH: att.netH,
          present: 0, late: 0, absent: 0, leave: 0, mission: 0, actual: 0, net: 0,
        };
      });
    }
    return allEmpsFiltered.map(e => {
      const s = empMonthSummaries.get(e.key);
      return {
        key: e.key, name: e.name, region: e.region, showroom: e.showroom,
        status: "present" as AttStatus, statusLabel: "", inMin: -1, outMin: -1, actualH: 0, netH: 0,
        present: s?.present ?? 0, late: s?.late ?? 0, absent: s?.absent ?? 0, leave: s?.leave ?? 0, mission: s?.mission ?? 0, actual: s?.actual ?? 0, net: s?.net ?? 0,
      };
    });
  }, [allMode, period, allEmpsFiltered, year, month, selectedDay, empMonthSummaries]);

  const isAllFilterActive = (key: string) => {
    const f = allFilters[key] as any;
    if (!f) return false;
    return f.value !== undefined ? !!f.value : (f.min !== "" || f.max !== "");
  };
  const allActiveFilterCount = allCols.filter(c => isAllFilterActive(c.key)).length;

  const allProcessedRows = useMemo(() => {
    let rows = allRows;
    for (const col of allCols) {
      const f = allFilters[col.key] as any;
      if (!f) continue;
      if (col.num) {
        if (f.min !== undefined && f.min !== "" && !isNaN(parseFloat(f.min))) rows = rows.filter(r => (col.sortVal(r) as number) >= parseFloat(f.min));
        if (f.max !== undefined && f.max !== "" && !isNaN(parseFloat(f.max))) rows = rows.filter(r => (col.sortVal(r) as number) <= parseFloat(f.max));
      } else if (f.value) {
        const v = f.value.toLowerCase();
        rows = rows.filter(r => (col.text?.(r) ?? "").toLowerCase().includes(v));
      }
    }
    const col = allCols.find(c => c.key === allSort.key) ?? allCols[0];
    return [...rows].sort((a, b) => {
      const av = col.sortVal(a), bv = col.sortVal(b);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv), "ar");
      return allSort.dir === "asc" ? cmp : -cmp;
    });
  }, [allRows, allCols, allFilters, allSort]);

  const toggleAllSort = (key: string) =>
    setAllSort(prev => prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });

  const openAllFilter = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (allFilterCol === key) { setAllFilterCol(null); setAllFilterRect(null); return; }
    setAllFilterCol(key);
    setAllFilterRect((e.currentTarget as HTMLElement).getBoundingClientRect());
  };

  return (
    <>
      <div dir="rtl" className="min-h-screen font-sans">
        <div className="max-w-[var(--page-max-w)] mx-auto px-2 sm:px-0 pt-4 sm:pt-6 space-y-4 sm:space-y-6 pb-10">

          {/* ── ALL-EMPLOYEES MODE ── */}
          {allMode && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full space-y-4">
              {/* Period toggle + nav + strip */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between gap-2 flex-wrap px-4 sm:px-6 py-3 border-b border-neutral-100 dark:border-neutral-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                      <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-800 dark:text-white">تحضير الموظفين</h3>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{allEmpsFiltered.length} موظف — {regions.length > 0 && regions.length < TA_REGIONS.length ? regions.join("، ") : "كل الأقاليم"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-neutral-100 dark:bg-neutral-700/60 rounded-xl p-1 gap-0.5">
                      {([["day", "يومي", Sun], ["month", "شهري", CalendarDays]] as ["day" | "month", string, React.ElementType][]).map(([p, l, Icon]) => (
                        <button key={p} onClick={() => setPeriod(p)}
                          className={cn("flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold transition-all whitespace-nowrap rounded-lg",
                            period === p ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-sm" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200")}>
                          <Icon className="w-3.5 h-3.5" />
                          {l}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => period === "day" ? prevMonth() : setYear(y => y - 1)} className="w-7 h-7 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors">
                        <ChevronRight className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                      </button>
                      <span className="text-[13px] font-bold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">{period === "day" ? `${MONTHS_AR[month]} ${year}` : year}</span>
                      <button onClick={() => period === "day" ? nextMonth() : setYear(y => y + 1)} className="w-7 h-7 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors">
                        <ChevronLeft className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Days / Months strip */}
                {period === "day" ? (
                  <div className="overflow-x-auto scrollbar-hide py-2 px-2">
                    <div className="flex gap-1" style={{ width: "max-content", margin: "0 auto" }}>
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const pct = allDayPcts[day];
                        const isSelected = selectedDay === day;
                        const isWknd = pct === -1;
                        const future = pct === -2;
                        const dayName = DAYS_SHORT[(new Date(year, month, day).getDay() + 1) % 7];
                        const color = pct >= 0 ? pctColor(pct) : "#9ca3af";
                        return (
                          <button key={day} onClick={() => { if (!future) setSelectedDay(day); }} disabled={future}
                            className={cn("flex flex-col items-center gap-0.5 rounded-xl py-2 px-1 min-w-[46px] transition-all shrink-0 active:scale-95 border",
                              isSelected ? "bg-neutral-900 dark:bg-neutral-100 border-neutral-900 dark:border-neutral-100 shadow-sm" :
                              "bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-500",
                              (future || isWknd) && !isSelected && "opacity-40")}>
                            <span className={cn("text-[10px] font-semibold leading-none", isSelected ? "text-white/70 dark:text-neutral-900/70" : "text-neutral-400 dark:text-neutral-500")}>{dayName}</span>
                            <span className={cn("text-[13px] font-extrabold leading-tight", isSelected ? "text-white dark:text-neutral-900" : "text-neutral-800 dark:text-neutral-100")}>{day}</span>
                            <span className="text-[10px] font-bold leading-none" style={{ color: isSelected ? undefined : color }}>
                              <span className={isSelected ? "text-white dark:text-neutral-900" : ""}>{isWknd ? "راحة" : future ? "—" : `${pct}%`}</span>
                            </span>
                            <div className={cn("w-4/5 h-1 rounded-full overflow-hidden", isSelected ? "bg-white/25 dark:bg-neutral-900/25" : "bg-neutral-100 dark:bg-neutral-700")}>
                              <div className="h-full rounded-full" style={{ width: `${Math.max(pct, 0)}%`, backgroundColor: isSelected ? (document.documentElement.classList.contains("dark") ? "#171717" : "#ffffff") : color }} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto scrollbar-hide py-2 px-2">
                    <div className="flex gap-1" style={{ width: "max-content", margin: "0 auto" }}>
                      {MONTHS_AR.map((mName, mIdx) => {
                        const pct = allMonthPcts[mIdx];
                        const isSelected = month === mIdx;
                        const future = pct === -2;
                        const color = pct >= 0 ? pctColor(pct) : "#9ca3af";
                        return (
                          <button key={mIdx} onClick={() => { if (!future) setMonth(mIdx); }} disabled={future}
                            className={cn("flex flex-col items-center gap-1 rounded-xl px-3 py-2 min-w-[72px] transition-all shrink-0 active:scale-95 border",
                              isSelected ? "bg-neutral-900 dark:bg-neutral-100 border-neutral-900 dark:border-neutral-100 shadow-sm" :
                              "bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-500",
                              future && !isSelected && "opacity-40")}>
                            <span className={cn("text-[12px] font-bold whitespace-nowrap", isSelected ? "text-white dark:text-neutral-900" : "text-neutral-800 dark:text-neutral-100")}>{mName}</span>
                            <span className={cn("text-[11px] font-extrabold", isSelected ? "text-white dark:text-neutral-900" : "")} style={{ color: isSelected ? undefined : color }}>{future ? "—" : `${pct}%`}</span>
                            <div className={cn("w-full h-1 rounded-full overflow-hidden", isSelected ? "bg-white/25 dark:bg-neutral-900/25" : "bg-neutral-100 dark:bg-neutral-700")}>
                              <div className="h-full rounded-full" style={{ width: `${Math.max(pct, 0)}%`, backgroundColor: isSelected ? (document.documentElement.classList.contains("dark") ? "#171717" : "#ffffff") : color }} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Employees flat table (sortable + filterable) */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-neutral-100 dark:border-neutral-700">
                  <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">سجل الموظفين — {period === "day" ? `${selectedDay} ${MONTHS_AR[month]} ${year}` : `${MONTHS_AR[month]} ${year}`}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                      {allActiveFilterCount > 0 ? `${allProcessedRows.length} / ${allRows.length}` : `${allRows.length}`} سجل
                      {allActiveFilterCount > 0 && (
                        <button onClick={() => setAllFilters({})} className="mr-1.5 text-[12px] text-red-500 hover:text-red-700 font-normal">× مسح الفلاتر ({allActiveFilterCount})</button>
                      )}
                    </span>
                    {period === "day" && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                        حضور {allProcessedRows.filter(r => ["present", "late", "mission"].includes(r.status)).length} / {allProcessedRows.length}
                      </span>
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto max-h-[70vh] overflow-y-auto relative">
                  <table className="w-full text-[11px] sm:text-[12px]" style={{ minWidth: 760 }}>
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-700">
                        {allCols.map(col => (
                          <th key={col.key} className="px-2 py-2 text-right font-bold text-neutral-600 dark:text-neutral-300 select-none whitespace-nowrap bg-neutral-50 dark:bg-neutral-700">
                            <div className="flex items-center justify-between gap-0.5 w-full">
                              <div className="flex items-center gap-0.5 order-last shrink-0">
                                <button onClick={() => toggleAllSort(col.key)} className="p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600">
                                  <ArrowUpDown className={cn("w-2.5 h-2.5", allSort.key === col.key ? "text-indigo-600 dark:text-indigo-400" : "text-neutral-300 dark:text-neutral-500")} />
                                </button>
                                <button onClick={e => openAllFilter(col.key, e)}
                                  className={cn("p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors",
                                    isAllFilterActive(col.key) ? "text-indigo-600 dark:text-indigo-400" : "text-neutral-300 dark:text-neutral-500 hover:text-neutral-500")}>
                                  <Filter className="w-2.5 h-2.5" />
                                </button>
                              </div>
                              <span className="cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-100" onClick={() => toggleAllSort(col.key)}>{col.label}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allProcessedRows.map((r, ri) => {
                        const cfg = STATUS_CONFIG[r.status];
                        const isWorking = ["present", "late"].includes(r.status);
                        return (
                          <tr key={r.key} className={cn("border-b border-neutral-50 dark:border-neutral-700/60 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700/30", ri % 2 === 1 && "bg-neutral-50/60 dark:bg-neutral-700/15")}>
                            {allCols.map(col => {
                              if (col.key === "name") return (
                                <td key={col.key} className="px-2 py-1.5 font-bold text-neutral-800 dark:text-neutral-100 whitespace-nowrap">
                                  <button
                                    onClick={() => onEmployeeClick?.(r.name, r.showroom)}
                                    title="عرض حضور وغياب الموظف"
                                    className="font-bold text-neutral-800 dark:text-neutral-100 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline underline-offset-2 transition-colors"
                                  >
                                    {r.name}
                                  </button>
                                </td>
                              );
                              if (col.key === "region") return <td key={col.key} className="px-2 py-1.5 text-neutral-500 dark:text-neutral-400 whitespace-nowrap">{r.region}</td>;
                              if (col.key === "showroom") return <td key={col.key} className="px-2 py-1.5 text-neutral-500 dark:text-neutral-400 whitespace-nowrap">{r.showroom.replace("معرض ", "")}</td>;
                              if (col.key === "status") return (
                                <td key={col.key} className="px-2 py-1.5 whitespace-nowrap">
                                  <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold", cfg.bg, cfg.color)}>
                                    <svg className="w-1.5 h-1.5" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="12" /></svg>
                                    {cfg.label}
                                  </span>
                                </td>
                              );
                              if (col.key === "inMin") return <td key={col.key} className={cn("px-2 py-1.5 tabular-nums whitespace-nowrap font-bold", isWorking ? "text-emerald-700 dark:text-emerald-400" : "text-neutral-300 dark:text-neutral-600")}>{isWorking ? to12(r.inMin) : "—"}</td>;
                              if (col.key === "outMin") return <td key={col.key} className={cn("px-2 py-1.5 tabular-nums whitespace-nowrap font-bold", isWorking ? "text-rose-700 dark:text-rose-400" : "text-neutral-300 dark:text-neutral-600")}>{isWorking ? to12(r.outMin) : "—"}</td>;
                              if (col.key === "actualH") return <td key={col.key} className="px-2 py-1.5 tabular-nums font-extrabold text-neutral-800 dark:text-neutral-100">{r.actualH > 0 ? fmtH(r.actualH) : "—"}</td>;
                              if (col.key === "netH") return <td key={col.key} className={cn("px-2 py-1.5 tabular-nums font-extrabold", r.netH < -0.01 ? "text-rose-600 dark:text-rose-400" : r.actualH > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-300 dark:text-neutral-600")}>{r.actualH > 0 || r.netH !== 0 ? fmtH(r.netH) : "—"}</td>;
                              if (col.key === "present") return <td key={col.key} className="px-2 py-1.5 tabular-nums font-bold text-emerald-600 dark:text-emerald-400">{r.present}</td>;
                              if (col.key === "late") return <td key={col.key} className={cn("px-2 py-1.5 tabular-nums", r.late > 0 ? "font-bold text-amber-600 dark:text-amber-400" : "text-neutral-300 dark:text-neutral-600")}>{r.late}</td>;
                              if (col.key === "absent") return <td key={col.key} className={cn("px-2 py-1.5 tabular-nums", r.absent > 0 ? "font-bold text-rose-600 dark:text-rose-400" : "text-neutral-300 dark:text-neutral-600")}>{r.absent}</td>;
                              if (col.key === "leave") return <td key={col.key} className={cn("px-2 py-1.5 tabular-nums", r.leave > 0 ? "font-bold text-amber-600 dark:text-amber-400" : "text-neutral-300 dark:text-neutral-600")}>{r.leave}</td>;
                              if (col.key === "mission") return <td key={col.key} className={cn("px-2 py-1.5 tabular-nums", r.mission > 0 ? "font-bold text-sky-600 dark:text-sky-400" : "text-neutral-300 dark:text-neutral-600")}>{r.mission}</td>;
                              if (col.key === "actual") return <td key={col.key} className="px-2 py-1.5 tabular-nums font-extrabold text-neutral-800 dark:text-neutral-100">{fmtH(r.actual)}</td>;
                              if (col.key === "net") return <td key={col.key} className={cn("px-2 py-1.5 tabular-nums font-extrabold", r.net < -0.01 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400")}>{fmtH(r.net)}</td>;
                              return <td key={col.key} />;
                            })}
                          </tr>
                        );
                      })}
                      {allProcessedRows.length === 0 && (
                        <tr>
                          <td colSpan={allCols.length} className="px-4 py-8 text-center text-neutral-400 dark:text-neutral-500 font-bold">لا توجد نتائج مطابقة للفلاتر</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Attendance Calendar ── */}
          {!allMode && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-neutral-100 dark:border-neutral-700">
                <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                  <ChevronRight className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                </button>
                <div className="text-center">
                  <span className="text-base font-bold text-neutral-800 dark:text-neutral-200">{MONTHS_AR[month]} {year}</span>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">اضغط على اليوم لعرض تفاصيل الحركة</p>
                </div>
                <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                </button>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2 flex-wrap px-4 sm:px-6 py-2 border-b border-neutral-100 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-700/20">
                {(Object.keys(STATUS_CONFIG) as AttStatus[]).map(s => {
                  const cfg = STATUS_CONFIG[s];
                  return (
                    <span key={s} className="flex items-center gap-1 text-[10px] font-bold text-neutral-500 dark:text-neutral-400">
                      <svg className={cn("w-2 h-2", cfg.color)} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="12" /></svg>
                      {cfg.label}
                    </span>
                  );
                })}
              </div>

              {/* Day names header */}
              <div className="hidden sm:grid grid-cols-7 gap-1 sm:gap-2 px-1 sm:px-2 pt-2 pb-1">
                {DAYS_SHORT.map(d => (
                  <div key={d} className="text-center py-1.5 text-[10px] sm:text-xs font-bold text-neutral-400 dark:text-neutral-500">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-1 sm:gap-2 p-1 sm:p-2">
                {Array.from({ length: startOffset }).map((_, i) => (
                  <div key={`empty-${i}`} className="hidden sm:block min-h-[82px] sm:min-h-[120px] rounded-xl" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
                  const dayName = DAYS_SHORT[(new Date(year, month, day).getDay() + 1) % 7];
                  const future = isFutureDay(day);

                  if (!showroom) {
                    return (
                      <div key={day} className={cn(
                        "min-h-[82px] sm:min-h-[120px] p-3 rounded-xl border transition-all text-right relative flex flex-col justify-between shadow-sm overflow-hidden opacity-40",
                        isToday ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800" : "bg-neutral-50 dark:bg-neutral-800/50 border-neutral-100 dark:border-neutral-700"
                      )}>
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-[10px] font-bold text-neutral-300 dark:text-neutral-600">{dayName}</span>
                          <span className="text-lg font-extrabold leading-none text-neutral-300 dark:text-neutral-600">{day}</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={day}
                      onClick={() => { if (!future) setDayDetail(day); }}
                      className={cn(
                        "min-h-[82px] sm:min-h-[120px] p-2.5 sm:p-3 rounded-xl border transition-all text-right relative flex flex-col shadow-sm overflow-hidden",
                        future ? "opacity-50" : "cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600",
                        isToday
                          ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                          : "bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700"
                      )}
                    >
                      <div className={cn("absolute top-0 left-0 right-0 h-1", isToday ? "bg-amber-500" : "bg-neutral-200 dark:bg-neutral-600")} />
                      <div className="flex items-center justify-end gap-1 mt-0.5 mb-1.5">
                        <span className={cn("text-[11px] font-bold", isToday ? "text-amber-500 dark:text-amber-400" : "text-neutral-400 dark:text-neutral-500")}>{dayName}</span>
                        <span className={cn("text-lg font-extrabold leading-none", isToday ? "text-amber-600 dark:text-amber-400" : "text-neutral-700 dark:text-neutral-200")}>{day}</span>
                      </div>
                      <div className="flex flex-col gap-1 mt-auto">
                        {visibleEmps.map(emp => {
                          const att = future ? null : getDayAttendance(emp, year, month, day);
                          const cfg = att ? STATUS_CONFIG[att.status] : null;
                          const isWorking = att ? ["present", "late", "mission"].includes(att.status) : false;
                          const shortName = (() => { const p = emp.split(" "); return p.length > 2 ? `${p[0]} ${p[p.length - 1]}` : emp; })();
                          return (
                            <div key={emp} className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1 min-w-0">
                                <svg className={cn("w-1.5 h-1.5 sm:w-2 sm:h-2 shrink-0", cfg ? cfg.color : "text-neutral-300 dark:text-neutral-600")} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="12" /></svg>
                                <span className={cn("text-[11px] font-bold truncate px-0.5 rounded text-neutral-700 dark:text-neutral-200", cfg?.bg)}>{shortName}</span>
                              </div>
                              <span className={cn("text-[10px] shrink-0 mr-3 tabular-nums", !att ? "text-neutral-300 dark:text-neutral-600" : isWorking ? "text-neutral-500 dark:text-neutral-400" : cfg?.color)}>
                                {!att ? "—" : att.status === "mission" ? cfg?.label : isWorking ? `${to12(att.inMin)} ← ${to12(att.outMin)}` : cfg?.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
          )}

          {/* ── Monthly Detail Table (single employee) ── */}
          {!allMode && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="w-full">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-neutral-100 dark:border-neutral-700">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-800 dark:text-white">الاستعراض الشهري للحضور والانصراف</h3>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{MONTHS_AR[month]} {year} — {tableEmp || "اختر المعرض أولاً"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {sellers.length > 0 && (
                      <select
                        value={tableEmp}
                        onChange={e => setTableEmp(e.target.value)}
                        className="text-[11px] font-bold px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                      >
                        {sellers.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                    <div className="flex items-center gap-0.5 bg-neutral-100 dark:bg-neutral-700 rounded-lg p-0.5">
                      {([
                        ["default", "افتراضي", Table],
                        ["pinned", "مثبت", Pin],
                        ["cards", "بطاقات", LayoutGrid],
                        ["single", "مفرد", Rows],
                      ] as [typeof tblView, string, React.ElementType][]).map(([mode, label, Icon]) => (
                        <button key={mode} onClick={() => setTblView(mode)} title={label}
                          className={cn("px-1.5 py-1 rounded-md text-xs font-medium transition-all flex items-center",
                            tblView === mode ? "bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 shadow-sm" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300")}>
                          <Icon className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {!showroom ? (
                <div className="py-12 text-center">
                  <CalendarIcon className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-neutral-500 dark:text-neutral-400">اختر المنطقة والمعرض لعرض حضور الفريق</p>
                </div>
              ) : (
                <>
                  {(tblView === "default" || tblView === "pinned") && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[12px]" style={{ minWidth: tblView === "pinned" ? 700 : 760 }}>
                      <thead>
                        <tr className="bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-700">
                          {tblView === "pinned" ? (
                            <th className="px-2 py-1.5 text-center font-bold text-neutral-600 dark:text-neutral-300 whitespace-nowrap sticky right-0 z-10 bg-neutral-50 dark:bg-neutral-700 border-l border-neutral-200 dark:border-neutral-600">
                              <div className="flex items-center justify-center gap-1">
                                <Pin className="w-3 h-3 text-indigo-500" />
                                <span>اليوم / التاريخ</span>
                              </div>
                            </th>
                          ) : (
                            ["اليوم", "التاريخ"].map(h => (
                              <th key={h} className="px-1 py-1.5 text-center font-bold text-neutral-600 dark:text-neutral-300 whitespace-nowrap border-l border-neutral-100 dark:border-neutral-600">{h}</th>
                            ))
                          )}
                          {["الدخول", "الخروج", "تأخير الدخول", "الساعات الفعلية", "الدوام الرسمي", "التأخير الكلي", "التعويض", "تأخير اليوم", "الصافي", "استئذان شخصي", "مهام / إجازات"].map((h, hi) => (
                            <th key={h} className={cn(
                              "px-1 py-1.5 text-center font-bold text-neutral-600 dark:text-neutral-300 whitespace-nowrap border-l border-neutral-100 dark:border-neutral-600 last:border-l-0",
                              (hi === 0 || hi === 1 || hi === 3 || hi === 8) && "bg-neutral-100/80 dark:bg-neutral-600/40"
                            )}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {monthRows.map(({ day, att }, ri) => {
                          const dowFull = DAYS_FULL[new Date(year, month, day).getDay()];
                          const dateStr = `${String(day).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}`;
                          const isWeekend = att.status === "weekly_leave";
                          const isAbsent = att.status === "absent";
                          const isLeave = att.status === "annual_leave" || att.status === "sick_leave";
                          const isMission = att.status === "mission";
                          const future = isFutureDay(day);
                          const cfg = STATUS_CONFIG[att.status];
                          const td = "px-1.5 py-1 text-center tabular-nums whitespace-nowrap border-l border-neutral-50 dark:border-neutral-700/50 last:border-l-0";
                          const zero = "text-neutral-400 dark:text-neutral-500";

                          const pinned = tblView === "pinned";

                          if (isWeekend) {
                            return (
                              <tr key={day} className="bg-neutral-200/70 dark:bg-neutral-700/50 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-600">
                                {pinned ? (
                                  <td className={cn(td, "font-bold sticky right-0 z-10 bg-neutral-200 dark:bg-neutral-700 border-l border-neutral-300 dark:border-neutral-600")}>{dowFull} {dateStr}</td>
                                ) : (
                                  <>
                                    <td className={cn(td, "font-bold border-neutral-300/50 dark:border-neutral-600/50")}>{dowFull}</td>
                                    <td className={cn(td, "font-bold border-neutral-300/50 dark:border-neutral-600/50")}>{dateStr}</td>
                                  </>
                                )}
                                <td colSpan={11} className="px-2 py-1 text-center font-bold text-[11px] tracking-wide">راحة أسبوعية</td>
                              </tr>
                            );
                          }

                          return (
                            <tr key={day} className={cn(
                              "border-b border-neutral-50 dark:border-neutral-700/60 transition-colors leading-tight",
                              future ? "opacity-40" :
                              isAbsent ? "bg-rose-50 dark:bg-rose-900/15" :
                              isLeave ? "bg-neutral-100/70 dark:bg-neutral-700/20" :
                              isMission ? "bg-sky-50/70 dark:bg-sky-900/10" :
                              ri % 2 === 1 ? "bg-neutral-50/60 dark:bg-neutral-700/15 hover:bg-neutral-100/70 dark:hover:bg-neutral-700/30" :
                              "hover:bg-neutral-50 dark:hover:bg-neutral-700/30"
                            )}>
                              {pinned ? (
                                <td className={cn(td, "font-bold text-neutral-700 dark:text-neutral-200 sticky right-0 z-10 bg-white dark:bg-neutral-800 border-l border-neutral-200 dark:border-neutral-600")}>
                                  {dowFull} <span className="text-neutral-400 dark:text-neutral-500 font-normal">{dateStr}</span>
                                </td>
                              ) : (
                                <>
                                  <td className={cn(td, "font-bold text-neutral-700 dark:text-neutral-200")}>{dowFull}</td>
                                  <td className={cn(td, "text-neutral-500 dark:text-neutral-400")}>{dateStr}</td>
                                </>
                              )}
                              {future ? (
                                <td colSpan={11} className={cn("px-2 py-1 text-center", zero)}>—</td>
                              ) : isAbsent || isLeave ? (
                                <>
                                  <td colSpan={2} className={cn(td, "font-bold", cfg.color)}>{cfg.label}</td>
                                  <td className={cn(td, zero)}>—</td>
                                  <td className={cn(td, zero)}>0.00</td>
                                  <td className={cn(td, isAbsent ? "text-neutral-600 dark:text-neutral-300" : zero)}>{isAbsent ? "8.00" : "0.00"}</td>
                                  <td className={cn(td, isAbsent ? "font-bold text-rose-600 dark:text-rose-400" : zero)}>{isAbsent ? "8.00" : "0.00"}</td>
                                  <td className={cn(td, zero)}>0.00</td>
                                  <td className={cn(td, isAbsent ? "font-bold text-rose-600 dark:text-rose-400" : zero)}>{isAbsent ? "8.00" : "0.00"}</td>
                                  <td className={cn(td, "font-bold", isAbsent ? "text-rose-600 dark:text-rose-400" : zero)}>{isAbsent ? "8.00-" : "0.00"}</td>
                                  <td className={cn(td, zero)}>0.00</td>
                                  <td className={cn(td, "font-bold", cfg.color)}>{isLeave ? cfg.label : "—"}</td>
                                </>
                              ) : (
                                <>
                                  <td className={cn(td, "font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10")}>{isMission ? "—" : to12(att.inMin)}</td>
                                  <td className={cn(td, "font-bold text-rose-700 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-900/10")}>{isMission ? "—" : to12(att.outMin)}</td>
                                  <td className={cn(td, att.delayInH > 0.01 ? "text-amber-600 dark:text-amber-400 font-bold" : zero)}>{fmtH(att.delayInH)}</td>
                                  <td className={cn(td, "font-extrabold text-neutral-800 dark:text-neutral-100 bg-neutral-100/60 dark:bg-neutral-600/20")}>{fmtH(att.actualH)}</td>
                                  <td className={cn(td, "text-neutral-500 dark:text-neutral-400")}>8.00</td>
                                  <td className={cn(td, att.totalDelayH > 0.01 ? "text-rose-600 dark:text-rose-400 font-bold" : zero)}>{fmtH(att.totalDelayH)}</td>
                                  <td className={cn(td, att.compH > 0.01 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : zero)}>{fmtH(att.compH)}</td>
                                  <td className={cn(td, att.dayDelayH > 0.01 ? "text-rose-600 dark:text-rose-400 font-bold" : zero)}>{fmtH(att.dayDelayH)}</td>
                                  <td className={cn(td, "font-extrabold", att.netH < -0.01 ? "text-rose-600 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-900/10" : "text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-900/10")}>{fmtH(att.netH)}</td>
                                  <td className={cn(td, att.personalPermitH > 0.01 ? "text-indigo-600 dark:text-indigo-400 font-semibold" : zero)}>{fmtH(att.personalPermitH)}</td>
                                  <td className={cn(td, "font-bold", isMission ? cfg.color : zero)}>{isMission ? cfg.label : "—"}</td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-neutral-800 dark:bg-neutral-900 text-white border-t-2 border-neutral-300 dark:border-neutral-600">
                          {tblView === "pinned" ? (
                            <>
                              <td className="px-2 py-1.5 text-center font-bold text-[10px] sticky right-0 z-10 bg-neutral-800 dark:bg-neutral-900 border-l border-neutral-700">الإجمالي</td>
                              <td colSpan={3} className="px-2 py-1.5 text-center font-bold text-[10px] text-neutral-400">{MONTHS_AR[month]} {year}</td>
                            </>
                          ) : (
                            <td colSpan={5} className="px-2 py-1.5 text-center font-bold text-[10px]">الإجمالي — {MONTHS_AR[month]} {year}</td>
                          )}
                          <td className="px-1 py-1.5 text-center tabular-nums font-extrabold text-emerald-400">{fmtH(totals.actual)}</td>
                          <td className="px-1 py-1.5 text-center tabular-nums font-bold text-neutral-300">{fmtH(totals.required)}</td>
                          <td className="px-1 py-1.5 text-center" />
                          <td className="px-1 py-1.5 text-center tabular-nums font-bold text-neutral-300">{fmtH(totals.comp)}</td>
                          <td className="px-1 py-1.5 text-center" />
                          <td className={cn("px-1 py-1.5 text-center tabular-nums font-extrabold", totals.net < 0 ? "text-rose-400" : "text-emerald-400")}>{fmtH(totals.net)}</td>
                          <td className="px-1 py-1.5 text-center tabular-nums font-bold text-indigo-300">{fmtH(totals.personal)}</td>
                          <td className="px-1 py-1.5 text-center tabular-nums font-bold text-sky-300">{fmtH(totals.missionPermit)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  )}

                  {/* Cards view */}
                  {tblView === "cards" && (
                    <div className="p-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                      {monthRows.map(({ day, att }) => {
                        const dowFull = DAYS_FULL[new Date(year, month, day).getDay()];
                        const dateStr = `${String(day).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}`;
                        const future = isFutureDay(day);
                        const cfg = STATUS_CONFIG[att.status];
                        const isWorking = ["present", "late"].includes(att.status);

                        if (att.status === "weekly_leave") {
                          return (
                            <div key={day} className="rounded-xl bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-300 p-2 flex flex-col items-center justify-center gap-0.5 min-h-[92px]">
                              <span className="text-[11px] font-bold">{dowFull} {dateStr}</span>
                              <span className="text-[10px] font-bold opacity-90">راحة أسبوعية</span>
                            </div>
                          );
                        }

                        return (
                          <div key={day} className={cn("rounded-xl border p-2 min-h-[92px] flex flex-col", future ? "opacity-40 border-neutral-100 dark:border-neutral-700" : cn(cfg.border, cfg.bg))}>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-100 truncate">{dowFull} <span className="text-neutral-400 dark:text-neutral-500 font-normal">{dateStr}</span></span>
                              {!future && <svg className={cn("w-2 h-2 shrink-0", cfg.color)} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="12" /></svg>}
                            </div>
                            {future ? (
                              <span className="text-[11px] text-neutral-300 dark:text-neutral-600 m-auto">—</span>
                            ) : isWorking ? (
                              <div className="space-y-0.5 text-[10px] flex-1">
                                <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">دخول</span><span className="font-bold tabular-nums text-emerald-700 dark:text-emerald-400">{to12(att.inMin)}</span></div>
                                <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">خروج</span><span className="font-bold tabular-nums text-rose-700 dark:text-rose-400">{to12(att.outMin)}</span></div>
                                <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">فعلي</span><span className="font-extrabold tabular-nums text-neutral-800 dark:text-neutral-100">{fmtH(att.actualH)}</span></div>
                                <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">صافي</span><span className={cn("font-extrabold tabular-nums", att.netH < -0.01 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400")}>{fmtH(att.netH)}</span></div>
                              </div>
                            ) : (
                              <span className={cn("text-[11px] font-bold m-auto", cfg.color)}>{cfg.label}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Single view */}
                  {tblView === "single" && (
                    <div className="p-2 space-y-2">
                      {monthRows.map(({ day, att }) => {
                        const dowFull = DAYS_FULL[new Date(year, month, day).getDay()];
                        const dateStr = `${String(day).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}/${year}`;
                        const future = isFutureDay(day);
                        const cfg = STATUS_CONFIG[att.status];
                        const isWorking = ["present", "late"].includes(att.status);

                        if (att.status === "weekly_leave") {
                          return (
                            <div key={day} className="rounded-xl bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-300 px-3 py-2 flex items-center justify-between">
                              <span className="text-[12px] font-bold">{dowFull} — {dateStr}</span>
                              <span className="text-[11px] font-bold opacity-90">راحة أسبوعية</span>
                            </div>
                          );
                        }

                        return (
                          <div key={day} className={cn("rounded-xl border overflow-hidden", future ? "opacity-40 border-neutral-100 dark:border-neutral-700" : cfg.border)}>
                            <div className={cn("px-3 py-2 flex items-center justify-between", future ? "bg-neutral-50 dark:bg-neutral-700/30" : cfg.bg)}>
                              <span className="text-[12px] font-bold text-neutral-800 dark:text-neutral-100">{dowFull} — {dateStr}</span>
                              <span className={cn("text-[11px] font-bold", future ? "text-neutral-300 dark:text-neutral-600" : cfg.color)}>{future ? "—" : cfg.label}</span>
                            </div>
                            {!future && isWorking && (
                              <div className="divide-y divide-neutral-50 dark:divide-neutral-700/60 bg-white dark:bg-neutral-800">
                                {[
                                  { label: "الدخول", value: to12(att.inMin), cls: "text-emerald-700 dark:text-emerald-400 font-bold" },
                                  { label: "الخروج", value: to12(att.outMin), cls: "text-rose-700 dark:text-rose-400 font-bold" },
                                  { label: "تأخير الدخول", value: fmtH(att.delayInH), cls: att.delayInH > 0.01 ? "text-amber-600 dark:text-amber-400 font-bold" : "text-neutral-400 dark:text-neutral-500" },
                                  { label: "الساعات الفعلية", value: fmtH(att.actualH), cls: "text-neutral-800 dark:text-neutral-100 font-extrabold" },
                                  { label: "الدوام الرسمي", value: "8.00", cls: "text-neutral-500 dark:text-neutral-400" },
                                  { label: "التأخير الكلي", value: fmtH(att.totalDelayH), cls: att.totalDelayH > 0.01 ? "text-rose-600 dark:text-rose-400 font-bold" : "text-neutral-400 dark:text-neutral-500" },
                                  { label: "التعويض", value: fmtH(att.compH), cls: att.compH > 0.01 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-neutral-400 dark:text-neutral-500" },
                                  { label: "الصافي", value: fmtH(att.netH), cls: att.netH < -0.01 ? "text-rose-600 dark:text-rose-400 font-extrabold" : "text-emerald-600 dark:text-emerald-400 font-extrabold" },
                                  { label: "استئذان شخصي", value: fmtH(att.personalPermitH), cls: att.personalPermitH > 0.01 ? "text-indigo-600 dark:text-indigo-400 font-semibold" : "text-neutral-400 dark:text-neutral-500" },
                                ].map(r => (
                                  <div key={r.label} className="px-3 py-1.5 flex justify-between items-center">
                                    <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{r.label}</span>
                                    <span className={cn("text-[11px] tabular-nums", r.cls)}>{r.value}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {!future && !isWorking && (
                              <div className="px-3 py-2 bg-white dark:bg-neutral-800">
                                <p className={cn("text-[11px] font-bold text-center", cfg.color)}>
                                  {att.status === "mission" ? "مهمة عمل خارجية — تحتسب 8.00 ساعات" :
                                   att.status === "absent" ? "غياب كامل — يخصم 8.00 ساعات" : cfg.label}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Totals footer */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-px bg-neutral-100 dark:bg-neutral-700 border-t border-neutral-100 dark:border-neutral-700">
                    {[
                      { label: "ساعات الدوام المطلوبة", value: fmtH(totals.required), color: "text-neutral-800 dark:text-neutral-100" },
                      { label: "ساعات الدوام الفعلي", value: fmtH(totals.actual), color: "text-emerald-600 dark:text-emerald-400" },
                      { label: "ساعات الغياب", value: fmtH(totals.absenceH), color: totals.absenceH < 0 ? "text-rose-600 dark:text-rose-400" : "text-neutral-800 dark:text-neutral-100" },
                      { label: "الاستئذان الشخصي", value: fmtH(totals.personal), color: "text-indigo-600 dark:text-indigo-400" },
                      { label: "استئذان مهام عمل", value: fmtH(totals.missionPermit), color: "text-sky-600 dark:text-sky-400" },
                      { label: "الصافي النهائي", value: fmtH(totals.net), color: totals.net < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400" },
                      { label: "غياب الأيام الكاملة", value: String(totals.fullAbsences), color: totals.fullAbsences > 0 ? "text-rose-600 dark:text-rose-400" : "text-neutral-800 dark:text-neutral-100" },
                    ].map(t => (
                      <div key={t.label} className="bg-white dark:bg-neutral-800 px-2 py-1.5 text-center">
                        <p className="text-[9px] font-bold text-neutral-500 dark:text-neutral-400 mb-0.5">{t.label}</p>
                        <p className={cn("text-[13px] font-extrabold tabular-nums", t.color)}>{t.value}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
          )}
        </div>
      </div>

      {/* ── Day Detail Bottom Sheet ── */}
      {dayDetail !== null && showroom && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setDayDetail(null)}>
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 rounded-t-2xl border-t border-x border-neutral-100 dark:border-neutral-700 shadow-xl max-w-2xl mx-auto max-h-[85vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()} dir="rtl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-800 dark:text-white">حركة يوم {dayDetail} {MONTHS_AR[month]} {year}</h3>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{showroom}</p>
                </div>
              </div>
              <button onClick={() => setDayDetail(null)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                <X className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              </button>
            </div>

            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {visibleEmps.map(emp => {
                const att = getDayAttendance(emp, year, month, dayDetail);
                const cfg = STATUS_CONFIG[att.status];
                const SIcon = cfg.icon;
                const isWorking = ["present", "late"].includes(att.status);

                return (
                  <div key={emp} className={cn("rounded-2xl border overflow-hidden", cfg.border)}>
                    <div className={cn("flex items-center justify-between px-3 py-2.5", cfg.bg)}>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 bg-white/70 dark:bg-neutral-800/70", cfg.color)}>
                          {emp.split(" ")[0][0]}
                        </div>
                        <span className="text-[13px] font-bold text-neutral-800 dark:text-neutral-100 truncate">{emp}</span>
                      </div>
                      <span className={cn("flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-white/70 dark:bg-neutral-800/70", cfg.color)}>
                        <SIcon className="w-3.5 h-3.5" /> {cfg.label}
                      </span>
                    </div>

                    {isWorking ? (
                      <div className="p-3 space-y-2 bg-white dark:bg-neutral-800">
                        {/* Movement timeline */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-900/25 flex items-center justify-center shrink-0">
                              <LogIn className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            </span>
                            <span className="text-[12px] font-bold text-neutral-700 dark:text-neutral-200">حضور</span>
                            <span className="text-[12px] font-bold tabular-nums text-emerald-700 dark:text-emerald-400 mr-auto">{to12(att.inMin)}</span>
                          </div>
                          {att.personalPermitH > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900/25 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                              </span>
                              <span className="text-[12px] font-bold text-neutral-700 dark:text-neutral-200">استئذان شخصي</span>
                              <span className="text-[12px] font-bold tabular-nums text-indigo-600 dark:text-indigo-400 mr-auto">{fmtH(att.personalPermitH)} ساعة</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-900/25 flex items-center justify-center shrink-0">
                              <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                            </span>
                            <span className="text-[12px] font-bold text-neutral-700 dark:text-neutral-200">انصراف</span>
                            <span className="text-[12px] font-bold tabular-nums text-rose-600 dark:text-rose-400 mr-auto">{to12(att.outMin)}</span>
                          </div>
                        </div>
                        {/* Metrics */}
                        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-700">
                          {[
                            { label: "الساعات الفعلية", value: fmtH(att.actualH), color: "text-neutral-800 dark:text-neutral-100" },
                            { label: "تأخير الدخول", value: fmtH(att.delayInH), color: att.delayInH > 0 ? "text-amber-600 dark:text-amber-400" : "text-neutral-500 dark:text-neutral-400" },
                            { label: "التعويض", value: fmtH(att.compH), color: att.compH > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-500 dark:text-neutral-400" },
                            { label: "الصافي", value: fmtH(att.netH), color: att.netH < -0.01 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400" },
                          ].map(m => (
                            <div key={m.label} className="text-center rounded-lg bg-neutral-50 dark:bg-neutral-700/40 px-1 py-1.5">
                              <p className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 mb-0.5">{m.label}</p>
                              <p className={cn("text-[11px] font-extrabold tabular-nums", m.color)}>{m.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-white dark:bg-neutral-800">
                        <p className={cn("text-[12px] font-bold text-center", cfg.color)}>
                          {att.status === "mission" ? "مهمة عمل خارجية — تحتسب 8.00 ساعات" :
                           att.status === "absent" ? "غياب كامل — يخصم 8.00 ساعات" : cfg.label}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Column filter portal (all-employees table) ── */}
      {allFilterCol && allFilterRect && createPortal(
        <>
          <div className="fixed inset-0 z-[99]" onClick={() => { setAllFilterCol(null); setAllFilterRect(null); }} />
          <div dir="rtl" className="fixed z-[100] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-2xl p-3 w-52"
            style={{ top: allFilterRect.bottom + 6, right: Math.max(8, window.innerWidth - allFilterRect.right) }}>
            <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-2 pb-1.5 border-b border-neutral-100 dark:border-neutral-700">
              {allCols.find(c => c.key === allFilterCol)?.num ? "تصفية الأرقام" : "بحث في العمود"} — {allCols.find(c => c.key === allFilterCol)?.label}
            </p>
            {allCols.find(c => c.key === allFilterCol)?.num ? (
              <div className="space-y-2">
                <div>
                  <label className="text-[12px] text-neutral-400 block mb-0.5">أكبر من أو يساوي</label>
                  <input type="number" dir="ltr" placeholder="0"
                    className="w-full border border-neutral-200 dark:border-neutral-600 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-neutral-400"
                    value={(allFilters[allFilterCol] as any)?.min ?? ""}
                    onChange={e => setAllFilters(prev => ({ ...prev, [allFilterCol]: { min: e.target.value, max: (prev[allFilterCol] as any)?.max ?? "" } }))} />
                </div>
                <div>
                  <label className="text-[12px] text-neutral-400 block mb-0.5">أصغر من أو يساوي</label>
                  <input type="number" dir="ltr" placeholder="∞"
                    className="w-full border border-neutral-200 dark:border-neutral-600 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-neutral-400"
                    value={(allFilters[allFilterCol] as any)?.max ?? ""}
                    onChange={e => setAllFilters(prev => ({ ...prev, [allFilterCol]: { min: (prev[allFilterCol] as any)?.min ?? "", max: e.target.value } }))} />
                </div>
              </div>
            ) : (
              <input type="text" placeholder="ابحث..." autoFocus
                className="w-full border border-neutral-200 dark:border-neutral-600 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-neutral-400"
                value={(allFilters[allFilterCol] as any)?.value ?? ""}
                onChange={e => setAllFilters(prev => ({ ...prev, [allFilterCol]: { value: e.target.value } }))} />
            )}
            {isAllFilterActive(allFilterCol) && (
              <button onClick={() => { setAllFilters(prev => { const n = { ...prev }; delete n[allFilterCol]; return n; }); setAllFilterCol(null); setAllFilterRect(null); }}
                className="mt-2 w-full text-[12px] text-red-500 hover:text-red-700 text-right py-0.5">
                × مسح هذا الفلتر
              </button>
            )}
          </div>
        </>,
        document.body
      )}
    </>
  );
}
