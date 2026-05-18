import { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Search, SlidersHorizontal, ChevronDown, ChevronUp, X, MoreHorizontal, List, LayoutGrid, Calendar as CalendarIcon, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

type TaskStatus = "todo" | "in-progress" | "in-review" | "completed" | "overdue";
type TaskPriority = "low" | "medium" | "high";
type ViewMode = "list" | "kanban" | "calendar";

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
}

const ASSIGNEES = ["فهد العتيبي", "نورة السبيعي", "خالد القحطاني", "منى الزهراني", "أحمد الشمري", "سارة الدوسري"];
const PROJECTS = ["معرض الرياض بارك", "فرع جدة بارك", "معرض الظهران مول", "فرع الرياض جاليري", "معرض الخبر بلازا", "فرع مكة مول"];
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

const STATUS_CONFIG: Record<TaskStatus, { label: string; accent: string; badgeBg: string; badgeText: string }> = {
  todo:         { label: "قيد الانتظار", accent: "bg-neutral-800", badgeBg: "bg-neutral-100", badgeText: "text-neutral-800" },
  "in-progress":{ label: "قيد العمل",    accent: "bg-orange-400",  badgeBg: "bg-orange-50",   badgeText: "text-orange-600" },
  "in-review":  { label: "تحت المراجعة",accent: "bg-violet-500",  badgeBg: "bg-violet-50",   badgeText: "text-violet-700" },
  completed:    { label: "منتهية",       accent: "bg-teal-500",    badgeBg: "bg-teal-50",     badgeText: "text-teal-700" },
  overdue:      { label: "متأخرة",       accent: "bg-red-500",     badgeBg: "bg-red-50",      badgeText: "text-red-600" },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; bg: string; text: string }> = {
  high:   { label: "عالية",   bg: "bg-red-100",    text: "text-red-500" },
  medium: { label: "متوسطة",  bg: "bg-teal-100",   text: "text-teal-600" },
  low:    { label: "منخفضة",  bg: "bg-violet-100", text: "text-violet-600" },
};

interface TasksPageProps { onBack?: () => void; }

const COLS = [
  { key: "id",          label: "رقم المهمة" },
  { key: "title",       label: "اسم المهمة" },
  { key: "assignee",    label: "المسؤول" },
  { key: "projectName", label: "المشروع" },
  { key: "progress",    label: "الإنجاز" },
  { key: "dueDate",     label: "الموعد النهائي" },
  { key: "priority",    label: "الأولوية" },
  { key: "action",      label: "إجراء" },
] as const;

export default function TasksPage({ onBack: _onBack }: TasksPageProps) {
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
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(null); };
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
  const openCreate = () => { setEditing(null); setForm({ status: "todo", priority: "medium", dueDate: today, assignee: ASSIGNEES[0], progress: 0, projectName: PROJECTS[0] }); setModalOpen(true); };
  const openEdit = (t: Task) => { setEditing(t); setForm({ ...t }); setModalOpen(true); setMenuOpen(null); };
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
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 font-sans" dir="rtl">
      {/* Toolbar */}
      <div className="sticky top-0 z-40 bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 px-4 sm:px-6 py-3 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث في المهام..."
            className="w-full pr-9 pl-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 text-right" />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors">
          <SlidersHorizontal className="w-4 h-4" /> تصفية
        </button>
        <div className="mr-auto flex items-center gap-1 border border-gray-200 dark:border-neutral-600 rounded-lg p-0.5 bg-white dark:bg-neutral-800">
          {([["list","قائمة",List],["kanban","كانبان",LayoutGrid],["calendar","تقويم",CalendarIcon]] as [ViewMode, string, React.ElementType][]).map(([v, label, Icon]) => (
            <button key={v} onClick={() => setViewMode(v)} className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors", viewMode === v ? "bg-gray-100 dark:bg-neutral-700 text-gray-800 dark:text-gray-100" : "text-gray-500 dark:text-gray-400 hover:text-gray-700")}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> إضافة مهمة
        </button>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 space-y-4">
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
                              {/* Task ID */}
                              <td className="px-3 py-3.5 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap font-mono text-right">{task.id}</td>
                              {/* Task Name */}
                              <td className="px-3 py-3.5 min-w-[180px] max-w-[260px]">
                                <p className="text-sm text-gray-700 dark:text-gray-200 truncate text-right" title={task.title}>{task.title}</p>
                              </td>
                              {/* Assignee */}
                              <td className="px-3 py-3.5 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0", avatarColor(task.assignee))}>
                                    {initials(task.assignee)}
                                  </div>
                                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{task.assignee}</span>
                                </div>
                              </td>
                              {/* Project */}
                              <td className="px-3 py-3.5 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap max-w-[160px] truncate">{task.projectName}</td>
                              {/* Progress */}
                              <td className="px-3 py-3.5 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{task.progress}%</td>
                              {/* Deadline */}
                              <td className={cn("px-3 py-3.5 text-sm whitespace-nowrap", task.dueDate < today && task.status !== "completed" ? "text-red-500 font-semibold" : "text-gray-500 dark:text-gray-400")}>
                                {fmtDate(task.dueDate)}
                              </td>
                              {/* Priority */}
                              <td className="px-3 py-3.5">
                                <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", PRIORITY_CONFIG[task.priority].bg, PRIORITY_CONFIG[task.priority].text)}>
                                  {PRIORITY_CONFIG[task.priority].label}
                                </span>
                              </td>
                              {/* Action */}
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
        {filtered.length === 0 && <div className="text-center py-16 text-gray-400 text-sm">لا توجد مهام مطابقة</div>}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-neutral-700">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">{editing ? "تعديل مهمة" : "إضافة مهمة"}</h3>
                <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-400"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-3.5">
                <div><label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">اسم المهمة</label>
                  <input value={form.title || ""} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full rounded-lg border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400/40 text-right" placeholder="عنوان المهمة" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">الوصف</label>
                  <textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400/40 resize-none text-right" placeholder="وصف المهمة" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">الحالة</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))} className="w-full rounded-lg border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none text-right">
                      {(["todo","in-progress","in-review","completed","overdue"] as TaskStatus[]).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}</select></div>
                  <div><label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">الأولوية</label>
                    <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as TaskPriority }))} className="w-full rounded-lg border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none text-right">
                      {(["low","medium","high"] as TaskPriority[]).map(p => <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">الموعد النهائي</label>
                    <input type="date" value={form.dueDate || today} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full rounded-lg border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none" dir="ltr" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">المسؤول</label>
                    <select value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))} className="w-full rounded-lg border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none text-right">
                      {ASSIGNEES.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
                </div>
                <div><label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">المشروع / الفرع</label>
                  <select value={form.projectName} onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))} className="w-full rounded-lg border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none text-right">
                    {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                <div><label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">نسبة الإنجاز: {form.progress}%</label>
                  <input type="range" min={0} max={100} value={form.progress || 0} onChange={e => setForm(f => ({ ...f, progress: parseInt(e.target.value) }))} className="w-full accent-teal-500" /></div>
              </div>
              <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-100 dark:border-neutral-700">
                <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 transition-colors">إلغاء</button>
                <button onClick={save} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 transition-colors">حفظ المهمة</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
