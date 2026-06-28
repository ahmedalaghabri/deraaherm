import React, { useState, useMemo } from "react";
import { FilePlus, Inbox, Send, Archive, Car, Plane, Heart, GraduationCap, Baby, FileText, MessageSquare, ChevronLeft, User, Calendar } from "lucide-react";
import { cn } from "../lib/utils";
import PageTabs from "./PageTabs";

type Tab = "new" | "inbox" | "outbox" | "archive";
type StatusFilter = "all" | "completed" | "pending" | "urgent" | "rejected";

interface Transaction {
  id: string; number: string; title: string; type: string;
  date: string; status: "completed" | "pending" | "urgent" | "rejected";
  person: string;
}

const MOCK_INBOX: Transaction[] = [
  { id: "1", number: "TRX-2026-001", title: "طلب إجازة سنوية", type: "إجازة سنوية", date: "2026-05-04", status: "pending", person: "أحمد محمد السالم" },
  { id: "2", number: "TRX-2026-002", title: "طلب بدل مواصلات - أبريل", type: "بدل مواصلات", date: "2026-05-03", status: "completed", person: "سارة عبدالله" },
  { id: "3", number: "TRX-2026-003", title: "طلب إذن خروج مبكر", type: "إذن خروج", date: "2026-05-05", status: "urgent", person: "خالد العمر" },
  { id: "4", number: "TRX-2026-004", title: "تحديث البيانات الشخصية", type: "بيانات شخصية", date: "2026-05-02", status: "rejected", person: "منى أحمد" },
  { id: "5", number: "TRX-2026-005", title: "طلب إجازة مرضية", type: "إجازة مرضية", date: "2026-05-01", status: "completed", person: "عمر سالم" },
  { id: "6", number: "TRX-2026-006", title: "طلب إجازة أمومة", type: "إجازة أمومة", date: "2026-04-28", status: "completed", person: "فاطمة علي" },
];

const MOCK_OUTBOX: Transaction[] = [
  { id: "7", number: "OUT-2026-001", title: "موافقة على طلب الإجازة", type: "إجازة سنوية", date: "2026-05-04", status: "completed", person: "أحمد محمد السالم" },
  { id: "8", number: "OUT-2026-002", title: "رفض طلب بدل المواصلات", type: "بدل مواصلات", date: "2026-05-03", status: "rejected", person: "سارة عبدالله" },
  { id: "9", number: "OUT-2026-003", title: "معالجة طلب الخروج المبكر", type: "إذن خروج", date: "2026-05-05", status: "pending", person: "خالد العمر" },
  { id: "10", number: "OUT-2026-004", title: "طلب مراجعة البيانات", type: "بيانات شخصية", date: "2026-05-02", status: "urgent", person: "منى أحمد" },
];

const MOCK_ARCHIVE: Transaction[] = [
  { id: "11", number: "ARC-2026-001", title: "إجازة سنوية - يناير 2026", type: "إجازة سنوية", date: "2026-01-20", status: "completed", person: "محمد علي" },
  { id: "12", number: "ARC-2026-002", title: "طلب نقل قسم", type: "نقل داخلي", date: "2026-02-15", status: "completed", person: "فاطمة أحمد" },
  { id: "13", number: "ARC-2026-003", title: "بدل مواصلات - Q1", type: "بدل مواصلات", date: "2026-03-31", status: "completed", person: "عبدالله خالد" },
];

