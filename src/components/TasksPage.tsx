import { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Search, SlidersHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X, MoreHorizontal, List, LayoutGrid, Calendar as CalendarIcon, ArrowUpDown, Megaphone, Briefcase, Flag, UserCircle, Tag as TagIcon, Paperclip, Bell, Calendar, Users, Building2, FolderOpen, Inbox } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import CampaignsPage from "./CampaignsPage";

type TaskStatus = "todo" | "in-progress" | "in-review" | "completed" | "overdue";
type TaskPriority = "low" | "medium" | "high" | "urgent";
type ViewMode = "list" | "kanban" | "calendar";
type AssignMode = "me" | "team" | "department" | "committee";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignee: string;
  progress: number;
  projectName: string;
  tags?: string[];
  assignMode?: AssignMode;
  assignTarget?: string;
  assignMembers?: string[];
  taskSource?: string;
}

const ASSIGNEES = ["فهد العتيبي", "نورة السبيعي", "خالد القحطاني", "منى الزهراني", "أحمد الشمري", "سارة الدوسري"];
const PROJECTS = ["معرض الرياض بارك", "فرع جدة بارك", "معرض الظهران مول", "فرع الرياض جاليري", "معرض الخبر بلازا", "فرع مكة مول"];

const TEAMS = [
  { name: "فريق المبيعات", members: ["فهد العتيبي", "نورة السبيعي", "خالد القحطاني"] },
  { name: "فريق التسويق", members: ["منى الزهراني", "أحمد الشمري", "سارة الدوسري"] },
  { name: "فريق التطوير", members: ["فهد العتيبي", "منى الزهراني"] },
];

const DEPARTMENTS = [
  { name: "قسم العطور", head: "فهد العتيبي", members: ["نورة السبيعي", "خالد القحطاني", "منى الزهراني"] },
  { name: "قسم العناية", head: "أحمد الشمري", members: ["سارة الدوسري", "نورة السبيعي"] },
  { name: "قسم المالية", head: "خالد القحطاني", members: ["فهد العتيبي", "أحمد الشمري"] },
];

const SOURCES = ["إيميل", "اجتماع", "الرئيس التنفيذي", "شكوى عميل", "توجيه مباشر"];

const COMMITTEES = [
  { name: "لجنة الجودة", head: "منى الزهراني", members: ["فهد العتيبي", "نورة السبيعي", "سارة الدوسري"] },
  { name: "لجنة المشتريات", head: "خالد القحطاني", members: ["أحمد الشمري", "نورة السبيعي"] },
];
const STORAGE_KEY = "perfume-tasks-v1";

const AVATAR_COLORS = ["bg-violet-500","bg-cyan-500","bg-rose-500","bg-amber-500","bg-emerald-500","bg-blue-500"];
function avatarColor(name: string) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]; }
function initials(name: string) { const p = name.trim().split(" "); return p.length >= 2 ? p[0][0] + p[1][0] : name.slice(0,2); }

function fmtDate(d: string) {
  if (!d) return "";
  const [y, m, day] = d.split("-").map(Number);
  const months = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  return `${day} ${months[m-1]}، ${y}`;
}

function fmtHijri(d: string): string {
  if (!d) return "";
  const [y, m, day] = d.split("-").map(Number);
  const date = new Date(y, m - 1, day);
  return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", { day: "numeric", month: "long" }).format(date);
}
function fmtHijriYear(d: string): string {
  if (!d) return "";
  const [y, m, day] = d.split("-").map(Number);
  const date = new Date(y, m - 1, day);
  return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", { month: "long", year: "numeric" }).format(date);
}

