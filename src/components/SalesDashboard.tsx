import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  ArrowRight,
  BarChart3,
  Menu,
  X,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import SalesPerformancePage from "./SalesPerformancePage";
import { cn } from "../lib/utils";

interface SalesDashboardProps {
  onBack: () => void;
}

type NavTab = "kpi";

const NAV_ITEMS: { key: NavTab; label: string; icon: React.ElementType; description: string }[] = [
  { key: "kpi", label: "مؤشرات الأداء", icon: TrendingUp, description: "تقارير وإحصائيات المبيعات" },
];

const SIDEBAR_GROUPS = [
  {
    label: "إحصائيات المبيعات",
    items: NAV_ITEMS,
  },
];

export default function SalesDashboard({ onBack }: SalesDashboardProps) {
  const [activeTab, setActiveTab] = useState<NavTab>("kpi");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ "إحصائيات المبيعات": true });

  function toggleGroup(label: string) {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  return (
    <div dir="rtl" className="min-h-screen flex flex-col font-sans antialiased">

      {/* ─── Top Header ─── */}
      <header className="sticky top-0 z-30 backdrop-blur border-b border-neutral-200 bg-white/80">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center gap-3">

            {/* Mobile: hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden p-2 rounded-xl border border-neutral-200 hover:bg-blue-50 active:bg-blue-100"
              aria-label="فتح القائمة"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop: collapse sidebar */}
            <button
              onClick={() => setSidebarCollapsed((v) => !v)}
              className="hidden md:inline-flex p-2 rounded-xl border border-neutral-200 hover:bg-blue-50 active:bg-blue-100"
              aria-label="طي القائمة الجانبية"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <div className="ms-1 flex items-center gap-3">
              <img
                src="/logonew.svg"
                alt="الشعار"
                className="h-24 w-24 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                onClick={onBack}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>

            {/* Actions */}
            <div className="ms-auto flex items-center gap-2 sm:gap-3">
              <button
                onClick={onBack}
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-800 transition-colors px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-blue-50"
              >
                <ArrowRight className="h-4 w-4" />
                الرئيسية
              </button>
              <button className="relative p-2 rounded-xl hover:bg-blue-50 active:bg-blue-100 border border-transparent" aria-label="التنبيهات">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-0.5 -left-0.5 h-5 min-w-[1.25rem] px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center">3</span>
              </button>
              <button className="hidden sm:flex items-center gap-2 p-2 rounded-xl border border-neutral-200 hover:bg-blue-50 active:bg-blue-100">
                <Settings className="h-5 w-5" />
                <span className="text-sm">الإعدادات</span>
              </button>
              <button
                onClick={onBack}
                className="p-2 rounded-xl border border-neutral-200 hover:bg-blue-50 active:bg-blue-100"
                aria-label="تسجيل الخروج"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Body ─── */}
      <div className="py-6 pb-20 md:pb-6 flex gap-6 flex-1">

        {/* ─── Sidebar (desktop) ─── */}
        <aside className={cn(
          "hidden md:flex flex-col transition-all duration-300 shrink-0 mr-2 sm:mr-3 lg:mr-4 ml-2 sm:ml-3 lg:ml-4",
          sidebarCollapsed ? "w-14" : "w-48"
        )}>
          <nav className="relative rounded-2xl p-2 bg-white border border-neutral-200 shadow-sm flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto pe-1">
              {SIDEBAR_GROUPS.map((group) => (
                <div key={group.label} className="mb-1">
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-[12px] font-semibold text-neutral-500",
                      sidebarCollapsed && "justify-center"
                    )}
                    title={sidebarCollapsed ? group.label : undefined}
                  >
                    {!sidebarCollapsed && <span className="truncate text-right">{group.label}</span>}
                    {!sidebarCollapsed ? (
                      <ChevronDown className={cn("h-4 w-4 transition-transform", openGroups[group.label] ? "rotate-0" : "-rotate-90")} />
                    ) : (
                      <ChevronDown className="h-4 w-4 opacity-60" />
                    )}
                  </button>
                  <div className={cn(openGroups[group.label] ? "block" : "hidden")}>
                    {group.items.map(({ key, label, icon: Icon }) => (
                      <div key={key} className="group relative">
                        <button
                          onClick={() => setActiveTab(key as NavTab)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition outline-none",
                            activeTab === key
                              ? "bg-neutral-100 text-neutral-900 ring-1 ring-neutral-200"
                              : "text-neutral-700 hover:bg-[#B21063]/10 active:bg-[#B21063]/20"
                          )}
                          title={sidebarCollapsed ? label : undefined}
                        >
                          {activeTab === key && (
                            <span className="absolute inset-y-1 right-0 w-1.5 rounded-s-full bg-blue-600" />
                          )}
                          <Icon className="h-5 w-5 shrink-0" />
                          {!sidebarCollapsed && <span className="truncate text-right">{label}</span>}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 -mb-2 mt-2 bg-gradient-to-t from-white/90 to-transparent pt-2">
              <button
                onClick={() => setSidebarCollapsed((v) => !v)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 hover:bg-blue-50 active:bg-blue-100 text-sm"
              >
                {sidebarCollapsed
                  ? (<><ChevronLeft className="h-4 w-4" /><span>توسيع</span></>)
                  : (<><ChevronRight className="h-4 w-4" /><span>طيّ</span></>)
                }
              </button>
            </div>
          </nav>
        </aside>

        {/* ─── Content ─── */}
        <main className="flex-1 px-2 sm:px-3 lg:px-4 max-w-7xl">
          <AnimatePresence mode="wait">
            {activeTab === "kpi" && (
              <motion.div
                key="kpi"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <SalesPerformancePage onBack={onBack} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ─── Drawer (Mobile) ─── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white border-s border-neutral-200 shadow-xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">القائمة</span>
              <button onClick={() => setDrawerOpen(false)} className="text-sm px-3 py-1 rounded-lg border border-neutral-200">إغلاق</button>
            </div>
            <div className="relative mb-3">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
              <input placeholder="ابحث..." className="w-full rounded-xl ps-9 pe-3 py-2 bg-neutral-100 border border-neutral-200 outline-none focus:ring-2 ring-blue-500" />
            </div>
            {SIDEBAR_GROUPS.map((group) => (
              <div key={group.label} className="mb-2">
                <div className="px-1 py-1 text-[12px] font-semibold text-neutral-500">{group.label}</div>
                <ul className="space-y-1">
                  {group.items.map(({ key, label, icon: Icon }) => (
                    <li key={key}>
                      <button
                        onClick={() => { setActiveTab(key as NavTab); setDrawerOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#B21063]/10 active:bg-[#B21063]/20 text-sm"
                      >
                        <Icon className="h-5 w-5" />
                        <span className="truncate text-right">{label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="mt-auto pt-4 border-t border-neutral-100">
              <button
                onClick={() => { setDrawerOpen(false); onBack(); }}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
                <span>العودة للرئيسية</span>
              </button>
            </div>
          </aside>
        </div>
      )}

    </div>
  );
}
