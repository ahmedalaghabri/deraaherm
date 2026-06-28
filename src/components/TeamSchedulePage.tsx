import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft, ChevronRight,
  Calendar as CalendarIcon, Clock,
  Sun, Moon, Umbrella, AlertTriangle,
  Heart, Award, RotateCcw, X, Pencil
} from "lucide-react";
import { cn } from "../lib/utils";

const EMPLOYEES = [
  { id: "e1", name: "محمد عبدالله" },
  { id: "e2", name: "خالد سعد الشمري" },
  { id: "e3", name: "فهد ناصر العنزي" },
  { id: "e4", name: "عبدالرحمن صالح" },
];

const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

const DAYS_SHORT = ["سبت", "أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة"];

type EmployeeStatus =
  | "present" | "absent" | "weekly_leave" | "annual_leave"
  | "sick_leave" | "emergency_leave" | "compensatory" | "cover";

interface ShiftTimes { start: string; end: string; }

interface EmployeeDayRecord {
  status: EmployeeStatus;
  shiftType: "single" | "double";
  shift1: ShiftTimes;
  shift2?: ShiftTimes;
}

type DayScheduleMap = Record<string, EmployeeDayRecord>;
type MonthScheduleMap = Record<string, DayScheduleMap>;

const STATUS_CONFIG: Record<EmployeeStatus, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  present:      { label: "دوام", icon: Sun, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" },
  absent:       { label: "غياب", icon: Moon, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200" },
  weekly_leave: { label: "راحة أسبوعية", icon: CalendarIcon, color: "text-slate-400", bg: "bg-slate-50", border: "border-slate-200" },
  annual_leave: { label: "إجازة سنوية", icon: Umbrella, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
  sick_leave:   { label: "إجازة مرضية", icon: Heart, color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
  emergency_leave: { label: "إجازة طارئة", icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
  compensatory: { label: "يوم تعويضي", icon: RotateCcw, color: "text-violet-500", bg: "bg-violet-50", border: "border-violet-200" },
  cover:        { label: "تغطية", icon: Award, color: "text-sky-500", bg: "bg-sky-50", border: "border-sky-200" },
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

interface TeamSchedulePageProps {
  selectedShowroom: string;
}

export default function TeamSchedulePage({ selectedShowroom }: TeamSchedulePageProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showroomShiftStart, setShowroomShiftStart] = useState(9);
  const [showroomShiftEnd, setShowroomShiftEnd] = useState(22);

  const [schedules, setSchedules] = useState<MonthScheduleMap>({});

  const daysInMonth = getDaysInMonth(year, month);
  const dayKey = selectedDay ? `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}` : "";
  const daySchedule: DayScheduleMap = useMemo(() => dayKey ? (schedules[dayKey] || {}) : {}, [schedules, dayKey]);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null); setSelectedEmployeeId(null); setSelectedHour(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null); setSelectedEmployeeId(null); setSelectedHour(null);
  };

  const getEmployeeRecord = (empId: string): EmployeeDayRecord => {
    return daySchedule[empId] || { status: "present", shiftType: "single", shift1: { start: "09:00", end: "17:00" } };
  };

  const setEmployeeRecord = (empId: string, record: EmployeeDayRecord) => {
    if (!selectedDay) return;
    setSchedules(prev => {
      const existing = prev[dayKey] || {};
      return { ...prev, [dayKey]: { ...existing, [empId]: record } };
    });
  };

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = (firstDayOfMonth + 1) % 7;

  const statusList: EmployeeStatus[] = [
    "present", "absent", "weekly_leave", "annual_leave",
    "sick_leave", "emergency_leave", "compensatory", "cover"
  ];

  const displayDay = selectedDay || (today.getMonth() === month && today.getFullYear() === year ? today.getDate() : 1);
  const displayDayKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(displayDay).padStart(2, "0")}`;
  const displayDaySched = schedules[displayDayKey];
  const displayDayIsFuture = year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth()) || (year === today.getFullYear() && month === today.getMonth() && displayDay > today.getDate());
  const displayDayEmpty = displayDayIsFuture && !displayDaySched;

  const getHourlyPresence = () => {
    const hours: { hour: number; count: number }[] = [];
    for (let h = 9; h <= 24; h++) {
      if (displayDayEmpty) {
        hours.push({ hour: h, count: 0 });
        continue;
      }
      let count = 0;
      EMPLOYEES.forEach((emp) => {
        const rec = displayDaySched?.[emp.id] || { status: "present", shiftType: "single", shift1: { start: "09:00", end: "17:00" } };
        if (["absent", "weekly_leave", "annual_leave", "sick_leave", "emergency_leave"].includes(rec.status)) return;
        const s1 = parseInt(rec.shift1.start.split(":")[0]);
        const e1 = parseInt(rec.shift1.end.split(":")[0]);
        if (h >= s1 && h < e1) count++;
        if (rec.shift2) {
          const s2 = parseInt(rec.shift2.start.split(":")[0]);
          const e2 = parseInt(rec.shift2.end.split(":")[0]);
          if (h >= s2 && h < e2) count++;
        }
      });
      hours.push({ hour: h, count });
    }
    return hours;
  };

  const hourlyData = getHourlyPresence();
  const maxCount = EMPLOYEES.length;

  const hourColor = (count: number) => {
    if (count === 0) return { bar: "bg-neutral-300", bg: "bg-neutral-50", text: "text-neutral-400", border: "border-neutral-200" };
    if (count === maxCount) return { bar: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
    if (count >= 2) return { bar: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
    if (count === 1) return { bar: "bg-orange-500", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" };
    return { bar: "bg-rose-400", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" };
  };

  const firstActiveHour = hourlyData.find(h => h.count > 0)?.hour ?? 9;

  const to12Hour = (h: number) => {
    const period = h >= 12 ? "م" : "ص";
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour12}:00 ${period}`;
  };

  const to12HourShift = (time24: string) => {
    const [hStr] = time24.split(":");
    const h = parseInt(hStr);
    const period = h >= 12 ? "م" : "ص";
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour12}:00 ${period}`;
  };

  return (
    <>
    <div dir="rtl" className="min-h-screen font-sans">
      <div className="max-w-full mx-auto px-0 sm:px-0 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="w-full">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-neutral-100 dark:border-neutral-700">
              <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                <ChevronRight className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              </button>
              <div className="text-center">
                <span className="text-base font-bold text-neutral-800 dark:text-neutral-200">{MONTHS_AR[month]} {year}</span>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">اختر يوماً لتحديد الدوام</p>
              </div>
              <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                <ChevronLeft className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              </button>
            </div>
            {/* Day names header — hidden on mobile */}
            <div className="hidden sm:grid grid-cols-7 gap-1 sm:gap-2 px-1 sm:px-2 pt-2 pb-1">
              {DAYS_SHORT.map(d => (
                <div key={d} className="text-center py-1.5 text-[10px] sm:text-xs font-bold text-neutral-400 dark:text-neutral-500">{d}</div>
              ))}
            </div>
            {/* Calendar days grid — 2 cols mobile, 7 cols desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-7 gap-1 sm:gap-2 p-1 sm:p-2">
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="hidden sm:block min-h-[82px] sm:min-h-[132px] rounded-xl" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
                const isFuture = year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth()) || (year === today.getFullYear() && month === today.getMonth() && day > today.getDate());
                const dayName = DAYS_SHORT[(new Date(year, month, day).getDay() + 1) % 7];
                if (!selectedShowroom) {
                  return (
                    <div
                      key={day}
                      className={cn(
                        "min-h-[82px] sm:min-h-[132px] p-4 sm:p-6 rounded-xl border transition-all text-right relative flex flex-col justify-between shadow-sm overflow-hidden opacity-40",
                        isToday
                          ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800"
                          : "bg-neutral-50 dark:bg-neutral-800/50 border-neutral-100 dark:border-neutral-700"
                      )}
                    >
                      <div className="flex items-center justify-end gap-1 mt-0.5 sm:gap-1.5 sm:mt-1">
                        <span className="text-[10px] font-bold text-neutral-300 dark:text-neutral-600">{dayName}</span>
                        <span className="text-lg sm:text-xl font-extrabold leading-none text-neutral-300 dark:text-neutral-600">{day}</span>
                      </div>
                    </div>
                  );
                }
                const dk = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const daySched = schedules[dk];
                const isSelected = selectedDay === day;
                const hasSchedule = !!daySched;
                const getRecordForDay = (empId: string): EmployeeDayRecord => {
                  return daySched?.[empId] || { status: "present", shiftType: "single", shift1: { start: "09:00", end: "17:00" } };
                };
                return (
                  <div
                    key={day}
                    className={cn(
                      "min-h-[82px] sm:min-h-[132px] p-4 sm:p-6 rounded-xl border transition-all text-right relative flex flex-col justify-between shadow-sm overflow-hidden",
                      isSelected
                        ? "bg-white dark:bg-neutral-800 border-indigo-400 dark:border-indigo-500"
                        : isToday
                          ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                          : isFuture && !hasSchedule
                            ? "bg-neutral-50/70 dark:bg-neutral-800/40 border-neutral-200/70 dark:border-neutral-700/50 opacity-70"
                            : "bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700"
                    )}
                  >
                    {/* Edit icon */}
                    {!isFuture && (
                      <button
                        onClick={() => { setSelectedDay(day); setSelectedEmployeeId(EMPLOYEES[0].id); setModalOpen(true); }}
                        className="absolute top-1 right-1 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors z-10"
                      >
                        <Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-neutral-400 dark:text-neutral-500" />
                      </button>
                    )}
                    {/* Top accent strip */}
                    <div className={cn(
                      "absolute top-0 left-0 right-0 h-1",
                      isSelected ? "bg-indigo-500" : isToday ? "bg-amber-500" : "bg-neutral-200 dark:bg-neutral-600"
                    )} />
                    {/* Day name + big day number */}
                    <div className="flex items-center justify-end gap-1 mt-0.5 sm:gap-1.5 sm:mt-1">
                      <span className={cn(
                        "text-[10px] font-bold",
                        isSelected ? "text-indigo-400 dark:text-indigo-500" :
                        isToday ? "text-amber-400 dark:text-amber-500" :
                        "text-neutral-400 dark:text-neutral-500"
                      )}>
                        {dayName}
                      </span>
                      <span className={cn(
                        "text-lg sm:text-xl font-extrabold leading-none",
                        isSelected ? "text-indigo-600 dark:text-indigo-400" :
                        isToday ? "text-amber-600 dark:text-amber-400" :
                        "text-neutral-700 dark:text-neutral-200"
                      )}>
                        {day}
                      </span>
                    </div>
                    {isFuture && !hasSchedule ? (
                      <div className="flex items-center justify-center mt-auto">
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500">لم تجدول بعد</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 sm:gap-2 mt-auto">
                        {EMPLOYEES.map((emp) => {
                          const rec = getRecordForDay(emp.id);
                          const sCfg = STATUS_CONFIG[rec.status];
                          const isWorking = ["present", "cover", "compensatory"].includes(rec.status);
                          const timeLabel = isWorking
                            ? (rec.shiftType === "double"
                                ? `${to12HourShift(rec.shift1.start)}–${to12HourShift(rec.shift1.end)}|${to12HourShift(rec.shift2!.start)}–${to12HourShift(rec.shift2!.end)}`
                                : `${to12HourShift(rec.shift1.start)}–${to12HourShift(rec.shift1.end)}`)
                            : sCfg.label;
                          return (
                            <div key={emp.id} className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1 min-w-0">
                                <svg className={cn("w-1 h-1 sm:w-1.5 sm:h-1.5 shrink-0", sCfg.color)} viewBox="0 0 24 24" fill="currentColor">
                                  <circle cx="12" cy="12" r="12" />
                                </svg>
                                <span className={cn("text-[10px] font-bold truncate px-0.5 py-0 sm:px-1 sm:py-0.5 rounded text-neutral-700 dark:text-neutral-200", sCfg.bg)}>{(() => { const parts = emp.name.split(" "); return parts.length > 2 ? `${parts[0]} ${parts[parts.length - 1]}` : emp.name; })()}</span>
                              </div>
                              <span className={cn("text-[9px] shrink-0", isWorking ? "text-neutral-400 dark:text-neutral-500" : sCfg.color)}>{timeLabel}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Monthly Timeline Card — hours as rows, days as columns */}
      {selectedShowroom && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="w-full">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-neutral-100 dark:border-neutral-700">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800 dark:text-white">المخطط الزمني للشهر</h3>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500">{MONTHS_AR[month]} {year} — التغطية الساعية</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">دوام المعرض الافتراضي:</span>
                  <select
                    value={showroomShiftStart}
                    onChange={e => setShowroomShiftStart(parseInt(e.target.value))}
                    className="text-[11px] font-bold px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>{to12Hour(i)}</option>
                    ))}
                  </select>
                  <span className="text-[11px] text-neutral-400">—</span>
                  <select
                    value={showroomShiftEnd}
                    onChange={e => setShowroomShiftEnd(parseInt(e.target.value))}
                    className="text-[11px] font-bold px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>{to12Hour(i)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-max">
                {/* Header row — day numbers */}
                <div className="flex border-b border-neutral-100 dark:border-neutral-700">
                  <div className="sticky right-0 z-10 w-20 shrink-0 bg-white dark:bg-neutral-800 border-l border-neutral-100 dark:border-neutral-700 px-1 py-3 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 flex items-center justify-center">
                    الساعة \ اليوم
                  </div>
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
                    const dayName = DAYS_SHORT[(new Date(year, month, day).getDay() + 1) % 7];
                    return (
                      <div
                        key={day}
                        className={cn(
                          "w-10 sm:w-12 shrink-0 text-center py-2 border-l border-neutral-50 dark:border-neutral-700/50",
                          isToday ? "bg-amber-50 dark:bg-amber-900/20" : ""
                        )}
                      >
                        <span className={cn("text-[12px] font-bold block", isToday ? "text-amber-600 dark:text-amber-400" : "text-neutral-500 dark:text-neutral-400")}>{day}</span>
                        <span className={cn("text-[10px] block", isToday ? "text-amber-500 dark:text-amber-400" : "text-neutral-400 dark:text-neutral-500")}>{dayName}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Hour rows — filtered to showroom shift */}
                {Array.from({ length: 24 }).map((_, h) => h).filter(h => h >= showroomShiftStart && h <= showroomShiftEnd).map(h => (
                  <div key={h} className="flex border-b border-neutral-50 dark:border-neutral-700/50 last:border-b-0">
                    <div className={cn(
                      "sticky right-0 z-10 w-20 shrink-0 bg-white dark:bg-neutral-800 border-l border-neutral-100 dark:border-neutral-700 px-1 py-2 flex items-center justify-center",
                      h >= 6 && h <= 22 ? "" : "bg-neutral-50/50 dark:bg-neutral-700/20"
                    )}>
                      <span className={cn(
                        "text-[11px] font-bold",
                        h >= 6 && h <= 22 ? "text-neutral-600 dark:text-neutral-300" : "text-neutral-400 dark:text-neutral-500"
                      )}>
                        {to12Hour(h)}
                      </span>
                    </div>
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dk = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const daySched = schedules[dk];
                      let count = 0;
                      EMPLOYEES.forEach((emp) => {
                        const rec = daySched?.[emp.id] || { status: "present", shiftType: "single", shift1: { start: "09:00", end: "17:00" } };
                        if (["absent", "weekly_leave", "annual_leave", "sick_leave", "emergency_leave"].includes(rec.status)) return;
                        const s1 = parseInt(rec.shift1.start.split(":")[0]);
                        const e1 = parseInt(rec.shift1.end.split(":")[0]);
                        if (h >= s1 && h < e1) count++;
                        if (rec.shift2) {
                          const s2 = parseInt(rec.shift2.start.split(":")[0]);
                          const e2 = parseInt(rec.shift2.end.split(":")[0]);
                          if (h >= s2 && h < e2) count++;
                        }
                      });
                      const colors = hourColor(count);
                      const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
                      return (
                        <div
                          key={day}
                          className={cn(
                            "w-10 sm:w-12 shrink-0 flex items-center justify-center py-2 border-l border-neutral-50 dark:border-neutral-700/50",
                            isToday ? "ring-1 ring-inset ring-amber-200 dark:ring-amber-800" : "",
                            count > 0 ? colors.bg : "bg-neutral-50/30 dark:bg-neutral-800/20"
                          )}
                          title={`${day} ${MONTHS_AR[month]} الساعة ${to12Hour(h)} — ${count} موظف`}
                        >
                          {count > 0 && (
                            <span className={cn("text-[11px] font-bold", colors.text)}>{count}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
    </div>

    {/* Day bottom sheet */}
    {modalOpen && selectedDay && (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="absolute bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 rounded-t-2xl border-t border-x border-neutral-100 dark:border-neutral-700 shadow-xl max-w-2xl mx-auto max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-800 dark:text-white">يوم {selectedDay} {MONTHS_AR[month]} {year}</h3>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500">{selectedShowroom}</p>
              </div>
            </div>
            <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
              <X className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            </button>
          </div>

          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
{/* Employee selection card */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden flex flex-col">
            <div className="px-3 py-2.5 border-b border-neutral-100 dark:border-neutral-700">
              <h3 className="text-sm font-bold text-neutral-800 dark:text-white">الموظفين</h3>
            </div>
            <div className="p-2 grid grid-cols-1 gap-1.5 max-h-[220px] overflow-y-auto">
              {EMPLOYEES.map((emp) => {
                const isSelected = selectedEmployeeId === emp.id;
                const rec = getEmployeeRecord(emp.id);
                const sCfg = STATUS_CONFIG[rec.status];
                const isWorking = ["present", "cover", "compensatory"].includes(rec.status);
                const shiftLabel = !isWorking
                  ? sCfg.label
                  : rec.shiftType === "double"
                    ? `${to12HourShift(rec.shift1.start)} – ${to12HourShift(rec.shift1.end)} | ${to12HourShift(rec.shift2!.start)} – ${to12HourShift(rec.shift2!.end)}`
                    : `${to12HourShift(rec.shift1.start)} – ${to12HourShift(rec.shift1.end)}`;
                return (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedEmployeeId(emp.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-1.5 py-1.5 rounded-xl border text-right transition-all",
                      isSelected
                        ? "border-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-indigo-200"
                        : "border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700/30 hover:border-neutral-200"
                    )}
                  >
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0", sCfg.bg, sCfg.color)}>
                      {emp.name.split(" ")[0][0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-bold truncate text-neutral-700 dark:text-neutral-200">{emp.name}</p>
                      <p className={cn("text-[10px] truncate", sCfg.color)}>{shiftLabel}</p>
                    </div>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status selection card */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden flex flex-col">
            <div className="px-3 py-2.5 border-b border-neutral-100 dark:border-neutral-700">
              <h3 className="text-sm font-bold text-neutral-800 dark:text-white">حالة الدوام</h3>
            </div>
            <div className="p-2 grid grid-cols-3 gap-1.5">
              {statusList.map((statusKey) => {
                const sCfg = STATUS_CONFIG[statusKey];
                const SIcon = sCfg.icon;
                const isActive = selectedEmployeeId ? getEmployeeRecord(selectedEmployeeId).status === statusKey : false;
                return (
                  <button
                    key={statusKey}
                    disabled={!selectedDay || !selectedEmployeeId}
                    onClick={() => {
                      if (!selectedEmployeeId) return;
                      const rec = getEmployeeRecord(selectedEmployeeId);
                      setEmployeeRecord(selectedEmployeeId, { ...rec, status: statusKey });
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1 px-1 py-2 rounded-xl border text-[12px] font-bold transition-all disabled:opacity-40",
                      isActive
                        ? `${sCfg.bg} ${sCfg.color} ${sCfg.border} ring-1`
                        : "bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50"
                    )}
                  >
                    <SIcon className="w-4 h-4" />
                    <span className="leading-none">{sCfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shift configuration card */}
          {selectedDay && selectedEmployeeId && (
            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden flex flex-col">
              <div className="px-3 py-2.5 border-b border-neutral-100 dark:border-neutral-700">
                <h3 className="text-sm font-bold text-neutral-800 dark:text-white">فترة الدوام</h3>
              </div>
              {(() => {
                const rec = getEmployeeRecord(selectedEmployeeId);
                const isPresent = rec.status === "present";
                if (!isPresent) {
                  return (
                    <div className="p-3 text-center">
                      <p className="text-[11px] text-neutral-400 dark:text-neutral-500">لا يوجد دوام — الحالة: {STATUS_CONFIG[rec.status].label}</p>
                    </div>
                  );
                }
                return (
                  <div className="p-2 space-y-2">
                    {/* Shift type toggle */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEmployeeRecord(selectedEmployeeId, { ...rec, shiftType: "single" })}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-all",
                          rec.shiftType === "single" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white dark:bg-neutral-800 text-neutral-500 border-neutral-200 dark:border-neutral-600"
                        )}
                      >فترة واحدة</button>
                      <button
                        onClick={() => setEmployeeRecord(selectedEmployeeId, { ...rec, shiftType: "double", shift2: rec.shift2 || { start: "17:00", end: "22:00" } })}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-all",
                          rec.shiftType === "double" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white dark:bg-neutral-800 text-neutral-500 border-neutral-200 dark:border-neutral-600"
                        )}
                      >فترتين</button>
                    </div>
                    {/* Shift 1 times */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-neutral-400">الفترة الأولى</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-neutral-400 w-5">من</span>
                          <input
                            type="time"
                            value={rec.shift1.start}
                            onChange={e => setEmployeeRecord(selectedEmployeeId, { ...rec, shift1: { ...rec.shift1, start: e.target.value } })}
                            className="flex-1 px-1.5 py-1 text-xs rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-neutral-400 w-5">إلى</span>
                          <input
                            type="time"
                            value={rec.shift1.end}
                            onChange={e => setEmployeeRecord(selectedEmployeeId, { ...rec, shift1: { ...rec.shift1, end: e.target.value } })}
                            className="flex-1 px-1.5 py-1 text-xs rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Shift 2 times */}
                    {rec.shiftType === "double" && rec.shift2 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-neutral-400">الفترة الثانية</p>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-neutral-400 w-5">من</span>
                            <input
                              type="time"
                              value={rec.shift2.start}
                              onChange={e => setEmployeeRecord(selectedEmployeeId, { ...rec, shift2: { start: e.target.value, end: rec.shift2!.end } })}
                              className="flex-1 px-1.5 py-1 text-xs rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-neutral-400 w-5">إلى</span>
                            <input
                              type="time"
                              value={rec.shift2.end}
                              onChange={e => setEmployeeRecord(selectedEmployeeId, { ...rec, shift2: { start: rec.shift2!.start, end: e.target.value } })}
                              className="flex-1 px-1.5 py-1 text-xs rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Hourly distribution card — smooth area chart */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-800 dark:text-white">توزيع الدوام بالساعة</h3>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500">يوم {displayDay} {MONTHS_AR[month]} {year}</p>
                </div>
              </div>
              {selectedShowroom && (
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">{selectedShowroom}</p>
              )}
            </div>
            <div className="p-3 flex-1 min-h-[180px] flex flex-col">
              {(() => {
                const data = hourlyData;
                const width = data.length * 36;
                const height = 150;
                const max = maxCount || 1;
                const paddingX = 10;
                const paddingY = 24;
                const chartW = width - paddingX * 2;
                const chartH = height - paddingY * 2;
                const getX = (i: number) => paddingX + (i / (data.length - 1)) * chartW;
                const getY = (count: number) => height - paddingY - (count / max) * chartH;
                // Build smooth bezier path
                let d = `M ${getX(0)} ${getY(data[0].count)}`;
                for (let i = 0; i < data.length - 1; i++) {
                  const x0 = getX(i);
                  const y0 = getY(data[i].count);
                  const x1 = getX(i + 1);
                  const y1 = getY(data[i + 1].count);
                  const cp1x = x0 + (x1 - x0) * 0.4;
                  const cp1y = y0;
                  const cp2x = x1 - (x1 - x0) * 0.4;
                  const cp2y = y1;
                  d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x1} ${y1}`;
                }
                const areaD = `${d} L ${getX(data.length - 1)} ${height} L ${getX(0)} ${height} Z`;
                return (
                  <div className="flex-1 overflow-x-auto">
                    <svg width={width} height={height} className="min-w-full" viewBox={`0 0 ${width} ${height}`}>
                      {/* Grid lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map(p => (
                        <line key={p} x1={paddingX} y1={height - paddingY - p * chartH} x2={width - paddingX} y2={height - paddingY - p * chartH} stroke="#e5e5e5" strokeWidth={0.5} strokeDasharray="2,2" />
                      ))}
                      {/* Area fill */}
                      <path d={areaD} fill="url(#areaGrad)" opacity={0.3} />
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      {/* Smooth line */}
                      <path d={d} fill="none" stroke="#6366f1" strokeWidth={2} strokeLinecap="round" />
                      {/* Data points */}
                      {data.map(({ hour, count }, i) => {
                        const cx = getX(i);
                        const cy = getY(count);
                        const isSelected = selectedHour === hour;
                        const countColor = count === maxCount ? "#10b981" : count >= 2 ? "#f59e0b" : count === 1 ? "#f97316" : "#a3a3a3";
                        return (
                          <g key={hour}>
                            {/* Large invisible hit area for easy clicking */}
                            <circle
                              cx={cx} cy={cy} r={18}
                              fill="transparent"
                              className="cursor-pointer"
                              onClick={() => setSelectedHour(isSelected ? null : hour)}
                            />
                            {/* Visible point */}
                            <circle
                              cx={cx} cy={cy} r={isSelected ? 6 : 4}
                              fill={isSelected ? "#6366f1" : "white"}
                              stroke="#6366f1" strokeWidth={2.5}
                              className="cursor-pointer"
                              onClick={() => setSelectedHour(isSelected ? null : hour)}
                            />
                            {/* Count badge background */}
                            <rect x={cx - 8} y={cy - 20} width={16} height={14} rx={7} fill={countColor} opacity={0.15} />
                            {/* Count number */}
                            <text x={cx} y={cy - 10} textAnchor="middle" className="text-[10px] font-extrabold" fill={countColor}>{count}</text>
                            {/* Hour label */}
                            <text x={cx} y={height - 2} textAnchor="middle" className="text-[8px]" fill="#a3a3a3">{to12Hour(hour).replace(" ", "")}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                );
              })()}
            </div>
            <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-700/20">
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 text-center">
                {displayDayEmpty ? "لم تجدول بعد" : `${hourlyData.find(h => h.hour === firstActiveHour)?.count ?? 0} موظفين مجدولين عند ${to12Hour(firstActiveHour)}`}
              </p>
            </div>
          </div>

          {/* Employee shifts summary — narrower */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-700">
              <h3 className="text-sm font-bold text-neutral-800 dark:text-white">
                {selectedHour !== null ? `موظفين الساعة ${to12Hour(selectedHour)}` : "أوقات الموظفين"}
              </h3>
            </div>
            <div className="p-2 space-y-1.5 max-h-[300px] overflow-y-auto">
              {(() => {
                if (displayDayEmpty) {
                  return (
                    <div className="text-center py-4">
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500">لم تجدول بعد</p>
                    </div>
                  );
                }
                const filtered = EMPLOYEES.filter((emp) => {
                  const rec = displayDaySched?.[emp.id] || { status: "present", shiftType: "single", shift1: { start: "09:00", end: "17:00" } };
                  if (selectedHour === null) return true;
                  const s1 = parseInt(rec.shift1.start.split(":")[0]);
                  const e1 = parseInt(rec.shift1.end.split(":")[0]);
                  if (selectedHour >= s1 && selectedHour < e1) return true;
                  if (rec.shift2) {
                    const s2 = parseInt(rec.shift2.start.split(":")[0]);
                    const e2 = parseInt(rec.shift2.end.split(":")[0]);
                    if (selectedHour >= s2 && selectedHour < e2) return true;
                  }
                  return false;
                });
                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-4">
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500">لا يوجد موظفين في هذه الساعة</p>
                    </div>
                  );
                }
                return filtered.map((emp) => {
                  const rec = displayDaySched?.[emp.id] || { status: "present", shiftType: "single", shift1: { start: "09:00", end: "17:00" } };
                  const sCfg = STATUS_CONFIG[rec.status];
                  const isWorking = ["present", "cover", "compensatory"].includes(rec.status);
                  const shiftText = !isWorking
                    ? sCfg.label
                    : rec.shiftType === "double"
                      ? `${to12HourShift(rec.shift1.start)} – ${to12HourShift(rec.shift1.end)} | ${to12HourShift(rec.shift2!.start)} – ${to12HourShift(rec.shift2!.end)}`
                      : `${to12HourShift(rec.shift1.start)} – ${to12HourShift(rec.shift1.end)}`;
                  const SIcon = sCfg.icon;
                  return (
                    <div key={emp.id} className="flex items-center justify-between px-2.5 py-1.5 rounded-xl border border-neutral-100 dark:border-neutral-700">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <SIcon className={cn("w-3 h-3 shrink-0", sCfg.color)} />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-neutral-700 dark:text-neutral-200 truncate">{emp.name}</p>
                          <p className={cn("text-[10px]", isWorking ? "text-neutral-400 dark:text-neutral-500" : sCfg.color)}>{shiftText}</p>
                        </div>
                      </div>
                      <span className={cn("text-[10px] font-bold px-1 py-0.5 rounded", sCfg.bg, sCfg.color)}>{sCfg.label}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
          </div>
        </motion.div>
      </div>
    )}
    </>
  );
}
