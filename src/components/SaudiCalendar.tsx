import { useState } from "react";
import { ChevronRight, ChevronLeft, Star, Info } from "lucide-react";
import { cn } from "../lib/utils";

const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];
const DAYS_AR = ["أح", "إث", "ثل", "أر", "خم", "جم", "سب"];

type HolidayType = "national" | "religious";
interface Holiday { date: string; name: string; type: HolidayType; }

const SAUDI_HOLIDAYS: Record<number, Holiday[]> = {
  2024: [
    { date: "2024-02-22", name: "يوم التأسيس",  type: "national"  },
    { date: "2024-04-10", name: "عيد الفطر",    type: "religious" },
    { date: "2024-04-11", name: "عيد الفطر",    type: "religious" },
    { date: "2024-04-12", name: "عيد الفطر",    type: "religious" },
    { date: "2024-06-16", name: "عيد الأضحى",   type: "religious" },
    { date: "2024-06-17", name: "عيد الأضحى",   type: "religious" },
    { date: "2024-06-18", name: "عيد الأضحى",   type: "religious" },
    { date: "2024-06-19", name: "عيد الأضحى",   type: "religious" },
    { date: "2024-09-23", name: "اليوم الوطني", type: "national"  },
  ],
  2025: [
    { date: "2025-02-22", name: "يوم التأسيس",  type: "national"  },
    { date: "2025-03-30", name: "عيد الفطر",    type: "religious" },
    { date: "2025-03-31", name: "عيد الفطر",    type: "religious" },
    { date: "2025-04-01", name: "عيد الفطر",    type: "religious" },
    { date: "2025-06-06", name: "عيد الأضحى",   type: "religious" },
    { date: "2025-06-07", name: "عيد الأضحى",   type: "religious" },
    { date: "2025-06-08", name: "عيد الأضحى",   type: "religious" },
    { date: "2025-06-09", name: "عيد الأضحى",   type: "religious" },
    { date: "2025-09-23", name: "اليوم الوطني", type: "national"  },
  ],
  2026: [
    { date: "2026-02-22", name: "يوم التأسيس",  type: "national"  },
    { date: "2026-03-19", name: "عيد الفطر",    type: "religious" },
    { date: "2026-03-20", name: "عيد الفطر",    type: "religious" },
    { date: "2026-03-21", name: "عيد الفطر",    type: "religious" },
    { date: "2026-05-26", name: "عيد الأضحى",   type: "religious" },
    { date: "2026-05-27", name: "عيد الأضحى",   type: "religious" },
    { date: "2026-05-28", name: "عيد الأضحى",   type: "religious" },
    { date: "2026-05-29", name: "عيد الأضحى",   type: "religious" },
    { date: "2026-09-23", name: "اليوم الوطني", type: "national"  },
  ],
};

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y: number, m: number)    { return new Date(y, m, 1).getDay(); }
function pad(n: number)                        { return String(n).padStart(2, "0"); }
function fmtDate(y: number, m: number, d: number) { return `${y}-${pad(m + 1)}-${pad(d)}`; }