function getInitialTasks(): Task[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) { try { return JSON.parse(saved); } catch { /* fall */ } }
  return [
    { id: "P991254-1", title: "جرد مخزون عطور الفرع الرئيسي", description: "فحص الكميات الفعلية لمنتجات فروج ومونتال", status: "todo", priority: "high", dueDate: "2026-06-10", assignee: "فهد العتيبي", progress: 0, projectName: "معرض الرياض بارك" },
    { id: "P552714-2", title: "تدريب بائعي قسم النيش براند", description: "شرح خصائص العطور النيش للفريق", status: "todo", priority: "high", dueDate: "2026-06-02", assignee: "نورة السبيعي", progress: 0, projectName: "فرع جدة بارك" },
    { id: "P882726-3", title: "تحضير عرض ترويجي لعيد الفطر", description: "تصميم باقات عطور بأسعار مغرية مع تغليف هدايا", status: "todo", priority: "low", dueDate: "2026-05-31", assignee: "نورة السبيعي", progress: 0, projectName: "فرع مكة مول" },
    { id: "P883561-1", title: "توزيع استبيانات قياس رضا العملاء", description: "رصد تجربة الشراء وتحليل النتائج", status: "in-progress", priority: "medium", dueDate: "2026-05-25", assignee: "أحمد الشمري", progress: 80, projectName: "معرض الظهران مول" },
    { id: "P919712-2", title: "جدولة جلسات عرض العطور الموسمية", description: "تنسيق مع موردي العطور الصيفية", status: "in-progress", priority: "high", dueDate: "2026-05-24", assignee: "منى الزهراني", progress: 55, projectName: "معرض الرياض بارك" },
    { id: "P913762-3", title: "التنسيق مع متحدثين خارجيين لمعرض العطور", description: "التواصل مع خبراء العطور الدوليين", status: "in-progress", priority: "low", dueDate: "2026-05-30", assignee: "خالد القحطاني", progress: 76, projectName: "فرع الرياض جاليري" },
    { id: "P125773-1", title: "مراجعة قائمة المنتجات الجديدة للفرع", description: "التحقق من جاهزية المنتجات قبل الإطلاق", status: "in-review", priority: "medium", dueDate: "2026-05-26", assignee: "سارة الدوسري", progress: 90, projectName: "معرض الخبر بلازا" },
    { id: "P927572-2", title: "استلام شحنة عطور جديدة - مونتال", description: "فحص جودة الشحنة وتسجيلها في النظام", status: "in-review", priority: "high", dueDate: "2026-05-28", assignee: "فهد العتيبي", progress: 86, projectName: "فرع جدة بارك" },
    { id: "P012263-3", title: "تصميم كتالوج عطور الصيف 2026", description: "اختيار المنتجات الموسمية وتصميم الكتالوج الرقمي", status: "in-review", priority: "medium", dueDate: "2026-05-22", assignee: "منى الزهراني", progress: 89, projectName: "معرض الرياض بارك" },
    { id: "P774412-1", title: "مراجعة تقرير مبيعات أبريل", description: "تحليل أداء الفروع ومقارنة الأهداف الشهرية", status: "completed", priority: "medium", dueDate: "2026-05-05", assignee: "خالد القحطاني", progress: 100, projectName: "فرع الرياض جاليري" },
    { id: "P338821-2", title: "تحديث قائمة الأسعار بعد الضريبة", description: "تطبيق نسبة الضريبة الجديدة على جميع المنتجات", status: "completed", priority: "low", dueDate: "2026-05-01", assignee: "سارة الدوسري", progress: 100, projectName: "فرع جدة بارك" },
    { id: "P558832-1", title: "مراجعة عقود إيجار الفروع الجديدة", description: "الاطلاع على بنود عقود الفروع المقرر افتتاحها", status: "overdue", priority: "high", dueDate: "2026-05-10", assignee: "أحمد الشمري", progress: 30, projectName: "معرض الخبر بلازا" },
  ];
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; accent: string; badgeBg: string; badgeText: string; colBg: string; headerDot: string }> = {
  todo:         { label: "قيد الانتظار", accent: "bg-neutral-800", badgeBg: "bg-neutral-100",  badgeText: "text-neutral-800", colBg: "bg-gray-50  dark:bg-neutral-800/60",   headerDot: "bg-neutral-700" },
  "in-progress":{ label: "قيد العمل",    accent: "bg-blue-500",   badgeBg: "bg-blue-100",    badgeText: "text-blue-700",    colBg: "bg-blue-50  dark:bg-blue-900/20",     headerDot: "bg-blue-500" },
  "in-review":  { label: "تحت المراجعة",accent: "bg-orange-500",  badgeBg: "bg-orange-100",  badgeText: "text-orange-700",  colBg: "bg-orange-50 dark:bg-orange-900/20",  headerDot: "bg-orange-500" },
  completed:    { label: "منتهية",       accent: "bg-teal-500",   badgeBg: "bg-teal-100",    badgeText: "text-teal-700",    colBg: "bg-teal-50  dark:bg-teal-900/20",     headerDot: "bg-teal-500" },
  overdue:      { label: "متأخرة",       accent: "bg-red-500",    badgeBg: "bg-red-100",     badgeText: "text-red-700",     colBg: "bg-red-50   dark:bg-red-900/20",      headerDot: "bg-red-500" },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; bg: string; text: string; flag: string }> = {
  urgent: { label: "عاجلة",   bg: "bg-red-100",    text: "text-red-600",    flag: "text-red-500" },
  high:   { label: "عالية",   bg: "bg-amber-100",  text: "text-amber-600",  flag: "text-amber-500" },
  medium: { label: "متوسطة",  bg: "bg-blue-100",   text: "text-blue-600",   flag: "text-blue-500" },
  low:    { label: "منخفضة",  bg: "bg-gray-100",   text: "text-gray-600",   flag: "text-gray-400" },
};

interface TasksPageProps { onBack?: () => void; onNewCampaign?: () => void; onNewProject?: () => void; }

const COLS = [
  { key: "id",          label: "رقم المهمة" },
  { key: "title",       label: "اسم المهمة" },
  { key: "assignee",    label: "المسؤول" },
  { key: "projectName", label: "المشروع" },
  { key: "source",      label: "المصدر" },
  { key: "progress",    label: "الإنجاز" },
  { key: "dueDate",     label: "الموعد النهائي" },
  { key: "priority",    label: "الأولوية" },
  { key: "action",      label: "إجراء" },
] as const;