const TRANSACTION_TYPES = [
  { key: "annual_leave",   title: "إجازة سنوية",    icon: Plane,        color: "bg-blue-50 border-blue-200 text-blue-700" },
  { key: "sick_leave",     title: "إجازة مرضية",    icon: Heart,        color: "bg-rose-50 border-rose-200 text-rose-700" },
  { key: "exit_permit",    title: "إذن خروج",       icon: FileText,     color: "bg-amber-50 border-amber-200 text-amber-700" },
  { key: "transport",      title: "بدل مواصلات",    icon: Car,          color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { key: "education",      title: "إجازة دراسية",   icon: GraduationCap, color: "bg-violet-50 border-violet-200 text-violet-700" },
  { key: "maternity",      title: "إجازة أمومة",    icon: Baby,         color: "bg-pink-50 border-pink-200 text-pink-700" },
  { key: "complaint",      title: "شكوى أو اقتراح", icon: MessageSquare, color: "bg-neutral-50 border-neutral-200 text-neutral-700" },
  { key: "data_update",    title: "تحديث البيانات", icon: User,         color: "bg-sky-50 border-sky-200 text-sky-700" },
];

const STATUS_CONFIG = {
  completed: { label: "مكتملة",  bg: "bg-emerald-100", text: "text-emerald-700" },
  pending:   { label: "معلقة",   bg: "bg-amber-100",   text: "text-amber-700" },
  urgent:    { label: "عاجلة",   bg: "bg-red-100",     text: "text-red-700" },
  rejected:  { label: "مرفوضة", bg: "bg-neutral-100", text: "text-neutral-500" },
};

const TABS: [Tab, string, React.ElementType][] = [
  ["new",     "طلب جديد",      FilePlus],
  ["inbox",   "الوارد",        Inbox],
  ["outbox",  "الصادر",        Send],
  ["archive", "أرشيف الصادر", Archive],
];

const STATUS_FILTERS: [StatusFilter, string][] = [
  ["all", "الكل"], ["completed", "مكتملة"], ["pending", "معلقة"],
  ["urgent", "عاجلة"], ["rejected", "مرفوضة"],
];

interface Props { onNewTransaction?: () => void; }

export default function TransactionsPage({ onNewTransaction }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("new");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const rows = useMemo(() => {
    const src = activeTab === "inbox" ? MOCK_INBOX : activeTab === "outbox" ? MOCK_OUTBOX : MOCK_ARCHIVE;
    return statusFilter === "all" ? src : src.filter(t => t.status === statusFilter);
  }, [activeTab, statusFilter]);

  return (
    <div dir="rtl" className="min-h-screen">
      {/* Sub-tabs */}
      <PageTabs
        tabs={TABS.map(([key, label]) => [key, label]) as [Tab, string][]}
        active={activeTab}
        onChange={(key) => { setActiveTab(key as Tab); setStatusFilter("all"); }}
      />
      {activeTab !== "new" && (
        <div className="px-4 py-2.5 flex gap-2 overflow-x-auto scrollbar-hide bg-white dark:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700">
          {STATUS_FILTERS.map(([key, label]) => (
            <button key={key} onClick={() => setStatusFilter(key)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0",
                statusFilter === key ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              )}>
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="p-3 sm:p-5 max-w-5xl mx-auto">
        {/* New Transaction */}
        {activeTab === "new" && (
          <div>
            <p className="text-sm text-neutral-500 mb-4">اختر نوع المعاملة التي تريد تقديمها</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {TRANSACTION_TYPES.map(({ key, title, icon: Icon, color }) => (
                <button key={key} onClick={onNewTransaction}
                  className={cn("bg-white border-2 rounded-2xl p-4 flex flex-col items-center gap-2.5 hover:shadow-md transition-all active:scale-95", color)}>
                  <Icon className="w-7 h-7" />
                  <span className="text-xs sm:text-sm font-semibold text-center leading-tight">{title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Table Views */}
        {activeTab !== "new" && (
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-800">
                {activeTab === "inbox" ? "المعاملات الواردة" : activeTab === "outbox" ? "المعاملات الصادرة" : "أرشيف الصادر"}
              </h3>
              <span className="text-xs text-neutral-400 bg-neutral-100 px-2.5 py-0.5 rounded-full font-medium">{rows.length} معاملة</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100">
                    {["رقم المعاملة", "الموضوع", "النوع", activeTab === "inbox" ? "المُرسِل" : "المُرسَل إليه", "التاريخ", "الحالة"].map(h => (
                      <th key={h} className="px-3 py-2.5 text-xs font-bold text-neutral-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-sm text-neutral-400 py-14">لا توجد معاملات</td></tr>
                  ) : rows.map((row, idx) => {
                    const st = STATUS_CONFIG[row.status];
                    return (
                      <tr key={row.id} className={cn("border-b border-neutral-50 hover:bg-blue-50/20 transition-colors cursor-pointer group", idx % 2 === 0 ? "bg-white" : "bg-neutral-50/30")}>
                        <td className="px-3 py-2.5 text-xs font-mono text-neutral-400 whitespace-nowrap">{row.number}</td>
                        <td className="px-3 py-2.5">
                          <span className="text-sm font-medium text-neutral-800 flex items-center gap-1">
                            {row.title}
                            <ChevronLeft className="w-3 h-3 text-neutral-300 group-hover:text-neutral-600 transition-colors shrink-0" />
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-neutral-500 whitespace-nowrap">{row.type}</td>
                        <td className="px-3 py-2.5 text-xs text-neutral-600 whitespace-nowrap">
                          <span className="flex items-center gap-1.5 justify-end">
                            <span className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                              <User className="w-3 h-3 text-neutral-500" />
                            </span>
                            {row.person}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-neutral-400 whitespace-nowrap">
                          <span className="flex items-center gap-1 justify-end">
                            <Calendar className="w-3 h-3" />
                            {row.date}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full", st.bg, st.text)}>{st.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