export default function SaudiCalendar() {
  const [year, setYear] = useState(new Date().getFullYear());

  const holidays  = SAUDI_HOLIDAYS[year] ?? [];
  const holidayMap = new Map(holidays.map(h => [h.date, h]));
  const today     = new Date();

  const isToday = (m: number, d: number) =>
    today.getFullYear() === year && today.getMonth() === m && today.getDate() === d;

  const grouped = holidays.reduce<Record<string, Holiday[]>>((acc, h) => {
    (acc[h.name] ??= []).push(h);
    return acc;
  }, {});

  return (
    <div dir="rtl" className="p-2 sm:p-4 space-y-4 max-w-[var(--page-max-w)] mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm px-4 py-3">
        <div>
          <h2 className="text-base font-bold text-neutral-800 dark:text-neutral-200">التقويم السنوي للمملكة العربية السعودية</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">الإجازات الرسمية والمناسبات الوطنية</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setYear(y => y - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
            <ChevronRight className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          </button>
          <span className="text-base font-bold text-neutral-800 dark:text-neutral-200 min-w-[52px] text-center">{year}</span>
          <button onClick={() => setYear(y => y + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
            <ChevronLeft className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap items-center gap-3 px-1">
        {[
          { color: "bg-emerald-500",  label: "اليوم الوطني / يوم التأسيس" },
          { color: "bg-amber-400",    label: "أعياد دينية" },
          { color: "bg-rose-400",     label: "إجازة أسبوعية (جمعة/سبت)" },
          { color: "bg-neutral-900",  label: "اليوم الحالي" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={cn("w-2.5 h-2.5 rounded-full", color)} />
            <span className="text-xs text-neutral-600 dark:text-neutral-400">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Holidays summary ── */}
      {holidays.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">الإجازات الرسمية {year}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {Object.entries(grouped).map(([name, days]) => {
              const first = new Date(days[0].date);
              const last  = new Date(days[days.length - 1].date);
              const isNational = days[0].type === "national";
              return (
                <div key={name}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border",
                    isNational
                      ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-700"
                      : "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-700"
                  )}>
                  <div className={cn("w-1.5 rounded-full self-stretch", isNational ? "bg-emerald-500" : "bg-amber-400")} />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{name}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {days.length === 1
                        ? first.toLocaleDateString("ar-SA", { day: "numeric", month: "long" })
                        : `${first.toLocaleDateString("ar-SA", { day: "numeric", month: "long" })} – ${last.toLocaleDateString("ar-SA", { day: "numeric", month: "long" })}`}
                      <span className="mr-1 text-neutral-400 dark:text-neutral-500">
                        ({days.length} {days.length === 1 ? "يوم" : "أيام"})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {!SAUDI_HOLIDAYS[year] && (
            <div className="flex items-center gap-2 mt-3 text-xs text-neutral-500 dark:text-neutral-500 bg-neutral-50 dark:bg-neutral-700 rounded-lg px-3 py-2">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>تواريخ الأعياد الدينية تقديرية وتعتمد على رؤية الهلال</span>
            </div>
          )}
        </div>
      )}

      {/* ── Monthly Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {MONTHS_AR.map((monthName, mIdx) => {
          const daysCount = getDaysInMonth(year, mIdx);
          const firstDay  = getFirstDay(year, mIdx);

          return (
            <div key={mIdx} className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden">
              {/* Month header */}
              <div className="px-3 py-2 bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-700 flex items-center justify-between">
                <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{monthName}</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">{year}</span>
              </div>
              <div className="p-2">
                {/* Day name headers */}
                <div className="grid grid-cols-7 mb-1">
                  {DAYS_AR.map((d, i) => (
                    <div key={d}
                      className={cn(
                        "text-center text-[10px] font-semibold py-0.5",
                        i === 5 ? "text-rose-400 dark:text-rose-300" : i === 6 ? "text-rose-300 dark:text-rose-200" : "text-neutral-400 dark:text-neutral-400"
                      )}>
                      {d}
                    </div>
                  ))}
                </div>
                {/* Day cells */}
                <div className="grid grid-cols-7 gap-px">
                  {Array.from({ length: firstDay }, (_, i) => (
                    <div key={`e${i}`} />
                  ))}
                  {Array.from({ length: daysCount }, (_, i) => {
                    const day     = i + 1;
                    const dateStr = fmtDate(year, mIdx, day);
                    const holiday = holidayMap.get(dateStr);
                    const todayF  = isToday(mIdx, day);
                    const dow     = new Date(year, mIdx, day).getDay();
                    const isFri   = dow === 5;
                    const isSat   = dow === 6;

                    return (
                      <div key={day} title={holiday?.name}
                        className={cn(
                          "text-center text-[11px] font-medium py-1 rounded-md select-none",
                          todayF
                            ? "bg-neutral-900 text-white font-bold"
                            : holiday?.type === "national"
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 font-bold"
                            : holiday?.type === "religious"
                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 font-bold"
                            : isFri
                            ? "text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20"
                            : isSat
                            ? "text-rose-400 dark:text-rose-300 bg-rose-50/60 dark:bg-rose-900/15"
                            : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                        )}>
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-neutral-500 dark:text-neutral-500 pb-4">
        * تواريخ الأعياد الدينية تقديرية وتخضع لإعلان رسمي من المملكة العربية السعودية
      </p>
    </div>
  );
}
