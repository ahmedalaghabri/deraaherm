import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import AttendanceDashboard from "./components/AttendanceDashboard";
import HazerSystem from "./components/HazerSystem";
import AnnualLeaveForm from "./components/AnnualLeaveForm";
import {
  Bell,
  Search,
  Settings,
  Menu,
  LogOut,
  Sun,
  Moon,
  Inbox,
  Send,
  FileText,
  Users,
  ShieldCheck,
  ClipboardList,
  Award,
  Accessibility,
  GaugeCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Upload,
  X,
  Save,
  Check,
  ArrowRight,
  Tag,
  Calendar,
  Building2,
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
  Phone,
  RefreshCcw,
  Archive,
  FilePlus,
  Mail,
  BarChart3,
  LayoutDashboard,
  ArrowLeftRight,
  ExternalLink,
  Globe,
  Database,
  MessageSquare,
  TrendingUp,
  FileSpreadsheet,
  Briefcase,
  UserCheck,
  CreditCard,
  Home,
  Car,
  Plane,
  Heart,
  GraduationCap,
  Baby,
  MapPin,
  Zap,
  User,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

// ====== مجموعات القائمة الجانبية ======
const sidebarGroups = [
  {
    label: "عام",
    items: [{ key: "dashboard", title: "الرئيسية", icon: GaugeCircle }],
  },
  {
    label: "الطلبات",
    items: [
      { key: "request_new", title: "طلب جديد", icon: FilePlus },
      { key: "inbox", title: "الوارد", icon: Inbox },
      { key: "outbox", title: "الصادر", icon: Send },
      { key: "request_archive", title: "ارشيف الطلب", icon: Archive },
      { key: "notices", title: "التنبيهات والتعميمات", icon: Bell },
    ],
  },
  {
    label: "الحضور والانصراف",
    items: [
      { key: "attendance_report", title: "تقرير الحضور", icon: Calendar },
      { key: "exit_permission", title: "طلب اذن خروج", icon: LogOut },
      { key: "permissions_review", title: "مراجعة الأذونات", icon: ClipboardList },
      { key: "hazer_system", title: "نظام حاضر", icon: Clock },
    ],
  },
  {
    label: "المسيرات والخصوم",
    items: [
      { key: "advances_approval", title: "مصادقة السلف", icon: CheckCircle },
      { key: "payroll_deductions", title: "المسير والخصوم", icon: ClipboardList },
    ],
  },
  {
    label: "الأنشطة والمسابقات",
    items: [
      { key: "excellence_comp", title: "مسابقة التميز المؤسسي", icon: Award },
      { key: "ramadan_events", title: "مسابقة وأنشطة رمضان", icon: Sparkles },
    ],
  },
  {
    label: "خدمات أخرى",
    items: [
      { key: "complaints", title: "الشكاوى والاقتراحات", icon: AlertTriangle },
      { key: "central", title: "السنترال", icon: Phone },
      { key: "profile_update", title: "تحديث البيانات", icon: RefreshCcw },
      { key: "help", title: "مساعدة", icon: Sparkles },
    ],
  },
  {
    label: "روابط خارجية",
    items: [
      { key: "hr_queries", title: "استعلامات الموارد البشرية", icon: Users },
      { key: "archiving_system", title: "نظام الأرشفة الإلكترونية", icon: Archive },
      { key: "tasks_tracking", title: "نظام متابعة المهام", icon: ClipboardList },
      { key: "deraa_email", title: "إيميل درعه", icon: Mail },
      { key: "external_email", title: "الإيميل الخارجي", icon: Mail },
      { key: "daily_sales", title: "المبيعات اليومية", icon: BarChart3 },
      { key: "portal_dashboard", title: "لوحة تحكم البوابة", icon: LayoutDashboard },
      { key: "email_dashboard", title: "لوحة تحكم الايميل", icon: LayoutDashboard },
      { key: "transactions_reports", title: "تقارير المعاملات", icon: BarChart3 },
      { key: "transfers_followup", title: "متابعة التحويلات والاستلامات", icon: ArrowLeftRight },
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
      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
        <span className="font-medium">{title}</span>
      </div>
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-6 shadow-sm">
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
      <div className="flex items-center gap-3 text-xs mt-3 text-neutral-600 dark:text-neutral-400">
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
      title: "مرحباً بك في البوابة الإلكترونية",
      subtitle: "نظام متكامل لإدارة المعاملات والخدمات",
      image: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=cropg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
      gradient: ""
    },
    {
      id: 2,
      title: "خدمات متطورة وسهلة الاستخدام",
      subtitle: "تجربة مستخدم محسّنة لجميع احتياجاتك الإدارية",
      image: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
      gradient: ""
    },
    {
      id: 3,
      title: "أمان وموثوقية عالية",
      subtitle: "حماية بياناتك وخصوصيتك أولويتنا القصوى",
      image: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop
        ?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
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
              currentSlide === index ? 'bg-white' : 'bg-white/50'
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
      <h2 className="text-xl font-bold mb-6 text-neutral-800 dark:text-neutral-200">الروابط الخارجية</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {externalLinks.map((link, index) => (
          <motion.a
            key={link.title}
            href={link.url}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group block p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${link.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <link.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-sm mb-1 text-neutral-800 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {link.title}
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {link.description}
            </p>
            <div className="mt-2 flex items-center text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
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

  const departments = ["الكل", ...new Set(transactionTypes.map(t => t.department))];
  
  const filteredTransactions = transactionTypes.filter(transaction => {
    const matchesSearch = transaction.title.includes(searchTerm) || transaction.description.includes(searchTerm);
    const matchesDepartment = selectedDepartment === "الكل" || transaction.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div dir="rtl" className="min-h-screen bg-[radial-gradient(40%_40%_at_100%_0%,#eef2ff_0%,transparent_60%),radial-gradient(50%_40%_at_0%_100%,#fff1f2_0%,transparent_60%)]">
      <div className="mx-auto max-w-[1400px] p-3 sm:p-6 space-y-4 sm:space-y-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="rounded-2xl border border-sky-100 bg-gradient-to-b from-sky-50/70 to-white shadow-sm p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">اختر نوع المعاملة</h2>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">اختر نوع المعاملة التي تريد تقديمها من القائمة أدناه</p>
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
                  className="w-full rounded-2xl ps-10 pe-4 py-2.5 sm:py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm transition-shadow"
                />
              </div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="rounded-2xl px-4 py-2.5 sm:py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none w-full sm:min-w-[200px] text-sm shadow-sm transition-shadow"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* شبكة المعاملات */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredTransactions.map((transaction, index) => (
                <motion.button
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onTransactionSelect(transaction.id, transaction.title)}
                  className="group relative h-full min-h-[180px] flex flex-col overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 text-right p-4 shadow-sm"
                >
                  {/* طبقة التدرّج الخلفية */}
                  <div className={cn("absolute inset-x-0 -top-16 h-40 bg-gradient-to-r opacity-10 group-hover:opacity-20 blur-2xl transition", transaction.color)} />

                  <div className="relative flex items-start gap-3 mb-3">
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r ${transaction.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                      <transaction.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-neutral-800 dark:text-neutral-200 leading-tight mb-1">
                        {transaction.title}
                      </h3>
                    </div>
                  </div>

                  <p className="relative text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3 flex-1">
                    {transaction.description}
                  </p>

                  <div className="relative flex items-center justify-between mt-auto">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100/80 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border border-blue-200/50 dark:border-blue-800/50">
                      {transaction.department}
                    </span>
                    <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.button>
              ))}
            </div>

            {filteredTransactions.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 sm:py-16"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <Search className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">لا توجد نتائج</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">جرب تغيير كلمات البحث أو الفلتر</p>
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
      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
        <button onClick={onCancel} className="inline-flex items-center gap-1 hover:underline">
          <ArrowRight className="h-4 w-4" /> الرئيسية
        </button>
        <span>/</span>
        <span className="font-medium">إضافة معاملة</span>
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">إضافة معاملة</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">أدخل تفاصيل المعاملة الجديدة، الحقول الأساسية مطلوبة.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-900/40 dark:active:bg-blue-900/60 text-sm">إلغاء</button>
            <button onClick={handleSubmit} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 disabled:opacity-50">
              {saving ? <Save className="h-4 w-4 animate-pulse" /> : <Check className="h-4 w-4" />}
              حفظ المعاملة
            </button>
          </div>
        </div>

        {saved && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 p-3 text-sm">تم حفظ المعاملة بنجاح.</div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* العمود 1 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">عنوان المعاملة<span className="text-red-600">*</span></label>
              <input value={form.title} onChange={(e) => setField("title", e.target.value)} className={cn("w-full rounded-xl px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border", errors.title ? "border-red-500" : "border-neutral-200 dark:border-neutral-700")} placeholder="مثال: طلب اعتماد عقد صيانة" />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">الاتجاه<span className="text-red-600">*</span></label>
                <select value={form.direction} onChange={(e) => setField("direction", e.target.value)} className={cn("w-full rounded-xl px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border", errors.direction ? "border-red-500" : "border-neutral-200 dark:border-neutral-700")}> 
                  <option>صادر</option>
                  <option>وارد</option>
                  <option>داخلي</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">نوع المعاملة</label>
                <select value={form.type} onChange={(e) => setField("type", e.target.value)} className="w-full rounded-xl px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
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
                <input value={form.refNo} onChange={(e) => setField("refNo", e.target.value)} className="w-full rounded-xl px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" placeholder="مثال: HR-2025-001" />
              </div>
              <div>
                <label className="block text-sm mb-1">التاريخ<span className="text-red-600">*</span></label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                  <input type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} className={cn("w-full rounded-xl ps-9 pe-3 py-2 bg-neutral-100 dark:bg-neutral-800 border", errors.date ? "border-red-500" : "border-neutral-200 dark:border-neutral-700")} />
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
                  <input value={form.sender} onChange={(e) => setField("sender", e.target.value)} className="w-full rounded-xl ps-9 pe-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" placeholder="اسم الجهة/القسم" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">الجهة المستلمة</label>
                <div className="relative">
                  <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                  <input value={form.receiver} onChange={(e) => setField("receiver", e.target.value)} className="w-full rounded-xl ps-9 pe-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" placeholder="اسم الجهة/القسم" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">الأولوية</label>
                <div className="relative">
                  <AlertTriangle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                  <select value={form.priority} onChange={(e) => setField("priority", e.target.value)} className="w-full rounded-xl ps-9 pe-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
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
                  <select value={form.confidentiality} onChange={(e) => setField("confidentiality", e.target.value)} className="w-full rounded-xl ps-9 pe-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
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
                <input type="date" value={form.dueDate} onChange={(e) => setField("dueDate", e.target.value)} className="w-full rounded-xl px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" />
              </div>
              <div>
                <label className="block text-sm mb-1">القسم/الإدارة</label>
                <input value={form.department} onChange={(e) => setField("department", e.target.value)} className="w-full rounded-xl px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" placeholder="مثال: الموارد البشرية" />
              </div>
            </div>
          </div>
          {/* العمود 3 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">المكلف بالمعاملة</label>
              <input value={form.assignee} onChange={(e) => setField("assignee", e.target.value)} className="w-full rounded-xl px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" placeholder="اسم الموظف" />
            </div>
            <div>
              <label className="block text-sm mb-1">وسوم</label>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs bg-neutral-200 dark:bg-neutral-800">
                    <Tag className="h-3 w-3" /> {t}
                    <button onClick={() => setTags((prev) => prev.filter((x) => x !== t))} className="ms-1"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <input onKeyDown={addTagFromInput} placeholder="اكتب الوسم ثم Enter" className="w-full rounded-xl px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" />
            </div>
            <div>
              <label className="block text-sm mb-1">الوصف</label>
              <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={5} className="w-full rounded-xl px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" placeholder="تفاصيل إضافية حول المعاملة" />
            </div>
          </div>
          {/* مرفقات */}
          <div className="lg:col-span-3">
            <label className="block text-sm mb-1">المرفقات</label>
            <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="text-sm text-neutral-600 dark:text-neutral-400">اسحب وأفلت الملفات هنا أو</div>
                <div className="flex items-center gap-2">
                  <input ref={fileInputRef} onChange={(e) => onFilesSelected(e.target.files)} type="file" multiple hidden />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-900/40 dark:active:bg-blue-900/60 text-sm"><Upload className="h-4 w-4" /> اختر ملفات</button>
                </div>
              </div>
              {!!attachments.length && (
                <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {attachments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm bg-white dark:bg-neutral-900">
                      <div className="truncate">{a.name}</div>
                      <button onClick={() => removeAttachment(a.id)} className="p-1 rounded-md hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-900/40 dark:active:bg-blue-900/60"><X className="h-4 w-4" /></button>
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
  const [currentPage, setCurrentPage] = useState("login");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [activeKey, setActiveKey] = useState("dashboard");
  const [openGroups, setOpenGroups] = useState(() => Object.fromEntries(sidebarGroups.map((g) => [g.label, true])));
  const [view, setView] = useState("dashboard"); // dashboard | add | attendance_report | ...

  // صفحة تسجيل الدخول
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const rootClass = useMemo(() => cn(
    "min-h-screen w-full font-sans antialiased transition-colors duration-300",
    dark ? "dark bg-neutral-950 text-neutral-100" : "text-neutral-900"
  ), [dark]);

  const backgroundStyle = dark ? {} : { backgroundColor: '#FAFCFF' };

  // عناوين الصفحات
  const titlesMap = (() => {
    const map = { dashboard: "البوابة الإلكترونية", add: "معاملة جديد", attendance_report: "تقرير الحضور", hazer_system: "نظام حاضر" };
    sidebarGroups.forEach((g) => g.items.forEach((it) => (map[it.key] = it.title)));
    return map;
  })();
  const currentTitle = titlesMap[view] || "البوابة الإلكترونية";

  function toggleGroup(label) { setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] })); }

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
      setView("attendance_report");
      setActiveKey("attendance_report");
    } else {
      // للبطاقات الأخرى، يمكن إضافة منطق مخصص
      console.log(`تم النقر على بطاقة: ${card.title}`);
    }
  }

  // دالة تسجيل الدخول
  function handleLogin(e) {
    e.preventDefault();
    if (!loginForm.username.trim() || !loginForm.password.trim()) return;
    
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      setCurrentPage("welcome");
    }, 1500);
  }

 function renderLoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 p-4">

      {/* الشعار فوق البطاقة مباشرة */}
      <div className="mb-14 flex justify-center w-full">
        <img 
          src="/biglogo.svg" 
          alt="شعار درعه" 
          className="h-20 w-auto object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling.style.display = 'block';
          }}
        />
        <div className="hidden text-3xl font-bold text-blue-600 dark:text-blue-400">درعه</div>
      </div>

      {/* البطاقة */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-8">
          
          {/* العنوان والوصف */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              تسجيل الدخول
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              أدخل بياناتك للوصول إلى البوابة الإلكترونية
            </p>
          </div>

          {/* نموذج تسجيل الدخول */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                رقم الهوية
              </label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full rounded-xl px-12 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="أدخل رقم الهوية"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-xl px-12 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="أدخل كلمة المرور"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
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
          </form>

          {/* روابط إضافية */}
          <div className="mt-6 text-center">
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              نسيت كلمة المرور؟
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

  // صفحة الترحيب
  function renderWelcomePage() {
    const welcomeCards = [
      { title: "بوابة المعاملات", subtitle: "إدارة المعاملات والمكاتبات", icon: FileText, accent: "from-blue-500/50 to-sky-600/50", action: "دخول", onClick: () => setCurrentPage("main-dashboard") },
      { title: "المهام وإدارة الفريق", subtitle: "متابعة المهام والفرق", icon: Users, accent: "from-emerald-500/50 to-green-600/50", action: "دخول" },
      { title: "نظام الحضور والغياب", subtitle: "تتبع الحضور والانصراف", icon: Clock, accent: "from-amber-500/50 to-orange-500/50", action: "دخول" },
      { title: "إحصائيات المبيعات", subtitle: "تقارير ومؤشرات الأداء", icon: BarChart3, accent: "from-purple-500/50 to-violet-600/50", action: "دخول" },
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
                className="h-14 w-auto mx-auto object-contain mb-4"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling.style.display = 'block';
                }}
              />
              <div className="hidden text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">درعه</div>
            </div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">أهلاً بكم في درعه</h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              المنصة الإلكترونية لخدمات شركة درعه لجميع الموظفين
            </p>
          </motion.div>

          {/* البطاقات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {welcomeCards.map((card, idx) => (
              <motion.button
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                onClick={card.onClick || (() => console.log(`تم النقر على: ${card.title}`))}
                className="group h-full w-full text-right cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <div className="relative h-full min-h-[200px] flex flex-col overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg hover:shadow-2xl transition-all duration-300">
                  {/* طبقة التدرّج */}
                  <div className={cn("absolute inset-x-0 -top-16 h-40 bg-gradient-to-r opacity-20 group-hover:opacity-30 blur-2xl transition", card.accent)} />
                  
                  <div className="relative p-6 flex items-start gap-4 flex-1">
                    <div className="shrink-0">
                      <div className="size-14 rounded-2xl bg-gradient-to-br from-white/70 to-white/30 dark:from-neutral-800/60 dark:to-neutral-700/30 border border-neutral-200/70 dark:border-neutral-700/50 backdrop-blur flex items-center justify-center">
                        <card.icon className="h-7 w-7" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold tracking-tight leading-6 text-gray-900 dark:text-white mb-2">{card.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-neutral-400">{card.subtitle}</p>
                    </div>
                  </div>
                  
                  <div className="px-6 pb-6 flex items-center justify-start text-sm mt-auto">
                    <span className="font-medium text-blue-600 dark:text-blue-400 group-hover:underline">{card.action}</span>
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
    
    // الحصول على الروابط الخارجية من القائمة الجانبية
    const externalLinksGroup = sidebarGroups.find(g => g.label === "روابط خارجية");
    const externalLinksCards = externalLinksGroup ? externalLinksGroup.items.map(item => ({
      title: item.title,
      subtitle: "رابط خارجي",
      icon: item.icon,
      badge: null,
      accent: "from-gray-500/50 to-slate-600/50",
      action: "فتح الرابط"
    })) : [];

    return (
      <div className="space-y-6">
        {/* السلايدر */}
        <ImageSlider />
        

        
        {/* قسم الخدمات الأساسية */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-200">الخدمات الأساسية</h2>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {primaryCards.map((c) => ({ ...c, onAction: c.onAction?.bind(null, setView) })).map((card, idx) => (
              <motion.button
                key={card.title + idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * idx }}
                onClick={() => handleCardClick(card)}
                className="group h-full w-full text-right cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <div className="relative h-full min-h-[220px] flex flex-col overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-xl transition-shadow">
                  {/* طبقة التدرّج المخفّف 50% */}
                  <div className={cn("absolute inset-x-0 -top-16 h-40 bg-gradient-to-r opacity-20 group-hover:opacity-30 blur-2xl transition", card.accent)} />
                  <div className="relative p-5 flex items-start gap-4 flex-1">
                    <div className="shrink-0">
                      <div className="size-12 rounded-2xl bg-gradient-to-br from-white/70 to-white/30 dark:from-neutral-800/60 dark:to-neutral-700/30 border border-neutral-200/70 dark:border-neutral-700/50 backdrop-blur flex items-center justify-center">
                        <card.icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold tracking-tight leading-6 text-gray-900 dark:text-white">{card.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-neutral-400 mt-0.5">{card.subtitle}</p>
                    </div>
                    {card.badge !== null && (
                      <span className="inline-flex items-center justify-center h-7 min-w-[1.75rem] px-2 text-xs font-semibold rounded-full text-white" style={{ backgroundColor: '#B21063' }}>{card.badge}</span>
                    )}
                  </div>
                  <div className="px-5 pb-4 flex items-center justify-start text-sm mt-auto">
                    <span className="font-medium text-blue-600 dark:text-blue-400 group-hover:underline">{card.action}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </section>
        </div>

        {/* قسم الخدمات الإضافية */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-200">الخدمات الإضافية</h2>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
            {regularCards.map((card, idx) => (
              <motion.button
                key={card.title + idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * (idx + primaryCards.length) }}
                onClick={() => handleCardClick(card)}
                className="group h-full w-full text-right cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <div className="relative h-full min-h-[220px] flex flex-col overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-xl transition-shadow">
                  {/* طبقة التدرّج المخفّف 50% */}
                  <div className={cn("absolute inset-x-0 -top-16 h-40 bg-gradient-to-r opacity-20 group-hover:opacity-30 blur-2xl transition", card.accent)} />
                  <div className="relative p-5 flex items-start gap-4 flex-1">
                    <div className="shrink-0">
                      <div className="size-12 rounded-2xl bg-gradient-to-br from-white/70 to-white/30 dark:from-neutral-800/60 dark:to-neutral-700/30 border border-neutral-200/70 dark:border-neutral-700/50 backdrop-blur flex items-center justify-center">
                        <card.icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold tracking-tight leading-6 text-gray-900 dark:text-white">{card.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-neutral-400 mt-0.5">{card.subtitle}</p>
                    </div>
                    {card.badge !== null && (
                      <span className="inline-flex items-center justify-center h-7 min-w-[1.75rem] px-2 text-xs font-semibold rounded-full text-white" style={{ backgroundColor: '#B21063' }}>{card.badge}</span>
                    )}
                  </div>
                  <div className="px-5 pb-4 flex items-center justify-start text-sm mt-auto">
                    <span className="font-medium text-blue-600 dark:text-blue-400 group-hover:underline">{card.action}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </section>
        </div>

        {/* قسم الروابط الخارجية */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-200">الروابط الخارجية</h2>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
            {externalLinksCards.map((card, idx) => (
              <motion.button
                key={card.title + idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * (idx + 8) }}
                onClick={() => handleCardClick(card)}
                className="group h-full w-full text-right cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <div className="relative h-full min-h-[220px] flex flex-col overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-xl transition-shadow">
                  {/* طبقة التدرّج المخفّف 50% */}
                  <div className={cn("absolute inset-x-0 -top-16 h-40 bg-gradient-to-r opacity-20 group-hover:opacity-30 blur-2xl transition", card.accent)} />
                  <div className="relative p-5 flex items-start gap-4 flex-1">
                    <div className="shrink-0">
                      <div className="size-12 rounded-2xl bg-gradient-to-br from-white/70 to-white/30 dark:from-neutral-800/60 dark:to-neutral-700/30 border border-neutral-200/70 dark:border-neutral-700/50 backdrop-blur flex items-center justify-center">
                        <card.icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold tracking-tight leading-6 text-gray-900 dark:text-white">{card.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-neutral-400 mt-0.5">{card.subtitle}</p>
                    </div>
                    {card.badge !== null && (
                      <span className="inline-flex items-center justify-center h-7 min-w-[1.75rem] px-2 text-xs font-semibold rounded-full text-white" style={{ backgroundColor: '#B21063' }}>{card.badge}</span>
                    )}
                  </div>
                  <div className="px-5 pb-4 flex items-center justify-start text-sm mt-auto">
                    <span className="font-medium text-blue-600 dark:text-blue-400 group-hover:underline">{card.action}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </section>
        </div>
      </div>
    );
  }

  function renderAttendancePage() {
    return <AttendanceDashboard />;
  }

  function renderHazerSystemPage() {
    return <HazerSystem />;
  }

  function renderGenericPage(key) {
    const title = titlesMap[key] || "صفحة";
    return (
      <PageShell title={title}>
        <div className="text-sm text-neutral-600 dark:text-neutral-300">هذه صفحة {title}. يمكن لاحقًا ربطها بواجهة فعلية أو بيانات من API.</div>
      </PageShell>
    );
  }

  function renderContent() {
    if (view === "dashboard") return renderDashboard();
    if (view === "add" || view === "transaction_selection") return (
      <TransactionSelectionPage
        onCancel={() => setView("dashboard")}
        onTransactionSelect={(transactionId, transactionName) => {
          if (transactionId === "annual_leave") {
            setView("annual_leave");
          } else {
            setView("add");
          }
        }}
      />
    );
    if (view === "annual_leave") return <AnnualLeaveForm onCancel={() => setView("dashboard")} onSubmit={() => {}} />;
    if (view === "add_form") return <AddTransactionForm onCancel={() => setView("dashboard")} onSaved={() => {}} />;
    if (view === "attendance_report") return renderAttendancePage();
    if (view === "hazer_system") return renderHazerSystemPage();
    return renderGenericPage(view);
  }

  function renderMainDashboard() {
    return (
      <div dir="rtl" className={rootClass} style={backgroundStyle}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 backdrop-blur border-b border-neutral-200 dark:border-neutral-800" style={{ backgroundColor: '#FAFCFF' }}>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center gap-3">
              <button onClick={() => setDrawerOpen(true)} className="md:hidden p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-900/40 dark:active:bg-blue-900/60" aria-label="فتح القائمة على الموبايل">
                <Menu className="h-5 w-5" />
              </button>
              <button onClick={() => setSidebarCollapsed((v) => !v)} className="hidden md:inline-flex p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-900/40 dark:active:bg-blue-900/60" aria-label="طي القائمة الجانبية">
                <Menu className="h-5 w-5" />
              </button>

              {/* شعار + العنوان */}
              <div className="ms-1 flex items-center gap-3">
                <img 
                  src="/logonew.svg" 
                  alt="الشعار" 
                  className="h-24 w-24 object-contain" 
                  onError={(e) => {
                    console.log('Logo failed to load, trying backup');
                    e.currentTarget.src = '/vite.svg';
                  }}
                  onLoad={() => console.log('Logo loaded successfully')}
                />
              </div>

              <div className="ms-auto flex items-center gap-2 sm:gap-3">
                {view === "dashboard" && (
                  <div className="hidden md:flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                      <input placeholder="ابحث عن خدمة أو مستند..." className="w-72 rounded-2xl ps-10 pe-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none focus:ring-2 ring-blue-500" />
                    </div>
                  </div>
                )}
                <button className="relative p-2 rounded-xl hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-900/40 dark:active:bg-blue-900/60 border border-transparent" aria-label="التنبيهات">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-0.5 -left-0.5 h-5 min-w-[1.25rem] px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center">3</span>
                </button>
                <button onClick={() => setDark((d) => !d)} className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-900/40 dark:active:bg-blue-900/60" aria-label="تبديل الوضع الليلي">
                  {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <button className="hidden sm:flex items-center gap-2 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-900/40 dark:active:bg-blue-900/60">
                  <Settings className="h-5 w-5" />
                  <span className="text-sm">الإعدادات</span>
                </button>
                <button className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-900/40 dark:active:bg-blue-900/60">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="py-6 flex gap-6">
          {/* Sidebar */}
          <aside className={cn("hidden md:flex flex-col transition-all duration-300 shrink-0 mr-4 sm:mr-6 lg:mr-8 ml-4 sm:ml-6 lg:ml-8", sidebarCollapsed ? "w-20" : "w-64")}>
            <nav className="relative rounded-2xl p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto pe-1">
                {sidebarGroups.map((group) => (
                  <div key={group.label} className="mb-1">
                    <button onClick={() => toggleGroup(group.label)} className={cn("w-full flex items-center justify-between px-3 py-2 text-[12px] font-semibold text-neutral-500 dark:text-neutral-400", sidebarCollapsed && "justify-center")} title={sidebarCollapsed ? group.label : undefined}>
                      {!sidebarCollapsed && <span className="truncate text-right">{group.label}</span>}
                      {!sidebarCollapsed ? (
                        <ChevronDown className={cn("h-4 w-4 transition-transform", openGroups[group.label] ? "rotate-0" : "-rotate-90")} />
                      ) : (
                        <ChevronDown className="h-4 w-4 opacity-60" />
                      )}
                    </button>
                    <div className={cn(openGroups[group.label] ? "block" : "hidden")}>
                      {group.items.map(({ key, title, icon: Icon }) => (
                        <div key={key} className="group relative">
                          <button
                            onClick={() => {
                              setActiveKey(key);
                              if (key === "request_new") setView("add"); else setView(key);
                            }}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition outline-none",
                              activeKey === key ? "bg-neutral-100 dark:bg-neutral-800/70 text-neutral-900 dark:text-neutral-50 ring-1 ring-neutral-200 dark:ring-neutral-700" : "text-neutral-700 dark:text-neutral-300 hover:bg-[#B21063]/10 active:bg-[#B21063]/20 dark:hover:bg-[#B21063]/20 dark:active:bg-[#B21063]/30"
                            )}
                            title={sidebarCollapsed ? title : undefined}
                          >
                            {activeKey === key && <span className="absolute inset-y-1 right-0 w-1.5 rounded-s-full bg-blue-600 dark:bg-blue-500" />}
                            <Icon className="h-5 w-5 shrink-0" />
                            {!sidebarCollapsed && <span className="truncate text-right">{title}</span>}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="sticky bottom-0 -mb-2 mt-2 bg-gradient-to-t from-white/90 dark:from-neutral-900/90 to-transparent pt-2">
                <button onClick={() => setSidebarCollapsed((v) => !v)} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-900/40 dark:active:bg-blue-900/60 text-sm">
                  {sidebarCollapsed ? (<><ChevronLeft className="h-4 w-4" /><span>توسيع</span></>) : (<><ChevronRight className="h-4 w-4" /><span>طيّ</span></>)}
                </button>
              </div>
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl">
            {renderContent()}
            <footer className="mt-10 text-center text-xs text-neutral-500 dark:text-neutral-400">النسخة الاحتياطية v2 - البطاقات قابلة للنقر + عناوين الأقسام</footer>
          </main>
        </div>

        {/* Drawer (Mobile) */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
            <aside className="absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white dark:bg-neutral-900 border-s border-neutral-200 dark:border-neutral-800 shadow-xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">القائمة</span>
                <button onClick={() => setDrawerOpen(false)} className="text-sm px-3 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800">إغلاق</button>
              </div>
              <div className="relative mb-3">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                <input placeholder="ابحث عن خدمة..." className="w-full rounded-xl ps-9 pe-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none focus:ring-2 ring-blue-500" />
              </div>
              {sidebarGroups.map((group) => (
                <div key={group.label} className="mb-2">
                  <div className="px-1 py-1 text-[12px] font-semibold text-neutral-500 dark:text-neutral-400">{group.label}</div>
                  <ul className="space-y-1">
                    {group.items.map(({ key, title, icon: Icon }) => (
                      <li key={key}>
                        <button
                          onClick={() => {
                            setActiveKey(key);
                            setDrawerOpen(false);
                            if (key === "request_new") setView("add"); else setView(key);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#B21063]/10 active:bg-[#B21063]/20 dark:hover:bg-[#B21063]/20 dark:active:bg-[#B21063]/30 text-sm"
                        >
                          <Icon className="h-5 w-5" />
                          <span className="truncate text-right">{title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </aside>
          </div>
        )}

        {/* Bottom Navigation — Mobile */}
        <nav className="md:hidden sticky bottom-0 z-30 h-14 bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-around">
          {[
            { title: "الرئيسية", icon: GaugeCircle },
            { title: "الوارد", icon: Inbox },
            { title: "الإعدادات", icon: Settings },
          ].map(({ title, icon: Icon }) => (
            <button key={title} className="flex flex-col items-center gap-0.5 text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
              <Icon className="h-5 w-5" />
              {title}
            </button>
          ))}
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