export default function TasksPage({ onBack: _onBack, onNewCampaign, onNewProject }: TasksPageProps) {
  const [tasks, setTasks] = useState<Task[]>(() => getInitialTasks());
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [expanded, setExpanded] = useState<Record<TaskStatus, boolean>>({
    todo: true, "in-progress": true, "in-review": true, completed: false, overdue: true,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState<Partial<Task>>({ status: "todo", priority: "medium", progress: 0 });
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"tasks" | "campaigns" | "projects">("tasks");
  const [formDropdown, setFormDropdown] = useState<"status" | "assignee" | "dueDate" | "priority" | "tags" | "source" | "project" | null>(null);
  const formDropdownRef = useRef<HTMLDivElement>(null);
  const [assignStep, setAssignStep] = useState<"mode" | "list" | "members">("mode");
  const assignDropdownRef = useRef<HTMLDivElement>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Scroll collapse
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const lastScrollY = useRef(0);
  const collapsedRef = useRef(false);
  const animLock = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;
      lastScrollY.current = currentY;
      if (animLock.current) return;
      if (!collapsedRef.current && currentY > 60 && diff > 6) {
        collapsedRef.current = true;
        animLock.current = true;
        setHeaderCollapsed(true);
        setTimeout(() => { animLock.current = false; }, 350);
      } else if (collapsedRef.current && diff < -8) {
        collapsedRef.current = false;
        animLock.current = true;
        setHeaderCollapsed(false);
        setTimeout(() => { animLock.current = false; }, 350);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(null);
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) setAddMenuOpen(false);
      if (assignDropdownRef.current && assignDropdownRef.current.contains(e.target as Node)) {
        // keep assign dropdown open
      } else {
        if (formDropdownRef.current && !formDropdownRef.current.contains(e.target as Node)) setFormDropdown(null);
        setAssignStep("mode");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const filtered = useMemo(() => {
    if (!search.trim()) return tasks;
    const q = search.trim().toLowerCase();
    return tasks.filter(t => t.title.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q) || t.projectName.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
  }, [tasks, search]);

  const grouped = useMemo(() => {
    const g: Record<TaskStatus, Task[]> = { todo: [], "in-progress": [], "in-review": [], completed: [], overdue: [] };
    filtered.forEach(t => g[t.status].push(t));
    return g;
  }, [filtered]);

  const toggle = (s: TaskStatus) => setExpanded(p => ({ ...p, [s]: !p[s] }));
  const openCreate = () => { setEditing(null); setForm({ status: "todo", priority: "medium", dueDate: today, assignee: ASSIGNEES[0], progress: 0, projectName: PROJECTS[0], assignMode: "me", assignTarget: undefined, assignMembers: undefined, taskSource: SOURCES[0] }); setModalOpen(true); setAssignStep("mode"); };
  const openEdit = (t: Task) => { setEditing(t); setForm({ ...t }); setModalOpen(true); setMenuOpen(null); setAssignStep("mode"); };
  const save = () => {
    if (!form.title?.trim()) return;
    if (editing) setTasks(p => p.map(t => t.id === editing.id ? { ...t, ...form } as Task : t));
    else {
      const uid = "P" + String(Date.now()).slice(-6) + "-" + (tasks.length + 1);
      setTasks(p => [...p, { id: uid, ...form } as Task]);
    }
    setModalOpen(false);
  };
  const remove = (id: string) => { if (confirm("هل أنت متأكد من حذف هذه المهمة؟")) { setTasks(p => p.filter(t => t.id !== id)); setMenuOpen(null); } };
  const toggleRow = (id: string) => setSelectedRows(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const order: TaskStatus[] = ["todo", "in-progress", "in-review", "overdue", "completed"];

  return (
    <div className="min-h-screen bg-[#0000000] dark:bg-neutral-900 font-sans" dir="rtl">
      {/* Top bar: Tabs + Toolbar */}
      <div className="sticky top-0 z-40 md:z-30 bg-white dark:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700 rounded-xl">
        <div className="max-w-[1400px] mx-auto">
          {/* Tabs row */}
          <AnimatePresence initial={false}>
          {!headerCollapsed && (
          <motion.div
            key="tabs-row"
            variants={{
              show: { height: "auto", opacity: 1, transition: { height: { type: "spring", stiffness: 700, damping: 42, mass: 0.4 }, opacity: { duration: 0.07 } } },
              hide: { height: 0, opacity: 0, transition: { height: { type: "spring", stiffness: 500, damping: 38, mass: 0.8 }, opacity: { duration: 0.1 } } }
            }}
            initial="hide"
            animate="show"
            exit="hide"
            className="overflow-hidden"
          >
          <div className="px-1 sm:px-4 py-2 border-b border-neutral-100 dark:border-neutral-700">
            <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-700 rounded-full p-1 w-full min-w-0 sm:max-w-[60%] sm:mx-auto">
            {([
              { key: "tasks" as const, label: "المهام" },
              { key: "campaigns" as const, label: "الحملات" },
              { key: "projects" as const, label: "المشاريع" },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "flex flex-1 items-center justify-center py-1.5 px-2 sm:px-3 rounded-full text-[13px] sm:text-[14px] font-bold transition-all duration-200 min-w-0",
                  activeTab === key
                    ? "bg-neutral-900 text-white shadow-sm"
                    : "bg-neutral-50 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 hover:text-neutral-900 dark:hover:text-white"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          </div>
          </motion.div>
          )}
          </AnimatePresence>

          {/* Toolbar row + Add button (Add always visible) */}
          <div className="px-2 sm:px-6 py-2 sm:py-[14px] flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <AnimatePresence initial={false}>
            {!headerCollapsed && (
            <motion.div
              key="filters-row"
              variants={{
                show: { height: "auto", opacity: 1, transition: { height: { type: "spring", stiffness: 700, damping: 42, mass: 0.4 }, opacity: { duration: 0.07, ease: "easeOut" } } },
                hide: { height: 0, opacity: 0, transition: { height: { type: "spring", stiffness: 500, damping: 38, mass: 0.8 }, opacity: { duration: 0.1, ease: "easeIn" } } }
              }}
              initial="hide"
              animate="show"
              exit="hide"
              className="overflow-hidden flex-1"
            >
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {activeTab === "tasks" && (
            <>
              <div className="relative flex-1 max-w-[140px] sm:max-w-xs">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..."
                  className="w-full pr-9 pl-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 text-right" />
              </div>
              <button className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-neutral-600 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors">
                <SlidersHorizontal className="w-4 h-4" /> <span className="hidden sm:inline">تصفية</span>
              </button>
              <div className="mr-auto flex items-center gap-1 bg-neutral-50 dark:bg-neutral-700 rounded-xl p-1">
                {([["list","قائمة",List],["kanban","كانبان",LayoutGrid],["calendar","تقويم",CalendarIcon]] as [ViewMode, string, React.ElementType][]).map(([v, label, Icon]) => (
                  <button key={v} onClick={() => setViewMode(v)} className={cn("flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200", viewMode === v ? "bg-neutral-900 text-white shadow-sm" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600")}>
                    <Icon className="w-3.5 h-3.5" /><span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {activeTab !== "tasks" && <div className="flex-1" />}
            </div>
            </motion.div>
            )}
            </AnimatePresence>

            <div className="relative" ref={addMenuRef}>
              <button onClick={() => setAddMenuOpen(v => !v)} className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors shadow-sm shrink-0">
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">إضافة جديدة</span><span className="sm:hidden">إضافة</span> <ChevronDown className={cn("w-3 h-3 transition-transform", addMenuOpen && "rotate-180")} />
              </button>
              {addMenuOpen && (
                <div className="absolute left-0 top-full mt-2 z-50 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[180px]">
                  <button onClick={() => { setAddMenuOpen(false); openCreate(); }} className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700 flex items-center gap-2 transition-colors">
                    <List className="w-4 h-4 text-teal-500" /> مهمة جديدة
                  </button>
                  <button onClick={() => { setAddMenuOpen(false); onNewCampaign?.(); }} className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700 flex items-center gap-2 transition-colors">
                    <Megaphone className="w-4 h-4 text-amber-500" /> حملة جديدة
                  </button>
                  <button onClick={() => { setAddMenuOpen(false); onNewProject?.(); }} className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700 flex items-center gap-2 transition-colors">
                    <Briefcase className="w-4 h-4 text-blue-500" /> مشروع جديد
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === "tasks" && (
        <div className="max-w-[1600px] mx-auto px-2 sm:px-0 py-4 space-y-4">
          {/* ── LIST VIEW ── */}
          {viewMode === "list" && (
            <>
            {order.map(status => {
              const items = grouped[status];
              if (!items.length) return null;
              const open = expanded[status];
              const cfg = STATUS_CONFIG[status];
              return (
                <div key={status} className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-700 overflow-hidden">
                  {/* Group Header */}
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-neutral-700">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-1 h-5 rounded-full", cfg.accent)} />
                      <span className={cn("text-sm font-semibold px-2.5 py-0.5 rounded-md", cfg.badgeBg, cfg.badgeText)}>{cfg.label}</span>
                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{items.length}</span>
                      <button onClick={() => toggle(status)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                    <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-teal-500 transition-colors font-medium">
                      عرض الكل <span className="text-[10px]">↗</span>
                    </button>
                  </div>

                <AnimatePresence>
                  {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100 dark:border-neutral-700">
                              <th className="w-10 px-4 py-3"><input type="checkbox" className="rounded border-gray-300 text-teal-500 focus:ring-teal-400" /></th>
                              {COLS.map(col => (
                                <th key={col.key} className={cn("px-3 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap", col.key === "action" ? "text-center" : "")}>
                                  {col.key !== "action" ? (
                                    <button className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                                      {col.label}<ArrowUpDown className="w-3 h-3 opacity-50" />
                                    </button>
                                  ) : col.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {items.map(task => (
                              <tr key={task.id} className="border-b border-gray-50 dark:border-neutral-700/50 hover:bg-gray-50/60 dark:hover:bg-neutral-700/20 transition-colors">
                                <td className="px-4 py-3.5">
                                  <input type="checkbox" checked={selectedRows.has(task.id)} onChange={() => toggleRow(task.id)} className="rounded border-gray-300 text-teal-500 focus:ring-teal-400" />
                                </td>
                                <td className="px-3 py-3.5 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap font-mono text-right">{task.id}</td>
                                <td className="px-3 py-3.5 min-w-[200px]">
                                  <p className="text-sm text-gray-700 dark:text-gray-200 text-right" title={task.title}>{task.title}</p>
                                </td>
                                <td className="px-3 py-3.5 whitespace-nowrap">
                                  {task.assignMode === "team" && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"><Users className="w-4 h-4 text-blue-500" /></div>
                                      <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{task.assignTarget}</p>
                                        <p className="text-[10px] text-gray-400">{(task.assignMembers || []).length} أعضاء</p>
                                      </div>
                                    </div>
                                  )}
                                  {task.assignMode === "department" && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0"><Building2 className="w-4 h-4 text-amber-500" /></div>
                                      <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{task.assignTarget}</p>
                                        <p className="text-[10px] text-gray-400">{(task.assignMembers || []).length} موظف</p>
                                      </div>
                                    </div>
                                  )}
                                  {task.assignMode === "committee" && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center shrink-0"><FolderOpen className="w-4 h-4 text-violet-500" /></div>
                                      <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{task.assignTarget}</p>
                                        <p className="text-[10px] text-gray-400">{(task.assignMembers || []).length} عضو</p>
                                      </div>
                                    </div>
                                  )}
                                  {(!task.assignMode || task.assignMode === "me") && (
                                    <div className="flex items-center gap-2">
                                      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0", avatarColor(task.assignee))}>
                                        {initials(task.assignee)}
                                      </div>
                                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{task.assignee}</span>
                                    </div>
                                  )}
                                </td>
                                <td className="px-3 py-3.5 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{task.projectName}</td>
                                <td className="px-3 py-3.5 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{task.taskSource || "-"}</td>
                                <td className="px-3 py-3.5 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{task.progress}%</td>
                                <td className={cn("px-3 py-3.5 text-sm whitespace-nowrap", task.dueDate < today && task.status !== "completed" ? "text-red-500 font-semibold" : "text-gray-500 dark:text-gray-400")}>
                                  {fmtDate(task.dueDate)}
                                </td>
                                <td className="px-3 py-3.5">
                                  <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", PRIORITY_CONFIG[task.priority].bg, PRIORITY_CONFIG[task.priority].text)}>
                                    {PRIORITY_CONFIG[task.priority].label}
                                  </span>
                                </td>
                                <td className="px-3 py-3.5 text-center relative">
                                  <div ref={menuOpen === task.id ? menuRef : null} className="inline-block">
                                    <button onClick={() => setMenuOpen(menuOpen === task.id ? null : task.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-400 hover:text-gray-600 transition-colors">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                    <AnimatePresence>
                                      {menuOpen === task.id && (
                                        <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.1 }}
                                          className="absolute right-0 top-8 z-50 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-lg shadow-lg py-1 min-w-[120px] text-right">
                                          <button onClick={() => openEdit(task)} className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700 text-right">تعديل</button>
                                          <button onClick={() => remove(task.id)} className="w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-right">حذف</button>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          </>
          )}

          {/* ── KANBAN VIEW ── */}
          {viewMode === "kanban" && (
            <div className="flex gap-3 overflow-x-auto pb-4 items-start">
              {order.map(status => {
                const items = grouped[status];
                const cfg = STATUS_CONFIG[status];
                return (
                  <div key={status} className={cn("flex-shrink-0 w-[260px] sm:w-[280px] flex flex-col rounded-2xl p-3", cfg.colBg)}>
                    {/* Column Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn("inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full", cfg.badgeBg, cfg.badgeText)}>
                        <span className={cn("w-2 h-2 rounded-full", cfg.headerDot)} />
                        {cfg.label}
                      </span>
                      <span className="text-xs font-semibold text-gray-400 mr-auto bg-white/70 dark:bg-neutral-700/50 rounded-full px-2 py-0.5">{items.length}</span>
                    </div>

                    {/* Cards */}
                    <div className="flex-1 space-y-2.5">
                      {items.map(task => (
                        <motion.div
                          key={task.id}
                          whileHover={{ y: -1, boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}
                          className="bg-white dark:bg-neutral-800 rounded-xl border border-gray-100 dark:border-neutral-700 p-3.5 shadow-sm cursor-pointer"
                          onClick={() => openEdit(task)}
                        >
                          {/* Title */}
                          <h4 className="text-[13px] font-semibold text-gray-800 dark:text-gray-100 mb-1 text-right leading-snug">{task.title}</h4>
                          {/* Project subtitle */}
                          <p className="text-[11px] text-gray-400 mb-3 text-right">في {task.projectName}</p>

                          {/* Assignee row */}
                          <div className="flex items-center gap-1.5 mb-2">
                            {(!task.assignMode || task.assignMode === "me") ? (
                              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0", avatarColor(task.assignee))}>
                                {initials(task.assignee)}
                              </div>
                            ) : task.assignMode === "team" ? (
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><Users className="w-3 h-3 text-blue-500" /></div>
                            ) : task.assignMode === "department" ? (
                              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0"><Building2 className="w-3 h-3 text-amber-500" /></div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0"><FolderOpen className="w-3 h-3 text-violet-500" /></div>
                            )}
                            <span className="text-[11px] text-gray-500 truncate">
                              {task.assignMode && task.assignMode !== "me" ? (task.assignTarget || "-") : task.assignee}
                            </span>
                          </div>

                          {/* Date row */}
                          <div className={cn("flex items-center gap-1.5 mb-2", task.dueDate < today && task.status !== "completed" ? "text-red-500" : "text-gray-400")}>
                            <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-[11px] font-medium">{fmtDate(task.dueDate)}</span>
                          </div>

                          {/* Priority row */}
                          <div className="flex items-center gap-1.5 mb-2">
                            <Flag className={cn("w-3.5 h-3.5 shrink-0", PRIORITY_CONFIG[task.priority].flag)} />
                            <span className={cn("text-[11px] font-medium", PRIORITY_CONFIG[task.priority].text)}>{PRIORITY_CONFIG[task.priority].label}</span>
                          </div>

                          {/* Progress row */}
                          {task.progress > 0 && (
                            <div className="flex items-center gap-2 mt-2.5">
                              <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-neutral-700 overflow-hidden">
                                <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${task.progress}%` }} />
                              </div>
                              <span className="text-[10px] text-gray-400 font-medium shrink-0">{task.progress}%</span>
                            </div>
                          )}
                        </motion.div>
                      ))}

                      {/* Add Task button */}
                      <button
                        onClick={() => { openCreate(); }}
                        className="w-full flex items-center gap-1.5 px-3 py-2.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-neutral-700/40 rounded-xl transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> إضافة مهمة
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── CALENDAR VIEW ── */}
          {viewMode === "calendar" && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-700 p-4 sm:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => setCalendarMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-400 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                  <div className="text-center">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 leading-tight">
                      {calendarMonth.toLocaleDateString("ar-SA", { month: "long", year: "numeric" })}
                    </h3>
                    <p className="text-[11px] text-gray-400 font-medium">
                      {fmtHijriYear(`${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}-01`)}
                    </p>
                  </div>
                  <button onClick={() => setCalendarMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-400 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                </div>
                <button onClick={() => setCalendarMonth(new Date())} className="text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors">اليوم</button>
              </div>

              {/* Days header */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"].map(d => (
                  <div key={d} className="text-center text-[11px] font-semibold text-gray-400 py-1.5">{d}</div>
                ))}
              </div>

              {/* Days grid */}
              {(() => {
                const year = calendarMonth.getFullYear();
                const month = calendarMonth.getMonth();
                const firstDay = new Date(year, month, 1);
                const startOffset = firstDay.getDay(); // 0 = Sunday
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const todayStr = new Date().toISOString().split("T")[0];

                const tasksByDate: Record<string, Task[]> = {};
                filtered.forEach(t => { (tasksByDate[t.dueDate] ||= []).push(t); });

                const cells: { day?: number; dateStr?: string; isCurrentMonth: boolean }[] = [];
                // Previous month padding
                const prevMonthDays = new Date(year, month, 0).getDate();
                for (let i = startOffset - 1; i >= 0; i--) {
                  const d = prevMonthDays - i;
                  cells.push({ day: d, isCurrentMonth: false });
                }
                // Current month
                for (let d = 1; d <= daysInMonth; d++) {
                  const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                  cells.push({ day: d, dateStr: ds, isCurrentMonth: true });
                }
                // Next month padding to fill 6 rows (42 cells)
                while (cells.length % 7 !== 0) { cells.push({ day: (cells.length % 7) + 1, isCurrentMonth: false }); }
                while (cells.length < 42) { cells.push({ day: ((cells.length) % 7) + 1, isCurrentMonth: false }); }

                return (
                  <div className="grid grid-cols-7 gap-1">
                    {cells.map((cell, idx) => {
                      const dayTasks = cell.dateStr ? (tasksByDate[cell.dateStr] || []) : [];
                      const isToday = cell.dateStr === todayStr;
                      return (
                        <div key={idx} className={cn(
                          "min-h-[100px] sm:min-h-[120px] rounded-lg border p-1.5 flex flex-col gap-1 transition-colors",
                          cell.isCurrentMonth
                            ? "bg-white dark:bg-neutral-800 border-gray-100 dark:border-neutral-700"
                            : "bg-gray-50 dark:bg-neutral-800/40 border-gray-50 dark:border-neutral-800 text-gray-300",
                          isToday && "ring-1 ring-teal-400 bg-teal-50/30"
                        )}>
                          <div className="flex flex-col items-end gap-0">
                            <span className={cn("text-[11px] font-semibold w-6 h-6 flex items-center justify-center rounded-full", isToday ? "bg-teal-500 text-white" : cell.isCurrentMonth ? "text-gray-600 dark:text-gray-300" : "text-gray-300")}>
                              {cell.day}
                            </span>
                            <span className="text-[9px] text-gray-400 font-medium leading-none px-0.5">
                              {cell.dateStr ? fmtHijri(cell.dateStr).replace(/\s.*/, "") : ""}
                            </span>
                          </div>
                          <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                            {dayTasks.slice(0, 3).map(t => (
                              <button key={t.id} onClick={() => openEdit(t)} className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded truncate text-right w-full transition-colors hover:opacity-80", STATUS_CONFIG[t.status].badgeBg, STATUS_CONFIG[t.status].badgeText)}>
                                {t.title}
                              </button>
                            ))}
                            {dayTasks.length > 3 && (
                              <span className="text-[10px] text-gray-400 text-right px-1">+{dayTasks.length - 3}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {filtered.length === 0 && <div className="text-center py-16 text-gray-400 text-sm">لا توجد مهام مطابقة</div>}
        </div>
      )}

      {activeTab === "campaigns" && <CampaignsPage />}

      {activeTab === "projects" && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-20 text-center">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">المشاريع</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">صفحة المشاريع قيد التطوير</p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto p-4 pt-10 pb-10" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl w-full max-w-2xl my-auto" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-neutral-700">
                <span className="text-xs font-medium text-gray-400">{editing ? "تعديل مهمة" : "مهمة"}</span>
                <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-400 transition-colors"><X className="w-4 h-4" /></button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5" dir="rtl">
                {/* Title */}
                <input value={form.title || ""} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full text-xl font-semibold text-gray-800 dark:text-gray-100 placeholder:text-gray-300 focus:outline-none bg-transparent text-right" placeholder="اسم المهمة" autoFocus />

                {/* Description */}
                <textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full min-h-[60px] text-sm text-gray-600 dark:text-gray-300 placeholder:text-gray-300 focus:outline-none bg-transparent resize-none text-right" placeholder="أضف وصفاً..." />

                {/* Quick action buttons */}
                <div className="flex items-center gap-2 flex-wrap" ref={formDropdownRef}>
                  {/* Status */}
                  <div className="relative">
                    <button onClick={() => setFormDropdown(d => d === "status" ? null : "status")} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors", form.status === "completed" ? "bg-teal-50 border-teal-200 text-teal-700" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100")}>
                      <span className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[form.status || "todo"].accent)} />
                      {STATUS_CONFIG[form.status || "todo"].label}
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>
                    {formDropdown === "status" && (
                      <div className="absolute right-0 top-full mt-1.5 z-50 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[160px]">
                        {(["todo","in-progress","in-review","completed","overdue"] as TaskStatus[]).map(s => (
                          <button key={s} onClick={() => { setForm(f => ({ ...f, status: s })); setFormDropdown(null); }} className={cn("w-full px-4 py-2 text-sm text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors", (form.status || "todo") === s ? "text-teal-600 font-semibold" : "text-gray-700 dark:text-gray-200")}>
                            <span className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[s].accent)} />
                            {STATUS_CONFIG[s].label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Assignee */}
                  <div className="relative" ref={assignDropdownRef}>
                    <button onClick={() => { setFormDropdown(d => d === "assignee" ? null : "assignee"); setAssignStep("mode"); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                      <UserCircle className="w-3.5 h-3.5" />
                      {form.assignMode === "team" ? (form.assignTarget || "فريق") : form.assignMode === "department" ? (form.assignTarget || "قسم") : form.assignMode === "committee" ? (form.assignTarget || "لجنة") : (form.assignee || "لي")}
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>
                    {formDropdown === "assignee" && (
                      <div className="absolute right-0 top-full mt-1.5 z-50 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-xl shadow-lg min-w-[260px] max-h-[360px] overflow-y-auto">
                        {/* Step 1: Choose mode */}
                        {assignStep === "mode" && (
                          <div className="p-2">
                            <p className="text-xs font-semibold text-gray-400 px-3 py-2">نوع الإسناد</p>
                            <button onClick={() => { setForm(f => ({ ...f, assignMode: "me", assignee: ASSIGNEES[0], assignTarget: undefined, assignMembers: undefined })); setAssignStep("members"); }} className={cn("w-full px-3 py-2.5 text-sm text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg transition-colors", form.assignMode === "me" ? "text-teal-600 font-semibold bg-teal-50/50" : "text-gray-700 dark:text-gray-200")}>
                              <UserCircle className="w-4 h-4" /> إسناد المهمة لي
                            </button>
                            <button onClick={() => { setForm(f => ({ ...f, assignMode: "team", assignee: "فريق", assignTarget: undefined, assignMembers: [] })); setAssignStep("list"); }} className={cn("w-full px-3 py-2.5 text-sm text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg transition-colors", form.assignMode === "team" ? "text-teal-600 font-semibold bg-teal-50/50" : "text-gray-700 dark:text-gray-200")}>
                              <Users className="w-4 h-4" /> إسناد المهمة لفريق
                            </button>
                            <button onClick={() => { setForm(f => ({ ...f, assignMode: "department", assignee: "قسم", assignTarget: undefined, assignMembers: [] })); setAssignStep("list"); }} className={cn("w-full px-3 py-2.5 text-sm text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg transition-colors", form.assignMode === "department" ? "text-teal-600 font-semibold bg-teal-50/50" : "text-gray-700 dark:text-gray-200")}>
                              <Building2 className="w-4 h-4" /> إسناد المهمة لقسم
                            </button>
                            <button onClick={() => { setForm(f => ({ ...f, assignMode: "committee", assignee: "لجنة", assignTarget: undefined, assignMembers: [] })); setAssignStep("list"); }} className={cn("w-full px-3 py-2.5 text-sm text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg transition-colors", form.assignMode === "committee" ? "text-teal-600 font-semibold bg-teal-50/50" : "text-gray-700 dark:text-gray-200")}>
                              <FolderOpen className="w-4 h-4" /> إسناد المهمة للجنة
                            </button>
                          </div>
                        )}
                        {/* Step 2: Choose list item (team/dept/committee) */}
                        {assignStep === "list" && form.assignMode && form.assignMode !== "me" && (
                          <div className="p-2">
                            <button onClick={() => setAssignStep("mode")} className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1 mb-1 flex items-center gap-1">← رجوع</button>
                            <p className="text-xs font-semibold text-gray-400 px-3 py-2">{form.assignMode === "team" ? "اختر الفريق" : form.assignMode === "department" ? "اختر القسم" : "اختر اللجنة"}</p>
                            {(form.assignMode === "team" ? TEAMS : form.assignMode === "department" ? DEPARTMENTS : COMMITTEES).map(item => (
                              <button key={item.name} onClick={() => { setForm(f => ({ ...f, assignTarget: item.name, assignMembers: [] })); setAssignStep("members"); }} className={cn("w-full px-3 py-2.5 text-sm text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg transition-colors", form.assignTarget === item.name ? "text-teal-600 font-semibold bg-teal-50/50" : "text-gray-700 dark:text-gray-200")}>
                                {form.assignMode === "team" ? <Users className="w-4 h-4" /> : form.assignMode === "department" ? <Building2 className="w-4 h-4" /> : <FolderOpen className="w-4 h-4" />}
                                {item.name}
                              </button>
                            ))}
                          </div>
                        )}
                        {/* Step 3: Choose members */}
                        {assignStep === "members" && (
                          <div className="p-2">
                            <button onClick={() => { if (form.assignMode === "me") setAssignStep("mode"); else setAssignStep("list"); }} className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1 mb-1 flex items-center gap-1">← رجوع</button>
                            {form.assignMode !== "me" && form.assignTarget && (
                              <>
                                <p className="text-xs font-semibold text-gray-400 px-3 py-1">{form.assignTarget}</p>
                                {/* Head */}
                                {(() => {
                                  const list = form.assignMode === "team" ? TEAMS : form.assignMode === "department" ? DEPARTMENTS : COMMITTEES;
                                  const item = list.find(i => i.name === form.assignTarget);
                                  if (!item || form.assignMode === "team" || !("head" in item)) return null;
                                  const head = (item as any).head;
                                  return (
                                    <div className="px-3 py-1">
                                      <p className="text-[10px] font-semibold text-gray-400 mb-1">القائد</p>
                                      <button onClick={() => { setForm(f => ({ ...f, assignMembers: [head] })); }} className={cn("w-full px-3 py-2 text-sm text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg transition-colors", (form.assignMembers || []).includes(head) ? "text-teal-600 font-semibold bg-teal-50/50" : "text-gray-700 dark:text-gray-200")}>
                                        <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white", avatarColor(head))}>{initials(head)}</span>
                                        {head}
                                      </button>
                                    </div>
                                  );
                                })()}
                                <p className="text-[10px] font-semibold text-gray-400 px-3 py-1 mt-1">الأعضاء</p>
                                {(() => {
                                  const list = form.assignMode === "team" ? TEAMS : form.assignMode === "department" ? DEPARTMENTS : COMMITTEES;
                                  const item = list.find(i => i.name === form.assignTarget);
                                  const members = item ? item.members : ASSIGNEES;
                                  return members.map(m => (
                                    <button key={m} onClick={() => {
                                      const cur = form.assignMembers || [];
                                      const next = cur.includes(m) ? cur.filter(x => x !== m) : [...cur, m];
                                      setForm(f => ({ ...f, assignMembers: next }));
                                    }} className={cn("w-full px-3 py-2 text-sm text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg transition-colors", (form.assignMembers || []).includes(m) ? "text-teal-600 font-semibold bg-teal-50/50" : "text-gray-700 dark:text-gray-200")}>
                                      <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white", avatarColor(m))}>{initials(m)}</span>
                                      {m}
                                      {(form.assignMembers || []).includes(m) && <span className="mr-auto text-teal-500 text-xs">✓</span>}
                                    </button>
                                  ));
                                })()}
                                <div className="px-3 pt-2 pb-1">
                                  <button onClick={() => { setFormDropdown(null); setAssignStep("mode"); }} className="w-full py-2 text-xs font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors">تم</button>
                                </div>
                              </>
                            )}
                            {form.assignMode === "me" && (
                              <>
                                <p className="text-xs font-semibold text-gray-400 px-3 py-2">اختر الشخص</p>
                                {ASSIGNEES.map(a => (
                                  <button key={a} onClick={() => { setForm(f => ({ ...f, assignee: a, assignTarget: undefined, assignMembers: undefined })); setFormDropdown(null); setAssignStep("mode"); }} className={cn("w-full px-3 py-2 text-sm text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg transition-colors", form.assignee === a ? "text-teal-600 font-semibold bg-teal-50/50" : "text-gray-700 dark:text-gray-200")}>
                                    <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white", avatarColor(a))}>{initials(a)}</span>
                                    {a}
                                    {form.assignee === a && <span className="mr-auto text-teal-500 text-xs">✓</span>}
                                  </button>
                                ))}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Due date */}
                  <div className="relative">
                    <button onClick={() => setFormDropdown(d => d === "dueDate" ? null : "dueDate")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                      <Calendar className="w-3.5 h-3.5" />
                      {form.dueDate ? fmtDate(form.dueDate) : "الموعد"}
                    </button>
                    {formDropdown === "dueDate" && (
                      <div className="absolute right-0 top-full mt-1.5 z-50 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-xl shadow-lg p-3 min-w-[280px]">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-500 text-center">تاريخ البدء</span>
                          <span className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 border border-blue-100 text-center">الموعد النهائي</span>
                        </div>
                        <input type="date" value={form.dueDate || today} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full rounded-lg border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none mb-2" dir="ltr" />
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            { label: "اليوم", val: today },
                            { label: "غداً", val: new Date(Date.now() + 86400000).toISOString().split("T")[0] },
                            { label: "بعد أسبوع", val: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0] },
                            { label: "بعد أسبوعين", val: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0] },
                          ].map(q => (
                            <button key={q.label} onClick={() => { setForm(f => ({ ...f, dueDate: q.val })); setFormDropdown(null); }} className="text-right px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">{q.label}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Priority */}
                  <div className="relative">
                    <button onClick={() => setFormDropdown(d => d === "priority" ? null : "priority")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                      <Flag className={cn("w-3.5 h-3.5", PRIORITY_CONFIG[form.priority || "medium"].flag)} />
                      {PRIORITY_CONFIG[form.priority || "medium"].label}
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>
                    {formDropdown === "priority" && (
                      <div className="absolute right-0 top-full mt-1.5 z-50 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[160px]">
                        {(["urgent","high","medium","low"] as TaskPriority[]).map(p => (
                          <button key={p} onClick={() => { setForm(f => ({ ...f, priority: p })); setFormDropdown(null); }} className={cn("w-full px-4 py-2 text-sm text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors", (form.priority || "medium") === p ? "font-semibold" : "text-gray-700 dark:text-gray-200")}>
                            <Flag className={cn("w-3.5 h-3.5", PRIORITY_CONFIG[p].flag)} />
                            {PRIORITY_CONFIG[p].label}
                          </button>
                        ))}
                        <div className="border-t border-gray-100 dark:border-neutral-700 mt-1 pt-1">
                          <button onClick={() => { setForm(f => ({ ...f, priority: "medium" })); setFormDropdown(null); }} className="w-full px-4 py-2 text-sm text-right text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors flex items-center gap-2"><X className="w-3.5 h-3.5" /> مسح</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="relative">
                    <button onClick={() => setFormDropdown(d => d === "tags" ? null : "tags")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                      <TagIcon className="w-3.5 h-3.5" />
                      {(form.tags && form.tags.length > 0) ? (form.tags.length > 1 ? `${form.tags.length} وسوم` : form.tags[0]) : "الوسوم"}
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>
                    {formDropdown === "tags" && (
                      <div className="absolute right-0 top-full mt-1.5 z-50 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-xl shadow-lg p-3 min-w-[220px]">
                        <p className="text-xs text-gray-400 mb-2">اختر تاجاً</p>
                        <div className="flex flex-wrap gap-1.5">
                          {["تصميم","تطوير","تسويق","مراجعة","عاجل","مبيعات"].map(tag => (
                            <button key={tag} onClick={() => { const cur = form.tags || []; const next = cur.includes(tag) ? cur.filter(t => t !== tag) : [...cur, tag]; setForm(f => ({ ...f, tags: next })); }} className={cn("px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors", (form.tags || []).includes(tag) ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>{tag}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Source */}
                  <div className="relative">
                    <button onClick={() => setFormDropdown(d => d === "source" ? null : "source")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                      <Inbox className="w-3.5 h-3.5" />
                      {form.taskSource || "مصدر المهمة"}
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>
                    {formDropdown === "source" && (
                      <div className="absolute right-0 top-full mt-1.5 z-50 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[160px]">
                        {SOURCES.map(s => (
                          <button key={s} onClick={() => { setForm(f => ({ ...f, taskSource: s })); setFormDropdown(null); }} className={cn("w-full px-4 py-2 text-sm text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors", form.taskSource === s ? "text-teal-600 font-semibold" : "text-gray-700 dark:text-gray-200")}>
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Project */}
                  <div className="relative">
                    <button onClick={() => setFormDropdown(d => d === "project" ? null : "project")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                      <Briefcase className="w-3.5 h-3.5" />
                      {form.projectName || "المشروع"}
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>
                    {formDropdown === "project" && (
                      <div className="absolute right-0 top-full mt-1.5 z-50 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[200px]">
                        {PROJECTS.map(p => (
                          <button key={p} onClick={() => { setForm(f => ({ ...f, projectName: p })); setFormDropdown(null); }} className={cn("w-full px-4 py-2 text-sm text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors", form.projectName === p ? "text-teal-600 font-semibold" : "text-gray-700 dark:text-gray-200")}>
                            {p}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* More */}
                  <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                </div>

                {/* Selected tags */}
                {(form.tags || []).length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(form.tags || []).map(tag => <span key={tag} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-500 text-white">{tag}</span>)}
                  </div>
                )}

                {/* Progress */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">نسبة الإنجاز: {form.progress}%</label>
                  <input type="range" min={0} max={100} value={form.progress || 0} onChange={e => setForm(f => ({ ...f, progress: parseInt(e.target.value) }))} className="w-full accent-teal-500" />
                </div>

              </div>

              {/* Footer */}
              <div className="flex items-center justify-end px-6 py-3 border-t border-gray-100 dark:border-neutral-700 gap-2">
                <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"><Paperclip className="w-4 h-4" /></button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"><Bell className="w-4 h-4" /></button>
                <button onClick={save} className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">{editing ? "حفظ التعديلات" : "إنشاء مهمة"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
