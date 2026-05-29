import { useState, useEffect, useMemo } from "react";
import { Plus, Search, X, MoreHorizontal, CheckCircle2, Circle, AlertCircle, Clock, ArrowLeft, Megaphone, Users, FileText, Camera, Layout, Eye, Code, Rocket, Activity, BarChart3, Archive, Trash2, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

type StageStatus = "pending" | "in-progress" | "completed" | "blocked";
type CampaignStatus = "draft" | "active" | "paused" | "completed" | "archived";

interface CampaignStage {
  id: string;
  title: string;
  team: string;
  status: StageStatus;
  notes: string;
  startedAt: string | null;
  completedAt: string | null;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  progress: number;
  stages: CampaignStage[];
  createdAt: string;
  budget?: string;
  targetAudience?: string;
}

const STORAGE_KEY = "perfume-campaigns-v1";

const DEFAULT_STAGES: Omit<CampaignStage, "id">[] = [
  { title: "إنشاء الحملة (المنتجات + الأسعار + تاريخ الإطلاق)", team: "فريق المنتجات", status: "pending", notes: "", startedAt: null, completedAt: null },
  { title: "اعتماد الحملة والأسعار", team: "إدارة المبيعات", status: "pending", notes: "", startedAt: null, completedAt: null },
  { title: "استلام ملفات المنتجات وتجهيز بيانات المتجر", team: "فريق التجارة الإلكترونية", status: "pending", notes: "", startedAt: null, completedAt: null },
  { title: "تصوير المنتجات وتجهيز الصور والفيديو", team: "فريق الإبداع", status: "pending", notes: "", startedAt: null, completedAt: null },
  { title: "تصميم البنرات والإعلانات والمحتوى", team: "فريق التصميم", status: "pending", notes: "", startedAt: null, completedAt: null },
  { title: "مراجعة واعتماد التصاميم", team: "لجنة التسويق", status: "pending", notes: "", startedAt: null, completedAt: null },
  { title: "الاعتماد النهائي للحملة", team: "المدير العام", status: "pending", notes: "", startedAt: null, completedAt: null },
  { title: "تحويل التصاميم إلى Prototype وواجهات UX/UI", team: "فريق UX", status: "pending", notes: "", startedAt: null, completedAt: null },
  { title: "اعتماد الواجهات النهائية", team: "المدير التقني + المدير العام", status: "pending", notes: "", startedAt: null, completedAt: null },
  { title: "تطوير الحملة على الموقع والتطبيقات", team: "فريق تطوير الواجهات", status: "pending", notes: "", startedAt: null, completedAt: null },
  { title: "رفع البنرات والمحتوى والأسعار على المنصات", team: "فريق المنتجات / التجارة الإلكترونية", status: "pending", notes: "", startedAt: null, completedAt: null },
  { title: "اختبار الحملة واكتشاف الأخطاء", team: "فريق ضمان الجودة", status: "pending", notes: "", startedAt: null, completedAt: null },
  { title: "إطلاق الحملة", team: "Launch", status: "pending", notes: "", startedAt: null, completedAt: null },
  { title: "مراقبة الأداء والمبيعات والمشاكل", team: "فريق المراقبة", status: "pending", notes: "", startedAt: null, completedAt: null },
  { title: "رفع تقرير الأداء النهائي بعد أسبوعين", team: "فريق التحليلات", status: "pending", notes: "", startedAt: null, completedAt: null },
  { title: "إغلاق وأرشفة الحملة", team: "Campaign Completed", status: "pending", notes: "", startedAt: null, completedAt: null },
];

function createDefaultStages(): CampaignStage[] {
  return DEFAULT_STAGES.map((s, i) => ({ ...s, id: `stage-${i + 1}` }));
}

function getInitialCampaigns(): Campaign[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) { try { return JSON.parse(saved); } catch { /* fall */ } }
  return [
    {
      id: "CMP-2026-001",
      name: "حملة عيد الفطر 2026",
      description: "حملة ترويجية شاملة لعطور العيد مع باقات هدايا مميزة",
      status: "active",
      startDate: "2026-04-01",
      endDate: "2026-05-05",
      progress: 45,
      budget: "250,000 ر.س",
      targetAudience: "عملاء الفروع والمتجر الإلكتروني",
      createdAt: "2026-03-15",
      stages: createDefaultStages().map((s, i) => ({ ...s, status: i < 7 ? "completed" : i === 7 ? "in-progress" : "pending" as StageStatus })),
    },
    {
      id: "CMP-2026-002",
      name: "حملة الصيف - عطور موسمية",
      description: "إطلاق تشكيلة عطور الصيف الجديدة مع عروض مميزة",
      status: "draft",
      startDate: "2026-06-01",
      endDate: "2026-08-31",
      progress: 10,
      budget: "180,000 ر.س",
      targetAudience: "العملاء الشباب والعائلات",
      createdAt: "2026-05-10",
      stages: createDefaultStages().map((s, i) => ({ ...s, status: i < 2 ? "completed" : i === 2 ? "in-progress" : "pending" as StageStatus })),
    },
    {
      id: "CMP-2026-003",
      name: "حملة اليوم الوطني 96",
      description: "حملة خاصة باليوم الوطني السعودي مع تخفيضات حصرية",
      status: "paused",
      startDate: "2026-09-20",
      endDate: "2026-09-25",
      progress: 30,
      budget: "300,000 ر.س",
      targetAudience: "جميع العملاء",
      createdAt: "2026-04-20",
      stages: createDefaultStages().map((s, i) => ({ ...s, status: i < 4 ? "completed" : i === 4 ? "blocked" : "pending" as StageStatus })),
    },
  ];
}

