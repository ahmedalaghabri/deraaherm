import { useState, useEffect, useMemo, useRef, Fragment } from "react";
import { Plus, Search, SlidersHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X, MoreHorizontal, List, LayoutGrid, Calendar as CalendarIcon, ArrowUpDown, Megaphone, Briefcase, Flag, UserCircle, Paperclip, Bell, Calendar, Users, Building2, FolderOpen, Inbox, Clock, CheckSquare, Circle, Send, Star, Hash, Play, FilePlus, Pencil, Trash2, Printer, FileDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import CampaignsPage from "./CampaignsPage";
import TeamsPage from "./TeamsPage";
import VisitsPage from "./VisitsPage";

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
  createdAt?: string;
  startDate?: string;
  timeEstimate?: string;
  subtasks?: Task[];
  checklist?: { id: string; text: string; checked: boolean }[];
  attachments?: { id: string; name: string; size: string; type?: string; url?: string }[];
  comments?: { id: string; author: string; text: string; date: string; createdAt?: number; attachments?: { id: string; name: string; size: string; type?: string; url?: string }[] }[];
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
function avatarColor(name?: string | null) { if (!name) return AVATAR_COLORS[0]; return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]; }
function initials(name?: string | null) { if (!name) return "?"; const p = name.trim().split(" "); return p.length >= 2 ? p[0][0] + p[1][0] : name.slice(0,2); }
function avatarUrl(name?: string | null) { if (!name) return "https://randomuser.me/api/portraits/men/0.jpg"; const hash = name.split("").reduce((a, b) => a + b.charCodeAt(0), 0); return `https://randomuser.me/api/portraits/men/${hash % 99}.jpg`; }
function getMentionContext(text: string, cursorPos: number): { query: string; startIndex: number } | null {
  const beforeCursor = text.slice(0, cursorPos);
  const lastAt = beforeCursor.lastIndexOf("@");
  if (lastAt === -1) return null;
  const afterAt = beforeCursor.slice(lastAt + 1);
  if (afterAt.includes(" ")) return null;
  return { query: afterAt, startIndex: lastAt };
}
const MENTION_OPTIONS = [
  ...ASSIGNEES.map(name => ({ id: name, label: name, type: "person" as const })),
  ...TEAMS.map(t => ({ id: t.name, label: t.name, type: "team" as const })),
  ...DEPARTMENTS.map(d => ({ id: d.name, label: d.name, type: "department" as const })),
  ...COMMITTEES.map(c => ({ id: c.name, label: c.name, type: "committee" as const })),
];
async function readFile(file: File): Promise<{ name: string; size: string; type: string; url: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        name: file.name,
        size: file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type,
        url: e.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  });
}

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
    { id: "P991254-1", title: "جرد مخزون عطور الفرع الرئيسي", description: "فحص الكميات الفعلية لمنتجات فروج ومونتال", status: "todo", priority: "high", dueDate: "2026-06-10", assignee: "فهد العتيبي", progress: 0, projectName: "معرض الرياض بارك", createdAt: "2026-05-20" },
    { id: "P552714-2", title: "تدريب بائعي قسم النيش براند", description: "شرح خصائص العطور النيش للفريق", status: "todo", priority: "high", dueDate: "2026-06-02", assignee: "نورة السبيعي", progress: 0, projectName: "فرع جدة بارك", createdAt: "2026-05-21" },
    { id: "P882726-3", title: "تحضير عرض ترويجي لعيد الفطر", description: "تصميم باقات عطور بأسعار مغرية مع تغليف هدايا", status: "todo", priority: "low", dueDate: "2026-05-31", assignee: "نورة السبيعي", progress: 0, projectName: "فرع مكة مول", createdAt: "2026-05-22" },
    { id: "P883561-1", title: "توزيع استبيانات قياس رضا العملاء", description: "رصد تجربة الشراء وتحليل النتائج", status: "in-progress", priority: "medium", dueDate: "2026-05-25", assignee: "أحمد الشمري", progress: 80, projectName: "معرض الظهران مول", createdAt: "2026-05-15" },
    { id: "P919712-2", title: "جدولة جلسات عرض العطور الموسمية", description: "تنسيق مع موردي العطور الصيفية", status: "in-progress", priority: "high", dueDate: "2026-05-24", assignee: "منى الزهراني", progress: 55, projectName: "معرض الرياض بارك", createdAt: "2026-05-16" },
    { id: "P913762-3", title: "التنسيق مع متحدثين خارجيين لمعرض العطور", description: "التواصل مع خبراء العطور الدوليين", status: "in-progress", priority: "low", dueDate: "2026-05-30", assignee: "خالد القحطاني", progress: 76, projectName: "فرع الرياض جاليري", createdAt: "2026-05-17" },
    { id: "P125773-1", title: "مراجعة قائمة المنتجات الجديدة للفرع", description: "التحقق من جاهزية المنتجات قبل الإطلاق", status: "in-review", priority: "medium", dueDate: "2026-05-26", assignee: "سارة الدوسري", progress: 90, projectName: "معرض الخبر بلازا", createdAt: "2026-05-18" },
    { id: "P927572-2", title: "استلام شحنة عطور جديدة - مونتال", description: "فحص جودة الشحنة وتسجيلها في النظام", status: "in-review", priority: "high", dueDate: "2026-05-28", assignee: "فهد العتيبي", progress: 86, projectName: "فرع جدة بارك", createdAt: "2026-05-19" },
    { id: "P012263-3", title: "تصميم كتالوج عطور الصيف 2026", description: "اختيار المنتجات الموسمية وتصميم الكتالوج الرقمي", status: "in-review", priority: "medium", dueDate: "2026-05-22", assignee: "منى الزهراني", progress: 89, projectName: "معرض الرياض بارك", createdAt: "2026-05-20" },
    { id: "P774412-1", title: "مراجعة تقرير مبيعات أبريل", description: "تحليل أداء الفروع ومقارنة الأهداف الشهرية", status: "completed", priority: "medium", dueDate: "2026-05-05", assignee: "خالد القحطاني", progress: 100, projectName: "فرع الرياض جاليري", createdAt: "2026-04-10" },
    { id: "P338821-2", title: "تحديث قائمة الأسعار بعد الضريبة", description: "تطبيق نسبة الضريبة الجديدة على جميع المنتجات", status: "completed", priority: "low", dueDate: "2026-05-01", assignee: "سارة الدوسري", progress: 100, projectName: "فرع جدة بارك", createdAt: "2026-04-15" },
    { id: "P558832-1", title: "مراجعة عقود إيجار الفروع الجديدة", description: "الاطلاع على بنود عقود الفروع المقرر افتتاحها", status: "overdue", priority: "high", dueDate: "2026-05-10", assignee: "أحمد الشمري", progress: 30, projectName: "معرض الخبر بلازا", createdAt: "2026-04-20" },
  ];
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; accent: string; badgeBg: string; badgeText: string; badgeBorder: string; colBg: string; headerDot: string }> = {
  todo:         { label: "قيد الانتظار", accent: "bg-neutral-800", badgeBg: "bg-neutral-100",  badgeText: "text-neutral-800", badgeBorder: "border-neutral-200",  colBg: "bg-gray-50  dark:bg-neutral-800/60",   headerDot: "bg-neutral-700" },
  "in-progress":{ label: "قيد العمل",    accent: "bg-blue-500",   badgeBg: "bg-blue-100",    badgeText: "text-blue-700",    badgeBorder: "border-blue-200",    colBg: "bg-blue-50  dark:bg-blue-900/20",     headerDot: "bg-blue-500" },
  "in-review":  { label: "تحت المراجعة",accent: "bg-orange-500",  badgeBg: "bg-orange-100",  badgeText: "text-orange-700",  badgeBorder: "border-orange-200",  colBg: "bg-orange-50 dark:bg-orange-900/20",  headerDot: "bg-orange-500" },
  completed:    { label: "منتهية",       accent: "bg-teal-500",   badgeBg: "bg-teal-100",    badgeText: "text-teal-700",    badgeBorder: "border-teal-200",    colBg: "bg-teal-50  dark:bg-teal-900/20",     headerDot: "bg-teal-500" },
  overdue:      { label: "متأخرة",       accent: "bg-red-500",    badgeBg: "bg-red-100",     badgeText: "text-red-700",     badgeBorder: "border-red-200",     colBg: "bg-red-50   dark:bg-red-900/20",      headerDot: "bg-red-500" },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; bg: string; text: string; flag: string }> = {
  urgent: { label: "عاجلة",   bg: "bg-red-100",    text: "text-red-600",    flag: "text-red-500" },
  high:   { label: "عالية",   bg: "bg-amber-100",  text: "text-amber-600",  flag: "text-amber-500" },
  medium: { label: "متوسطة",  bg: "bg-blue-100",   text: "text-blue-600",   flag: "text-blue-500" },
  low:    { label: "منخفضة",  bg: "bg-gray-100",   text: "text-gray-600",   flag: "text-gray-400" },
};

interface TasksPageProps { onBack?: () => void; onNewCampaign?: () => void; onNewProject?: () => void; }

