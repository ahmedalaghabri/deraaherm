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
import { Bell, Search, Settings, Menu, LogOut, Inbox, Send, FileText, Users, ShieldCheck, ClipboardList, Award, Accessibility, GaugeCircle, Sparkles, ChevronRight, ChevronLeft, ChevronDown, Upload, X, Save, Check, ArrowRight, Tag, Calendar, Building2, Shield, AlertTriangle, Clock, CheckCircle, Phone, RefreshCcw, Archive, FilePlus, Mail, BarChart3, LayoutDashboard, ArrowLeftRight, ExternalLink, Globe, Database, MessageSquare, TrendingUp, FileSpreadsheet, Briefcase, UserCheck, CreditCard, Home, Car, Plane, Heart, GraduationCap, Baby, MapPin, Zap, User, Lock, Eye, EyeOff, Smartphone, CircleUser as UserCircle, ListTodo, Megaphone, Languages, Type, Moon, Sun } from "lucide-react";

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

function AttendanceMiniChart({ data }) {
  const max = 100;
  return (
    <div className="w-full">
      <div className="h-48 w-full flex items-end gap-2">
        {data.map((d) => (
          <div key={d.day} className="flex-1 flex flex-col justify-end gap-0.5">
            <div className="w-full rounded-t-md bg-emerald-500/80" style={{ height: `${(d.present / max) * 100}%` }} title={`حضور ${d.present}%`} />
            <div className="w-full bg-amber-500/80" style={{ height: `${(d.late / max) * 100}%` }} title={`تأخير ${d.late}%`} />
            <div className="w-full rounded-b-md bg-rose-500/80" style={{ height: `${(d.absent / max) * 100}%` }} title={`غياب ${d.absent}%`} />
            <div className="text-[11px] text-center mt-1 text-neutral-500">{d.day}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs mt-3 text-neutral-600">
        <span className="inline-flex items-center gap-1"><span className="inline-block size-3 rounded-sm bg-emerald-500/80" /> حضور</span>
        <span className="inline-flex items-center gap-1"><span className="inline-block size-3 rounded-sm bg-amber-500/80" /> تأخير</span>
        <span className="inline-flex items-center gap-1"><span className="inline-block size-3 rounded-sm bg-rose-500/80" /> غياب</span>
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
      image: "https://i.ibb.co/tTCPm0Yt/ban1.jpg",
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

// ====== الواجهة الرئيسية ======
export default function ResponsiveDashboard() {
  const [currentPage, setCurrentPage] = useState("welcome"); // TODO: restore "login"
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [, setBottomTab] = useState("transactions");
  const [fontScale, setFontScale] = useState<number>(() => {
    const saved = localStorage.getItem("app-font-scale");
    const n = saved ? Number(saved) : 100;
    return (n >= 75 && n <= 150) ? n : 100;
  });
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("app-dark-mode");
    return saved === "true";
  });

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

  function renderDashboard() {
    // فصل البطاقات حسب النوع
    const serviceCards = cards.filter((c) => !["الوارد", "أرشيف الصادر"].includes(c.title));

    return (
      <div className="space-y-6">
        {/* السلايدر */}
        <ImageSlider />
        

        
        {/* قسم الخدمات الأساسية */}
        <div>
          <h2 className="text-sm sm:text-base font-bold mb-3 sm:mb-4 text-neutral-700 dark:text-neutral-200 tracking-wide uppercase">الخدمات الأساسية</h2>
          <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 items-stretch">
            {primaryCards.map((c) => ({ ...c, onAction: c.onAction?.bind(null, setView) })).map((card, idx) => (
              <motion.button
                key={card.title + idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * idx }}
                onClick={() => handleCardClick(card)}
                className="group h-full w-full text-right cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <div className="relative h-full min-h-[140px] sm:min-h-[200px] flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-neutral-800 shadow-[0_2px_16px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] transition-all duration-200 border border-neutral-100 dark:border-neutral-700">
                  <div className={cn("absolute inset-x-0 -top-16 h-40 bg-gradient-to-r opacity-10 group-hover:opacity-20 blur-2xl transition", card.accent)} />
                  <div className="relative p-3 sm:p-5 flex flex-col gap-2 sm:gap-3 flex-1">
                    <div className="flex items-start justify-between gap-1 sm:gap-2">
                      <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-neutral-900 text-white rounded-full text-[10px] sm:text-xs font-semibold shrink-0 max-w-[80%] sm:max-w-[70%]">
                        <card.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                        <span className="truncate">{card.title}</span>
                      </div>
                      {card.badge !== null && (
                        <span className="inline-flex items-center justify-center h-5 sm:h-6 min-w-[1.25rem] sm:min-w-[1.5rem] px-1.5 sm:px-2 text-[10px] sm:text-xs font-bold rounded-full text-white shrink-0" style={{ backgroundColor: '#B21063' }}>{card.badge}</span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-300 leading-relaxed flex-1 line-clamp-2">{card.subtitle}</p>
                  </div>
                  <div className="px-3 sm:px-5 pb-3 sm:pb-5 mt-auto">
                    <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors">{card.action}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </section>
        </div>

        {/* قسم الخدمات الإضافية */}
        <div>
          <h2 className="text-sm sm:text-base font-bold mb-3 sm:mb-4 text-neutral-700 dark:text-neutral-200 tracking-wide uppercase">الخدمات الإضافية</h2>
          <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 items-stretch">
            {regularCards.map((card, idx) => (
              <motion.button
                key={card.title + idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * (idx + primaryCards.length) }}
                onClick={() => handleCardClick(card)}
                className="group h-full w-full text-right cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <div className="relative h-full min-h-[140px] sm:min-h-[200px] flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-neutral-800 shadow-[0_2px_16px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] transition-all duration-200 border border-neutral-100 dark:border-neutral-700">
                  <div className={cn("absolute inset-x-0 -top-16 h-40 bg-gradient-to-r opacity-10 group-hover:opacity-20 blur-2xl transition", card.accent)} />
                  <div className="relative p-3 sm:p-5 flex flex-col gap-2 sm:gap-3 flex-1">
                    <div className="flex items-start justify-between gap-1 sm:gap-2">
                      <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-neutral-900 text-white rounded-full text-[10px] sm:text-xs font-semibold shrink-0 max-w-[80%] sm:max-w-[70%]">
                        <card.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                        <span className="truncate">{card.title}</span>
                      </div>
                      {card.badge !== null && (
                        <span className="inline-flex items-center justify-center h-5 sm:h-6 min-w-[1.25rem] sm:min-w-[1.5rem] px-1.5 sm:px-2 text-[10px] sm:text-xs font-bold rounded-full text-white shrink-0" style={{ backgroundColor: '#B21063' }}>{card.badge}</span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-300 leading-relaxed flex-1 line-clamp-2">{card.subtitle}</p>
                  </div>
                  <div className="px-3 sm:px-5 pb-3 sm:pb-5 mt-auto">
                    <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors">{card.action}</span>
                  </div>
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
              <div className="flex items-center gap-1 bg-neutral-0 rounded-full p-1 min-w-0">
              {ATTEND_TABS.map(([key, label, Icon]) => (
                <button key={key} onClick={() => setAttendanceSubTab(key)}
                  className={cn(
                    'flex flex-1 flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-[13px] font-semibold transition-all duration-200 min-w-0',
                    attendanceSubTab === key
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'bg-neutral-50 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 hover:text-neutral-900 dark:hover:text-white'
                  )}>
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
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
      <div dir="rtl" className="min-h-screen" style={{ backgroundColor: dark ? '#0a0a0a' : '#F4F8FE' }}>
        {/* Tab Bar */}
        <div className="sticky top-0 z-40 md:z-30 bg-white dark:bg-neutral-800 border-b border-neutral-100 rounded-xl">
          <div className="max-w-[1400px] mx-auto px-0 sm:px-2 rounded-xl overflow-hidden">
            <div className="px-2 sm:px-4 py-2 border-b border-neutral-100">
              <div className="flex items-center gap-1 bg-neutral-0 rounded-full p-1 min-w-0">
              {TRANS_TABS.map(([key, label, Icon]) => (
                <button key={key} onClick={() => setTransactionsSubTab(key)}
                  className={cn(
                    'flex flex-1 flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-[13px] font-semibold transition-all duration-200 min-w-0',
                    transactionsSubTab === key
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'bg-neutral-50 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 hover:text-neutral-900 dark:hover:text-white'
                  )}>
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span className="truncate">{label}</span>
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
    if (view === "tasks") return <TasksPage onBack={() => setView("dashboard")} onNewCampaign={() => setView("campaigns")} onNewProject={() => alert("صفحة المشاريع قيد التطوير")} />;
    if (view === "campaigns") return <CampaignsPage onBack={() => setView("dashboard")} />;
    if (view === "shortcuts") return renderShortcutsPage();
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
    const bottomTabs = [
      { key: "tasks",         label: "المهام",     icon: ListTodo,       view: "tasks" },
      { key: "sales_kpi",     label: "الأداء",     icon: TrendingUp,     view: "sales_kpi" },
      { key: "transactions",  label: "المعاملات",  icon: ArrowLeftRight, view: "transactions" },
      { key: "attendance",    label: "الحضور",     icon: Calendar,       view: "attendance" },
      { key: "notifications", label: "التنبيهات", icon: Bell,           view: "notifications" },
      { key: "shortcuts",     label: "اختصارات",  icon: Zap,            view: "shortcuts" },
    ];

    return (
      <div dir="rtl" className={rootClass} style={backgroundStyle}>


        {/* Body */}
        <div className="py-4 pb-24 md:pb-6 flex gap-3 md:gap-[150px] px-3 sm:px-4 md:pe-[150px] md:ps-4">
          {/* Sidebar — Navigation Rail (ديسكتوب فقط) */}
          <aside className="hidden md:flex flex-col w-[72px] shrink-0">
            <nav className="sticky top-[72px] rounded-2xl py-3 px-1.5 bg-white/80 dark:bg-neutral-800/80 backdrop-blur border border-white/80 dark:border-neutral-700/80 shadow-[0_2px_16px_rgba(0,0,0,0.07)] flex flex-col items-center gap-1 max-h-[calc(100vh-100px)] overflow-visible">
              {/* Logo */}
              <div className="mb-2 shrink-0">
                <img
                  src="/logonew.svg"
                  alt="الشعار"
                  className="h-8 w-8 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setView('dashboard')}
                  onError={(e) => { e.currentTarget.src = '/vite.svg'; }}
                />
              </div>

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
            {renderContent()}
          </main>
        </div>

        {/* ── Bottom Navigation (جوال فقط) ── */}
        <nav className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 safe-area-bottom">
          <div className="flex items-stretch h-16">
            {bottomTabs.map((tab) => {
              const isActive = view === tab.view
                || (tab.key === "transactions" && ["transactions", "add", "inbox", "outbox", "transaction_details", "annual_leave", "transport_allowance", "transaction_selection", "add_form"].includes(view))
                || (tab.key === "attendance" && ["attendance", "attendance_report", "exit_permission", "hazer_system"].includes(view));
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setBottomTab(tab.key);
                    setView(tab.view);
                    setActiveKey(tab.key);
                    if (tab.key === 'transactions') setTransactionsSubTab('inbox');
                    if (tab.key === 'attendance') { setView('attendance'); setAttendanceSubTab('report'); }
                  }}
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative"
                >
                  {isActive && (
                    <span className="absolute top-0 inset-x-2 h-0.5 rounded-b-full bg-[#B21063]" />
                  )}
                  <tab.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-[#B21063]" : "text-neutral-400 dark:text-neutral-400")} />
                  <span className={cn("text-[10px] font-semibold transition-colors", isActive ? "text-[#B21063]" : "text-neutral-400 dark:text-neutral-400")}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

      </div>
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