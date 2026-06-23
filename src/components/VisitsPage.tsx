import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Plus, Search, X, ChevronLeft, ChevronRight,
  Clock, Trash2, User, Calendar as CalendarIcon, Route,
  Store, CheckCircle, XCircle, ClipboardList, Save, Pencil
} from "lucide-react";
import { cn } from "../lib/utils";

// ── Sample Data ──
const SUPERVISORS = [
  { id: "s1", name: "محمد القحطاني" },
  { id: "s2", name: "خالد الشمري" },
  { id: "s3", name: "فهد العنزي" },
  { id: "s4", name: "عبدالرحمن الدوسري" },
  { id: "s5", name: "سعد الحربي" },
  { id: "s6", name: "طلال الراشد" },
  { id: "s7", name: "سلطان العتيبي" },
  { id: "s8", name: "نواف المطيري" },
];

const SHOWROOMS = [
  "معرض الرياض - العليا",
  "معرض جدة - التحلية",
  "معرض الدمام - الشاطئ",
  "معرض مكة - العزيزية",
  "معرض المدينة - قباء",
  "معرض أبها - الخالدية",
  "معرض تبوك - المروج",
  "معرض حائل - السمراء",
];

const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

const DAYS_SHORT = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

type ActivityType =
  | "زيارة معرض"
  | "جرد معرض"
  | "جولة مع المدير المباشر"
  | "اجتماع البائعين"
  | "زيارة تدقيق"
  | "اغلاق معرض"
  | "افتتاح معرض"
  | "تحويلات"
  | "سفر"
  | "مكتبي"
  | "إجازة مرضية"
  | "إجازة تعويضية"
  | "إجازة اسبوعية"
  | "أخرى";

type VisitReason =
  | "زيارة دورية"
  | "متابعة المبيعات والمؤشرات"
  | "متابعة التدريب"
  | "متابعة المخزون وترتيب المعرض"
  | "متابعة جودة خدمة العملاء"
  | "دعم افتتاح معرض"
  | "متابعة ملاحظة أو إجراء تصحيحي";

const VISIT_REASONS: VisitReason[] = [
  "زيارة دورية",
  "متابعة المبيعات والمؤشرات",
  "متابعة التدريب",
  "متابعة المخزون وترتيب المعرض",
  "متابعة جودة خدمة العملاء",
  "دعم افتتاح معرض",
  "متابعة ملاحظة أو إجراء تصحيحي",
];

const ACTIVITY_TYPES: { key: ActivityType; icon: string }[] = [
  { key: "زيارة معرض", icon: "🏬" },
  { key: "جرد معرض", icon: "📦" },
  { key: "جولة مع المدير المباشر", icon: "🤝" },
  { key: "اجتماع البائعين", icon: "👥" },
  { key: "زيارة تدقيق", icon: "🔍" },
  { key: "اغلاق معرض", icon: "🔒" },
  { key: "افتتاح معرض", icon: "🎉" },
  { key: "تحويلات", icon: "🔄" },
  { key: "سفر", icon: "✈️" },
  { key: "مكتبي", icon: "💻" },
  { key: "إجازة مرضية", icon: "🏥" },
  { key: "إجازة تعويضية", icon: "📝" },
  { key: "إجازة اسبوعية", icon: "📅" },
  { key: "أخرى", icon: "📌" },
];

interface Visit {
  id: string;
  day: number;
  type: ActivityType;
  reason?: VisitReason;
  showroom: string;
  route: string;
  startTime: string;
  endTime: string;
  status: "planned" | "completed" | "cancelled";
  notes: string;
}

