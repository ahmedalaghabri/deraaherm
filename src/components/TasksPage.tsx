import { useState, useEffect, useMemo, useRef, Fragment } from "react";
import { Plus, Search, SlidersHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X, MoreHorizontal, List, LayoutGrid, Calendar as CalendarIcon, ArrowUpDown, Megaphone, Flag, UserCircle, Paperclip, Bell, Calendar, Users, Building2, FolderOpen, Inbox, Clock, Check, CheckSquare, Send, Star, Play, FilePlus, Pencil, Trash2, Printer, FileDown, ExternalLink, Video, Layers, Smile, Mic, Camera, Image as ImageIcon, FileText, CheckCheck, Square, AtSign, MessageSquare, Bold, Italic, Underline, Strikethrough, Code2, AlignRight, AlignCenter, AlignLeft, Link2, ListChecks, Highlighter, Repeat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { useAI } from "./ai/AIContext";
import PageHeader from "./PageHeader";
import { useFirestoreCollection } from "../lib/useFirestoreCollection";
import CampaignsPage from "./CampaignsPage";
import TeamsPage from "./TeamsPage";

export type TaskStatus = "todo" | "in-progress" | "in-review" | "completed" | "overdue";
type TaskPriority = "low" | "medium" | "high" | "urgent" | "emergency";
type ViewMode = "list" | "kanban" | "calendar";
type SortKey = "title" | "assignee" | "assignedBy" | "createdAt" | "progress" | "dueDate" | "priority" | "projectName" | "source" | "status";
type AssignMode = "me" | "team" | "department" | "committee";
type SavePhase = "idle" | "saving" | "saved";
type TextFormatTarget = "task-description" | "detail-description" | "form-comment" | "detail-comment";
type InlineTextFormat = "bold" | "italic" | "underline" | "strikethrough" | "code" | "highlight" | "bullet" | "checklist" | "link" | "align-right" | "align-center" | "align-left";

export interface Task {
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
  tagColors?: Record<string, string>;
  assignMode?: AssignMode;
  assignTarget?: string;
  assignMembers?: string[];
  assignedBy?: string;
  supervisor?: string;
  progressMode?: "individual" | "collective";
  memberProgress?: Record<string, number>;
  taskSource?: string;
  createdAt?: string;
  startDate?: string;
  timeEstimate?: string;
  subtasks?: Task[];
  checklist?: { id: string; text: string; checked: boolean }[];
  attachments?: { id: string; name: string; size: string; type?: string; url?: string }[];
  comments?: { id: string; author: string; text: string; date: string; createdAt?: number; attachments?: { id: string; name: string; size: string; type?: string; url?: string }[] }[];
  recurrence?: TaskRecurrence;
}

export type RecurrenceFrequency = "none" | "daily" | "weekly" | "monthly" | "yearly";
export interface TaskRecurrence {
  frequency: RecurrenceFrequency;
  endType: "open" | "count" | "date";
  endCount?: number;
  endDate?: string;
  selectedDays?: number[];
}

export const ASSIGNEES = ["فهد العتيبي", "نورة السبيعي", "خالد القحطاني", "منى الزهراني", "أحمد الشمري", "سارة الدوسري"];
const CURRENT_USER_NAME = "احمد الاغبري";
const PROJECTS = ["معرض الرياض بارك", "فرع جدة بارك", "معرض الظهران مول", "فرع الرياض جاليري", "معرض الخبر بلازا", "فرع مكة مول"];

const DEFAULT_TAGS = ["تصميم", "تطوير", "تسويق", "مراجعة", "عاجل", "مبيعات"];
const TAG_COLOR_PRESETS = [
  { name: "أزرق", bg: "bg-blue-500", text: "text-white", light: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", dot: "bg-blue-500" },
  { name: "أخضر", bg: "bg-emerald-500", text: "text-white", light: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", dot: "bg-emerald-500" },
  { name: "بنفسجي", bg: "bg-violet-500", text: "text-white", light: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300", dot: "bg-violet-500" },
  { name: "برتقالي", bg: "bg-orange-500", text: "text-white", light: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300", dot: "bg-orange-500" },
  { name: "وردي", bg: "bg-pink-500", text: "text-white", light: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300", dot: "bg-pink-500" },
  { name: "سماوي", bg: "bg-cyan-500", text: "text-white", light: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300", dot: "bg-cyan-500" },
  { name: "أحمر", bg: "bg-red-500", text: "text-white", light: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", dot: "bg-red-500" },
  { name: "كهرماني", bg: "bg-amber-500", text: "text-white", light: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", dot: "bg-amber-500" },
];
const DEFAULT_TAG_COLORS: Record<string, { bg: string; text: string; light: string; dot: string }> = {
  "تصميم": TAG_COLOR_PRESETS[0],
  "تطوير": TAG_COLOR_PRESETS[2],
  "تسويق": TAG_COLOR_PRESETS[1],
  "مراجعة": TAG_COLOR_PRESETS[5],
  "عاجل": TAG_COLOR_PRESETS[6],
  "مبيعات": TAG_COLOR_PRESETS[4],
};

function getTagColor(tag: string, tagColors?: Record<string, string>): { bg: string; text: string; light: string; dot: string } {
  const colorKey = tagColors?.[tag];
  if (colorKey) {
    const preset = TAG_COLOR_PRESETS.find(p => p.name === colorKey);
    if (preset) return preset;
  }
  if (DEFAULT_TAG_COLORS[tag]) return DEFAULT_TAG_COLORS[tag];
  const hash = tag.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return TAG_COLOR_PRESETS[hash % TAG_COLOR_PRESETS.length];
}

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

const RECURRENCE_LABELS: Record<RecurrenceFrequency, string> = {
  none: "بدون تكرار",
  daily: "يومي",
  weekly: "أسبوعي",
  monthly: "شهري",
  yearly: "سنوي",
};

const RECURRENCE_MONTHS_AR = ["يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const RECURRENCE_DAYS_SHORT = ["سبت", "أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة"];

const RECURRENCE_UNITS: Record<Exclude<RecurrenceFrequency, "none">, { singular: string; dual: string; plural: string }> = {
  daily: { singular: "يوم", dual: "يومان", plural: "أيام" },
  weekly: { singular: "أسبوع", dual: "أسبوعان", plural: "أسابيع" },
  monthly: { singular: "شهر", dual: "شهران", plural: "أشهر" },
  yearly: { singular: "سنة", dual: "سنتان", plural: "سنوات" },
};

function recurrenceUnitLabel(freq: RecurrenceFrequency, n: number): string {
  const unit = RECURRENCE_UNITS[freq === "none" ? "daily" : freq];
  if (n === 1) return `${unit.singular} واحد`;
  if (n === 2) return unit.dual;
  if (n >= 3 && n <= 10) return `${n} ${unit.plural}`;
  return `${n} ${unit.singular}`;
}

const COMMITTEES = [
  { name: "لجنة الجودة", head: "منى الزهراني", members: ["فهد العتيبي", "نورة السبيعي", "سارة الدوسري"] },
  { name: "لجنة المشتريات", head: "خالد القحطاني", members: ["أحمد الشمري", "نورة السبيعي"] },
];
export const STORAGE_KEY = "perfume-tasks-v1";
export const TASKS_COLLECTION = "tasks";
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "قيد الانتظار",
  "in-progress": "قيد العمل",
  "in-review": "تحت المراجعة",
  completed: "منتهية",
  overdue: "متأخرة",
};

function avatarUrl(name?: string | null) { if (!name) return "https://randomuser.me/api/portraits/men/0.jpg"; const hash = name.split("").reduce((a, b) => a + b.charCodeAt(0), 0); return `https://randomuser.me/api/portraits/men/${hash % 99}.jpg`; }
function taskDraftSnapshot(task: Partial<Task>, includeComments = false): string {
  if (includeComments) return JSON.stringify(task);
  const { comments: _comments, ...taskFields } = task;
  return JSON.stringify(taskFields);
}
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

export function getInitialTasks(): Task[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) { try { return JSON.parse(saved); } catch { /* fall */ } }
  return [
    { id: "P991254-1", assignedBy: "خالد القحطاني", title: "جرد مخزون عطور الفرع الرئيسي", description: "فحص الكميات الفعلية لمنتجات فروج ومونتال", status: "todo", priority: "high", dueDate: "2026-06-10", assignee: "فهد العتيبي", progress: 0, projectName: "معرض الرياض بارك", createdAt: "2026-05-20" },
    { id: "P552714-2", assignedBy: "فهد العتيبي", title: "تدريب بائعي قسم النيش براند", description: "شرح خصائص العطور النيش للفريق", status: "todo", priority: "high", dueDate: "2026-06-02", assignee: "نورة السبيعي", progress: 0, projectName: "فرع جدة بارك", createdAt: "2026-05-21" },
    { id: "P882726-3", assignedBy: "منى الزهراني", title: "تحضير عرض ترويجي لعيد الفطر", description: "تصميم باقات عطور بأسعار مغرية مع تغليف هدايا", status: "todo", priority: "low", dueDate: "2026-05-31", assignee: "نورة السبيعي", progress: 0, projectName: "فرع مكة مول", createdAt: "2026-05-22" },
    { id: "P883561-1", assignedBy: "سارة الدوسري", title: "توزيع استبيانات قياس رضا العملاء", description: "رصد تجربة الشراء وتحليل النتائج", status: "in-progress", priority: "medium", dueDate: "2026-05-25", assignee: "أحمد الشمري", progress: 80, projectName: "معرض الظهران مول", createdAt: "2026-05-15" },
    { id: "P919712-2", assignedBy: "فهد العتيبي", title: "جدولة جلسات عرض العطور الموسمية", description: "تنسيق مع موردي العطور الصيفية", status: "in-progress", priority: "high", dueDate: "2026-05-24", assignee: "منى الزهراني", progress: 55, projectName: "معرض الرياض بارك", createdAt: "2026-05-16" },
    { id: "P913762-3", assignedBy: "أحمد الشمري", title: "التنسيق مع متحدثين خارجيين لمعرض العطور", description: "التواصل مع خبراء العطور الدوليين", status: "in-progress", priority: "low", dueDate: "2026-05-30", assignee: "خالد القحطاني", progress: 76, projectName: "فرع الرياض جاليري", createdAt: "2026-05-17" },
    { id: "P125773-1", assignedBy: "منى الزهراني", title: "مراجعة قائمة المنتجات الجديدة للفرع", description: "التحقق من جاهزية المنتجات قبل الإطلاق", status: "in-review", priority: "medium", dueDate: "2026-05-26", assignee: "سارة الدوسري", progress: 90, projectName: "معرض الخبر بلازا", createdAt: "2026-05-18" },
    { id: "P927572-2", assignedBy: "نورة السبيعي", title: "استلام شحنة عطور جديدة - مونتال", description: "فحص جودة الشحنة وتسجيلها في النظام", status: "in-review", priority: "high", dueDate: "2026-05-28", assignee: "فهد العتيبي", progress: 86, projectName: "فرع جدة بارك", createdAt: "2026-05-19" },
    { id: "P012263-3", assignedBy: "خالد القحطاني", title: "تصميم كتالوج عطور الصيف 2026", description: "اختيار المنتجات الموسمية وتصميم الكتالوج الرقمي", status: "in-review", priority: "medium", dueDate: "2026-05-22", assignee: "منى الزهراني", progress: 89, projectName: "معرض الرياض بارك", createdAt: "2026-05-20" },
    { id: "P774412-1", assignedBy: "سارة الدوسري", title: "مراجعة تقرير مبيعات أبريل", description: "تحليل أداء الفروع ومقارنة الأهداف الشهرية", status: "completed", priority: "medium", dueDate: "2026-05-05", assignee: "خالد القحطاني", progress: 100, projectName: "فرع الرياض جاليري", createdAt: "2026-04-10" },
    { id: "P338821-2", assignedBy: "أحمد الشمري", title: "تحديث قائمة الأسعار بعد الضريبة", description: "تطبيق نسبة الضريبة الجديدة على جميع المنتجات", status: "completed", priority: "low", dueDate: "2026-05-01", assignee: "سارة الدوسري", progress: 100, projectName: "فرع جدة بارك", createdAt: "2026-04-15" },
    { id: "P558832-1", assignedBy: "فهد العتيبي", title: "مراجعة عقود إيجار الفروع الجديدة", description: "الاطلاع على بنود عقود الفروع المقرر افتتاحها", status: "overdue", priority: "high", dueDate: "2026-05-10", assignee: "أحمد الشمري", progress: 30, projectName: "معرض الخبر بلازا", createdAt: "2026-04-20" },
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
  emergency: { label: "طارئة",   bg: "bg-rose-100",   text: "text-rose-600",   flag: "text-rose-500" },
  urgent: { label: "عاجلة",   bg: "bg-red-100",    text: "text-red-600",    flag: "text-red-500" },
  high:   { label: "عالية",   bg: "bg-amber-100",  text: "text-amber-600",  flag: "text-amber-500" },
  medium: { label: "متوسطة",  bg: "bg-blue-100",   text: "text-blue-600",   flag: "text-blue-500" },
  low:    { label: "منخفضة",  bg: "bg-gray-100",   text: "text-gray-600",   flag: "text-gray-400" },
};

// ===== تصدير المهام (Excel / PDF) مجمعة حسب الحالة =====
const EXPORT_STATUS_ORDER: TaskStatus[] = ["todo", "in-progress", "in-review", "overdue", "completed"];
const EXPORT_STATUS_COLORS: Record<TaskStatus, { bg: string; text: string }> = {
  todo:          { bg: "#f5f5f5", text: "#262626" },
  "in-progress": { bg: "#dbeafe", text: "#1d4ed8" },
  "in-review":   { bg: "#ffedd5", text: "#c2410c" },
  overdue:       { bg: "#fee2e2", text: "#b91c1c" },
  completed:     { bg: "#ccfbf1", text: "#0f766e" },
};
const EXPORT_HEADERS = ["رقم المهمة", "اسم المهمة", "الوصف", "المسؤول", "المشروع", "المصدر", "الأولوية", "الحالة", "تاريخ الإنشاء", "تاريخ البدء", "الموعد النهائي", "نسبة الإنجاز"];

function escHtml(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function exportAssigneeLabel(t: Task): string {
  if (t.assignMode && t.assignMode !== "me" && t.assignTarget) return t.assignTarget;
  if (t.assignMembers && t.assignMembers.length > 0) return t.assignMembers.join("، ");
  return t.assignee || "";
}
function exportRow(t: Task): string[] {
  return [t.id, t.title, richTextToPlainText(t.description || ""), exportAssigneeLabel(t), t.projectName || "", t.taskSource || "غير محدد", PRIORITY_CONFIG[t.priority].label, STATUS_CONFIG[t.status].label, t.createdAt || "", t.startDate || "", t.dueDate || "", `${t.progress}%`];
}

function exportTasksExcel(tasks: Task[]) {
  const thCell = "border:1px solid #d4d4d4;background:#fafafa;padding:6px 8px;font-size:12px;font-weight:bold;text-align:right;white-space:nowrap";
  const tdCell = "border:1px solid #e5e5e5;padding:5px 8px;font-size:11px;text-align:right;vertical-align:top";
  const rowsHtml = EXPORT_STATUS_ORDER.map(status => {
    const rows = tasks.filter(t => t.status === status);
    if (rows.length === 0) return "";
    const c = EXPORT_STATUS_COLORS[status];
    return `
      <tr><td colspan="${EXPORT_HEADERS.length}" style="background:${c.bg};color:${c.text};font-weight:bold;font-size:14px;padding:8px;border:1px solid #d4d4d4;text-align:right">${STATUS_CONFIG[status].label} (${rows.length})</td></tr>
      <tr>${EXPORT_HEADERS.map(h => `<th style="${thCell}">${h}</th>`).join("")}</tr>
      ${rows.map(t => `<tr>${exportRow(t).map(v => `<td style="${tdCell}">${escHtml(v)}</td>`).join("")}</tr>`).join("")}
      <tr><td colspan="${EXPORT_HEADERS.length}" style="border:none;padding:4px"></td></tr>`;
  }).join("");
  const html = `<html dir="rtl" lang="ar"><head><meta charset="utf-8"></head><body><table dir="rtl" style="border-collapse:collapse">${rowsHtml}</table></body></html>`;
  const blob = new Blob(["\uFEFF" + html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `المهام حسب الحالة ${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportTasksPdf(tasks: Task[]) {
  const win = window.open("", "_blank");
  if (!win) return;
  const sections = EXPORT_STATUS_ORDER.map(status => {
    const rows = tasks.filter(t => t.status === status);
    if (rows.length === 0) return "";
    const c = EXPORT_STATUS_COLORS[status];
    return `
      <section>
        <h2 style="background:${c.bg};color:${c.text}"><span class="dot" style="background:${c.text}"></span>${STATUS_CONFIG[status].label} <span class="count">(${rows.length})</span></h2>
        <table>
          <thead><tr>${EXPORT_HEADERS.map(h => `<th>${h}</th>`).join("")}</tr></thead>
          <tbody>${rows.map(t => `<tr>${exportRow(t).map(v => `<td>${escHtml(v)}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
      </section>`;
  }).join("");
  const today = new Date().toISOString().slice(0, 10);
  win.document.write(`<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>المهام حسب الحالة ${today}</title><style>
    @page { size: A4 landscape; margin: 10mm; }
    * { box-sizing: border-box; }
    body { font-family: "Segoe UI", Tahoma, Arial, sans-serif; color: #171717; margin: 0; padding: 16px; }
    h1 { font-size: 18px; margin: 0 0 2px; }
    .sub { font-size: 11px; color: #737373; margin: 0 0 16px; }
    section { margin-bottom: 18px; page-break-inside: avoid; }
    h2 { font-size: 13px; padding: 6px 10px; border-radius: 8px; margin: 0 0 6px; display: flex; align-items: center; gap: 6px; }
    h2 .dot { width: 8px; height: 8px; border-radius: 99px; display: inline-block; }
    h2 .count { font-weight: normal; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #fafafa; font-size: 9.5px; text-align: right; padding: 4px 6px; border: 1px solid #e5e5e5; white-space: nowrap; }
    td { font-size: 9.5px; text-align: right; padding: 4px 6px; border: 1px solid #e5e5e5; vertical-align: top; }
    tr { page-break-inside: avoid; }
  </style></head><body>
    <h1>تقرير المهام — مجمع حسب الحالة</h1>
    <p class="sub">تاريخ التصدير: ${today} — إجمالي المهام: ${tasks.length}</p>
    ${sections}
  </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}

interface TasksPageProps { onBack?: () => void; onNewCampaign?: () => void; }

const STATUS_RANK: Record<TaskStatus, number> = { todo: 0, "in-progress": 1, "in-review": 2, overdue: 3, completed: 4 };
const SORT_LABELS: Record<SortKey, string> = { title: "الاسم", assignee: "المسؤول", assignedBy: "أسندها", createdAt: "الإنشاء", progress: "الإنجاز", dueDate: "الموعد", priority: "الأولوية", projectName: "المشروع", source: "المصدر", status: "الحالة" };
const TEXT_SORT_KEYS: SortKey[] = ["title", "assignee", "assignedBy", "projectName", "source", "status"];

const COLS = [
  { key: "title",       label: "اسم المهمة" },
  { key: "assignee",    label: "المسؤول" },
  { key: "assignedBy",  label: "أسندها" },
  { key: "createdAt",   label: "تاريخ الإنشاء" },
  { key: "progress",    label: "الإنجاز" },
  { key: "dueDate",     label: "الموعد النهائي" },
  { key: "priority",    label: "الأولوية" },
  { key: "projectName", label: "المشروع" },
  { key: "source",      label: "المصدر" },
  { key: "status",      label: "الحالة" },
  { key: "action",      label: "إجراء" },
] as const;

const SIMPLE_HIDDEN_COLS = new Set<string>(["assignedBy", "createdAt", "projectName", "source"]);

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      if (u.pathname.startsWith('/watch')) return u.searchParams.get('v');
      if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('/')[0];
      if (u.pathname.startsWith('/shorts/') || u.pathname.startsWith('/live/')) return u.pathname.split('/')[2];
    }
  } catch { /* invalid URL */ }
  return null;
}

function LinkPreview({ url }: { url: string }) {
  const [meta, setMeta] = useState<{ title?: string; author?: string; thumbnail?: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchMeta() {
      try {
        const videoId = getYouTubeId(url);
        if (videoId) {
          const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
          if (!cancelled && res.ok) {
            const data = await res.json();
            setMeta({ title: data.title, author: data.author_name, thumbnail: data.thumbnail_url });
          }
          return;
        }
        // Try noembed for other sites
        const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}&format=json`);
        if (!cancelled && res.ok) {
          const data = await res.json();
          if (data.title) {
            setMeta({ title: data.title, author: data.author_name, thumbnail: data.thumbnail_url });
          }
        }
      } catch {
        // ignore fetch errors
      }
    }
    fetchMeta();
    return () => { cancelled = true; };
  }, [url]);

  const videoId = getYouTubeId(url);
  if (videoId) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-1.5 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:opacity-90 transition-opacity">
        <img
          src={meta?.thumbnail || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
          alt={meta?.title || "YouTube thumbnail"}
          className="w-full h-28 object-cover"
          loading="lazy"
        />
        <div className="px-2 py-1.5 bg-neutral-50 dark:bg-neutral-800">
          <div className="text-[11px] font-medium text-neutral-800 dark:text-neutral-200 truncate">{meta?.title || "YouTube"}</div>
          {meta?.author && <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">{meta.author}</div>}
        </div>
      </a>
    );
  }
  try {
    const u = new URL(url);
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 px-2.5 py-2 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
        <div className="flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 truncate">
          <ExternalLink className="w-3 h-3" /> {meta?.title || u.hostname}
        </div>
        {meta?.author && (
          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">{meta.author}</div>
        )}
        {!meta?.title && <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">{url}</div>}
      </a>
    );
  } catch {
    return null;
  }
}

function LinkifyText({ text }: { text: string }) {
  const parts = text.split(URL_REGEX);
  const urls = text.match(URL_REGEX) || [];
  let urlIndex = 0;
  return (
    <>
      {parts.map((part, i) => {
        if (part && part.match(/^https?:\/\/[^\s]+$/)) {
          const url = urls[urlIndex++];
          return (
            <Fragment key={i}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {url}
              </a>
              <LinkPreview url={url} />
            </Fragment>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

function isRichTextHtml(value: string) {
  return /<\/?[a-z][\s\S]*>|&(?:[a-z]+|#\d+|#x[a-f0-9]+);/i.test(value);
}

function sanitizeRichHtml(rawHtml: string) {
  if (typeof document === "undefined") return rawHtml;
  const template = document.createElement("template");
  template.innerHTML = rawHtml;
  const allowedTags = new Set(["A", "B", "BR", "CODE", "DIV", "EM", "I", "LI", "MARK", "OL", "P", "PRE", "S", "SPAN", "STRIKE", "STRONG", "U", "UL"]);
  const elements = Array.from(template.content.querySelectorAll("*"));
  elements.forEach(element => {
    if (!allowedTags.has(element.tagName)) {
      if (["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED"].includes(element.tagName)) {
        element.remove();
      } else {
        element.replaceWith(...Array.from(element.childNodes));
      }
      return;
    }

    const textAlign = (element as HTMLElement).style.textAlign;
    const backgroundColor = (element as HTMLElement).style.backgroundColor;
    const href = element.tagName === "A" ? element.getAttribute("href") : null;
    Array.from(element.attributes).forEach(attribute => element.removeAttribute(attribute.name));
    if (["right", "center", "left"].includes(textAlign)) (element as HTMLElement).style.textAlign = textAlign;
    if (backgroundColor) (element as HTMLElement).style.backgroundColor = backgroundColor;
    if (element.tagName === "A" && href && /^(https?:|mailto:)/i.test(href)) {
      element.setAttribute("href", href);
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noopener noreferrer");
    }
  });
  return template.innerHTML;
}

function richTextToPlainText(value: string) {
  if (!value) return "";
  if (typeof document === "undefined") return value.replace(/<[^>]+>/g, " ");
  const container = document.createElement("div");
  container.innerHTML = sanitizeRichHtml(value);
  return container.innerText || container.textContent || "";
}

function hasRichTextContent(value: string) {
  return richTextToPlainText(value).replace(/\u200B/g, "").trim().length > 0;
}

function richTextValueToHtml(value: string) {
  if (!value) return "";
  if (isRichTextHtml(value)) return sanitizeRichHtml(value);
  return escHtml(value)
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\+\+([^+\n]+)\+\+/g, "<u>$1</u>")
    .replace(/~~([^~\n]+)~~/g, "<s>$1</s>")
    .replace(/==([^=\n]+)==/g, "<mark>$1</mark>")
    .replace(/`([^`\n]+)`/g, "<code>$1</code>")
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

function getContentEditableCursorOffset(editor: HTMLDivElement) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return richTextToPlainText(editor.innerHTML).length;
  const range = selection.getRangeAt(0);
  if (!editor.contains(range.endContainer)) return richTextToPlainText(editor.innerHTML).length;
  const cursorRange = range.cloneRange();
  cursorRange.selectNodeContents(editor);
  cursorRange.setEnd(range.endContainer, range.endOffset);
  return cursorRange.toString().length;
}

function RichTextEditor({
  value,
  onChange,
  onSelectionChange,
  onBlur,
  onKeyDown,
  editorRef,
  placeholder,
  className,
  wrapperClassName,
  placeholderClassName,
  id,
}: {
  value: string;
  onChange: (html: string, plainText: string, cursorOffset: number) => void;
  onSelectionChange: (editor: HTMLDivElement) => void;
  onBlur: (nextFocus: EventTarget | null) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  editorRef: { current: HTMLDivElement | null };
  placeholder: string;
  className?: string;
  wrapperClassName?: string;
  placeholderClassName?: string;
  id?: string;
}) {
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const nextHtml = richTextValueToHtml(value);
    if ((!value || document.activeElement !== editor) && editor.innerHTML !== nextHtml) {
      editor.innerHTML = nextHtml;
    }
  }, [editorRef, value]);

  const updateValue = (editor: HTMLDivElement) => {
    const html = sanitizeRichHtml(editor.innerHTML);
    const plainText = richTextToPlainText(html);
    onChange(html, plainText, getContentEditableCursorOffset(editor));
  };

  return (
    <div className={cn("relative", wrapperClassName)}>
      <div
        ref={editorRef}
        id={id}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder}
        onInput={event => updateValue(event.currentTarget)}
        onMouseUp={event => onSelectionChange(event.currentTarget)}
        onKeyUp={event => onSelectionChange(event.currentTarget)}
        onBlur={event => onBlur(event.relatedTarget)}
        onKeyDown={onKeyDown}
        onPaste={event => {
          event.preventDefault();
          document.execCommand("insertText", false, event.clipboardData.getData("text/plain"));
        }}
        className={cn("task-rich-text", className)}
      />
      {!hasRichTextContent(value) && (
        <span className={cn("pointer-events-none absolute inset-x-0 top-0 px-3 py-2 text-sm text-neutral-400 dark:text-[#8696a0]", placeholderClassName)}>
          {placeholder}
        </span>
      )}
    </div>
  );
}

function FormattedText({ text }: { text: string }) {
  if (isRichTextHtml(text)) {
    return <div className="rich-text-content task-rich-text" dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(text) }} />;
  }
  const tokens = text.split(/(\[[^\]\n]+\]\(https?:\/\/[^\s)\n]+\)|\[right\][\s\S]*?\[\/right\]|\[center\][\s\S]*?\[\/center\]|\[left\][\s\S]*?\[\/left\]|\*\*[^*\n]+\*\*|\+\+[^+\n]+\+\+|~~[^~\n]+~~|==[^=\n]+==|`[^`\n]+`|\*[^*\n]+\*)/g);
  return (
    <>
      {tokens.map((token, index) => {
        const linkedText = token.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
        if (linkedText) {
          return <a key={index} href={linkedText[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">{linkedText[1]}</a>;
        }
        const alignedText = token.match(/^\[(right|center|left)\]([\s\S]*)\[\/\1\]$/);
        if (alignedText) {
          const alignment = alignedText[1] === "center" ? "text-center" : alignedText[1] === "left" ? "text-left" : "text-right";
          return <span key={index} className={cn("block", alignment)}><LinkifyText text={alignedText[2]} /></span>;
        }
        if (token.startsWith("**") && token.endsWith("**")) {
          return <strong key={index} className="font-bold"><LinkifyText text={token.slice(2, -2)} /></strong>;
        }
        if (token.startsWith("++") && token.endsWith("++")) {
          return <span key={index} className="underline decoration-1 underline-offset-2"><LinkifyText text={token.slice(2, -2)} /></span>;
        }
        if (token.startsWith("*") && token.endsWith("*")) {
          return <em key={index}><LinkifyText text={token.slice(1, -1)} /></em>;
        }
        if (token.startsWith("~~") && token.endsWith("~~")) {
          return <s key={index}><LinkifyText text={token.slice(2, -2)} /></s>;
        }
        if (token.startsWith("==") && token.endsWith("==")) {
          return <mark key={index} className="rounded bg-amber-200/80 px-0.5 text-inherit dark:bg-amber-400/25"><LinkifyText text={token.slice(2, -2)} /></mark>;
        }
        if (token.startsWith("`") && token.endsWith("`")) {
          return <code key={index} dir="ltr" className="mx-0.5 rounded bg-black/5 px-1 py-0.5 font-mono text-[0.9em] dark:bg-white/10">{token.slice(1, -1)}</code>;
        }
        return <LinkifyText key={index} text={token} />;
      })}
    </>
  );
}

function FloatingTextFormatter({
  visible,
  onFormat,
  className,
}: {
  visible: boolean;
  onFormat: (format: InlineTextFormat) => void;
  className?: string;
}) {
  const [openMenu, setOpenMenu] = useState<"list" | "text" | "align" | "more" | null>(null);
  useEffect(() => {
    if (!visible) setOpenMenu(null);
  }, [visible]);
  const runFormat = (format: InlineTextFormat) => {
    onFormat(format);
    setOpenMenu(null);
  };
  const iconButtonClass = "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#53575b] hover:bg-neutral-100 hover:text-neutral-900 dark:text-[#c7cbd0] dark:hover:bg-white/10 dark:hover:text-white transition-colors";
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 5, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.97 }}
          transition={{ duration: 0.14 }}
          role="toolbar"
          aria-label="تنسيق النص المحدد"
          data-text-format-toolbar="true"
          dir="ltr"
          className={cn(
            "absolute z-[70] flex h-10 max-w-[calc(100vw-32px)] items-center gap-0.5 overflow-visible rounded-lg border border-[#e1e4e7] bg-white px-1 shadow-[0_3px_12px_rgba(15,23,42,0.16)] dark:border-neutral-600 dark:bg-[#233138]",
            "max-sm:fixed max-sm:left-2 max-sm:right-2 max-sm:top-2 max-sm:max-w-none max-sm:overflow-x-auto max-sm:overflow-y-hidden scrollbar-hide",
            className
          )}
        >
          <div className="relative flex shrink-0 items-center">
            <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => setOpenMenu(menu => menu === "list" ? null : "list")} className={cn(iconButtonClass, "w-9 gap-0")} aria-label="القوائم" title="القوائم">
              <List className="h-4 w-4" /><ChevronDown className="h-3 w-3" />
            </button>
            {openMenu === "list" && (
              <div className="absolute left-0 top-full mt-1 w-36 rounded-lg border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-600 dark:bg-[#233138]">
                <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => runFormat("bullet")} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-neutral-100 dark:hover:bg-white/10"><List className="h-4 w-4" />قائمة نقطية</button>
                <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => runFormat("checklist")} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-neutral-100 dark:hover:bg-white/10"><ListChecks className="h-4 w-4" />قائمة تحقق</button>
              </div>
            )}
          </div>

          <div className="relative shrink-0">
            <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => setOpenMenu(menu => menu === "text" ? null : "text")} className="flex h-8 items-center gap-1 rounded-md px-2 text-sm text-[#53575b] hover:bg-neutral-100 dark:text-[#c7cbd0] dark:hover:bg-white/10" aria-label="نمط النص">
              <span>Text</span><ChevronDown className="h-3 w-3" />
            </button>
            {openMenu === "text" && (
              <div className="absolute left-0 top-full mt-1 w-32 rounded-lg border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-600 dark:bg-[#233138]">
                <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => runFormat("bold")} className="w-full rounded-md px-2 py-1.5 text-left text-sm font-bold hover:bg-neutral-100 dark:hover:bg-white/10">Bold text</button>
                <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => runFormat("italic")} className="w-full rounded-md px-2 py-1.5 text-left text-sm italic hover:bg-neutral-100 dark:hover:bg-white/10">Italic text</button>
              </div>
            )}
          </div>

          <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => runFormat("highlight")} className={iconButtonClass} aria-label="تمييز النص" title="تمييز النص"><span className="flex h-6 w-6 items-center justify-center rounded-md border border-neutral-300 text-base font-medium dark:border-neutral-500">A</span></button>
          <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => runFormat("bold")} className={iconButtonClass} aria-label="عريض" title="عريض"><Bold className="h-[18px] w-[18px]" /></button>
          <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => runFormat("italic")} className={iconButtonClass} aria-label="مائل" title="مائل"><Italic className="h-[18px] w-[18px]" /></button>
          <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => runFormat("underline")} className={iconButtonClass} aria-label="تحته خط" title="تحته خط"><Underline className="h-[18px] w-[18px]" /></button>
          <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => runFormat("strikethrough")} className={iconButtonClass} aria-label="يتوسطه خط" title="يتوسطه خط"><Strikethrough className="h-[18px] w-[18px]" /></button>
          <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => runFormat("code")} className={iconButtonClass} aria-label="نص برمجي" title="نص برمجي"><Code2 className="h-[18px] w-[18px]" /></button>

          <div className="relative flex shrink-0 items-center">
            <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => setOpenMenu(menu => menu === "align" ? null : "align")} className={cn(iconButtonClass, "w-9 gap-0")} aria-label="محاذاة النص" title="محاذاة النص">
              <AlignRight className="h-4 w-4" /><ChevronDown className="h-3 w-3" />
            </button>
            {openMenu === "align" && (
              <div className="absolute left-0 top-full mt-1 flex rounded-lg border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-600 dark:bg-[#233138]">
                <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => runFormat("align-left")} className={iconButtonClass} aria-label="محاذاة لليسار"><AlignLeft className="h-4 w-4" /></button>
                <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => runFormat("align-center")} className={iconButtonClass} aria-label="توسيط"><AlignCenter className="h-4 w-4" /></button>
                <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => runFormat("align-right")} className={iconButtonClass} aria-label="محاذاة لليمين"><AlignRight className="h-4 w-4" /></button>
              </div>
            )}
          </div>

          <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => runFormat("link")} className={iconButtonClass} aria-label="إضافة رابط" title="إضافة رابط"><Link2 className="h-[18px] w-[18px]" /></button>
          <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => runFormat("checklist")} className={cn(iconButtonClass, "text-blue-600 dark:text-blue-400")} aria-label="قائمة تحقق" title="قائمة تحقق"><ListChecks className="h-[18px] w-[18px]" /></button>

          <div className="relative shrink-0">
            <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => setOpenMenu(menu => menu === "more" ? null : "more")} className={iconButtonClass} aria-label="المزيد" title="المزيد"><MoreHorizontal className="h-[18px] w-[18px]" /></button>
            {openMenu === "more" && (
              <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-600 dark:bg-[#233138]">
                <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => runFormat("highlight")} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-neutral-100 dark:hover:bg-white/10"><Highlighter className="h-4 w-4" />تمييز النص</button>
                <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => runFormat("strikethrough")} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-neutral-100 dark:hover:bg-white/10"><Strikethrough className="h-4 w-4" />يتوسطه خط</button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PdfThumbnail({ url, name }: { url?: string; name?: string }) {
  if (!url) {
    return (
      <div className="h-28 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/10 flex flex-col items-center justify-center gap-1">
        <span className="text-[10px] font-bold text-red-600 dark:text-red-400">PDF</span>
      </div>
    );
  }
  return (
    <div className="relative h-28 bg-white overflow-hidden">
      <iframe
        src={url}
        title={name || "PDF"}
        className="absolute inset-0 w-full h-full border-0"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
}

function VideoRecorderOverlay({ onRecorded, onClose }: {
  onRecorded: (att: { id: string; name: string; size: string; type: string; url: string }) => void;
  onClose: () => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const onCloseRef = useRef(onClose);
  const onRecordedRef = useRef(onRecorded);
  onCloseRef.current = onClose;
  onRecordedRef.current = onRecorded;

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        alert('لا يمكن الوصول إلى الكاميرا. تأكد من منح الإذن.');
        onCloseRef.current();
      }
    }
    init();
    return () => {
      cancelled = true;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Auto-stop at 59 seconds
  useEffect(() => {
    if (isRecording && recordTime >= 59) {
      handleStop();
    }
  }, [recordTime, isRecording]);

  const handleStart = () => {
    if (!streamRef.current) return;
    const mr = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mr;
    chunksRef.current = [];
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        onRecordedRef.current({
          id: String(Date.now()) + Math.random().toString(36).slice(2, 8),
          name: 'تسجيل فيديو.webm',
          size: `${(blob.size / 1024 / 1024).toFixed(1)} MB`,
          type: 'video/webm',
          url,
        });
      };
      reader.readAsDataURL(blob);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
    mr.start();
    setIsRecording(true);
    setRecordTime(0);
    timerRef.current = setInterval(() => {
      setRecordTime(t => t + 1);
    }, 1000);
  };

  const handleStop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <div className="relative rounded-xl overflow-hidden bg-black aspect-[3/4]">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          {isRecording && (
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {Math.floor(recordTime / 60)}:{String(recordTime % 60).padStart(2, '0')}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-3 mt-4">
          {!isRecording ? (
            <button onClick={handleStart} className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors">
              <div className="w-5 h-5 rounded-full bg-white" />
            </button>
          ) : (
            <button onClick={handleStop} className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition-colors">
              <div className="w-5 h-5 rounded-sm bg-red-500" />
            </button>
          )}
          <button onClick={onClose} className="text-sm text-neutral-500 hover:text-neutral-700 px-3 py-2">إلغاء</button>
        </div>
      </div>
    </div>
  );
}

function VideoThumbnail({ url, name }: { url?: string; name?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div className="w-[140px] rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-black relative group">
      <video
        ref={videoRef}
        src={url}
        className="w-full h-28 object-cover"
        preload="metadata"
        onEnded={() => setPlaying(false)}
        onClick={toggle}
      />
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors cursor-pointer" onClick={toggle}>
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-neutral-800 ml-0.5" />
          </div>
        </div>
      )}
      <div className="px-2 py-1 bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-100 dark:border-neutral-700">
        <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate block text-center">{name}</span>
      </div>
    </div>
  );
}

export default function TasksPage({ onBack: _onBack, onNewCampaign }: TasksPageProps) {
  const [tasks, setTasks] = useFirestoreCollection<Task>("tasks", getInitialTasks, STORAGE_KEY);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [groupByStatus, setGroupByStatus] = useState(false);
  const [expanded, setExpanded] = useState<Record<TaskStatus, boolean>>({
    todo: true, "in-progress": true, "in-review": true, completed: false, overdue: true,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState<Partial<Task>>({ status: "todo", progress: 0 });
  const [activeTab, setActiveTab] = useState<"tasks" | "campaigns" | "teams">("tasks");
  const [detailMobileTab, setDetailMobileTab] = useState<"details" | "activity">("details");
  const [detailDropdown, setDetailDropdown] = useState<"status" | "assignee" | "priority" | "dueDate" | "source" | "project" | "tags" | null>(null);
  const [formDropdown, setFormDropdown] = useState<"status" | "assignee" | "supervisor" | "dueDate" | "priority" | "tags" | "source" | "project" | "recurrence" | null>(null);
  const formDropdownRefs = useRef<HTMLDivElement[]>([]);
  const setFormDropdownRef = (el: HTMLDivElement | null) => {
    if (el && !formDropdownRefs.current.includes(el)) formDropdownRefs.current.push(el);
    if (!el) formDropdownRefs.current = formDropdownRefs.current.filter(e => e.isConnected);
  };
  const [assignStep, setAssignStep] = useState<"mode" | "list" | "members">("mode");
  const assignDropdownRef = useRef<HTMLDivElement>(null);
  const [supervisorSearch, setSupervisorSearch] = useState("");
  const supervisorDropdownRef = useRef<HTMLDivElement>(null);
  const [assignSearch, setAssignSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [projectsList, setProjectsList] = useState<string[]>(PROJECTS);
  const [tagSearch, setTagSearch] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLOR_PRESETS[0].name);
  const [showAddTag, setShowAddTag] = useState(false);
  const [allTagsList, setAllTagsList] = useState<string[]>(DEFAULT_TAGS);
  const [assigneesList, setAssigneesList] = useState<string[]>(ASSIGNEES);
  const [tableDropdown, setTableDropdown] = useState<{
    id: string;
    field: "assignee" | "project" | "source" | "progress" | "dueDate" | "priority" | "status" | "action";
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
  const filterDrawerRef = useRef<HTMLDivElement>(null);
  const [sortField, setSortField] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">("all");
  const [filterAssignee, setFilterAssignee] = useState<string | "all">("all");
  const [filterProject, setFilterProject] = useState<string | "all">("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailPanelCollapsed, setDetailPanelCollapsed] = useState(false);
  const [detailComment, setDetailComment] = useState("");
  const [detailEditingComment, setDetailEditingComment] = useState<{ id: string; text: string } | null>(null);
  const [detailCommentAttachments, setDetailCommentAttachments] = useState<{ id: string; name: string; size: string; type: string; url: string }[]>([]);
  const [detailMention, setDetailMention] = useState<{ query: string; startIndex: number } | null>(null);
  const [detailChatSearchOpen, setDetailChatSearchOpen] = useState(false);
  const [detailChatSearch, setDetailChatSearch] = useState("");
  const [detailAttachmentMenuOpen, setDetailAttachmentMenuOpen] = useState(false);
  const [detailEmojiOpen, setDetailEmojiOpen] = useState(false);
  const [detailVoiceRecording, setDetailVoiceRecording] = useState(false);
  const [detailVoiceSeconds, setDetailVoiceSeconds] = useState(0);
  const [detailVoiceError, setDetailVoiceError] = useState("");
  const [detailShowSubtaskForm, setDetailShowSubtaskForm] = useState(false);
  const [detailSubtaskForm, setDetailSubtaskForm] = useState<Partial<Task>>({});
  const [detailSubtaskDropdown, setDetailSubtaskDropdown] = useState<"status" | "priority" | "assignee" | "dueDate" | null>(null);
  const [detailEditingSubtaskId, setDetailEditingSubtaskId] = useState<string | null>(null);
  const [detailEditingSubtaskForm, setDetailEditingSubtaskForm] = useState<Partial<Task>>({});
  const [detailEditingSubtaskDropdown, setDetailEditingSubtaskDropdown] = useState<"status" | "priority" | "assignee" | "dueDate" | null>(null);
  const [formShowSubtaskForm, setFormShowSubtaskForm] = useState(false);
  const [formSubtaskForm, setFormSubtaskForm] = useState<Partial<Task>>({});
  const [formSubtaskDropdown, setFormSubtaskDropdown] = useState<"status" | "priority" | "assignee" | "dueDate" | null>(null);
  const [formEditingSubtaskId, setFormEditingSubtaskId] = useState<string | null>(null);
  const [formEditingSubtaskForm, setFormEditingSubtaskForm] = useState<Partial<Task>>({});
  const [formEditingSubtaskDropdown, setFormEditingSubtaskDropdown] = useState<"status" | "priority" | "assignee" | "dueDate" | null>(null);
  const [formPanelCollapsed, setFormPanelCollapsed] = useState(false);
  const [formAttachmentsCollapsed, setFormAttachmentsCollapsed] = useState(true);
  const [formSubtasksCollapsed, setFormSubtasksCollapsed] = useState(true);
  const [formExtraDetailsCollapsed, setFormExtraDetailsCollapsed] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [tableDensity, setTableDensity] = useState<"simple" | "full">("full");
  const isColVisible = (key: string) => !hiddenCols.has(key) && (tableDensity === "full" || !SIMPLE_HIDDEN_COLS.has(key));
  const visibleCols = COLS.filter(col => isColVisible(col.key));
  const [formMobileTab, setFormMobileTab] = useState<"details" | "activity">("details");
  const [formComment, setFormComment] = useState("");
  const [formEditingComment, setFormEditingComment] = useState<{ id: string; text: string } | null>(null);
  const [formTouched, setFormTouched] = useState<Set<string>>(new Set());
  const [formCommentAttachments, setFormCommentAttachments] = useState<{ id: string; name: string; size: string; type: string; url: string }[]>([]);
  const [formMention, setFormMention] = useState<{ query: string; startIndex: number } | null>(null);
  const [formAttachmentMenuOpen, setFormAttachmentMenuOpen] = useState(false);
  const [formAttachmentDragging, setFormAttachmentDragging] = useState(false);
  const [textFormatSelection, setTextFormatSelection] = useState<TextFormatTarget | null>(null);
  const [formErrors, setFormErrors] = useState<{ title?: string }>({});
  const [saveNotice, setSaveNotice] = useState<{ message: string; taskId: string } | null>(null);
  const [detailSavePhase, setDetailSavePhase] = useState<SavePhase>("idle");
  const [videoRecorderTarget, setVideoRecorderTarget] = useState<'detail' | 'form' | null>(null);

  const detailFileInputRef = useRef<HTMLInputElement>(null);
  const detailMediaInputRef = useRef<HTMLInputElement>(null);
  const detailCameraInputRef = useRef<HTMLInputElement>(null);
  const detailVoiceRecorderRef = useRef<MediaRecorder | null>(null);
  const detailVoiceStreamRef = useRef<MediaStream | null>(null);
  const detailVoiceChunksRef = useRef<Blob[]>([]);
  const formFileInputRef = useRef<HTMLInputElement>(null);
  const formMediaInputRef = useRef<HTMLInputElement>(null);
  const formCameraInputRef = useRef<HTMLInputElement>(null);
  const taskDescriptionRef = useRef<HTMLDivElement>(null);
  const detailDescriptionRef = useRef<HTMLDivElement>(null);
  const formCommentTextareaRef = useRef<HTMLDivElement>(null);
  const detailCommentTextareaRef = useRef<HTMLDivElement>(null);
  const richTextSelectionRef = useRef<Range | null>(null);
  const formInitialSnapshotRef = useRef("");
  const editingOriginalRef = useRef<Task | null>(null);
  const detailUndoRef = useRef<Task | null>(null);
  const detailSaveTimerRef = useRef<number | null>(null);
  const detailUndoTimerRef = useRef<number | null>(null);

  const { setPageContext } = useAI();

  useEffect(() => {
    if (!detailVoiceRecording) return;
    const timer = window.setInterval(() => setDetailVoiceSeconds(seconds => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [detailVoiceRecording]);
  // Push tasks data to AI assistant
  useEffect(() => {
    const byStatus: Record<string, number> = {};
    const byAssignee: Record<string, number> = {};
    tasks.forEach((t) => {
      const st = STATUS_CONFIG[t.status]?.label || t.status;
      byStatus[st] = (byStatus[st] || 0) + 1;
      byAssignee[t.assignee] = (byAssignee[t.assignee] || 0) + 1;
    });

    const statusLines = Object.entries(byStatus).map(([s, c]) => `- ${s}: ${c}`);
    const assigneeLines = Object.entries(byAssignee).map(([a, c]) => `- ${a}: ${c} مهمة`);

    setPageContext({
      route: "tasks",
      title: "المهام والمشاريع",
      dataSummary: `إجمالي المهام: ${tasks.length}\nالحالات:\n${statusLines.join("\n")}\nالمسؤولون:\n${assigneeLines.join("\n")}`,
    });
  }, [tasks]);
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
      if (filterRef.current && !filterRef.current.contains(e.target as Node) && !filterDrawerRef.current?.contains(e.target as Node)) setFilterOpen(false);
      if (tableDropdownRef.current && !tableDropdownRef.current.contains(e.target as Node)) setTableDropdown(null);
      if (assignDropdownRef.current && assignDropdownRef.current.contains(e.target as Node)) {
        // keep assign dropdown open
      } else if (supervisorDropdownRef.current && supervisorDropdownRef.current.contains(e.target as Node)) {
        // keep supervisor dropdown open
      } else {
        if (formDropdownRefs.current.length > 0 && !formDropdownRefs.current.some(ref => ref.contains(e.target as Node))) setFormDropdown(null);
        setAssignStep("mode");
      }
    };
    const onScroll = () => setTableDropdown(null);
    document.addEventListener("mousedown", handler);
    window.addEventListener("scroll", onScroll, true);
    return () => { document.removeEventListener("mousedown", handler); window.removeEventListener("scroll", onScroll, true); };
  }, []);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const formIsDirty = modalOpen && (
    taskDraftSnapshot(form, !editing) !== formInitialSnapshotRef.current ||
    hasRichTextContent(formComment) ||
    formCommentAttachments.length > 0
  );
  const editingLiveTask = editing ? tasks.find(task => task.id === editing.id) : null;
  const formActivityComments = editing ? (editingLiveTask?.comments || []) : (form.comments || []);
  useEffect(() => { setDetailSubtaskForm({ status: "todo", priority: "medium", dueDate: today, assignee: ASSIGNEES[0], progress: 0, projectName: PROJECTS[0] }); }, [today]);
  useEffect(() => {
    if (!saveNotice) return;
    const timer = window.setTimeout(() => setSaveNotice(null), 4500);
    return () => window.clearTimeout(timer);
  }, [saveNotice]);
  useEffect(() => () => {
    if (detailSaveTimerRef.current) window.clearTimeout(detailSaveTimerRef.current);
    if (detailUndoTimerRef.current) window.clearTimeout(detailUndoTimerRef.current);
  }, []);

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
      const priorityOrder: Record<TaskPriority, number> = { emergency: 5, urgent: 4, high: 3, medium: 2, low: 1 };
      res = [...res].sort((a, b) => {
        let cmp = 0;
        if (sortField === "priority") cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
        else if (sortField === "progress") cmp = a.progress - b.progress;
        else if (sortField === "dueDate") cmp = (a.dueDate || "").localeCompare(b.dueDate || "");
        else if (sortField === "createdAt") cmp = (a.createdAt || "").localeCompare(b.createdAt || "");
        else if (sortField === "title") cmp = a.title.localeCompare(b.title, "ar");
        else if (sortField === "assignee") cmp = a.assignee.localeCompare(b.assignee, "ar");
        else if (sortField === "assignedBy") cmp = (a.assignedBy || "").localeCompare(b.assignedBy || "", "ar");
        else if (sortField === "projectName") cmp = a.projectName.localeCompare(b.projectName, "ar");
        else if (sortField === "source") cmp = (a.taskSource || "").localeCompare(b.taskSource || "", "ar");
        else if (sortField === "status") cmp = STATUS_RANK[a.status] - STATUS_RANK[b.status];
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return res;
  }, [tasks, search, filterStatus, filterPriority, filterAssignee, filterProject, sortField, sortDir]);

  const grouped = useMemo(() => {
    const g: Record<TaskStatus, Task[]> = { todo: [], "in-progress": [], "in-review": [], completed: [], overdue: [] };
    filtered.forEach(t => g[t.status].push(t));
    return g;
  }, [filtered]);

  const toggle = (s: TaskStatus) => setExpanded(p => ({ ...p, [s]: !p[s] }));
  const prepareFormExperience = () => {
    setAssignStep("mode");
    setFormMobileTab("details");
    setFormComment("");
    setFormErrors({});
    setFormCommentAttachments([]);
    setFormEditingComment(null);
    setFormMention(null);
    setFormAttachmentMenuOpen(false);
    setFormAttachmentDragging(false);
    setFormPanelCollapsed(false);
    setTextFormatSelection(null);
    setFormShowSubtaskForm(false);
    setFormSubtaskForm({});
    setFormSubtaskDropdown(null);
    setFormEditingSubtaskId(null);
    setFormEditingSubtaskForm({});
    setFormEditingSubtaskDropdown(null);
  };
  const openCreate = () => {
    const initialForm: Partial<Task> = {
      status: "todo",
      progress: 0,
      createdAt: today,
    };
    setEditing(null);
    editingOriginalRef.current = null;
    setForm(initialForm);
    formInitialSnapshotRef.current = taskDraftSnapshot(initialForm, true);
    setFormTouched(new Set());
    prepareFormExperience();
    setModalOpen(true);
  };
  const openEdit = (task: Task) => {
    const initialForm = { ...task };
    setEditing(task);
    editingOriginalRef.current = { ...task };
    setForm(initialForm);
    formInitialSnapshotRef.current = taskDraftSnapshot(initialForm);
    setFormTouched(new Set(["status", "assignee", "dueDate", "priority", "tags", "source", "project"]));
    prepareFormExperience();
    setModalOpen(true);
  };
  const openEditSubtask = (parentTask: Task, subtask: Task) => {
    openEdit(parentTask);
    setFormEditingSubtaskId(subtask.id);
    setFormEditingSubtaskForm({ ...subtask });
    setFormEditingSubtaskDropdown(null);
  };
  const closeForm = (force = false) => {
    if (!force && formIsDirty && !window.confirm("لديك تغييرات غير محفوظة. هل تريد إغلاق المسودة دون حفظ؟")) return;
    if (!force && editing && editingOriginalRef.current) {
      const original = editingOriginalRef.current;
      setTasks(allTasks => allTasks.map(task => task.id === editing.id ? { ...original, comments: task.comments || [] } : task));
    }
    setModalOpen(false);
    setFormMobileTab("details");
    setFormComment("");
    setFormErrors({});
    setFormCommentAttachments([]);
    setFormEditingComment(null);
    setFormMention(null);
    setFormAttachmentMenuOpen(false);
    setFormAttachmentDragging(false);
    setFormPanelCollapsed(false);
    setTextFormatSelection(null);
    setFormDropdown(null);
    editingOriginalRef.current = null;
  };
  const openDetail = (t: Task) => {
    setDetailTask(t);
    setDetailOpen(true);
    setDetailPanelCollapsed(false);
    setTableDropdown(null);
    setDetailCommentAttachments([]);
    setDetailMention(null);
    setDetailChatSearchOpen(false);
    setDetailChatSearch("");
    setDetailAttachmentMenuOpen(false);
    setDetailEmojiOpen(false);
    setDetailVoiceError("");
    setDetailSavePhase("idle");
    detailUndoRef.current = null;
  };
  const closeDetail = () => {
    if (detailVoiceRecorderRef.current?.state === "recording") detailVoiceRecorderRef.current.stop();
    detailVoiceStreamRef.current?.getTracks().forEach(track => track.stop());
    setDetailOpen(false);
    setTextFormatSelection(null);
    setDetailTask(null);
    setDetailPanelCollapsed(false);
    setDetailComment("");
    setDetailCommentAttachments([]);
    setDetailEditingComment(null);
    setDetailMention(null);
    setDetailChatSearchOpen(false);
    setDetailChatSearch("");
    setDetailAttachmentMenuOpen(false);
    setDetailEmojiOpen(false);
    setDetailVoiceRecording(false);
    setDetailVoiceSeconds(0);
    setDetailVoiceError("");
    setDetailSavePhase("idle");
    detailUndoRef.current = null;
    if (detailSaveTimerRef.current) window.clearTimeout(detailSaveTimerRef.current);
    if (detailUndoTimerRef.current) window.clearTimeout(detailUndoTimerRef.current);
    setDetailShowSubtaskForm(false);
    setDetailSubtaskForm({ status: "todo", priority: "medium", dueDate: today, assignee: ASSIGNEES[0], progress: 0, projectName: PROJECTS[0] });
    setDetailSubtaskDropdown(null);
    setDetailEditingSubtaskId(null);
    setDetailEditingSubtaskForm({});
    setDetailEditingSubtaskDropdown(null);
  };
  const updateDetailFields = (changes: Partial<Task> | ((task: Task) => Partial<Task>)) => {
    setDetailTask(current => {
      if (!current) return current;
      if (!detailUndoRef.current) detailUndoRef.current = { ...current };
      const patch = typeof changes === "function" ? changes(current) : changes;
      const next = { ...current, ...patch };
      setTasks(allTasks => allTasks.map(task => task.id === current.id ? next : task));
      return next;
    });
    setDetailSavePhase("saving");
    if (detailSaveTimerRef.current) window.clearTimeout(detailSaveTimerRef.current);
    if (detailUndoTimerRef.current) window.clearTimeout(detailUndoTimerRef.current);
    detailSaveTimerRef.current = window.setTimeout(() => setDetailSavePhase("saved"), 450);
    detailUndoTimerRef.current = window.setTimeout(() => {
      detailUndoRef.current = null;
      setDetailSavePhase("idle");
    }, 8000);
  };
  const getRichTextEditor = (target: TextFormatTarget) => {
    if (target === "task-description") return taskDescriptionRef.current;
    if (target === "detail-description") return detailDescriptionRef.current;
    if (target === "form-comment") return formCommentTextareaRef.current;
    return detailCommentTextareaRef.current;
  };
  const updateRichTextValue = (target: TextFormatTarget, html: string) => {
    if (target === "task-description") setForm(current => ({ ...current, description: html }));
    else if (target === "detail-description") updateDetailFields({ description: html });
    else if (target === "form-comment") setFormComment(html);
    else setDetailComment(html);
  };
  const captureTextSelection = (target: TextFormatTarget, editor: HTMLDivElement) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      richTextSelectionRef.current = null;
      setTextFormatSelection(null);
      return;
    }
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) {
      richTextSelectionRef.current = null;
      setTextFormatSelection(null);
      return;
    }
    richTextSelectionRef.current = range.cloneRange();
    setTextFormatSelection(selection.isCollapsed ? null : target);
  };
  const handleTextFormattingBlur = (target: TextFormatTarget, nextFocus: EventTarget | null) => {
    if (nextFocus instanceof HTMLElement && nextFocus.closest('[data-text-format-toolbar="true"]')) return;
    richTextSelectionRef.current = null;
    setTextFormatSelection(current => current === target ? null : current);
  };
  const applyTextFormat = (format: InlineTextFormat) => {
    const target = textFormatSelection;
    const editor = target ? getRichTextEditor(target) : null;
    const savedRange = richTextSelectionRef.current;
    if (!target || !editor || !savedRange) return;

    editor.focus();
    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    selection.addRange(savedRange);

    if (format === "bold") document.execCommand("bold");
    else if (format === "italic") document.execCommand("italic");
    else if (format === "underline") document.execCommand("underline");
    else if (format === "strikethrough") document.execCommand("strikeThrough");
    else if (format === "highlight") document.execCommand("hiliteColor", false, "#fff1a8");
    else if (format === "bullet") document.execCommand("insertUnorderedList");
    else if (format === "align-right") document.execCommand("justifyRight");
    else if (format === "align-center") document.execCommand("justifyCenter");
    else if (format === "align-left") document.execCommand("justifyLeft");
    else if (format === "code") {
      const code = document.createElement("code");
      try {
        savedRange.surroundContents(code);
        savedRange.selectNodeContents(code);
        selection.removeAllRanges();
        selection.addRange(savedRange);
      } catch {
        document.execCommand("formatBlock", false, "pre");
      }
    } else if (format === "checklist") {
      const selectedText = selection.toString();
      document.execCommand("insertText", false, selectedText.split("\n").map(line => line.startsWith("☐ ") ? line : `☐ ${line}`).join("\n"));
    } else if (format === "link") {
      const enteredUrl = window.prompt("أدخل رابط النص المحدد", "https://");
      if (!enteredUrl || enteredUrl === "https://") return;
      const url = /^https?:\/\//i.test(enteredUrl) ? enteredUrl : `https://${enteredUrl}`;
      selection.removeAllRanges();
      selection.addRange(savedRange);
      document.execCommand("createLink", false, url);
    }

    updateRichTextValue(target, sanitizeRichHtml(editor.innerHTML));
    const nextSelection = window.getSelection();
    if (nextSelection && nextSelection.rangeCount > 0 && !nextSelection.isCollapsed && editor.contains(nextSelection.getRangeAt(0).commonAncestorContainer)) {
      richTextSelectionRef.current = nextSelection.getRangeAt(0).cloneRange();
      setTextFormatSelection(target);
    } else {
      richTextSelectionRef.current = null;
      setTextFormatSelection(null);
    }
  };
  const insertTextAtRichSelection = (target: "form-comment" | "detail-comment", text: string, replaceBefore = 0) => {
    const editor = getRichTextEditor(target);
    const savedRange = richTextSelectionRef.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
    if (selection && savedRange) {
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }
    for (let index = 0; index < replaceBefore; index += 1) document.execCommand("delete");
    document.execCommand("insertText", false, text);
    updateRichTextValue(target, sanitizeRichHtml(editor.innerHTML));
    richTextSelectionRef.current = null;
    setTextFormatSelection(null);
  };
  const undoDetailChanges = () => {
    const previous = detailUndoRef.current;
    if (!previous) return;
    setDetailTask(previous);
    setTasks(allTasks => allTasks.map(task => task.id === previous.id ? previous : task));
    detailUndoRef.current = null;
    setDetailSavePhase("idle");
    if (detailSaveTimerRef.current) window.clearTimeout(detailSaveTimerRef.current);
    if (detailUndoTimerRef.current) window.clearTimeout(detailUndoTimerRef.current);
  };
  const addDetailFiles = async (files: FileList | null) => {
    if (!files) return;
    const newAttachments = await Promise.all(Array.from(files).map(async file => ({
      id: String(Date.now()) + Math.random().toString(36).slice(2, 8),
      ...(await readFile(file)),
    })));
    setDetailCommentAttachments(current => [...current, ...newAttachments]);
  };
  const addFormFiles = async (files: FileList | null) => {
    if (!files) return;
    const newAttachments = await Promise.all(Array.from(files).map(async file => ({
      id: String(Date.now()) + Math.random().toString(36).slice(2, 8),
      ...(await readFile(file)),
    })));
    setFormCommentAttachments(current => [...current, ...newAttachments]);
  };
  const addTaskFiles = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const newAttachments = await Promise.all(Array.from(files).map(async file => ({
      id: String(Date.now()) + Math.random().toString(36).slice(2, 8),
      ...(await readFile(file)),
    })));
    setForm(current => ({ ...current, attachments: [...(current.attachments || []), ...newAttachments] }));
  };
  const sendDetailComment = () => {
    if (!detailTask || (!hasRichTextContent(detailComment) && detailCommentAttachments.length === 0)) return;
    const newComment = {
      id: String(Date.now()),
      author: "أنت",
      text: sanitizeRichHtml(detailComment),
      date: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
      createdAt: Date.now(),
      attachments: detailCommentAttachments,
    };
    const next = [...(detailTask.comments || []), newComment];
    setDetailTask(task => task ? { ...task, comments: next } : task);
    setTasks(current => current.map(task => task.id === detailTask.id ? { ...task, comments: next } : task));
    setDetailComment("");
    setDetailCommentAttachments([]);
    setDetailMention(null);
    setDetailEmojiOpen(false);
  };
  const updateFormComments = (next: NonNullable<Task["comments"]>) => {
    if (editing) {
      setTasks(allTasks => allTasks.map(task => task.id === editing.id ? { ...task, comments: next } : task));
    } else {
      setForm(current => ({ ...current, comments: next }));
    }
  };
  const sendFormComment = () => {
    if (!hasRichTextContent(formComment) && formCommentAttachments.length === 0) return;
    const newComment = {
      id: String(Date.now()),
      author: "أنت",
      text: sanitizeRichHtml(formComment),
      date: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
      createdAt: Date.now(),
      attachments: formCommentAttachments,
    };
    updateFormComments([...formActivityComments, newComment]);
    setFormComment("");
    setFormCommentAttachments([]);
    setFormMention(null);
    setFormAttachmentMenuOpen(false);
  };
  const toggleDetailVoiceRecording = async () => {
    setDetailVoiceError("");
    if (detailVoiceRecording) {
      if (detailVoiceRecorderRef.current?.state === "recording") detailVoiceRecorderRef.current.stop();
      setDetailVoiceRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      detailVoiceStreamRef.current = stream;
      detailVoiceRecorderRef.current = recorder;
      detailVoiceChunksRef.current = [];
      recorder.ondataavailable = event => {
        if (event.data.size > 0) detailVoiceChunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(detailVoiceChunksRef.current, { type: mimeType });
        if (blob.size > 0) {
          const file = new File([blob], `رسالة-صوتية-${Date.now()}.webm`, { type: mimeType });
          const data = await readFile(file);
          setDetailCommentAttachments(current => [
            ...current,
            { id: String(Date.now()), ...data },
          ]);
        }
        stream.getTracks().forEach(track => track.stop());
        detailVoiceStreamRef.current = null;
        detailVoiceRecorderRef.current = null;
        detailVoiceChunksRef.current = [];
        setDetailVoiceSeconds(0);
      };
      recorder.start();
      setDetailVoiceSeconds(0);
      setDetailVoiceRecording(true);
    } catch {
      setDetailVoiceError("تعذر الوصول إلى الميكروفون. تحقق من صلاحية التسجيل.");
    }
  };
  const save = () => {
    const title = form.title?.trim();
    if (!title) {
      setFormErrors({ title: "أدخل عنوان المهمة قبل المتابعة" });
      setFormMobileTab("details");
      return;
    }
    const assignedMembers = (form.assignMembers || []).filter(Boolean);
    const normalizedForm: Partial<Task> = {
      ...form,
      status: form.status || "todo",
      priority: form.priority || "medium",
      assignee: form.assignee || "",
      assignedBy: form.assignedBy || "أنت",
      supervisor: form.supervisor || "",
      progressMode: assignedMembers.length > 1 ? (form.progressMode || "individual") : form.progressMode,
      dueDate: form.dueDate || "",
      projectName: form.projectName || "",
      progress: form.progress ?? 0,
    };
    if (editing) {
      setTasks(allTasks => allTasks.map(task => {
        if (task.id !== editing.id) return task;
        return { ...task, ...normalizedForm, title, comments: task.comments || [] } as Task;
      }));
      setSaveNotice({ message: "تم حفظ تعديلات المهمة", taskId: editing.id });
    } else {
      const uid = "P" + String(Date.now()).slice(-6) + "-" + (tasks.length + 1);
      setTasks(allTasks => [...allTasks, { id: uid, ...normalizedForm, title } as Task]);
      setSaveNotice({ message: "تم إنشاء المهمة وإضافتها إلى القائمة", taskId: uid });
    }
    closeForm(true);
  };
  useEffect(() => {
    if (!modalOpen) return;
    const handleDraftShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        save();
      }
      if (event.key === "Escape" && !formDropdown) closeForm();
    };
    window.addEventListener("keydown", handleDraftShortcut);
    return () => window.removeEventListener("keydown", handleDraftShortcut);
  }, [modalOpen, form, editing, formDropdown, formIsDirty]);
  const remove = (id: string) => { if (confirm("هل أنت متأكد من حذف هذه المهمة؟")) { setTasks(p => p.filter(t => t.id !== id)); } };
  const updateTask = (id: string, changes: Partial<Task>) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next = { ...t, ...changes };
      return next;
    }));
  };

  const order: TaskStatus[] = ["todo", "in-progress", "in-review", "overdue", "completed"];
  // ترتيب المجموعات في عرض القائمة: قيد العمل أولاً ثم قيد الانتظار
  const listOrder: TaskStatus[] = ["in-progress", "todo", "in-review", "overdue", "completed"];

  // سحب وإفلات بطاقات الكانبان بين الأعمدة لتغيير الحالة
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);
  const handleDropOnColumn = (status: TaskStatus) => {
    if (dragTaskId) updateTask(dragTaskId, { status, ...(status === "completed" ? { progress: 100 } : {}) });
    setDragTaskId(null);
    setDragOverCol(null);
  };

  return (
    <div className="min-h-screen font-sans" dir="rtl" style={{ ["--page-max-w" as string]: "calc(92% + 20px)" }}>
      {/* Top bar: Tabs + Toolbar */}
      <PageHeader
        tabs={[
          ["tasks", "المهام", CheckSquare],
          ["campaigns", "الحملات", Megaphone],
          ["teams", "الفرق", Users],
        ]}
        active={activeTab}
        onChange={(key) => setActiveTab(key as typeof activeTab)}
      >
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
            className="overflow-visible"
          >
          {/* Toolbar row + Add button */}
          <div className="px-2 sm:px-6 py-2 sm:py-[14px] flex items-center gap-2 overflow-x-auto scrollbar-hide sm:overflow-visible sm:flex-nowrap">
            <div className="flex-1 min-w-0">
              <div>
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide sm:overflow-visible sm:flex-nowrap">
          {activeTab === "tasks" && (
            <>
              <div className="relative flex-1 min-w-0 sm:max-w-xs">
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
                      {SORT_LABELS[sortField]}
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
                <button onClick={() => setFilterOpen(v => !v)} className={cn("flex items-center gap-1.5 px-2.5 sm:px-5 py-2 text-sm border rounded-xl transition-all duration-200 relative shrink-0", filterOpen || activeFilterCount > 0 ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white shadow-sm" : "text-gray-600 dark:text-gray-300 border-gray-200 dark:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-700")}>
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">تصفية</span>
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full bg-white text-neutral-900 text-[10px] font-bold shadow-sm border border-neutral-200">{activeFilterCount}</span>
                  )}
                </button>
              </div>

              <button
                onClick={() => setGroupByStatus(v => !v)}
                title={groupByStatus ? "إلغاء التجميع" : "تجميع حسب الحالة"}
                aria-pressed={groupByStatus}
                className={cn("group flex items-center gap-1.5 px-2.5 sm:px-6 py-2 text-sm border rounded-xl transition-all duration-200 shrink-0", groupByStatus ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white shadow-sm" : "text-gray-600 dark:text-gray-300 border-gray-200 dark:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-700")}
              >
                <motion.span
                  key={groupByStatus ? "grouped" : "ungrouped"}
                  initial={{ scale: 0.78, rotate: groupByStatus ? -18 : 18, y: 2 }}
                  animate={{ scale: 1, rotate: 0, y: 0 }}
                  whileHover={{ scale: 1.14, rotate: groupByStatus ? -10 : 10, y: -1 }}
                  whileTap={{ scale: 0.82, rotate: groupByStatus ? 14 : -14 }}
                  transition={{ type: "spring", stiffness: 420, damping: 18 }}
                  className="inline-flex"
                >
                  <Layers className="w-4 h-4 transition-colors group-hover:text-teal-500" />
                </motion.span>
                <span className="hidden sm:inline">تجميع</span>
              </button>

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
                      ref={filterDrawerRef}
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
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-500">{filtered.length} نتيجة مطابقة</p>
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
                              { k: "emergency" as const, l: "طارئة", dot: "bg-rose-500" },
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
                            {projectsList.map(p => (
                              <button key={p} onClick={() => setFilterProject(p)}
                                className={cn("w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-all border text-right",
                                  filterProject === p ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm" : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100")}>
                                <FolderOpen className="w-3.5 h-3.5 shrink-0 opacity-50" />{p}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Column visibility & density — only in list view */}
                        {viewMode === "list" && (
                        <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800">
                          <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-2.5 mt-3 flex items-center gap-1.5">
                            <SlidersHorizontal className="w-3 h-3" /> الأعمدة
                          </p>
                          <div className="space-y-1">
                            {COLS.filter(col => col.key !== "title" && col.key !== "action").map(col => (
                              <button key={col.key}
                                onClick={() => setHiddenCols(prev => { const next = new Set(prev); next.has(col.key) ? next.delete(col.key) : next.add(col.key); return next; })}
                                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-all border bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100">
                                <div className={cn("w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                                  isColVisible(col.key) ? "bg-teal-500 border-teal-500" : "border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800")}>
                                  {isColVisible(col.key) && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                </div>
                                <span className="text-xs text-neutral-700 dark:text-neutral-300">{col.label}</span>
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-700 rounded-xl p-1 mt-3">
                            {([["simple","بسيط"],["full","كامل"]] as ["simple" | "full", string][]).map(([v, label]) => (
                              <button key={v} onClick={() => setTableDensity(v)} className={cn("flex-1 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-200", tableDensity === v ? "bg-neutral-900 text-white shadow-sm" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600")}>
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                        )}

                        {/* Export */}
                        <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800">
                          <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-2.5 mt-3 flex items-center gap-1.5">
                            <FileDown className="w-3 h-3" /> تصدير جميع المهام (مجمعة حسب الحالة)
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => exportTasksExcel(tasks)}
                              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-all border bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40">
                              <FileDown className="w-4 h-4" /> ملف Excel
                            </button>
                            <button
                              onClick={() => exportTasksPdf(tasks)}
                              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-all border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40">
                              <Printer className="w-4 h-4" /> ملف PDF
                            </button>
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
              <div className="mr-auto" />
              <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-700 rounded-xl p-1 shrink-0">
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
              <div className="relative flex-1 min-w-0 sm:max-w-xs">
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
            <div className="relative flex-1 min-w-0 sm:max-w-xs">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={campaignsSearch} onChange={e => setCampaignsSearch(e.target.value)} placeholder="بحث في الحملات..."
                className="w-full pr-9 pl-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 text-right" />
            </div>
          )}

          {activeTab !== "tasks" && activeTab !== "teams" && activeTab !== "campaigns" && <div className="flex-1" />}
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
      </PageHeader>

      {/* Content */}
      {activeTab === "tasks" && (
        <div className="max-w-[var(--page-max-w)] mx-auto px-2 sm:px-0 py-4 space-y-4">
          {/* ── LIST VIEW ── */}
          {viewMode === "list" && (
            <>
            {(groupByStatus
              ? listOrder.map(s => ({ gKey: s as string, gStatus: s as TaskStatus | null, items: grouped[s] }))
              : [{ gKey: "all", gStatus: null as TaskStatus | null, items: filtered }]
            ).map(({ gKey, gStatus, items }) => {
              if (!items.length) return null;
              const open = gStatus ? expanded[gStatus] : true;
              const cfg = gStatus ? STATUS_CONFIG[gStatus] : null;
              return (
                <div key={gKey} className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-700">
                  {/* Group Header */}
                  {gStatus && cfg && (
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-neutral-700">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-1 h-5 rounded-full", cfg.accent)} />
                      <span className={cn("text-sm font-semibold px-2.5 py-0.5 rounded-md", cfg.badgeBg, cfg.badgeText)}>{cfg.label}</span>
                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{items.length}</span>
                      <button onClick={() => toggle(gStatus)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                    <button className="flex items-center gap-1 text-xs text-gray-500 dark:text-neutral-400 hover:text-teal-500 transition-colors font-medium">
                      عرض الكل <span className="text-[10px]">↗</span>
                    </button>
                  </div>
                  )}

                <AnimatePresence>
                  {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100 dark:border-neutral-700">
                              {visibleCols.map((col, idx) => (
                                <th key={col.key} className={cn("px-2 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap", col.key === "action" ? "text-center" : "", idx === 0 ? "pr-4" : "", idx === visibleCols.length - 1 ? "pl-4" : "")}>
                                  {col.key !== "action" ? (
                                    <button
                                      onClick={() => { const key = col.key as SortKey; if (sortField === key) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortField(key); setSortDir(TEXT_SORT_KEYS.includes(key) ? "asc" : "desc"); } }}
                                      className={cn("flex items-center gap-1 transition-colors", sortField === col.key ? "text-neutral-900 dark:text-white font-bold" : "hover:text-gray-700 dark:hover:text-gray-200")}
                                    >
                                      {col.label}
                                      {sortField === col.key
                                        ? <span className="text-[11px] font-bold leading-none">{sortDir === "asc" ? "↑" : "↓"}</span>
                                        : <ArrowUpDown className="w-3 h-3 opacity-50" />}
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
                                {isColVisible("title") && <td className="px-2 py-3 min-w-[170px] pr-4">
                                  <div className="flex items-center gap-2">
                                    {(task.subtasks || []).length > 0 && (
                                      <button
                                        onClick={() => setExpandedRows(prev => { const next = new Set(prev); if (next.has(task.id)) next.delete(task.id); else next.add(task.id); return next; })}
                                        className="flex items-center gap-0.5 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                                      >
                                        <span className="text-[10px] font-semibold bg-gray-100 dark:bg-neutral-700 text-gray-500 dark:text-gray-300 rounded-full px-1.5 py-0.5 min-w-[18px] text-center tabular-nums">{(task.subtasks || []).length}</span>
                                        {expandedRows.has(task.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => openEdit(task)}
                                      className="w-full text-right hover:text-teal-600 transition-colors"
                                      title={task.title}
                                    >
                                      <span className="block text-sm text-gray-700 dark:text-gray-200 line-clamp-2">{task.title}</span>
                                    </button>
                                  </div>
                                </td>}
                                {isColVisible("assignee") && <td className="px-2 py-3 whitespace-nowrap">
                                  {task.assignMode === "team" && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"><Users className="w-4 h-4 text-blue-500" /></div>
                                      <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{task.assignTarget}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-neutral-400">{(task.assignMembers || []).length} أعضاء</p>
                                      </div>
                                    </div>
                                  )}
                                  {task.assignMode === "department" && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0"><Building2 className="w-4 h-4 text-amber-500" /></div>
                                      <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{task.assignTarget}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-neutral-400">{(task.assignMembers || []).length} موظف</p>
                                      </div>
                                    </div>
                                  )}
                                  {task.assignMode === "committee" && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center shrink-0"><FolderOpen className="w-4 h-4 text-violet-500" /></div>
                                      <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{task.assignTarget}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-neutral-400">{(task.assignMembers || []).length} عضو</p>
                                      </div>
                                    </div>
                                  )}
                                  {(!task.assignMode || task.assignMode === "me") && (
                                    <button
                                      type="button"
                                      onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setAssignSearch(""); setTableDropdown(prev => prev && prev.id === task.id && prev.field === "assignee" ? null : { id: task.id, field: "assignee", top: r.bottom, right: window.innerWidth - r.right }); }}
                                      className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                                    >
                                      <div className="flex -space-x-2 rtl:space-x-reverse">
                                        {(task.assignMembers && task.assignMembers.length > 0 ? task.assignMembers : [task.assignee]).slice(0, 3).map((m, i) => (
                                          <img key={i} src={avatarUrl(m)} alt={m} title={m} className="w-6 h-6 rounded-full border-2 border-white dark:border-neutral-800 object-cover shrink-0" />
                                        ))}
                                        {(task.assignMembers && task.assignMembers.length > 3) && (
                                          <div className="w-6 h-6 rounded-full border-2 border-white dark:border-neutral-800 bg-gray-100 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-bold">+{(task.assignMembers.length - 3)}</div>
                                        )}
                                      </div>
                                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 max-w-[80px] truncate">
                                        {task.assignMembers && task.assignMembers.length > 0 ? (task.assignMembers.length > 1 ? `${task.assignMembers.length} موظفين` : task.assignMembers[0]) : task.assignee}
                                      </span>
                                      <ChevronDown className="w-3 h-3 text-gray-400" />
                                    </button>
                                  )}
                                </td>}
                                {isColVisible("assignedBy") && <td className="px-2 py-3 whitespace-nowrap">
                                  {task.assignedBy ? (
                                    <div className="flex items-center gap-1.5">
                                      <img src={avatarUrl(task.assignedBy)} alt={task.assignedBy} title={task.assignedBy} className="w-6 h-6 rounded-full border-2 border-white dark:border-neutral-800 object-cover shrink-0" />
                                      <span className="text-sm text-gray-700 dark:text-gray-200 max-w-[90px] truncate">{task.assignedBy}</span>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-400 dark:text-neutral-500">—</span>
                                  )}
                                </td>}
                                {isColVisible("createdAt") && <td className="px-2 py-3 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                                  {task.createdAt ? fmtDate(task.createdAt) : "—"}
                                </td>}
                                {isColVisible("progress") && <td className="px-2 py-3 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setTableDropdown(prev => prev && prev.id === task.id && prev.field === "progress" ? null : { id: task.id, field: "progress", top: r.bottom, right: window.innerWidth - r.right }); }}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-xs"
                                  >
                                    <div className="w-11 h-1.5 rounded-full bg-gray-100 dark:bg-neutral-700 overflow-hidden">
                                      <div className="h-full rounded-full bg-teal-500" style={{ width: `${task.progress}%` }} />
                                    </div>
                                    <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">{task.progress}%</span>
                                    <ChevronDown className="w-3 h-3 text-gray-400" />
                                  </button>
                                </td>}
                                {isColVisible("dueDate") && <td className="px-2 py-3 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setTableDropdown(prev => prev && prev.id === task.id && prev.field === "dueDate" ? null : { id: task.id, field: "dueDate", top: r.bottom, right: window.innerWidth - r.right }); }}
                                    className={cn(
                                      "flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-800/60 transition-colors",
                                      task.dueDate < today && task.status !== "completed"
                                        ? "text-red-500 border-red-200 bg-red-50/70 dark:text-red-300 dark:border-red-700 dark:bg-red-900/30"
                                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                    )}
                                  >
                                    <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                                    <div className="flex flex-col text-right">
                                      {task.startDate && task.startDate !== task.dueDate && (
                                        <span className="text-[10px] opacity-50 leading-tight">{fmtDate(task.startDate)}</span>
                                      )}
                                      <span className="truncate max-w-[90px]">{fmtDate(task.dueDate)}</span>
                                    </div>
                                    <ChevronDown className="w-3 h-3 opacity-60" />
                                  </button>
                                </td>}
                                {isColVisible("priority") && <td className="px-2 py-3">
                                  <button
                                    type="button"
                                    onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setTableDropdown(prev => prev && prev.id === task.id && prev.field === "priority" ? null : { id: task.id, field: "priority", top: r.bottom, right: window.innerWidth - r.right }); }}
                                    className="flex items-center justify-between px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 min-w-[90px]"
                                  >
                                    <span className="flex items-center gap-1.5">
                                      <Flag className={cn("w-4 h-4", PRIORITY_CONFIG[task.priority].flag)} />
                                      <span>{PRIORITY_CONFIG[task.priority].label}</span>
                                    </span>
                                    <ChevronDown className="w-3 h-3 opacity-60" />
                                  </button>
                                </td>}
                                {isColVisible("projectName") && <td className="px-2 py-3 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setProjectSearch(""); setTableDropdown(prev => prev && prev.id === task.id && prev.field === "project" ? null : { id: task.id, field: "project", top: r.bottom, right: window.innerWidth - r.right }); }}
                                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 bg-white text-neutral-800 dark:border-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                                  >
                                    <span className="truncate max-w-[90px]">{task.projectName}</span>
                                    <ChevronDown className="w-3 h-3 opacity-60" />
                                  </button>
                                </td>}
                                {isColVisible("source") && <td className="px-2 py-3 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setTableDropdown(prev => prev && prev.id === task.id && prev.field === "source" ? null : { id: task.id, field: "source", top: r.bottom, right: window.innerWidth - r.right }); }}
                                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 bg-white text-neutral-800 dark:border-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                                  >
                                    <span className="truncate max-w-[80px]">{task.taskSource || "غير محدد"}</span>
                                    <ChevronDown className="w-3 h-3 opacity-60" />
                                  </button>
                                </td>}
                                {/* Status */}
                                {isColVisible("status") && <td className="px-2 py-3 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setTableDropdown(prev => prev && prev.id === task.id && prev.field === "status" ? null : { id: task.id, field: "status", top: r.bottom, right: window.innerWidth - r.right }); }}
                                    className={cn("flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium border min-w-[90px]", STATUS_CONFIG[task.status].badgeBg, STATUS_CONFIG[task.status].badgeText, STATUS_CONFIG[task.status].badgeBorder, "hover:brightness-95 transition-all")}
                                  >
                                    <span className="flex items-center gap-1.5">
                                      <span className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[task.status].headerDot)} />
                                      <span>{STATUS_CONFIG[task.status].label}</span>
                                    </span>
                                    <ChevronDown className="w-3 h-3 opacity-60" />
                                  </button>
                                </td>}
                                {isColVisible("action") && <td className="px-2 py-3 text-center relative pl-4">
                                  <button
                                    onClick={(e) => {
                                      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                      setTableDropdown(prev =>
                                        prev && prev.id === task.id && prev.field === "action"
                                          ? null
                                          : { id: task.id, field: "action", top: r.bottom, right: window.innerWidth - r.right }
                                      );
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-400 hover:text-gray-600 transition-colors"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                </td>}
                              </tr>
                              {/* Subtask rows */}
                              {expandedRows.has(task.id) && (task.subtasks || []).map(st => (
                                <tr key={st.id} className="border-b border-gray-50 dark:border-neutral-700/50 bg-gray-50/40 dark:bg-neutral-800/40">
                                  {isColVisible("title") && <td className="px-3 py-2 min-w-[200px] pr-5">
                                    <div className="flex items-center gap-2 mr-6">
                                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                                      <span className="text-sm text-gray-600 dark:text-gray-300 truncate text-right">{st.title}</span>
                                    </div>
                                  </td>}
                                  {isColVisible("assignee") && <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                      <img src={avatarUrl(st.assignee)} alt={st.assignee} className="w-5 h-5 rounded-full object-cover shrink-0" />
                                      <span className="text-xs text-gray-500 dark:text-gray-400">{st.assignee}</span>
                                    </div>
                                  </td>}
                                  {isColVisible("assignedBy") && <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-500">—</td>}
                                  {isColVisible("createdAt") && <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-500">—</td>}
                                  {isColVisible("progress") && <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-12 h-1 rounded-full bg-gray-200 dark:bg-neutral-700 overflow-hidden">
                                        <div className="h-full rounded-full bg-teal-400" style={{ width: `${st.progress || 0}%` }} />
                                      </div>
                                      <span className="text-[10px] text-gray-500 dark:text-neutral-400">{st.progress || 0}%</span>
                                    </div>
                                  </td>}
                                  {isColVisible("dueDate") && <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                                    <span className={cn(st.dueDate < today && st.status !== "completed" ? "text-red-400" : "")}>{fmtDate(st.dueDate)}</span>
                                  </td>}
                                  {isColVisible("priority") && <td className="px-3 py-2 whitespace-nowrap">
                                    <Flag className={cn("w-3 h-3", PRIORITY_CONFIG[st.priority]?.flag || "text-gray-400")} />
                                  </td>}
                                  {isColVisible("projectName") && <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-500">{st.projectName}</td>}
                                  {isColVisible("source") && <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 dark:text-gray-500">—</td>}
                                  {isColVisible("status") && <td className="px-3 py-2 whitespace-nowrap">
                                    <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full", STATUS_CONFIG[st.status]?.badgeBg || "bg-gray-100", STATUS_CONFIG[st.status]?.badgeText || "text-gray-500")}>
                                      <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_CONFIG[st.status]?.headerDot || "bg-gray-300")} />
                                      {STATUS_CONFIG[st.status]?.label || st.status}
                                    </span>
                                  </td>}
                                  {isColVisible("action") && <td className="px-3 py-2 text-center relative pl-5">
                                    <div className="flex items-center gap-1.5">
                                      <button onClick={() => openEditSubtask(task, st)} className="text-gray-300 hover:text-teal-500 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                                      <button onClick={() => { const next = (task.subtasks || []).filter(s => s.id !== st.id); setTasks(p => p.map(x => x.id === task.id ? { ...x, subtasks: next } : x)); }} className="text-gray-300 hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button>
                                    </div>
                                  </td>}
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
                  <div
                    key={status}
                    className={cn(
                      "flex-shrink-0 w-[260px] sm:w-[280px] flex flex-col rounded-2xl p-3 transition-shadow",
                      cfg.colBg,
                      dragOverCol === status && "ring-2 ring-teal-400/70"
                    )}
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (dragOverCol !== status) setDragOverCol(status); }}
                    onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null); }}
                    onDrop={(e) => { e.preventDefault(); handleDropOnColumn(status); }}
                  >
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
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => { setDragTaskId(task.id); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", task.id); }}
                          onDragEnd={() => { setDragTaskId(null); setDragOverCol(null); }}
                          className={cn("cursor-grab active:cursor-grabbing", dragTaskId === task.id && "opacity-40")}
                        >
                        <motion.div
                          whileHover={{ y: -1, boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}
                          className="bg-white dark:bg-neutral-800 rounded-xl border border-gray-100 dark:border-neutral-700 p-3.5 shadow-sm cursor-pointer"
                          onClick={() => openEdit(task)}
                        >
                          {/* Title */}
                          <h4 className="text-[13px] font-semibold text-gray-800 dark:text-gray-100 mb-1 text-right leading-snug">{task.title}</h4>
                          {/* Project subtitle */}
                          <p className="text-[11px] text-gray-500 dark:text-neutral-400 mb-3 text-right">في {task.projectName}</p>

                          {/* Assignee row */}
                          <div className="flex items-center gap-1.5 mb-2">
                            {(!task.assignMode || task.assignMode === "me") ? (
                              <div className="flex -space-x-1.5 rtl:space-x-reverse">
                                {(task.assignMembers && task.assignMembers.length > 0 ? task.assignMembers : [task.assignee]).slice(0, 3).map((m, i) => (
                                  <img key={i} src={avatarUrl(m)} alt={m} title={m} className="w-5 h-5 rounded-full border border-white dark:border-neutral-800 object-cover shrink-0" />
                                ))}
                                {(task.assignMembers && task.assignMembers.length > 3) && (
                                  <div className="w-5 h-5 rounded-full border border-white dark:border-neutral-800 bg-gray-100 dark:bg-neutral-700 flex items-center justify-center text-[7px] font-bold">+{(task.assignMembers.length - 3)}</div>
                                )}
                              </div>
                            ) : task.assignMode === "team" ? (
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><Users className="w-3 h-3 text-blue-500" /></div>
                            ) : task.assignMode === "department" ? (
                              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0"><Building2 className="w-3 h-3 text-amber-500" /></div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0"><FolderOpen className="w-3 h-3 text-violet-500" /></div>
                            )}
                            <span className="text-[10px] text-gray-500 truncate">
                              {task.assignMode && task.assignMode !== "me" ? (task.assignTarget || "-") : (task.assignMembers && task.assignMembers.length > 0 ? (task.assignMembers.length > 1 ? `${task.assignMembers.length} موظفين` : task.assignMembers[0]) : task.assignee)}
                            </span>
                          </div>

                          {/* Date row */}
                          <div className={cn("flex items-center gap-1.5 mb-2", task.dueDate < today && task.status !== "completed" ? "text-red-500" : "text-gray-400")}>
                            <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                            <div className="flex flex-col text-right">
                              {task.startDate && task.startDate !== task.dueDate && (
                                <span className="text-[10px] opacity-60 leading-none mb-0.5">{fmtDate(task.startDate)}</span>
                              )}
                              <span className="text-[11px] font-medium leading-none">{fmtDate(task.dueDate)}</span>
                            </div>
                          </div>

                          {/* Priority row */}
                          <div className="flex items-center gap-1.5 mb-2">
                            <Flag className={cn("w-3.5 h-3.5 shrink-0", PRIORITY_CONFIG[task.priority].flag)} />
                          </div>

                          {/* Subtasks row */}
                          {(task.subtasks || []).length > 0 && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <CheckSquare className="w-3 h-3 text-gray-400" />
                              <span className="text-[10px] text-gray-500 dark:text-neutral-400">{(task.subtasks || []).length} مهمة فرعية</span>
                            </div>
                          )}

                          {/* Progress row */}
                          {task.progress > 0 && (
                            <div className="flex items-center gap-2 mt-2.5">
                              <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-neutral-700 overflow-hidden">
                                <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${task.progress}%` }} />
                              </div>
                              <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-medium shrink-0">{task.progress}%</span>
                            </div>
                          )}
                        </motion.div>
                        </div>
                      ))}

                      {/* Add Task button */}
                      <button
                        onClick={() => { openCreate(); }}
                        className="w-full flex items-center gap-1.5 px-3 py-2.5 text-xs text-gray-500 dark:text-neutral-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-neutral-700/40 rounded-xl transition-colors"
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
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-medium">
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
                            <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-medium leading-none px-0.5">
                              {cell.dateStr ? fmtHijri(cell.dateStr).replace(/\s.*/, "") : ""}
                            </span>
                          </div>
                          <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                            {dayTasks.slice(0, 3).map(t => (
                              <button key={t.id} onClick={() => openEdit(t)} className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded truncate text-right w-full transition-colors hover:opacity-80", STATUS_CONFIG[t.status].badgeBg, STATUS_CONFIG[t.status].badgeText)}>
                                {t.title}
                                {(t.subtasks || []).length > 0 && <span className="mr-1 opacity-70">({(t.subtasks || []).length})</span>}
                              </button>
                            ))}
                            {dayTasks.length > 3 && (
                              <span className="text-[10px] text-gray-500 dark:text-neutral-400 text-right px-1">+{dayTasks.length - 3}</span>
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
              className="fixed inset-0 sm:inset-8 lg:inset-12 z-[70] bg-[#FAFCFF] dark:bg-neutral-900 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden max-w-[1320px] mx-auto"
              dir="rtl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3 sm:px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-[#FAFCFF] dark:bg-neutral-900 shrink-0">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 shrink-0">
                    <span className="px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700 text-[11px] font-medium bg-neutral-50 dark:bg-neutral-800">المهام</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {detailSavePhase !== "idle" && (
                    <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
                      <span className={cn("flex items-center gap-1", detailSavePhase === "saved" ? "text-teal-600" : "text-neutral-400")}>
                        {detailSavePhase === "saved" ? <CheckCheck className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5 animate-pulse" />}
                        {detailSavePhase === "saved" ? "تم الحفظ" : "جارٍ الحفظ"}
                      </span>
                      {detailUndoRef.current && (
                        <button onClick={undoDetailChanges} className="font-semibold text-teal-600 hover:text-teal-700 transition-colors">تراجع</button>
                      )}
                    </div>
                  )}
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 mr-1 hidden sm:inline">تم الإنشاء {detailTask.createdAt || today}</span>
                  <button className="hidden sm:flex p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors" title="طباعة"><Printer className="w-4 h-4" /></button>
                  <button className="hidden sm:flex p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors" title="تصدير كملف"><FileDown className="w-4 h-4" /></button>
                  <button className="hidden sm:flex p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors" title="مشاركة"><Send className="w-4 h-4" /></button>
                  <button className="hidden sm:flex p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors" title="مفضلة"><Star className="w-4 h-4" /></button>
                  <button className="hidden sm:flex p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors" title="متابعة"><Bell className="w-4 h-4" /></button>
                  <button onClick={closeDetail} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500 transition-colors" aria-label="إغلاق تفاصيل المهمة">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mobile tabs */}
              <div className="flex sm:hidden border-b border-neutral-100 dark:border-neutral-800 bg-[#FAFCFF] dark:bg-neutral-900 shrink-0">
                <button onClick={() => setDetailMobileTab("details")} className={cn("flex-1 py-2.5 text-xs font-bold transition-colors", detailMobileTab === "details" ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-500" : "text-neutral-500 dark:text-neutral-400")}>المهمة</button>
                <button onClick={() => setDetailMobileTab("activity")} className={cn("flex-1 py-2.5 text-xs font-bold transition-colors", detailMobileTab === "activity" ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-500" : "text-neutral-500 dark:text-neutral-400")}>النشاط والتعليقات</button>
              </div>

              {/* Body - vertical split: 45% details / 55% activity */}
              <div className="relative flex-1 overflow-hidden flex flex-col sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setDetailPanelCollapsed(value => !value)}
                  className={cn(
                    "hidden sm:flex absolute top-1/2 -translate-y-1/2 z-30 w-8 h-12 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700 bg-[#FAFCFF] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] shadow-[0_4px_14px_rgba(15,23,42,0.14)] hover:text-[#008069] hover:border-[#00a884]/40 transition-all",
                    detailPanelCollapsed ? "left-3" : "left-[45%] -translate-x-1/2"
                  )}
                  aria-label={detailPanelCollapsed ? "إظهار تفاصيل المهمة" : "إخفاء تفاصيل المهمة"}
                  title={detailPanelCollapsed ? "إظهار تفاصيل المهمة" : "إخفاء تفاصيل المهمة"}
                >
                  {detailPanelCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
                {/* Main content - left 45% */}
                <div className={cn(
                  "min-w-0 flex-1 sm:flex-none overflow-y-auto bg-white dark:bg-neutral-900",
                  detailMobileTab === "activity" ? "hidden sm:block" : "",
                  detailPanelCollapsed ? "sm:!hidden" : "sm:w-[45%]"
                )}>
                  {/* Title row */}
                  <div className="px-3 sm:px-5 pt-4 pb-2 bg-white dark:bg-neutral-900 shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn("w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-white dark:ring-offset-neutral-900", STATUS_CONFIG[detailTask.status].accent)} />
                      <span className="text-sm font-medium text-neutral-400">مهمة</span>
                    </div>
                    <textarea
                      ref={detailTitleRef}
                      value={detailTask.title}
                      onChange={e => { const el = e.target; el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; updateDetailFields({ title: el.value }); }}
                      className="w-full text-lg sm:text-xl font-bold text-neutral-900 dark:text-white bg-transparent focus:outline-none text-right placeholder:text-neutral-300 resize-none overflow-hidden"
                      placeholder="عنوان المهمة"
                      rows={1}
                    />
                  </div>

                  {/* Description area */}
                  <div className="relative px-3 sm:px-5 sm:px-6 pb-3 bg-white dark:bg-neutral-900">
                    <FloatingTextFormatter
                      visible={textFormatSelection === "detail-description"}
                      onFormat={applyTextFormat}
                      className="right-5 top-0 -translate-y-full"
                    />
                    <RichTextEditor
                      editorRef={detailDescriptionRef}
                      value={detailTask.description || ""}
                      onChange={html => updateDetailFields({ description: html })}
                      onSelectionChange={editor => captureTextSelection("detail-description", editor)}
                      onBlur={nextFocus => handleTextFormattingBlur("detail-description", nextFocus)}
                      className="w-full min-h-[40px] p-0 text-sm leading-6 text-neutral-600 dark:text-neutral-300 bg-transparent focus:outline-none text-right whitespace-pre-wrap"
                      placeholder="اكتب الوصف أو اضغط '/' للأوامر"
                    />
                  </div>

                  <div className="p-3 sm:p-4 pb-2">
                    {/* Info Pills - flex wrap like task edit screen */}
                    <div className="flex flex-wrap gap-2">
                      {/* Status Pill */}
                      <div className="relative">
                        <button onClick={() => setDetailDropdown(d => d === "status" ? null : "status")} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors", detailDropdown === "status" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                          <span className="text-neutral-400 dark:text-neutral-500 font-normal shrink-0">الحالة:</span>
                          <span className="truncate max-w-[120px] text-neutral-700 dark:text-neutral-200">{STATUS_CONFIG[detailTask.status].label}</span>
                          <ChevronDown className={cn("w-3 h-3 transition-transform shrink-0 text-neutral-400", detailDropdown === "status" ? "rotate-180" : "")} />
                        </button>
                        {detailDropdown === "status" && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setDetailDropdown(null)} />
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-1.5 min-w-[160px]">
                              {(["todo","in-progress","in-review","completed","overdue"] as TaskStatus[]).map(s => (
                                <button key={s} onClick={() => { updateDetailFields(task => ({ status: s, progress: s === "completed" ? 100 : task.progress })); setDetailDropdown(null); }} className={cn("w-full px-4 py-2 text-sm text-right rounded-lg transition-colors", detailTask.status === s ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50")}>
                                  {STATUS_CONFIG[s].label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Assignee Pill */}
                      <div className="relative">
                        <button onClick={() => { setDetailDropdown(d => d === "assignee" ? null : "assignee"); setAssignSearch(""); }} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors", detailDropdown === "assignee" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                          <div className="flex -space-x-1.5 rtl:space-x-reverse">
                            {(detailTask.assignMembers && detailTask.assignMembers.length > 0 ? detailTask.assignMembers : [detailTask.assignee]).slice(0, 3).map((m, i) => (
                              <img key={i} src={avatarUrl(m)} alt={m} title={m} className="w-5 h-5 rounded-full border border-white dark:border-neutral-800 object-cover shrink-0" />
                            ))}
                            {(detailTask.assignMembers && detailTask.assignMembers.length > 3) && (
                              <div className="w-5 h-5 rounded-full border border-white dark:border-neutral-800 bg-gray-100 dark:bg-neutral-700 flex items-center justify-center text-[7px] font-bold">+{(detailTask.assignMembers.length - 3)}</div>
                            )}
                          </div>
                          <span className="text-neutral-400 dark:text-neutral-500 font-normal shrink-0">الإسناد:</span>
                          <span className="truncate max-w-[170px] text-neutral-700 dark:text-neutral-200">
                            {detailTask.assignMembers && detailTask.assignMembers.length > 0
                              ? detailTask.assignMembers.length > 1
                                ? `${detailTask.assignMembers[0]} و${detailTask.assignMembers.length - 1} ${detailTask.assignMembers.length - 1 === 1 ? "موظف" : "موظفين"}`
                                : detailTask.assignMembers[0]
                              : detailTask.assignee}
                          </span>
                          <ChevronDown className={cn("w-3 h-3 transition-transform shrink-0 text-neutral-400", detailDropdown === "assignee" ? "rotate-180" : "")} />
                        </button>
                        {detailDropdown === "assignee" && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setDetailDropdown(null)} />
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-1.5 min-w-[200px] max-h-[300px] flex flex-col overflow-hidden">
                              <div className="p-1.5 border-b border-gray-100 dark:border-neutral-700">
                                <div className="relative">
                                  <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                  <input
                                    autoFocus
                                    value={assignSearch}
                                    onChange={(e) => setAssignSearch(e.target.value)}
                                    placeholder="بحث..."
                                    className="w-full bg-gray-50 dark:bg-neutral-900 border-none rounded-lg py-1.5 ps-3 pe-8 text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                                  />
                                </div>
                              </div>
                              <div className="flex-1 overflow-y-auto py-1">
                                {ASSIGNEES
                                  .filter(name => name.toLowerCase().includes(assignSearch.toLowerCase()))
                                  .map(name => (
                                  <button key={name} onClick={() => {
                                    updateDetailFields(task => {
                                      const current = task.assignMembers || [task.assignee];
                                      const next = current.includes(name) ? (current.length > 1 ? current.filter(x => x !== name) : current) : [...current, name];
                                      return { assignee: next[0], assignMembers: next, assignMode: "me" as const, assignTarget: undefined };
                                    });
                                  }} className={cn("w-full px-4 py-2 text-sm text-right flex items-center justify-between rounded-lg transition-colors", (detailTask.assignMembers || [detailTask.assignee]).includes(name) ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50")}>
                                    <span className="flex items-center gap-2">
                                      {name}
                                    </span>
                                    {(detailTask.assignMembers || [detailTask.assignee]).includes(name) && <CheckSquare className="w-3.5 h-3.5" />}
                                  </button>
                                ))}
                              </div>
                              <div className="p-1.5 border-t border-gray-100 dark:border-neutral-700">
                                <button onClick={() => setDetailDropdown(null)} className="w-full py-1.5 text-xs font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors">تم</button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Supervisor Pill */}
                      {detailTask.supervisor && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700">
                          <img src={avatarUrl(detailTask.supervisor)} alt={detailTask.supervisor} title={detailTask.supervisor} className="w-5 h-5 rounded-full border border-white dark:border-neutral-800 object-cover shrink-0" />
                          <span className="text-neutral-400 dark:text-neutral-500 font-normal shrink-0">الإشراف:</span>
                          <span className="truncate max-w-[120px] text-neutral-700 dark:text-neutral-200">{detailTask.supervisor}</span>
                        </div>
                      )}

                      {/* Priority Pill */}
                      <div className="relative">
                        <button onClick={() => setDetailDropdown(d => d === "priority" ? null : "priority")} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors", detailDropdown === "priority" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                          <span className="text-neutral-400 dark:text-neutral-500 font-normal shrink-0">الأولوية:</span>
                          <span className="truncate max-w-[120px] text-neutral-700 dark:text-neutral-200">{PRIORITY_CONFIG[detailTask.priority].label}</span>
                          <ChevronDown className={cn("w-3 h-3 transition-transform shrink-0 text-neutral-400", detailDropdown === "priority" ? "rotate-180" : "")} />
                        </button>
                        {detailDropdown === "priority" && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setDetailDropdown(null)} />
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-1.5 min-w-[160px]">
                              {(["low","medium","high","urgent","emergency"] as TaskPriority[]).map(p => (
                                <button key={p} onClick={() => { updateDetailFields({ priority: p }); setDetailDropdown(null); }} className={cn("w-full px-4 py-2 text-sm text-right flex items-center justify-between rounded-lg transition-colors", detailTask.priority === p ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50")}>
                            <span>{PRIORITY_CONFIG[p].label}</span>
                            <Flag className={cn("w-4 h-4", PRIORITY_CONFIG[p].flag)} />
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Due Date Pill */}
                      <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/60 transition-colors">
                        <CalendarIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="text-sm text-neutral-400 dark:text-neutral-500 font-normal shrink-0">الاستحقاق:</span>
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate max-w-[120px]">{detailTask.dueDate || "—"}</span>
                        <input type="date" value={detailTask.dueDate} onChange={e => updateDetailFields({ dueDate: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer" dir="ltr" />
                      </div>

                      {/* Start Date Pill */}
                      <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/60 transition-colors">
                        <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="text-sm text-neutral-400 dark:text-neutral-500 font-normal shrink-0">تاريخ البدء:</span>
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate max-w-[120px]">{detailTask.startDate || "غير محدد"}</span>
                        <input type="date" value={detailTask.startDate} onChange={e => updateDetailFields({ startDate: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer" dir="ltr" />
                      </div>

                      {/* Source Pill */}
                      <div className="relative">
                        <button onClick={() => setDetailDropdown(d => d === "source" ? null : "source")} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors", detailDropdown === "source" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                          <span className="text-neutral-400 dark:text-neutral-500 font-normal shrink-0">المصدر:</span>
                          <span className="truncate max-w-[120px] text-neutral-700 dark:text-neutral-200">{detailTask.taskSource || "غير محدد"}</span>
                          <ChevronDown className={cn("w-3 h-3 transition-transform shrink-0 text-neutral-400", detailDropdown === "source" ? "rotate-180" : "")} />
                        </button>
                        {detailDropdown === "source" && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setDetailDropdown(null)} />
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-1.5 min-w-[160px]">
                              {SOURCES.map(s => (
                                <button key={s} onClick={() => { updateDetailFields({ taskSource: s }); setDetailDropdown(null); }} className={cn("w-full px-4 py-2 text-sm text-right rounded-lg transition-colors", detailTask.taskSource === s ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50")}>
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
                        <span className="text-sm text-neutral-400 dark:text-neutral-500 font-normal shrink-0">الإنجاز:</span>
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{detailTask.progress ?? 0}%</span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={detailTask.progress ?? 0}
                          onChange={e => { const progress = Number(e.target.value); updateDetailFields(task => ({ progress, status: progress === 100 ? "completed" : task.status === "completed" ? "in-progress" : task.status })); }}
                          className="progress-slider w-16 cursor-pointer"
                        />
                      </div>

                      {/* Project Pill */}
                      <div className="relative">
                        <button onClick={() => setDetailDropdown(d => d === "project" ? null : "project")} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors", detailDropdown === "project" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                          <span className="text-neutral-400 dark:text-neutral-500 font-normal shrink-0">المشروع:</span>
                          <span className="truncate max-w-[150px] text-neutral-700 dark:text-neutral-200">{detailTask.projectName || "غير محدد"}</span>
                          <ChevronDown className={cn("w-3 h-3 transition-transform shrink-0 text-neutral-400", detailDropdown === "project" ? "rotate-180" : "")} />
                        </button>
                        {detailDropdown === "project" && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setDetailDropdown(null)} />
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-1.5 min-w-[200px]">
                              {projectsList.map(p => (
                                <button key={p} onClick={() => { updateDetailFields({ projectName: p }); setDetailDropdown(null); }} className={cn("w-full px-4 py-2 text-sm text-right rounded-lg transition-colors", detailTask.projectName === p ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50")}>
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
                          <span className="text-neutral-400 dark:text-neutral-500 font-normal shrink-0">الوسوم:</span>
                          <div className="flex items-center gap-1 flex-wrap max-w-[120px]">
                            {(detailTask.tags || []).length > 0 ? (detailTask.tags || []).slice(0, 2).map(tag => {
                              const tc = getTagColor(tag, detailTask.tagColors);
                              return <span key={tag} className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-medium truncate", tc.light)}>{tag}</span>;
                            }) : <span className="text-neutral-400 truncate">فارغ</span>}
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
                                  {allTagsList.map(tag => {
                                    const tc = getTagColor(tag, detailTask.tagColors);
                                    const selected = (detailTask.tags || []).includes(tag);
                                    return (
                                      <button key={tag} onClick={() => updateDetailFields(task => { const current = task.tags || []; return { tags: current.includes(tag) ? current.filter(item => item !== tag) : [...current, tag] }; })} className={cn("px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1.5", selected ? cn(tc.bg, tc.text, "shadow-sm") : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600")}>
                                        <span className={cn("w-1.5 h-1.5 rounded-full", selected ? "bg-white/70" : tc.dot)} />
                                        {tag}
                                      </button>
                                    );
                                  })}
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
                                      <span>{STATUS_CONFIG[detailEditingSubtaskForm.status || "todo"].label}</span>
                                      <ChevronDown className={cn("w-3 h-3 transition-transform", detailEditingSubtaskDropdown === "status" ? "rotate-180" : "")} />
                                    </button>
                                    {detailEditingSubtaskDropdown === "status" && (
                                      <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-1.5 min-w-[140px]">
                                        {(["todo","in-progress","in-review","completed","overdue"] as TaskStatus[]).map(s => (
                                          <button key={s} onClick={() => { setDetailEditingSubtaskForm(f => ({ ...f, status: s })); setDetailEditingSubtaskDropdown(null); }} className={cn("w-full px-3 py-1.5 text-xs text-right rounded-lg transition-colors", (detailEditingSubtaskForm.status || "todo") === s ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50")}>
                                            {STATUS_CONFIG[s].label}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  {/* Priority picker */}
                                  <div className="relative">
                                    <button onClick={() => setDetailEditingSubtaskDropdown(d => d === "priority" ? null : "priority")} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium transition-colors", detailEditingSubtaskDropdown === "priority" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                                      <span>{PRIORITY_CONFIG[detailEditingSubtaskForm.priority || "medium"].label}</span>
                                      <ChevronDown className={cn("w-3 h-3 transition-transform", detailEditingSubtaskDropdown === "priority" ? "rotate-180" : "")} />
                                    </button>
                                    {detailEditingSubtaskDropdown === "priority" && (
                                      <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-1.5 min-w-[140px]">
                                        {(["low","medium","high","urgent","emergency"] as TaskPriority[]).map(p => (
                                          <button key={p} onClick={() => { setDetailEditingSubtaskForm(f => ({ ...f, priority: p })); setDetailEditingSubtaskDropdown(null); }} className={cn("w-full px-3 py-1.5 text-xs text-right flex items-center justify-between rounded-lg transition-colors", (detailEditingSubtaskForm.priority || "medium") === p ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50")}>
                                    <span>{PRIORITY_CONFIG[p].label}</span>
                                    <Flag className={cn("w-4 h-4", PRIORITY_CONFIG[p].flag)} />
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  {/* Assignee picker */}
                                  <div className="relative">
                                    <button onClick={() => setDetailEditingSubtaskDropdown(d => d === "assignee" ? null : "assignee")} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium transition-colors", detailEditingSubtaskDropdown === "assignee" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                                      <span className="max-w-[80px] truncate">{detailEditingSubtaskForm.assignee}</span>
                                      <ChevronDown className={cn("w-3 h-3 transition-transform", detailEditingSubtaskDropdown === "assignee" ? "rotate-180" : "")} />
                                    </button>
                                    {detailEditingSubtaskDropdown === "assignee" && (
                                      <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-1.5 min-w-[160px] max-h-[200px] overflow-y-auto">
                                        {ASSIGNEES.map(name => (
                                          <button key={name} onClick={() => { setDetailEditingSubtaskForm(f => ({ ...f, assignee: name })); setDetailEditingSubtaskDropdown(null); }} className={cn("w-full px-3 py-1.5 text-xs text-right rounded-lg transition-colors", detailEditingSubtaskForm.assignee === name ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50")}>
                                            {name}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  {/* Due Date picker */}
                                  <div className="relative">
                                    <button onClick={() => setDetailEditingSubtaskDropdown(d => d === "dueDate" ? null : "dueDate")} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium transition-colors", detailEditingSubtaskDropdown === "dueDate" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
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
                                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{st.dueDate}</span>
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
                      <div className="mb-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-[#FAFCFF] dark:bg-neutral-800/60 space-y-2">
                        <input
                          value={detailSubtaskForm.title || ""}
                          onChange={e => setDetailSubtaskForm(f => ({ ...f, title: e.target.value }))}
                          placeholder="اسم المهمة الفرعية"
                          className="w-full text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-1 focus:ring-teal-400/30"
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Status picker */}
                          <div className="relative">
                            <button onClick={() => setDetailSubtaskDropdown(d => d === "status" ? null : "status")} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium transition-colors", detailSubtaskDropdown === "status" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                              <span>{STATUS_CONFIG[detailSubtaskForm.status || "todo"].label}</span>
                              <ChevronDown className={cn("w-3 h-3 transition-transform", detailSubtaskDropdown === "status" ? "rotate-180" : "")} />
                            </button>
                            {detailSubtaskDropdown === "status" && (
                              <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-1.5 min-w-[140px]">
                                {(["todo","in-progress","in-review","completed","overdue"] as TaskStatus[]).map(s => (
                                  <button key={s} onClick={() => { setDetailSubtaskForm(f => ({ ...f, status: s })); setDetailSubtaskDropdown(null); }} className={cn("w-full px-3 py-1.5 text-xs text-right rounded-lg transition-colors", (detailSubtaskForm.status || "todo") === s ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50")}>
                                    {STATUS_CONFIG[s].label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Priority picker */}
                          <div className="relative">
                            <button onClick={() => setDetailSubtaskDropdown(d => d === "priority" ? null : "priority")} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium transition-colors", detailSubtaskDropdown === "priority" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                              <span>{PRIORITY_CONFIG[detailSubtaskForm.priority || "medium"].label}</span>
                              <ChevronDown className={cn("w-3 h-3 transition-transform", detailSubtaskDropdown === "priority" ? "rotate-180" : "")} />
                            </button>
                            {detailSubtaskDropdown === "priority" && (
                              <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-1.5 min-w-[140px]">
                                {(["low","medium","high","urgent","emergency"] as TaskPriority[]).map(p => (
                                  <button key={p} onClick={() => { setDetailSubtaskForm(f => ({ ...f, priority: p })); setDetailSubtaskDropdown(null); }} className={cn("w-full px-3 py-1.5 text-xs text-right flex items-center justify-between rounded-lg transition-colors", (detailSubtaskForm.priority || "medium") === p ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50")}>
                                    <span>{PRIORITY_CONFIG[p].label}</span>
                                    <Flag className={cn("w-4 h-4", PRIORITY_CONFIG[p].flag)} />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Assignee picker */}
                          <div className="relative">
                            <button onClick={() => setDetailSubtaskDropdown(d => d === "assignee" ? null : "assignee")} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium transition-colors", detailSubtaskDropdown === "assignee" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                              <span className="max-w-[80px] truncate">{detailSubtaskForm.assignee}</span>
                              <ChevronDown className={cn("w-3 h-3 transition-transform", detailSubtaskDropdown === "assignee" ? "rotate-180" : "")} />
                            </button>
                            {detailSubtaskDropdown === "assignee" && (
                              <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-1.5 min-w-[160px] max-h-[200px] overflow-y-auto">
                                {ASSIGNEES.map(name => (
                                  <button key={name} onClick={() => { setDetailSubtaskForm(f => ({ ...f, assignee: name })); setDetailSubtaskDropdown(null); }} className={cn("w-full px-3 py-1.5 text-xs text-right rounded-lg transition-colors", detailSubtaskForm.assignee === name ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50")}>
                                    {name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Due Date picker */}
                          <div className="relative">
                            <button onClick={() => setDetailSubtaskDropdown(d => d === "dueDate" ? null : "dueDate")} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium transition-colors", detailSubtaskDropdown === "dueDate" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
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
                          <button onClick={() => { setDetailShowSubtaskForm(false); setDetailSubtaskDropdown(null); setDetailSubtaskForm({ status: "todo", priority: "medium", dueDate: today, assignee: ASSIGNEES[0], progress: 0, projectName: PROJECTS[0] }); }} className="px-2 py-1 text-xs text-neutral-500 hover:text-neutral-700 transition-colors">إلغاء</button>
                          <button onClick={() => { if (!detailSubtaskForm.title?.trim()) return; const newSubtask: Task = { id: String(Date.now()), title: detailSubtaskForm.title!.trim(), description: "", status: detailSubtaskForm.status || "todo", priority: detailSubtaskForm.priority || "medium", dueDate: detailSubtaskForm.dueDate || today, assignee: detailSubtaskForm.assignee || ASSIGNEES[0], progress: detailSubtaskForm.progress ?? 0, projectName: detailSubtaskForm.projectName || PROJECTS[0] }; const next = [...(detailTask.subtasks || []), newSubtask]; setDetailTask(t => t ? { ...t, subtasks: next } : t); setTasks(p => p.map(x => x.id === detailTask.id ? { ...x, subtasks: next } : x)); setDetailShowSubtaskForm(false); setDetailSubtaskDropdown(null); setDetailSubtaskForm({ status: "todo", priority: "medium", dueDate: today, assignee: ASSIGNEES[0], progress: 0, projectName: PROJECTS[0] }); }} className="px-2 py-1 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors">حفظ</button>
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
                <div className={cn(
                  "min-w-0 flex-1 sm:flex-none border-t sm:border-t-0 border-neutral-200 dark:border-neutral-800 bg-[#FAFCFF] dark:bg-[#0b141a] overflow-hidden flex flex-col transition-[width] duration-300",
                  detailPanelCollapsed ? "sm:w-full sm:border-l-0" : "sm:w-[55%] sm:border-l",
                  detailMobileTab === "details" ? "hidden sm:flex" : ""
                )}>
                  {/* WhatsApp-style conversation header */}
                  <div className="relative z-20 shrink-0 bg-[#FAFCFF] dark:bg-[#202c33] border-b border-black/5 dark:border-white/5 shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
                    <div className="h-[60px] flex items-center justify-between px-3 sm:px-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <img src={avatarUrl(detailTask.assignee)} alt={detailTask.assignee} className="w-10 h-10 rounded-full object-cover" />
                          <span className="absolute bottom-0 start-0 w-3 h-3 rounded-full bg-[#25d366] border-2 border-[#f0f2f5] dark:border-[#202c33]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-[#111b21] dark:text-[#e9edef] truncate">النشاط والتعليقات</h3>
                          <p className="text-xs text-[#667781] dark:text-[#8696a0] truncate">
                            {detailTask.assignee} · {(detailTask.comments || []).length} رسالة
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[#54656f] dark:text-[#aebac1]">
                        <button
                          type="button"
                          onClick={() => { if (detailChatSearchOpen) setDetailChatSearch(""); setDetailChatSearchOpen(open => !open); setDetailAttachmentMenuOpen(false); setDetailEmojiOpen(false); }}
                          className={cn("p-2 rounded-full transition-colors", detailChatSearchOpen ? "bg-black/10 dark:bg-white/10 text-[#008069]" : "hover:bg-black/5 dark:hover:bg-white/5")}
                          aria-label="البحث في المحادثة"
                          title="البحث في المحادثة"
                        >
                          <Search className="w-5 h-5" />
                        </button>
                        <button type="button" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors" aria-label="خيارات المحادثة" title="خيارات المحادثة">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    {detailChatSearchOpen && (
                      <div className="px-3 pb-2.5">
                        <div className="flex items-center gap-2 h-9 rounded-lg bg-white dark:bg-[#111b21] px-3">
                          <Search className="w-4 h-4 text-[#667781] shrink-0" />
                          <input
                            value={detailChatSearch}
                            onChange={event => setDetailChatSearch(event.target.value)}
                            placeholder="البحث في الرسائل"
                            className="flex-1 min-w-0 bg-transparent text-xs text-[#111b21] dark:text-[#e9edef] placeholder:text-[#8696a0] outline-none"
                            autoFocus
                          />
                          {detailChatSearch && (
                            <button onClick={() => setDetailChatSearch("")} className="p-1 text-[#667781] hover:text-[#111b21] dark:hover:text-white"><X className="w-3.5 h-3.5" /></button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Activity items */}
                  <div className="whatsapp-chat-bg flex-1 overflow-y-auto px-3 sm:px-[7%] py-4 space-y-2">
                    {/* Created task entry */}
                    <div className="flex justify-center pb-2">
                      <span className="px-3 py-1.5 rounded-lg bg-[#ffeecd] dark:bg-[#182229] shadow-sm text-[11px] font-medium text-[#54656f] dark:text-[#8696a0] flex items-center gap-1.5">
                        <FilePlus className="w-3 h-3" />
                        أنشأت هذه المهمة · {detailTask.createdAt || today}
                      </span>
                    </div>
                    <div className="flex justify-center py-1">
                      <span className="px-3 py-1 rounded-lg bg-white/90 dark:bg-[#182229] shadow-sm text-[11px] font-medium text-[#667781] dark:text-[#8696a0]">اليوم</span>
                    </div>

                    {(detailTask.comments || []).filter(comment => !detailChatSearch.trim() || comment.text.toLowerCase().includes(detailChatSearch.trim().toLowerCase()) || comment.author.toLowerCase().includes(detailChatSearch.trim().toLowerCase())).length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 text-[#667781] dark:text-[#8696a0]">
                        <div className="w-12 h-12 rounded-full bg-white/80 dark:bg-[#202c33] flex items-center justify-center mb-3 shadow-sm">
                          {detailChatSearch ? <Search className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                        </div>
                        <p className="text-xs">{detailChatSearch ? "لا توجد رسائل مطابقة" : "ابدأ المحادثة حول سير عمل المهمة"}</p>
                      </div>
                    )}
                    {(detailTask.comments || []).filter(comment => !detailChatSearch.trim() || comment.text.toLowerCase().includes(detailChatSearch.trim().toLowerCase()) || comment.author.toLowerCase().includes(detailChatSearch.trim().toLowerCase())).map(c => {
                      const canEdit = c.author === "أنت" && c.createdAt && (Date.now() - c.createdAt < 30 * 60 * 1000);
                      const isEditing = detailEditingComment?.id === c.id;
                      const isMine = c.author === "أنت";
                      return (
                        <div key={c.id} dir="ltr" className={cn("flex items-end gap-2 group", isMine ? "justify-end" : "justify-start")}>
                          {!isMine && <img src={avatarUrl(c.author)} alt={c.author} className="w-8 h-8 rounded-full object-cover shrink-0 shadow-sm ring-1 ring-black/5" />}
                          <div className={cn(
                            "relative max-w-[84%] sm:max-w-[72%] min-w-[88px] rounded-lg px-2.5 pt-1.5 pb-1 shadow-[0_1px_1px_rgba(11,20,26,0.13)]",
                            isMine
                              ? "wa-message-out bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef]"
                              : "wa-message-in bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef]"
                          )} dir="rtl">
                            {!isMine && <p className="text-xs font-semibold text-[#008069] dark:text-[#00a884] text-right mb-0.5">{c.author}</p>}
                            {isEditing ? (
                              <div>
                                <textarea value={detailEditingComment.text} onChange={e => setDetailEditingComment({ ...detailEditingComment, text: e.target.value })} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); const next = (detailTask.comments || []).map(x => x.id === c.id ? { ...x, text: detailEditingComment.text.trim() } : x); setDetailTask(t => t ? { ...t, comments: next } : t); setTasks(p => p.map(x => x.id === detailTask.id ? { ...x, comments: next } : x)); setDetailEditingComment(null); } }} className="w-full min-w-[200px] text-base sm:text-sm rounded-md p-2 bg-white/70 dark:bg-black/20 text-[#111b21] dark:text-[#e9edef] border border-[#00a884]/40 focus:outline-none focus:ring-1 focus:ring-[#00a884] resize-none text-right" rows={2} />
                                <div className="flex items-center justify-end gap-1 mt-1">
                                  <button onClick={() => setDetailEditingComment(null)} className="px-2 py-1 text-[10px] text-[#667781] hover:text-[#111b21] dark:hover:text-white transition-colors">إلغاء</button>
                                  <button onClick={() => { const next = (detailTask.comments || []).map(x => x.id === c.id ? { ...x, text: detailEditingComment.text.trim() } : x); setDetailTask(t => t ? { ...t, comments: next } : t); setTasks(p => p.map(x => x.id === detailTask.id ? { ...x, comments: next } : x)); setDetailEditingComment(null); }} className="px-2 py-1 text-[10px] font-semibold text-[#008069] dark:text-[#00a884] hover:opacity-80 transition-opacity">حفظ</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {c.text && <div className="text-sm leading-[1.6] text-right whitespace-pre-wrap"><FormattedText text={c.text} /></div>}
                                {(c.attachments || []).length > 0 && (
                                  <div className={cn("flex flex-wrap gap-1.5", c.text ? "mt-1.5" : "")}>
                                    {(c.attachments || []).map(att => (
                                      att.type?.startsWith("image/") ? (
                                        <a key={att.id} href={att.url} download={att.name} className="block rounded-md overflow-hidden hover:opacity-90 transition-opacity">
                                          <img src={att.url} alt={att.name} className="w-32 h-28 object-cover" />
                                        </a>
                                      ) : att.type?.startsWith("video/") ? (
                                        <VideoThumbnail key={att.id} url={att.url} name={att.name} />
                                      ) : att.type?.startsWith("audio/") ? (
                                        <audio key={att.id} src={att.url} controls className="h-9 w-[230px] max-w-full" />
                                      ) : att.type === "application/pdf" ? (
                                        <div key={att.id} className="relative group w-[110px]">
                                          <a href={att.url} target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden hover:shadow-md transition-all">
                                            <PdfThumbnail url={att.url} name={att.name} />
                                            <div className="px-2 py-1 border-t border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700/30">
                                              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate block text-center">{att.name}</span>
                                            </div>
                                          </a>
                                          <a href={att.url} download={att.name} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-neutral-700 shadow-sm border border-neutral-200 dark:border-neutral-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="تحميل">
                                            <FileDown className="w-2.5 h-2.5 text-neutral-500" />
                                          </a>
                                        </div>
                                      ) : (
                                        <a key={att.id} href={att.url} download={att.name} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-black/5 dark:bg-white/5 text-[11px] hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                          <span className="w-7 h-7 rounded-full bg-[#00a884] flex items-center justify-center shrink-0"><FileText className="w-3.5 h-3.5 text-white" /></span>
                                          <span className="min-w-0">
                                            <span className="truncate max-w-[130px] block">{att.name}</span>
                                            <span className="text-[9px] text-[#667781] dark:text-[#8696a0]">{att.size}</span>
                                          </span>
                                        </a>
                                      )
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                            <div className="flex items-center justify-end gap-1 min-h-[14px] -mb-0.5">
                              {isMine && canEdit && !isEditing && (
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => setDetailEditingComment({ id: c.id, text: c.text })} className="p-0.5 rounded text-[#667781] hover:text-[#008069] transition-colors"><Pencil className="w-3 h-3" /></button>
                                  <button onClick={() => { const next = (detailTask.comments || []).filter(x => x.id !== c.id); setDetailTask(t => t ? { ...t, comments: next } : t); setTasks(p => p.map(x => x.id === detailTask.id ? { ...x, comments: next } : x)); }} className="p-0.5 rounded text-[#667781] hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                </div>
                              )}
                              <span className="text-[10px] text-[#667781] dark:text-[#8696a0]">{c.date}</span>
                              {isMine && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                            </div>
                          </div>
                          {isMine && <img src={avatarUrl(detailTask.assignee)} alt={detailTask.assignee} className="w-8 h-8 rounded-full object-cover shrink-0 shadow-sm ring-1 ring-black/5" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Comment input */}
                  <div className="shrink-0 bg-[#FAFCFF] dark:bg-[#202c33] px-2.5 py-2 border-t border-black/5 dark:border-white/5">
                    {detailVoiceError && (
                      <div className="mb-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-[11px] text-red-600 dark:text-red-300 flex items-center justify-between gap-2">
                        <span>{detailVoiceError}</span>
                        <button onClick={() => setDetailVoiceError("")}><X className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                    {detailCommentAttachments.length > 0 && (
                      <div className="flex gap-2 mb-2 overflow-x-auto scrollbar-hide pb-0.5">
                        {detailCommentAttachments.map(att => (
                          <div key={att.id} className="relative shrink-0 w-[150px] h-[54px] flex items-center gap-2 px-2 rounded-lg bg-white dark:bg-[#111b21] border border-black/5 dark:border-white/5 shadow-sm text-[10px]">
                            {att.type?.startsWith("image/") ? (
                              <img src={att.url} alt="" className="w-10 h-10 rounded-md object-cover shrink-0" />
                            ) : att.type?.startsWith("audio/") ? (
                              <span className="w-10 h-10 rounded-full bg-[#e7fce3] dark:bg-[#005c4b] flex items-center justify-center shrink-0"><Mic className="w-4 h-4 text-[#008069] dark:text-[#00a884]" /></span>
                            ) : (
                              <span className="w-10 h-10 rounded-md bg-[#e9edef] dark:bg-[#2a3942] flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-[#667781] dark:text-[#aebac1]" /></span>
                            )}
                            <span className="min-w-0">
                              <span className="text-[#111b21] dark:text-[#e9edef] truncate block">{att.name}</span>
                              <span className="text-[#667781] dark:text-[#8696a0]">{att.size}</span>
                            </span>
                            <button onClick={() => setDetailCommentAttachments(p => p.filter(a => a.id !== att.id))} className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-[#54656f] text-white flex items-center justify-center shadow"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    {detailVoiceRecording && (
                      <div className="mb-2 h-8 px-3 rounded-lg bg-white dark:bg-[#111b21] flex items-center gap-2 text-[11px] text-[#667781] dark:text-[#aebac1]">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span>جارٍ تسجيل رسالة صوتية</span>
                        <span dir="ltr" className="font-mono ms-auto">{String(Math.floor(detailVoiceSeconds / 60)).padStart(2, "0")}:{String(detailVoiceSeconds % 60).padStart(2, "0")}</span>
                      </div>
                    )}
                    <div className="relative flex items-end gap-2">
                      <FloatingTextFormatter
                        visible={textFormatSelection === "detail-comment"}
                        onFormat={applyTextFormat}
                        className="right-14 bottom-full mb-2"
                      />
                      <div className="flex items-end flex-1 min-w-0 bg-white dark:bg-[#2a3942] rounded-lg shadow-sm px-1 min-h-[44px]">
                        <button
                          onClick={() => { setDetailEmojiOpen(open => !open); setDetailAttachmentMenuOpen(false); }}
                          className={cn("p-2.5 rounded-full transition-colors shrink-0 mb-0.5", detailEmojiOpen ? "text-[#00a884]" : "text-[#54656f] dark:text-[#aebac1] hover:text-[#008069]")}
                          aria-label="الرموز التعبيرية"
                          title="الرموز التعبيرية"
                        >
                          <Smile className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => { setDetailAttachmentMenuOpen(open => !open); setDetailEmojiOpen(false); }}
                          className={cn("p-2.5 rounded-full transition-all shrink-0 mb-0.5", detailAttachmentMenuOpen ? "text-[#00a884] rotate-45" : "text-[#54656f] dark:text-[#aebac1] hover:text-[#008069]")}
                          aria-label="إرفاق"
                          title="إرفاق"
                        >
                          <Paperclip className="w-5 h-5" />
                        </button>
                        <RichTextEditor
                          editorRef={detailCommentTextareaRef}
                          value={detailComment}
                          onChange={(html, plainText, cursorOffset) => { setDetailComment(html); setDetailMention(getMentionContext(plainText, cursorOffset)); }}
                          onSelectionChange={editor => captureTextSelection("detail-comment", editor)}
                          onBlur={nextFocus => handleTextFormattingBlur("detail-comment", nextFocus)}
                          onKeyDown={e => {
                            if (e.key === "Escape") { setDetailMention(null); setDetailEmojiOpen(false); setDetailAttachmentMenuOpen(false); return; }
                            if (e.key === "Enter" && !e.shiftKey && (hasRichTextContent(detailComment) || detailCommentAttachments.length > 0)) {
                              e.preventDefault();
                              sendDetailComment();
                            }
                          }}
                          placeholder="اكتب رسالة"
                          wrapperClassName="flex-1 min-w-0"
                          placeholderClassName="top-3 px-1.5 text-base sm:text-sm"
                          className="w-full min-h-[42px] max-h-32 overflow-y-auto px-1.5 py-3 bg-transparent text-base sm:text-sm leading-5 text-[#111b21] dark:text-[#e9edef] focus:outline-none text-right whitespace-pre-wrap"
                        />
                        {!hasRichTextContent(detailComment) && detailCommentAttachments.length === 0 && (
                          <button onClick={() => detailCameraInputRef.current?.click()} className="p-2.5 rounded-full text-[#54656f] dark:text-[#aebac1] hover:text-[#008069] transition-colors shrink-0 mb-0.5" aria-label="الكاميرا" title="الكاميرا"><Camera className="w-5 h-5" /></button>
                        )}
                      </div>
                      {hasRichTextContent(detailComment) || detailCommentAttachments.length > 0 ? (
                        <button onClick={sendDetailComment} className="w-11 h-11 rounded-full bg-[#00a884] hover:bg-[#008f72] text-white flex items-center justify-center shadow-sm transition-colors shrink-0" aria-label="إرسال" title="إرسال">
                          <Send className="w-5 h-5 rtl:-rotate-180" />
                        </button>
                      ) : detailVoiceRecording ? (
                        <button onClick={toggleDetailVoiceRecording} className="w-11 h-11 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-sm transition-colors shrink-0" aria-label="إيقاف التسجيل" title="إيقاف التسجيل">
                          <Square className="w-4 h-4 fill-current" />
                        </button>
                      ) : (
                        <button onClick={toggleDetailVoiceRecording} className="w-11 h-11 rounded-full bg-[#00a884] hover:bg-[#008f72] text-white flex items-center justify-center shadow-sm transition-colors shrink-0" aria-label="تسجيل رسالة صوتية" title="تسجيل رسالة صوتية">
                          <Mic className="w-5 h-5" />
                        </button>
                      )}

                      {/* Attachment actions */}
                      <AnimatePresence>
                        {detailAttachmentMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 8 }}
                            className="absolute bottom-full right-10 mb-3 z-50 w-[210px] rounded-xl bg-white dark:bg-[#233138] shadow-xl border border-black/5 dark:border-white/5 py-2 overflow-hidden"
                          >
                            <button onClick={() => { setDetailAttachmentMenuOpen(false); detailFileInputRef.current?.click(); }} className="w-full px-3 py-2.5 flex items-center gap-3 text-xs text-[#111b21] dark:text-[#e9edef] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                              <span className="w-9 h-9 rounded-full bg-[#7f66ff] flex items-center justify-center"><FileText className="w-4 h-4 text-white" /></span>
                              مستند
                            </button>
                            <button onClick={() => { setDetailAttachmentMenuOpen(false); detailMediaInputRef.current?.click(); }} className="w-full px-3 py-2.5 flex items-center gap-3 text-xs text-[#111b21] dark:text-[#e9edef] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                              <span className="w-9 h-9 rounded-full bg-[#007bfc] flex items-center justify-center"><ImageIcon className="w-4 h-4 text-white" /></span>
                              الصور والفيديو
                            </button>
                            <button onClick={() => { setDetailAttachmentMenuOpen(false); detailCameraInputRef.current?.click(); }} className="w-full px-3 py-2.5 flex items-center gap-3 text-xs text-[#111b21] dark:text-[#e9edef] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                              <span className="w-9 h-9 rounded-full bg-[#ff2e74] flex items-center justify-center"><Camera className="w-4 h-4 text-white" /></span>
                              الكاميرا
                            </button>
                            <button onClick={() => { setDetailAttachmentMenuOpen(false); setVideoRecorderTarget("detail"); }} className="w-full px-3 py-2.5 flex items-center gap-3 text-xs text-[#111b21] dark:text-[#e9edef] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                              <span className="w-9 h-9 rounded-full bg-[#00a884] flex items-center justify-center"><Video className="w-4 h-4 text-white" /></span>
                              تسجيل فيديو
                            </button>
                            <button onClick={() => { const start = detailComment.length; setDetailComment(value => `${value}${value && !value.endsWith(" ") ? " " : ""}@`); setDetailMention({ query: "", startIndex: start + (detailComment && !detailComment.endsWith(" ") ? 1 : 0) }); setDetailAttachmentMenuOpen(false); }} className="w-full px-3 py-2.5 flex items-center gap-3 text-xs text-[#111b21] dark:text-[#e9edef] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                              <span className="w-9 h-9 rounded-full bg-[#009de2] flex items-center justify-center"><AtSign className="w-4 h-4 text-white" /></span>
                              الإشارة إلى شخص
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Emoji picker */}
                      <AnimatePresence>
                        {detailEmojiOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 8 }}
                            className="absolute bottom-full right-0 mb-3 z-50 w-[260px] rounded-xl bg-white dark:bg-[#233138] shadow-xl border border-black/5 dark:border-white/5 p-3"
                          >
                            <p className="text-[10px] font-semibold text-[#667781] dark:text-[#8696a0] mb-2">الرموز المستخدمة غالبًا</p>
                            <div className="grid grid-cols-8 gap-1">
                              {["😀","😂","😍","👍","👏","🙏","❤️","🔥","🎉","✅","💡","📌","👌","🤝","💪","😊","😅","😎","🤔","👀","💯","⭐","🚀","📎"].map(emoji => (
                                <button key={emoji} onClick={() => setDetailComment(value => value + emoji)} className="w-7 h-7 rounded hover:bg-black/5 dark:hover:bg-white/5 text-lg flex items-center justify-center transition-colors">{emoji}</button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {detailMention && (
                        <div className="absolute left-12 right-12 bottom-full mb-3 z-[60] bg-white dark:bg-[#233138] border border-black/5 dark:border-white/5 rounded-xl shadow-xl py-1 max-h-[190px] overflow-y-auto">
                          {MENTION_OPTIONS.filter(o => o.label.toLowerCase().includes(detailMention.query.toLowerCase())).length === 0 ? (
                            <p className="px-3 py-2 text-xs text-[#667781] dark:text-[#8696a0] text-right">لا توجد نتائج</p>
                          ) : (
                            MENTION_OPTIONS.filter(o => o.label.toLowerCase().includes(detailMention.query.toLowerCase())).map(o => (
                              <button key={o.id} onMouseDown={event => event.preventDefault()} onClick={() => { insertTextAtRichSelection("detail-comment", `@${o.label} `, detailMention.query.length + 1); setDetailMention(null); }} className="w-full px-3 py-2 text-xs text-[#111b21] dark:text-[#e9edef] text-right flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", o.type === "person" ? "bg-blue-50 text-blue-600" : o.type === "team" ? "bg-emerald-50 text-emerald-600" : o.type === "department" ? "bg-amber-50 text-amber-600" : "bg-violet-50 text-violet-600")}>{o.type === "person" ? "شخص" : o.type === "team" ? "فريق" : o.type === "department" ? "قسم" : "لجنة"}</span>
                                {o.label}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                      <input ref={detailFileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" className="hidden" onChange={async event => { await addDetailFiles(event.target.files); event.target.value = ""; }} />
                      <input ref={detailMediaInputRef} type="file" multiple accept="image/*,video/*,audio/*" className="hidden" onChange={async event => { await addDetailFiles(event.target.files); event.target.value = ""; }} />
                      <input ref={detailCameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={async event => { await addDetailFiles(event.target.files); event.target.value = ""; }} />
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
              onClick={() => closeForm()}
            />
            <motion.div
              key="task-form"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="fixed inset-0 sm:inset-8 lg:inset-12 z-[70] bg-[#FAFCFF] dark:bg-neutral-900 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden max-w-[1320px] mx-auto"
              dir="rtl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3 sm:px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-[#FAFCFF] dark:bg-neutral-900 shrink-0">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 shrink-0">
                    <span className="px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700 text-[11px] font-medium bg-white dark:bg-neutral-800">{editing ? "تعديل المهمة" : "مهمة جديدة"}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={cn("hidden sm:flex items-center gap-1 text-xs", formIsDirty ? "text-amber-600" : "text-neutral-400")}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", formIsDirty ? "bg-amber-500" : "bg-teal-500")} />
                    {formIsDirty ? "تغييرات غير محفوظة" : editing ? "لا توجد تغييرات" : "مسودة جديدة"}
                  </span>
                  <button onClick={() => closeForm()} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500 transition-colors" aria-label="إغلاق">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mobile tabs */}
              <div className="flex sm:hidden border-b border-neutral-100 dark:border-neutral-800 bg-[#FAFCFF] dark:bg-neutral-900 shrink-0">
                <button onClick={() => setFormMobileTab("details")} className={cn("flex-1 py-2.5 text-xs font-bold transition-colors", formMobileTab === "details" ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-500" : "text-neutral-500 dark:text-neutral-400")}>المهمة</button>
                <button onClick={() => setFormMobileTab("activity")} className={cn("flex-1 py-2.5 text-xs font-bold transition-colors", formMobileTab === "activity" ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-500" : "text-neutral-500 dark:text-neutral-400")}>النشاط والتعليقات</button>
              </div>

              {/* Body - task details on the right / activity on the left */}
              <div className="relative flex-1 overflow-hidden flex flex-col sm:flex-row">
                {/* Mobile dropdown backdrop */}
                {formDropdown && (
                  <div
                    className="sm:hidden fixed inset-0 z-[75] bg-black/30 backdrop-blur-[1px]"
                    onClick={() => setFormDropdown(null)}
                  />
                )}
                <button
                  type="button"
                  onClick={() => setFormPanelCollapsed(value => !value)}
                  className={cn(
                    "hidden sm:flex absolute top-1/2 -translate-y-1/2 z-30 w-8 h-12 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700 bg-[#FAFCFF] dark:bg-[#202c33] text-[#54656f] dark:text-[#aebac1] shadow-[0_4px_14px_rgba(15,23,42,0.14)] hover:text-[#008069] hover:border-[#00a884]/40 transition-all",
                    formPanelCollapsed ? "right-3" : "left-[55%] -translate-x-1/2"
                  )}
                  aria-label={formPanelCollapsed ? "إظهار تفاصيل المهمة" : "إخفاء تفاصيل المهمة"}
                  title={formPanelCollapsed ? "إظهار تفاصيل المهمة" : "إخفاء تفاصيل المهمة"}
                >
                  {formPanelCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
                {/* Main content - right 45% */}
                <div className={cn(
                  "min-w-0 flex-1 sm:flex-none bg-[#F9FBFF] dark:bg-neutral-900 transition-[width] duration-300",
                  formDropdown ? "overflow-visible max-sm:overflow-y-auto" : "overflow-y-auto",
                  formMobileTab === "activity" ? "hidden sm:block" : "",
                  formPanelCollapsed ? "sm:!hidden" : "sm:w-[45%]"
                )}>
                  <div className="p-3 sm:p-5 space-y-4 sm:space-y-5" dir="rtl">
                    {/* Title */}
                    <div>
                      <label htmlFor="task-form-title" className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">عنوان المهمة <span className="text-red-500">*</span></label>
                      <input
                        id="task-form-title"
                        value={form.title || ""}
                        onChange={e => { setForm(current => ({ ...current, title: e.target.value })); if (formErrors.title) setFormErrors({}); }}
                        className={cn("w-full text-base font-bold text-neutral-900 dark:text-white bg-white dark:bg-neutral-800 focus:outline-none text-right placeholder:text-neutral-400 placeholder:font-bold placeholder:text-sm transition-all rounded-lg px-3 py-2.5 border", formErrors.title ? "border-red-400 ring-2 ring-red-100" : "border-neutral-200 dark:border-neutral-700 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/30")}
                        placeholder="اكتب عنوانًا واضحًا للمهمة"
                        autoFocus
                        aria-invalid={Boolean(formErrors.title)}
                        aria-describedby={formErrors.title ? "task-form-title-error" : undefined}
                      />
                      {formErrors.title && <p id="task-form-title-error" className="mt-1.5 text-xs text-red-500">{formErrors.title}</p>}
                    </div>

                    {/* Description */}
                    <div className="relative">
                      <label htmlFor="task-form-description" className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">الوصف</label>
                      <FloatingTextFormatter
                        visible={textFormatSelection === "task-description"}
                        onFormat={applyTextFormat}
                        className="right-0 bottom-full mb-1"
                      />
                      <RichTextEditor
                        editorRef={taskDescriptionRef}
                        id="task-form-description"
                        value={form.description || ""}
                        onChange={html => setForm(f => ({ ...f, description: html }))}
                        onSelectionChange={editor => captureTextSelection("task-description", editor)}
                        onBlur={nextFocus => handleTextFormattingBlur("task-description", nextFocus)}
                        className="w-full min-h-[60px] text-sm leading-6 text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-800 focus:outline-none text-right whitespace-pre-wrap rounded-lg px-3 py-2.5 border border-neutral-200 dark:border-neutral-700"
                        placeholder="اشرح المطلوب والنتيجة المتوقعة..."
                      />
                    </div>

                    {/* Quick action pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 overflow-visible" ref={setFormDropdownRef}>
                  {/* Status Pill */}
                  {editing && (
                  <div className="relative overflow-visible">
                    <button onClick={() => setFormDropdown(d => d === "status" ? null : "status")} className={cn("flex h-9 w-full items-center justify-between gap-2 px-3 rounded-lg border text-sm font-medium transition-colors", formDropdown === "status" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                      <span className={cn("w-2 h-2 rounded-full shrink-0", STATUS_CONFIG[form.status || "todo"].headerDot)} />
                      <span className="text-neutral-400 dark:text-neutral-500 font-normal shrink-0">الحالة:</span>
                      <span className="truncate max-w-[120px] text-neutral-700 dark:text-neutral-200">{STATUS_CONFIG[form.status || "todo"].label}</span>
                      <ChevronDown className={cn("w-3 h-3 transition-transform shrink-0 text-neutral-400", formDropdown === "status" ? "rotate-180" : "")} />
                    </button>
                    {formDropdown === "status" && (
                      <div className="absolute right-0 top-full mt-1 z-[60] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-1.5 min-w-[160px] max-sm:fixed max-sm:left-2 max-sm:right-2 max-sm:top-auto max-sm:bottom-2 max-sm:z-[80] max-sm:min-w-0 max-sm:max-h-[50vh] max-sm:overflow-y-auto max-sm:shadow-2xl">
                        <p className="text-xs font-semibold text-neutral-400 px-3 py-1.5">الحالة</p>
                        {(["todo","in-progress","in-review","completed","overdue"] as TaskStatus[]).map(s => (
                          <button key={s} onClick={() => { setForm(f => ({ ...f, status: s })); setFormTouched(t => new Set([...t, "status"])); setFormDropdown(null); }} className={cn("w-full px-4 py-2 text-sm text-right flex items-center gap-2 rounded-lg transition-colors", (form.status || "todo") === s ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50")}>
                            <span className={cn("w-2 h-2 rounded-full shrink-0", STATUS_CONFIG[s].headerDot)} />
                            {STATUS_CONFIG[s].label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  )}

                  {/* Assignee Pill */}
                  <div className="relative min-w-0 overflow-visible" ref={assignDropdownRef}>
                    <div className="flex h-9 w-full items-center justify-between gap-2 px-3 rounded-lg border text-sm font-medium transition-colors bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60">
                      <button onClick={() => { setFormDropdown(d => d === "assignee" ? null : "assignee"); setAssignStep("mode"); setAssignSearch(""); }} className="flex min-w-0 flex-1 items-center justify-between gap-2">
                        <span className="text-neutral-400 dark:text-neutral-500 font-normal shrink-0">الإسناد:</span>
                        <span className="min-w-0 flex-1 truncate text-neutral-700 dark:text-neutral-200">
                          {form.assignMode === "team" ? (form.assignTarget || "فريق غير محدد") :
                            form.assignMode === "department" ? (form.assignTarget || "قسم غير محدد") :
                            form.assignMode === "committee" ? (form.assignTarget || "لجنة غير محددة") :
                            (form.assignMembers && form.assignMembers.length > 0
                              ? form.assignMembers.length > 1
                                ? `${form.assignMembers[0]} و${form.assignMembers.length - 1} ${form.assignMembers.length - 1 === 1 ? "موظف" : "موظفين"}`
                                : form.assignMembers[0]
                              : (form.assignee || "اختر موظف"))}
                        </span>
                        <ChevronDown className={cn("w-3 h-3 transition-transform shrink-0 text-neutral-400", formDropdown === "assignee" ? "rotate-180" : "")} />
                      </button>
                      {((form.assignMembers && form.assignMembers.length > 0) || form.assignee || form.assignTarget) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setForm(f => ({ ...f, assignMode: undefined, assignee: "", assignTarget: undefined, assignMembers: [] }));
                            setFormTouched(t => new Set([...t, "assignee"]));
                            setFormDropdown(null);
                          }}
                          className="shrink-0 rounded-full p-0.5 text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                          title="إزالة الإسناد"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {formDropdown === "assignee" && (
                      <div className="absolute right-0 top-full mt-2 z-[60] flex min-w-[300px] max-h-[420px] flex-col overflow-hidden rounded-xl border border-indigo-100 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.14)] dark:border-neutral-600 dark:bg-neutral-800 max-sm:fixed max-sm:left-2 max-sm:right-2 max-sm:top-auto max-sm:bottom-2 max-sm:z-[80] max-sm:min-w-0 max-sm:max-h-[50vh] max-sm:overflow-y-auto max-sm:shadow-2xl">
                        {/* Search header for lists */}
                        {(assignStep === "list" || assignStep === "members") && (
                          <div className="p-2.5 border-b border-gray-100 dark:border-neutral-700">
                            <div className="relative">
                              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                              <input
                                autoFocus
                                value={assignSearch}
                                onChange={(e) => setAssignSearch(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && assignStep === "members" && form.assignMode === "me" && assignSearch.trim() && !assigneesList.some(a => a.toLowerCase() === assignSearch.trim().toLowerCase())) {
                                    const name = assignSearch.trim();
                                    setAssigneesList(p => [...p, name]);
                                    setForm(f => { const next = [...(f.assignMembers || []), name]; return { ...f, assignMembers: next, assignee: next[0] }; });
                                    setAssignSearch("");
                                  }
                                }}
                                placeholder={assignStep === "members" && form.assignMode === "me" ? "ابحث أو اكتب اسم موظف جديد..." : "بحث..."}
                                className="h-9 w-full rounded-lg border border-neutral-200 bg-white py-1.5 ps-3 pe-8 text-xs outline-none transition-shadow focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-neutral-600 dark:bg-neutral-900 dark:focus:ring-indigo-900/30"
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex-1 overflow-y-auto">
                        {/* Step 1: Choose mode */}
                        {assignStep === "mode" && (
                          <div className="p-2">
                            <div className="flex items-center justify-between px-3 py-2">
                              <p className="text-xs font-semibold text-neutral-400">الاسناد إلى</p>
                              {((form.assignMembers && form.assignMembers.length > 0) || form.assignee || form.assignTarget) && (
                                <button
                                  onClick={() => { setForm(f => ({ ...f, assignMode: undefined, assignee: "", assignTarget: undefined, assignMembers: [] })); setFormTouched(t => new Set([...t, "assignee"])); setFormDropdown(null); }}
                                  className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 font-medium transition-colors flex items-center gap-1"
                                >
                                  <X className="w-3 h-3" />
                                  إزالة الإسناد
                                </button>
                              )}
                            </div>
                            {((form.assignMembers && form.assignMembers.length > 0) || form.assignee) && (
                              <div className="flex flex-wrap items-center gap-1.5 px-3 pb-2">
                                <span className="text-[10px] font-semibold text-neutral-400 shrink-0">المسند لهم:</span>
                                {(form.assignMembers && form.assignMembers.length > 0 ? form.assignMembers : form.assignee ? [form.assignee] : []).map(m => (
                                  <span key={m} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:text-indigo-300">
                                    <img src={avatarUrl(m)} alt={m} className="h-3.5 w-3.5 rounded-full object-cover" />
                                    {m}
                                  </span>
                                ))}
                              </div>
                            )}
                            <button onClick={() => { setForm(f => ({ ...f, assignMode: "me", assignee: CURRENT_USER_NAME, assignTarget: undefined, assignMembers: [CURRENT_USER_NAME] })); setFormTouched(t => new Set([...t, "assignee"])); setFormDropdown(null); }} className={cn("w-full px-3 py-2.5 text-sm text-right hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-2", form.assignMode === "me" && form.assignMembers?.includes(CURRENT_USER_NAME) ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-gray-700 dark:text-gray-200")}>
                              <img src={avatarUrl(CURRENT_USER_NAME)} alt={CURRENT_USER_NAME} className="h-6 w-6 rounded-full object-cover" />
                              إسناد المهمة لي
                            </button>
                            <button onClick={() => { setForm(f => ({ ...f, assignMode: "me", assignee: undefined, assignTarget: undefined })); setFormTouched(t => new Set([...t, "assignee"])); setAssignStep("members"); setAssignSearch(""); }} className={cn("w-full px-3 py-2.5 text-sm text-right hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg transition-colors", form.assignMode === "me" && !form.assignMembers?.includes(CURRENT_USER_NAME) ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-gray-700 dark:text-gray-200")}>
                              إسناد المهمة لموظف
                            </button>
                            <button onClick={() => { setForm(f => ({ ...f, assignMode: "team", assignee: "فريق", assignTarget: undefined })); setFormTouched(t => new Set([...t, "assignee"])); setAssignStep("list"); setAssignSearch(""); }} className={cn("w-full px-3 py-2.5 text-sm text-right hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg transition-colors", form.assignMode === "team" ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-gray-700 dark:text-gray-200")}>
                              إسناد المهمة لفريق
                            </button>
                            <button onClick={() => { setForm(f => ({ ...f, assignMode: "department", assignee: "قسم", assignTarget: undefined })); setFormTouched(t => new Set([...t, "assignee"])); setAssignStep("list"); setAssignSearch(""); }} className={cn("w-full px-3 py-2.5 text-sm text-right hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg transition-colors", form.assignMode === "department" ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-gray-700 dark:text-gray-200")}>
                              إسناد المهمة لقسم
                            </button>
                            <button onClick={() => { setForm(f => ({ ...f, assignMode: "committee", assignee: "لجنة", assignTarget: undefined })); setFormTouched(t => new Set([...t, "assignee"])); setAssignStep("list"); setAssignSearch(""); }} className={cn("w-full px-3 py-2.5 text-sm text-right hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg transition-colors", form.assignMode === "committee" ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-gray-700 dark:text-gray-200")}>
                              إسناد المهمة للجنة
                            </button>
                          </div>
                        )}
                        {/* Step 2: Choose list item (team/dept/committee) */}
                        {assignStep === "list" && form.assignMode && form.assignMode !== "me" && (
                          <div className="p-2">
                            <button onClick={() => setAssignStep("mode")} className="text-xs text-gray-500 dark:text-neutral-400 hover:text-gray-600 px-3 py-1 mb-1 flex items-center gap-1">← رجوع</button>
                            <p className="text-xs font-semibold text-gray-400 px-3 py-2">{form.assignMode === "team" ? "اختر الفريق" : form.assignMode === "department" ? "اختر القسم" : "اختر اللجنة"}</p>
                            {(form.assignMode === "team" ? TEAMS : form.assignMode === "department" ? DEPARTMENTS : COMMITTEES)
                              .filter(item => item.name.toLowerCase().includes(assignSearch.toLowerCase()))
                              .map(item => (
                              <button key={item.name} onClick={() => { setForm(f => ({ ...f, assignTarget: item.name })); setFormTouched(t => new Set([...t, "assignee"])); setAssignStep("members"); setAssignSearch(""); }} className={cn("w-full px-3 py-2.5 text-sm text-right hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg transition-colors", form.assignTarget === item.name ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-gray-700 dark:text-gray-200")}>
                                {item.name}
                              </button>
                            ))}
                          </div>
                        )}
                        {/* Step 3: Choose members */}
                        {assignStep === "members" && (
                          <div className="p-2">
                            <button onClick={() => { if (form.assignMode === "me") setAssignStep("mode"); else setAssignStep("list"); setAssignSearch(""); }} className="text-xs text-gray-500 dark:text-neutral-400 hover:text-gray-600 px-3 py-1 mb-1 flex items-center gap-1">← رجوع</button>
                            {form.assignMode !== "me" && form.assignTarget && (
                              <>
                                <div className="flex items-center justify-between px-3 py-2">
                                  <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">{form.assignTarget}</p>
                                  <span className="text-[10px] text-neutral-400">{(form.assignMembers || []).length} محدد</span>
                                </div>
                                {/* Head */}
                                {(() => {
                                  const list = form.assignMode === "team" ? TEAMS : form.assignMode === "department" ? DEPARTMENTS : COMMITTEES;
                                  const item = list.find(i => i.name === form.assignTarget);
                                  if (!item || form.assignMode === "team" || !("head" in item)) return null;
                                  const head = (item as any).head;
                                  if (assignSearch && !head.toLowerCase().includes(assignSearch.toLowerCase())) return null;
                                  return (
                                    <div className="px-1 pb-1">
                                      <p className="text-[10px] font-semibold text-neutral-400 px-2 py-1">القائد</p>
                                      <button 
                                        onClick={() => { 
                                          setForm(f => {
                                            const current = f.assignMembers || [];
                                            const next = current.includes(head) ? current.filter(x => x !== head) : [...current, head];
                                            return { ...f, assignMembers: next };
                                          }); 
                                        }} 
                                        className={cn("group flex min-h-9 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-right transition-colors", (form.assignMembers || []).includes(head) ? "bg-indigo-50 text-neutral-800 font-medium dark:bg-indigo-900/20 dark:text-neutral-100" : "text-neutral-700 hover:bg-indigo-50/70 dark:text-neutral-200 dark:hover:bg-neutral-700")}
                                      >
                                        <span className="min-w-0 flex-1 truncate">{head}</span>
                                        <span className={cn("relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors", (form.assignMembers || []).includes(head) ? "border-indigo-500 bg-indigo-500" : "border-indigo-400 bg-white dark:bg-neutral-800")}>
                                          {(form.assignMembers || []).includes(head) && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                                        </span>
                                      </button>
                                    </div>
                                  );
                                })()}
                                <p className="text-[10px] font-semibold text-neutral-400 px-3 py-1 mt-1">الأعضاء</p>
                                {(() => {
                                  const list = form.assignMode === "team" ? TEAMS : form.assignMode === "department" ? DEPARTMENTS : COMMITTEES;
                                  const item = list.find(i => i.name === form.assignTarget);
                                  const members = item ? item.members : ASSIGNEES;
                                  return members
                                    .filter(m => m.toLowerCase().includes(assignSearch.toLowerCase()))
                                    .map(m => (
                                    <button 
                                      key={m} 
                                      onClick={() => { 
                                        setForm(f => {
                                          const current = f.assignMembers || [];
                                          const next = current.includes(m) ? current.filter(x => x !== m) : [...current, m];
                                          return { ...f, assignMembers: next };
                                        }); 
                                      }} 
                                      className={cn("group flex min-h-9 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-right transition-colors", (form.assignMembers || []).includes(m) ? "bg-indigo-50 text-neutral-800 font-medium dark:bg-indigo-900/20 dark:text-neutral-100" : "text-neutral-700 hover:bg-indigo-50/70 dark:text-neutral-200 dark:hover:bg-neutral-700")}
                                    >
                                      <span className="min-w-0 flex-1 truncate">{m}</span>
                                      <span className={cn("relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors", (form.assignMembers || []).includes(m) ? "border-indigo-500 bg-indigo-500" : "border-indigo-400 bg-white dark:bg-neutral-800")}>
                                        {(form.assignMembers || []).includes(m) && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                                      </span>
                                    </button>
                                  ));
                                })()}
                                <div className="px-2 pt-2 pb-1 sticky bottom-0 bg-white dark:bg-neutral-800 border-t border-gray-100 dark:border-neutral-700 mt-2">
                                  <button onClick={() => { setFormDropdown(null); setFormTouched(t => new Set([...t, "assignee"])); setAssignStep("mode"); }} className="w-full rounded-lg bg-black py-2 text-xs font-semibold text-white transition-colors hover:bg-neutral-800">تم</button>
                                </div>
                              </>
                            )}
                            {form.assignMode === "me" && (
                              <>
                                <div className="flex items-center justify-between px-3 py-2">
                                  <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">اختر الموظفين</p>
                                  <span className="text-[10px] text-neutral-400">{(form.assignMembers || []).length} محدد</span>
                                </div>
                                <p className="text-[10px] font-semibold text-neutral-400 px-3 py-1">الأعضاء</p>
                                {assigneesList
                                  .filter(a => a.toLowerCase().includes(assignSearch.toLowerCase()))
                                  .map(a => (
                                  <button 
                                    key={a} 
                                    onClick={() => { 
                                      setForm(f => {
                                        const current = f.assignMembers || [];
                                        const next = current.includes(a) ? current.filter(x => x !== a) : [...current, a];
                                        return { ...f, assignMembers: next, assignee: next.length > 0 ? next[0] : undefined };
                                      }); 
                                    }} 
                                    className={cn("group flex min-h-9 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-right transition-colors", (form.assignMembers || []).includes(a) ? "bg-indigo-50 text-neutral-800 font-medium dark:bg-indigo-900/20 dark:text-neutral-100" : "text-neutral-700 hover:bg-indigo-50/70 dark:text-neutral-200 dark:hover:bg-neutral-700")}
                                  >
                                    <span className="min-w-0 flex-1 truncate">{a}</span>
                                    <span className={cn("relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors", (form.assignMembers || []).includes(a) ? "border-indigo-500 bg-indigo-500" : "border-indigo-400 bg-white dark:bg-neutral-800")}>
                                      {(form.assignMembers || []).includes(a) && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                                    </span>
                                  </button>
                                ))}
                                {assignSearch.trim() && !assigneesList.some(a => a.toLowerCase() === assignSearch.trim().toLowerCase()) && (
                                  <button
                                    onClick={() => {
                                      const name = assignSearch.trim();
                                      setAssigneesList(p => [...p, name]);
                                      setForm(f => { const next = [...(f.assignMembers || []), name]; return { ...f, assignMembers: next, assignee: next[0] }; });
                                      setAssignSearch("");
                                    }}
                                    className="w-full px-3 py-2 text-sm text-right rounded-lg transition-colors flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 font-medium"
                                  >
                                    <Plus className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">إضافة الموظف "{assignSearch.trim()}"</span>
                                  </button>
                                )}
                                <div className="px-2 pt-2 pb-1 sticky bottom-0 bg-white dark:bg-neutral-800 border-t border-gray-100 dark:border-neutral-700 mt-2">
                                  <button onClick={() => { setFormDropdown(null); setFormTouched(t => new Set([...t, "assignee"])); setAssignStep("mode"); }} className="w-full rounded-lg bg-black py-2 text-xs font-semibold text-white transition-colors hover:bg-neutral-800">تم</button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Supervisor Pill */}
                  <div className="relative min-w-0 overflow-visible" ref={supervisorDropdownRef}>
                    <button onClick={() => { setFormDropdown(d => d === "supervisor" ? null : "supervisor"); setSupervisorSearch(""); }} className={cn("flex h-9 w-full items-center justify-between gap-2 px-3 rounded-lg border text-sm font-medium transition-colors", formDropdown === "supervisor" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                      <span className="text-neutral-400 dark:text-neutral-500 font-normal shrink-0">الإشراف:</span>
                      <span className="min-w-0 flex-1 truncate text-neutral-700 dark:text-neutral-200">
                        {form.supervisor || "اختر مشرفًا"}
                      </span>
                      <ChevronDown className={cn("w-3 h-3 transition-transform shrink-0 text-neutral-400", formDropdown === "supervisor" ? "rotate-180" : "")} />
                    </button>
                    {formDropdown === "supervisor" && (
                      <div className="absolute right-0 top-full mt-2 z-[60] flex min-w-[260px] max-h-[360px] flex-col overflow-hidden rounded-xl border border-indigo-100 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.14)] dark:border-neutral-600 dark:bg-neutral-800 max-sm:fixed max-sm:left-2 max-sm:right-2 max-sm:top-auto max-sm:bottom-2 max-sm:z-[80] max-sm:min-w-0 max-sm:max-h-[50vh] max-sm:overflow-y-auto max-sm:shadow-2xl">
                        <div className="p-2.5 border-b border-gray-100 dark:border-neutral-700">
                          <div className="relative">
                            <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                              autoFocus
                              value={supervisorSearch}
                              onChange={(e) => setSupervisorSearch(e.target.value)}
                              placeholder="ابحث عن موظف..."
                              className="h-9 w-full rounded-lg border border-neutral-200 bg-white py-1.5 ps-3 pe-8 text-xs outline-none transition-shadow focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-neutral-600 dark:bg-neutral-900 dark:focus:ring-indigo-900/30"
                            />
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                          {assigneesList
                            .filter(a => a.toLowerCase().includes(supervisorSearch.toLowerCase()))
                            .map(a => (
                              <button
                                key={a}
                                onClick={() => {
                                  setForm(f => ({ ...f, supervisor: a }));
                                  setFormTouched(t => new Set([...t, "supervisor"]));
                                  setFormDropdown(null);
                                }}
                                className={cn("group flex min-h-9 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-right transition-colors", form.supervisor === a ? "bg-indigo-50 text-neutral-800 font-medium dark:bg-indigo-900/20 dark:text-neutral-100" : "text-neutral-700 hover:bg-indigo-50/70 dark:text-neutral-200 dark:hover:bg-neutral-700")}
                              >
                                <img src={avatarUrl(a)} alt={a} className="h-6 w-6 rounded-full object-cover shrink-0" />
                                <span className="min-w-0 flex-1 truncate">{a}</span>
                                {form.supervisor === a && <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" strokeWidth={3} />}
                              </button>
                            ))
                          }
                          {form.supervisor && (
                            <button
                              onClick={() => {
                                setForm(f => ({ ...f, supervisor: "" }));
                                setFormTouched(t => new Set([...t, "supervisor"]));
                                setFormDropdown(null);
                              }}
                              className="w-full px-3 py-2 mt-1 text-sm text-right rounded-lg transition-colors text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 flex items-center gap-2"
                            >
                              <X className="w-3.5 h-3.5 shrink-0" />
                              <span>إزالة المشرف</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delivery date */}
                  <div className="relative min-w-0 overflow-visible">
                    <button onClick={() => setFormDropdown(d => d === "dueDate" ? null : "dueDate")} className={cn("flex h-9 w-full items-center gap-2 px-3 rounded-lg border text-sm font-medium transition-colors", formDropdown === "dueDate" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                      <CalendarIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="text-neutral-400 dark:text-neutral-500 font-normal shrink-0">الموعد:</span>
                      <span className="truncate max-w-[120px] text-neutral-700 dark:text-neutral-200">
                        {form.dueDate ? fmtDate(form.dueDate) : "حدد موعد"}
                      </span>
                      <ChevronDown className={cn("w-3 h-3 ms-auto transition-transform shrink-0 text-neutral-400", formDropdown === "dueDate" ? "rotate-180" : "")} />
                    </button>
                    {formDropdown === "dueDate" && (
                      <div className="absolute right-0 top-full mt-1.5 z-[60] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-3 min-w-[300px] max-sm:fixed max-sm:left-2 max-sm:right-2 max-sm:top-auto max-sm:bottom-2 max-sm:z-[80] max-sm:min-w-0 max-sm:max-h-[50vh] max-sm:overflow-y-auto max-sm:shadow-2xl">
                        <p className="text-xs font-semibold text-neutral-400 px-1 pb-2">تحديد موعد التسليم</p>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1.5 px-1">اختر تاريخ التسليم</p>
                            <input 
                              type="date" 
                              value={form.dueDate || ""}
                              onChange={e => { 
                                const val = e.target.value;
                                setForm(f => ({ ...f, dueDate: val }));
                                setFormTouched(t => new Set([...t, "dueDate"])); 
                              }} 
                              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900/50 px-3 py-2.5 text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-300" 
                              dir="ltr" 
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { label: "اليوم", val: today },
                              { label: "غداً", val: new Date(Date.now() + 86400000).toISOString().split("T")[0] },
                              { label: "بعد أسبوع", val: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0] },
                              { label: "بعد أسبوعين", val: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0] },
                            ].map(q => (
                              <button 
                                key={q.label} 
                                type="button"
                                onClick={() => { 
                                  setForm(f => ({ ...f, dueDate: q.val }));
                                  setFormTouched(t => new Set([...t, "dueDate"])); 
                                }} 
                                className="text-right px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 rounded-lg transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-600"
                              >
                                {q.label}
                              </button>
                            ))}
                          </div>
                          
                          <button 
                            type="button"
                            onClick={() => setFormDropdown(null)}
                            className="w-full py-2 text-xs font-bold text-white bg-neutral-900 dark:bg-neutral-700 rounded-xl mt-1 shadow-sm hover:brightness-110"
                          >
                            تأكيد موعد التسليم
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Priority Pill */}
                  <div className="relative overflow-visible">
                    <button onClick={() => setFormDropdown(d => d === "priority" ? null : "priority")} className={cn("flex h-9 w-full items-center gap-2 px-3 rounded-lg border text-sm font-medium transition-colors", formDropdown === "priority" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                      <Flag className={cn("w-4 h-4", form.priority ? PRIORITY_CONFIG[form.priority].flag : "text-neutral-400")} />
                      <span className="text-neutral-400 dark:text-neutral-500 font-normal shrink-0">الأولوية:</span>
                      <span className="truncate max-w-[120px] text-neutral-700 dark:text-neutral-200">{form.priority ? PRIORITY_CONFIG[form.priority].label : "اختر"}</span>
                      <ChevronDown className={cn("w-3 h-3 ms-auto transition-transform shrink-0 text-neutral-400", formDropdown === "priority" ? "rotate-180" : "")} />
                    </button>
                    {formDropdown === "priority" && (
                      <div className="absolute right-0 top-full mt-1 z-[60] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-1.5 min-w-[160px] max-sm:fixed max-sm:left-2 max-sm:right-2 max-sm:top-auto max-sm:bottom-2 max-sm:z-[80] max-sm:min-w-0 max-sm:max-h-[50vh] max-sm:overflow-y-auto max-sm:shadow-2xl">
                        <p className="text-xs font-semibold text-neutral-400 px-3 py-1.5">الأولوية</p>
                        {(["emergency","urgent","high","medium","low"] as TaskPriority[]).map(p => (
                          <button key={p} onClick={() => { setForm(f => ({ ...f, priority: p })); setFormTouched(t => new Set([...t, "priority"])); setFormDropdown(null); }} className={cn("w-full px-4 py-2 text-sm text-right flex items-center justify-between rounded-lg transition-colors", form.priority === p ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50")}>
                            <span>{PRIORITY_CONFIG[p].label}</span>
                            <Flag className={cn("w-4 h-4", PRIORITY_CONFIG[p].flag)} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Progress Pill */}
                {((form.assignMembers && form.assignMembers.length > 1) || (form.supervisor && !(form.assignMembers || []).includes(form.supervisor))) ? (
                  <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-3.5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
                            <Users className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">فريق المهمة</p>
                            <p className="text-xs text-neutral-400">{(() => {
                              const members = form.assignMembers || [];
                              const sup = form.supervisor && !members.includes(form.supervisor) ? 1 : 0;
                              const count = members.length + sup;
                              return `${count} ${count === 1 ? "موظف" : "موظفين"}`;
                            })()}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-neutral-100 pt-3 sm:grid-cols-2 md:grid-cols-3 dark:border-neutral-700">
                      {(() => {
                        const members = form.assignMembers || [];
                        const sup = form.supervisor && !members.includes(form.supervisor) ? [form.supervisor] : [];
                        const allMembers = [...members, ...sup];
                        return allMembers.map(m => {
                        const mp = (form.memberProgress || {})[m] ?? 0;
                        const isAssignee = members.includes(m);
                        const isSupervisor = form.supervisor === m;
                        return (
                          <div key={m} className={cn("min-w-0 space-y-2 rounded-xl border p-2.5 transition-colors", "border-neutral-100 bg-neutral-50/60 dark:border-neutral-700 dark:bg-neutral-900/40")}>
                            <div className="flex min-w-0 items-center gap-2">
                              <img src={avatarUrl(m)} alt={m} className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-white dark:ring-neutral-700" />
                              <div className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-neutral-800 dark:text-neutral-100">{m}</span>
                                <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                  {isAssignee && (
                                    <span className="inline-block rounded-full bg-indigo-100 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                                      معني
                                    </span>
                                  )}
                                  {isSupervisor && (
                                    <span className="inline-block rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                                      مشرف
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setForm(f => {
                                    if (isSupervisor && !isAssignee) {
                                      return { ...f, supervisor: "" };
                                    }
                                    const current = f.assignMembers || [];
                                    const next = current.filter(x => x !== m);
                                    const nextMp = { ...(f.memberProgress || {}) };
                                    delete nextMp[m];
                                    const supervisorCleared = f.supervisor === m ? "" : f.supervisor;
                                    return { ...f, assignMembers: next, assignee: next[0] || "", memberProgress: nextMp, progress: next.length > 0 ? Math.round(Object.values(nextMp).reduce((s, v) => s + v, 0) / next.length) : 0, supervisor: supervisorCleared };
                                  });
                                  setFormTouched(t => new Set([...t, "assignee"]));
                                }}
                                className="shrink-0 rounded-full p-1 text-neutral-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                                title="إزالة من الفريق"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {editing && (form.progressMode || "individual") === "individual" && <div className="flex min-w-0 items-center gap-2">
                              <input
                                type="range" min={0} max={100} value={mp}
                                onChange={e => {
                                  const val = parseInt(e.target.value);
                                  setForm(f => {
                                    const nextMp = { ...(f.memberProgress || {}), [m]: val };
                                    const members = f.assignMembers || [];
                                    const avg = members.length > 0 ? Math.round(members.reduce((s, x) => s + (nextMp[x] ?? 0), 0) / members.length) : val;
                                    return { ...f, memberProgress: nextMp, progress: avg };
                                  });
                                }}
                                className="progress-slider flex-1 min-w-0 cursor-pointer"
                              />
                              <span className="shrink-0 rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold tabular-nums text-teal-600 dark:bg-teal-900/20 dark:text-teal-400">{mp}%</span>
                            </div>}
                          </div>
                        );
                      });
                      })()
                    }
                    </div>
                  </div>
                ) : editing ? (
                  <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400">
                          <SlidersHorizontal className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">نسبة الإنجاز</span>
                      </div>
                      <span className="min-w-[46px] rounded-full bg-teal-50 px-2.5 py-1 text-center text-xs font-bold tabular-nums text-teal-700 dark:bg-teal-900/20 dark:text-teal-300">{form.progress ?? 0}%</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2" dir="ltr">
                      <span className="w-7 text-center text-[10px] tabular-nums text-neutral-400">0%</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={form.progress || 0}
                        onChange={e => setForm(f => ({ ...f, progress: parseInt(e.target.value) }))}
                        className="progress-slider min-w-0 flex-1 cursor-pointer"
                        aria-label="نسبة الإنجاز"
                      />
                      <span className="w-8 text-center text-[10px] tabular-nums text-neutral-400">100%</span>
                    </div>
                  </div>
                ) : null}

                {/* Additional Details — collapsible like subtasks and attachments */}
                <section className="space-y-3" aria-labelledby="task-extra-details-heading">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setFormExtraDetailsCollapsed(c => !c)}
                      className="flex items-center gap-2 group"
                      aria-expanded={!formExtraDetailsCollapsed}
                    >
                      <Layers className="w-4 h-4 text-neutral-400" />
                      <h3 id="task-extra-details-heading" className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 group-hover:text-[#5267ff] transition-colors">تفاصيل إضافية</h3>
                      <ChevronDown className={cn("w-3.5 h-3.5 text-neutral-400 transition-transform", formExtraDetailsCollapsed && "-rotate-90")} />
                    </button>
                    {((form.tags && form.tags.length > 0) || form.taskSource || form.projectName || (form.recurrence && form.recurrence.frequency !== "none")) && (
                      <span className="text-xs text-neutral-400">
                        {[
                          form.tags && form.tags.length > 0 && `${form.tags.length} وسوم`,
                          form.taskSource,
                          form.projectName,
                          form.recurrence && form.recurrence.frequency !== "none" && RECURRENCE_LABELS[form.recurrence.frequency],
                        ].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </div>

                  {!formExtraDetailsCollapsed && (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 overflow-visible" ref={setFormDropdownRef}>

                  {/* Tags Pill */}
                  <div className="relative overflow-visible">
                    <button onClick={() => { setFormDropdown(d => d === "tags" ? null : "tags"); setTagSearch(""); setNewTag(""); setShowAddTag(false); }} className={cn("flex h-9 w-full items-center gap-2 px-3 rounded-lg border text-sm font-medium transition-colors", formDropdown === "tags" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                      <span className="text-neutral-400 dark:text-neutral-500 font-normal shrink-0">الوسم:</span>
                      {(form.tags && form.tags.length > 0) ? (
                        <div className="flex items-center gap-1 min-w-0">
                          {form.tags.slice(0, 2).map(tag => {
                            const tc = getTagColor(tag, form.tagColors);
                            return <span key={tag} className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-medium truncate", tc.light)}>{tag}</span>;
                          })}
                          {form.tags.length > 2 && <span className="text-neutral-400 text-xs">+{form.tags.length - 2}</span>}
                        </div>
                      ) : <span className="truncate max-w-[120px] text-neutral-400">اختر الوسم</span>}
                      <ChevronDown className={cn("w-3 h-3 ms-auto transition-transform shrink-0 text-neutral-400", formDropdown === "tags" ? "rotate-180" : "")} />
                    </button>
                    {formDropdown === "tags" && (
                      <div className="absolute right-0 top-full mt-1 z-[60] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-3 min-w-[280px] max-sm:fixed max-sm:left-2 max-sm:right-2 max-sm:top-auto max-sm:bottom-2 max-sm:z-[80] max-sm:min-w-0 max-sm:max-h-[50vh] max-sm:overflow-y-auto max-sm:shadow-2xl">
                        <p className="text-xs font-semibold text-neutral-400 mb-2">الوسوم</p>
                        {/* Search */}
                        <div className="relative mb-2.5">
                          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input
                            autoFocus
                            value={tagSearch}
                            onChange={(e) => setTagSearch(e.target.value)}
                            placeholder="ابحث عن وسم..."
                            className="h-8 w-full rounded-lg border border-neutral-200 bg-white py-1.5 ps-3 pe-8 text-xs outline-none transition-shadow focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-neutral-600 dark:bg-neutral-900 dark:focus:ring-indigo-900/30"
                          />
                        </div>
                        {/* Tags list */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {allTagsList
                            .filter(t => !tagSearch || t.includes(tagSearch))
                            .map(tag => {
                              const tc = getTagColor(tag, form.tagColors);
                              const selected = (form.tags || []).includes(tag);
                              return (
                                <button
                                  key={tag}
                                  onClick={() => {
                                    const cur = form.tags || [];
                                    const next = cur.includes(tag) ? cur.filter(t => t !== tag) : [...cur, tag];
                                    setForm(f => ({ ...f, tags: next }));
                                    setFormTouched(t => new Set([...t, "tags"]));
                                  }}
                                  className={cn("px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1.5", selected ? cn(tc.bg, tc.text, "shadow-sm") : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600")}
                                >
                                  <span className={cn("w-1.5 h-1.5 rounded-full", selected ? "bg-white/70" : tc.dot)} />
                                  {tag}
                                </button>
                              );
                            })}
                          {allTagsList.filter(t => !tagSearch || t.includes(tagSearch)).length === 0 && (
                            <p className="text-xs text-neutral-400 py-1">لا توجد وسوم مطابقة</p>
                          )}
                        </div>
                        {/* Add new tag toggle */}
                        <div className="border-t border-neutral-100 dark:border-neutral-700 pt-2.5">
                          <button
                            onClick={() => setShowAddTag(s => !s)}
                            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                          >
                            <Plus className={cn("w-3.5 h-3.5 transition-transform", showAddTag && "rotate-45")} />
                            وسم جديد
                          </button>
                          {showAddTag && (
                            <div className="mt-2">
                              {/* Color picker */}
                              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                                {TAG_COLOR_PRESETS.map(c => (
                                  <button
                                    key={c.name}
                                    onClick={() => setNewTagColor(c.name)}
                                    className={cn("w-5 h-5 rounded-full transition-all", c.bg, newTagColor === c.name ? "ring-2 ring-offset-1 ring-neutral-400 dark:ring-offset-neutral-800 scale-110" : "hover:scale-110")}
                                    title={c.name}
                                  />
                                ))}
                              </div>
                              {/* Input + add button */}
                              <div className="flex items-center gap-1.5">
                                <input
                                  value={newTag}
                                  onChange={(e) => setNewTag(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && newTag.trim()) {
                                      const tag = newTag.trim();
                                      if (!allTagsList.includes(tag)) setAllTagsList(l => [...l, tag]);
                                      setForm(f => ({
                                        ...f,
                                        tags: [...(f.tags || []), tag],
                                        tagColors: { ...(f.tagColors || {}), [tag]: newTagColor },
                                      }));
                                      setFormTouched(t => new Set([...t, "tags"]));
                                      setNewTag("");
                                      setShowAddTag(false);
                                    }
                                  }}
                                  placeholder="اكتب اسم الوسم..."
                                  className="h-8 flex-1 rounded-lg border border-neutral-200 bg-white py-1.5 px-3 text-xs outline-none transition-shadow focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-neutral-600 dark:bg-neutral-900 dark:focus:ring-indigo-900/30"
                                />
                                <button
                                  onClick={() => {
                                    if (!newTag.trim()) return;
                                    const tag = newTag.trim();
                                    if (!allTagsList.includes(tag)) setAllTagsList(l => [...l, tag]);
                                    setForm(f => ({
                                      ...f,
                                      tags: [...(f.tags || []), tag],
                                      tagColors: { ...(f.tagColors || {}), [tag]: newTagColor },
                                    }));
                                    setFormTouched(t => new Set([...t, "tags"]));
                                    setNewTag("");
                                    setShowAddTag(false);
                                  }}
                                  className="h-8 px-3 rounded-lg bg-indigo-500 text-white text-xs font-medium hover:bg-indigo-600 transition-colors shrink-0"
                                >
                                  إضافة
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Source Pill */}
                  <div className="relative overflow-visible">
                    <button onClick={() => setFormDropdown(d => d === "source" ? null : "source")} className={cn("flex h-9 w-full items-center gap-2 px-3 rounded-lg border text-sm font-medium transition-colors", formDropdown === "source" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                      <span className="text-neutral-400 dark:text-neutral-500 font-normal shrink-0">المصدر:</span>
                      <span className="truncate max-w-[120px] text-neutral-700 dark:text-neutral-200">{form.taskSource || "اختر المصدر"}</span>
                      <ChevronDown className={cn("w-3 h-3 ms-auto transition-transform shrink-0 text-neutral-400", formDropdown === "source" ? "rotate-180" : "")} />
                    </button>
                    {formDropdown === "source" && (
                      <div className="absolute right-0 top-full mt-1 z-[60] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-1.5 min-w-[160px] max-sm:fixed max-sm:left-2 max-sm:right-2 max-sm:top-auto max-sm:bottom-2 max-sm:z-[80] max-sm:min-w-0 max-sm:max-h-[50vh] max-sm:overflow-y-auto max-sm:shadow-2xl">
                        <p className="text-xs font-semibold text-neutral-400 px-3 py-1.5">المصدر</p>
                        {SOURCES.map(s => (
                          <button key={s} onClick={() => { setForm(f => ({ ...f, taskSource: s })); setFormTouched(t => new Set([...t, "source"])); setFormDropdown(null); }} className={cn("w-full px-4 py-2 text-sm text-right rounded-lg transition-colors", form.taskSource === s ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50")}>
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Project Pill */}
                  <div className="relative overflow-visible">
                    <button onClick={() => { setFormDropdown(d => d === "project" ? null : "project"); setProjectSearch(""); }} className={cn("flex h-9 w-full items-center gap-2 px-3 rounded-lg border text-sm font-medium transition-colors", formDropdown === "project" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                      <span className="text-neutral-400 dark:text-neutral-500 font-normal shrink-0">المشروع:</span>
                      <span className="truncate max-w-[150px] text-neutral-700 dark:text-neutral-200">{form.projectName || "حدد المشروع"}</span>
                      <ChevronDown className={cn("w-3 h-3 ms-auto transition-transform shrink-0 text-neutral-400", formDropdown === "project" ? "rotate-180" : "")} />
                    </button>
                    {formDropdown === "project" && (
                      <div className="absolute right-0 top-full mt-2 z-[60] flex min-w-[300px] max-h-[420px] flex-col overflow-hidden rounded-xl border border-indigo-100 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.14)] dark:border-neutral-600 dark:bg-neutral-800 max-sm:fixed max-sm:left-2 max-sm:right-2 max-sm:top-auto max-sm:bottom-2 max-sm:z-[80] max-sm:min-w-0 max-sm:max-h-[50vh] max-sm:overflow-y-auto max-sm:shadow-2xl">
                        <div className="p-2.5 border-b border-gray-100 dark:border-neutral-700">
                          <div className="relative">
                            <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                              autoFocus
                              value={projectSearch}
                              onChange={(e) => setProjectSearch(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && projectSearch.trim()) {
                                  const name = projectSearch.trim();
                                  if (!projectsList.includes(name)) setProjectsList(p => [...p, name]);
                                  setForm(f => ({ ...f, projectName: name }));
                                  setFormTouched(t => new Set([...t, "project"]));
                                  setFormDropdown(null);
                                  setProjectSearch("");
                                }
                              }}
                              placeholder="ابحث أو اكتب اسم مشروع جديد..."
                              className="h-9 w-full rounded-lg border border-neutral-200 bg-white py-1.5 ps-3 pe-8 text-xs outline-none transition-shadow focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-neutral-600 dark:bg-neutral-900 dark:focus:ring-indigo-900/30"
                            />
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                          <p className="text-xs font-semibold text-neutral-400 px-3 py-1.5">المشروع</p>
                          {projectsList
                            .filter(p => p.toLowerCase().includes(projectSearch.toLowerCase()))
                            .map(p => (
                            <button key={p} onClick={() => { setForm(f => ({ ...f, projectName: p })); setFormTouched(t => new Set([...t, "project"])); setFormDropdown(null); setProjectSearch(""); }} className={cn("group flex min-h-9 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-right transition-colors", form.projectName === p ? "bg-indigo-50 text-neutral-800 font-medium dark:bg-indigo-900/20 dark:text-neutral-100" : "text-neutral-700 hover:bg-indigo-50/70 dark:text-neutral-200 dark:hover:bg-neutral-700")}>
                              <span className="min-w-0 flex-1 truncate">{p}</span>
                              <span className={cn("relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors", form.projectName === p ? "border-indigo-500 bg-indigo-500" : "border-indigo-400 bg-white dark:bg-neutral-800")}>
                                {form.projectName === p && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                              </span>
                            </button>
                          ))}
                          {projectSearch.trim() && !projectsList.some(p => p.toLowerCase() === projectSearch.trim().toLowerCase()) && (
                            <button
                              onClick={() => {
                                const name = projectSearch.trim();
                                setProjectsList(p => [...p, name]);
                                setForm(f => ({ ...f, projectName: name }));
                                setFormTouched(t => new Set([...t, "project"]));
                                setFormDropdown(null);
                                setProjectSearch("");
                              }}
                              className="w-full px-3 py-2 text-sm text-right rounded-lg transition-colors flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 font-medium"
                            >
                              <Plus className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">إنشاء مشروع "{projectSearch.trim()}"</span>
                            </button>
                          )}
                          {!projectSearch.trim() && projectsList.length === 0 && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center py-3">لا توجد مشاريع</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recurrence Pill */}
                  <div className="relative overflow-visible">
                    <button onClick={() => setFormDropdown(d => d === "recurrence" ? null : "recurrence")} className={cn("flex h-9 w-full items-center gap-2 px-3 rounded-lg border text-sm font-medium transition-colors", formDropdown === "recurrence" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                      <Repeat className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="text-neutral-400 dark:text-neutral-500 font-normal shrink-0">التكرار:</span>
                      <span className="truncate max-w-[150px] text-neutral-700 dark:text-neutral-200">
                        {form.recurrence && form.recurrence.frequency !== "none"
                          ? `${RECURRENCE_LABELS[form.recurrence.frequency]}${form.recurrence.endType === "count" && form.recurrence.endCount ? ` · ${recurrenceUnitLabel(form.recurrence.frequency, form.recurrence.endCount)}` : form.recurrence.endType === "date" && form.recurrence.endDate ? ` · حتى ${form.recurrence.endDate}` : " · مفتوح"}`
                          : RECURRENCE_LABELS.none}
                      </span>
                      <ChevronDown className={cn("w-3 h-3 ms-auto transition-transform shrink-0 text-neutral-400", formDropdown === "recurrence" ? "rotate-180" : "")} />
                    </button>
                    {formDropdown === "recurrence" && (() => {
                      const now = new Date();
                      const rYear = now.getFullYear();
                      const rMonth = now.getMonth();
                      const rDaysInMonth = new Date(rYear, rMonth + 1, 0).getDate();
                      const rFirstDay = new Date(rYear, rMonth, 1).getDay();
                      const rStartOffset = (rFirstDay + 1) % 7;
                      const selDays = form.recurrence?.selectedDays ?? [];
                      const toggleRecDay = (day: number) => {
                        setForm(f => {
                          const cur = f.recurrence?.selectedDays ?? [];
                          const freq = f.recurrence?.frequency ?? "weekly";
                          const isColumnMode = freq === "weekly";
                          let daysToToggle = [day];
                          if (isColumnMode) {
                            const weekday = new Date(rYear, rMonth, day).getDay();
                            daysToToggle = Array.from({ length: rDaysInMonth }, (_, i) => i + 1)
                              .filter(d => new Date(rYear, rMonth, d).getDay() === weekday);
                          }
                          const allSelected = daysToToggle.every(d => cur.includes(d));
                          const next = allSelected
                            ? cur.filter(d => !daysToToggle.includes(d))
                            : [...new Set([...cur, ...daysToToggle])].sort((a, b) => a - b);
                          return { ...f, recurrence: { frequency: freq, endType: f.recurrence?.endType ?? "open", endCount: f.recurrence?.endCount, endDate: f.recurrence?.endDate, selectedDays: next } };
                        });
                      };
                      const toggleAllRecDays = () => {
                        setForm(f => {
                          const all = selDays.length === rDaysInMonth ? [] : Array.from({ length: rDaysInMonth }, (_, i) => i + 1);
                          return { ...f, recurrence: { frequency: f.recurrence?.frequency ?? "weekly", endType: f.recurrence?.endType ?? "open", endCount: f.recurrence?.endCount, selectedDays: all } };
                        });
                      };
                      return (
                      <div className="absolute right-0 top-full mt-1 z-[60] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-2.5 min-w-[240px] max-sm:fixed max-sm:left-2 max-sm:right-2 max-sm:top-auto max-sm:bottom-2 max-sm:z-[80] max-sm:min-w-0 max-sm:max-h-[50vh] max-sm:overflow-y-auto max-sm:shadow-2xl">
                        <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 text-center mb-1.5">{RECURRENCE_MONTHS_AR[rMonth]} {rYear}</p>
                        {/* Day names */}
                        <div className="grid grid-cols-7 gap-0.5 mb-1">
                          {RECURRENCE_DAYS_SHORT.map(d => (
                            <div key={d} className="text-center text-[10px] font-bold text-neutral-400 dark:text-neutral-500 py-0.5">{d}</div>
                          ))}
                        </div>
                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-0.5">
                          {Array.from({ length: rStartOffset }).map((_, i) => (
                            <div key={`empty-${i}`} className="w-7 h-7" />
                          ))}
                          {Array.from({ length: rDaysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const isSelected = selDays.includes(day);
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => toggleRecDay(day)}
                                className={cn(
                                  "w-7 h-7 rounded-md text-[11px] font-bold flex items-center justify-center transition-all",
                                  isSelected
                                    ? "bg-indigo-500 text-white shadow-sm"
                                    : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                )}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                        {/* Select all days checkbox */}
                        <label className="flex items-center gap-2 mt-2 px-1 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={selDays.length === rDaysInMonth && rDaysInMonth > 0}
                            onChange={toggleAllRecDays}
                            className="w-3.5 h-3.5 rounded border-neutral-300 dark:border-neutral-600 text-indigo-500 focus:ring-indigo-400/40 cursor-pointer"
                          />
                          <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300">كل الأيام</span>
                          <span className="text-[10px] text-neutral-500 dark:text-neutral-500 mr-auto">
                            {selDays.length > 0 ? `${selDays.length} يوم مختار` : ""}
                          </span>
                        </label>
                        {/* Recurrence settings */}
                        <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-700 space-y-2">
                          <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 text-center">إعدادات التكرار</p>
                          <select
                            value={form.recurrence?.frequency ?? "none"}
                            onChange={e => setForm(f => ({ ...f, recurrence: { frequency: e.target.value as RecurrenceFrequency, endType: f.recurrence?.endType ?? "open", endCount: f.recurrence?.endCount, endDate: f.recurrence?.endDate, selectedDays: [] } }))}
                            className="w-full text-[11px] font-bold px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                          >
                            <option value="none">بدون تكرار</option>
                            <option value="daily">يومي</option>
                            <option value="weekly">أسبوعي</option>
                            <option value="monthly">شهري</option>
                            <option value="yearly">سنوي</option>
                          </select>
                          {(form.recurrence?.frequency ?? "none") !== "none" && (
                            <>
                              <select
                                value={form.recurrence?.endType ?? "open"}
                                onChange={e => {
                                  const val = e.target.value as "open" | "count" | "date";
                                  setForm(f => ({ ...f, recurrence: {
                                    frequency: f.recurrence?.frequency ?? "daily",
                                    endType: val,
                                    endCount: val === "count" ? (f.recurrence?.endCount ?? 10) : undefined,
                                    endDate: val === "date" ? (f.recurrence?.endDate ?? new Date(rYear, rMonth, rDaysInMonth).toISOString().slice(0, 10)) : undefined,
                                    selectedDays: f.recurrence?.selectedDays,
                                  } }));
                                }}
                                className="w-full text-[11px] font-bold px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                              >
                                <option value="open">مفتوحة (بدون نهاية)</option>
                                <option value="count">لمدة معينة</option>
                                <option value="date">حتى تاريخ معين</option>
                              </select>
                              {form.recurrence?.endType === "count" && (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={1}
                                    value={form.recurrence?.endCount ?? 10}
                                    onChange={e => setForm(f => ({ ...f, recurrence: { frequency: f.recurrence?.frequency ?? "daily", endType: "count", endCount: Math.max(1, Number(e.target.value) || 1), selectedDays: f.recurrence?.selectedDays } }))}
                                    className="flex-1 text-[11px] font-bold px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                                  />
                                  <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 shrink-0">{recurrenceUnitLabel(form.recurrence?.frequency ?? "daily", form.recurrence?.endCount ?? 10).replace(/^\d+\s*/, "")}</span>
                                </div>
                              )}
                              {form.recurrence?.endType === "date" && (
                                <input
                                  type="date"
                                  value={form.recurrence?.endDate ?? ""}
                                  onChange={e => setForm(f => ({ ...f, recurrence: { frequency: f.recurrence?.frequency ?? "daily", endType: "date", endDate: e.target.value, selectedDays: f.recurrence?.selectedDays } }))}
                                  className="w-full text-[11px] font-bold px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                                />
                              )}
                            </>
                          )}
                          <button
                            onClick={() => { setFormTouched(t => new Set([...t, "recurrence"])); setFormDropdown(null); }}
                            className={cn(
                              "w-full py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1",
                              "border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                            )}
                          >
                            <Check className="w-3 h-3" />
                            تطبيق{selDays.length > 0 ? ` على ${selDays.length} يوم` : ""}
                          </button>
                        </div>
                      </div>
                      );
                    })()}
                  </div>

                  </div>
                  )}
                </section>

                {/* Task attachments — shared by create and edit */}
                <section className="space-y-3" aria-labelledby="task-attachments-heading">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setFormAttachmentsCollapsed(c => !c)}
                      className="flex items-center gap-2 group"
                      aria-expanded={!formAttachmentsCollapsed}
                    >
                      <Paperclip className="w-4 h-4 text-neutral-400" />
                      <h3 id="task-attachments-heading" className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 group-hover:text-[#5267ff] transition-colors">المرفقات</h3>
                      <ChevronDown className={cn("w-3.5 h-3.5 text-neutral-400 transition-transform", formAttachmentsCollapsed && "-rotate-90")} />
                    </button>
                    {(form.attachments || []).length > 0 && (
                      <span className="text-xs text-neutral-400">{(form.attachments || []).length} ملف</span>
                    )}
                  </div>

                  {!formAttachmentsCollapsed && (
                  <>
                  <button
                    type="button"
                    onClick={() => taskFileInputRef.current?.click()}
                    onDragEnter={event => { event.preventDefault(); setFormAttachmentDragging(true); }}
                    onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; setFormAttachmentDragging(true); }}
                    onDragLeave={event => {
                      event.preventDefault();
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFormAttachmentDragging(false);
                    }}
                    onDrop={async event => {
                      event.preventDefault();
                      setFormAttachmentDragging(false);
                      await addTaskFiles(event.dataTransfer.files);
                    }}
                    className={cn(
                      "group w-full min-h-[92px] rounded-xl border-2 border-dashed px-4 py-4 flex flex-col items-center justify-center gap-2 text-center transition-all",
                      formAttachmentDragging
                        ? "border-[#5267ff] bg-[#5267ff]/5 shadow-[0_0_0_3px_rgba(82,103,255,0.08)]"
                        : "border-neutral-200 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-800/40 hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/70"
                    )}
                    aria-label="إرفاق ملفات بالسحب والإفلات أو الاختيار"
                    data-testid="task-attachment-dropzone"
                  >
                    <span className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                      formAttachmentDragging ? "bg-[#5267ff] text-white" : "bg-white dark:bg-neutral-800 text-neutral-400 border border-neutral-200 dark:border-neutral-700 group-hover:text-[#5267ff]"
                    )}>
                      <FilePlus className="w-4.5 h-4.5" />
                    </span>
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                      {formAttachmentDragging ? "أفلت الملفات هنا" : "اسحب الملفات وأفلتها هنا"}
                    </span>
                    <span className="text-xs text-neutral-400">أو اضغط لاختيار ملفات من جهازك</span>
                  </button>

                  {(form.attachments || []).length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                      {(form.attachments || []).map(att => {
                        const isImage = att.type?.startsWith("image/");
                        const isVideo = att.type?.startsWith("video/");
                        const isAudio = att.type?.startsWith("audio/");
                        const isPdf = att.type === "application/pdf" || att.name.toLowerCase().endsWith(".pdf");
                        return (
                          <div key={att.id} className="group relative min-w-0 h-[72px] rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 flex items-center gap-3 shadow-[0_1px_2px_rgba(15,23,42,0.02)] hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-sm transition-all">
                            <span className={cn(
                              "w-11 h-11 rounded-lg flex items-center justify-center shrink-0",
                              isPdf ? "bg-red-50 text-red-500 dark:bg-red-950/30" :
                              isImage ? "bg-blue-50 text-blue-500 dark:bg-blue-950/30" :
                              isVideo ? "bg-violet-50 text-violet-500 dark:bg-violet-950/30" :
                              isAudio ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30" :
                              "bg-neutral-100 text-neutral-500 dark:bg-neutral-700"
                            )}>
                              {isImage ? <ImageIcon className="w-5 h-5" /> :
                               isVideo ? <Video className="w-5 h-5" /> :
                               isAudio ? <Mic className="w-5 h-5" /> :
                               <FileText className="w-5 h-5" />}
                            </span>
                            <span className="min-w-0 flex-1 text-right">
                              <span className="block truncate text-sm font-semibold text-neutral-800 dark:text-neutral-100" title={att.name}>{att.name}</span>
                              <span className="block mt-0.5 text-xs text-neutral-400" dir="ltr">{att.size}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setForm(current => ({ ...current, attachments: (current.attachments || []).filter(item => item.id !== att.id) }))}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                              aria-label={`إزالة ${att.name}`}
                              title="إزالة الملف"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  </>
                  )}

                </section>

                {/* Subtasks — collapsible like attachments */}
                <section className="space-y-3" aria-labelledby="task-subtasks-heading">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setFormSubtasksCollapsed(c => !c)}
                      className="flex items-center gap-2 group"
                      aria-expanded={!formSubtasksCollapsed}
                    >
                      <ListChecks className="w-4 h-4 text-neutral-400" />
                      <h3 id="task-subtasks-heading" className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 group-hover:text-[#5267ff] transition-colors">المهام الفرعية</h3>
                      <ChevronDown className={cn("w-3.5 h-3.5 text-neutral-400 transition-transform", formSubtasksCollapsed && "-rotate-90")} />
                    </button>
                    {(form.subtasks || []).length > 0 && (
                      <span className="text-xs text-neutral-400">{(form.subtasks || []).length} مهمة</span>
                    )}
                  </div>

                  {!formSubtasksCollapsed && (
                  <>
                  <div className="space-y-2">
                  {(form.subtasks || []).map((st) => (
                    <div key={st.id}>
                      {formEditingSubtaskId === st.id ? (
                        /* Inline edit form */
                        <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-3.5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                          <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400">عنوان المهمة الفرعية <span className="text-red-500">*</span></label>
                          <input
                            value={formEditingSubtaskForm.title || ""}
                            onChange={e => setFormEditingSubtaskForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="اكتب عنوانًا واضحًا للمهمة الفرعية"
                            className="w-full border-b border-neutral-200 bg-transparent px-1 pb-2 text-base font-semibold text-neutral-900 outline-none placeholder:font-normal placeholder:text-neutral-300 focus:border-neutral-500 dark:border-neutral-700 dark:text-white"
                          />
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Status picker */}
                            <div className="relative">
                              <button onClick={() => setFormEditingSubtaskDropdown(d => d === "status" ? null : "status")} className={cn("flex h-9 w-full items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition-colors", formEditingSubtaskDropdown === "status" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                                <span className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[formEditingSubtaskForm.status || "todo"].accent)} />
                                <span className="text-neutral-400">الحالة:</span>
                                <span>{STATUS_CONFIG[formEditingSubtaskForm.status || "todo"].label}</span>
                                <ChevronDown className={cn("ms-auto w-3 h-3 transition-transform", formEditingSubtaskDropdown === "status" ? "rotate-180" : "")} />
                              </button>
                              {formEditingSubtaskDropdown === "status" && (
                                <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[140px]">
                                  {(["todo","in-progress","in-review","completed","overdue"] as TaskStatus[]).map(s => (
                                    <button key={s} onClick={() => { setFormEditingSubtaskForm(f => ({ ...f, status: s })); setFormEditingSubtaskDropdown(null); }} className={cn("w-full px-3 py-2 text-sm text-right flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", (formEditingSubtaskForm.status || "todo") === s ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                                      <span className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[s].accent)} />
                                      {STATUS_CONFIG[s].label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            {/* Priority picker */}
                            <div className="relative">
                              <button onClick={() => setFormEditingSubtaskDropdown(d => d === "priority" ? null : "priority")} className={cn("flex h-9 w-full items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition-colors", formEditingSubtaskDropdown === "priority" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                                <Flag className={cn("w-3 h-3", PRIORITY_CONFIG[formEditingSubtaskForm.priority || "medium"].flag)} />
                                <span className="text-neutral-400">الأولوية:</span>
                                <span>{PRIORITY_CONFIG[formEditingSubtaskForm.priority || "medium"].label}</span>
                                <ChevronDown className={cn("ms-auto w-3 h-3 transition-transform", formEditingSubtaskDropdown === "priority" ? "rotate-180" : "")} />
                              </button>
                              {formEditingSubtaskDropdown === "priority" && (
                                <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[140px]">
                                  {(["low","medium","high","urgent","emergency"] as TaskPriority[]).map(p => (
                                    <button key={p} onClick={() => { setFormEditingSubtaskForm(f => ({ ...f, priority: p })); setFormEditingSubtaskDropdown(null); }} className={cn("w-full px-3 py-2 text-sm text-right flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", (formEditingSubtaskForm.priority || "medium") === p ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                                      <Flag className={cn("w-3 h-3", PRIORITY_CONFIG[p].flag)} />
                                      {PRIORITY_CONFIG[p].label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            {/* Assignee picker */}
                            <div className="relative">
                              <button onClick={() => setFormEditingSubtaskDropdown(d => d === "assignee" ? null : "assignee")} className={cn("flex h-9 w-full items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition-colors", formEditingSubtaskDropdown === "assignee" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                                <span className="text-neutral-400">الإسناد:</span>
                                <span className="min-w-0 flex-1 truncate">{formEditingSubtaskForm.assignee || "اختر موظف"}</span>
                                <ChevronDown className={cn("w-3 h-3 transition-transform", formEditingSubtaskDropdown === "assignee" ? "rotate-180" : "")} />
                              </button>
                              {formEditingSubtaskDropdown === "assignee" && (
                                <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-1.5 min-w-[160px] max-h-[200px] overflow-y-auto">
                                  {ASSIGNEES.map(name => (
                                    <button key={name} onClick={() => { setFormEditingSubtaskForm(f => ({ ...f, assignee: name })); setFormEditingSubtaskDropdown(null); }} className={cn("w-full px-3 py-2 text-sm text-right rounded-lg transition-colors", formEditingSubtaskForm.assignee === name ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50")}>
                                      {name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            {/* Due Date picker */}
                            <div className="relative">
                              <button onClick={() => setFormEditingSubtaskDropdown(d => d === "dueDate" ? null : "dueDate")} className={cn("flex h-9 w-full items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition-colors", formEditingSubtaskDropdown === "dueDate" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                                <CalendarIcon className="w-3 h-3 text-neutral-400" />
                                <span className="text-neutral-400">الموعد:</span>
                                <span>{formEditingSubtaskForm.dueDate ? fmtDate(formEditingSubtaskForm.dueDate) : "حدد موعد"}</span>
                                <ChevronDown className={cn("ms-auto w-3 h-3 transition-transform", formEditingSubtaskDropdown === "dueDate" ? "rotate-180" : "")} />
                              </button>
                              {formEditingSubtaskDropdown === "dueDate" && (
                                <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-2 min-w-[200px]">
                                  <input type="date" value={formEditingSubtaskForm.dueDate || ""} onChange={e => { setFormEditingSubtaskForm(f => ({ ...f, dueDate: e.target.value })); setFormEditingSubtaskDropdown(null); }} className="w-full rounded-md border border-neutral-300 bg-white px-2 py-2 text-right text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:border-neutral-600 dark:bg-neutral-800" dir="ltr" />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-700">
                            <button onClick={() => { setFormEditingSubtaskId(null); setFormEditingSubtaskForm({}); setFormEditingSubtaskDropdown(null); }} className="rounded-lg px-3 py-2 text-xs font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors">إلغاء</button>
                            <button onClick={() => { if (!formEditingSubtaskForm.title?.trim()) return; const next = (form.subtasks || []).map(s => s.id === st.id ? { ...s, ...formEditingSubtaskForm, title: formEditingSubtaskForm.title!.trim() } as Task : s); setForm(f => ({ ...f, subtasks: next })); setFormEditingSubtaskId(null); setFormEditingSubtaskForm({}); setFormEditingSubtaskDropdown(null); }} className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors">حفظ التعديلات</button>
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
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{st.dueDate}</span>
                          </div>
                          <button onClick={() => { setFormEditingSubtaskId(st.id); setFormEditingSubtaskForm({ ...st }); setFormEditingSubtaskDropdown(null); }} className="text-neutral-400 hover:text-teal-500"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => { const next = (form.subtasks || []).filter(s => s.id !== st.id); setForm(f => ({ ...f, subtasks: next })); }} className="text-neutral-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Inline subtask form */}
                  {formShowSubtaskForm && (
                    <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-3.5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                      <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400">عنوان المهمة الفرعية <span className="text-red-500">*</span></label>
                      <input
                        value={formSubtaskForm.title || ""}
                        onChange={e => setFormSubtaskForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="اكتب عنوانًا واضحًا للمهمة الفرعية"
                        className="w-full border-b border-neutral-200 bg-transparent px-1 pb-2 text-base font-semibold text-neutral-900 outline-none placeholder:font-normal placeholder:text-neutral-300 focus:border-neutral-500 dark:border-neutral-700 dark:text-white"
                      />
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Priority picker */}
                        <div className="relative">
                          <button onClick={() => setFormSubtaskDropdown(d => d === "priority" ? null : "priority")} className={cn("flex h-9 w-full items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition-colors", formSubtaskDropdown === "priority" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                            <Flag className={cn("w-3 h-3", formSubtaskForm.priority ? PRIORITY_CONFIG[formSubtaskForm.priority].flag : "text-neutral-400")} />
                            <span className="text-neutral-400">الأولوية:</span>
                            <span>{formSubtaskForm.priority ? PRIORITY_CONFIG[formSubtaskForm.priority].label : "اختر"}</span>
                            <ChevronDown className={cn("ms-auto w-3 h-3 transition-transform", formSubtaskDropdown === "priority" ? "rotate-180" : "")} />
                          </button>
                          {formSubtaskDropdown === "priority" && (
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[140px]">
                              {(["low","medium","high","urgent","emergency"] as TaskPriority[]).map(p => (
                                <button key={p} onClick={() => { setFormSubtaskForm(f => ({ ...f, priority: p })); setFormSubtaskDropdown(null); }} className={cn("w-full px-3 py-2 text-sm text-right flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", formSubtaskForm.priority === p ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                                  <Flag className={cn("w-3 h-3", PRIORITY_CONFIG[p].flag)} />
                                  {PRIORITY_CONFIG[p].label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Assignee picker */}
                        <div className="relative">
                          <button onClick={() => setFormSubtaskDropdown(d => d === "assignee" ? null : "assignee")} className={cn("flex h-9 w-full items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition-colors", formSubtaskDropdown === "assignee" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                            {formSubtaskForm.assignee && <img src={avatarUrl(formSubtaskForm.assignee)} alt={formSubtaskForm.assignee} className="w-4 h-4 rounded-full object-cover" />}
                            <span className="text-neutral-400">الإسناد:</span>
                            <span className="min-w-0 flex-1 truncate">{formSubtaskForm.assignee || "اختر موظف"}</span>
                            <ChevronDown className={cn("w-3 h-3 transition-transform", formSubtaskDropdown === "assignee" ? "rotate-180" : "")} />
                          </button>
                          {formSubtaskDropdown === "assignee" && (
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg py-1.5 min-w-[160px] max-h-[200px] overflow-y-auto">
                              {ASSIGNEES.map(name => (
                                <button key={name} onClick={() => { setFormSubtaskForm(f => ({ ...f, assignee: name })); setFormSubtaskDropdown(null); }} className={cn("w-full px-3 py-2 text-sm text-right flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors", formSubtaskForm.assignee === name ? "text-teal-600 font-semibold" : "text-neutral-700 dark:text-neutral-200")}>
                                  <img src={avatarUrl(name)} alt={name} className="w-4 h-4 rounded-full object-cover" />
                                  {name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Due Date picker */}
                        <div className="relative">
                          <button onClick={() => setFormSubtaskDropdown(d => d === "dueDate" ? null : "dueDate")} className={cn("flex h-9 w-full items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition-colors", formSubtaskDropdown === "dueDate" ? "bg-neutral-100 border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600" : "bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60")}>
                            <CalendarIcon className="w-3 h-3 text-neutral-400" />
                            <span className="text-neutral-400">الموعد:</span>
                            <span>{formSubtaskForm.dueDate ? fmtDate(formSubtaskForm.dueDate) : "حدد موعد"}</span>
                            <ChevronDown className={cn("ms-auto w-3 h-3 transition-transform", formSubtaskDropdown === "dueDate" ? "rotate-180" : "")} />
                          </button>
                          {formSubtaskDropdown === "dueDate" && (
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-lg p-2 min-w-[200px]">
                              <input type="date" value={formSubtaskForm.dueDate || ""} onChange={e => { setFormSubtaskForm(f => ({ ...f, dueDate: e.target.value })); setFormSubtaskDropdown(null); }} className="w-full rounded-md border border-neutral-300 bg-white px-2 py-2 text-right text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:border-neutral-600 dark:bg-neutral-800" dir="ltr" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-700">
                        <button onClick={() => { setFormShowSubtaskForm(false); setFormSubtaskDropdown(null); setFormSubtaskForm({}); }} className="rounded-lg px-3 py-2 text-xs font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors">إلغاء</button>
                        <button onClick={() => { if (!formSubtaskForm.title?.trim()) return; const newSubtask: Task = { id: String(Date.now()), title: formSubtaskForm.title!.trim(), description: "", status: "todo", priority: formSubtaskForm.priority || "medium", dueDate: formSubtaskForm.dueDate || "", assignee: formSubtaskForm.assignee || "", progress: 0, projectName: form.projectName || "" }; const next = [...(form.subtasks || []), newSubtask]; setForm(f => ({ ...f, subtasks: next })); setFormShowSubtaskForm(false); setFormSubtaskDropdown(null); setFormSubtaskForm({}); }} className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors">إضافة المهمة</button>
                      </div>
                    </div>
                  )}

                </div>

                  {/* Add subtask button — matching attachments style */}
                  <button onClick={() => setFormShowSubtaskForm(true)} className="flex items-center gap-2 group">
                    <Plus className="w-4 h-4 text-neutral-400 group-hover:text-[#5267ff] transition-colors" />
                    <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-[#5267ff] transition-colors">إضافة مهمة فرعية</span>
                  </button>
                  </>
                  )}
                </section>

                </div>
              </div>

                {/* Activity sidebar - left 55% */}
                <div className={cn(
                  "min-w-0 flex-1 sm:flex-none border-t sm:border-t-0 border-neutral-200 dark:border-neutral-800 bg-[#FAFCFF] dark:bg-[#0b141a] overflow-hidden flex flex-col transition-[width] duration-300",
                  formPanelCollapsed ? "sm:w-full sm:border-r-0" : "sm:w-[55%] sm:border-r",
                  formMobileTab === "details" ? "hidden sm:flex" : ""
                )}>
                  {/* Activity header */}
                  <div className="relative z-20 h-[60px] flex items-center justify-between px-3 sm:px-4 border-b border-black/5 dark:border-white/5 bg-[#FAFCFF] dark:bg-[#202c33] shadow-[0_2px_8px_rgba(15,23,42,0.08)] shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img src={avatarUrl(form.assignee)} alt={form.assignee || "المسؤول"} className="w-10 h-10 rounded-full object-cover" />
                        {editing && <span className="absolute bottom-0 start-0 w-3 h-3 rounded-full bg-[#25d366] border-2 border-[#FAFCFF] dark:border-[#202c33]" />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-[#111b21] dark:text-[#e9edef] truncate">النشاط والتعليقات</h3>
                        <p className="text-xs text-[#667781] dark:text-[#8696a0] truncate">
                          {editing ? `${form.assignee || "المسؤول"} · ${formActivityComments.length} رسالة` : "ستُنشر الملاحظات عند إنشاء المهمة"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[#54656f] dark:text-[#aebac1]">
                      <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors" aria-label="البحث في المحادثة"><Search className="w-5 h-5" /></button>
                      <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors" aria-label="خيارات المحادثة"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>
                  </div>

                  {/* Activity items */}
                  <div className="whatsapp-chat-bg flex-1 overflow-y-auto px-3 sm:px-[7%] py-4 space-y-2">
                    {/* Created task entry */}
                    <div className="flex justify-center pb-2">
                      <span className="px-3 py-1.5 rounded-lg bg-[#ffeecd] dark:bg-[#182229] shadow-sm text-xs font-medium text-[#54656f] dark:text-[#8696a0] flex items-center gap-1.5">
                        <FilePlus className="w-3 h-3" />{editing ? `أنشأت هذه المهمة · ${form.createdAt || today}` : "ملاحظة أولية لمسودة المهمة"}
                      </span>
                    </div>
                    <div className="flex justify-center py-1">
                      <span className="px-3 py-1 rounded-lg bg-white/90 dark:bg-[#182229] shadow-sm text-xs font-medium text-[#667781] dark:text-[#8696a0]">اليوم</span>
                    </div>

                    {formActivityComments.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 text-[#667781] dark:text-[#8696a0]">
                        <div className="w-12 h-12 rounded-full bg-white/80 dark:bg-[#202c33] flex items-center justify-center mb-3 shadow-sm">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <p className="text-sm">{editing ? "ابدأ المحادثة حول سير عمل المهمة" : "أضف ملاحظة أو مرفقًا قبل إنشاء المهمة"}</p>
                      </div>
                    )}
                    {formActivityComments.map(c => {
                      const canEdit = c.author === "أنت" && c.createdAt && (Date.now() - c.createdAt < 30 * 60 * 1000);
                      const isEditing = formEditingComment?.id === c.id;
                      const isMine = c.author === "أنت";
                      const currentComments = formActivityComments;
                      const updateComments = updateFormComments;
                      return (
                        <div key={c.id} dir="ltr" className={cn("flex items-end gap-2 group", isMine ? "justify-end" : "justify-start")}>
                          {!isMine && <img src={avatarUrl(c.author)} alt={c.author} className="w-8 h-8 rounded-full object-cover shrink-0 shadow-sm ring-1 ring-black/5" />}
                          <div className={cn(
                            "relative max-w-[84%] sm:max-w-[72%] min-w-[88px] rounded-lg px-2.5 pt-1.5 pb-1 shadow-[0_1px_1px_rgba(11,20,26,0.13)]",
                            isMine
                              ? "wa-message-out bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef]"
                              : "wa-message-in bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef]"
                          )} dir="rtl">
                            {!isMine && <p className="text-xs font-semibold text-[#008069] dark:text-[#00a884] text-right mb-0.5">{c.author}</p>}
                            {isEditing ? (
                              <div>
                                <textarea value={formEditingComment.text} onChange={e => setFormEditingComment({ ...formEditingComment, text: e.target.value })} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); const next = currentComments.map(x => x.id === c.id ? { ...x, text: formEditingComment.text.trim() } : x); updateComments(next); setFormEditingComment(null); } }} className="w-full min-w-[200px] text-xs rounded-md p-2 bg-white/70 dark:bg-black/20 text-[#111b21] dark:text-[#e9edef] border border-[#00a884]/40 focus:outline-none focus:ring-1 focus:ring-[#00a884] resize-none text-right" rows={2} />
                                <div className="flex items-center justify-end gap-1 mt-1">
                                  <button onClick={() => setFormEditingComment(null)} className="px-2 py-1 text-[10px] text-[#667781] hover:text-[#111b21] dark:hover:text-white transition-colors">إلغاء</button>
                                  <button onClick={() => { const next = currentComments.map(x => x.id === c.id ? { ...x, text: formEditingComment.text.trim() } : x); updateComments(next); setFormEditingComment(null); }} className="px-2 py-1 text-[10px] font-semibold text-[#008069] dark:text-[#00a884] hover:opacity-80 transition-opacity">حفظ</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {c.text && <div className="text-sm leading-[1.6] text-right whitespace-pre-wrap"><FormattedText text={c.text} /></div>}
                                {(c.attachments || []).length > 0 && (
                                  <div className={cn("flex flex-wrap gap-1.5", c.text ? "mt-2" : "")}>
                                    {(c.attachments || []).map(att => (
                                      att.type?.startsWith("image/") ? (
                                        <a key={att.id} href={att.url} download={att.name} className="block rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:opacity-90 transition-opacity">
                                          <img src={att.url} alt={att.name} className="w-24 h-24 object-cover" />
                                        </a>
                                      ) : att.type?.startsWith("video/") ? (
                                        <VideoThumbnail key={att.id} url={att.url} name={att.name} />
                                      ) : att.type === "application/pdf" ? (
                                        <div key={att.id} className="relative group w-[110px]">
                                          <a href={att.url} target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden hover:shadow-md transition-all">
                                            <PdfThumbnail url={att.url} name={att.name} />
                                            <div className="px-2 py-1 border-t border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700/30">
                                              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate block text-center">{att.name}</span>
                                            </div>
                                          </a>
                                          <a href={att.url} download={att.name} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-neutral-700 shadow-sm border border-neutral-200 dark:border-neutral-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="تحميل">
                                            <FileDown className="w-2.5 h-2.5 text-neutral-500" />
                                          </a>
                                        </div>
                                      ) : (
                                        <a key={att.id} href={att.url} download={att.name} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-black/5 dark:bg-white/5 text-[11px] hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                          <span className="w-7 h-7 rounded-full bg-[#00a884] flex items-center justify-center shrink-0"><FileText className="w-3.5 h-3.5 text-white" /></span>
                                          <span className="min-w-0">
                                            <span className="truncate max-w-[130px] block">{att.name}</span>
                                            <span className="text-[9px] text-[#667781] dark:text-[#8696a0]">{att.size}</span>
                                          </span>
                                        </a>
                                      )
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                            <div className="flex items-center justify-end gap-1 min-h-[14px] -mb-0.5">
                              {isMine && canEdit && !isEditing && (
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => setFormEditingComment({ id: c.id, text: c.text })} className="p-0.5 rounded text-[#667781] hover:text-[#008069] transition-colors"><Pencil className="w-3 h-3" /></button>
                                  <button onClick={() => { const next = currentComments.filter(x => x.id !== c.id); updateComments(next); }} className="p-0.5 rounded text-[#667781] hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                </div>
                              )}
                              <span className="text-[10px] text-[#667781] dark:text-[#8696a0]">{c.date}</span>
                              {isMine && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                            </div>
                          </div>
                          {isMine && <img src={avatarUrl(form.assignee)} alt={form.assignee || "المسؤول"} className="w-8 h-8 rounded-full object-cover shrink-0 shadow-sm ring-1 ring-black/5" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Comment input */}
                  <div className="shrink-0 bg-[#FAFCFF] dark:bg-[#202c33] px-2.5 py-2 border-t border-black/5 dark:border-white/5">
                    {formCommentAttachments.length > 0 && (
                      <div className="flex gap-2 mb-2 overflow-x-auto scrollbar-hide pb-0.5">
                        {formCommentAttachments.map(att => (
                          <div key={att.id} className="relative shrink-0 w-[150px] h-[54px] flex items-center gap-2 px-2 rounded-lg bg-white dark:bg-[#111b21] border border-black/5 dark:border-white/5 shadow-sm text-[10px]">
                            {att.type?.startsWith("image/") ? (
                              <img src={att.url} alt="" className="w-10 h-10 rounded-md object-cover shrink-0" />
                            ) : att.type?.startsWith("audio/") ? (
                              <span className="w-10 h-10 rounded-full bg-[#e7fce3] dark:bg-[#005c4b] flex items-center justify-center shrink-0"><Mic className="w-4 h-4 text-[#008069] dark:text-[#00a884]" /></span>
                            ) : (
                              <span className="w-10 h-10 rounded-md bg-[#e9edef] dark:bg-[#2a3942] flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-[#667781] dark:text-[#aebac1]" /></span>
                            )}
                            <span className="min-w-0">
                              <span className="text-[#111b21] dark:text-[#e9edef] truncate block">{att.name}</span>
                              <span className="text-[#667781] dark:text-[#8696a0]">{att.size}</span>
                            </span>
                            <button onClick={() => setFormCommentAttachments(p => p.filter(a => a.id !== att.id))} className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-[#54656f] text-white flex items-center justify-center shadow"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="relative flex items-end gap-2">
                      <FloatingTextFormatter
                        visible={textFormatSelection === "form-comment"}
                        onFormat={applyTextFormat}
                        className="right-14 bottom-full mb-2"
                      />
                      <div className="flex items-end flex-1 min-w-0 bg-white dark:bg-[#2a3942] rounded-lg shadow-sm px-1 min-h-[44px]">
                        <button
                          onClick={() => setFormAttachmentMenuOpen(open => !open)}
                          className={cn("p-2.5 rounded-full transition-all shrink-0 mb-0.5", formAttachmentMenuOpen ? "text-[#00a884] rotate-45" : "text-[#54656f] dark:text-[#aebac1] hover:text-[#008069]")}
                          aria-label="إرفاق"
                          title="إرفاق"
                        >
                          <Paperclip className="w-5 h-5" />
                        </button>
                        <RichTextEditor
                          editorRef={formCommentTextareaRef}
                          value={formComment}
                          onChange={(html, plainText, cursorOffset) => { setFormComment(html); setFormMention(getMentionContext(plainText, cursorOffset)); }}
                          onSelectionChange={editor => captureTextSelection("form-comment", editor)}
                          onBlur={nextFocus => handleTextFormattingBlur("form-comment", nextFocus)}
                          onKeyDown={e => {
                            if (e.key === "Escape") { setFormMention(null); setFormAttachmentMenuOpen(false); return; }
                            if (e.key === "Enter" && !e.shiftKey && (hasRichTextContent(formComment) || formCommentAttachments.length > 0)) {
                              e.preventDefault();
                              sendFormComment();
                            }
                          }}
                          placeholder="اكتب رسالة"
                          wrapperClassName="flex-1 min-w-0"
                          placeholderClassName="top-3 px-1.5 text-base sm:text-sm"
                          className="w-full min-h-[42px] max-h-32 overflow-y-auto px-1.5 py-3 bg-transparent text-base sm:text-sm leading-5 text-[#111b21] dark:text-[#e9edef] focus:outline-none text-right whitespace-pre-wrap"
                        />
                      </div>
                      <button
                        onClick={sendFormComment}
                        disabled={!hasRichTextContent(formComment) && formCommentAttachments.length === 0}
                        className={cn(
                          "w-11 h-11 rounded-full flex items-center justify-center shadow-sm transition-colors shrink-0",
                          hasRichTextContent(formComment) || formCommentAttachments.length > 0
                            ? "bg-[#00a884] hover:bg-[#008f72] text-white"
                            : "bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500"
                        )}
                        aria-label="إرسال"
                        title="إرسال"
                      >
                        <Send className="w-5 h-5 -rotate-90" />
                      </button>

                      <AnimatePresence>
                        {formAttachmentMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 8 }}
                            className="absolute bottom-full right-10 mb-3 z-50 w-[210px] rounded-xl bg-white dark:bg-[#233138] shadow-xl border border-black/5 dark:border-white/5 py-2 overflow-hidden"
                          >
                            <button onClick={() => { setFormAttachmentMenuOpen(false); formFileInputRef.current?.click(); }} className="w-full px-3 py-2.5 flex items-center gap-3 text-xs text-[#111b21] dark:text-[#e9edef] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                              <span className="w-9 h-9 rounded-full bg-[#7f66ff] flex items-center justify-center"><FileText className="w-4 h-4 text-white" /></span>
                              مستند
                            </button>
                            <button onClick={() => { setFormAttachmentMenuOpen(false); formMediaInputRef.current?.click(); }} className="w-full px-3 py-2.5 flex items-center gap-3 text-xs text-[#111b21] dark:text-[#e9edef] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                              <span className="w-9 h-9 rounded-full bg-[#007bfc] flex items-center justify-center"><ImageIcon className="w-4 h-4 text-white" /></span>
                              الصور والفيديو
                            </button>
                            <button onClick={() => { setFormAttachmentMenuOpen(false); formCameraInputRef.current?.click(); }} className="w-full px-3 py-2.5 flex items-center gap-3 text-xs text-[#111b21] dark:text-[#e9edef] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                              <span className="w-9 h-9 rounded-full bg-[#ff2e74] flex items-center justify-center"><Camera className="w-4 h-4 text-white" /></span>
                              الكاميرا
                            </button>
                            <button onClick={() => { setFormAttachmentMenuOpen(false); setVideoRecorderTarget("form"); }} className="w-full px-3 py-2.5 flex items-center gap-3 text-xs text-[#111b21] dark:text-[#e9edef] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                              <span className="w-9 h-9 rounded-full bg-[#00a884] flex items-center justify-center"><Video className="w-4 h-4 text-white" /></span>
                              تسجيل فيديو
                            </button>
                            <button onClick={() => { const start = formComment.length; setFormComment(value => `${value}${value && !value.endsWith(" ") ? " " : ""}@`); setFormMention({ query: "", startIndex: start + (formComment && !formComment.endsWith(" ") ? 1 : 0) }); setFormAttachmentMenuOpen(false); }} className="w-full px-3 py-2.5 flex items-center gap-3 text-xs text-[#111b21] dark:text-[#e9edef] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                              <span className="w-9 h-9 rounded-full bg-[#009de2] flex items-center justify-center"><AtSign className="w-4 h-4 text-white" /></span>
                              الإشارة إلى شخص
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {formMention && (
                        <div className="absolute left-12 right-12 bottom-full mb-3 z-[60] bg-white dark:bg-[#233138] border border-black/5 dark:border-white/5 rounded-xl shadow-xl py-1 max-h-[190px] overflow-y-auto">
                          {MENTION_OPTIONS.filter(o => o.label.toLowerCase().includes(formMention.query.toLowerCase())).length === 0 ? (
                            <p className="px-3 py-2 text-xs text-[#667781] dark:text-[#8696a0] text-right">لا توجد نتائج</p>
                          ) : (
                            MENTION_OPTIONS.filter(o => o.label.toLowerCase().includes(formMention.query.toLowerCase())).map(o => (
                              <button key={o.id} onMouseDown={event => event.preventDefault()} onClick={() => { insertTextAtRichSelection("form-comment", `@${o.label} `, formMention.query.length + 1); setFormMention(null); }} className="w-full px-3 py-2 text-xs text-[#111b21] dark:text-[#e9edef] text-right flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", o.type === "person" ? "bg-blue-50 text-blue-600" : o.type === "team" ? "bg-emerald-50 text-emerald-600" : o.type === "department" ? "bg-amber-50 text-amber-600" : "bg-violet-50 text-violet-600")}>{o.type === "person" ? "شخص" : o.type === "team" ? "فريق" : o.type === "department" ? "قسم" : "لجنة"}</span>
                                {o.label}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                      <input ref={formFileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" className="hidden" onChange={async event => { await addFormFiles(event.target.files); event.target.value = ""; }} />
                      <input ref={formMediaInputRef} type="file" multiple accept="image/*,video/*,audio/*" className="hidden" onChange={async event => { await addFormFiles(event.target.files); event.target.value = ""; }} />
                      <input ref={formCameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={async event => { await addFormFiles(event.target.files); event.target.value = ""; }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shared draft action bar — always available on details and activity tabs */}
              <div className="shrink-0 min-h-[50px] px-2 sm:px-5 py-2 sm:py-2.5 border-t border-neutral-100 dark:border-neutral-800 bg-[#f9fbff] dark:bg-neutral-900 flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn("hidden sm:flex items-center gap-1.5 text-xs truncate", formIsDirty ? "text-amber-600" : "text-neutral-400")}>
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", formIsDirty ? "bg-amber-500" : "bg-teal-500")} />
                    {formIsDirty ? "تغييرات غير محفوظة" : editing ? "لا توجد تغييرات" : "المهمة جاهزة للإنشاء"}
                  </span>
                  <span className="hidden lg:inline text-[10px] text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded px-1.5 py-0.5">Ctrl + S</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <input ref={taskFileInputRef} type="file" multiple className="hidden" onChange={async event => { await addTaskFiles(event.target.files); event.target.value = ""; }} />
                  <button onClick={() => closeForm()} className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">إلغاء</button>
                  <button onClick={save} className="px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-black hover:bg-neutral-800 shadow-sm transition-colors">{editing ? "حفظ التعديلات" : "إنشاء المهمة"}</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {saveNotice && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] min-w-[280px] max-w-[calc(100vw-32px)] rounded-xl bg-neutral-900 text-white shadow-2xl px-4 py-3 flex items-center gap-3"
            role="status"
          >
            <span className="w-7 h-7 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0"><CheckCheck className="w-4 h-4 text-teal-300" /></span>
            <span className="text-sm font-medium flex-1">{saveNotice.message}</span>
            <button
              onClick={() => {
                const task = tasks.find(item => item.id === saveNotice.taskId);
                if (task) openEdit(task);
                setSaveNotice(null);
              }}
              className="text-xs font-semibold text-teal-300 hover:text-teal-200 transition-colors"
            >
              عرض
            </button>
          </motion.div>
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
            style={{ top: tableDropdown.top + 10, right: tableDropdown.right }}
          >
            {tableDropdown.field === "assignee" && (
              <div className="w-[220px] flex flex-col max-h-[min(320px,60vh)]">
                <div className="p-1.5 border-b border-gray-100 dark:border-neutral-700">
                  <div className="relative">
                    <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      autoFocus
                      value={assignSearch}
                      onChange={(e) => setAssignSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && assignSearch.trim() && !assigneesList.some(a => a.toLowerCase() === assignSearch.trim().toLowerCase())) {
                          const name = assignSearch.trim();
                          setAssigneesList(p => [...p, name]);
                          const current = dt.assignMembers || [dt.assignee];
                          const next = [...current, name];
                          updateTask(dt.id, { assignee: next[0], assignMembers: next, assignMode: "me", assignTarget: undefined });
                          setAssignSearch("");
                        }
                      }}
                      placeholder="ابحث أو اكتب اسم موظف جديد..."
                      className="w-full bg-gray-50 dark:bg-neutral-900 border-none rounded-lg py-1.5 ps-3 pe-8 text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-1.5">
                  <p className="text-xs font-semibold text-neutral-400 px-3 py-1.5">اختر الشخص</p>
                  {assigneesList
                    .filter(name => name.toLowerCase().includes(assignSearch.toLowerCase()))
                    .map(name => (
                    <button key={name} type="button"
                      onClick={() => { 
                        const current = dt.assignMembers || [dt.assignee];
                        const next = current.includes(name) ? (current.length > 1 ? current.filter(x => x !== name) : current) : [...current, name];
                        updateTask(dt.id, { assignee: next[0], assignMembers: next, assignMode: "me", assignTarget: undefined }); 
                      }}
                      className={cn("w-full px-3 py-2 text-sm text-right flex items-center justify-between rounded-lg transition-colors", (dt.assignMembers || [dt.assignee]).includes(name) ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700/50")}>
                      <span>{name}</span>
                      {(dt.assignMembers || [dt.assignee]).includes(name) && <CheckSquare className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                  {assignSearch.trim() && !assigneesList.some(a => a.toLowerCase() === assignSearch.trim().toLowerCase()) && (
                    <button type="button"
                      onClick={() => {
                        const name = assignSearch.trim();
                        setAssigneesList(p => [...p, name]);
                        const current = dt.assignMembers || [dt.assignee];
                        const next = [...current, name];
                        updateTask(dt.id, { assignee: next[0], assignMembers: next, assignMode: "me", assignTarget: undefined });
                        setAssignSearch("");
                      }}
                      className="w-full px-3 py-2 text-sm text-right rounded-lg transition-colors flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 font-medium">
                      <Plus className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">إضافة الموظف "{assignSearch.trim()}"</span>
                    </button>
                  )}
                </div>
                <div className="p-1.5 border-t border-gray-100 dark:border-neutral-700">
                  <button onClick={() => setTableDropdown(null)} className="w-full py-1.5 text-xs font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors">تم</button>
                </div>
              </div>
            )}
            {tableDropdown.field === "project" && (
              <div className="w-[220px] flex flex-col max-h-[min(320px,60vh)]">
                <div className="p-1.5 border-b border-gray-100 dark:border-neutral-700">
                  <div className="relative">
                    <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      autoFocus
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && projectSearch.trim()) {
                          const name = projectSearch.trim();
                          if (!projectsList.includes(name)) setProjectsList(p => [...p, name]);
                          updateTask(dt.id, { projectName: name });
                          setProjectSearch("");
                          setTableDropdown(null);
                        }
                      }}
                      placeholder="ابحث أو اكتب اسم مشروع جديد..."
                      className="w-full bg-gray-50 dark:bg-neutral-900 border-none rounded-lg py-1.5 ps-3 pe-8 text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-1.5">
                  <p className="text-xs font-semibold text-neutral-400 px-3 py-1.5">المشروع</p>
                  {projectsList
                    .filter(p => p.toLowerCase().includes(projectSearch.toLowerCase()))
                    .map(p => (
                    <button key={p} type="button"
                      onClick={() => { updateTask(dt.id, { projectName: p }); setTableDropdown(null); }}
                      className={cn("w-full px-3 py-2 text-sm text-right rounded-lg transition-colors", dt.projectName === p ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700/50")}>
                      {p}
                    </button>
                  ))}
                  {projectSearch.trim() && !projectsList.some(p => p.toLowerCase() === projectSearch.trim().toLowerCase()) && (
                    <button type="button"
                      onClick={() => {
                        const name = projectSearch.trim();
                        setProjectsList(p => [...p, name]);
                        updateTask(dt.id, { projectName: name });
                        setProjectSearch("");
                        setTableDropdown(null);
                      }}
                      className="w-full px-3 py-2 text-sm text-right rounded-lg transition-colors flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 font-medium">
                      <Plus className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">إضافة المشروع "{projectSearch.trim()}"</span>
                    </button>
                  )}
                </div>
              </div>
            )}
            {tableDropdown.field === "source" && (
              <div className="p-1.5 w-[180px] max-h-[min(320px,60vh)] overflow-y-auto">
                <p className="text-xs font-semibold text-neutral-400 px-3 py-1.5">المصدر</p>
                {SOURCES.map(s => (
                  <button key={s} type="button"
                    onClick={() => { updateTask(dt.id, { taskSource: s }); setTableDropdown(null); }}
                    className={cn("w-full px-3 py-2 text-sm text-right rounded-lg transition-colors", dt.taskSource === s ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700/50")}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            {tableDropdown.field === "progress" && (
              dt.assignMembers && dt.assignMembers.length > 1 ? (
                <div className="w-[320px] space-y-2.5 p-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">إنجاز فريق المهمة</label>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{dt.assignMembers.length} موظفين</span>
                  </div>
                  <div className="space-y-2 pt-1.5 border-t border-neutral-100 dark:border-neutral-700">
                    {dt.assignMembers.map(m => {
                      const mp = (dt.memberProgress || {})[m] ?? 0;
                      return (
                        <div key={m} className="flex items-center gap-2">
                          <img src={avatarUrl(m)} alt={m} className="w-5 h-5 rounded-full object-cover shrink-0" />
                          <div className="flex min-w-0 flex-col">
                            <span className="w-20 shrink-0 truncate text-xs font-medium text-neutral-700 dark:text-neutral-200" title={m}>{m}</span>
                          </div>
                          {(dt.progressMode || "individual") === "individual" && <input
                            type="range" min={0} max={100} value={mp}
                            onChange={e => {
                              const val = parseInt(e.target.value);
                              const nextMp = { ...(dt.memberProgress || {}), [m]: val };
                              const members = dt.assignMembers || [];
                              const avg = members.length > 0 ? Math.round(members.reduce((s, x) => s + (nextMp[x] ?? 0), 0) / members.length) : val;
                              updateTask(dt.id, { memberProgress: nextMp, progress: avg });
                            }}
                            className="progress-slider flex-1 cursor-pointer"
                          />}
                          {(dt.progressMode || "individual") === "individual" && <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300 w-8 text-left tabular-nums shrink-0">{mp}%</span>}
                          {dt.progressMode === "collective" && <span className="min-w-0 flex-1 truncate text-[9px] text-neutral-400">مشترك في {dt.progress}%</span>}
                        </div>
                      );
                    })}
                  </div>
                  <fieldset className="flex items-center gap-4 border-t border-neutral-100 pt-2 dark:border-neutral-700">
                    <legend className="sr-only">طريقة احتساب الإنجاز</legend>
                    <label className="flex cursor-pointer items-center gap-1.5 text-[10px] font-medium text-neutral-600 dark:text-neutral-300">
                      <input type="radio" name={`progress-mode-${dt.id}`} checked={(dt.progressMode || "individual") === "individual"} onChange={() => updateTask(dt.id, { progressMode: "individual" })} className="h-3.5 w-3.5 cursor-pointer accent-black" />
                      فردي
                    </label>
                    <label className="flex cursor-pointer items-center gap-1.5 text-[10px] font-medium text-neutral-600 dark:text-neutral-300">
                      <input type="radio" name={`progress-mode-${dt.id}`} checked={dt.progressMode === "collective"} onChange={() => updateTask(dt.id, { progressMode: "collective" })} className="h-3.5 w-3.5 cursor-pointer accent-black" />
                      جماعي
                    </label>
                  </fieldset>
                  {dt.progressMode === "collective" && (
                    <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-2 dark:border-neutral-700 dark:bg-neutral-900/40">
                      <div className="mb-1.5 flex items-center justify-between text-[10px]">
                        <span className="text-neutral-500 dark:text-neutral-400">النسبة المشتركة</span>
                        <span className="font-bold tabular-nums text-teal-700 dark:text-teal-300">{dt.progress}%</span>
                      </div>
                      <input type="range" min={0} max={100} value={dt.progress} onChange={e => updateTask(dt.id, { progress: parseInt(e.target.value || "0", 10) || 0 })} className="progress-slider w-full cursor-pointer" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 w-[220px]">
                  <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">نسبة الإنجاز: {dt.progress}%</label>
                  <input type="range" min={0} max={100} value={dt.progress}
                    onChange={e => updateTask(dt.id, { progress: parseInt(e.target.value || "0", 10) || 0 })}
                    className="progress-slider w-full cursor-pointer" />
                </div>
              )
            )}
            {tableDropdown.field === "dueDate" && (
              <div className="p-3 w-[240px] space-y-3">
                <div>
                  <label className="block text-[10px] font-medium text-neutral-400 mb-1 px-1 text-right">تاريخ البدء</label>
                  <input type="date" value={dt.startDate || ""}
                    onChange={e => updateTask(dt.id, { startDate: e.target.value })}
                    className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-right focus:outline-none focus:ring-1 focus:ring-teal-400" />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-neutral-400 mb-1 px-1 text-right">الموعد النهائي</label>
                  <input type="date" value={dt.dueDate}
                    onChange={e => updateTask(dt.id, { dueDate: e.target.value })}
                    className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-right focus:outline-none focus:ring-1 focus:ring-teal-400" />
                </div>
                <button onClick={() => setTableDropdown(null)} className="w-full py-1.5 text-xs font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors">تم</button>
              </div>
            )}
            {tableDropdown.field === "priority" && (
              <div className="p-1.5 w-[170px] max-h-[min(320px,60vh)] overflow-y-auto">
                <p className="text-xs font-semibold text-neutral-400 px-3 py-1.5">الأولوية</p>
                {(["low", "medium", "high", "urgent"] as TaskPriority[]).map(p => (
                  <button key={p} type="button"
                    onClick={() => { updateTask(dt.id, { priority: p }); setTableDropdown(null); }}
                    className={cn("w-full px-3 py-2 text-sm text-right flex items-center justify-between rounded-lg transition-colors", dt.priority === p ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700/50")}>
                            <span>{PRIORITY_CONFIG[p].label}</span>
                            <Flag className={cn("w-4 h-4", PRIORITY_CONFIG[p].flag)} />
                  </button>
                ))}
              </div>
            )}
            {tableDropdown.field === "status" && (
              <div className="p-1.5 w-[180px] max-h-[min(320px,60vh)] overflow-y-auto">
                <p className="text-xs font-semibold text-neutral-400 px-3 py-1.5">الحالة</p>
                {(["todo","in-progress","in-review","overdue","completed"] as TaskStatus[]).map(s => (
                  <button key={s} type="button"
                    onClick={() => { updateTask(dt.id, { status: s }); setTableDropdown(null); }}
                    className={cn("w-full px-3 py-2 text-sm text-right flex items-center gap-2 rounded-lg transition-colors", dt.status === s ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700/50")}>
                    <span className={cn("w-2 h-2 rounded-full shrink-0", STATUS_CONFIG[s].headerDot)} />
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            )}
            {tableDropdown.field === "action" && (
              <div className="py-1 min-w-[120px]">
                <button
                  onClick={() => { openEdit(dt); setTableDropdown(null); }}
                  className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700/50 text-right transition-colors"
                >
                  تعديل
                </button>
                <button
                  onClick={() => { remove(dt.id); setTableDropdown(null); }}
                  className="w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-right transition-colors"
                >
                  حذف
                </button>
              </div>
            )}
          </div>
        );
      })()}
      {videoRecorderTarget && (
        <VideoRecorderOverlay
          onRecorded={(att) => {
            if (videoRecorderTarget === 'detail') {
              setDetailCommentAttachments(p => [...p, att]);
            } else {
              setFormCommentAttachments(p => [...p, att]);
            }
            setVideoRecorderTarget(null);
          }}
          onClose={() => setVideoRecorderTarget(null)}
        />
      )}
    </div>
  );
}