const STATUS_CONFIG: Record<CampaignStatus, { label: string; badgeBg: string; badgeText: string; dot: string }> = {
  draft:     { label: "مسودة", badgeBg: "bg-gray-100", badgeText: "text-gray-700", dot: "bg-gray-400" },
  active:    { label: "نشطة", badgeBg: "bg-teal-50", badgeText: "text-teal-700", dot: "bg-teal-500" },
  paused:    { label: "متوقفة", badgeBg: "bg-amber-50", badgeText: "text-amber-700", dot: "bg-amber-500" },
  completed: { label: "منتهية", badgeBg: "bg-blue-50", badgeText: "text-blue-700", dot: "bg-blue-500" },
  archived:  { label: "مؤرشفة", badgeBg: "bg-neutral-100", badgeText: "text-neutral-700", dot: "bg-neutral-500" },
};

const STAGE_STATUS_CONFIG: Record<StageStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  pending:     { label: "قيد الانتظار", icon: Circle, color: "text-gray-400", bg: "bg-gray-100" },
  "in-progress": { label: "قيد التنفيذ", icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
  completed:   { label: "مكتملة", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
  blocked:     { label: "متوقفة", icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
};

function fmtDate(d: string) {
  if (!d) return "";
  const [y, m, day] = d.split("-").map(Number);
  const months = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  return `${day} ${months[m - 1]}، ${y}`;
}

function calcProgress(stages: CampaignStage[]) {
  if (!stages.length) return 0;
  const completed = stages.filter(s => s.status === "completed").length;
  return Math.round((completed / stages.length) * 100);
}

export default function CampaignsPage({ onBack }: { onBack?: () => void }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => getInitialCampaigns());
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns)); }, [campaigns]);

  const [form, setForm] = useState<Partial<Campaign>>({
    name: "", description: "", status: "draft", startDate: "", endDate: "", budget: "", targetAudience: "", progress: 0,
  });

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return campaigns;
    return campaigns.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  }, [campaigns, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", status: "draft", startDate: today, endDate: "", budget: "", targetAudience: "", progress: 0 });
    setModalOpen(true);
  };

  const openEdit = (c: Campaign) => {
    setEditing(c);
    setForm({ ...c });
    setMenuOpen(null);
    setModalOpen(true);
  };

  const save = () => {
    if (!form.name?.trim()) return;
    if (editing) {
      setCampaigns(p => p.map(c => c.id === editing.id ? { ...c, ...form, progress: calcProgress(c.stages) } as Campaign : c));
    } else {
      const uid = "CMP-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 900) + 100);
      const newCampaign: Campaign = {
        id: uid,
        name: form.name || "",
        description: form.description || "",
        status: (form.status as CampaignStatus) || "draft",
        startDate: form.startDate || today,
        endDate: form.endDate || "",
        budget: form.budget || "",
        targetAudience: form.targetAudience || "",
        progress: 0,
        stages: createDefaultStages(),
        createdAt: today,
      };
      setCampaigns(p => [...p, newCampaign]);
    }
    setModalOpen(false);
  };

  const remove = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الحملة؟")) {
      setCampaigns(p => p.filter(c => c.id !== id));
      setMenuOpen(null);
    }
  };

  const openWorkflow = (c: Campaign) => {
    setSelectedCampaign(c);
    setWorkflowOpen(true);
  };

  const updateStageStatus = (campaignId: string, stageId: string, newStatus: StageStatus) => {
    setCampaigns(p => p.map(c => {
      if (c.id !== campaignId) return c;
      const newStages = c.stages.map(s => {
        if (s.id !== stageId) return s;
        return {
          ...s,
          status: newStatus,
          startedAt: newStatus === "in-progress" && !s.startedAt ? today : s.startedAt,
          completedAt: newStatus === "completed" ? today : s.completedAt,
        };
      });
      return { ...c, stages: newStages, progress: calcProgress(newStages) };
    }));
  };

  const stageIcon = (team: string) => {
    if (team.includes("منتجات")) return FileText;
    if (team.includes("مبيعات")) return BarChart3;
    if (team.includes("تجارة")) return Activity;
    if (team.includes("إبداع") || team.includes("تصوير")) return Camera;
    if (team.includes("تصميم") || team.includes("UX")) return Layout;
    if (team.includes("تسويق")) return Megaphone;
    if (team.includes("المدير")) return Users;
    if (team.includes("تقني") || team.includes("تطوير")) return Code;
    if (team.includes("جودة")) return Eye;
    if (team.includes("Launch")) return Rocket;
    if (team.includes("مراقبة")) return Activity;
    if (team.includes("تحليلات")) return BarChart3;
    if (team.includes("Completed")) return Archive;
    return CheckCircle2;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 font-sans" dir="rtl">
      {/* Toolbar */}
      <div className="sticky top-0 z-40 bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 px-4 sm:px-6 py-3 flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث في الحملات..."
            className="w-full pr-9 pl-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 text-right" />
        </div>
        <div className="mr-auto flex items-center gap-2">
          <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> إضافة حملة
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "الحملات النشطة", value: campaigns.filter(c => c.status === "active").length, color: "text-teal-600", bg: "bg-teal-50" },
            { label: "قيد التنفيذ", value: campaigns.filter(c => c.status === "active" || c.status === "draft").length, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "منتهية", value: campaigns.filter(c => c.status === "completed").length, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "إجمالي الحملات", value: campaigns.length, color: "text-neutral-600", bg: "bg-neutral-100" },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-neutral-800 rounded-xl border border-gray-100 dark:border-neutral-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Campaigns Table */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-neutral-700">
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">رقم الحملة</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">اسم الحملة</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">الحالة</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">الإنجاز</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">تاريخ البدء</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">تاريخ الانتهاء</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const cfg = STATUS_CONFIG[c.status];
                  return (
                    <tr key={c.id} className="border-b border-gray-50 dark:border-neutral-700/50 hover:bg-gray-50/60 dark:hover:bg-neutral-700/20 transition-colors">
                      <td className="px-4 py-3.5 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap font-mono text-right">{c.id}</td>
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{c.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[240px]">{c.description}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-md", cfg.badgeBg, cfg.badgeText)}>{cfg.label}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 rounded-full bg-gray-100 dark:bg-neutral-700 overflow-hidden">
                            <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${c.progress}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{c.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{fmtDate(c.startDate)}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{fmtDate(c.endDate)}</td>
                      <td className="px-4 py-3.5 text-center relative">
                        <div className="inline-flex items-center gap-1">
                          <button onClick={() => openWorkflow(c)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 text-teal-500 hover:text-teal-600 transition-colors" title="سير العمل">
                            <Activity className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setMenuOpen(menuOpen === c.id ? null : c.id); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-400 hover:text-gray-600 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                        {menuOpen === c.id && (
                          <div className="absolute left-1/2 -translate-x-1/2 top-10 z-50 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-lg shadow-lg py-1 min-w-[120px]">
                            <button onClick={() => openEdit(c)} className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700 flex items-center gap-2"><Edit3 className="w-3.5 h-3.5" /> تعديل</button>
                            <button onClick={() => remove(c.id)} className="w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" /> حذف</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="text-center py-16 text-gray-400 text-sm">لا توجد حملات مطابقة</div>}
        </div>
      </div>

      {/* Workflow Modal */}
      <AnimatePresence>
        {workflowOpen && selectedCampaign && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setWorkflowOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-neutral-700 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{selectedCampaign.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedCampaign.description}</p>
                </div>
                <button onClick={() => setWorkflowOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-400"><X className="w-5 h-5" /></button>
              </div>

              {/* Progress bar */}
              <div className="px-6 py-3 border-b border-gray-100 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-700/20 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">تقدم الحملة</span>
                  <span className="text-sm font-bold text-teal-600">{selectedCampaign.progress}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-neutral-700 overflow-hidden">
                  <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${selectedCampaign.progress}%` }} />
                </div>
              </div>

              {/* Timeline */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute right-[19px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-neutral-700" />

                  <div className="space-y-6">
                    {selectedCampaign.stages.map((stage) => {
                      const sCfg = STAGE_STATUS_CONFIG[stage.status];
                      const Icon = stageIcon(stage.team);
                      return (
                        <div key={stage.id} className="relative flex items-start gap-4">
                          {/* Node */}
                          <div className="relative z-10 shrink-0">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                              stage.status === "completed" ? "bg-emerald-50 border-emerald-500 text-emerald-600" :
                              stage.status === "in-progress" ? "bg-blue-50 border-blue-500 text-blue-600" :
                              stage.status === "blocked" ? "bg-red-50 border-red-500 text-red-600" :
                              "bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-400"
                            )}>
                              <Icon className="w-4 h-4" />
                            </div>
                          </div>

                          {/* Card */}
                          <div className="flex-1 min-w-0 -mt-1">
                            <div className={cn(
                              "rounded-xl border p-4 transition-colors",
                              stage.status === "in-progress" ? "border-blue-200 dark:border-blue-800/40 bg-blue-50/30 dark:bg-blue-900/10" :
                              stage.status === "completed" ? "border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/20 dark:bg-emerald-900/10" :
                              stage.status === "blocked" ? "border-red-200 dark:border-red-800/40 bg-red-50/20 dark:bg-red-900/10" :
                              "border-gray-100 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                            )}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{stage.team}</span>
                                  </div>
                                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">{stage.title}</p>
                                  {stage.notes && <p className="text-xs text-gray-500 dark:text-gray-400">{stage.notes}</p>}
                                  <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                                    {stage.startedAt && <span>بدأ: {fmtDate(stage.startedAt)}</span>}
                                    {stage.completedAt && <span>اكتمل: {fmtDate(stage.completedAt)}</span>}
                                  </div>
                                </div>
                                <div className="shrink-0">
                                  <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-md", sCfg.bg, sCfg.color)}>{sCfg.label}</span>
                                </div>
                              </div>

                              {/* Status actions */}
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-neutral-700/50">
                                {(["pending", "in-progress", "completed", "blocked"] as StageStatus[]).map(st => (
                                  <button
                                    key={st}
                                    onClick={() => updateStageStatus(selectedCampaign.id, stage.id, st)}
                                    className={cn(
                                      "text-[11px] font-medium px-2.5 py-1 rounded-md border transition-colors",
                                      stage.status === st
                                        ? "bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-900/20 dark:border-teal-700"
                                        : "bg-white dark:bg-neutral-700 border-gray-200 dark:border-neutral-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-600"
                                    )}
                                  >
                                    {STAGE_STATUS_CONFIG[st].label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-neutral-700">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">{editing ? "تعديل حملة" : "إضافة حملة"}</h3>
                <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-400"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-3.5">
                <div><label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">اسم الحملة</label>
                  <input value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400/40 text-right" placeholder="مثال: حملة عيد الفطر" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">الوصف</label>
                  <textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400/40 resize-none text-right" placeholder="وصف مختصر للحملة" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">تاريخ البدء</label>
                    <input type="date" value={form.startDate || ""} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full rounded-lg border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none" dir="ltr" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">تاريخ الانتهاء</label>
                    <input type="date" value={form.endDate || ""} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full rounded-lg border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none" dir="ltr" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">الميزانية</label>
                    <input value={form.budget || ""} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} className="w-full rounded-lg border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none text-right" placeholder="مثال: 100,000 ر.س" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">الجمهور المستهدف</label>
                    <input value={form.targetAudience || ""} onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))} className="w-full rounded-lg border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none text-right" placeholder="مثال: الشباب 18-35" /></div>
                </div>
                <div><label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">الحالة</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as CampaignStatus }))} className="w-full rounded-lg border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none text-right">
                    {(["draft", "active", "paused", "completed", "archived"] as CampaignStatus[]).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                  </select></div>
              </div>
              <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-100 dark:border-neutral-700">
                <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 transition-colors">إلغاء</button>
                <button onClick={save} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 transition-colors">حفظ الحملة</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