const COLS = [
  { key: "title",       label: "اسم المهمة" },
  { key: "assignee",    label: "المسؤول" },
  { key: "createdAt",   label: "تاريخ الإنشاء" },
  { key: "progress",    label: "الإنجاز" },
  { key: "subtasks",    label: "مهام فرعية" },
  { key: "dueDate",     label: "الموعد النهائي" },
  { key: "priority",    label: "الأولوية" },
  { key: "projectName", label: "المشروع" },
  { key: "source",      label: "المصدر" },
  { key: "status",      label: "الحالة" },
  { key: "id",          label: "رقم المهمة" },
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
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"tasks" | "campaigns" | "projects" | "teams" | "visits">("tasks");
  const [detailMobileTab, setDetailMobileTab] = useState<"details" | "activity">("details");
  const [detailDropdown, setDetailDropdown] = useState<"status" | "assignee" | "priority" | "dueDate" | "source" | "project" | "tags" | null>(null);
  const [formDropdown, setFormDropdown] = useState<"status" | "assignee" | "dueDate" | "priority" | "tags" | "source" | "project" | null>(null);
  const formDropdownRef = useRef<HTMLDivElement>(null);
  const [assignStep, setAssignStep] = useState<"mode" | "list" | "members">("mode");
  const assignDropdownRef = useRef<HTMLDivElement>(null);
  const [tableDropdown, setTableDropdown] = useState<{
    id: string;
    field: "assignee" | "project" | "source" | "progress" | "dueDate" | "priority" | "status";
    top: number;
    right: number;
  } | null>(null);
  const [teamsFilter, setTeamsFilter] = useState<"all" | "team" | "department" | "committee">("all");
  const [teamsSearch, setTeamsSearch] = useState("");
  const [teamsView, setTeamsView] = useState<"table" | "cards">("table");
  const [campaignsSearch, setCampaignsSearch] = useState("");
  const tableDropdownRef = useRef<HTMLDivElement | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [sortField, setSortField] = useState<"dueDate" | "priority" | "progress" | "createdAt" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">("all");
  const [filterAssignee, setFilterAssignee] = useState<string | "all">("all");
  const [filterProject, setFilterProject] = useState<string | "all">("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailComment, setDetailComment] = useState("");
  const [detailEditingComment, setDetailEditingComment] = useState<{ id: string; text: string } | null>(null);
  const [detailCommentAttachments, setDetailCommentAttachments] = useState<{ id: string; name: string; size: string; type: string; url: string }[]>([]);
  const [detailMention, setDetailMention] = useState<{ query: string; startIndex: number } | null>(null);
  const [detailShowSubtaskForm, setDetailShowSubtaskForm] = useState(false);
  const [detailSubtaskForm, setDetailSubtaskForm] = useState<Partial<Task>>({});
  const [detailSubtaskDropdown, setDetailSubtaskDropdown] = useState<"status" | "priority" | "assignee" | "dueDate" | null>(null);
  const [detailSubtaskTouched, setDetailSubtaskTouched] = useState<Set<string>>(new Set());
  const [detailEditingSubtaskId, setDetailEditingSubtaskId] = useState<string | null>(null);
  const [detailEditingSubtaskForm, setDetailEditingSubtaskForm] = useState<Partial<Task>>({});
  const [detailEditingSubtaskDropdown, setDetailEditingSubtaskDropdown] = useState<"status" | "priority" | "assignee" | "dueDate" | null>(null);
  const [formShowSubtaskForm, setFormShowSubtaskForm] = useState(false);
  const [formSubtaskForm, setFormSubtaskForm] = useState<Partial<Task>>({});
  const [formSubtaskDropdown, setFormSubtaskDropdown] = useState<"status" | "priority" | "assignee" | "dueDate" | null>(null);
  const [formSubtaskTouched, setFormSubtaskTouched] = useState<Set<string>>(new Set());
  const [formEditingSubtaskId, setFormEditingSubtaskId] = useState<string | null>(null);
  const [formEditingSubtaskForm, setFormEditingSubtaskForm] = useState<Partial<Task>>({});
  const [formEditingSubtaskDropdown, setFormEditingSubtaskDropdown] = useState<"status" | "priority" | "assignee" | "dueDate" | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [formMobileTab, setFormMobileTab] = useState<"details" | "activity">("details");
  const [formComment, setFormComment] = useState("");
  const [formEditingComment, setFormEditingComment] = useState<{ id: string; text: string } | null>(null);
  const [formTouched, setFormTouched] = useState<Set<string>>(new Set());
  const [formCommentAttachments, setFormCommentAttachments] = useState<{ id: string; name: string; size: string; type: string; url: string }[]>([]);
  const [formMention, setFormMention] = useState<{ query: string; startIndex: number } | null>(null);
  const detailFileInputRef = useRef<HTMLInputElement>(null);
  const formFileInputRef = useRef<HTMLInputElement>(null);
  const taskFileInputRef = useRef<HTMLInputElement>(null);
  const detailTitleRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (detailTitleRef.current) {
      detailTitleRef.current.style.height = "auto";
      detailTitleRef.current.style.height = detailTitleRef.current.scrollHeight + "px";
    }
  }, [detailTask?.title]);

  const activeFilterCount = (filterStatus !== "all" ? 1 : 0) + (filterPriority !== "all" ? 1 : 0) + (filterAssignee !== "all" ? 1 : 0) + (filterProject !== "all" ? 1 : 0) + (sortField ? 1 : 0);
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
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (tableDropdownRef.current && !tableDropdownRef.current.contains(e.target as Node)) setTableDropdown(null);
      if (assignDropdownRef.current && assignDropdownRef.current.contains(e.target as Node)) {
        // keep assign dropdown open
      } else {
        if (formDropdownRef.current && !formDropdownRef.current.contains(e.target as Node)) setFormDropdown(null);
        setAssignStep("mode");
      }
    };
    const onScroll = () => setTableDropdown(null);
    document.addEventListener("mousedown", handler);
    window.addEventListener("scroll", onScroll, true);
    return () => { document.removeEventListener("mousedown", handler); window.removeEventListener("scroll", onScroll, true); };
  }, []);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  useEffect(() => { setDetailSubtaskForm({ status: "todo", priority: "medium", dueDate: today, assignee: ASSIGNEES[0], progress: 0, projectName: PROJECTS[0] }); }, [today]);
  useEffect(() => { setFormSubtaskForm({ status: "todo", priority: "medium", dueDate: today, assignee: ASSIGNEES[0], progress: 0, projectName: PROJECTS[0] }); }, [today]);

  const filtered = useMemo(() => {
    let res = tasks;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      res = res.filter(t => t.title.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q) || t.projectName.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
    }
    if (filterStatus !== "all") res = res.filter(t => t.status === filterStatus);
    if (filterPriority !== "all") res = res.filter(t => t.priority === filterPriority);
    if (filterAssignee !== "all") res = res.filter(t => t.assignee === filterAssignee);
    if (filterProject !== "all") res = res.filter(t => t.projectName === filterProject);
    if (sortField) {
      const priorityOrder: Record<TaskPriority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
      res = [...res].sort((a, b) => {
        let cmp = 0;
        if (sortField === "priority") cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
        else if (sortField === "progress") cmp = a.progress - b.progress;
        else if (sortField === "dueDate") cmp = (a.dueDate || "").localeCompare(b.dueDate || "");
        else if (sortField === "createdAt") cmp = (a.createdAt || "").localeCompare(b.createdAt || "");
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return res;
  }, [tasks, search, filterStatus, filterPriority, sortField, sortDir]);

  const grouped = useMemo(() => {
    const g: Record<TaskStatus, Task[]> = { todo: [], "in-progress": [], "in-review": [], completed: [], overdue: [] };
    filtered.forEach(t => g[t.status].push(t));
    return g;
  }, [filtered]);

  const toggle = (s: TaskStatus) => setExpanded(p => ({ ...p, [s]: !p[s] }));
  const openCreate = () => { setEditing(null); setForm({ status: "todo", priority: "medium", dueDate: today, assignee: ASSIGNEES[0], progress: 0, projectName: PROJECTS[0], assignMode: "me", assignTarget: undefined, assignMembers: undefined, taskSource: SOURCES[0], createdAt: today }); setModalOpen(true); setAssignStep("mode"); setFormMobileTab("details"); setFormComment(""); setFormTouched(new Set()); setFormCommentAttachments([]); setFormMention(null); setFormShowSubtaskForm(false); setFormSubtaskForm({ status: "todo", priority: "medium", dueDate: today, assignee: ASSIGNEES[0], progress: 0, projectName: PROJECTS[0] }); setFormSubtaskDropdown(null); setFormSubtaskTouched(new Set()); setFormEditingSubtaskId(null); setFormEditingSubtaskForm({}); setFormEditingSubtaskDropdown(null); };
  const openEdit = (t: Task) => { setEditing(t); setForm({ ...t }); setModalOpen(true); setMenuOpen(null); setAssignStep("mode"); setFormMobileTab("details"); setFormComment(""); setFormTouched(new Set(["status","assignee","dueDate","priority","tags","source","project"])); setFormCommentAttachments([]); setFormMention(null); setFormShowSubtaskForm(false); setFormSubtaskForm({ status: "todo", priority: "medium", dueDate: today, assignee: ASSIGNEES[0], progress: 0, projectName: PROJECTS[0] }); setFormSubtaskDropdown(null); setFormSubtaskTouched(new Set()); setFormEditingSubtaskId(null); setFormEditingSubtaskForm({}); setFormEditingSubtaskDropdown(null); };
  const openDetail = (t: Task) => { setDetailTask(t); setDetailOpen(true); setMenuOpen(null); setTableDropdown(null); setDetailCommentAttachments([]); setDetailMention(null); };
  const closeDetail = () => { setDetailOpen(false); setDetailTask(null); setDetailComment(""); setDetailCommentAttachments([]); setDetailEditingComment(null); setDetailMention(null); setDetailShowSubtaskForm(false); setDetailSubtaskForm({ status: "todo", priority: "medium", dueDate: today, assignee: ASSIGNEES[0], progress: 0, projectName: PROJECTS[0] }); setDetailSubtaskDropdown(null); setDetailSubtaskTouched(new Set()); setDetailEditingSubtaskId(null); setDetailEditingSubtaskForm({}); setDetailEditingSubtaskDropdown(null); };
  const save = () => {
    if (!form.title?.trim()) return;
    if (editing) setTasks(p => p.map(t => t.id === editing.id ? { ...t, ...form } as Task : t));
    else {
      const uid = "P" + String(Date.now()).slice(-6) + "-" + (tasks.length + 1);
      setTasks(p => [...p, { id: uid, ...form } as Task]);
    }
    setModalOpen(false);
    setFormMobileTab("details");
    setFormComment("");
    setFormTouched(new Set());
    setFormCommentAttachments([]);
    setFormEditingComment(null);
    setFormMention(null);
  };
  const remove = (id: string) => { if (confirm("هل أنت متأكد من حذف هذه المهمة؟")) { setTasks(p => p.filter(t => t.id !== id)); setMenuOpen(null); } };
  const updateTask = (id: string, changes: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...changes } : t)));
  };

  const order: TaskStatus[] = ["todo", "in-progress", "in-review", "overdue", "completed"];

  return (
    <div className="min-h-screen bg-[#0000000] dark:bg-neutral-900 font-sans" dir="rtl">
      {/* Top bar: Tabs + Toolbar */}
      <div className="sticky top-0 z-40 md:z-30 bg-white dark:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700 rounded-xl">
        <div className="max-w-[1400px] mx-auto">
          <AnimatePresence initial={false}>
          {!headerCollapsed && (
          <motion.div
            key="full-header"
            variants={{
              show: { height: "auto", opacity: 1, transition: { height: { type: "spring", stiffness: 700, damping: 42, mass: 0.4 }, opacity: { duration: 0.07, ease: "easeOut" } } },
              hide: { height: 0, opacity: 0, transition: { height: { type: "spring", stiffness: 500, damping: 38, mass: 0.8 }, opacity: { duration: 0.1, ease: "easeIn" } } }
            }}
            initial="hide"
            animate="show"
            exit="hide"
            className="overflow-hidden"
          >
          {/* Tabs row */}
          <div className="px-1 sm:px-4 py-2 border-b border-neutral-100 dark:border-neutral-700">
            <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-700 rounded-full p-1 w-full min-w-0 sm:max-w-[60%] sm:mx-auto">
            {([
              { key: "tasks" as const, label: "المهام" },
              { key: "campaigns" as const, label: "الحملات" },
              { key: "projects" as const, label: "المشاريع" },
              { key: "teams" as const, label: "الفرق" },
              { key: "visits" as const, label: "الزيارات" },
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

          {/* Toolbar row + Add button */}
          <div className="px-2 sm:px-6 py-2 sm:py-[14px] flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex-1 min-w-0">
              <div>
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {activeTab === "tasks" && (
            <>
              <div className="relative flex-1 max-w-[140px] sm:max-w-xs">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..."
                  className="w-full pr-9 pl-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 text-right" />
              </div>
              {/* Active filter chips */}
              {activeFilterCount > 0 && (
                <div className="hidden md:flex items-center gap-1 flex-wrap">
                  {sortField && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-[11px] font-medium border border-neutral-200 dark:border-neutral-600">
                      <ArrowUpDown className="w-3 h-3" />
                      {sortField === "dueDate" ? "الموعد" : sortField === "priority" ? "الأولوية" : sortField === "progress" ? "الإنجاز" : "الإنشاء"}
                      {sortDir === "asc" ? " ↑" : " ↓"}
                      <button onClick={() => setSortField(null)} className="hover:text-neutral-900 dark:hover:text-white"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {filterStatus !== "all" && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-[11px] font-medium border border-neutral-200 dark:border-neutral-600">
                      <Inbox className="w-3 h-3" /> {STATUS_CONFIG[filterStatus].label}
                      <button onClick={() => setFilterStatus("all")} className="hover:text-neutral-900 dark:hover:text-white"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {filterPriority !== "all" && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-[11px] font-medium border border-neutral-200 dark:border-neutral-600">
                      <Flag className="w-3 h-3" /> {PRIORITY_CONFIG[filterPriority].label}
                      <button onClick={() => setFilterPriority("all")} className="hover:text-neutral-900 dark:hover:text-white"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {filterAssignee !== "all" && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-[11px] font-medium border border-neutral-200 dark:border-neutral-600">
                      <UserCircle className="w-3 h-3" /> {filterAssignee}
                      <button onClick={() => setFilterAssignee("all")} className="hover:text-neutral-900 dark:hover:text-white"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {filterProject !== "all" && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-[11px] font-medium border border-neutral-200 dark:border-neutral-600">
                      <FolderOpen className="w-3 h-3" /> {filterProject}
                      <button onClick={() => setFilterProject("all")} className="hover:text-neutral-900 dark:hover:text-white"><X className="w-3 h-3" /></button>
                    </span>
                  )}
                </div>
              )}

              <div className="relative" ref={filterRef}>
                <button onClick={() => setFilterOpen(v => !v)} className={cn("flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-sm border rounded-xl transition-all duration-200 relative", filterOpen || activeFilterCount > 0 ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white shadow-sm" : "text-gray-600 dark:text-gray-300 border-gray-200 dark:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-700")}>
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">تصفية</span>
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full bg-white text-neutral-900 text-[10px] font-bold shadow-sm border border-neutral-200">{activeFilterCount}</span>
                  )}
                </button>
              </div>

              {/* Filter Drawer Overlay */}
              <AnimatePresence>
                {filterOpen && (
                  <>
                    {/* Backdrop */}
                    <motion.div
                      key="filter-backdrop"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]"
                      onClick={() => setFilterOpen(false)}
                    />
                    {/* Drawer */}
                    <motion.div
                      key="filter-drawer"
                      initial={{ x: "100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "100%" }}
                      transition={{ type: "spring", stiffness: 400, damping: 38, mass: 0.6 }}
                      className="fixed top-0 right-0 h-full w-[320px] max-w-[90vw] z-[70] bg-white dark:bg-neutral-900 shadow-2xl flex flex-col"
                      dir="rtl"
                    >
                      {/* Drawer Header */}
                      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center">
                            <SlidersHorizontal className="w-4 h-4 text-white dark:text-neutral-900" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-neutral-900 dark:text-white">تصفية وترتيب</p>
                            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{filtered.length} نتيجة مطابقة</p>
                          </div>
                        </div>
                        <button onClick={() => setFilterOpen(false)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 dark:text-neutral-500 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Drawer Body */}
                      <div className="flex-1 overflow-y-auto p-5 space-y-6">

                        {/* Sort */}
                        <div>
                          <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                            <ArrowUpDown className="w-3 h-3" /> ترتيب حسب
                          </p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {([
                              { key: "dueDate" as const, label: "الموعد النهائي", icon: CalendarIcon },
                              { key: "priority" as const, label: "الأولوية", icon: Flag },
                              { key: "progress" as const, label: "نسبة الإنجاز", icon: SlidersHorizontal },
                              { key: "createdAt" as const, label: "تاريخ الإنشاء", icon: Calendar },
                            ]).map(({ key, label, icon: Icon }) => (
                              <button key={key}
                                onClick={() => { if (sortField === key) { setSortDir(d => d === "asc" ? "desc" : "asc"); } else { setSortField(key); setSortDir("desc"); } }}
                                className={cn(
                                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-all border",
                                  sortField === key
                                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm"
                                    : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-750 hover:border-neutral-300"
                                )}>
                                <span className="flex items-center gap-1.5"><Icon className="w-3.5 h-3.5" />{label}</span>
                                {sortField === key && <span className="text-[13px] font-bold opacity-70">{sortDir === "asc" ? "↑" : "↓"}</span>}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Status */}
                        <div>
                          <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                            <Inbox className="w-3 h-3" /> الحالة
                          </p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {([
                              { k: "all" as const, l: "الكل", dot: "" },
                              { k: "todo" as const, l: "قيد الانتظار", dot: "bg-neutral-400" },
                              { k: "in-progress" as const, l: "قيد العمل", dot: "bg-blue-500" },
                              { k: "in-review" as const, l: "تحت المراجعة", dot: "bg-orange-400" },
                              { k: "completed" as const, l: "منتهية", dot: "bg-teal-500" },
                              { k: "overdue" as const, l: "متأخرة", dot: "bg-red-500" },
                            ] as { k: TaskStatus | "all", l: string, dot: string }[]).map(({ k, l, dot }) => (
                              <button key={k} onClick={() => setFilterStatus(k)}
                                className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-all border",
                                  filterStatus === k
                                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm"
                                    : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100")}>
                                {dot && <span className={cn("w-2 h-2 rounded-full shrink-0", filterStatus === k ? "bg-white dark:bg-neutral-900" : dot)} />}
                                {l}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Priority */}
                        <div>
                          <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                            <Flag className="w-3 h-3" /> الأولوية
                          </p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {([
                              { k: "all" as const, l: "الكل", dot: "" },
                              { k: "urgent" as const, l: "عاجلة", dot: "bg-red-500" },
                              { k: "high" as const, l: "عالية", dot: "bg-amber-500" },
                              { k: "medium" as const, l: "متوسطة", dot: "bg-blue-400" },
                              { k: "low" as const, l: "منخفضة", dot: "bg-neutral-300" },
                            ] as { k: TaskPriority | "all", l: string, dot: string }[]).map(({ k, l, dot }) => (
                              <button key={k} onClick={() => setFilterPriority(k)}
                                className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-all border",
                                  filterPriority === k
                                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm"
                                    : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100")}>
                                {dot && <span className={cn("w-2 h-2 rounded-full shrink-0", filterPriority === k ? "bg-white dark:bg-neutral-900" : dot)} />}
                                {l}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Assignee */}
                        <div>
                          <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                            <Users className="w-3 h-3" /> المسؤول
                          </p>
                          <div className="space-y-1">
                            <button onClick={() => setFilterAssignee("all")}
                              className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-all border",
                                filterAssignee === "all" ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm" : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100")}>
                              <span className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0", filterAssignee === "all" ? "bg-white/20 dark:bg-neutral-900/20 text-white dark:text-neutral-900" : "bg-neutral-200 dark:bg-neutral-600 text-neutral-500")}>كل</span>
                              جميع المسؤولين
                            </button>
                            {ASSIGNEES.map(a => (
                              <button key={a} onClick={() => setFilterAssignee(a)}
                                className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-all border",
                                  filterAssignee === a ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm" : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100")}>
                                <img src={avatarUrl(a)} alt={a} className="w-7 h-7 rounded-full object-cover shrink-0" />
                                {a}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Project */}
                        <div>
                          <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                            <FolderOpen className="w-3 h-3" /> المشروع
                          </p>
                          <div className="space-y-1">
                            <button onClick={() => setFilterProject("all")}
                              className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-all border",
                                filterProject === "all" ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm" : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100")}>
                              جميع المشاريع
                            </button>
                            {PROJECTS.map(p => (
                              <button key={p} onClick={() => setFilterProject(p)}
                                className={cn("w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-all border text-right",
                                  filterProject === p ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm" : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100")}>
                                <FolderOpen className="w-3.5 h-3.5 shrink-0 opacity-50" />{p}
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Drawer Footer */}
                      <div className="px-5 py-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2 bg-white dark:bg-neutral-900">
                        <button
                          onClick={() => { setSortField(null); setFilterStatus("all"); setFilterPriority("all"); setFilterAssignee("all"); setFilterProject("all"); }}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5">
                          <X className="w-4 h-4" /> مسح الكل
                        </button>
                        <button
                          onClick={() => setFilterOpen(false)}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-sm">
                          تطبيق ({filtered.length})
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
              <div className="mr-auto flex items-center gap-1 bg-neutral-50 dark:bg-neutral-700 rounded-xl p-1">
                {([["list","قائمة",List],["kanban","كانبان",LayoutGrid],["calendar","تقويم",CalendarIcon]] as [ViewMode, string, React.ElementType][]).map(([v, label, Icon]) => (
                  <button key={v} onClick={() => setViewMode(v)} className={cn("flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200", viewMode === v ? "bg-neutral-900 text-white shadow-sm" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600")}>
                    <Icon className="w-3.5 h-3.5" /><span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {activeTab === "teams" && (
            <>
              <div className="hidden sm:flex items-center gap-1 bg-neutral-50 dark:bg-neutral-700 rounded-xl p-1">
                {([
                  { key: "all" as const, label: "الكل" },
                  { key: "team" as const, label: "الفرق" },
                  { key: "department" as const, label: "الأقسام" },
                  { key: "committee" as const, label: "اللجان" },
                ]).map(({ key, label }) => (
                  <button key={key} onClick={() => setTeamsFilter(key)}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200",
                      teamsFilter === key ? "bg-neutral-900 text-white shadow-sm" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600")}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="relative flex-1 max-w-[140px] sm:max-w-xs">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={teamsSearch} onChange={e => setTeamsSearch(e.target.value)} placeholder="بحث..."
                  className="w-full pr-9 pl-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 text-right" />
              </div>
              <div className="mr-auto flex items-center gap-1 bg-neutral-50 dark:bg-neutral-700 rounded-xl p-1">
                {([["table","جداول",List],["cards","بطاقات",LayoutGrid]] as ["table" | "cards", string, React.ElementType][]).map(([v, label, Icon]) => (
                  <button key={v} onClick={() => setTeamsView(v)} className={cn("flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200", teamsView === v ? "bg-neutral-900 text-white shadow-sm" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600")}>
                    <Icon className="w-3.5 h-3.5" /><span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {activeTab === "campaigns" && (
            <div className="relative flex-1 max-w-[140px] sm:max-w-xs">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={campaignsSearch} onChange={e => setCampaignsSearch(e.target.value)} placeholder="بحث في الحملات..."
                className="w-full pr-9 pl-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 text-right" />
            </div>
          )}

          {activeTab !== "tasks" && activeTab !== "teams" && activeTab !== "campaigns" && activeTab !== "visits" && <div className="flex-1" />}
            </div>
            </div>
            </div>

            {activeTab === "tasks" && (
              <button onClick={openCreate} className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors shadow-sm shrink-0">
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">مهمة جديدة</span><span className="sm:hidden">مهمة</span>
              </button>
            )}
            {activeTab === "campaigns" && (
              <button onClick={() => onNewCampaign?.()} className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors shadow-sm shrink-0">
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">حملة جديدة</span><span className="sm:hidden">حملة</span>
              </button>
            )}
            {activeTab === "projects" && (
              <button onClick={() => onNewProject?.()} className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors shadow-sm shrink-0">
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">مشروع جديد</span><span className="sm:hidden">مشروع</span>
              </button>
            )}
            {activeTab === "teams" && (
              <button onClick={() => alert("إنشاء فريق جديد - قيد التطوير")} className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors shadow-sm shrink-0">
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">فريق جديد</span><span className="sm:hidden">فريق</span>
              </button>
            )}
          </div>

          {/* Mobile-only teams filter bar — below toolbar, inside sticky header */}
          {activeTab === "teams" && (
            <div className="sm:hidden px-2 pb-2">
              <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-700 rounded-xl p-1 w-full">
                {([
                  { key: "all" as const, label: "الكل" },
                  { key: "team" as const, label: "الفرق" },
                  { key: "department" as const, label: "الأقسام" },
                  { key: "committee" as const, label: "اللجان" },
                ]).map(({ key, label }) => (
                  <button key={key} onClick={() => setTeamsFilter(key)}
                    className={cn("flex flex-1 items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-bold rounded-lg transition-all duration-200",
                      teamsFilter === key ? "bg-neutral-900 text-white shadow-sm" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600")}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
          </motion.div>
          )}
          </AnimatePresence>
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
                <div key={status} className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-700">
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
                        <table className="w-full text-sm min-w-[800px]">
                          <thead>
                            <tr className="border-b border-gray-100 dark:border-neutral-700">
                              {COLS.map((col, idx) => (
                                <th key={col.key} className={cn("px-3 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap", col.key === "action" ? "text-center" : "", idx === 0 ? "pr-5" : "", idx === COLS.length - 1 ? "pl-5" : "")}>
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
                              <Fragment key={task.id}>
                                <tr className="border-b border-gray-50 dark:border-neutral-700/50 hover:bg-gray-50/60 dark:hover:bg-neutral-700/20 transition-colors">
                                <td className="px-3 py-3.5 min-w-[200px] pr-5">
                                  <div className="flex items-center gap-2">
                                    {(task.subtasks || []).length > 0 && (
                                      <button
                                        onClick={() => setExpandedRows(prev => { const next = new Set(prev); if (next.has(task.id)) next.delete(task.id); else next.add(task.id); return next; })}
                                        className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                                      >
                                        {expandedRows.has(task.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => openDetail(task)}
                                      className="w-full text-right text-sm text-gray-700 dark:text-gray-200 hover:text-teal-600 transition-colors line-clamp-2"
                                      title={task.title}
                                    >
                                      {task.title}
                                    </button>
                                  </div>
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
                                    <button
                                      type="button"
                                      onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setTableDropdown(prev => prev && prev.id === task.id && prev.field === "assignee" ? null : { id: task.id, field: "assignee", top: r.bottom, right: window.innerWidth - r.right }); }}
                                      className="flex items-center gap-2 px-1.5 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                                    >
                                      <img src={avatarUrl(task.assignee)} alt={task.assignee} className="w-7 h-7 rounded-full object-cover shrink-0" />
                                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{task.assignee}</span>
                                      <ChevronDown className="w-3 h-3 text-gray-400" />
                                    </button>
                                  )}
                                </td>
                                <td className="px-3 py-3.5 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                                  {task.createdAt ? fmtDate(task.createdAt) : "—"}
                                </td>
                                <td className="px-3 py-3.5 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setTableDropdown(prev => prev && prev.id === task.id && prev.field === "progress" ? null : { id: task.id, field: "progress", top: r.bottom, right: window.innerWidth - r.right }); }}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-xs"
                                  >
                                    <div className="w-16 h-1.5 rounded-full bg-gray-100 dark:bg-neutral-700 overflow-hidden">
                                      <div className="h-full rounded-full bg-teal-500" style={{ width: `${task.progress}%` }} />
                                    </div>
                                    <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">{task.progress}%</span>
                                    <ChevronDown className="w-3 h-3 text-gray-400" />
                                  </button>
                                </td>
                                <td className="px-3 py-3.5 whitespace-nowrap">
                                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <CheckSquare className="w-3.5 h-3.5 text-gray-400" />
                                    <span>{(task.subtasks || []).length}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-3.5 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setTableDropdown(prev => prev && prev.id === task.id && prev.field === "dueDate" ? null : { id: task.id, field: "dueDate", top: r.bottom, right: window.innerWidth - r.right }); }}
                                    className={cn(
                                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-800/60 transition-colors",
                                      task.dueDate < today && task.status !== "completed"
                                        ? "text-red-500 border-red-200 bg-red-50/70 dark:text-red-300 dark:border-red-700 dark:bg-red-900/30"
                                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                    )}
                                  >
                                    <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate max-w-[120px]">{fmtDate(task.dueDate)}</span>
                                    <ChevronDown className="w-3 h-3 opacity-60" />
                                  </button>
                                </td>
                                <td className="px-3 py-3.5">
                                  <button
                                    type="button"
                                    onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setTableDropdown(prev => prev && prev.id === task.id && prev.field === "priority" ? null : { id: task.id, field: "priority", top: r.bottom, right: window.innerWidth - r.right }); }}
                                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 min-w-[105px]"
                                  >
                                    <span className="flex items-center gap-1.5">
                                      <Flag className={cn("w-4 h-4", PRIORITY_CONFIG[task.priority].flag)} />
                                      <span>{PRIORITY_CONFIG[task.priority].label}</span>
                                    </span>
                                    <ChevronDown className="w-3 h-3 opacity-60" />
                                  </button>
                                </td>
                                <td className="px-3 py-3.5 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setTableDropdown(prev => prev && prev.id === task.id && prev.field === "project" ? null : { id: task.id, field: "project", top: r.bottom, right: window.innerWidth - r.right }); }}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 bg-white text-neutral-800 dark:border-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                                  >
                                    <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="truncate max-w-[140px]">{task.projectName}</span>
                                    <ChevronDown className="w-3 h-3 opacity-60" />
                                  </button>
                                </td>
                                <td className="px-3 py-3.5 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setTableDropdown(prev => prev && prev.id === task.id && prev.field === "source" ? null : { id: task.id, field: "source", top: r.bottom, right: window.innerWidth - r.right }); }}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 bg-white text-neutral-800 dark:border-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                                  >
                                    <Inbox className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="truncate max-w-[120px]">{task.taskSource || "غير محدد"}</span>
                                    <ChevronDown className="w-3 h-3 opacity-60" />
                                  </button>
                                </td>
                                {/* Status */}
                                <td className="px-3 py-3.5 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setTableDropdown(prev => prev && prev.id === task.id && prev.field === "status" ? null : { id: task.id, field: "status", top: r.bottom, right: window.innerWidth - r.right }); }}
                                    className={cn("flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium border min-w-[105px]", STATUS_CONFIG[task.status].badgeBg, STATUS_CONFIG[task.status].badgeText, STATUS_CONFIG[task.status].badgeBorder, "hover:brightness-95 transition-all")}
                                  >
                                    <span className="flex items-center gap-1.5">
                                      <span className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[task.status].headerDot)} />
                                      <span>{STATUS_CONFIG[task.status].label}</span>
                                    </span>
                                    <ChevronDown className="w-3 h-3 opacity-60" />
                                  </button>
                                </td>
                                <td className="px-3 py-3.5 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap font-mono text-right">{task.id}</td>
                                <td className="px-3 py-3.5 text-center relative pl-5">
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
                              {/* Subtask rows */}
                              {expandedRows.has(task.id) && (task.subtasks || []).map(st => (
                                <tr key={st.id} className="border-b border-gray-50 dark:border-neutral-700/50 bg-gray-50/40 dark:bg-neutral-800/40">
                                  <td className="px-3 py-2 min-w-[200px] pr-5">
                                    <div className="flex items-center gap-2 mr-6">
                                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                                      <span className="text-sm text-gray-600 dark:text-gray-300 truncate text-right">{st.title}</span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                      <img src={avatarUrl(st.assignee)} alt={st.assignee} className="w-5 h-5 rounded-full object-cover shrink-0" />
                                      <span className="text-xs text-gray-500 dark:text-gray-400">{st.assignee}</span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-400 dark:text-gray-500">{st.projectName}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-400 dark:text-gray-500">—</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-400 dark:text-gray-500">—</td>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-12 h-1 rounded-full bg-gray-200 dark:bg-neutral-700 overflow-hidden">
                                        <div className="h-full rounded-full bg-teal-400" style={{ width: `${st.progress || 0}%` }} />
                                      </div>
                                      <span className="text-[10px] text-gray-400">{st.progress || 0}%</span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-400 dark:text-gray-500">{(st.subtasks || []).length}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                                    <span className={cn(st.dueDate < today && st.status !== "completed" ? "text-red-400" : "")}>{fmtDate(st.dueDate)}</span>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <Flag className={cn("w-3 h-3", PRIORITY_CONFIG[st.priority]?.flag || "text-gray-400")} />
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full", STATUS_CONFIG[st.status]?.badgeBg || "bg-gray-100", STATUS_CONFIG[st.status]?.badgeText || "text-gray-500")}>
                                      <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_CONFIG[st.status]?.headerDot || "bg-gray-300")} />
                                      {STATUS_CONFIG[st.status]?.label || st.status}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-[10px] text-gray-300 dark:text-gray-600 whitespace-nowrap font-mono text-right">{st.id.slice(0, 6)}…</td>
                                  <td className="px-3 py-2 text-center relative pl-5">
                                    <div className="flex items-center gap-1.5">
                                      <button onClick={() => openDetail(st)} className="text-gray-300 hover:text-teal-500 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                                      <button onClick={() => { const next = (task.subtasks || []).filter(s => s.id !== st.id); setTasks(p => p.map(x => x.id === task.id ? { ...x, subtasks: next } : x)); }} className="text-gray-300 hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              </Fragment>
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
                          onClick={() => openDetail(task)}
                        >
                          {/* Title */}
                          <h4 className="text-[13px] font-semibold text-gray-800 dark:text-gray-100 mb-1 text-right leading-snug">{task.title}</h4>
                          {/* Project subtitle */}
                          <p className="text-[11px] text-gray-400 mb-3 text-right">في {task.projectName}</p>

                          {/* Assignee row */}
                          <div className="flex items-center gap-1.5 mb-2">
                            {(!task.assignMode || task.assignMode === "me") ? (
                              <img src={avatarUrl(task.assignee)} alt={task.assignee} className="w-6 h-6 rounded-full object-cover shrink-0" />
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
                          </div>

                          {/* Subtasks row */}
                          {(task.subtasks || []).length > 0 && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <CheckSquare className="w-3 h-3 text-gray-400" />
                              <span className="text-[10px] text-gray-400">{(task.subtasks || []).length} مهمة فرعية</span>
                            </div>
                          )}

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
                              <button key={t.id} onClick={() => openDetail(t)} className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded truncate text-right w-full transition-colors hover:opacity-80", STATUS_CONFIG[t.status].badgeBg, STATUS_CONFIG[t.status].badgeText)}>
                                {t.title}
                                {(t.subtasks || []).length > 0 && <span className="mr-1 opacity-70">({(t.subtasks || []).length})</span>}
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

      {activeTab === "campaigns" && <CampaignsPage search={campaignsSearch} />}

      {activeTab === "teams" && <TeamsPage filter={teamsFilter} search={teamsSearch} view={teamsView} />}

      {activeTab === "visits" && <VisitsPage />}

      {activeTab === "projects" && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-20 text-center">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">المشاريع</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">صفحة المشاريع قيد التطوير</p>
        </div>
      )}

      {/* ── Task Detail Drawer ── */}
      <AnimatePresence>
        {detailOpen && detailTask && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]"
              onClick={closeDetail}
            />
            <motion.div
              key="task-detail"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="fixed inset-4 sm:inset-8 lg:inset-12 z-[70] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-w-[1320px] mx-auto"
              dir="rtl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs text-neutral-400 flex items-center gap-1.5 shrink-0">
                    <span className="px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700 text-[11px] font-medium bg-neutral-50 dark:bg-neutral-800">المهام</span>
                    <ChevronLeft className="w-3.5 h-3.5 text-neutral-300" />
                    <span className="text-neutral-500 font-medium">{detailTask.id}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs text-neutral-400 mr-1 hidden sm:inline">تم الإنشاء {detailTask.createdAt || today}</span>
                  <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors" title="طباعة"><Printer className="w-4 h-4" /></button>
                  <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors" title="تصدير كملف"><FileDown className="w-4 h-4" /></button>
                  <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors" title="مشاركة"><Send className="w-4 h-4" /></button>
                  <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors" title="مفضلة"><Star className="w-4 h-4" /></button>
                  <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors" title="متابعة"><Bell className="w-4 h-4" /></button>
                  <button onClick={closeDetail} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mobile tabs */}
              <div className="flex sm:hidden border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
                <button onClick={() => setDetailMobileTab("details")} className={cn("flex-1 py-2.5 text-xs font-bold transition-colors", detailMobileTab === "details" ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-500" : "text-neutral-500 dark:text-neutral-400")}>المهمة</button>
                <button onClick={() => setDetailMobileTab("activity")} className={cn("flex-1 py-2.5 text-xs font-bold transition-colors", detailMobileTab === "activity" ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-500" : "text-neutral-500 dark:text-neutral-400")}>النشاط والتعليقات</button>
              </div>

              {/* Body - vertical split: 45% details / 55% activity */}
              <div className="flex-1 overflow-hidden flex flex-col sm:flex-row">
                {/* Main content - left 45% */}
                <div className={cn("sm:w-[45%] min-w-0 overflow-y-auto", detailMobileTab === "activity" ? "hidden sm:block" : "")}>
                  {/* Title row */}
                  <div className="px-5 pt-4 pb-2 bg-white dark:bg-neutral-900 shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn("w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-white dark:ring-offset-neutral-900", STATUS_CONFIG[detailTask.status].accent)} />
                      <span className="text-sm font-medium text-neutral-400">مهمة</span>
                    </div>
                    <textarea
                      ref={detailTitleRef}
                      value={detailTask.title}
                      onChange={e => { const el = e.target; el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; const v = el.value; setDetailTask(t => t ? { ...t, title: v } : t); setTasks(p => p.map(x => x.id === detailTask.id ? { ...x, title: v } : x)); }}
                      className="w-full text-xl font-bold text-neutral-900 dark:text-white bg-transparent focus:outline-none text-right placeholder:text-neutral-300 resize-none overflow-hidden"
                      placeholder="عنوان المهمة"
                      rows={1}
                    />
                  </div>

                  {/* Description area */}
                  <div className="px-5 sm:px-6 pb-3 bg-white dark:bg-neutral-900">
                    <textarea
                      value={detailTask.description || ""}
                      onChange={e => { const v = e.target.value; setDetailTask(t => t ? { ...t, description: v } : t); setTasks(p => p.map(x => x.id === detailTask.id ? { ...x, description: v } : x)); }}
                      className="w-full min-h-[40px] p-0 text-sm text-neutral-600 dark:text-neutral-300 bg-transparent focus:outline-none resize-none text-right placeholder:text-neutral-400"
                      placeholder="اكتب الوصف أو اضغط '/' للأوامر"
                    />
                  </div>

                  <div className="p-3 sm:p-4 pb-2">
                    {/* Info Pills - flex wrap like task edit screen */}
                    <div className="flex flex-wrap gap-2">
                      {/* Status Pill */}
                      <div className="relative">
                        <button onClick={() => setDetailDropdown(d => d === "status" ? null : "status")} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors", detailDropdown === "status" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                          <span className={cn("w-2 h-2 rounded-full shrink-0", STATUS_CONFIG[detailTask.status].accent)} />
                          <span className="truncate max-w-[120px]">{STATUS_CONFIG[detailTask.status].label}</span>
                          <ChevronDown className={cn("w-3 h-3 transition-transform shrink-0 text-neutral-400", detailDropdown === "status" ? "rotate-180" : "")} />
                        </button>
                        {detailDropdown === "status" && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setDetailDropdown(null)} />
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[160px]">
                              {(["todo","in-progress","in-review","completed","overdue"] as TaskStatus[]).map(s => (
                                <button key={s} onClick={() => { setDetailTask(t => t ? { ...t, status: s, progress: s === "completed" ? 100 : t.progress } : t); setTasks(p => p.map(x => x.id === detailTask.id ? { ...x, status: s, progress: s === "completed" ? 100 : x.progress } : x)); setDetailDropdown(null); }} className={cn("w-full px-4 py-2 text-sm text-right flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", detailTask.status === s ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                                  <span className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[s].accent)} />
                                  {STATUS_CONFIG[s].label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Assignee Pill */}
                      <div className="relative">
                        <button onClick={() => setDetailDropdown(d => d === "assignee" ? null : "assignee")} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors", detailDropdown === "assignee" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                          <UserCircle className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate max-w-[120px]">{detailTask.assignee}</span>
                          <ChevronDown className={cn("w-3 h-3 transition-transform shrink-0 text-neutral-400", detailDropdown === "assignee" ? "rotate-180" : "")} />
                        </button>
                        {detailDropdown === "assignee" && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setDetailDropdown(null)} />
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[180px] max-h-[240px] overflow-y-auto">
                              {ASSIGNEES.map(name => (
                                <button key={name} onClick={() => { setDetailTask(t => t ? { ...t, assignee: name } : t); setTasks(p => p.map(x => x.id === detailTask.id ? { ...x, assignee: name } : x)); setDetailDropdown(null); }} className={cn("w-full px-4 py-2 text-sm text-right flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", detailTask.assignee === name ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                                  <img src={avatarUrl(name)} alt={name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                                  {name}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Priority Pill */}
                      <div className="relative">
                        <button onClick={() => setDetailDropdown(d => d === "priority" ? null : "priority")} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors", detailDropdown === "priority" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                          <Flag className={cn("w-3.5 h-3.5 shrink-0", PRIORITY_CONFIG[detailTask.priority].flag)} />
                          <span className="truncate max-w-[120px]">{PRIORITY_CONFIG[detailTask.priority].label}</span>
                          <ChevronDown className={cn("w-3 h-3 transition-transform shrink-0 text-neutral-400", detailDropdown === "priority" ? "rotate-180" : "")} />
                        </button>
                        {detailDropdown === "priority" && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setDetailDropdown(null)} />
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[160px]">
                              {(["low","medium","high","urgent"] as TaskPriority[]).map(p => (
                                <button key={p} onClick={() => { setDetailTask(t => t ? { ...t, priority: p } : t); setTasks(p_ => p_.map(x => x.id === detailTask.id ? { ...x, priority: p } : x)); setDetailDropdown(null); }} className={cn("w-full px-4 py-2 text-sm text-right flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", detailTask.priority === p ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                                  <Flag className={cn("w-4 h-4", PRIORITY_CONFIG[p].flag)} />
                                  {PRIORITY_CONFIG[p].label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Due Date Pill */}
                      <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/60 transition-colors">
                        <CalendarIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate max-w-[120px]">{detailTask.dueDate || "—"}</span>
                        <input type="date" value={detailTask.dueDate} onChange={e => { const v = e.target.value; setDetailTask(t => t ? { ...t, dueDate: v } : t); setTasks(p => p.map(x => x.id === detailTask.id ? { ...x, dueDate: v } : x)); }} className="absolute inset-0 opacity-0 cursor-pointer" dir="ltr" />
                      </div>

                      {/* Start Date Pill */}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700">
                        <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate max-w-[120px]">موعد البدء</span>
                      </div>

                      {/* Source Pill */}
                      <div className="relative">
                        <button onClick={() => setDetailDropdown(d => d === "source" ? null : "source")} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors", detailDropdown === "source" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                          <Megaphone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate max-w-[120px]">{detailTask.taskSource || "غير محدد"}</span>
                          <ChevronDown className={cn("w-3 h-3 transition-transform shrink-0 text-neutral-400", detailDropdown === "source" ? "rotate-180" : "")} />
                        </button>
                        {detailDropdown === "source" && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setDetailDropdown(null)} />
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[160px]">
                              {SOURCES.map(s => (
                                <button key={s} onClick={() => { setDetailTask(t => t ? { ...t, taskSource: s } : t); setTasks(p => p.map(x => x.id === detailTask.id ? { ...x, taskSource: s } : x)); setDetailDropdown(null); }} className={cn("w-full px-4 py-2 text-sm text-right hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", detailTask.taskSource === s ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                                  {s}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Progress Pill */}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{detailTask.progress ?? 0}%</span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={detailTask.progress ?? 0}
                          onChange={e => { const v = Number(e.target.value); setDetailTask(t => t ? { ...t, progress: v, status: v === 100 ? "completed" : t.status === "completed" ? "in-progress" : t.status } : t); setTasks(p => p.map(x => x.id === detailTask.id ? { ...x, progress: v, status: v === 100 ? "completed" : x.status === "completed" ? "in-progress" : x.status } : x)); }}
                          className="w-16 h-1.5 accent-teal-500 cursor-pointer"
                        />
                      </div>

                      {/* Project Pill */}
                      <div className="relative">
                        <button onClick={() => setDetailDropdown(d => d === "project" ? null : "project")} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors", detailDropdown === "project" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                          <Briefcase className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate max-w-[120px]">{detailTask.projectName || "غير محدد"}</span>
                          <ChevronDown className={cn("w-3 h-3 transition-transform shrink-0 text-neutral-400", detailDropdown === "project" ? "rotate-180" : "")} />
                        </button>
                        {detailDropdown === "project" && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setDetailDropdown(null)} />
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[200px]">
                              {PROJECTS.map(p => (
                                <button key={p} onClick={() => { setDetailTask(t => t ? { ...t, projectName: p } : t); setTasks(ts => ts.map(x => x.id === detailTask.id ? { ...x, projectName: p } : x)); setDetailDropdown(null); }} className={cn("w-full px-4 py-2 text-sm text-right hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", detailTask.projectName === p ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                                  {p}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Tags Pill */}
                      <div className="relative">
                        <button onClick={() => setDetailDropdown(d => d === "tags" ? null : "tags")} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors", detailDropdown === "tags" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                          <Hash className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <div className="flex items-center gap-1 flex-wrap max-w-[120px]">
                            {(detailTask.tags || []).length > 0 ? (detailTask.tags || []).slice(0, 2).map(tag => <span key={tag} className="text-neutral-700 dark:text-neutral-200 truncate">{tag}</span>) : <span className="text-neutral-400 truncate">فارغ</span>}
                            {(detailTask.tags || []).length > 2 && <span className="text-neutral-400">+{(detailTask.tags || []).length - 2}</span>}
                          </div>
                          <ChevronDown className={cn("w-3 h-3 transition-transform shrink-0 text-neutral-400", detailDropdown === "tags" ? "rotate-180" : "")} />
                        </button>
                        {detailDropdown === "tags" && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setDetailDropdown(null)} />
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[200px]">
                              <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-700/60">
                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">الوسوم المتاحة</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {["تصميم","تطوير","تسويق","مراجعة","عاجل","مبيعات"].map(tag => (
                                    <button key={tag} onClick={() => { const cur = detailTask.tags || []; const next = cur.includes(tag) ? cur.filter(t => t !== tag) : [...cur, tag]; setDetailTask(t => t ? { ...t, tags: next } : t); setTasks(ts => ts.map(x => x.id === detailTask.id ? { ...x, tags: next } : x)); }} className={cn("px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors", (detailTask.tags || []).includes(tag) ? "bg-teal-500 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600")}>
                                      {tag}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-neutral-100 dark:border-neutral-800 mx-5 sm:mx-6" />

                  {/* Bottom actions */}
                  <div className="p-4 sm:p-5">
                    {/* Existing subtasks summary / edit */}
                    {(detailTask.subtasks || []).length > 0 && (
                      <div className="space-y-2 mb-3">
                        {(detailTask.subtasks || []).map(st => (
                          <div key={st.id}>
                            {detailEditingSubtaskId === st.id ? (
                              /* Inline edit form */
                              <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 space-y-2">
                                <input
                                  value={detailEditingSubtaskForm.title || ""}
                                  onChange={e => setDetailEditingSubtaskForm(f => ({ ...f, title: e.target.value }))}
                                  placeholder="اسم المهمة الفرعية"
                                  className="w-full text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-1 focus:ring-teal-400/30"
                                />
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Status picker */}
                                  <div className="relative">
                                    <button onClick={() => setDetailEditingSubtaskDropdown(d => d === "status" ? null : "status")} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium transition-colors", detailEditingSubtaskDropdown === "status" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                                      <span className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[detailEditingSubtaskForm.status || "todo"].accent)} />
                                      <span>{STATUS_CONFIG[detailEditingSubtaskForm.status || "todo"].label}</span>
                                      <ChevronDown className={cn("w-3 h-3 transition-transform", detailEditingSubtaskDropdown === "status" ? "rotate-180" : "")} />
                                    </button>
                                    {detailEditingSubtaskDropdown === "status" && (
                                      <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[140px]">
                                        {(["todo","in-progress","in-review","completed","overdue"] as TaskStatus[]).map(s => (
                                          <button key={s} onClick={() => { setDetailEditingSubtaskForm(f => ({ ...f, status: s })); setDetailEditingSubtaskDropdown(null); }} className={cn("w-full px-3 py-1.5 text-xs text-right flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", (detailEditingSubtaskForm.status || "todo") === s ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                                            <span className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[s].accent)} />
                                            {STATUS_CONFIG[s].label}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  {/* Priority picker */}
                                  <div className="relative">
                                    <button onClick={() => setDetailEditingSubtaskDropdown(d => d === "priority" ? null : "priority")} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium transition-colors", detailEditingSubtaskDropdown === "priority" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                                      <Flag className={cn("w-3 h-3", PRIORITY_CONFIG[detailEditingSubtaskForm.priority || "medium"].flag)} />
                                      <span>{PRIORITY_CONFIG[detailEditingSubtaskForm.priority || "medium"].label}</span>
                                      <ChevronDown className={cn("w-3 h-3 transition-transform", detailEditingSubtaskDropdown === "priority" ? "rotate-180" : "")} />
                                    </button>
                                    {detailEditingSubtaskDropdown === "priority" && (
                                      <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[140px]">
                                        {(["low","medium","high","urgent"] as TaskPriority[]).map(p => (
                                          <button key={p} onClick={() => { setDetailEditingSubtaskForm(f => ({ ...f, priority: p })); setDetailEditingSubtaskDropdown(null); }} className={cn("w-full px-3 py-1.5 text-xs text-right flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", (detailEditingSubtaskForm.priority || "medium") === p ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                                            <Flag className={cn("w-3 h-3", PRIORITY_CONFIG[p].flag)} />
                                            {PRIORITY_CONFIG[p].label}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  {/* Assignee picker */}
                                  <div className="relative">
                                    <button onClick={() => setDetailEditingSubtaskDropdown(d => d === "assignee" ? null : "assignee")} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium transition-colors", detailEditingSubtaskDropdown === "assignee" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                                      <img src={avatarUrl(detailEditingSubtaskForm.assignee)} alt={detailEditingSubtaskForm.assignee} className="w-4 h-4 rounded-full object-cover" />
                                      <span className="max-w-[80px] truncate">{detailEditingSubtaskForm.assignee}</span>
                                      <ChevronDown className={cn("w-3 h-3 transition-transform", detailEditingSubtaskDropdown === "assignee" ? "rotate-180" : "")} />
                                    </button>
                                    {detailEditingSubtaskDropdown === "assignee" && (
                                      <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[160px] max-h-[200px] overflow-y-auto">
                                        {ASSIGNEES.map(name => (
                                          <button key={name} onClick={() => { setDetailEditingSubtaskForm(f => ({ ...f, assignee: name })); setDetailEditingSubtaskDropdown(null); }} className={cn("w-full px-3 py-1.5 text-xs text-right flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", detailEditingSubtaskForm.assignee === name ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                                            <img src={avatarUrl(name)} alt={name} className="w-4 h-4 rounded-full object-cover" />
                                            {name}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  {/* Due Date picker */}
                                  <div className="relative">
                                    <button onClick={() => setDetailEditingSubtaskDropdown(d => d === "dueDate" ? null : "dueDate")} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium transition-colors", detailEditingSubtaskDropdown === "dueDate" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                                      <CalendarIcon className="w-3 h-3 text-neutral-400" />
                                      <span>{detailEditingSubtaskForm.dueDate || today}</span>
                                      <ChevronDown className={cn("w-3 h-3 transition-transform", detailEditingSubtaskDropdown === "dueDate" ? "rotate-180" : "")} />
                                    </button>
                                    {detailEditingSubtaskDropdown === "dueDate" && (
                                      <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-2 min-w-[200px]">
                                        <input type="date" value={detailEditingSubtaskForm.dueDate || today} onChange={e => { setDetailEditingSubtaskForm(f => ({ ...f, dueDate: e.target.value })); setDetailEditingSubtaskDropdown(null); }} className="w-full text-xs rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-teal-400" dir="ltr" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center justify-end gap-1">
                                  <button onClick={() => { setDetailEditingSubtaskId(null); setDetailEditingSubtaskForm({}); setDetailEditingSubtaskDropdown(null); }} className="px-2 py-1 text-[10px] text-neutral-500 hover:text-neutral-700 transition-colors">إلغاء</button>
                                  <button onClick={() => { if (!detailEditingSubtaskForm.title?.trim()) return; const next = (detailTask.subtasks || []).map(s => s.id === st.id ? { ...s, ...detailEditingSubtaskForm, title: detailEditingSubtaskForm.title!.trim() } as Task : s); setDetailTask(t => t ? { ...t, subtasks: next } : t); setTasks(p => p.map(x => x.id === detailTask.id ? { ...x, subtasks: next } : x)); setDetailEditingSubtaskId(null); setDetailEditingSubtaskForm({}); setDetailEditingSubtaskDropdown(null); }} className="px-2 py-1 text-[10px] font-semibold text-teal-600 hover:text-teal-700 transition-colors">حفظ</button>
                                </div>
                              </div>
                            ) : (
                              /* Summary card */
                              <div className="flex items-center gap-2 p-2 rounded-lg border border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                                <span className={cn("w-2 h-2 rounded-full shrink-0", STATUS_CONFIG[st.status]?.accent || "bg-gray-300")} />
                                <span className="flex-1 text-sm text-neutral-700 dark:text-neutral-200 truncate text-right">{st.title}</span>
                                <div className="flex items-center gap-1.5">
                                  <img src={avatarUrl(st.assignee)} alt={st.assignee} className="w-5 h-5 rounded-full object-cover" title={st.assignee} />
                                  <Flag className={cn("w-3.5 h-3.5", PRIORITY_CONFIG[st.priority]?.flag || "text-gray-400")} />
                                  <span className="text-[10px] text-neutral-400">{st.dueDate}</span>
                                </div>
                                <button onClick={() => { setDetailEditingSubtaskId(st.id); setDetailEditingSubtaskForm({ ...st }); setDetailEditingSubtaskDropdown(null); }} className="text-neutral-400 hover:text-teal-500"><Pencil className="w-3.5 h-3.5" /></button>
                                <button onClick={() => { const next = (detailTask.subtasks || []).filter(s => s.id !== st.id); setDetailTask(t => t ? { ...t, subtasks: next } : t); setTasks(p => p.map(x => x.id === detailTask.id ? { ...x, subtasks: next } : x)); }} className="text-neutral-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline subtask form */}
                    {detailShowSubtaskForm && (
                      <div className="mb-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 space-y-2">
                        <input
                          value={detailSubtaskForm.title || ""}
                          onChange={e => setDetailSubtaskForm(f => ({ ...f, title: e.target.value }))}
                          placeholder="اسم المهمة الفرعية"
                          className="w-full text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-1 focus:ring-teal-400/30"
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Status picker */}
                          <div className="relative">
                            <button onClick={() => setDetailSubtaskDropdown(d => d === "status" ? null : "status")} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium transition-colors", detailSubtaskDropdown === "status" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                              <span className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[detailSubtaskForm.status || "todo"].accent)} />
                              <span>{STATUS_CONFIG[detailSubtaskForm.status || "todo"].label}</span>
                              <ChevronDown className={cn("w-3 h-3 transition-transform", detailSubtaskDropdown === "status" ? "rotate-180" : "")} />
                            </button>
                            {detailSubtaskDropdown === "status" && (
                              <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[140px]">
                                {(["todo","in-progress","in-review","completed","overdue"] as TaskStatus[]).map(s => (
                                  <button key={s} onClick={() => { setDetailSubtaskForm(f => ({ ...f, status: s })); setDetailSubtaskDropdown(null); }} className={cn("w-full px-3 py-1.5 text-xs text-right flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", (detailSubtaskForm.status || "todo") === s ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                                    <span className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[s].accent)} />
                                    {STATUS_CONFIG[s].label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Priority picker */}
                          <div className="relative">
                            <button onClick={() => setDetailSubtaskDropdown(d => d === "priority" ? null : "priority")} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium transition-colors", detailSubtaskDropdown === "priority" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                              <Flag className={cn("w-3 h-3", PRIORITY_CONFIG[detailSubtaskForm.priority || "medium"].flag)} />
                              <span>{PRIORITY_CONFIG[detailSubtaskForm.priority || "medium"].label}</span>
                              <ChevronDown className={cn("w-3 h-3 transition-transform", detailSubtaskDropdown === "priority" ? "rotate-180" : "")} />
                            </button>
                            {detailSubtaskDropdown === "priority" && (
                              <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[140px]">
                                {(["low","medium","high","urgent"] as TaskPriority[]).map(p => (
                                  <button key={p} onClick={() => { setDetailSubtaskForm(f => ({ ...f, priority: p })); setDetailSubtaskDropdown(null); }} className={cn("w-full px-3 py-1.5 text-xs text-right flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", (detailSubtaskForm.priority || "medium") === p ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                                    <Flag className={cn("w-3 h-3", PRIORITY_CONFIG[p].flag)} />
                                    {PRIORITY_CONFIG[p].label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Assignee picker */}
                          <div className="relative">
                            <button onClick={() => setDetailSubtaskDropdown(d => d === "assignee" ? null : "assignee")} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium transition-colors", detailSubtaskDropdown === "assignee" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                              <img src={avatarUrl(detailSubtaskForm.assignee)} alt={detailSubtaskForm.assignee} className="w-4 h-4 rounded-full object-cover" />
                              <span className="max-w-[80px] truncate">{detailSubtaskForm.assignee}</span>
                              <ChevronDown className={cn("w-3 h-3 transition-transform", detailSubtaskDropdown === "assignee" ? "rotate-180" : "")} />
                            </button>
                            {detailSubtaskDropdown === "assignee" && (
                              <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[160px] max-h-[200px] overflow-y-auto">
                                {ASSIGNEES.map(name => (
                                  <button key={name} onClick={() => { setDetailSubtaskForm(f => ({ ...f, assignee: name })); setDetailSubtaskDropdown(null); }} className={cn("w-full px-3 py-1.5 text-xs text-right flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", detailSubtaskForm.assignee === name ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                                    <img src={avatarUrl(name)} alt={name} className="w-4 h-4 rounded-full object-cover" />
                                    {name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Due Date picker */}
                          <div className="relative">
                            <button onClick={() => setDetailSubtaskDropdown(d => d === "dueDate" ? null : "dueDate")} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium transition-colors", detailSubtaskDropdown === "dueDate" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                              <CalendarIcon className="w-3 h-3 text-neutral-400" />
                              <span>{detailSubtaskForm.dueDate || today}</span>
                              <ChevronDown className={cn("w-3 h-3 transition-transform", detailSubtaskDropdown === "dueDate" ? "rotate-180" : "")} />
                            </button>
                            {detailSubtaskDropdown === "dueDate" && (
                              <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-2 min-w-[200px]">
                                <input type="date" value={detailSubtaskForm.dueDate || today} onChange={e => { setDetailSubtaskForm(f => ({ ...f, dueDate: e.target.value })); setDetailSubtaskDropdown(null); }} className="w-full text-xs rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-teal-400" dir="ltr" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setDetailShowSubtaskForm(false); setDetailSubtaskDropdown(null); setDetailSubtaskForm({ status: "todo", priority: "medium", dueDate: today, assignee: ASSIGNEES[0], progress: 0, projectName: PROJECTS[0] }); }} className="px-2 py-1 text-[10px] text-neutral-500 hover:text-neutral-700 transition-colors">إلغاء</button>
                          <button onClick={() => { if (!detailSubtaskForm.title?.trim()) return; const newSubtask: Task = { id: String(Date.now()), title: detailSubtaskForm.title!.trim(), description: "", status: detailSubtaskForm.status || "todo", priority: detailSubtaskForm.priority || "medium", dueDate: detailSubtaskForm.dueDate || today, assignee: detailSubtaskForm.assignee || ASSIGNEES[0], progress: detailSubtaskForm.progress ?? 0, projectName: detailSubtaskForm.projectName || PROJECTS[0] }; const next = [...(detailTask.subtasks || []), newSubtask]; setDetailTask(t => t ? { ...t, subtasks: next } : t); setTasks(p => p.map(x => x.id === detailTask.id ? { ...x, subtasks: next } : x)); setDetailShowSubtaskForm(false); setDetailSubtaskDropdown(null); setDetailSubtaskForm({ status: "todo", priority: "medium", dueDate: today, assignee: ASSIGNEES[0], progress: 0, projectName: PROJECTS[0] }); }} className="px-2 py-1 text-[10px] font-semibold text-teal-600 hover:text-teal-700 transition-colors">حفظ</button>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setDetailShowSubtaskForm(true)}
                      className="flex items-center gap-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/60 w-full"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                        <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      إضافة مهمة فرعية
                    </button>
                  </div>
                </div>

                {/* Activity sidebar - right 55% */}
                <div className={cn("sm:w-[55%] min-w-0 border-t sm:border-t-0 sm:border-r border-neutral-100 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 overflow-y-auto flex flex-col", detailMobileTab === "details" ? "hidden sm:flex" : "")}>
                  {/* Activity header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">النشاط والتعليقات</h3>
                    <div className="flex items-center gap-0.5 text-neutral-400">
                      <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"><Search className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"><Bell className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  {/* Activity items */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Created task entry */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center shrink-0 shadow-sm border border-teal-100 dark:border-teal-800/40">
                        <FilePlus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">أنشأت هذه المهمة</p>
                        <span className="text-xs text-neutral-400 mt-0.5 block">{detailTask.createdAt || today}</span>
                      </div>
                    </div>

                    {(detailTask.comments || []).length === 0 && (
                      <div className="flex flex-col items-center justify-center py-6 text-neutral-400">
                        <Bell className="w-8 h-8 mb-2 opacity-40" />
                        <p className="text-sm">اكتب تعليقاً عن سير عمل المهمة</p>
                      </div>
                    )}
                    {(detailTask.comments || []).map(c => {
                      const canEdit = c.author === "أنت" && c.createdAt && (Date.now() - c.createdAt < 30 * 60 * 1000);
                      const isEditing = detailEditingComment?.id === c.id;
                      return (
                        <div key={c.id} className="flex gap-3">
                          <img src={avatarUrl(c.author)} alt={c.author} className="w-8 h-8 rounded-full object-cover shrink-0 shadow-sm" />
                          <div className="flex-1 min-w-0 bg-white dark:bg-neutral-800 rounded-xl p-3 shadow-sm border border-neutral-100 dark:border-neutral-700/60">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed text-right">
                                <span className="font-semibold text-neutral-900 dark:text-white">{c.author}</span>
                              </p>
                              {canEdit && !isEditing && (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => setDetailEditingComment({ id: c.id, text: c.text })} className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-teal-500 transition-colors"><Pencil className="w-3 h-3" /></button>
                                  <button onClick={() => { const next = (detailTask.comments || []).filter(x => x.id !== c.id); setDetailTask(t => t ? { ...t, comments: next } : t); setTasks(p => p.map(x => x.id === detailTask.id ? { ...x, comments: next } : x)); }} className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                </div>
                              )}
                            </div>
                            {isEditing ? (
                              <div className="mt-1">
                                <textarea value={detailEditingComment.text} onChange={e => setDetailEditingComment({ ...detailEditingComment, text: e.target.value })} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); const next = (detailTask.comments || []).map(x => x.id === c.id ? { ...x, text: detailEditingComment.text.trim() } : x); setDetailTask(t => t ? { ...t, comments: next } : t); setTasks(p => p.map(x => x.id === detailTask.id ? { ...x, comments: next } : x)); setDetailEditingComment(null); } }} className="w-full text-xs text-neutral-700 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg border border-neutral-200 dark:border-neutral-600 p-2 focus:outline-none focus:ring-1 focus:ring-teal-400/30 resize-none text-right" rows={2} />
                                <div className="flex items-center justify-end gap-1 mt-1">
                                  <button onClick={() => setDetailEditingComment(null)} className="px-2 py-1 text-[10px] text-neutral-500 hover:text-neutral-700 transition-colors">إلغاء</button>
                                  <button onClick={() => { const next = (detailTask.comments || []).map(x => x.id === c.id ? { ...x, text: detailEditingComment.text.trim() } : x); setDetailTask(t => t ? { ...t, comments: next } : t); setTasks(p => p.map(x => x.id === detailTask.id ? { ...x, comments: next } : x)); setDetailEditingComment(null); }} className="px-2 py-1 text-[10px] font-semibold text-teal-600 hover:text-teal-700 transition-colors">حفظ</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {c.text && <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed text-right">{c.text}</p>}
                                {(c.attachments || []).length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {(c.attachments || []).map(att => (
                                      att.type?.startsWith("image/") ? (
                                        <a key={att.id} href={att.url} download={att.name} className="block rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:opacity-90 transition-opacity">
                                          <img src={att.url} alt={att.name} className="w-24 h-24 object-cover" />
                                        </a>
                                      ) : (
                                        <a key={att.id} href={att.url} download={att.name} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                                          <Paperclip className="w-3 h-3 text-neutral-400" />
                                          <span className="text-neutral-700 dark:text-neutral-200 truncate max-w-[100px]">{att.name}</span>
                                          <span className="text-neutral-400">{att.size}</span>
                                        </a>
                                      )
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                            <span className="text-[11px] text-neutral-400 mt-2 block">{c.date}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Comment input */}
                  <div className="p-3 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shrink-0">
                    {detailCommentAttachments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {detailCommentAttachments.map(att => (
                          <div key={att.id} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px]">
                            <Paperclip className="w-3 h-3 text-neutral-400" />
                            <span className="text-neutral-700 dark:text-neutral-200 truncate max-w-[100px]">{att.name}</span>
                            <button onClick={() => setDetailCommentAttachments(p => p.filter(a => a.id !== att.id))} className="text-neutral-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="relative">
                      <textarea
                        value={detailComment}
                        onChange={e => { setDetailComment(e.target.value); const ctx = getMentionContext(e.target.value, e.target.selectionStart); setDetailMention(ctx); }}
                        onKeyDown={e => {
                          if (e.key === "Escape") { setDetailMention(null); return; }
                          if (e.key === "Enter" && !e.shiftKey && (detailComment.trim() || detailCommentAttachments.length > 0)) {
                            e.preventDefault();
                            const newComment = { id: String(Date.now()), author: "أنت", text: detailComment.trim(), date: "الآن", createdAt: Date.now(), attachments: detailCommentAttachments };
                            const next = [...(detailTask.comments || []), newComment];
                            setDetailTask(t => t ? { ...t, comments: next } : t);
                            setTasks(p => p.map(x => x.id === detailTask.id ? { ...x, comments: next } : x));
                            setDetailComment("");
                            setDetailCommentAttachments([]);
                            setDetailMention(null);
                          }
                        }}
                        placeholder="اكتب تعليقاً..."
                        className="w-full min-h-[48px] p-2.5 pr-10 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-sm text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400/50 resize-none text-right transition-all"
                      />
                      {detailMention && (
                        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1 max-h-[180px] overflow-y-auto">
                          {MENTION_OPTIONS.filter(o => o.label.toLowerCase().includes(detailMention.query.toLowerCase())).length === 0 ? (
                            <p className="px-3 py-2 text-xs text-neutral-400 text-right">لا يوجد نتائج</p>
                          ) : (
                            MENTION_OPTIONS.filter(o => o.label.toLowerCase().includes(detailMention.query.toLowerCase())).map(o => (
                              <button key={o.id} onClick={() => { const before = detailComment.slice(0, detailMention.startIndex); const after = detailComment.slice(detailMention.startIndex + 1 + detailMention.query.length); setDetailComment(before + "@" + o.label + " " + after); setDetailMention(null); }} className="w-full px-3 py-2 text-sm text-right flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", o.type === "person" ? "bg-blue-50 text-blue-600" : o.type === "team" ? "bg-emerald-50 text-emerald-600" : o.type === "department" ? "bg-amber-50 text-amber-600" : "bg-violet-50 text-violet-600")}>{o.type === "person" ? "شخص" : o.type === "team" ? "فريق" : o.type === "department" ? "قسم" : "لجنة"}</span>
                                {o.label}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                      <div className="absolute left-2 bottom-2 flex items-center gap-1">
                        <button onClick={() => detailFileInputRef.current?.click()} className="p-2 rounded-lg text-neutral-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"><Paperclip className="w-4 h-4" /></button>
                        <input ref={detailFileInputRef} type="file" multiple className="hidden" onChange={async (e) => { const files = e.target.files; if (!files) return; const newAtts = await Promise.all(Array.from(files).map(async (file) => { const data = await readFile(file); return { id: String(Date.now()) + Math.random().toString(36).slice(2, 8), ...data }; })); setDetailCommentAttachments(p => [...p, ...newAtts]); e.target.value = ""; }} />
                        <button onClick={() => { if (!detailComment.trim() && detailCommentAttachments.length === 0) return; const newComment = { id: String(Date.now()), author: "أنت", text: detailComment.trim(), date: "الآن", createdAt: Date.now(), attachments: detailCommentAttachments }; const next = [...(detailTask.comments || []), newComment]; setDetailTask(t => t ? { ...t, comments: next } : t); setTasks(p => p.map(x => x.id === detailTask.id ? { ...x, comments: next } : x)); setDetailComment(""); setDetailCommentAttachments([]); setDetailMention(null); }} className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-500 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors"><Send className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]"
              onClick={() => { setModalOpen(false); setFormMobileTab("details"); setFormComment(""); }}
            />
            <motion.div
              key="task-form"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="fixed inset-4 sm:inset-8 lg:inset-12 z-[70] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-w-[1320px] mx-auto"
              dir="rtl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs text-neutral-400 flex items-center gap-1.5 shrink-0">
                    <span className="px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700 text-[11px] font-medium bg-neutral-50 dark:bg-neutral-800">{editing ? "تعديل" : "جديد"}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => { setModalOpen(false); setFormMobileTab("details"); setFormComment(""); }} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mobile tabs */}
              <div className="flex sm:hidden border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
                <button onClick={() => setFormMobileTab("details")} className={cn("flex-1 py-2.5 text-xs font-bold transition-colors", formMobileTab === "details" ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-500" : "text-neutral-500 dark:text-neutral-400")}>المهمة</button>
                <button onClick={() => setFormMobileTab("activity")} className={cn("flex-1 py-2.5 text-xs font-bold transition-colors", formMobileTab === "activity" ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-500" : "text-neutral-500 dark:text-neutral-400")}>النشاط والتعليقات</button>
              </div>

              {/* Body - vertical split: 45% form / 55% activity */}
              <div className="flex-1 overflow-hidden flex flex-col sm:flex-row">
                {/* Main content - left 45% */}
                <div className={cn("sm:w-[45%] min-w-0 overflow-y-auto", formMobileTab === "activity" ? "hidden sm:block" : "")}>
                  <div className="p-5 space-y-5" dir="rtl">
                    {/* Title */}
                    <input value={form.title || ""} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full text-xl font-bold text-neutral-900 dark:text-white bg-transparent focus:outline-none text-right placeholder:text-neutral-300" placeholder="اسم المهمة" autoFocus />

                    {/* Description */}
                    <textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full min-h-[60px] text-sm text-neutral-600 dark:text-neutral-300 bg-transparent focus:outline-none resize-none text-right placeholder:text-neutral-400" placeholder="أضف وصفاً..." />

                    {/* Quick action pills */}
                    <div className="flex flex-wrap gap-2" ref={formDropdownRef}>
                  {/* Status Pill */}
                  <div className="relative">
                    <button onClick={() => setFormDropdown(d => d === "status" ? null : "status")} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors", formDropdown === "status" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                      <span className={cn("w-2 h-2 rounded-full shrink-0", formTouched.has("status") ? STATUS_CONFIG[form.status || "todo"].accent : "bg-neutral-300")} />
                      <span className="truncate max-w-[120px]">{formTouched.has("status") ? STATUS_CONFIG[form.status || "todo"].label : "الحالة"}</span>
                      <ChevronDown className={cn("w-3 h-3 transition-transform shrink-0 text-neutral-400", formDropdown === "status" ? "rotate-180" : "")} />
                    </button>
                    {formDropdown === "status" && (
                      <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[160px]">
                        <p className="text-xs font-semibold text-neutral-400 px-4 py-2">الحالة</p>
                        {(["todo","in-progress","in-review","completed","overdue"] as TaskStatus[]).map(s => (
                          <button key={s} onClick={() => { setForm(f => ({ ...f, status: s })); setFormTouched(t => new Set([...t, "status"])); setFormDropdown(null); }} className={cn("w-full px-4 py-2 text-sm text-right flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", (form.status || "todo") === s ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                            <span className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[s].accent)} />
                            {STATUS_CONFIG[s].label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Assignee Pill */}
                  <div className="relative" ref={assignDropdownRef}>
                    <button onClick={() => { setFormDropdown(d => d === "assignee" ? null : "assignee"); setAssignStep("mode"); }} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors", formDropdown === "assignee" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                      <UserCircle className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate max-w-[120px]">{formTouched.has("assignee") ? (form.assignMode === "team" ? (form.assignTarget || "فريق") : form.assignMode === "department" ? (form.assignTarget || "قسم") : form.assignMode === "committee" ? (form.assignTarget || "لجنة") : (form.assignee || "الاسناد إلى")) : "الإسناد"}</span>
                      <ChevronDown className={cn("w-3 h-3 transition-transform shrink-0 text-neutral-400", formDropdown === "assignee" ? "rotate-180" : "")} />
                    </button>
                    {formDropdown === "assignee" && (
                      <div className="absolute right-0 top-full mt-1.5 z-50 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-xl shadow-lg min-w-[260px] max-h-[360px] overflow-y-auto">
                        {/* Step 1: Choose mode */}
                        {assignStep === "mode" && (
                          <div className="p-2">
                            <p className="text-xs font-semibold text-neutral-400 px-3 py-2">الاسناد إلى</p>
                            <button onClick={() => { setForm(f => ({ ...f, assignMode: "me", assignee: ASSIGNEES[0], assignTarget: undefined, assignMembers: undefined })); setFormTouched(t => new Set([...t, "assignee"])); setAssignStep("members"); }} className={cn("w-full px-3 py-2.5 text-sm text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg transition-colors", form.assignMode === "me" ? "text-teal-600 font-semibold bg-teal-50/50" : "text-gray-700 dark:text-gray-200")}>
                              <UserCircle className="w-4 h-4" /> إسناد المهمة لي
                            </button>
                            <button onClick={() => { setForm(f => ({ ...f, assignMode: "team", assignee: "فريق", assignTarget: undefined, assignMembers: [] })); setFormTouched(t => new Set([...t, "assignee"])); setAssignStep("list"); }} className={cn("w-full px-3 py-2.5 text-sm text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg transition-colors", form.assignMode === "team" ? "text-teal-600 font-semibold bg-teal-50/50" : "text-gray-700 dark:text-gray-200")}>
                              <Users className="w-4 h-4" /> إسناد المهمة لفريق
                            </button>
                            <button onClick={() => { setForm(f => ({ ...f, assignMode: "department", assignee: "قسم", assignTarget: undefined, assignMembers: [] })); setFormTouched(t => new Set([...t, "assignee"])); setAssignStep("list"); }} className={cn("w-full px-3 py-2.5 text-sm text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg transition-colors", form.assignMode === "department" ? "text-teal-600 font-semibold bg-teal-50/50" : "text-gray-700 dark:text-gray-200")}>
                              <Building2 className="w-4 h-4" /> إسناد المهمة لقسم
                            </button>
                            <button onClick={() => { setForm(f => ({ ...f, assignMode: "committee", assignee: "لجنة", assignTarget: undefined, assignMembers: [] })); setFormTouched(t => new Set([...t, "assignee"])); setAssignStep("list"); }} className={cn("w-full px-3 py-2.5 text-sm text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg transition-colors", form.assignMode === "committee" ? "text-teal-600 font-semibold bg-teal-50/50" : "text-gray-700 dark:text-gray-200")}>
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
                              <button key={item.name} onClick={() => { setForm(f => ({ ...f, assignTarget: item.name, assignMembers: [] })); setFormTouched(t => new Set([...t, "assignee"])); setAssignStep("members"); }} className={cn("w-full px-3 py-2.5 text-sm text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg transition-colors", form.assignTarget === item.name ? "text-teal-600 font-semibold bg-teal-50/50" : "text-gray-700 dark:text-gray-200")}>
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
                                        <img src={avatarUrl(head)} alt={head} className="w-6 h-6 rounded-full object-cover shrink-0" />
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
                                      <img src={avatarUrl(m)} alt={m} className="w-6 h-6 rounded-full object-cover shrink-0" />
                                      {m}
                                      {(form.assignMembers || []).includes(m) && <span className="mr-auto text-teal-500 text-xs">✓</span>}
                                    </button>
                                  ));
                                })()}
                                <div className="px-3 pt-2 pb-1">
                                  <button onClick={() => { setFormDropdown(null); setFormTouched(t => new Set([...t, "assignee"])); setAssignStep("mode"); }} className="w-full py-2 text-xs font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors">تم</button>
                                </div>
                              </>
                            )}
                            {form.assignMode === "me" && (
                              <>
                                <p className="text-xs font-semibold text-gray-400 px-3 py-2">اختر الشخص</p>
                                {ASSIGNEES.map(a => (
                                  <button key={a} onClick={() => { setForm(f => ({ ...f, assignee: a, assignTarget: undefined, assignMembers: undefined })); setFormTouched(t => new Set([...t, "assignee"])); setFormDropdown(null); setAssignStep("mode"); }} className={cn("w-full px-3 py-2 text-sm text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg transition-colors", form.assignee === a ? "text-teal-600 font-semibold bg-teal-50/50" : "text-gray-700 dark:text-gray-200")}>
                                    <img src={avatarUrl(a)} alt={a} className="w-6 h-6 rounded-full object-cover shrink-0" />
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

                  {/* Due Date Pill */}
                  <div className="relative">
                    <button onClick={() => setFormDropdown(d => d === "dueDate" ? null : "dueDate")} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors", formDropdown === "dueDate" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                      <CalendarIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate max-w-[120px]">{formTouched.has("dueDate") && form.dueDate ? fmtDate(form.dueDate) : "موعد التسليم"}</span>
                      <ChevronDown className={cn("w-3 h-3 transition-transform shrink-0 text-neutral-400", formDropdown === "dueDate" ? "rotate-180" : "")} />
                    </button>
                    {formDropdown === "dueDate" && (
                      <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-3 min-w-[280px]">
                        <p className="text-xs font-semibold text-neutral-400 px-1 pb-2">موعد التسليم</p>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-500 text-center">تاريخ البدء</span>
                          <span className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 border border-blue-100 text-center">الموعد النهائي</span>
                        </div>
                        <input type="date" value={form.dueDate || today} onChange={e => { setForm(f => ({ ...f, dueDate: e.target.value })); setFormTouched(t => new Set([...t, "dueDate"])); }} className="w-full rounded-lg border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none mb-2" dir="ltr" />
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            { label: "اليوم", val: today },
                            { label: "غداً", val: new Date(Date.now() + 86400000).toISOString().split("T")[0] },
                            { label: "بعد أسبوع", val: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0] },
                            { label: "بعد أسبوعين", val: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0] },
                          ].map(q => (
                            <button key={q.label} onClick={() => { setForm(f => ({ ...f, dueDate: q.val })); setFormTouched(t => new Set([...t, "dueDate"])); setFormDropdown(null); }} className="text-right px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">{q.label}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Priority Pill */}
                  <div className="relative">
                    <button onClick={() => setFormDropdown(d => d === "priority" ? null : "priority")} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors", formDropdown === "priority" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                      <Flag className={cn("w-3.5 h-3.5 shrink-0", formTouched.has("priority") ? PRIORITY_CONFIG[form.priority || "medium"].flag : "text-neutral-400")} />
                      <span className="truncate max-w-[120px]">{formTouched.has("priority") ? PRIORITY_CONFIG[form.priority || "medium"].label : "أولوية التنفيذ"}</span>
                      <ChevronDown className={cn("w-3 h-3 transition-transform shrink-0 text-neutral-400", formDropdown === "priority" ? "rotate-180" : "")} />
                    </button>
                    {formDropdown === "priority" && (
                      <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[160px]">
                        <p className="text-xs font-semibold text-neutral-400 px-4 py-2">أولوية التنفيذ</p>
                        {(["urgent","high","medium","low"] as TaskPriority[]).map(p => (
                          <button key={p} onClick={() => { setForm(f => ({ ...f, priority: p })); setFormTouched(t => new Set([...t, "priority"])); setFormDropdown(null); }} className={cn("w-full px-4 py-2 text-sm text-right flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", (form.priority || "medium") === p ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                            <Flag className={cn("w-4 h-4", PRIORITY_CONFIG[p].flag)} />
                            {PRIORITY_CONFIG[p].label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tags Pill */}
                  <div className="relative">
                    <button onClick={() => setFormDropdown(d => d === "tags" ? null : "tags")} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors", formDropdown === "tags" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                      <Hash className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate max-w-[120px]">{formTouched.has("tags") ? ((form.tags && form.tags.length > 0) ? (form.tags.length > 1 ? `${form.tags.length} وسوم` : form.tags[0]) : "وسوم المهمة") : "وسوم المهمة"}</span>
                      <ChevronDown className={cn("w-3 h-3 transition-transform shrink-0 text-neutral-400", formDropdown === "tags" ? "rotate-180" : "")} />
                    </button>
                    {formDropdown === "tags" && (
                      <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-3 min-w-[220px]">
                        <p className="text-xs font-semibold text-neutral-400 mb-2">وسوم المهمة</p>
                        <div className="flex flex-wrap gap-1.5">
                          {["تصميم","تطوير","تسويق","مراجعة","عاجل","مبيعات"].map(tag => (
                            <button key={tag} onClick={() => { const cur = form.tags || []; const next = cur.includes(tag) ? cur.filter(t => t !== tag) : [...cur, tag]; setForm(f => ({ ...f, tags: next })); setFormTouched(t => new Set([...t, "tags"])); }} className={cn("px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors", (form.tags || []).includes(tag) ? "bg-teal-500 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600")}>{tag}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Source Pill */}
                  <div className="relative">
                    <button onClick={() => setFormDropdown(d => d === "source" ? null : "source")} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors", formDropdown === "source" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                      <Megaphone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate max-w-[120px]">{formTouched.has("source") ? (form.taskSource || "مصدر المهمة") : "مصدر المهمة"}</span>
                      <ChevronDown className={cn("w-3 h-3 transition-transform shrink-0 text-neutral-400", formDropdown === "source" ? "rotate-180" : "")} />
                    </button>
                    {formDropdown === "source" && (
                      <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[160px]">
                        <p className="text-xs font-semibold text-neutral-400 px-4 py-2">مصدر المهمة</p>
                        {SOURCES.map(s => (
                          <button key={s} onClick={() => { setForm(f => ({ ...f, taskSource: s })); setFormTouched(t => new Set([...t, "source"])); setFormDropdown(null); }} className={cn("w-full px-4 py-2 text-sm text-right hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", form.taskSource === s ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Project Pill */}
                  <div className="relative">
                    <button onClick={() => setFormDropdown(d => d === "project" ? null : "project")} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors", formDropdown === "project" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                      <Briefcase className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate max-w-[120px]">{formTouched.has("project") ? (form.projectName || "المشروع") : "المشروع"}</span>
                      <ChevronDown className={cn("w-3 h-3 transition-transform shrink-0 text-neutral-400", formDropdown === "project" ? "rotate-180" : "")} />
                    </button>
                    {formDropdown === "project" && (
                      <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[200px]">
                        <p className="text-xs font-semibold text-neutral-400 px-4 py-2">المشروع</p>
                        {PROJECTS.map(p => (
                          <button key={p} onClick={() => { setForm(f => ({ ...f, projectName: p })); setFormTouched(t => new Set([...t, "project"])); setFormDropdown(null); }} className={cn("w-full px-4 py-2 text-sm text-right hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", form.projectName === p ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                            {p}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Start Date Pill */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700">
                    <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate max-w-[120px]">موعد بدء</span>
                  </div>

                  {/* More */}
                  <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg border bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 transition-colors"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                </div>

                {/* Progress Pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">نسبة الإنجاز: {form.progress ?? 0}%</span>
                  <input type="range" min={0} max={100} value={form.progress || 0} onChange={e => setForm(f => ({ ...f, progress: parseInt(e.target.value) }))} className="w-20 h-1.5 accent-teal-500 cursor-pointer" />
                </div>

                {/* Subtasks */}
                <div className="space-y-2">
                  {(form.subtasks || []).map((st) => (
                    <div key={st.id}>
                      {formEditingSubtaskId === st.id ? (
                        /* Inline edit form */
                        <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 space-y-2">
                          <input
                            value={formEditingSubtaskForm.title || ""}
                            onChange={e => setFormEditingSubtaskForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="اسم المهمة الفرعية"
                            className="w-full text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-1 focus:ring-teal-400/30"
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Status picker */}
                            <div className="relative">
                              <button onClick={() => setFormEditingSubtaskDropdown(d => d === "status" ? null : "status")} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium transition-colors", formEditingSubtaskDropdown === "status" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                                <span className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[formEditingSubtaskForm.status || "todo"].accent)} />
                                <span>{STATUS_CONFIG[formEditingSubtaskForm.status || "todo"].label}</span>
                                <ChevronDown className={cn("w-3 h-3 transition-transform", formEditingSubtaskDropdown === "status" ? "rotate-180" : "")} />
                              </button>
                              {formEditingSubtaskDropdown === "status" && (
                                <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[140px]">
                                  {(["todo","in-progress","in-review","completed","overdue"] as TaskStatus[]).map(s => (
                                    <button key={s} onClick={() => { setFormEditingSubtaskForm(f => ({ ...f, status: s })); setFormEditingSubtaskDropdown(null); }} className={cn("w-full px-3 py-1.5 text-xs text-right flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", (formEditingSubtaskForm.status || "todo") === s ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                                      <span className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[s].accent)} />
                                      {STATUS_CONFIG[s].label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            {/* Priority picker */}
                            <div className="relative">
                              <button onClick={() => setFormEditingSubtaskDropdown(d => d === "priority" ? null : "priority")} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium transition-colors", formEditingSubtaskDropdown === "priority" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                                <Flag className={cn("w-3 h-3", PRIORITY_CONFIG[formEditingSubtaskForm.priority || "medium"].flag)} />
                                <span>{PRIORITY_CONFIG[formEditingSubtaskForm.priority || "medium"].label}</span>
                                <ChevronDown className={cn("w-3 h-3 transition-transform", formEditingSubtaskDropdown === "priority" ? "rotate-180" : "")} />
                              </button>
                              {formEditingSubtaskDropdown === "priority" && (
                                <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[140px]">
                                  {(["low","medium","high","urgent"] as TaskPriority[]).map(p => (
                                    <button key={p} onClick={() => { setFormEditingSubtaskForm(f => ({ ...f, priority: p })); setFormEditingSubtaskDropdown(null); }} className={cn("w-full px-3 py-1.5 text-xs text-right flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", (formEditingSubtaskForm.priority || "medium") === p ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                                      <Flag className={cn("w-3 h-3", PRIORITY_CONFIG[p].flag)} />
                                      {PRIORITY_CONFIG[p].label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            {/* Assignee picker */}
                            <div className="relative">
                              <button onClick={() => setFormEditingSubtaskDropdown(d => d === "assignee" ? null : "assignee")} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium transition-colors", formEditingSubtaskDropdown === "assignee" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                                <img src={avatarUrl(formEditingSubtaskForm.assignee)} alt={formEditingSubtaskForm.assignee} className="w-4 h-4 rounded-full object-cover" />
                                <span className="max-w-[80px] truncate">{formEditingSubtaskForm.assignee}</span>
                                <ChevronDown className={cn("w-3 h-3 transition-transform", formEditingSubtaskDropdown === "assignee" ? "rotate-180" : "")} />
                              </button>
                              {formEditingSubtaskDropdown === "assignee" && (
                                <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[160px] max-h-[200px] overflow-y-auto">
                                  {ASSIGNEES.map(name => (
                                    <button key={name} onClick={() => { setFormEditingSubtaskForm(f => ({ ...f, assignee: name })); setFormEditingSubtaskDropdown(null); }} className={cn("w-full px-3 py-1.5 text-xs text-right flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", formEditingSubtaskForm.assignee === name ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                                      <img src={avatarUrl(name)} alt={name} className="w-4 h-4 rounded-full object-cover" />
                                      {name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            {/* Due Date picker */}
                            <div className="relative">
                              <button onClick={() => setFormEditingSubtaskDropdown(d => d === "dueDate" ? null : "dueDate")} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium transition-colors", formEditingSubtaskDropdown === "dueDate" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                                <CalendarIcon className="w-3 h-3 text-neutral-400" />
                                <span>{formEditingSubtaskForm.dueDate || today}</span>
                                <ChevronDown className={cn("w-3 h-3 transition-transform", formEditingSubtaskDropdown === "dueDate" ? "rotate-180" : "")} />
                              </button>
                              {formEditingSubtaskDropdown === "dueDate" && (
                                <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-2 min-w-[200px]">
                                  <input type="date" value={formEditingSubtaskForm.dueDate || today} onChange={e => { setFormEditingSubtaskForm(f => ({ ...f, dueDate: e.target.value })); setFormEditingSubtaskDropdown(null); }} className="w-full text-xs rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-teal-400" dir="ltr" />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setFormEditingSubtaskId(null); setFormEditingSubtaskForm({}); setFormEditingSubtaskDropdown(null); }} className="px-2 py-1 text-[10px] text-neutral-500 hover:text-neutral-700 transition-colors">إلغاء</button>
                            <button onClick={() => { if (!formEditingSubtaskForm.title?.trim()) return; const next = (form.subtasks || []).map(s => s.id === st.id ? { ...s, ...formEditingSubtaskForm, title: formEditingSubtaskForm.title!.trim() } as Task : s); setForm(f => ({ ...f, subtasks: next })); setFormEditingSubtaskId(null); setFormEditingSubtaskForm({}); setFormEditingSubtaskDropdown(null); }} className="px-2 py-1 text-[10px] font-semibold text-teal-600 hover:text-teal-700 transition-colors">حفظ</button>
                          </div>
                        </div>
                      ) : (
                        /* Summary card */
                        <div className="flex items-center gap-2 p-2 rounded-lg border border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                          <span className={cn("w-2 h-2 rounded-full shrink-0", STATUS_CONFIG[st.status]?.accent || "bg-gray-300")} />
                          <span className="flex-1 text-sm text-neutral-700 dark:text-neutral-200 truncate text-right">{st.title}</span>
                          <div className="flex items-center gap-1.5">
                            <img src={avatarUrl(st.assignee)} alt={st.assignee} className="w-5 h-5 rounded-full object-cover" />
                            <Flag className={cn("w-3.5 h-3.5", PRIORITY_CONFIG[st.priority]?.flag || "text-gray-400")} />
                            <span className="text-[10px] text-neutral-400">{st.dueDate}</span>
                          </div>
                          <button onClick={() => { setFormEditingSubtaskId(st.id); setFormEditingSubtaskForm({ ...st }); setFormEditingSubtaskDropdown(null); }} className="text-neutral-400 hover:text-teal-500"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => { const next = (form.subtasks || []).filter(s => s.id !== st.id); setForm(f => ({ ...f, subtasks: next })); }} className="text-neutral-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Inline subtask form */}
                  {formShowSubtaskForm && (
                    <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 space-y-2">
                      <input
                        value={formSubtaskForm.title || ""}
                        onChange={e => setFormSubtaskForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="اسم المهمة الفرعية"
                        className="w-full text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-1 focus:ring-teal-400/30"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status picker */}
                        <div className="relative">
                          <button onClick={() => setFormSubtaskDropdown(d => d === "status" ? null : "status")} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium transition-colors", formSubtaskDropdown === "status" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                            <span className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[formSubtaskForm.status || "todo"].accent)} />
                            <span>{STATUS_CONFIG[formSubtaskForm.status || "todo"].label}</span>
                            <ChevronDown className={cn("w-3 h-3 transition-transform", formSubtaskDropdown === "status" ? "rotate-180" : "")} />
                          </button>
                          {formSubtaskDropdown === "status" && (
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[140px]">
                              {(["todo","in-progress","in-review","completed","overdue"] as TaskStatus[]).map(s => (
                                <button key={s} onClick={() => { setFormSubtaskForm(f => ({ ...f, status: s })); setFormSubtaskDropdown(null); }} className={cn("w-full px-3 py-1.5 text-xs text-right flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", (formSubtaskForm.status || "todo") === s ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                                  <span className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[s].accent)} />
                                  {STATUS_CONFIG[s].label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Priority picker */}
                        <div className="relative">
                          <button onClick={() => setFormSubtaskDropdown(d => d === "priority" ? null : "priority")} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium transition-colors", formSubtaskDropdown === "priority" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                            <Flag className={cn("w-3 h-3", PRIORITY_CONFIG[formSubtaskForm.priority || "medium"].flag)} />
                            <span>{PRIORITY_CONFIG[formSubtaskForm.priority || "medium"].label}</span>
                            <ChevronDown className={cn("w-3 h-3 transition-transform", formSubtaskDropdown === "priority" ? "rotate-180" : "")} />
                          </button>
                          {formSubtaskDropdown === "priority" && (
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[140px]">
                              {(["low","medium","high","urgent"] as TaskPriority[]).map(p => (
                                <button key={p} onClick={() => { setFormSubtaskForm(f => ({ ...f, priority: p })); setFormSubtaskDropdown(null); }} className={cn("w-full px-3 py-1.5 text-xs text-right flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", (formSubtaskForm.priority || "medium") === p ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                                  <Flag className={cn("w-3 h-3", PRIORITY_CONFIG[p].flag)} />
                                  {PRIORITY_CONFIG[p].label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Assignee picker */}
                        <div className="relative">
                          <button onClick={() => setFormSubtaskDropdown(d => d === "assignee" ? null : "assignee")} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium transition-colors", formSubtaskDropdown === "assignee" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                            <img src={avatarUrl(formSubtaskForm.assignee)} alt={formSubtaskForm.assignee} className="w-4 h-4 rounded-full object-cover" />
                            <span className="max-w-[80px] truncate">{formSubtaskForm.assignee}</span>
                            <ChevronDown className={cn("w-3 h-3 transition-transform", formSubtaskDropdown === "assignee" ? "rotate-180" : "")} />
                          </button>
                          {formSubtaskDropdown === "assignee" && (
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[160px] max-h-[200px] overflow-y-auto">
                              {ASSIGNEES.map(name => (
                                <button key={name} onClick={() => { setFormSubtaskForm(f => ({ ...f, assignee: name })); setFormSubtaskDropdown(null); }} className={cn("w-full px-3 py-1.5 text-xs text-right flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", formSubtaskForm.assignee === name ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                                  <img src={avatarUrl(name)} alt={name} className="w-4 h-4 rounded-full object-cover" />
                                  {name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Due Date picker */}
                        <div className="relative">
                          <button onClick={() => setFormSubtaskDropdown(d => d === "dueDate" ? null : "dueDate")} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium transition-colors", formSubtaskDropdown === "dueDate" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                            <CalendarIcon className="w-3 h-3 text-neutral-400" />
                            <span>{formSubtaskForm.dueDate || today}</span>
                            <ChevronDown className={cn("w-3 h-3 transition-transform", formSubtaskDropdown === "dueDate" ? "rotate-180" : "")} />
                          </button>
                          {formSubtaskDropdown === "dueDate" && (
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-2 min-w-[200px]">
                              <input type="date" value={formSubtaskForm.dueDate || today} onChange={e => { setFormSubtaskForm(f => ({ ...f, dueDate: e.target.value })); setFormSubtaskDropdown(null); }} className="w-full text-xs rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-teal-400" dir="ltr" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setFormShowSubtaskForm(false); setFormSubtaskDropdown(null); setFormSubtaskForm({ status: "todo", priority: "medium", dueDate: today, assignee: ASSIGNEES[0], progress: 0, projectName: PROJECTS[0] }); }} className="px-2 py-1 text-[10px] text-neutral-500 hover:text-neutral-700 transition-colors">إلغاء</button>
                        <button onClick={() => { if (!formSubtaskForm.title?.trim()) return; const newSubtask: Task = { id: String(Date.now()), title: formSubtaskForm.title!.trim(), description: "", status: formSubtaskForm.status || "todo", priority: formSubtaskForm.priority || "medium", dueDate: formSubtaskForm.dueDate || today, assignee: formSubtaskForm.assignee || ASSIGNEES[0], progress: formSubtaskForm.progress ?? 0, projectName: formSubtaskForm.projectName || PROJECTS[0] }; const next = [...(form.subtasks || []), newSubtask]; setForm(f => ({ ...f, subtasks: next })); setFormShowSubtaskForm(false); setFormSubtaskDropdown(null); setFormSubtaskForm({ status: "todo", priority: "medium", dueDate: today, assignee: ASSIGNEES[0], progress: 0, projectName: PROJECTS[0] }); }} className="px-2 py-1 text-[10px] font-semibold text-teal-600 hover:text-teal-700 transition-colors">حفظ</button>
                      </div>
                    </div>
                  )}

                  <button onClick={() => setFormShowSubtaskForm(true)} className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center"><CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /></div>
                    إضافة مهمة فرعية
                  </button>
                </div>

                {/* Attachments */}
                {(form.attachments || []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(form.attachments || []).map(att => (
                      <div key={att.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs">
                        <Paperclip className="w-3 h-3 text-neutral-400" />
                        <span className="text-neutral-700 dark:text-neutral-200 truncate max-w-[120px]">{att.name}</span>
                        <span className="text-neutral-400">{att.size}</span>
                        <button onClick={() => setForm(f => ({ ...f, attachments: (f.attachments || []).filter(a => a.id !== att.id) }))} className="text-neutral-400 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <button onClick={() => taskFileInputRef.current?.click()} className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"><Paperclip className="w-4 h-4" /></button>
                  <input ref={taskFileInputRef} type="file" multiple className="hidden" onChange={async (e) => { const files = e.target.files; if (!files) return; const newAtts = await Promise.all(Array.from(files).map(async (file) => { const data = await readFile(file); return { id: String(Date.now()) + Math.random().toString(36).slice(2, 8), ...data }; })); setForm(f => ({ ...f, attachments: [...(f.attachments || []), ...newAtts] })); e.target.value = ""; }} />
                  <button className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"><Bell className="w-4 h-4" /></button>
                  <button onClick={save} className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 transition-colors">{editing ? "حفظ التعديلات" : "إنشاء مهمة"}</button>
                </div>
                  </div>
                </div>

                {/* Activity sidebar - right 55% */}
                <div className={cn("sm:w-[55%] min-w-0 border-t sm:border-t-0 sm:border-r border-neutral-100 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 overflow-y-auto flex flex-col", formMobileTab === "details" ? "hidden sm:flex" : "")}>
                  {/* Activity header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">النشاط والتعليقات</h3>
                    <div className="flex items-center gap-0.5 text-neutral-400">
                      <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"><Search className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"><Bell className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  {/* Activity items */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Created task entry */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center shrink-0 shadow-sm border border-teal-100 dark:border-teal-800/40">
                        <FilePlus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">أنشأت هذه المهمة</p>
                        <span className="text-xs text-neutral-400 mt-0.5 block">{form.createdAt || today}</span>
                      </div>
                    </div>

                    {((editing ? editing.comments : form.comments) || []).length === 0 && (
                      <div className="flex flex-col items-center justify-center py-6 text-neutral-400">
                        <Bell className="w-8 h-8 mb-2 opacity-40" />
                        <p className="text-sm">اكتب تعليقاً عن سير عمل المهمة</p>
                      </div>
                    )}
                    {((editing ? editing.comments : form.comments) || []).map(c => {
                      const canEdit = c.author === "أنت" && c.createdAt && (Date.now() - c.createdAt < 30 * 60 * 1000);
                      const isEditing = formEditingComment?.id === c.id;
                      const currentComments = editing ? (editing.comments || []) : (form.comments || []);
                      const updateComments = (next: typeof currentComments) => {
                        if (editing) {
                          setForm(f => ({ ...f, comments: next }));
                          setTasks(p => p.map(t => t.id === editing.id ? { ...t, comments: next } : t));
                        } else {
                          setForm(f => ({ ...f, comments: next }));
                        }
                      };
                      return (
                        <div key={c.id} className="flex gap-3">
                          <img src={avatarUrl(c.author)} alt={c.author} className="w-8 h-8 rounded-full object-cover shrink-0 shadow-sm" />
                          <div className="flex-1 min-w-0 bg-white dark:bg-neutral-800 rounded-xl p-3 shadow-sm border border-neutral-100 dark:border-neutral-700/60">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed text-right">
                                <span className="font-semibold text-neutral-900 dark:text-white">{c.author}</span>
                              </p>
                              {canEdit && !isEditing && (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => setFormEditingComment({ id: c.id, text: c.text })} className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-teal-500 transition-colors"><Pencil className="w-3 h-3" /></button>
                                  <button onClick={() => { const next = currentComments.filter(x => x.id !== c.id); updateComments(next); }} className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                </div>
                              )}
                            </div>
                            {isEditing ? (
                              <div className="mt-1">
                                <textarea value={formEditingComment.text} onChange={e => setFormEditingComment({ ...formEditingComment, text: e.target.value })} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); const next = currentComments.map(x => x.id === c.id ? { ...x, text: formEditingComment.text.trim() } : x); updateComments(next); setFormEditingComment(null); } }} className="w-full text-xs text-neutral-700 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg border border-neutral-200 dark:border-neutral-600 p-2 focus:outline-none focus:ring-1 focus:ring-teal-400/30 resize-none text-right" rows={2} />
                                <div className="flex items-center justify-end gap-1 mt-1">
                                  <button onClick={() => setFormEditingComment(null)} className="px-2 py-1 text-[10px] text-neutral-500 hover:text-neutral-700 transition-colors">إلغاء</button>
                                  <button onClick={() => { const next = currentComments.map(x => x.id === c.id ? { ...x, text: formEditingComment.text.trim() } : x); updateComments(next); setFormEditingComment(null); }} className="px-2 py-1 text-[10px] font-semibold text-teal-600 hover:text-teal-700 transition-colors">حفظ</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {c.text && <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed text-right">{c.text}</p>}
                                {(c.attachments || []).length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {(c.attachments || []).map(att => (
                                      att.type?.startsWith("image/") ? (
                                        <a key={att.id} href={att.url} download={att.name} className="block rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:opacity-90 transition-opacity">
                                          <img src={att.url} alt={att.name} className="w-24 h-24 object-cover" />
                                        </a>
                                      ) : (
                                        <a key={att.id} href={att.url} download={att.name} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                                          <Paperclip className="w-3 h-3 text-neutral-400" />
                                          <span className="text-neutral-700 dark:text-neutral-200 truncate max-w-[100px]">{att.name}</span>
                                          <span className="text-neutral-400">{att.size}</span>
                                        </a>
                                      )
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                            <span className="text-[11px] text-neutral-400 mt-2 block">{c.date}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Comment input */}
                  <div className="p-3 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shrink-0">
                    {formCommentAttachments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {formCommentAttachments.map(att => (
                          <div key={att.id} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px]">
                            <Paperclip className="w-3 h-3 text-neutral-400" />
                            <span className="text-neutral-700 dark:text-neutral-200 truncate max-w-[100px]">{att.name}</span>
                            <button onClick={() => setFormCommentAttachments(p => p.filter(a => a.id !== att.id))} className="text-neutral-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="relative">
                      <textarea
                        value={formComment}
                        onChange={e => { setFormComment(e.target.value); const ctx = getMentionContext(e.target.value, e.target.selectionStart); setFormMention(ctx); }}
                        onKeyDown={e => {
                          if (e.key === "Escape") { setFormMention(null); return; }
                          if (e.key === "Enter" && !e.shiftKey && (formComment.trim() || formCommentAttachments.length > 0)) {
                            e.preventDefault();
                            const newComment = { id: String(Date.now()), author: "أنت", text: formComment.trim(), date: "الآن", createdAt: Date.now(), attachments: formCommentAttachments };
                            const currentComments = editing ? (editing.comments || []) : (form.comments || []);
                            const next = [...currentComments, newComment];
                            if (editing) {
                              setForm(f => ({ ...f, comments: next }));
                              setTasks(p => p.map(t => t.id === editing.id ? { ...t, comments: next } : t));
                            } else {
                              setForm(f => ({ ...f, comments: next }));
                            }
                            setFormComment("");
                            setFormCommentAttachments([]);
                            setFormMention(null);
                          }
                        }}
                        placeholder="اكتب تعليقاً..."
                        className="w-full min-h-[48px] p-2.5 pr-10 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-sm text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400/50 resize-none text-right transition-all"
                      />
                      {formMention && (
                        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1 max-h-[180px] overflow-y-auto">
                          {MENTION_OPTIONS.filter(o => o.label.toLowerCase().includes(formMention.query.toLowerCase())).length === 0 ? (
                            <p className="px-3 py-2 text-xs text-neutral-400 text-right">لا يوجد نتائج</p>
                          ) : (
                            MENTION_OPTIONS.filter(o => o.label.toLowerCase().includes(formMention.query.toLowerCase())).map(o => (
                              <button key={o.id} onClick={() => { const before = formComment.slice(0, formMention.startIndex); const after = formComment.slice(formMention.startIndex + 1 + formMention.query.length); setFormComment(before + "@" + o.label + " " + after); setFormMention(null); }} className="w-full px-3 py-2 text-sm text-right flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", o.type === "person" ? "bg-blue-50 text-blue-600" : o.type === "team" ? "bg-emerald-50 text-emerald-600" : o.type === "department" ? "bg-amber-50 text-amber-600" : "bg-violet-50 text-violet-600")}>{o.type === "person" ? "شخص" : o.type === "team" ? "فريق" : o.type === "department" ? "قسم" : "لجنة"}</span>
                                {o.label}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                      <div className="absolute left-2 bottom-2 flex items-center gap-1">
                        <button onClick={() => formFileInputRef.current?.click()} className="p-2 rounded-lg text-neutral-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"><Paperclip className="w-4 h-4" /></button>
                        <input ref={formFileInputRef} type="file" multiple className="hidden" onChange={async (e) => { const files = e.target.files; if (!files) return; const newAtts = await Promise.all(Array.from(files).map(async (file) => { const data = await readFile(file); return { id: String(Date.now()) + Math.random().toString(36).slice(2, 8), ...data }; })); setFormCommentAttachments(p => [...p, ...newAtts]); e.target.value = ""; }} />
                        <button onClick={() => { if (!formComment.trim() && formCommentAttachments.length === 0) return; const newComment = { id: String(Date.now()), author: "أنت", text: formComment.trim(), date: "الآن", createdAt: Date.now(), attachments: formCommentAttachments }; const currentComments = editing ? (editing.comments || []) : (form.comments || []); const next = [...currentComments, newComment]; if (editing) { setForm(f => ({ ...f, comments: next })); setTasks(p => p.map(t => t.id === editing.id ? { ...t, comments: next } : t)); } else { setForm(f => ({ ...f, comments: next })); } setFormComment(""); setFormCommentAttachments([]); setFormMention(null); }} className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-500 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors"><Send className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Fixed-position table inline dropdown — escapes all overflow/z-index constraints */}
      {tableDropdown && (() => {
        const dt = tasks.find(t => t.id === tableDropdown.id);
        if (!dt) return null;
        return (
          <div
            ref={tableDropdownRef}
            className="fixed z-[9999] bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-xl shadow-xl"
            style={{ top: tableDropdown.top + 4, right: tableDropdown.right }}
          >
            {tableDropdown.field === "assignee" && (
              <div className="py-1.5 min-w-[200px]">
                {ASSIGNEES.map(name => (
                  <button key={name} type="button"
                    onClick={() => { updateTask(dt.id, { assignee: name, assignMode: "me", assignTarget: undefined, assignMembers: undefined }); setTableDropdown(null); }}
                    className={cn("w-full px-4 py-2 text-sm text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors", dt.assignee === name ? "text-teal-600 font-semibold" : "text-gray-700 dark:text-gray-200")}>
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0", avatarColor(name))}>{initials(name)}</div>
                    <span className="truncate">{name}</span>
                  </button>
                ))}
              </div>
            )}
            {tableDropdown.field === "project" && (
              <div className="py-1.5 min-w-[220px]">
                {PROJECTS.map(p => (
                  <button key={p} type="button"
                    onClick={() => { updateTask(dt.id, { projectName: p }); setTableDropdown(null); }}
                    className={cn("w-full px-4 py-2 text-sm text-right hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors", dt.projectName === p ? "text-teal-600 font-semibold" : "text-gray-700 dark:text-gray-200")}>
                    {p}
                  </button>
                ))}
              </div>
            )}
            {tableDropdown.field === "source" && (
              <div className="py-1.5 min-w-[200px]">
                {SOURCES.map(s => (
                  <button key={s} type="button"
                    onClick={() => { updateTask(dt.id, { taskSource: s }); setTableDropdown(null); }}
                    className={cn("w-full px-4 py-2 text-sm text-right hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors", dt.taskSource === s ? "text-teal-600 font-semibold" : "text-gray-700 dark:text-gray-200")}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            {tableDropdown.field === "progress" && (
              <div className="p-3 w-[220px]">
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">نسبة الإنجاز: {dt.progress}%</label>
                <input type="range" min={0} max={100} value={dt.progress}
                  onChange={e => updateTask(dt.id, { progress: parseInt(e.target.value || "0", 10) || 0 })}
                  className="w-full accent-teal-500" />
              </div>
            )}
            {tableDropdown.field === "dueDate" && (
              <div className="p-3 w-[220px]">
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">الموعد النهائي</label>
                <input type="date" value={dt.dueDate}
                  onChange={e => updateTask(dt.id, { dueDate: e.target.value })}
                  className="w-full text-xs rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-teal-400" />
              </div>
            )}
            {tableDropdown.field === "priority" && (
              <div className="py-1.5 min-w-[180px]">
                {(["low", "medium", "high", "urgent"] as TaskPriority[]).map(p => (
                  <button key={p} type="button"
                    onClick={() => { updateTask(dt.id, { priority: p }); setTableDropdown(null); }}
                    className={cn("w-full px-4 py-2 text-sm text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors", dt.priority === p ? "text-teal-600 font-semibold" : "text-gray-700 dark:text-gray-200")}>
                    <Flag className={cn("w-4 h-4", PRIORITY_CONFIG[p].flag)} />
                    <span className="text-sm">{PRIORITY_CONFIG[p].label}</span>
                  </button>
                ))}
              </div>
            )}
            {tableDropdown.field === "status" && (
              <div className="py-1.5 min-w-[200px]">
                {(["todo","in-progress","in-review","overdue","completed"] as TaskStatus[]).map(s => (
                  <button key={s} type="button"
                    onClick={() => { updateTask(dt.id, { status: s }); setTableDropdown(null); }}
                    className={cn("w-full px-4 py-2 text-sm text-right flex items-center gap-2 hover:bg-gray-50 dark:hoverBg-neutral-700 transition-colors", dt.status === s ? "text-teal-600 font-semibold" : "text-gray-700 dark:text-gray-200")}>
                    <span className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[s].headerDot)} />
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold", STATUS_CONFIG[s].badgeBg, STATUS_CONFIG[s].badgeText)}>{STATUS_CONFIG[s].label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
