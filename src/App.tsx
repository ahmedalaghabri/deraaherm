import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import AttendanceDashboard from "./components/AttendanceDashboard";
import HazerSystem from "./components/HazerSystem";
import AnnualLeaveForm from "./components/AnnualLeaveForm";
import OutboxPage from "./components/OutboxPage";
import InboxPage from "./components/InboxPage";
import TransactionDetailsPage from "./components/TransactionDetailsPage";
import ExitPermitForm from "./components/ExitPermitForm";
import TransportAllowanceForm from "./components/TransportAllowanceForm";
import SalesPerformancePage from "./components/SalesPerformancePage";
import TasksPage from "./components/TasksPage";
import CampaignsPage from "./components/CampaignsPage";
import SaudiCalendar from "./components/SaudiCalendar";
import { supabase } from "./lib/supabase";
import { Bell, Search, Settings, LogOut, Inbox, Send, FileText, Users, ShieldCheck, ClipboardList, Award, Accessibility, GaugeCircle, Sparkles, ChevronRight, ChevronLeft, ChevronDown, Upload, X, Save, Check, ArrowRight, Tag, Calendar, Building2, Shield, AlertTriangle, Clock, CheckCircle, Phone, Archive, FilePlus, Mail, BarChart3, LayoutDashboard, ArrowLeftRight, ExternalLink, Globe, Database, MessageSquare, TrendingUp, FileSpreadsheet, Briefcase, CreditCard, Home, Car, Plane, Heart, GraduationCap, Baby, MapPin, Zap, User, Lock, Eye, EyeOff, Smartphone, CircleUser as UserCircle, ListTodo, Megaphone, Languages, Type, Moon, Sun, UserPlus, Trophy } from "lucide-react";
import { AIProvider } from "./components/ai/AIContext";
import { FloatingAssistant } from "./components/ai/FloatingAssistant";
import { ChatPanel } from "./components/ai/ChatPanel";

// ====== مجموعات القائمة الجانبية ======
const sidebarGroups = [
  {
    label: "الرئيسية",
    items: [
      { key: "tasks",        title: "المهام",     icon: ListTodo },
      { key: "sales_kpi",    title: "الأداء",     icon: TrendingUp },
      { key: "transactions", title: "المعاملات",  icon: ArrowLeftRight },
      { key: "attendance",   title: "الحضور",     icon: Calendar },
      { key: "notifications",title: "التنبيهات", icon: Bell },
      { key: "shortcuts",    title: "اختصارات",  icon: Zap },
    ],
  },
];