const sampleVisits: Visit[] = [
  { id: "v1", day: 5, type: "زيارة معرض", showroom: "معرض الرياض - العليا", route: "المركز الرئيسي → فرع العليا → فرع الورود", startTime: "09:00", endTime: "12:00", status: "completed", notes: "" },
  { id: "v2", day: 5, type: "زيارة معرض", showroom: "معرض جدة - التحلية", route: "فرع التحلية → فرع الأندلس", startTime: "14:00", endTime: "17:00", status: "planned", notes: "" },
  { id: "v3", day: 12, type: "جرد معرض", showroom: "معرض الدمام - الشاطئ", route: "", startTime: "10:00", endTime: "13:00", status: "planned", notes: "" },
  { id: "v4", day: 18, type: "زيارة تدقيق", showroom: "معرض مكة - العزيزية", route: "", startTime: "09:30", endTime: "12:30", status: "completed", notes: "" },
  { id: "v5", day: 25, type: "إجازة مرضية", showroom: "", route: "", startTime: "", endTime: "", status: "cancelled", notes: "تأجيل للأسبوع القادم" },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const STATUS_CONFIG = {
  planned:    { label: "مخطط",    badgeBg: "bg-blue-50",    badgeText: "text-blue-600",    dot: "bg-blue-500" },
  completed:  { label: "مكتمل",   badgeBg: "bg-emerald-50", badgeText: "text-emerald-600", dot: "bg-emerald-500" },
  cancelled:  { label: "ملغي",    badgeBg: "bg-red-50",     badgeText: "text-red-600",     dot: "bg-red-500" },
};

export default function VisitsPage() {
  const today = new Date();

  const [selectedSupervisor, setSelectedSupervisor] = useState<string>("");
  const [supervisorSearch, setSupervisorSearch] = useState("");
  const [supervisorOpen, setSupervisorOpen] = useState(false);
  const supervisorRef = useRef<HTMLDivElement>(null);

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const [visits, setVisits] = useState<Visit[]>(sampleVisits);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newVisit, setNewVisit] = useState<Partial<Visit>>({
    type: "زيارة معرض",
    reason: "زيارة دورية",
    showroom: SHOWROOMS[0],
    route: "",
    startTime: "09:00",
    endTime: "12:00",
    status: "planned",
    notes: "",
  });
  const [activityMenuOpen, setActivityMenuOpen] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType | null>(null);
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
  const activityMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (supervisorRef.current && !supervisorRef.current.contains(e.target as Node)) setSupervisorOpen(false);
      if (activityMenuRef.current && !activityMenuRef.current.contains(e.target as Node)) setActivityMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredSupervisors = useMemo(() => {
    const q = supervisorSearch.trim();
    if (!q) return SUPERVISORS;
    return SUPERVISORS.filter(s => s.name.includes(q));
  }, [supervisorSearch]);

  const daysInMonth = getDaysInMonth(year, month);

  const dayVisits = useMemo(() => {
    if (!selectedDay) return [];
    return visits.filter(v => v.day === selectedDay);
  }, [visits, selectedDay]);


  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const handleSaveVisit = () => {
    if (!selectedDay || !selectedActivityType) return;
    if (editingVisitId) {
      setVisits(prev => prev.map(v => v.id === editingVisitId ? {
        ...v,
        type: selectedActivityType,
        reason: newVisit.reason,
        showroom: newVisit.showroom || "",
        route: newVisit.route || "",
        startTime: newVisit.startTime || "",
        endTime: newVisit.endTime || "",
        status: (newVisit.status as any) || "planned",
        notes: newVisit.notes || "",
      } : v));
      setEditingVisitId(null);
    } else {
      const visit: Visit = {
        id: generateId(),
        day: selectedDay,
        type: selectedActivityType,
        reason: newVisit.reason,
        showroom: newVisit.showroom || "",
        route: newVisit.route || "",
        startTime: newVisit.startTime || "",
        endTime: newVisit.endTime || "",
        status: (newVisit.status as any) || "planned",
        notes: newVisit.notes || "",
      };
      setVisits(prev => [...prev, visit]);
    }
    setNewVisit({ type: "زيارة معرض", reason: "زيارة دورية", showroom: SHOWROOMS[0], route: "", startTime: "09:00", endTime: "12:00", status: "planned", notes: "" });
    setSelectedActivityType(null);
    setShowAddForm(false);
  };

  const handleEditVisit = (visit: Visit) => {
    setEditingVisitId(visit.id);
    setSelectedActivityType(visit.type);
    setNewVisit({
      type: visit.type,
      reason: visit.reason,
      showroom: visit.showroom,
      route: visit.route,
      startTime: visit.startTime,
      endTime: visit.endTime,
      status: visit.status,
      notes: visit.notes,
    });
    setShowAddForm(true);
  };

  const handleDeleteVisit = (id: string) => {
    setVisits(prev => prev.filter(v => v.id !== id));
  };

  const selectedSupervisorName = SUPERVISORS.find(s => s.id === selectedSupervisor)?.name || "";

  return (
    <div dir="rtl" className="min-h-screen bg-[#F4F8FE] dark:bg-neutral-900 font-sans">
      <div className="sticky top-0 z-40 md:z-30 bg-white dark:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700 rounded-xl">
        <div className="max-w-[1400px] mx-auto">
          <div className="px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <Route className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-neutral-800 dark:text-white leading-tight">خط سير الزيارات</h1>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500">تخطيط وإدارة جولات المشرفين</p>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0 sm:mr-auto">
              <div className="relative flex-1 min-w-0 max-w-[280px]" ref={supervisorRef}>
                <button onClick={() => setSupervisorOpen(v => !v)} className={cn("w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all text-right", supervisorOpen ? "border-emerald-400 ring-2 ring-emerald-400/20" : "border-neutral-200 dark:border-neutral-600 hover:border-neutral-300")}>
                  <User className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span className={cn("truncate flex-1", selectedSupervisor ? "text-neutral-800 dark:text-white" : "text-neutral-400")}>{selectedSupervisorName || "اختر المشرف"}</span>
                  <ChevronLeft className={cn("w-3.5 h-3.5 text-neutral-400 transition-transform shrink-0", supervisorOpen && "-rotate-90")} />
                </button>
                <AnimatePresence>
                  {supervisorOpen && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg overflow-hidden">
                      <div className="p-2 border-b border-neutral-100 dark:border-neutral-700">
                        <div className="relative">
                          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                          <input value={supervisorSearch} onChange={e => setSupervisorSearch(e.target.value)} placeholder="بحث..." className="w-full pr-9 pl-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-800 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 text-right" />
                        </div>
                      </div>
                      <div className="max-h-[200px] overflow-y-auto py-1">
                        {filteredSupervisors.map(s => (
                          <button key={s.id} onClick={() => { setSelectedSupervisor(s.id); setSupervisorOpen(false); setSupervisorSearch(""); }} className={cn("w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-right", selectedSupervisor === s.id ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700")}>
                            <User className="w-4 h-4 text-neutral-400 shrink-0" /><span>{s.name}</span>
                          </button>
                        ))}
                        {filteredSupervisors.length === 0 && <div className="px-3 py-4 text-sm text-neutral-400 text-center">لا يوجد نتائج</div>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl px-1 py-1 shrink-0">
                <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"><ChevronRight className="w-4 h-4 text-neutral-500" /></button>
                <select value={month} onChange={e => { setMonth(Number(e.target.value)); setSelectedDay(null); }} className="text-sm font-bold text-neutral-800 dark:text-white bg-transparent outline-none py-1 px-2 cursor-pointer min-w-[80px] text-center appearance-none">
                  {MONTHS_AR.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select value={year} onChange={e => { setYear(Number(e.target.value)); setSelectedDay(null); }} className="text-sm font-bold text-neutral-800 dark:text-white bg-transparent outline-none py-1 px-2 cursor-pointer min-w-[64px] text-center appearance-none">
                  {[today.getFullYear(), today.getFullYear() + 1].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"><ChevronLeft className="w-4 h-4 text-neutral-500" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {selectedSupervisor && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex lg:grid lg:grid-cols-5 gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide snap-x snap-mandatory">
            {/* Supervisor Card */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-4 text-right min-w-[150px] lg:min-w-0 flex-1 snap-start">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[11px] sm:text-xs font-medium text-neutral-500 dark:text-neutral-400 leading-relaxed">المشرف<br/>{MONTHS_AR[month]} {year}</span>
                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="text-base sm:text-lg font-black text-neutral-900 dark:text-white truncate">{selectedSupervisorName}</div>
              <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{visits.length} زيارة · {visits.filter(v => v.status === "completed").length} مكتملة</div>
            </div>
            {/* Stat 1 */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-4 text-right min-w-[150px] lg:min-w-0 flex-1 snap-start">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[11px] sm:text-xs font-medium text-neutral-500 dark:text-neutral-400 leading-relaxed">خطوط سير المشرفين<br/>زيارات مخططة</span>
                <ClipboardList className="w-5 h-5 text-neutral-300 dark:text-neutral-600 shrink-0" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">{visits.filter(v => v.status === "planned").length}</div>
            </div>
            {/* Stat 2 */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-4 text-right min-w-[150px] lg:min-w-0 flex-1 snap-start">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[11px] sm:text-xs font-medium text-neutral-500 dark:text-neutral-400 leading-relaxed">معارض المشرف<br/>حسب الهيكل</span>
                <Store className="w-5 h-5 text-neutral-300 dark:text-neutral-600 shrink-0" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">{SHOWROOMS.length}</div>
            </div>
            {/* Stat 3 */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-4 text-right min-w-[150px] lg:min-w-0 flex-1 snap-start">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[11px] sm:text-xs font-medium text-neutral-500 dark:text-neutral-400 leading-relaxed">معارض تمت زيارتها<br/>في الفترة الحالية</span>
                <CheckCircle className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">{new Set(visits.filter(v => v.status === "completed").map(v => v.showroom)).size}</div>
            </div>
            {/* Stat 4 */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-4 text-right min-w-[150px] lg:min-w-0 flex-1 snap-start">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[11px] sm:text-xs font-medium text-neutral-500 dark:text-neutral-400 leading-relaxed">معارض لم تتم زيارتها<br/>بداية من الشهر</span>
                <XCircle className="w-5 h-5 text-red-400 dark:text-red-500 shrink-0" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">{SHOWROOMS.length - new Set(visits.filter(v => v.status === "completed").map(v => v.showroom)).size}</div>
            </div>
          </motion.div>
        )}

        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3 border-b border-neutral-100 dark:border-neutral-700 flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-700 dark:text-neutral-200 flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-neutral-400" />تقويم {MONTHS_AR[month]} {year}</h2>
            <span className="text-xs text-neutral-400 dark:text-neutral-500">{selectedDay ? `اليوم ${selectedDay} محدد` : "اختر يوماً"}</span>
          </div>
          <div className="py-2 px-2 sm:px-3">
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 sm:gap-1.5">
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const isSel = selectedDay === day;
                const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
                const dayName = DAYS_SHORT[new Date(year, month, day).getDay()];
                const dayVisits = visits.filter(v => v.day === day);
                const dayVisitCount = dayVisits.length;

                // Determine day color by activity type priority: leave > meeting > showroom > other
                const types = new Set(dayVisits.map(v => v.type));
                const hasLeave = [...types].some(t => t.includes("إجازة"));
                const hasMeeting = types.has("اجتماع البائعين");
                const hasShowroom = [...types].some(t => ["زيارة معرض", "جرد معرض", "زيارة تدقيق", "اغلاق معرض", "افتتاح معرض"].includes(t));
                const dayColor = hasLeave ? "leave" : hasMeeting ? "meeting" : hasShowroom ? "showroom" : dayVisitCount > 0 ? "other" : "none";

                const cardClass = isSel
                  ? "bg-neutral-900 text-white shadow-md border-neutral-800"
                  : isToday
                    ? "bg-blue-50 border-blue-200 text-neutral-900"
                    : dayColor === "leave"
                      ? "bg-red-50 border-red-100 hover:bg-red-100"
                      : dayColor === "meeting"
                        ? "bg-amber-50 border-amber-100 hover:bg-amber-100"
                        : dayColor === "showroom"
                          ? "bg-emerald-50 border-emerald-100 hover:bg-emerald-100"
                          : dayColor === "other"
                            ? "bg-sky-50 border-sky-100 hover:bg-sky-100"
                            : "bg-white border-neutral-100 hover:bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-700";

                const badgeClass = isSel
                  ? "text-white bg-white/20"
                  : dayColor === "leave"
                    ? "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30"
                    : dayColor === "meeting"
                      ? "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30"
                      : dayColor === "showroom"
                        ? "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30"
                        : dayColor === "other"
                          ? "text-sky-700 bg-sky-100 dark:text-sky-300 dark:bg-sky-900/30"
                          : "text-neutral-300 dark:text-neutral-500";

                return (
                  <button key={day} onClick={() => setSelectedDay(isSel ? null : day)}
                    className={cn("flex flex-col items-center gap-1 rounded-xl py-2.5 px-1 transition-all active:scale-95 border", cardClass)}>
                    <div className="flex items-center gap-1">
                      <span className={cn("text-[9px] font-semibold leading-none", isSel ? "text-white/60" : "text-neutral-500 dark:text-neutral-400")}>{dayName}</span>
                      <span className={cn("text-[14px] font-extrabold leading-tight", isSel ? "text-white" : "text-neutral-900 dark:text-white")}>{day}</span>
                    </div>
                    <span className={cn("text-[11px] font-bold leading-none min-h-[14px] px-1.5 py-0.5 rounded-full", badgeClass)}>{dayVisitCount > 0 ? `${dayVisitCount} نشاط` : "—"}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedDay && (
            <motion.div key={`d${selectedDay}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-neutral-700 dark:text-neutral-200 flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" />أنشطة يوم {selectedDay} {MONTHS_AR[month]}</h2>
                <div className="relative" ref={activityMenuRef}>
                  <button onClick={() => setActivityMenuOpen(v => !v)} className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all", activityMenuOpen ? "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200" : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm")}>
                    <Plus className="w-3.5 h-3.5" />
                    {selectedActivityType ? selectedActivityType : "إنشاء جديد"}
                    {selectedActivityType && <X className="w-3 h-3" onClick={e => { e.stopPropagation(); setSelectedActivityType(null); setShowAddForm(false); }} />}
                  </button>

                  {/* Desktop dropdown */}
                  <AnimatePresence>
                    {activityMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="hidden sm:block absolute left-0 top-full mt-2 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg overflow-hidden min-w-[220px]">
                        <div className="py-1 max-h-[280px] overflow-y-auto">
                          {ACTIVITY_TYPES.map(({ key }) => (
                            <button key={key} onClick={() => { setSelectedActivityType(key); setActivityMenuOpen(false); setShowAddForm(true); }} className={cn("w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors text-right hover:bg-neutral-50 dark:hover:bg-neutral-700", selectedActivityType === key ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold" : "text-neutral-700 dark:text-neutral-200")}>
                              <span>{key}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile bottom sheet */}
                <AnimatePresence>
                  {activityMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="sm:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                      onClick={() => setActivityMenuOpen(false)}
                    >
                      <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 350 }}
                        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 rounded-t-2xl shadow-2xl max-h-[70vh] overflow-hidden"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-neutral-100 dark:border-neutral-700">
                          <h3 className="text-sm font-bold text-neutral-800 dark:text-white">اختر النشاط</h3>
                          <button onClick={() => setActivityMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                            <X className="w-4 h-4 text-neutral-500" />
                          </button>
                        </div>
                        <div className="overflow-y-auto max-h-[60vh] pb-[env(safe-area-inset-bottom)]">
                          {ACTIVITY_TYPES.map(({ key }) => (
                            <button
                              key={key}
                              onClick={() => { setSelectedActivityType(key); setActivityMenuOpen(false); setShowAddForm(true); }}
                              className={cn(
                                "w-full flex items-center px-4 py-3.5 text-sm transition-colors text-right border-b border-neutral-50 dark:border-neutral-700 last:border-0",
                                selectedActivityType === key
                                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold"
                                  : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                              )}
                            >
                              {key}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {showAddForm && selectedActivityType && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm p-4 sm:p-5 space-y-3">
                      <h3 className="text-sm font-bold text-neutral-800 dark:text-white mb-1">{selectedActivityType}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Showroom field for showroom-related activities */}
                        {(["زيارة معرض", "جرد معرض", "زيارة تدقيق", "اغلاق معرض", "افتتاح معرض"].includes(selectedActivityType)) && (
                          <div><label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">المعرض</label><select value={newVisit.showroom} onChange={e => setNewVisit(v => ({ ...v, showroom: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-sm text-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-400/40 text-right">{SHOWROOMS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                        )}
                        {/* Visit reason */}
                        {(["زيارة معرض", "جرد معرض", "زيارة تدقيق", "جولة مع المدير المباشر"].includes(selectedActivityType)) && (
                          <div><label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">سبب الزيارة</label><select value={newVisit.reason} onChange={e => setNewVisit(v => ({ ...v, reason: e.target.value as VisitReason }))} className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-sm text-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-400/40 text-right">{VISIT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                        )}
                        <div className="sm:col-span-2"><label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">ملاحظات</label><textarea value={newVisit.notes} onChange={e => setNewVisit(v => ({ ...v, notes: e.target.value }))} placeholder="أي ملاحظات إضافية..." rows={3} className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-sm text-neutral-800 dark:text-white placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-emerald-400/40 text-right resize-none" /></div>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <button onClick={handleSaveVisit} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"><Save className="w-4 h-4" />{editingVisitId ? "حفظ التعديلات" : "حفظ الزيارة"}</button>
                        <button onClick={() => { setShowAddForm(false); setSelectedActivityType(null); }} className="px-6 py-3 rounded-xl text-sm font-bold text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">إلغاء</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {dayVisits.length === 0 ? (
                <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-8 text-center">
                  <MapPin className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
                  <p className="text-sm font-bold text-neutral-500 dark:text-neutral-400 mb-1">لا توجد أنشطة</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">لم يتم تخطيط أي أنشطة لهذا اليوم</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden">
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-right">
                      <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700">
                        <tr>
                          <th className="px-4 py-3 text-[11px] font-bold text-neutral-400 dark:text-neutral-500 whitespace-nowrap">النشاط</th>
                          <th className="px-4 py-3 text-[11px] font-bold text-neutral-400 dark:text-neutral-500 whitespace-nowrap">المكان</th>
                          <th className="px-4 py-3 text-[11px] font-bold text-neutral-400 dark:text-neutral-500 whitespace-nowrap">الوقت</th>
                          <th className="px-4 py-3 text-[11px] font-bold text-neutral-400 dark:text-neutral-500 whitespace-nowrap">الحالة</th>
                          <th className="px-4 py-3 text-[11px] font-bold text-neutral-400 dark:text-neutral-500 whitespace-nowrap">ملاحظات</th>
                          <th className="px-4 py-3 text-[11px] font-bold text-neutral-400 dark:text-neutral-500 whitespace-nowrap w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                        {dayVisits.map(v => {
                          const cfg = STATUS_CONFIG[v.status];
                          const place = v.showroom || v.route || "—";
                          const timeStr = v.startTime && v.endTime ? `${v.startTime} – ${v.endTime}` : v.startTime || v.endTime || "—";
                          return (
                            <tr key={v.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">{v.type}</span>
                                  {v.reason && <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{v.reason}</span>}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300">{place}</td>
                              <td className="px-4 py-3"><div className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-300"><Clock className="w-3 h-3 text-neutral-400" /><span>{timeStr}</span></div></td>
                              <td className="px-4 py-3"><span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold", cfg.badgeBg, cfg.badgeText)}><span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />{cfg.label}</span></td>
                              <td className="px-4 py-3 text-xs text-neutral-400 dark:text-neutral-500">{v.notes || "—"}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <button onClick={() => handleEditVisit(v)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-neutral-400 hover:text-blue-500 transition-colors" title="تعديل"><Pencil className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => handleDeleteVisit(v.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-neutral-400 hover:text-red-500 transition-colors" title="حذف"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="sm:hidden divide-y divide-neutral-100 dark:divide-neutral-700">
                    {dayVisits.map(v => {
                      const cfg = STATUS_CONFIG[v.status];
                      const place = v.showroom || v.route || "";
                      const timeStr = v.startTime && v.endTime ? `${v.startTime} – ${v.endTime}` : v.startTime || v.endTime || "";
                      return (
                        <div key={v.id} className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-bold text-neutral-800 dark:text-white">{v.type}</span>
                              {v.reason && <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{v.reason}</span>}
                            </div>
                            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0", cfg.badgeBg, cfg.badgeText)}><span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />{cfg.label}</span>
                          </div>
                          {place && <div className="text-xs text-neutral-500 dark:text-neutral-400">{place}</div>}
                          {timeStr && <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400"><Clock className="w-3 h-3" /><span>{timeStr}</span></div>}
                          {v.notes && <div className="text-[11px] text-neutral-400 dark:text-neutral-500 bg-neutral-50 dark:bg-neutral-700 rounded-lg p-2">{v.notes}</div>}
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button onClick={() => handleEditVisit(v)} className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1"><Pencil className="w-3 h-3" />تعديل</button>
                            <button onClick={() => handleDeleteVisit(v.id)} className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"><Trash2 className="w-3 h-3" />حذف</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