// ====== مكوّنات مساعدة ======
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function PageShell({ title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-neutral-600">
        <span className="font-medium">{title}</span>
      </div>
      <div className="rounded-2xl border border-neutral-200 bg-white dark:bg-neutral-800 p-4 sm:p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}

// ====== السلايدر ======
function ImageSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      id: 1,
      title: "",
      subtitle: "",
      image: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
      gradient: ""
    },
    {
      id: 2,
      title: "خدمات متطورة وسهلة الاستخدام",
      subtitle: "تجربة مستخدم محسّنة لجميع احتياجاتك الإدارية",
      image: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
      gradient: ""
    },
    {
      id: 3,
      title: "أمان وموثوقية عالية",
      subtitle: "حماية بياناتك وخصوصيتك أولويتنا القصوى",
      image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
      gradient: ""
    }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden mb-8">
      {slides.map((slide, index) => (
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: currentSlide === index ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
          <div className="relative h-full flex items-center justify-center text-center text-white p-6">
            <div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4"
              >
                {slide.title}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg sm:text-xl opacity-90"
              >
                {slide.subtitle}
              </motion.p>
            </div>
          </div>
        </motion.div>
      ))}
      
      {/* مؤشرات السلايدر */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              currentSlide === index ? 'bg-white dark:bg-neutral-800' : 'bg-white dark:bg-neutral-800/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ====== بطاقات الروابط الخارجية ======
function ExternalLinksSection() {
  const externalLinks = [
    {
      title: "استعلامات الموارد البشرية",
      description: "استعلم عن راتبك ومستحقاتك",
      icon: Users,
      url: "#",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "نظام الأرشفة الإلكترونية",
      description: "إدارة وأرشفة المستندات",
      icon: Archive,
      url: "#",
      color: "from-green-500 to-green-600"
    },
    {
      title: "نظام متابعة المهام",
      description: "تتبع وإدارة المهام اليومية",
      icon: ClipboardList,
      url: "#",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "إيميل درعه",
      description: "البريد الإلكتروني الداخلي",
      icon: Mail,
      url: "#",
      color: "from-red-500 to-red-600"
    },
    {
      title: "الإيميل الخارجي",
      description: "البريد الإلكتروني الخارجي",
      icon: Globe,
      url: "#",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      title: "المبيعات اليومية",
      description: "تقارير المبيعات والإحصائيات",
      icon: TrendingUp,
      url: "#",
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "لوحة تحكم البوابة",
      description: "إدارة وتحكم البوابة",
      icon: LayoutDashboard,
      url: "#",
      color: "from-teal-500 to-teal-600"
    },
    {
      title: "لوحة تحكم الايميل",
      description: "إدارة البريد الإلكتروني",
      icon: MessageSquare,
      url: "#",
      color: "from-pink-500 to-pink-600"
    },
    {
      title: "تقارير المعاملات",
      description: "تقارير شاملة للمعاملات",
      icon: FileSpreadsheet,
      url: "#",
      color: "from-cyan-500 to-cyan-600"
    },
    {
      title: "متابعة التحويلات والاستلامات",
      description: "تتبع التحويلات المالية",
      icon: ArrowLeftRight,
      url: "#",
      color: "from-amber-500 to-amber-600"
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-6 text-neutral-800">الروابط الخارجية</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {externalLinks.map((link, index) => (
          <motion.a
            key={link.title}
            href={link.url}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group block p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${link.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <link.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-sm mb-1 text-neutral-800 group-hover:text-blue-600 transition-colors">
              {link.title}
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {link.description}
            </p>
            <div className="mt-2 flex items-center text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>فتح الرابط</span>
              <ExternalLink className="w-3 h-3 mr-1" />
            </div>
          </motion.a> 
        ))}
      </div>
    </div>
  );
}

// ====== صفحة اختيار نوع المعاملة ======
function TransactionSelectionPage({ onCancel, onTransactionSelect }) {
  const transactionTypes = [
    {
      id: "annual_leave",
      title: "إجازة سنوية",
      description: "طلب إجازة سنوية اعتيادية",
      icon: Calendar,
      color: "from-green-500 to-emerald-600",
      department: "الموارد البشرية"
    },
    {
      id: "sick_leave",
      title: "إجازة مرضية",
      description: "طلب إجازة مرضية بتقرير طبي",
      icon: Heart,
      color: "from-red-500 to-rose-600",
      department: "الموارد البشرية"
    },
    {
      id: "business_trip",
      title: "مأمورية عمل",
      description: "طلب مأمورية عمل داخلية أو خارجية",
      icon: Briefcase,
      color: "from-blue-500 to-sky-600",
      department: "الشؤون الإدارية"
    },
    {
      id: "training_course",
      title: "دورة تدريبية",
      description: "طلب التحاق بدورة تدريبية",
      icon: GraduationCap,
      color: "from-purple-500 to-violet-600",
      department: "التطوير والتدريب"
    },
    {
      id: "advance_request",
      title: "طلب سلفة",
      description: "طلب سلفة مالية من الراتب",
      icon: CreditCard,
      color: "from-orange-500 to-amber-600",
      department: "الشؤون المالية"
    },
    {
      id: "housing_allowance",
      title: "بدل سكن",
      description: "طلب بدل سكن أو تعديل البدل",
      icon: Home,
      color: "from-teal-500 to-cyan-600",
      department: "الموارد البشرية"
    },
    {
      id: "transportation",
      title: "بدل مواصلات",
      description: "طلب بدل مواصلات أو تعديله",
      icon: Car,
      color: "from-indigo-500 to-blue-600",
      department: "الموارد البشرية"
    },
    {
      id: "maternity_leave",
      title: "إجازة أمومة",
      description: "طلب إجازة أمومة أو أبوة",
      icon: Baby,
      color: "from-pink-500 to-rose-600",
      department: "الموارد البشرية"
    },
    {
      id: "travel_ticket",
      title: "تذكرة سفر",
      description: "طلب تذكرة سفر للإجازة السنوية",
      icon: Plane,
      color: "from-sky-500 to-blue-600",
      department: "الشؤون الإدارية"
    },
    {
      id: "location_change",
      title: "نقل موقع العمل",
      description: "طلب نقل إلى موقع عمل آخر",
      icon: MapPin,
      color: "from-gray-500 to-slate-600",
      department: "الموارد البشرية"
    },
    {
      id: "overtime_request",
      title: "طلب عمل إضافي",
      description: "طلب اعتماد ساعات عمل إضافية",
      icon: Clock,
      color: "from-yellow-500 to-orange-600",
      department: "الموارد البشرية"
    },
    {
      id: "equipment_request",
      title: "طلب معدات",
      description: "طلب معدات أو أدوات عمل",
      icon: Zap,
      color: "from-violet-500 to-purple-600",
      department: "الشؤون الإدارية"
    }
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("الكل");

  const colorMap: Record<string, { card: string; iconWrap: string }> = {
    'from-green-500':  { card: 'bg-gradient-to-b from-emerald-50/80 to-white border-emerald-100', iconWrap: 'bg-emerald-100/60 text-emerald-700 border-emerald-200' },
    'from-red-500':    { card: 'bg-gradient-to-b from-rose-50/80 to-white border-rose-100',       iconWrap: 'bg-rose-100/60 text-rose-700 border-rose-200' },
    'from-blue-500':   { card: 'bg-gradient-to-b from-sky-50/80 to-white border-sky-100',         iconWrap: 'bg-sky-100/60 text-sky-700 border-sky-200' },
    'from-purple-500': { card: 'bg-gradient-to-b from-violet-50/80 to-white border-violet-100',   iconWrap: 'bg-violet-100/60 text-violet-700 border-violet-200' },
    'from-orange-500': { card: 'bg-gradient-to-b from-amber-50/80 to-white border-amber-100',     iconWrap: 'bg-amber-100/60 text-amber-700 border-amber-200' },
    'from-teal-500':   { card: 'bg-gradient-to-b from-teal-50/80 to-white border-teal-100',       iconWrap: 'bg-teal-100/60 text-teal-700 border-teal-200' },
    'from-indigo-500': { card: 'bg-gradient-to-b from-indigo-50/80 to-white border-indigo-100',   iconWrap: 'bg-indigo-100/60 text-indigo-700 border-indigo-200' },
    'from-pink-500':   { card: 'bg-gradient-to-b from-pink-50/80 to-white border-pink-100',       iconWrap: 'bg-pink-100/60 text-pink-700 border-pink-200' },
    'from-sky-500':    { card: 'bg-gradient-to-b from-sky-50/80 to-white border-sky-100',         iconWrap: 'bg-sky-100/60 text-sky-700 border-sky-200' },
    'from-gray-500':   { card: 'bg-gradient-to-b from-neutral-50/80 to-white border-neutral-100', iconWrap: 'bg-neutral-100/60 text-neutral-600 border-neutral-200' },
    'from-yellow-500': { card: 'bg-gradient-to-b from-yellow-50/80 to-white border-yellow-100',   iconWrap: 'bg-yellow-100/60 text-yellow-700 border-yellow-200' },
    'from-violet-500': { card: 'bg-gradient-to-b from-violet-50/80 to-white border-violet-100',   iconWrap: 'bg-violet-100/60 text-violet-700 border-violet-200' },
  };

  const departments = ["الكل", ...new Set(transactionTypes.map(t => t.department))];
  
  const filteredTransactions = transactionTypes.filter(transaction => {
    const matchesSearch = transaction.title.includes(searchTerm) || transaction.description.includes(searchTerm);
    const matchesDepartment = selectedDepartment === "الكل" || transaction.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div dir="rtl" className="min-h-screen bg-[radial-gradient(40%_40%_at_100%_0%,#eef2ff_0%,transparent_60%),radial-gradient(50%_40%_at_0%_100%,#fff1f2_0%,transparent_60%)] dark:bg-[radial-gradient(40%_40%_at_100%_0%,#1a1a2e_0%,transparent_60%),radial-gradient(50%_40%_at_0%_100%,#1a1a2e_0%,transparent_60%)]">
      <div className="mx-auto max-w-[1400px] p-3 sm:p-6 space-y-4 sm:space-y-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="rounded-2xl border border-sky-100 bg-gradient-to-b from-sky-50/70 to-white shadow-sm p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">اختر نوع المعاملة</h2>
              <p className="text-sm sm:text-base text-neutral-600">اختر نوع المعاملة التي تريد تقديمها من القائمة أدناه</p>
            </div>

            {/* البحث والفلترة */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="ابحث عن نوع المعاملة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl ps-10 pe-4 py-2.5 sm:py-3 bg-white dark:bg-neutral-800 border border-neutral-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm transition-shadow"
                />
              </div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="rounded-2xl px-4 py-2.5 sm:py-3 bg-white dark:bg-neutral-800 border border-neutral-200 focus:ring-2 focus:ring-blue-500 outline-none w-full sm:min-w-[200px] text-sm shadow-sm transition-shadow"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* شبكة المعاملات */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-6">
              {filteredTransactions.map((transaction, index) => {
                const colorKey = transaction.color.split(' ')[0];
                const style = colorMap[colorKey] ?? { card: 'bg-gradient-to-b from-neutral-50/80 to-white border-neutral-100', iconWrap: 'bg-neutral-100/60 text-neutral-600 border-neutral-200' };
                return (
                  <motion.button
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onTransactionSelect(transaction.id, transaction.title)}
                    className={cn('group rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 text-right flex flex-col', style.card)}
                  >
                    <div className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className={cn('grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl border shrink-0', style.iconWrap)}>
                          <transaction.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium leading-tight text-neutral-800">{transaction.title}</span>
                      </div>
                    </div>
                    <div className="pt-0 px-3 sm:px-4 pb-3 sm:pb-4">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{transaction.department}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {filteredTransactions.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 sm:py-16"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-neutral-100 flex items-center justify-center">
                  <Search className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-400" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-700 mb-2">لا توجد نتائج</h3>
                <p className="text-sm text-neutral-500">جرب تغيير كلمات البحث أو الفلتر</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ====== نموذج إضافة معاملة ======
function AddTransactionForm({ onCancel, onSaved }) {
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [tags, setTags] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const [form, setForm] = useState({
    direction: "صادر",
    type: "خطاب",
    title: "",
    refNo: "",
    date: "",
    dueDate: "",
    sender: "",
    receiver: "",
    priority: "عادي",
    confidentiality: "عادي",
    department: "",
    assignee: "",
    description: "",
  });

  function setField(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function validate() {
    const e = {};
    if (!form.title?.trim()) e.title = "العنوان مطلوب";
    if (!form.date) e.date = "التاريخ مطلوب";
    if (!form.direction) e.direction = "الاتجاه مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onFilesSelected(files) {
    const list = Array.from(files || []);
    if (!list.length) return;
    setAttachments((prev) => [
      ...prev,
      ...list.map((f) => ({ id: crypto.randomUUID?.() || String(Math.random()), name: f.name, size: f.size })),
    ]);
  }

  function removeAttachment(id) { setAttachments((prev) => prev.filter((a) => a.id !== id)); }
  function addTagFromInput(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = e.currentTarget.value.trim().replace(/,$/, "");
      if (val && !tags.includes(val)) setTags((t) => [...t, val]);
      e.currentTarget.value = "";
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      onSaved?.({ ...form, tags, attachments });
    }, 500);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-neutral-600">
        <button onClick={onCancel} className="inline-flex items-center gap-1 hover:underline">
          <ArrowRight className="h-4 w-4" /> الرئيسية
        </button>
        <span>/</span>
        <span className="font-medium">إضافة معاملة</span>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white dark:bg-neutral-800 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">إضافة معاملة</h2>
            <p className="text-sm text-neutral-500">أدخل تفاصيل المعاملة الجديدة، الحقول الأساسية مطلوبة.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="px-3 py-2 rounded-xl border border-neutral-200 hover:bg-blue-50 active:bg-blue-100 text-sm">إلغاء</button>
            <button onClick={handleSubmit} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-white disabled:opacity-50">
              {saving ? <Save className="h-4 w-4 animate-pulse" /> : <Check className="h-4 w-4" />}
              حفظ المعاملة
            </button>
          </div>
        </div>

        {saved && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 p-3 text-sm">تم حفظ المعاملة بنجاح.</div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* العمود 1 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">عنوان المعاملة<span className="text-red-600">*</span></label>
              <input value={form.title} onChange={(e) => setField("title", e.target.value)} className={cn("w-full rounded-xl px-3 py-2 bg-neutral-100 border", errors.title ? "border-red-500" : "border-neutral-200")} placeholder="مثال: طلب اعتماد عقد صيانة" />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">الاتجاه<span className="text-red-600">*</span></label>
                <select value={form.direction} onChange={(e) => setField("direction", e.target.value)} className={cn("w-full rounded-xl px-3 py-2 bg-neutral-100 border", errors.direction ? "border-red-500" : "border-neutral-200")}> 
                  <option>صادر</option>
                  <option>وارد</option>
                  <option>داخلي</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">نوع المعاملة</label>
                <select value={form.type} onChange={(e) => setField("type", e.target.value)} className="w-full rounded-xl px-3 py-2 bg-neutral-100 border border-neutral-200">
                  <option>خطاب</option>
                  <option>طلب</option>
                  <option>محضر</option>
                  <option>مذكرة</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">رقم المرجع</label>
                <input value={form.refNo} onChange={(e) => setField("refNo", e.target.value)} className="w-full rounded-xl px-3 py-2 bg-neutral-100 border border-neutral-200" placeholder="مثال: HR-2025-001" />
              </div>
              <div>
                <label className="block text-sm mb-1">التاريخ<span className="text-red-600">*</span></label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                  <input type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} className={cn("w-full rounded-xl ps-9 pe-3 py-2 bg-neutral-100 border", errors.date ? "border-red-500" : "border-neutral-200")} />
                </div>
                {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date}</p>}
              </div>
            </div>
          </div>
          {/* العمود 2 */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">الجهة المرسلة</label>
                <div className="relative">
                  <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                  <input value={form.sender} onChange={(e) => setField("sender", e.target.value)} className="w-full rounded-xl ps-9 pe-3 py-2 bg-neutral-100 border border-neutral-200" placeholder="اسم الجهة/القسم" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">الجهة المستلمة</label>
                <div className="relative">
                  <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                  <input value={form.receiver} onChange={(e) => setField("receiver", e.target.value)} className="w-full rounded-xl ps-9 pe-3 py-2 bg-neutral-100 border border-neutral-200" placeholder="اسم الجهة/القسم" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">الأولوية</label>
                <div className="relative">
                  <AlertTriangle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                  <select value={form.priority} onChange={(e) => setField("priority", e.target.value)} className="w-full rounded-xl ps-9 pe-3 py-2 bg-neutral-100 border border-neutral-200">
                    <option>عادي</option>
                    <option>عاجل</option>
                    <option>عاجل جدًا</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">درجة السرية</label>
                <div className="relative">
                  <Shield className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                  <select value={form.confidentiality} onChange={(e) => setField("confidentiality", e.target.value)} className="w-full rounded-xl ps-9 pe-3 py-2 bg-neutral-100 border border-neutral-200">
                    <option>عادي</option>
                    <option>سري</option>
                    <option>سري جدًا</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">تاريخ الاستحقاق</label>
                <input type="date" value={form.dueDate} onChange={(e) => setField("dueDate", e.target.value)} className="w-full rounded-xl px-3 py-2 bg-neutral-100 border border-neutral-200" />
              </div>
              <div>
                <label className="block text-sm mb-1">القسم/الإدارة</label>
                <input value={form.department} onChange={(e) => setField("department", e.target.value)} className="w-full rounded-xl px-3 py-2 bg-neutral-100 border border-neutral-200" placeholder="مثال: الموارد البشرية" />
              </div>
            </div>
          </div>
          {/* العمود 3 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">المكلف بالمعاملة</label>
              <input value={form.assignee} onChange={(e) => setField("assignee", e.target.value)} className="w-full rounded-xl px-3 py-2 bg-neutral-100 border border-neutral-200" placeholder="اسم الموظف" />
            </div>
            <div>
              <label className="block text-sm mb-1">وسوم</label>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs bg-neutral-200">
                    <Tag className="h-3 w-3" /> {t}
                    <button onClick={() => setTags((prev) => prev.filter((x) => x !== t))} className="ms-1"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <input onKeyDown={addTagFromInput} placeholder="اكتب الوسم ثم Enter" className="w-full rounded-xl px-3 py-2 bg-neutral-100 border border-neutral-200" />
            </div>
            <div>
              <label className="block text-sm mb-1">الوصف</label>
              <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={5} className="w-full rounded-xl px-3 py-2 bg-neutral-100 border border-neutral-200" placeholder="تفاصيل إضافية حول المعاملة" />
            </div>
          </div>
          {/* مرفقات */}
          <div className="lg:col-span-3">
            <label className="block text-sm mb-1">المرفقات</label>
            <div className="rounded-xl border border-dashed border-neutral-300 p-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="text-sm text-neutral-600">اسحب وأفلت الملفات هنا أو</div>
                <div className="flex items-center gap-2">
                  <input ref={fileInputRef} onChange={(e) => onFilesSelected(e.target.files)} type="file" multiple hidden />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 hover:bg-blue-50 active:bg-blue-100 text-sm"><Upload className="h-4 w-4" /> اختر ملفات</button>
                </div>
              </div>
              {!!attachments.length && (
                <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {attachments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm bg-white dark:bg-neutral-800">
                      <div className="truncate">{a.name}</div>
                      <button onClick={() => removeAttachment(a.id)} className="p-1 rounded-md hover:bg-blue-50 active:bg-blue-100"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ====== البيانات التجريبية للبطاقات (كاملة) ======
const cards = [
  { title: "التنبيهات", subtitle: "إشعارات النظام", icon: Bell, badge: 3, accent: "from-red-500/50 to-rose-500/50", action: "إخفاء التنبيهات" },
  { title: "عقد العمل الإلكتروني", subtitle: "إدارة العقود", icon: FileText, badge: 12, accent: "from-sky-500/50 to-blue-600/50", action: "عرض العقود" },
  { title: "المظهر الشخصي والزي", subtitle: "سياسات الزي", icon: Users, badge: null, accent: "from-indigo-500/50 to-violet-600/50", action: "التفاصيل" },
  { title: "الكفاءات الفنية والمهارية", subtitle: "مسارات التطوير", icon: Sparkles, badge: 4, accent: "from-fuchsia-500/50 to-pink-600/50", action: "استعراض" },
  { title: "سياسة تقييم الأداء الوظيفي", subtitle: "تقارير الأداء", icon: ClipboardList, badge: null, accent: "from-cyan-500/50 to-teal-600/50", action: "بدء التقييم" },
  { title: "الإجراءات التشغيلية الموحدة — SOP", subtitle: "دليل الإجراءات", icon: ShieldCheck, badge: null, accent: "from-slate-500/50 to-gray-600/50", action: "فتح الدليل" },
  { title: "تعليمات السلامة والصحة المهنية والبيئة", subtitle: "سلامة وجودة", icon: ShieldCheck, badge: null, accent: "from-lime-500/50 to-emerald-600/50", action: "استعراض" },
  { title: "دليل التعامل مع ذوي الإعاقة", subtitle: "تيسير الوصول", icon: Accessibility, badge: null, accent: "from-purple-500/50 to-indigo-600/50", action: "التفاصيل" },
  { title: "مسابقة التميز المؤسسي", subtitle: "مؤشرات التميز", icon: Award, badge: null, accent: "from-rose-500/50 to-red-600/50", action: "اشترك الآن" },
];

// بطاقات الصف الأول (تضم "معاملة جديد")
const primaryCards = [
  { title: "معاملة جديد", subtitle: "بدء معاملة جديدة", icon: FilePlus, badge: null, accent: "from-blue-500/50 to-sky-600/50", action: "بدء الإضافة", onAction: (setView) => setView("add") },
  { title: "الوارد", subtitle: "المكاتبات الواردة", icon: Inbox, badge: 0, accent: "from-emerald-500/50 to-green-600/50", action: "التفاصيل" },
  { title: "الصادر", subtitle: "إدارة الصادر", icon: Send, badge: 1, accent: "from-amber-500/50 to-orange-500/50", action: "التفاصيل" },
  { title: "تقرير الحضور", subtitle: "نسبة الالتزام اليوم", icon: Calendar, badge: null, accent: "from-indigo-500/50 to-violet-600/50", action: "عرض التقرير", onAction: (setView) => setView("attendance_report") },
];

// ====== Reminder Carousel Component ======
function ReminderCarousel({ setView, setActiveKey, setTransactionsSubTab }: {
  setView: React.Dispatch<React.SetStateAction<string>>;
  setActiveKey: React.Dispatch<React.SetStateAction<string>>;
  setTransactionsSubTab: React.Dispatch<React.SetStateAction<'new'|'inbox'|'outbox'|'archive'>>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const cards = [
    { type: "معاملة طارئة", title: "سداد مستحقات إيجار فرع الروابي تجنباً للإغلاق", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", action: () => { setView("transactions"); setActiveKey("transactions"); setTransactionsSubTab("inbox"); } },
    { type: "مهمة طارئة", title: "تنسيق اجتماع مع شركة تمارا لربط فروع الشرقية", icon: Clock, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20", action: () => { setView("tasks"); setActiveKey("tasks"); } },
    { type: "تنبيه سريع", title: "مضى 10 أيام على انتهاء عقد فرع الراجحي", icon: Bell, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", action: () => { setView("tasks"); setActiveKey("tasks"); } },
    { type: "مهمة جديدة", title: "مراجعة طلبات الإجازة المعلقة للموظفين", icon: ClipboardList, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", action: () => { setView("tasks"); setActiveKey("tasks"); } },
    { type: "معاملة جديدة", title: "استلام مكاتبة من وزارة التجارة بشأن التراخيص", icon: Mail, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20", action: () => { setView("transactions"); setActiveKey("transactions"); setTransactionsSubTab("inbox"); } },
    { type: "تنبيه", title: "3 فواتير مستحقة الدفع خلال 48 ساعة القادمة", icon: FileText, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", action: () => { setView("transactions"); setActiveKey("transactions"); setTransactionsSubTab("inbox"); } },
    { type: "مهمة طارئة", title: "جرد مخزون عطور الفرع الرئيسي", icon: ClipboardList, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20", action: () => { setView("tasks"); setActiveKey("tasks"); } },
    { type: "معاملة طارئة", title: "اعتماد ترقية موظف - عبدالله خالد", icon: FileText, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", action: () => { setView("transactions"); setActiveKey("transactions"); setTransactionsSubTab("inbox"); } },
    { type: "مهمة جديدة", title: "مراجعة عقود إيجار الفروع الجديدة", icon: Building2, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", action: () => { setView("tasks"); setActiveKey("tasks"); } },
    { type: "معاملة طارئة", title: "اعتماد طلب شراء أجهزة IT لفرع الرياض", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", action: () => { setView("transactions"); setActiveKey("transactions"); setTransactionsSubTab("inbox"); } },
  ];

  const getPerPage = () => typeof window !== 'undefined' && window.innerWidth >= 640 ? 3 : 1;
  const pageCount = Math.ceil(cards.length / getPerPage());

  const scrollToIndex = (index: number) => {
    const perPage = getPerPage();
    const maxIndex = Math.max(0, Math.ceil(cards.length / perPage) - 1);
    const clamped = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(clamped);
    const targetCard = cardRefs.current[clamped * perPage];
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  };

  const goNext = () => scrollToIndex(currentIndex + 1);
  const goPrev = () => scrollToIndex(currentIndex - 1);

  // Update index on scroll
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const perPage = getPerPage();
    const scrollLeft = container.scrollLeft;
    const containerWidth = container.offsetWidth;
    // Find which card is most visible
    let bestIndex = 0;
    let bestVisibility = -1;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const cardLeft = card.offsetLeft;
      const cardRight = cardLeft + card.offsetWidth;
      const visibleLeft = Math.max(cardLeft, scrollLeft);
      const visibleRight = Math.min(cardRight, scrollLeft + containerWidth);
      const visibility = Math.max(0, visibleRight - visibleLeft);
      if (visibility > bestVisibility) {
        bestVisibility = visibility;
        bestIndex = i;
      }
    });
    setCurrentIndex(Math.floor(bestIndex / perPage));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mx-1 sm:mx-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm sm:text-base font-bold text-neutral-800 dark:text-neutral-100 tracking-wide">
          تنبيهات سريعة
          <span className="mr-1.5 text-[10px] sm:text-xs font-semibold text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
            {cards.length}
          </span>
        </h3>
        <span className="hidden sm:inline text-xs text-neutral-400 dark:text-neutral-500 font-medium">
          {currentIndex + 1} / {pageCount}
        </span>
      </div>

      <div className="relative">
        {/* Arrows */}
        {currentIndex > 0 && (
          <button
            onClick={goPrev}
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white dark:bg-neutral-700 shadow-md border border-neutral-100 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors"
            style={{ marginRight: '-12px' }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        {currentIndex < pageCount - 1 && (
          <button
            onClick={goNext}
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white dark:bg-neutral-700 shadow-md border border-neutral-100 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors"
            style={{ marginLeft: '-12px' }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Slider container */}
        <div
          ref={containerRef}
          className="overflow-x-auto scroll-smooth scrollbar-hide"
          onScroll={handleScroll}
        >
          <div className="flex gap-3 sm:gap-4 pb-2">
            {cards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  ref={(el) => { cardRefs.current[idx] = el; }}
                  className="shrink-0 w-[85%] sm:w-[340px] relative overflow-hidden bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5 flex items-center gap-3 h-auto min-h-[90px] sm:min-h-[100px] cursor-pointer"
                  onClick={card.action}
                >
                  <div className={`shrink-0 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl ${card.bg} ${card.color}`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 text-right min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-neutral-400 dark:text-neutral-500 tracking-wide uppercase mb-0.5">{card.type}</p>
                    <h3 className="text-sm sm:text-[15px] font-bold text-neutral-800 dark:text-neutral-100 leading-snug line-clamp-2">{card.title}</h3>
                  </div>
                  <div className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500">
                    <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dots + mobile counter */}
      <div className="flex items-center justify-center gap-3 mt-3">
        <span className="sm:hidden text-xs text-neutral-400 dark:text-neutral-500 font-medium">
          {currentIndex + 1} / {pageCount}
        </span>
        <div className="flex items-center gap-2">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "w-5 h-2 bg-neutral-800 dark:bg-neutral-200"
                  : "w-2 h-2 bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400"
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 text-center mt-1 sm:hidden">اسحب للتنقل بين البطاقات</p>
    </motion.div>
  );
}

// ====== الواجهة الرئيسية ======
export default function ResponsiveDashboard() {
  const [currentPage, setCurrentPage] = useState("main-dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [contestModalOpen, setContestModalOpen] = useState(false);
  const [contestModalTab, setContestModalTab] = useState<'details' | 'myResult'>('details');
  const [activeContest, setActiveContest] = useState<1 | 2 | 3>(1);
  const [contestMenuOpen, setContestMenuOpen] = useState<number | null>(null);
  const [contestEditModalOpen, setContestEditModalOpen] = useState(false);
  const [contestEditTab, setContestEditTab] = useState<'results' | 'edit'>('results');
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [fontScale, setFontScale] = useState<number>(() => {
    const saved = localStorage.getItem("app-font-scale");
    const n = saved ? Number(saved) : 100;
    return (n >= 75 && n <= 150) ? n : 100;
  });
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("app-dark-mode");
    return saved === "true";
  });
  const [showChart, setShowChart] = useState(false);

  // Apply dark mode to html element
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem("app-dark-mode", dark.toString());
  }, [dark]);

  const [activeKey, setActiveKey] = useState("dashboard");
  const [view, setView] = useState("dashboard"); // dashboard | add | attendance_report | ...
  const [transactionsSubTab, setTransactionsSubTab] = useState<'new'|'inbox'|'outbox'|'archive'>('inbox');
  const [attendanceSubTab, setAttendanceSubTab] = useState<'report'|'permit'|'hazer'|'calendar'>('report');

  // Reset sidebar selection when on dashboard
  useEffect(() => {
    if (view === "dashboard") {
      setActiveKey("dashboard");
    }
  }, [view]);

  // صفحة تسجيل الدخول
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginMethod, setLoginMethod] = useState("credentials"); // credentials | phone
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // نسيت كلمة المرور
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: phone, 2: otp, 3: new password
  const [forgotPhoneNumber, setForgotPhoneNumber] = useState("");
  const [forgotOtp, setForgotOtp] = useState(["", "", "", ""]);
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // صفحة الصادر والمعاملات
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [allTransactions, setAllTransactions] = useState([]);
  const [transactionsLoaded, setTransactionsLoaded] = useState(false);

  React.useEffect(() => {
    if (currentPage === 'main') {
      loadAllTransactions();
    }
  }, [currentPage]);

  const loadAllTransactions = async () => {
    try {
      // تحميل من localStorage أولاً
      const storedTransactions = localStorage.getItem('outbox_transactions');
      let localTransactions = [];

      if (storedTransactions) {
        const parsed = JSON.parse(storedTransactions);
        // تحويل معاملات localStorage إلى صيغة Supabase
        localTransactions = parsed.map((t: any) => ({
          id: t.id,
          transaction_number: t.id,
          transaction_type: t.type,
          title: t.title,
          description: '',
          employee_name: 'أحمد محمد السالم',
          employee_number: 'EMP-2024-001',
          department: t.from,
          nationality: 'سعودي',
          status: t.status === 'in-progress' ? 'قيد المعالجة' : t.status === 'completed' ? 'منتهية' : t.status === 'rejected' ? 'مرفوضة' : 'معلقة',
          current_location: 'صادر',
          priority: t.priority === 'high' ? 'عاجل' : t.priority === 'medium' ? 'متوسط' : 'عادي',
          created_at: t.date || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
      }

      // محاولة تحميل من Supabase
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          // دمج البيانات مع إزالة التكرار بناءً على transaction_number
          const merged = [...data, ...localTransactions];
          const seen = new Set<string>();
          const deduped = merged.filter(t => {
            const key = t.transaction_number || t.id;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          setAllTransactions(deduped);
        } else {
          // استخدام localStorage فقط
          setAllTransactions(localTransactions);
        }
      } catch (dbError) {
        // في حالة فشل Supabase، استخدم localStorage
        console.log('Using localStorage only');
        setAllTransactions(localTransactions);
      }

      setTransactionsLoaded(true);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactionsLoaded(true);
    }
  };

  const handleTransportAllowanceSubmit = async (transactionData: any) => {
    try {
      // حفظ في localStorage
      const storedTransactions = localStorage.getItem('outbox_transactions');
      const existingTransactions = storedTransactions ? JSON.parse(storedTransactions) : [];

      const newTransaction = {
        id: transactionData.transaction_number,
        title: transactionData.title,
        type: transactionData.transaction_type,
        from: transactionData.department,
        date: transactionData.date,
        status: 'in-progress',
        priority: transactionData.priority === 'عاجل' ? 'high' : transactionData.priority === 'متوسط' ? 'medium' : 'low'
      };

      existingTransactions.push(newTransaction);
      localStorage.setItem('outbox_transactions', JSON.stringify(existingTransactions));

      // محاولة حفظ في Supabase
      try {
        const { data, error } = await supabase
          .from('transactions')
          .insert([{
            transaction_number: transactionData.transaction_number,
            transaction_type: transactionData.transaction_type,
            title: transactionData.title,
            description: transactionData.description,
            employee_name: transactionData.employee_name,
            employee_number: transactionData.employee_number,
            department: transactionData.department,
            nationality: transactionData.nationality,
            status: transactionData.status,
            current_location: transactionData.current_location,
            priority: transactionData.priority
          }])
          .select();

        if (!error && data && data[0]) {
          await supabase
            .from('transaction_workflow')
            .insert([{
              transaction_id: data[0].id,
              step_number: 1,
              handler_name: transactionData.employee_name,
              handler_role: 'مقدم الطلب',
              action: 'تم تقديم الطلب',
              comments: transactionData.description,
              status: 'تم'
            }]);
          console.log('Transaction saved to Supabase successfully');
        }
      } catch (dbError) {
        console.log('Could not save to Supabase, using localStorage only');
      }

      await loadAllTransactions();
      setView('outbox');
      alert('تم إرسال طلب بدل المواصلات بنجاح');
    } catch (error) {
      console.error('Error submitting transport allowance:', error);
      alert('حدث خطأ أثناء إرسال الطلب');
    }
  };

  React.useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}%`;
    localStorage.setItem("app-font-scale", String(fontScale));
  }, [fontScale]);

  const rootClass = useMemo(() => cn(
    "min-h-screen w-full font-sans antialiased transition-colors duration-300",
    dark ? "dark bg-neutral-950 text-neutral-100" : "text-neutral-900"
  ), [dark]);

  const backgroundStyle = dark ? { backgroundColor: '#0a0a0a' } : { backgroundColor: '#EEF1F8' };

  // عناوين الصفحات
  const titlesMap = (() => {
    const map = { dashboard: "البوابة الإلكترونية", add: "معاملة جديد", attendance_report: "تقرير الحضور", hazer_system: "نظام حاضر" };
    sidebarGroups.forEach((g) => g.items.forEach((it) => (map[it.key] = it.title)));
    return map;
  })();
  const currentTitle = titlesMap[view] || "البوابة الإلكترونية";

  const remainingCards = cards.filter((c) => !["الوارد", "أرشيف الصادر"].includes(c.title));
  
  // فصل الروابط الخارجية من البطاقات العادية
  const externalLinkKeys = [
    "hr_queries", "archiving_system", "tasks_tracking", "deraa_email", 
    "external_email", "daily_sales", "portal_dashboard", "email_dashboard", 
    "transactions_reports", "transfers_followup"
  ];
  
  const regularCards = remainingCards.filter(card => 
    !externalLinkKeys.some(key => 
      sidebarGroups.find(g => g.label === "روابط خارجية")?.items.find(item => item.title === card.title)
    )
  );
  
  const orderedCards = [
    ...primaryCards.map((c) => ({ ...c, onAction: c.onAction?.bind(null, setView) })),
    ...regularCards,
  ];

  // دالة معالجة النقر على البطاقة
  function handleCardClick(card) {
    if (card.onAction) {
      card.onAction();
    } else if (card.title === "الوارد") {
      setView("inbox");
      setActiveKey("inbox");
    } else if (card.title === "الصادر" || card.title === "أرشيف الصادر") {
      setView("outbox");
      setActiveKey("outbox");
    } else if (card.title === "تقرير الحضور") {
      setView("attendance"); setAttendanceSubTab('report');
      setActiveKey("attendance");
    } else {
      // للبطاقات الأخرى، يمكن إضافة منطق مخصص
      console.log(`تم النقر على بطاقة: ${card.title}`);
    }
  }

  // دالة تسجيل الدخول بالبيانات
  function handleLogin(e) {
    e.preventDefault();
    if (!loginForm.username.trim() || !loginForm.password.trim()) return;

    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      setCurrentPage("welcome");
    }, 1500);
  }

  // دالة إرسال OTP
  function handleSendOtp(e) {
    e.preventDefault();
    if (!phoneNumber.trim() || phoneNumber.length < 10) return;

    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setOtpSent(true);
      console.log("تم إرسال رمز التحقق 0000 إلى رقم:", phoneNumber);
    }, 1500);
  }

  // دالة التحقق من OTP
  function handleVerifyOtp(e) {
    e.preventDefault();
    const enteredOtp = otp.join("");

    if (enteredOtp === "0000") {
      setIsLoggingIn(true);
      setTimeout(() => {
        setIsLoggingIn(false);
        setCurrentPage("welcome");
      }, 1000);
    } else {
      alert("رمز التحقق غير صحيح");
    }
  }

  // دالة معالجة تغيير OTP
  function handleOtpChange(index, value) {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  }

  // دالة معالجة backspace
  function handleOtpKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  }

  // إعادة تعيين OTP
  function resetOtpForm() {
    setOtpSent(false);
    setOtp(["", "", "", ""]);
    setPhoneNumber("");
  }

  // دوال نسيت كلمة المرور
  function handleForgotPasswordSendOtp(e) {
    e.preventDefault();
    if (!forgotPhoneNumber.trim() || forgotPhoneNumber.length < 10) return;

    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setForgotOtpSent(true);
      setForgotPasswordStep(2);
      console.log("تم إرسال رمز التحقق 0000 إلى رقم:", forgotPhoneNumber);
    }, 1500);
  }

  function handleForgotPasswordVerifyOtp(e) {
    e.preventDefault();
    const enteredOtp = forgotOtp.join("");

    if (enteredOtp === "0000") {
      setForgotPasswordStep(3);
    } else {
      alert("رمز التحقق غير صحيح");
    }
  }

  function handleForgotOtpChange(index, value) {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...forgotOtp];
    newOtp[index] = value;
    setForgotOtp(newOtp);

    if (value && index < 3) {
      const nextInput = document.getElementById(`forgot-otp-${index + 1}`);
      nextInput?.focus();
    }
  }

  function handleForgotOtpKeyDown(index, e) {
    if (e.key === "Backspace" && !forgotOtp[index] && index > 0) {
      const prevInput = document.getElementById(`forgot-otp-${index - 1}`);
      prevInput?.focus();
    }
  }

  function handleResetPassword(e) {
    e.preventDefault();

    if (newPassword.length < 6) {
      alert("كلمة المرور يجب أن تكون على الأقل 6 أحرف");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("كلمة المرور وتأكيد كلمة المرور غير متطابقين");
      return;
    }

    setIsResettingPassword(true);
    setTimeout(() => {
      setIsResettingPassword(false);
      alert("تم تغيير كلمة المرور بنجاح");
      resetForgotPasswordForm();
      setShowForgotPassword(false);
    }, 1500);
  }

  function resetForgotPasswordForm() {
    setForgotPasswordStep(1);
    setForgotPhoneNumber("");
    setForgotOtp(["", "", "", ""]);
    setForgotOtpSent(false);
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }

 function renderLoginPage() {
  if (showForgotPassword) {
    return renderForgotPasswordPage();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 p-4">

      {/* الشعار فوق البطاقة مباشرة */}
      <div className="mb-14 flex justify-center w-full">
        <img
          src="/biglogo.svg"
          alt="شعار درعه"
          className="h-20 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setCurrentView('welcome')}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling.style.display = 'block';
          }}
        />
        <div className="hidden text-3xl font-bold text-blue-600">درعه</div>
      </div>

      {/* البطاقة */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl border border-neutral-200 p-8">

          {/* العنوان والوصف */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              تسجيل الدخول
            </h1>
            <p className="text-neutral-600">
              اختر طريقة تسجيل الدخول المناسبة لك
            </p>
          </div>

          {/* اختيار طريقة تسجيل الدخول */}
          <div className="flex gap-2 mb-6 p-1 bg-neutral-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setLoginMethod("credentials");
                resetOtpForm();
              }}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all",
                loginMethod === "credentials"
                  ? "bg-white dark:bg-neutral-800 text-blue-600 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <User className="h-4 w-4" />
                رقم الهوية
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod("phone");
                setLoginForm({ username: "", password: "" });
              }}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all",
                loginMethod === "phone"
                  ? "bg-white dark:bg-neutral-800 text-blue-600 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <Smartphone className="h-4 w-4" />
                الدخول السريع
              </div>
            </button>
          </div>

          {/* نموذج تسجيل الدخول بالبيانات */}
          {loginMethod === "credentials" && (
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleLogin}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  رقم الهوية
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full rounded-xl px-12 py-3 bg-neutral-50 border border-neutral-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="أدخل رقم الهوية"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full rounded-xl px-12 py-3 bg-neutral-50 border border-neutral-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="أدخل كلمة المرور"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn || !loginForm.username.trim() || !loginForm.password.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  "تسجيل الدخول"
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
            </motion.form>
          )}

          {/* نموذج تسجيل الدخول برقم الجوال */}
          {loginMethod === "phone" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      رقم الجوال
                    </label>
                    <div className="relative">
                      <Smartphone className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full rounded-xl px-12 py-3 bg-neutral-50 border border-neutral-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="05XXXXXXXX"
                        pattern="[0-9]*"
                        maxLength={10}
                        required
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                      سيتم إرسال رمز التحقق المكون من 4 أرقام إلى هذا الرقم
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingOtp || phoneNumber.length < 10}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {isSendingOtp ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-5 w-5" />
                        إرسال رمز التحقق
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-neutral-700">
                        رمز التحقق
                      </label>
                      <button
                        type="button"
                        onClick={resetOtpForm}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        تغيير الرقم
                      </button>
                    </div>
                    <p className="text-sm text-neutral-600 mb-4">
                      أدخل الرمز المرسل إلى <span className="font-semibold">{phoneNumber}</span>
                    </p>

                    <div className="flex justify-center gap-3 mb-4" dir="ltr">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-14 h-14 text-center text-2xl font-bold rounded-xl bg-neutral-50 border-2 border-neutral-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                      ))}
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-neutral-500 mb-2">
                        لم يصلك الرمز؟
                      </p>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                        className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                      >
                        إعادة الإرسال
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn || otp.some(d => !d)}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {isLoggingIn ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        جاري التحقق...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        تأكيد
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

  // صفحة نسيت كلمة المرور
  function renderForgotPasswordPage() {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 p-4">

        {/* الشعار */}
        <div className="mb-14 flex justify-center w-full">
          <img
            src="/biglogo.svg"
            alt="شعار درعه"
            className="h-20 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setCurrentView('welcome')}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling.style.display = 'block';
            }}
          />
          <div className="hidden text-3xl font-bold text-blue-600">درعه</div>
        </div>

        {/* البطاقة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl border border-neutral-200 p-8">

            {/* زر الرجوع */}
            <button
              onClick={() => {
                setShowForgotPassword(false);
                resetForgotPasswordForm();
              }}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6"
            >
              <ArrowRight className="h-4 w-4" />
              <span className="text-sm">العودة لتسجيل الدخول</span>
            </button>

            {/* العنوان والوصف */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                استعادة كلمة المرور
              </h1>
              <p className="text-neutral-600">
                {forgotPasswordStep === 1 && "أدخل رقم الجوال المسجل لإرسال رمز التحقق"}
                {forgotPasswordStep === 2 && "أدخل رمز التحقق المرسل إلى جوالك"}
                {forgotPasswordStep === 3 && "أدخل كلمة المرور الجديدة"}
              </p>
            </div>

            {/* مؤشر الخطوات */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    step === forgotPasswordStep
                      ? "w-8 bg-blue-600"
                      : step < forgotPasswordStep
                      ? "w-2 bg-blue-400"
                      : "w-2 bg-neutral-300"
                  )}
                />
              ))}
            </div>

            {/* الخطوة 1: إدخال رقم الجوال */}
            {forgotPasswordStep === 1 && (
              <motion.form
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleForgotPasswordSendOtp}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    رقم الجوال
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="tel"
                      value={forgotPhoneNumber}
                      onChange={(e) => setForgotPhoneNumber(e.target.value)}
                      className="w-full rounded-xl px-12 py-3 bg-neutral-50 border border-neutral-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="05XXXXXXXX"
                      pattern="[0-9]*"
                      maxLength={10}
                      required
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    سيتم إرسال رمز التحقق المكون من 4 أرقام
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSendingOtp || forgotPhoneNumber.length < 10}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isSendingOtp ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-5 w-5" />
                      إرسال رمز التحقق
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {/* الخطوة 2: إدخال رمز التحقق */}
            {forgotPasswordStep === 2 && (
              <motion.form
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleForgotPasswordVerifyOtp}
                className="space-y-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-neutral-700">
                      رمز التحقق
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordStep(1)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      تغيير الرقم
                    </button>
                  </div>
                  <p className="text-sm text-neutral-600 mb-4">
                    أدخل الرمز المرسل إلى <span className="font-semibold">{forgotPhoneNumber}</span>
                  </p>

                  <div className="flex justify-center gap-3 mb-4" dir="ltr">
                    {forgotOtp.map((digit, index) => (
                      <input
                        key={index}
                        id={`forgot-otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleForgotOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleForgotOtpKeyDown(index, e)}
                        className="w-14 h-14 text-center text-2xl font-bold rounded-xl bg-neutral-50 border-2 border-neutral-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    ))}
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-neutral-500 mb-2">
                      لم يصلك الرمز؟
                    </p>
                    <button
                      type="button"
                      onClick={handleForgotPasswordSendOtp}
                      disabled={isSendingOtp}
                      className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                    >
                      إعادة الإرسال
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotOtp.some(d => !d)}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Check className="h-5 w-5" />
                  تأكيد
                </button>
              </motion.form>
            )}

            {/* الخطوة 3: إدخال كلمة المرور الجديدة */}
            {forgotPasswordStep === 3 && (
              <motion.form
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleResetPassword}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl px-12 py-3 bg-neutral-50 border border-neutral-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="أدخل كلمة المرور الجديدة"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    يجب أن تكون كلمة المرور على الأقل 6 أحرف
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl px-12 py-3 bg-neutral-50 border border-neutral-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="أعد إدخال كلمة المرور"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isResettingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isResettingPassword ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري التغيير...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      تغيير كلمة المرور
                    </>
                  )}
                </button>

                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-sm text-red-600 text-center">
                    كلمة المرور وتأكيد كلمة المرور غير متطابقين
                  </p>
                )}
              </motion.form>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // صفحة الترحيب
  function renderWelcomePage() {
    const welcomeCards = [
      { title: "بوابة المعاملات", subtitle: "إدارة المعاملات والمكاتبات", icon: FileText, accent: "from-blue-500/50 to-sky-600/50", action: "دخول", onClick: () => setCurrentPage("main-dashboard") },
      { title: "المهام وإدارة الفريق", subtitle: "متابعة المهام والفرق", icon: Users, accent: "from-emerald-500/50 to-green-600/50", action: "دخول", onClick: () => { setCurrentPage("main-dashboard"); setView("tasks"); } },
      { title: "نظام الحضور والغياب", subtitle: "تتبع الحضور والانصراف", icon: Clock, accent: "from-amber-500/50 to-orange-500/50", action: "دخول" },
      { title: "إحصائيات المبيعات", subtitle: "تقارير ومؤشرات الأداء", icon: BarChart3, accent: "from-rose-500/50 to-pink-600/50", action: "دخول", onClick: () => { setCurrentPage("main-dashboard"); setView("sales_kpi"); setActiveKey("sales_kpi"); } },
      { title: "التعميمات والتنبيهات", subtitle: "الإشعارات والتعميمات", icon: Bell, accent: "from-red-500/50 to-rose-500/50", action: "دخول" },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 p-4">
        <div className="max-w-6xl mx-auto py-12">
          {/* الترحيب */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="mb-16">
              <img
                src="/logonew.svg"
                alt="شعار درعه"
                className="h-14 w-auto mx-auto object-contain mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setCurrentView('welcome')}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling.style.display = 'block';
                }}
              />
              <div className="hidden text-4xl font-bold text-blue-600 mb-4">درعه</div>
            </div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">أهلاً بكم في درعه</h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              المنصة الإلكترونية لخدمات شركة درعه لجميع الموظفين
            </p>
          </motion.div>

          {/* البطاقات */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 lg:grid-cols-3">
            {welcomeCards.map((card, idx) => (
              <motion.button
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                onClick={card.onClick || (() => console.log(`تم النقر على: ${card.title}`))}
                className="group h-full w-full text-right cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <div className="relative h-full min-h-[120px] sm:min-h-[200px] flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-neutral-200 bg-white dark:bg-neutral-800 shadow-md hover:shadow-2xl transition-all duration-300">
                  {/* طبقة التدرّج */}
                  <div className={cn("absolute inset-x-0 -top-16 h-40 bg-gradient-to-r opacity-20 group-hover:opacity-30 blur-2xl transition", card.accent)} />
                  
                  <div className="relative p-3 sm:p-6 flex flex-col sm:flex-row items-start gap-2 sm:gap-4 flex-1">
                    <div className="shrink-0">
                      <div className="size-8 sm:size-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/70 to-white/30 border border-neutral-200/70 backdrop-blur flex items-center justify-center">
                        <card.icon className="h-4 w-4 sm:h-7 sm:w-7" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[11px] sm:text-lg font-bold tracking-tight leading-tight text-gray-900 mb-0.5 sm:mb-2">{card.title}</h3>
                      <p className="hidden sm:block text-sm text-gray-600">{card.subtitle}</p>
                    </div>
                  </div>
                  
                  <div className="px-3 sm:px-6 pb-3 sm:pb-6 flex items-center justify-start text-xs sm:text-sm mt-auto">
                    <span className="font-medium text-blue-600 group-hover:underline">{card.action}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function PerformanceTrendsChart() {
    const monthsMeta = [
      { short: 'يناير' }, { short: 'فبراير' }, { short: 'مارس' },
      { short: 'أبريل' }, { short: 'مايو' }, { short: 'يونيو' },
      { short: 'يوليو' }, { short: 'أغسطس' }, { short: 'سبتمبر' },
      { short: 'أكتوبر' }, { short: 'نوفمبر' }, { short: 'ديسمبر' },
    ];

    // pseudo-random so all 3 colors are clearly visible
    const seriesDef = [
      { name: 'الأداء',  color: '#10b981', vals: [72, 81, 68, 85, 78, 90, 75, 88, 70, 92, 77, 84] },
      { name: 'الحضور',  color: '#3b82f6', vals: [95, 88, 96, 82, 91, 76, 98, 85, 93, 79, 97, 83] },
      { name: 'الإنجاز', color: '#a855f7', vals: [68, 74, 82, 66, 89, 71, 86, 78, 65, 91, 73, 87] },
    ];

    const W = 720, H = 220;
    const P = { top: 24, right: 12, bottom: 36, left: 40 };
    const cw = W - P.left - P.right;
    const ch = H - P.top - P.bottom;
    const groupCount = 12;
    const groupGap = 10;
    const groupW = (cw - groupGap * (groupCount - 1)) / groupCount;
    const innerGap = 2;
    const barW = (groupW - innerGap * 2) / 3;
    const yMin = 60, yMax = 100;

    const yF = (v: number) => P.top + (1 - (v - yMin) / (yMax - yMin)) * ch;
    const xGroup = (i: number) => P.left + i * (groupW + groupGap);
    const xBar = (i: number, sIdx: number) => xGroup(i) + sIdx * (barW + innerGap);
    const xLabel = (i: number) => xGroup(i) + groupW / 2;

    const gridTicks = [60, 70, 80, 90, 100];

    const bg = dark ? '#27272a' : '#f3f4f6';
    const labelColor = dark ? '#71717a' : '#a1a1aa';
    const tickColor = dark ? '#52525b' : '#d4d4d8';

    return (
      <div className="flex flex-col gap-3">
        {/* Legend */}
        <div className="flex items-center gap-4">
          {seriesDef.map(s => (
            <span key={s.name} className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-neutral-500 dark:text-neutral-400">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
              {s.name}
            </span>
          ))}
        </div>

        {/* Chart */}
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[160px] sm:h-[200px]" preserveAspectRatio="xMidYMid meet">
          {/* dotted horizontal grid */}
          {gridTicks.map(tick => (
            <g key={tick}>
              <line x1={P.left} y1={yF(tick)} x2={W - P.right} y2={yF(tick)}
                stroke={bg} strokeWidth="1" strokeDasharray="3 3" />
              <text x={P.left - 8} y={yF(tick) + 3.5} textAnchor="end" fontSize="9"
                fill={tickColor} fontFamily="sans-serif">{tick}</text>
            </g>
          ))}

          {/* grouped bars */}
          {monthsMeta.map((_, mi) => (
            <g key={mi}>
              {seriesDef.map((s, sIdx) => {
                const v = s.vals[mi];
                const h = ch - (yF(v) - P.top);
                const x = xBar(mi, sIdx);
                const y = yF(v);
                return (
                  <rect
                    key={sIdx}
                    x={x} y={y} width={barW} height={h}
                    rx={barW * 0.2} ry={barW * 0.2}
                    fill={s.color}
                    stroke="none"
                    opacity="0.85"
                  />
                );
              })}
            </g>
          ))}

          {/* month labels */}
          {monthsMeta.map((m, i) => (
            <text key={m.short} x={xLabel(i)} y={H - 10} textAnchor="middle" fontSize="9"
              fill={labelColor} fontFamily="sans-serif">{m.short}</text>
          ))}
        </svg>

        {/* Month values summary */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          {seriesDef.map(s => (
            <div key={s.name} className="flex flex-col gap-0.5">
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">{s.name}</span>
              <span className="text-sm font-bold" style={{ color: s.color }}>+{s.vals[s.vals.length - 1] - s.vals[0]}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderDashboard() {
    return (
      <div className="space-y-8">
        {/* ====== بطاقة ملخص KPI الموظف ====== */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.02 }}
        >
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-4 sm:p-5 flex flex-col gap-4 sm:gap-5">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Employee Avatar */}
                <div className="relative shrink-0">
                  <img
                    src="https://api.dicebear.com/7.x/notionists/svg?seed=AhmedAbdulkader&backgroundColor=10b981"
                    alt="أحمد عبدالقادر أحمد"
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl items-center justify-center hidden bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-bold text-sm sm:text-base"
                  >
                    أ.ع
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-base sm:text-lg font-bold text-neutral-800 dark:text-white leading-tight">أحمد عبدالقادر أحمد</h2>
                  <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-medium">مدير تجربة المستخدم · يناير - ديسمبر 2025</p>
                </div>
              </div>
              <div className="text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg">ممتاز</div>
            </div>

            {/* Bottom: Trends Chart */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowChart(v => !v)}
                className="flex items-center justify-between w-full bg-neutral-50 dark:bg-neutral-900/50 rounded-xl px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-neutral-700 dark:text-neutral-200">توجهات الأداء</span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">12 شهراً</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${showChart ? 'rotate-180' : ''}`} />
              </button>
              {showChart && (
                <div className="flex flex-col gap-4">
                  <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900/50 p-3 sm:p-4">
                    <PerformanceTrendsChart />
                  </div>
                  <section className="grid grid-cols-3 sm:grid-cols-6 gap-0 divide-x divide-x-reverse divide-neutral-100 dark:divide-neutral-700 border-y border-neutral-100 dark:border-neutral-700 py-4 rounded-xl bg-white dark:bg-neutral-800 px-2">
                    {[
                      { label: "الأداء",     value: "92",  unit: "%", delta: "+5%",   positive: true,  sub: "vs. السنة الماضية" },
                      { label: "المهام",     value: "124", unit: "",  delta: "+18",   positive: true,  sub: "مهمة منجزة" },
                      { label: "الحضور",    value: "98",  unit: "%", delta: "+2%",   positive: true,  sub: "معدل 2025" },
                      { label: "المعاملات", value: "156", unit: "",  delta: "+9%",   positive: true,  sub: "معاملة" },
                      { label: "التأخير",   value: "0",   unit: "",  delta: "لا تأخير", positive: true,  sub: "ساعات" },
                      { label: "الإجازات",  value: "4",   unit: "",  delta: "12 متاح", positive: true,  sub: "أيام مستخدمة" },
                    ].map((m, idx) => (
                      <motion.div
                        key={m.label}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.04 * idx }}
                        className="flex flex-col gap-1 px-3 sm:px-5 lg:px-6"
                      >
                        <span className="text-[10px] sm:text-[11px] text-neutral-400 dark:text-neutral-500 font-medium tracking-wide">{m.label}</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl sm:text-3xl font-extrabold text-neutral-800 dark:text-white tabular-nums leading-none">{m.value}</span>
                          {m.unit && <span className="text-sm sm:text-base font-bold text-neutral-500 dark:text-neutral-400">{m.unit}</span>}
                        </div>
                        <span className={"inline-flex w-fit text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-full " + (m.positive ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400")}>
                          {m.delta}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-neutral-400 dark:text-neutral-600 hidden sm:block mt-0.5">{m.sub}</span>
                      </motion.div>
                    ))}
                  </section>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ====== تذكير سريع - Carousel ====== */}
        <ReminderCarousel
          setView={setView}
          setActiveKey={setActiveKey}
          setTransactionsSubTab={setTransactionsSubTab}
        />

        {/* ====== المسابقات - مدمجة مباشرة ====== */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-neutral-800 dark:text-neutral-100 tracking-wide">المسابقات الحالية</h3>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">3 مسابقات نشطة</span>
          </div>

          <div className="overflow-x-auto scroll-smooth scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-3 sm:grid sm:grid-cols-3 sm:gap-3 pb-2">
              {/* Competition 1 */}
              <div
                onClick={() => { setActiveContest(1); setContestModalOpen(true); setContestModalTab('details'); }}
                className="shrink-0 w-[85%] sm:w-auto relative bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-3 sm:p-4 flex flex-col gap-2 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                  <div className="absolute inset-x-0 -top-10 h-28 bg-gradient-to-r from-emerald-500/50 to-green-600/50 opacity-10 group-hover:opacity-20 blur-2xl transition" />
                </div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-neutral-800 dark:text-neutral-100 leading-tight">مسابقة البائعين</h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">منطقة الشرقية</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setContestMenuOpen(contestMenuOpen === 1 ? null : 1); }}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                    </button>
                    {contestMenuOpen === 1 && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setContestMenuOpen(null)} />
                        <div className="absolute left-0 top-full mt-1 w-40 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg z-20 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setContestMenuOpen(null); setActiveContest(1); setContestEditTab('results'); setContestEditModalOpen(true); }}
                            className="w-full text-right px-3 py-2.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                          >
                            نتائج المسابقة
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setContestMenuOpen(null); setActiveContest(1); setContestEditTab('edit'); setContestEditModalOpen(true); }}
                            className="w-full text-right px-3 py-2.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors border-t border-neutral-100 dark:border-neutral-700"
                          >
                            تعديل المسابقة
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="relative flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-neutral-400" /> حتى 26 يونيو</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3 text-neutral-400" /> 48 بائع</span>
                </div>
                <div className="relative flex items-center gap-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-700">
                  <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">الجوائز:</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">🥇 10000</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">🥈 5000</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">🥉 2000</span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mr-auto">ريال</span>
                </div>
              </div>

              {/* Competition 2 */}
              <div
                onClick={() => { setActiveContest(2); setContestModalOpen(true); setContestModalTab('details'); }}
                className="shrink-0 w-[85%] sm:w-auto relative bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-3 sm:p-4 flex flex-col gap-2 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                  <div className="absolute inset-x-0 -top-10 h-28 bg-gradient-to-r from-emerald-500/50 to-green-600/50 opacity-10 group-hover:opacity-20 blur-2xl transition" />
                </div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-neutral-800 dark:text-neutral-100 leading-tight">أفضل فرع</h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">موسم رمضان 2026</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setContestMenuOpen(contestMenuOpen === 2 ? null : 2); }}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                    </button>
                    {contestMenuOpen === 2 && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setContestMenuOpen(null)} />
                        <div className="absolute left-0 top-full mt-1 w-40 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg z-20 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setContestMenuOpen(null); setActiveContest(2); setContestEditTab('results'); setContestEditModalOpen(true); }}
                            className="w-full text-right px-3 py-2.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                          >
                            نتائج المسابقة
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setContestMenuOpen(null); setActiveContest(2); setContestEditTab('edit'); setContestEditModalOpen(true); }}
                            className="w-full text-right px-3 py-2.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors border-t border-neutral-100 dark:border-neutral-700"
                          >
                            تعديل المسابقة
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="relative flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-neutral-400" /> حتى 9 يوليو</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3 text-neutral-400" /> 12 فرع</span>
                </div>
                <div className="relative flex items-center gap-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-700">
                  <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">الجوائز:</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">🥇 10000</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">🥈 5000</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">🥉 2000</span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mr-auto">ريال</span>
                </div>
              </div>

              {/* Competition 3 */}
              <div
                onClick={() => { setActiveContest(3); setContestModalOpen(true); setContestModalTab('details'); }}
                className="shrink-0 w-[85%] sm:w-auto relative bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-3 sm:p-4 flex flex-col gap-2 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                  <div className="absolute inset-x-0 -top-10 h-28 bg-gradient-to-r from-emerald-500/50 to-green-600/50 opacity-10 group-hover:opacity-20 blur-2xl transition" />
                </div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-neutral-800 dark:text-neutral-100 leading-tight">أفضل خدمة عملاء</h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">الربع الثالث 2026</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setContestMenuOpen(contestMenuOpen === 3 ? null : 3); }}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                    </button>
                    {contestMenuOpen === 3 && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setContestMenuOpen(null)} />
                        <div className="absolute left-0 top-full mt-1 w-40 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg z-20 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setContestMenuOpen(null); setActiveContest(3); setContestEditTab('results'); setContestEditModalOpen(true); }}
                            className="w-full text-right px-3 py-2.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                          >
                            نتائج المسابقة
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setContestMenuOpen(null); setActiveContest(3); setContestEditTab('edit'); setContestEditModalOpen(true); }}
                            className="w-full text-right px-3 py-2.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors border-t border-neutral-100 dark:border-neutral-700"
                          >
                            تعديل المسابقة
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="relative flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-neutral-400" /> حتى 30 سبتمبر</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3 text-neutral-400" /> 35 موظف</span>
                </div>
                <div className="relative flex items-center gap-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-700">
                  <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">الجوائز:</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">🥇 10000</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">🥈 5000</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">🥉 2000</span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mr-auto">ريال</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ====== نافذة تفاصيل المسابقة ====== */}
        {contestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setContestModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                    {activeContest === 1 ? <TrendingUp className="w-4 h-4" /> : activeContest === 2 ? <Building2 className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-neutral-800 dark:text-neutral-100">{activeContest === 1 ? 'مسابقة البائعين' : activeContest === 2 ? 'أفضل فرع' : 'أفضل خدمة عملاء'}</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{activeContest === 1 ? 'منطقة الشرقية' : activeContest === 2 ? 'موسم رمضان 2026' : 'الربع الثالث 2026'}</p>
                  </div>
                </div>
                <button onClick={() => setContestModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                  <X className="w-4 h-4 text-neutral-500" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-neutral-100 dark:border-neutral-700">
                <button
                  onClick={() => setContestModalTab('details')}
                  className={`flex-1 py-3 text-sm font-bold transition-colors ${contestModalTab === 'details' ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500' : 'text-neutral-500 dark:text-neutral-400'}`}
                >
                  تفاصيل المسابقة
                </button>
                <button
                  onClick={() => setContestModalTab('myResult')}
                  className={`flex-1 py-3 text-sm font-bold transition-colors ${contestModalTab === 'myResult' ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500' : 'text-neutral-500 dark:text-neutral-400'}`}
                >
                  نتيجتي الحالية
                </button>
              </div>

              {/* Content */}
              <div className="p-4 overflow-y-auto flex-1">
                {contestModalTab === 'details' ? (
                  <div className="flex flex-col gap-4">
                    {/* Donut Chart */}
                    <div className="flex items-center gap-4 justify-center">
                      <div className="relative w-28 h-28 shrink-0">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#d1fae5" strokeWidth="3" />
                          {(activeContest === 1 ? [
                            { w: 30, c: '#10b981', o: 0 },
                            { w: 25, c: '#3b82f6', o: -30 },
                            { w: 20, c: '#f59e0b', o: -55 },
                            { w: 15, c: '#ef4444', o: -75 },
                            { w: 10, c: '#8b5cf6', o: -90 },
                          ] : activeContest === 2 ? [
                            { w: 35, c: '#10b981', o: 0 },
                            { w: 25, c: '#3b82f6', o: -35 },
                            { w: 20, c: '#f59e0b', o: -60 },
                            { w: 20, c: '#ef4444', o: -80 },
                          ] : [
                            { w: 40, c: '#10b981', o: 0 },
                            { w: 30, c: '#3b82f6', o: -40 },
                            { w: 20, c: '#f59e0b', o: -70 },
                            { w: 10, c: '#ef4444', o: -90 },
                          ]).map((seg, i) => (
                            <path key={i} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={seg.c} strokeWidth="3" strokeDasharray={`${seg.w} 100`} strokeDashoffset={seg.o} />
                          ))}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-[15px] font-bold text-emerald-600 dark:text-emerald-400">100%</span>
                          <span className="text-[10px] text-neutral-500 dark:text-neutral-400">اجمالي المعايير</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {(activeContest === 1 ? [
                          { label: 'إجمالي المبيعات', weight: 30, color: '#10b981' },
                          { label: 'نسبة التحقيق', weight: 25, color: '#3b82f6' },
                          { label: 'متوسط الفاتورة', weight: 20, color: '#f59e0b' },
                          { label: 'عدد الفواتير', weight: 15, color: '#ef4444' },
                          { label: 'الكمية', weight: 10, color: '#8b5cf6' },
                        ] : activeContest === 2 ? [
                          { label: 'إجمالي الإيرادات', weight: 35, color: '#10b981' },
                          { label: 'رضا العملاء', weight: 25, color: '#3b82f6' },
                          { label: 'نظافة الفرع', weight: 20, color: '#f59e0b' },
                          { label: 'التسويق', weight: 20, color: '#ef4444' },
                        ] : [
                          { label: 'سرعة الاستجابة', weight: 40, color: '#10b981' },
                          { label: 'رضا العملاء', weight: 30, color: '#3b82f6' },
                          { label: 'عدد التقييمات', weight: 20, color: '#f59e0b' },
                          { label: 'حل الشكاوى', weight: 10, color: '#ef4444' },
                        ]).map((m) => (
                          <div key={m.label} className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: m.color }} />
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">{m.label}</span>
                            <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mr-auto">{m.weight}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Motivational Note */}
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/20 rounded-xl p-3 flex items-center gap-2">
                      <span className="text-lg">💡</span>
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-400 leading-relaxed">
                        على المتسابق محاولة تحقيق أعلى نسبة من جميع المعايير ليضمن الفوز
                      </p>
                    </div>

                    {/* Prize Table */}
                    <div className="bg-neutral-50 dark:bg-neutral-700/30 rounded-xl p-3">
                      <p className="text-sm font-bold text-neutral-700 dark:text-neutral-200 mb-2">الجوائز</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { rank: '🥇 الأول', amount: '10000', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' },
                          { rank: '🥈 الثاني', amount: '5000', color: 'text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700/50' },
                          { rank: '🥉 الثالث', amount: '2000', color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20' },
                        ].map((p) => (
                          <div key={p.rank} className={`rounded-lg p-2 text-center ${p.color}`}>
                            <p className="text-xs font-medium">{p.rank}</p>
                            <p className="text-[15px] font-bold">{p.amount}</p>
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">ريال</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
                      <span>عدد المشاركين: {activeContest === 1 ? '48 بائع' : activeContest === 2 ? '12 فرع' : '35 موظف'}</span>
                      <span>ينتهي: {activeContest === 1 ? '26 يونيو' : activeContest === 2 ? '9 يوليو' : '30 سبتمبر'}</span>
                    </div>

                    {/* Managers */}
                    <div className="bg-neutral-50 dark:bg-neutral-700/30 rounded-xl p-3 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 w-24">مشرف المسابقة</span>
                        <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200">{activeContest === 1 ? 'محمد القحطاني' : activeContest === 2 ? 'خالد الشمري' : 'فهد العنزي'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 w-24">مدير المنطقة</span>
                        <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200">{activeContest === 1 ? 'عبدالرحمن الدوسري' : activeContest === 2 ? 'سعد الحربي' : 'طلال الراشد'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 w-24">المدير الإقليمي</span>
                        <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200">{activeContest === 1 ? 'سلطان العتيبي' : activeContest === 2 ? 'نواف المطيري' : 'مشعل السبيعي'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {/* Employee Stats Header */}
                    <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-700/30 rounded-xl p-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <UserCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-neutral-800 dark:text-neutral-100">أحمد عبدالقادر</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{activeContest === 3 ? 'ممثل خدمة عملاء — فرع الدمام' : 'بائع — فرع الدمام الرئيسي'}</p>
                      </div>
                      <div className="mr-auto text-center">
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">#{activeContest === 1 ? '3' : activeContest === 2 ? '5' : '2'}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">ترتيبك</p>
                      </div>
                    </div>

                    {/* Stats Bars */}
                    <div className="flex flex-col gap-3">
                      <p className="text-sm font-bold text-neutral-700 dark:text-neutral-200">إحصائياتك</p>
                      {(activeContest === 1 ? [
                        { label: 'إجمالي المبيعات', current: 195000, target: 200000, weight: 30 },
                        { label: 'نسبة التحقيق', current: 92, target: 100, weight: 25 },
                        { label: 'متوسط الفاتورة', current: 465, target: 500, weight: 20 },
                        { label: 'عدد الفواتير', current: 380, target: 400, weight: 15 },
                        { label: 'الكمية', current: 950, target: 1000, weight: 10 },
                      ] : activeContest === 2 ? [
                        { label: 'إجمالي الإيرادات', current: 980000, target: 1200000, weight: 35 },
                        { label: 'رضا العملاء', current: 4.6, target: 5, weight: 25 },
                        { label: 'نظافة الفرع', current: 94, target: 100, weight: 20 },
                        { label: 'التسويق', current: 13, target: 15, weight: 20 },
                      ] : [
                        { label: 'سرعة الاستجابة', current: 88, target: 100, weight: 40 },
                        { label: 'رضا العملاء', current: 4.5, target: 5, weight: 30 },
                        { label: 'عدد التقييمات', current: 85, target: 100, weight: 20 },
                        { label: 'حل الشكاوى', current: 92, target: 100, weight: 10 },
                      ]).map((s) => {
                        const pct = Math.min(100, Math.round((s.current / s.target) * 100));
                        return (
                          <div key={s.label} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-neutral-700 dark:text-neutral-300">{s.label} ({s.weight}%)</span>
                              <span className="font-bold text-neutral-700 dark:text-neutral-200">{s.current.toLocaleString()} / {s.target.toLocaleString()}</span>
                            </div>
                            <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-700 overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 self-end">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Overall Score */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-neutral-700 dark:text-neutral-200">إجمالي تقييمك</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{activeContest === 1 ? '92% — مؤهّل للجائزة الأولى 🥇' : activeContest === 2 ? '86% — مؤهّل للجائزة الثانية 🥈' : '89% — مؤهّل للجائزة الأولى 🥇'}</p>
                      </div>
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeContest === 1 ? '92%' : activeContest === 2 ? '86%' : '89%'}</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* ====== نافذة تعديل المسابقة ====== */}
        {contestEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setContestEditModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-700">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${contestEditTab === 'results' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'}`}>
                    {contestEditTab === 'results' ? <Trophy className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">{activeContest === 1 ? 'مسابقة البائعين' : activeContest === 2 ? 'أفضل فرع' : 'أفضل خدمة عملاء'}</h3>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{contestEditTab === 'results' ? 'نتائج المسابقة' : 'تعديل المسابقة'}</p>
                  </div>
                </div>
                <button onClick={() => setContestEditModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                  <X className="w-4 h-4 text-neutral-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 overflow-y-auto flex-1">
                {contestEditTab === 'results' ? (
                  <div className="flex flex-col gap-4">
                    <p className="text-xs font-bold text-neutral-700 dark:text-neutral-200">جدول المتسابقين والنتائج</p>
                    <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-neutral-50 dark:bg-neutral-700/50 text-neutral-600 dark:text-neutral-300">
                            <th className="px-3 py-2.5 font-bold text-right">المرتب</th>
                            <th className="px-3 py-2.5 font-bold text-right">المتسابق</th>
                            {activeContest === 1 ? (
                              <>
                                <th className="px-3 py-2.5 font-bold text-right">المبيعات</th>
                                <th className="px-3 py-2.5 font-bold text-right">الهدف</th>
                                <th className="px-3 py-2.5 font-bold text-right">التحقيق</th>
                                <th className="px-3 py-2.5 font-bold text-right">متوسط الفاتورة</th>
                                <th className="px-3 py-2.5 font-bold text-right">النقاط</th>
                                <th className="px-3 py-2.5 font-bold text-right">الجائزة</th>
                              </>
                            ) : activeContest === 2 ? (
                              <>
                                <th className="px-3 py-2.5 font-bold text-right">الإيرادات</th>
                                <th className="px-3 py-2.5 font-bold text-right">رضا العملاء</th>
                                <th className="px-3 py-2.5 font-bold text-right">نظافة</th>
                                <th className="px-3 py-2.5 font-bold text-right">تسويق</th>
                                <th className="px-3 py-2.5 font-bold text-right">النقاط</th>
                                <th className="px-3 py-2.5 font-bold text-right">الجائزة</th>
                              </>
                            ) : (
                              <>
                                <th className="px-3 py-2.5 font-bold text-right">سرعة</th>
                                <th className="px-3 py-2.5 font-bold text-right">رضا</th>
                                <th className="px-3 py-2.5 font-bold text-right">تقييمات</th>
                                <th className="px-3 py-2.5 font-bold text-right">شكاوى</th>
                                <th className="px-3 py-2.5 font-bold text-right">النقاط</th>
                                <th className="px-3 py-2.5 font-bold text-right">الجائزة</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                          {(activeContest === 1 ? [
                            { rank: 1, name: 'م 1042 كيو اند ايه رويال حجران', sales: 9628, target: 9680, achieve: '99.46%', avg: 188.78, points: 91.9, prize: '1000' },
                            { rank: 2, name: 'م 1564 كيو اند ايه الباحة مول', sales: 17163, target: 15260, achieve: '112.48%', avg: 122.6, points: 89.48, prize: '1000' },
                            { rank: 3, name: 'م 168 لايونز الباحة مول - الباحة', sales: 16002, target: 15950, achieve: '100.33%', avg: 152.41, points: 86.66, prize: '1000' },
                            { rank: 4, name: 'م 1560 لايونز العظيم الربوة - الرياض', sales: 13415, target: 12829, achieve: '104.56%', avg: 123.07, points: 84.63, prize: '500' },
                            { rank: 5, name: 'م 1451 لايونز جدة بارك - جدة', sales: 14786, target: 16536, achieve: '89.42%', avg: 168.02, points: 82.35, prize: '500' },
                            { rank: 6, name: 'م 1383 لايونز تالا مول - الرياض', sales: 11940, target: 13966, achieve: '85.5%', avg: 161.36, points: 78.85, prize: '500' },
                          ] : activeContest === 2 ? [
                            { rank: 1, name: 'فرع الدمام الرئيسي', c1: 1200000, c2: '4.9', c3: '98%', c4: '15/15', points: 95.2, prize: '10000' },
                            { rank: 2, name: 'فرع الرياض مول', c1: 1150000, c2: '4.8', c3: '96%', c4: '14/15', points: 91.5, prize: '5000' },
                            { rank: 3, name: 'فرع جدة بارك', c1: 1100000, c2: '4.7', c3: '95%', c4: '13/15', points: 88.3, prize: '2000' },
                            { rank: 4, name: 'فرع الخبر', c1: 1050000, c2: '4.6', c3: '94%', c4: '12/15', points: 84.7, prize: '-' },
                            { rank: 5, name: 'فرع أبها', c1: 980000, c2: '4.5', c3: '92%', c4: '11/15', points: 80.1, prize: '-' },
                          ] : [
                            { rank: 1, name: 'أحمد عبدالقادر', c1: '95%', c2: '4.9', c3: 120, c4: '98%', points: 94.5, prize: '10000' },
                            { rank: 2, name: 'محمد القحطاني', c1: '92%', c2: '4.8', c3: 110, c4: '96%', points: 91.2, prize: '5000' },
                            { rank: 3, name: 'خالد الشمري', c1: '90%', c2: '4.7', c3: 105, c4: '94%', points: 88.0, prize: '2000' },
                            { rank: 4, name: 'فهد العنزي', c1: '88%', c2: '4.6', c3: 100, c4: '92%', points: 85.5, prize: '-' },
                            { rank: 5, name: 'طلال الراشد', c1: '85%', c2: '4.5', c3: 95, c4: '90%', points: 82.1, prize: '-' },
                          ] as any[]).map((row: any) => (
                            <tr key={row.rank} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
                              <td className="px-3 py-2.5 font-bold text-neutral-800 dark:text-neutral-200">{row.rank}</td>
                              <td className="px-3 py-2.5 text-neutral-700 dark:text-neutral-300 whitespace-nowrap">{row.name}</td>
                              {activeContest === 1 ? (
                                <>
                                  <td className="px-3 py-2.5 text-neutral-600 dark:text-neutral-400">{row.sales?.toLocaleString()}</td>
                                  <td className="px-3 py-2.5 text-neutral-600 dark:text-neutral-400">{row.target?.toLocaleString()}</td>
                                  <td className="px-3 py-2.5 font-bold text-emerald-600 dark:text-emerald-400">{row.achieve}</td>
                                  <td className="px-3 py-2.5 text-neutral-600 dark:text-neutral-400">{row.avg}</td>
                                  <td className="px-3 py-2.5 font-bold text-neutral-700 dark:text-neutral-200">{row.points}</td>
                                  <td className="px-3 py-2.5 font-bold text-amber-600 dark:text-amber-400">{row.prize !== '-' ? `${row.prize} ريال` : '-'}</td>
                                </>
                              ) : activeContest === 2 ? (
                                <>
                                  <td className="px-3 py-2.5 text-neutral-600 dark:text-neutral-400">{row.c1?.toLocaleString()}</td>
                                  <td className="px-3 py-2.5 text-neutral-600 dark:text-neutral-400">{row.c2}</td>
                                  <td className="px-3 py-2.5 text-neutral-600 dark:text-neutral-400">{row.c3}</td>
                                  <td className="px-3 py-2.5 text-neutral-600 dark:text-neutral-400">{row.c4}</td>
                                  <td className="px-3 py-2.5 font-bold text-neutral-700 dark:text-neutral-200">{row.points}</td>
                                  <td className="px-3 py-2.5 font-bold text-amber-600 dark:text-amber-400">{row.prize !== '-' ? `${row.prize} ريال` : '-'}</td>
                                </>
                              ) : (
                                <>
                                  <td className="px-3 py-2.5 text-neutral-600 dark:text-neutral-400">{row.c1}</td>
                                  <td className="px-3 py-2.5 text-neutral-600 dark:text-neutral-400">{row.c2}</td>
                                  <td className="px-3 py-2.5 text-neutral-600 dark:text-neutral-400">{row.c3}</td>
                                  <td className="px-3 py-2.5 text-neutral-600 dark:text-neutral-400">{row.c4}</td>
                                  <td className="px-3 py-2.5 font-bold text-neutral-700 dark:text-neutral-200">{row.points}</td>
                                  <td className="px-3 py-2.5 font-bold text-amber-600 dark:text-amber-400">{row.prize !== '-' ? `${row.prize} ريال` : '-'}</td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {/* Contest Name */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-200 mb-1.5">اسم المسابقة</label>
                      <input
                        type="text"
                        defaultValue={activeContest === 1 ? 'مسابقة البائعين' : activeContest === 2 ? 'أفضل فرع' : 'أفضل خدمة عملاء'}
                        className="w-full rounded-xl px-3 py-2.5 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-sm text-neutral-800 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Classification + Region */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-200 mb-1.5">التصنيف</label>
                        <select className="w-full rounded-xl px-3 py-2.5 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-sm text-neutral-800 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-emerald-500">
                          <option>بائعين</option>
                          <option>فروع</option>
                          <option>خدمة عملاء</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-200 mb-1.5">المنطقة</label>
                        <select className="w-full rounded-xl px-3 py-2.5 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-sm text-neutral-800 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-emerald-500">
                          <option>منطقة الشرقية</option>
                          <option>منطقة الرياض</option>
                          <option>منطقة جدة</option>
                        </select>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-200 mb-1.5">من تاريخ</label>
                        <input type="date" defaultValue="2026-05-31" className="w-full rounded-xl px-3 py-2.5 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-sm text-neutral-800 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-200 mb-1.5">إلى تاريخ</label>
                        <input type="date" defaultValue="2026-06-29" className="w-full rounded-xl px-3 py-2.5 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-sm text-neutral-800 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                    </div>

                    {/* Criteria Weights */}
                    <div className="bg-neutral-50 dark:bg-neutral-700/30 rounded-xl p-3 flex flex-col gap-3">
                      <p className="text-xs font-bold text-neutral-700 dark:text-neutral-200">معايير المسابقة</p>
                      {(activeContest === 1 ? [
                        { label: 'نسبة التحقيق', weight: 70 },
                        { label: 'متوسط الفاتورة', weight: 30 },
                        { label: 'إجمالي المبيعات', weight: 0 },
                        { label: 'عدد الفواتير', weight: 0 },
                        { label: 'الكمية', weight: 0 },
                      ] : activeContest === 2 ? [
                        { label: 'إجمالي الإيرادات', weight: 35 },
                        { label: 'رضا العملاء', weight: 25 },
                        { label: 'نظافة الفرع', weight: 20 },
                        { label: 'التسويق', weight: 20 },
                      ] : [
                        { label: 'سرعة الاستجابة', weight: 40 },
                        { label: 'رضا العملاء', weight: 30 },
                        { label: 'عدد التقييمات', weight: 20 },
                        { label: 'حل الشكاوى', weight: 10 },
                      ]).map((c) => (
                        <div key={c.label} className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked={c.weight > 0} className="w-4 h-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500" />
                          <span className="flex-1 text-xs text-neutral-700 dark:text-neutral-200">{c.label}</span>
                          <input
                            type="number"
                            defaultValue={c.weight}
                            className="w-16 rounded-lg px-2 py-1.5 bg-white dark:bg-neutral-600 border border-neutral-200 dark:border-neutral-500 text-xs text-neutral-800 dark:text-neutral-100 text-center outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <span className="text-xs text-neutral-500">%</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-600">
                        <span className="text-xs font-medium text-neutral-500">مجموع الأوزان</span>
                        <span className="text-xs font-bold text-emerald-600">100%</span>
                      </div>
                    </div>

                    {/* Managers */}
                    <div className="bg-neutral-50 dark:bg-neutral-700/30 rounded-xl p-3 flex flex-col gap-3">
                      <p className="text-xs font-bold text-neutral-700 dark:text-neutral-200">المشرفون</p>
                      <div>
                        <label className="block text-[10px] font-medium text-neutral-500 mb-1">مشرف المسابقة</label>
                        <input type="text" defaultValue={activeContest === 1 ? 'محمد القحطاني' : activeContest === 2 ? 'خالد الشمري' : 'فهد العنزي'} className="w-full rounded-lg px-3 py-2 bg-white dark:bg-neutral-600 border border-neutral-200 dark:border-neutral-500 text-xs text-neutral-800 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-neutral-500 mb-1">مدير المنطقة</label>
                        <input type="text" defaultValue={activeContest === 1 ? 'عبدالرحمن الدوسري' : activeContest === 2 ? 'سعد الحربي' : 'طلال الراشد'} className="w-full rounded-lg px-3 py-2 bg-white dark:bg-neutral-600 border border-neutral-200 dark:border-neutral-500 text-xs text-neutral-800 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-neutral-500 mb-1">المدير الإقليمي</label>
                        <input type="text" defaultValue={activeContest === 1 ? 'سلطان العتيبي' : activeContest === 2 ? 'نواف المطيري' : 'مشعل السبيعي'} className="w-full rounded-lg px-3 py-2 bg-white dark:bg-neutral-600 border border-neutral-200 dark:border-neutral-500 text-xs text-neutral-800 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                    </div>

                    {/* Prizes */}
                    <div className="bg-neutral-50 dark:bg-neutral-700/30 rounded-xl p-3">
                      <p className="text-xs font-bold text-neutral-700 dark:text-neutral-200 mb-2">الجوائز</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { rank: '🥇 الأول', amount: '10000' },
                          { rank: '🥈 الثاني', amount: '5000' },
                          { rank: '🥉 الثالث', amount: '2000' },
                        ].map((p) => (
                          <div key={p.rank} className="flex flex-col gap-1">
                            <span className="text-[10px] font-medium text-neutral-500">{p.rank}</span>
                            <input type="text" defaultValue={p.amount} className="w-full rounded-lg px-2 py-1.5 bg-white dark:bg-neutral-600 border border-neutral-200 dark:border-neutral-500 text-xs text-neutral-800 dark:text-neutral-100 text-center outline-none focus:ring-2 focus:ring-emerald-500" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Save Button */}
                    <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" />
                      حفظ التعديلات
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* ====== قسم المهام ====== */}
        <div>
          {/* Desktop header row */}
          <div className="hidden sm:grid grid-cols-6 gap-2.5 mb-4">
            <div className="col-span-3 flex items-center justify-start">
              <h2 className="text-base font-bold text-neutral-700 dark:text-neutral-200 tracking-wide uppercase">
                مهامك اليوم — {(() => { const d = new Date(); const m = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']; return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`; })()}
              </h2>
            </div>
            <div className="col-span-3 flex items-center justify-start">
              <h3 className="text-sm sm:text-base font-bold text-neutral-700 dark:text-neutral-200 tracking-wide uppercase">
                معاملات اليوم — {(() => { const d = new Date(); const m = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']; return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`; })()}
              </h3>
            </div>
          </div>
          {/* Mobile header */}
          <h2 className="sm:hidden text-sm font-bold mb-3 text-neutral-700 dark:text-neutral-200 tracking-wide uppercase">
            مهامك اليوم — {(() => { const d = new Date(); const m = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']; return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`; })()}
          </h2>
          <section className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-2.5 mx-1 sm:mx-0 overflow-visible">
            {[
              { title: "جديدة", value: "17", sub: "12 جديدة · ", subRed: "5 طارئة", subColor: undefined, icon: ListTodo, accent: "from-green-500/50 to-green-600/50" },
              { title: "متأخرة", value: "3", sub: "مهام متأخرة", subRed: undefined, subColor: undefined, icon: Clock, accent: "from-red-500/50 to-red-600/50" },
              { title: "يومية", value: "8", sub: "مهام يومية", subRed: undefined, subColor: undefined, icon: Calendar, accent: "from-blue-500/50 to-blue-600/50" },
            ].map((card, idx) => (
              <motion.button
                key={card.title + idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * idx }}
                className="group h-full w-full text-right cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                {idx === 0 ? (
                  <div className="card-stroke-green h-full">
                    <div className="relative z-[2] overflow-hidden shadow-sm p-3 sm:p-4 flex flex-col gap-1 sm:gap-1.5 hover:shadow-md transition-shadow h-full">
                      <div className={cn("absolute inset-x-0 -top-10 h-28 bg-gradient-to-r opacity-10 group-hover:opacity-20 blur-2xl transition", card.accent)} />
                      <div className="relative flex items-center justify-between gap-1">
                        <span className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 font-semibold leading-tight line-clamp-1">{card.title}</span>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                          <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-700 dark:text-neutral-300" />
                        </div>
                      </div>
                      <div className="relative text-[22px] sm:text-2xl font-bold text-neutral-800 dark:text-neutral-200 tracking-tight tabular-nums">{card.value}</div>
                      {(card.sub || card.subRed) && (
                        <div className="relative text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium truncate">
                          {card.sub}
                          {card.subRed && <span className="text-red-500">{card.subRed}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="relative overflow-hidden bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-3 sm:p-4 flex flex-col gap-1 sm:gap-1.5 hover:shadow-md transition-shadow h-full">
                    <div className={cn("absolute inset-x-0 -top-10 h-28 bg-gradient-to-r opacity-10 group-hover:opacity-20 blur-2xl transition", card.accent)} />
                    <div className="relative flex items-center justify-between gap-1">
                      <span className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 font-semibold leading-tight line-clamp-1">{card.title}</span>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                        <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-700 dark:text-neutral-300" />
                      </div>
                    </div>
                    <div className="relative text-[22px] sm:text-2xl font-bold text-neutral-800 dark:text-neutral-200 tracking-tight tabular-nums">{card.value}</div>
                    {(card.sub || card.subRed) && (
                      <div className="relative text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium truncate">
                        {card.sub}
                        {card.subRed && <span className="text-red-500">{card.subRed}</span>}
                      </div>
                    )}
                  </div>
                )}
              </motion.button>
            ))}

            {/* Transactions label (mobile only) */}
            <div className="col-span-3 sm:hidden flex items-center justify-start py-1 px-1">
              <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-200 tracking-wide uppercase">معاملات اليوم</h3>
            </div>

            {[
              { title: "جديدة", value: "8", sub: "معاملات جديدة", subRed: undefined, subColor: undefined, icon: Inbox, accent: "from-indigo-500/50 to-indigo-600/50" },
              { title: "طارئة", value: "5", sub: "معاملات طارئة", subRed: undefined, subColor: "text-red-500", icon: AlertTriangle, accent: "from-orange-500/50 to-orange-600/50" },
              { title: "متأخرة", value: "3", sub: "معاملات متأخرة", subRed: undefined, subColor: "text-amber-500", icon: Clock, accent: "from-amber-500/50 to-amber-600/50" },
            ].map((card, idx) => (
              <motion.button
                key={card.title + idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * (idx + 3) }}
                className="group h-full w-full text-right cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                {idx === 0 ? (
                  <div className="card-stroke-indigo h-full">
                    <div className="relative z-[2] overflow-hidden shadow-sm p-3 sm:p-4 flex flex-col gap-1 sm:gap-1.5 hover:shadow-md transition-shadow h-full">
                      <div className={cn("absolute inset-x-0 -top-10 h-28 bg-gradient-to-r opacity-10 group-hover:opacity-20 blur-2xl transition", card.accent)} />
                      <div className="relative flex items-center justify-between gap-1">
                        <span className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 font-semibold leading-tight line-clamp-1">{card.title}</span>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                          <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-700 dark:text-neutral-300" />
                        </div>
                      </div>
                      <div className="relative text-[22px] sm:text-2xl font-bold text-neutral-800 dark:text-neutral-200 tracking-tight tabular-nums">{card.value}</div>
                      {(card.sub || card.subRed) && (
                        <div className="relative text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium truncate">
                          {card.sub}
                          {card.subRed && <span className="text-red-500">{card.subRed}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="relative overflow-hidden bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-3 sm:p-4 flex flex-col gap-1 sm:gap-1.5 hover:shadow-md transition-shadow h-full">
                    <div className={cn("absolute inset-x-0 -top-10 h-28 bg-gradient-to-r opacity-10 group-hover:opacity-20 blur-2xl transition", card.accent)} />
                    <div className="relative flex items-center justify-between gap-1">
                      <span className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 font-semibold leading-tight line-clamp-1">{card.title}</span>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                        <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-700 dark:text-neutral-300" />
                      </div>
                    </div>
                    <div className="relative text-[22px] sm:text-2xl font-bold text-neutral-800 dark:text-neutral-200 tracking-tight tabular-nums">{card.value}</div>
                    {(card.sub || card.subRed) && (
                      <div className="relative text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium truncate">
                        {card.sub}
                        {card.subRed && <span className="text-red-500">{card.subRed}</span>}
                      </div>
                    )}
                  </div>
                )}
              </motion.button>
            ))}
          </section>
        </div>

        {/* ====== قسم الأداء والتنبيهات ====== */}
        <div>
          <h2 className="text-sm sm:text-base font-bold mb-3 sm:mb-4 text-neutral-700 dark:text-neutral-200 tracking-wide uppercase">أداء المبيعات والتنبيهات</h2>
          <section className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-2.5 mx-1 sm:mx-0 overflow-visible">
            {[
              { title: "مبيعات اليوم", value: "45,320", sub: "ر.س", icon: TrendingUp, progress: 78, color: "#00C9A7" },
              { title: "مبيعات الشهر", value: "1,240,500", sub: "ر.س", icon: BarChart3, progress: 92, color: "#4D8AFF" },
              { title: "نسبة التحقيق", value: "87", sub: "%", icon: CheckCircle, progress: 87, color: "#F9A825" },
              { title: "انتهاء الإقامة", value: "45", sub: "يوماً متبقية", icon: Bell, urgent: true },
              { title: "صلاحية الجواز", value: "6", sub: "أشهر", icon: Globe },
              { title: "عقد العمل", value: "120", sub: "يوماً", icon: FileText },
            ].map((card, idx) => (
              <motion.button
                key={card.title + idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * (idx + 3) }}
                className="group h-full w-full text-right cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-3 sm:p-4 flex flex-col gap-1 sm:gap-1.5 hover:shadow-md transition-shadow h-full">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-semibold leading-tight line-clamp-1">{card.title}</span>
                    <div className="flex items-center gap-2">
                      {card.urgent && (
                        <span className="inline-flex items-center justify-center h-5 px-2 text-[10px] font-bold rounded-full text-white shrink-0 bg-rose-500">عاجل</span>
                      )}
                      <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                        <card.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-700 dark:text-neutral-300" />
                      </div>
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-200 tracking-tight tabular-nums">{card.value}</div>
                  {card.sub && <div className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-medium truncate">{card.sub}</div>}
                  {card.progress !== undefined && (
                    <div className="h-1 sm:h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-700 overflow-hidden mt-auto">
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(card.progress, 100)}%`, backgroundColor: card.color }} />
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </section>
        </div>
      </div>
    );
  }

  function renderNotificationsPage() {
    return (
      <div className="space-y-8">
        <ImageSlider />
        <div>
          <h2 className="text-sm sm:text-base font-bold mb-3 sm:mb-4 text-neutral-700 dark:text-neutral-200 tracking-wide uppercase">التنبيهات والإشعارات</h2>
          <section className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-2.5 mx-1 sm:mx-0 overflow-visible">
            {[
              { title: "انتهاء الإقامة", value: "45", sub: "يوماً متبقية", icon: Bell, urgent: true },
              { title: "آخر إشعار", value: "2024-089", sub: "معتمد", icon: CheckCircle, urgent: false },
              { title: "صلاحية الجواز", value: "6", sub: "أشهر", icon: Globe },
              { title: "موعد مراجعة", value: "15", sub: "يوماً", icon: Calendar },
              { title: "عقد العمل", value: "120", sub: "يوماً", icon: FileText },
              { title: "شهادة صحية", value: "30", sub: "يوماً", icon: ShieldCheck },
            ].map((card, idx) => (
              <motion.button
                key={card.title + idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * idx }}
                className="group h-full w-full text-right cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-3 sm:p-4 flex flex-col gap-1 sm:gap-1.5 hover:shadow-md transition-shadow h-full">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-semibold leading-tight line-clamp-1">{card.title}</span>
                    <div className="flex items-center gap-2">
                      {card.urgent && (
                        <span className="inline-flex items-center justify-center h-5 px-2 text-[10px] font-bold rounded-full text-white shrink-0 bg-rose-500">عاجل</span>
                      )}
                      <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                        <card.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-700 dark:text-neutral-300" />
                      </div>
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-200 tracking-tight tabular-nums">{card.value}</div>
                  {card.sub && <div className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-medium truncate">{card.sub}</div>}
                </div>
              </motion.button>
            ))}
          </section>
        </div>
      </div>
    );
  }


  function renderShortcutsPage() {
    const externalLinks = [
      {
        title: "استعلامات الموارد البشرية",
        description: "استعلم عن راتبك ومستحقاتك",
        icon: Users,
        url: "#",
        accent: "from-blue-500/50 to-blue-600/50"
      },
      {
        title: "نظام الأرشفة الإلكترونية",
        description: "إدارة وأرشفة المستندات",
        icon: Archive,
        url: "#",
        accent: "from-green-500/50 to-green-600/50"
      },
      {
        title: "نظام متابعة المهام",
        description: "تتبع وإدارة المهام اليومية",
        icon: ClipboardList,
        url: "#",
        accent: "from-purple-500/50 to-purple-600/50"
      },
      {
        title: "إيميل درعه",
        description: "البريد الإلكتروني الداخلي",
        icon: Mail,
        url: "#",
        accent: "from-red-500/50 to-red-600/50"
      },
      {
        title: "الإيميل الخارجي",
        description: "البريد الإلكتروني الخارجي",
        icon: Globe,
        url: "#",
        accent: "from-indigo-500/50 to-indigo-600/50"
      },
      {
        title: "المبيعات اليومية",
        description: "تقارير المبيعات والإحصائيات",
        icon: TrendingUp,
        url: "#",
        accent: "from-orange-500/50 to-orange-600/50"
      },
      {
        title: "لوحة تحكم البوابة",
        description: "إدارة وتحكم البوابة",
        icon: LayoutDashboard,
        url: "#",
        accent: "from-teal-500/50 to-teal-600/50"
      },
      {
        title: "لوحة تحكم الايميل",
        description: "إدارة البريد الإلكتروني",
        icon: MessageSquare,
        url: "#",
        accent: "from-pink-500/50 to-pink-600/50"
      },
      {
        title: "تقارير المعاملات",
        description: "تقارير شاملة للمعاملات",
        icon: FileSpreadsheet,
        url: "#",
        accent: "from-cyan-500/50 to-cyan-600/50"
      },
      {
        title: "متابعة التحويلات والاستلامات",
        description: "تتبع التحويلات المالية",
        icon: ArrowLeftRight,
        url: "#",
        accent: "from-amber-500/50 to-amber-600/50"
      }
    ];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-sm sm:text-base font-bold mb-3 sm:mb-4 text-neutral-700 dark:text-neutral-200 tracking-wide uppercase">الروابط الخارجية</h2>
          <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 items-stretch">
            {externalLinks.map((link, idx) => (
              <motion.a
                key={link.title}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * idx }}
                className="group h-full w-full text-right cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <div className="relative h-full min-h-[140px] sm:min-h-[200px] flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-neutral-800 shadow-[0_2px_16px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] transition-all duration-200 border border-neutral-100 dark:border-neutral-700">
                  <div className={cn("absolute inset-x-0 -top-16 h-40 bg-gradient-to-r opacity-10 group-hover:opacity-20 blur-2xl transition", link.accent)} />
                  <div className="relative p-3 sm:p-5 flex flex-col gap-2 sm:gap-3 flex-1">
                    <div className="flex items-start justify-between gap-1 sm:gap-2">
                      <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-neutral-900 text-white rounded-full text-[10px] sm:text-xs font-semibold shrink-0 max-w-[80%] sm:max-w-[70%]">
                        <link.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                        <span className="truncate">{link.title}</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-300 leading-relaxed flex-1 line-clamp-2">{link.description}</p>
                  </div>
                  <div className="px-3 sm:px-5 pb-3 sm:pb-5 mt-auto">
                    <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors flex items-center gap-1">
                      فتح الرابط
                      <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </section>
        </div>
      </div>
    );
  }

  function renderGenericPage(key) {
    const title = titlesMap[key] || "صفحة";
    return (
      <PageShell title={title}>
        <div className="text-sm text-neutral-600">هذه صفحة {title}. يمكن لاحقًا ربطها بواجهة فعلية أو بيانات من API.</div>
      </PageShell>
    );
  }

  function renderSettingsPage() {
    return (
      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-neutral-100">الإعدادات</h2>

          <div className="space-y-6">
            {/* معلومات الحساب */}
            <div className="border-b border-neutral-200 pb-6">
              <h3 className="text-lg font-bold mb-4 text-neutral-800 dark:text-neutral-200">معلومات الحساب</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600 dark:text-neutral-300">الاسم:</span>
                  <span className="font-semibold">{currentUser?.name || 'غير محدد'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600 dark:text-neutral-300">البريد الإلكتروني:</span>
                  <span className="font-semibold">{currentUser?.email || 'غير محدد'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600 dark:text-neutral-300">الرقم الوظيفي:</span>
                  <span className="font-semibold">{currentUser?.employeeId || 'غير محدد'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600 dark:text-neutral-300">القسم:</span>
                  <span className="font-semibold">{currentUser?.department || 'غير محدد'}</span>
                </div>
              </div>
            </div>

            {/* إعدادات الإشعارات */}
            <div className="border-b border-neutral-200 pb-6">
              <h3 className="text-lg font-bold mb-4 text-neutral-800 dark:text-neutral-200">الإشعارات</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600 dark:text-neutral-300">إشعارات البريد الإلكتروني</span>
                  <button className="w-12 h-6 bg-[#B21063] rounded-full relative">
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white dark:bg-neutral-800 rounded-full"></span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600 dark:text-neutral-300">إشعارات الهاتف</span>
                  <button className="w-12 h-6 bg-neutral-300 rounded-full relative">
                    <span className="absolute right-1 top-1 w-4 h-4 bg-white dark:bg-neutral-800 rounded-full"></span>
                  </button>
                </div>
              </div>
            </div>

            {/* إعدادات أخرى */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-neutral-800 dark:text-neutral-200">عام</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700">
                  <span className="text-neutral-700 dark:text-neutral-200">تغيير كلمة المرور</span>
                  <ChevronLeft className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700">
                  <span className="text-neutral-700 dark:text-neutral-200">اللغة</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">العربية</span>
                    <ChevronLeft className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                  </div>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700">
                  <span className="text-neutral-700 dark:text-neutral-200">عن التطبيق</span>
                  <ChevronLeft className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                </button>
              </div>
            </div>

            {/* تسجيل الخروج */}
            <div className="pt-4">
              <button
                onClick={() => {
                  setCurrentPage("login");
                  setCurrentView("login");
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-semibold">تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderAttendanceHub() {
    const ATTEND_TABS: ['report'|'permit'|'hazer'|'calendar', string, any][] = [
      ['report',   'تقرير الحضور',          ClipboardList],
      ['permit',   'طلب إذن',               Clock],
      ['hazer',    'نظام حاضر',             Shield],
      ['calendar', 'التقويم السنوي',        Calendar],
    ];
    return (
      <div dir="rtl">
        <div className="sticky top-0 z-40 md:z-30 bg-white dark:bg-neutral-800 border-b border-neutral-100 rounded-xl">
          <div className="max-w-[1400px] mx-auto px-0 sm:px-2 rounded-xl overflow-hidden">
            <div className="px-2 sm:px-4 py-2 border-b border-neutral-100">
              <div className="flex items-center gap-7 bg-neutral-50 dark:bg-neutral-800 rounded-full p-1 w-fit mx-auto">
              {ATTEND_TABS.map(([key, label]) => (
                <button key={key} onClick={() => setAttendanceSubTab(key)}
                  className={cn(
                    'flex items-center justify-center px-4 sm:px-6 py-1.5 rounded-full text-[13px] sm:text-[14px] font-bold transition-all duration-200 min-w-0',
                    attendanceSubTab === key
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'bg-neutral-50 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 hover:text-neutral-900 dark:hover:text-white'
                  )}>
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          </div>
          </div>
        </div>
        {attendanceSubTab === 'report'   && <AttendanceDashboard />}
        {attendanceSubTab === 'permit'   && <ExitPermitForm />}
        {attendanceSubTab === 'hazer'    && <HazerSystem />}
        {attendanceSubTab === 'calendar' && <SaudiCalendar />}
      </div>
    );
  }

  function renderTransactionsHub() {
    const TRANS_TABS: [typeof transactionsSubTab, string, any][] = [
      ['new',     'طلب جديد',      FilePlus],
      ['inbox',   'الوارد',        Inbox],
      ['outbox',  'الصادر',        Send],
      ['archive', 'أرشيف الصادر', Archive],
    ];
    return (
      <div dir="rtl" className="min-h-screen">
        {/* Tab Bar */}
        <div className="sticky top-0 z-40 md:z-30 bg-white dark:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700">
          <div className="max-w-[1400px] mx-auto px-0 sm:px-2 overflow-hidden">
            <div className="px-2 sm:px-4 py-2">
              <div className="flex items-center gap-7 bg-neutral-50 dark:bg-neutral-800 rounded-full p-1 w-fit mx-auto">
              {TRANS_TABS.map(([key, label]) => (
                <button key={key} onClick={() => setTransactionsSubTab(key)}
                  className={cn(
                    'flex items-center justify-center px-4 sm:px-6 py-1.5 rounded-full text-[13px] sm:text-[14px] font-bold transition-all duration-200 min-w-0',
                    transactionsSubTab === key
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'bg-neutral-50 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 hover:text-neutral-900 dark:hover:text-white'
                  )}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          </div>
        </div>
        {/* Content */}
        {transactionsSubTab === 'new' && (
          <TransactionSelectionPage
            onCancel={() => setTransactionsSubTab('inbox')}
            onTransactionSelect={(transactionId: string) => {
              if (transactionId === 'annual_leave') setView('annual_leave');
              else if (transactionId === 'transportation') setView('transport_allowance');
              else setView('add');
            }}
          />
        )}
        {transactionsSubTab === 'inbox' && renderInboxView()}
        {transactionsSubTab === 'outbox' && renderOutboxView()}
        {transactionsSubTab === 'archive' && (
          <OutboxPage
            onViewDetails={(id) => { setSelectedTransactionId(id); setView('transaction_details'); }}
          />
        )}
      </div>
    );
  }

  function renderContent() {
    if (view === "dashboard") return renderDashboard();
    if (view === "settings") return renderSettingsPage();
    if (view === "transactions") return renderTransactionsHub();
    if (view === "add" || view === "transaction_selection") return (
      <TransactionSelectionPage
        onCancel={() => setView("transactions")}
        onTransactionSelect={(transactionId: string) => {
          if (transactionId === "annual_leave") {
            setView("annual_leave");
          } else if (transactionId === "transportation") {
            setView("transport_allowance");
          } else {
            setView("add");
          }
        }}
      />
    );
    if (view === "annual_leave") return <AnnualLeaveForm onCancel={() => setView("transactions")} onSubmit={() => setView("transactions")} />;
    if (view === "add_form") return <AddTransactionForm onCancel={() => setView("transactions")} onSaved={() => setView("transactions")} />;
    if (view === "attendance" || view === "attendance_report" || view === "exit_permission" || view === "hazer_system") return renderAttendanceHub();
    if (view === "transport_allowance") return <TransportAllowanceForm onBack={() => setView("transactions")} onSubmitSuccess={handleTransportAllowanceSubmit} />;
    if (view === "outbox") return renderOutboxView();
    if (view === "inbox") return renderInboxView();
    if (view === "transaction_details") return renderTransactionDetailsView();
    if (view === "sales_kpi") return <SalesPerformancePage onBack={() => setView("dashboard")} />;
    if (view === "tasks") return <TasksPage onBack={() => setView("dashboard")} onNewCampaign={() => setView("campaigns")} />;
    if (view === "campaigns") return <CampaignsPage onBack={() => setView("dashboard")} />;
    if (view === "shortcuts") return renderShortcutsPage();
    if (view === "notifications") return renderNotificationsPage();
    return renderGenericPage(view);
  }

  function renderOutboxView() {
    // إذا كانت البيانات محملة من Supabase/localStorage
    if (transactionsLoaded && allTransactions.length > 0) {
      const outboxTransactions = allTransactions
        .filter((t: any) => t.current_location === 'صادر')
        .map((t: any) => ({
          id: t.transaction_number,
          title: t.title,
          type: t.transaction_type,
          from: t.department,
          date: new Date(t.created_at).toLocaleDateString('en-US'),
          status: t.status === 'قيد المعالجة' ? 'in-progress' : t.status === 'منتهية' ? 'completed' : t.status === 'مرفوضة' ? 'rejected' : 'pending',
          priority: t.priority === 'عاجل' ? 'high' : t.priority === 'متوسط' ? 'medium' : 'low'
        }));

      return (
        <OutboxPage
          onViewDetails={(transactionId) => {
            setSelectedTransactionId(transactionId);
            setView('transaction_details');
          }}
          transactions={outboxTransactions as any}
        />
      );
    }

    // إذا لم تكن محملة، استخدم البيانات الافتراضية من OutboxPage
    return (
      <OutboxPage
        onViewDetails={(transactionId) => {
          setSelectedTransactionId(transactionId);
          setView('transaction_details');
        }}
      />
    );
  }

  function renderInboxView() {
    // إذا كانت البيانات محملة من Supabase/localStorage
    if (transactionsLoaded && allTransactions.length > 0) {
      const inboxTransactions = allTransactions
        .filter((t: any) => t.current_location === 'وارد')
        .map((t: any) => ({
          id: t.transaction_number,
          title: t.title,
          type: t.transaction_type,
          from: t.department,
          date: new Date(t.created_at).toLocaleDateString('en-US'),
          status: t.status === 'قيد المعالجة' ? 'in-progress' : t.status === 'منتهية' ? 'completed' : t.status === 'مرفوضة' ? 'rejected' : 'pending',
          priority: t.priority === 'عاجل' ? 'high' : t.priority === 'متوسط' ? 'medium' : 'low'
        }));

      return (
        <InboxPage
          onViewDetails={(transactionId) => {
            setSelectedTransactionId(transactionId);
            setView('transaction_details');
          }}
          transactions={inboxTransactions as any}
          onTransactionUpdate={loadAllTransactions}
        />
      );
    }

    // إذا لم تكن محملة، استخدم البيانات الافتراضية من InboxPage
    return (
      <InboxPage
        onViewDetails={(transactionId) => {
          setSelectedTransactionId(transactionId);
          setView('transaction_details');
        }}
        onTransactionUpdate={loadAllTransactions}
      />
    );
  }

  function renderTransactionDetailsView() {
    return (
      <TransactionDetailsPage
        transactionId={selectedTransactionId || ''}
        onBack={() => {
          setSelectedTransactionId(null);
          setView('dashboard');
        }}
      />
    );
  }

  function renderMainDashboard() {
    return (
      <AIProvider>
        <div dir="rtl" className={cn(rootClass)} style={backgroundStyle}>


        {/* Body */}
        <div className={cn(
          "pb-24 md:pb-6 flex md:gap-[100px] md:py-4 md:pe-[100px] md:ps-4",
          view === "dashboard" ? "px-3 sm:px-4 pt-4 gap-3" : "px-0 pt-0 gap-0"
        )}>
          {/* Sidebar — Navigation Rail (ديسكتوب فقط) */}
          <aside className="hidden md:flex flex-col w-[72px] shrink-0 items-center gap-2 pt-3">
            {/* Logo above sidebar */}
            <div className="shrink-0 mb-[65px]">
              <img
                src="/logo deraah.png"
                alt="شعار درعه"
                className="h-[60px] w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setView('dashboard')}
              />
            </div>
            <nav className="sticky top-[72px] rounded-2xl py-3 px-1.5 bg-white/80 dark:bg-neutral-800/80 backdrop-blur border border-white/80 dark:border-neutral-700/80 shadow-[0_2px_16px_rgba(0,0,0,0.07)] flex flex-col items-center gap-1 max-h-[calc(100vh-100px)] overflow-visible">
              {/* Nav items */}
              <div className="flex-1 overflow-y-auto w-full space-y-0.5 scrollbar-hide">
                {sidebarGroups.flatMap((g) => g.items).map(({ key, title, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveKey(key);
                      if (key === "tasks") setView("tasks");
                      else if (key === "attendance") { setView("attendance"); setAttendanceSubTab('report'); }
                      else if (key === "transactions") { setView("transactions"); setTransactionsSubTab('inbox'); }
                      else setView(key);
                    }}
                    title={title}
                    className={cn(
                      "w-full flex flex-col items-center gap-0.5 px-1 py-2 rounded-xl transition-all duration-150 group",
                      activeKey === key
                        ? "bg-neutral-900 text-white shadow-sm"
                        : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="text-[12px] font-semibold leading-tight text-center w-full truncate px-0.5">{title}</span>
                  </button>
                ))}
              </div>

              {/* حسابي */}
              <div className="shrink-0 w-full pt-2 border-t border-neutral-100 dark:border-neutral-700 relative z-[75]">
                <button
                  onClick={() => setAccountMenuOpen(v => !v)}
                  className="w-full flex flex-col items-center gap-0.5 px-1 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-[#B21063]/10 flex items-center justify-center shrink-0">
                    <UserCircle className="h-4 w-4 text-[#B21063]" />
                  </div>
                  <span className="text-[12px] font-semibold text-neutral-800 dark:text-neutral-200">حسابي</span>
                </button>
                {accountMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-[55]" onClick={() => setAccountMenuOpen(false)} />
                    <div className="absolute bottom-full right-0 mb-2 w-64 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-2xl shadow-xl z-[70] overflow-hidden">
                      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700">
                        <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">محمد العبدالله</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">مدير المبيعات</p>
                      </div>
                      <div className="py-1">
                        <button onClick={() => { setView("settings"); setAccountMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                          <UserCircle className="h-4 w-4 text-neutral-400 dark:text-neutral-400" />
                          الملف الشخصي
                        </button>
                        <button onClick={() => { setView("settings"); setAccountMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                          <Settings className="h-4 w-4 text-neutral-400 dark:text-neutral-400" />
                          الإعدادات
                        </button>
                        <button onClick={() => { setDark(!dark); setAccountMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                          {dark ? <Sun className="h-4 w-4 text-neutral-400 dark:text-neutral-400" /> : <Moon className="h-4 w-4 text-neutral-400 dark:text-neutral-400" />}
                          {dark ? "الوضع الفاتح" : "الوضع الداكن"}
                        </button>
                        {/* حجم الخط */}
                        <div className="px-4 py-3 border-t border-neutral-100 dark:border-neutral-700">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Type className="h-4 w-4 text-neutral-400 dark:text-neutral-400 shrink-0" />
                              <span className="text-sm text-neutral-700 dark:text-neutral-300">حجم الخط</span>
                            </div>
                            <span className="text-xs font-bold tabular-nums" style={{ color: '#B21063' }}>{fontScale}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-neutral-400 dark:text-neutral-400 font-bold shrink-0 select-none">أ</span>
                            <div className="relative flex-1">
                              <input
                                type="range"
                                min={75}
                                max={150}
                                step={1}
                                value={fontScale}
                                onChange={(e) => setFontScale(Number(e.target.value))}
                                className="font-range w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none"
                                style={{
                                  background: `linear-gradient(to left, #e5e7eb ${100 - ((fontScale - 75) / 75) * 100}%, #B21063 ${100 - ((fontScale - 75) / 75) * 100}%)`,
                                }}
                              />
                            </div>
                            <span className="text-[15px] text-neutral-400 dark:text-neutral-400 font-bold shrink-0 select-none">أ</span>
                          </div>
                          <div className="flex justify-between mt-1.5">
                            <button onClick={() => setFontScale(75)} className="text-[10px] text-neutral-400 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">أصغر</button>
                            <button onClick={() => setFontScale(100)} className="text-[10px] text-neutral-400 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 font-semibold">افتراضي</button>
                            <button onClick={() => setFontScale(150)} className="text-[10px] text-neutral-400 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">أكبر</button>
                          </div>
                        </div>
                        <button onClick={() => setAccountMenuOpen(false)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                          <Languages className="h-4 w-4 text-neutral-400 dark:text-neutral-400" />
                          <span>اللغة</span>
                          <span className="mr-auto text-xs text-neutral-400 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded-full">العربية</span>
                        </button>
                      </div>
                      <div className="border-t border-neutral-100 dark:border-neutral-700 py-1">
                        <button onClick={() => { setCurrentPage("login"); setAccountMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium">
                          <LogOut className="h-4 w-4" />
                          تسجيل الخروج
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {/* Top Bar (visible on dashboard only) */}
            {view === "dashboard" && (
              <div className="flex items-center justify-between mb-4 px-1">
                <h1 className="text-lg sm:text-xl font-bold text-neutral-800 dark:text-neutral-100">{currentTitle}</h1>
                <div className="flex items-center gap-3">
                  {/* Notification Bell */}
                  <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow">
                    <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-neutral-900">3</span>
                  </button>
                  {/* User Avatar */}
                  <button
                    onClick={() => setAccountMenuOpen(v => !v)}
                    className="w-10 h-10 rounded-xl overflow-hidden border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50"
                  >
                    <img
                      src="https://api.dicebear.com/7.x/notionists/svg?seed=AhmedAbdulkader&backgroundColor=10b981"
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </button>
                </div>
              </div>
            )}
            {renderContent()}
          </main>
        </div>

        {/* ── Bottom Navigation (جوال فقط) ── */}
        <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden">
          {/* Bottom Sheet */}
          {bottomSheetOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setBottomSheetOpen(false)}
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-neutral-800 rounded-t-3xl shadow-2xl border-t border-neutral-100 dark:border-neutral-700 p-6 pb-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">إضافة جديد</h3>
                  <button
                    onClick={() => setBottomSheetOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: "إنشاء مهمة", icon: ClipboardList, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", action: () => { setView("tasks"); setActiveKey("tasks"); setBottomSheetOpen(false); } },
                    { label: "معاملة جديدة", icon: FilePlus, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", action: () => { setView("add"); setActiveKey("transactions"); setBottomSheetOpen(false); } },
                    { label: "طلب إجازة", icon: Calendar, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20", action: () => { setView("annual_leave"); setActiveKey("attendance"); setBottomSheetOpen(false); } },
                    { label: "استئذان", icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", action: () => { setView("exit_permission"); setActiveKey("attendance"); setBottomSheetOpen(false); } },
                    { label: "إضافة مستخدم", icon: UserPlus, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20", action: () => { alert("قيد التطوير"); setBottomSheetOpen(false); } },
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * idx }}
                        onClick={item.action}
                        className="flex items-center gap-4 w-full p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-right"
                      >
                        <div className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-xl ${item.bg} ${item.color} shadow-lg shadow-${item.color.split('-')[1]}-500/20`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-base font-bold text-neutral-800 dark:text-neutral-100">{item.label}</span>
                        <ChevronLeft className="w-5 h-5 text-neutral-400 mr-auto" />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}

          {/* Side Drawer */}
          {sideDrawerOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setSideDrawerOpen(false)}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[360px] z-50 bg-white dark:bg-neutral-800 shadow-2xl overflow-y-auto scrollbar-hide"
              >
                {/* User Header */}
                <div className="p-6 pb-4 border-b border-neutral-100 dark:border-neutral-700">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src="https://api.dicebear.com/7.x/notionists/svg?seed=AhmedAbdulkader&backgroundColor=10b981"
                      alt="User"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50"
                    />
                    <div>
                      <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-100">أحمد عبدالقادر</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">مدير تجربة المستخدم</p>
                    </div>
                  </div>
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="البحث..."
                      className="w-full pr-10 pl-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 rounded-xl text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-600"
                    />
                  </div>
                </div>

                {/* Navigation */}
                <div className="p-4 space-y-1">
                  <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 px-2 mb-2 uppercase tracking-wide">الرئيسية</p>
                  {[
                    { key: "dashboard", label: "الرئيسية", icon: LayoutDashboard },
                    { key: "tasks", label: "المهام", icon: ListTodo },
                    { key: "transactions", label: "المعاملات", icon: ArrowLeftRight },
                    { key: "attendance", label: "الحضور", icon: Calendar },
                    { key: "sales_kpi", label: "الأداء", icon: TrendingUp },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeKey === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          setActiveKey(item.key);
                          if (item.key === "attendance") { setView("attendance"); setAttendanceSubTab('report'); }
                          else if (item.key === "transactions") { setView("transactions"); setTransactionsSubTab('inbox'); }
                          else setView(item.key);
                          setSideDrawerOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-right",
                          isActive
                            ? "bg-neutral-900 text-white"
                            : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        )}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-semibold">{item.label}</span>
                      </button>
                    );
                  })}

                  <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 px-2 mb-2 mt-4 uppercase tracking-wide">الإعدادات</p>
                  <button
                    onClick={() => { setView("settings"); setSideDrawerOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-right"
                  >
                    <Settings className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-semibold">الإعدادات</span>
                  </button>
                  <button
                    onClick={() => { setDark(!dark); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-right"
                  >
                    {dark ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
                    <span className="text-sm font-semibold">{dark ? "الوضع الفاتح" : "الوضع الداكن"}</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="absolute bottom-0 inset-x-0 p-4 border-t border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                  <button
                    onClick={() => { setCurrentPage("login"); setSideDrawerOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-right"
                  >
                    <LogOut className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-semibold">تسجيل الخروج</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}

          {/* Bottom Bar */}
          <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl border-t border-neutral-200/60 dark:border-neutral-700/60 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-1 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-around">
              {[
                { key: "dashboard", label: "الرئيسية", icon: LayoutDashboard, view: "dashboard" },
                { key: "tasks", label: "المهام", icon: ListTodo, view: "tasks" },
                { key: "sales_kpi", label: "الأداء", icon: TrendingUp, view: "sales_kpi" },
                { key: "transactions", label: "المعاملات", icon: ArrowLeftRight, view: "transactions" },
                { key: "attendance", label: "الحضور", icon: Calendar, view: "attendance" },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeKey === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      setActiveKey(item.key);
                      if (item.key === "attendance") { setView("attendance"); setAttendanceSubTab('report'); }
                      else if (item.key === "transactions") { setView("transactions"); setTransactionsSubTab('inbox'); }
                      else setView(item.view);
                    }}
                    className={cn(
                      "relative flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-xl transition-all duration-200 min-w-[60px] active:scale-95",
                      isActive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-neutral-400 dark:text-neutral-500"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200",
                      isActive ? "bg-emerald-50 dark:bg-emerald-900/30" : ""
                    )}>
                      <Icon className={cn("w-5 h-5 transition-all", isActive ? "stroke-[2.5px]" : "stroke-[1.8px]")} />
                    </div>
                    <span className={cn("text-[10px] font-bold leading-none", isActive ? "opacity-100" : "opacity-60")}>{item.label}</span>
                    {isActive && <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

      </div>
        <FloatingAssistant />
        <ChatPanel />
      </AIProvider>
    );
  }

  // عرض الصفحة المناسبة
  if (currentPage === "login") {
    return renderLoginPage();
  }

  if (currentPage === "welcome") {
    return renderWelcomePage();
  }

  if (currentPage === "main-dashboard") {
    return renderMainDashboard();
  }

  return null;
}