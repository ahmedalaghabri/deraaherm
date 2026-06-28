import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Award, TrendingUp, Medal, Crown, MapPin, Store, Users, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";
import PageTabs from "./PageTabs";

const MONTHS_AR = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

const TOP_EMPLOYEES = [
  { rank: 1, name: "محمد عبدالله الشمري", showroom: "معرض الرياض - العليا", region: "إقليم الرياض", sales: 1_420_000, target: 1_200_000, achievement: 118, badge: "gold" },
  { rank: 2, name: "فيصل أحمد العتيبي", showroom: "معرض جدة - الأندلس", region: "إقليم الغربية", sales: 1_310_000, target: 1_200_000, achievement: 109, badge: "silver" },
  { rank: 3, name: "عبدالرحمن سالم القحطاني", showroom: "معرض الدمام - الراشد", region: "إقليم الخليج", sales: 1_240_000, target: 1_200_000, achievement: 103, badge: "bronze" },
  { rank: 4, name: "خالد ناصر الدوسري", showroom: "معرض بريدة - النسيم", region: "إقليم الشمال", sales: 1_180_000, target: 1_100_000, achievement: 107, badge: "top" },
  { rank: 5, name: "سلطان محمد الحربي", showroom: "معرض الخبر - المزون", region: "إقليم الخليج", sales: 1_150_000, target: 1_100_000, achievement: 105, badge: "top" },
  { rank: 6, name: "عمر فهد الزهراني", showroom: "معرض جدة - حراء مول", region: "إقليم الغربية", sales: 1_120_000, target: 1_100_000, achievement: 102, badge: "top" },
  { rank: 7, name: "تركي عبدالعزيز الرشيدي", showroom: "معرض الرياض - المملكة", region: "إقليم الرياض", sales: 1_090_000, target: 1_000_000, achievement: 109, badge: "top" },
  { rank: 8, name: "بندر سعد المطيري", showroom: "معرض حائل - الأندلس", region: "إقليم الشمال", sales: 1_060_000, target: 1_000_000, achievement: 106, badge: "top" },
  { rank: 9, name: "ماجد علي الغامدي", showroom: "معرض مكة المكرمة", region: "إقليم الغربية", sales: 1_030_000, target: 1_000_000, achievement: 103, badge: "top" },
  { rank: 10, name: "نواف إبراهيم العنزي", showroom: "معرض تبوك - الوصل", region: "إقليم الشمال", sales: 1_010_000, target: 1_000_000, achievement: 101, badge: "top" },
];

const TOP_SHOWROOMS = [
  { rank: 1, name: "معرض الرياض - العليا", region: "إقليم الرياض", sales: 4_800_000, target: 4_200_000, achievement: 114 },
  { rank: 2, name: "معرض جدة - الأندلس", region: "إقليم الغربية", sales: 4_500_000, target: 4_000_000, achievement: 113 },
  { rank: 3, name: "معرض الدمام - الراشد", region: "إقليم الخليج", sales: 4_100_000, target: 3_800_000, achievement: 108 },
  { rank: 4, name: "معرض الرياض - المملكة", region: "إقليم الرياض", sales: 3_900_000, target: 3_700_000, achievement: 105 },
  { rank: 5, name: "معرض بريدة - النسيم", region: "إقليم الشمال", sales: 3_600_000, target: 3_500_000, achievement: 103 },
];

const BADGE_STYLES = {
  gold:   { bg: "from-yellow-400 to-amber-500",   ring: "ring-yellow-300",  text: "text-yellow-600",  icon: Crown  },
  silver: { bg: "from-slate-300 to-slate-400",     ring: "ring-slate-200",   text: "text-slate-500",   icon: Medal  },
  bronze: { bg: "from-amber-600 to-amber-700",     ring: "ring-amber-400",   text: "text-amber-700",   icon: Award  },
  top:    { bg: "from-teal-500 to-cyan-600",        ring: "ring-teal-200",    text: "text-teal-600",    icon: Star   },
};

function fmt(n: number) {
  return n >= 1_000_000
    ? (n / 1_000_000).toFixed(2) + "م"
    : n >= 1_000
    ? (n / 1_000).toFixed(0) + "ك"
    : String(n);
}

const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

export default function HonorBoardPage() {
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [tab, setTab] = useState<"employees" | "showrooms">("employees");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const employees = sortDir === "desc" ? TOP_EMPLOYEES : [...TOP_EMPLOYEES].reverse();
  const showrooms = sortDir === "desc" ? TOP_SHOWROOMS : [...TOP_SHOWROOMS].reverse();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">لوحة الشرف</h1>
            <p className="text-sm text-neutral-500">أفضل المندوبين والمعارض أداءً</p>
          </div>
        </div>

        {/* Month / Year Selector */}
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {MONTHS_AR.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Podium - Top 3 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3 mb-8 items-end"
      >
        {/* 2nd */}
        <PodiumCard person={TOP_EMPLOYEES[1]} position={2} height="h-32" />
        {/* 1st */}
        <PodiumCard person={TOP_EMPLOYEES[0]} position={1} height="h-44" featured />
        {/* 3rd */}
        <PodiumCard person={TOP_EMPLOYEES[2]} position={3} height="h-24" />
      </motion.div>

      {/* Sub-tabs */}
      <PageTabs
        tabs={[
          ["employees", "المندوبون", Users],
          ["showrooms", "المعارض", Store],
        ]}
        active={tab}
        onChange={(key) => setTab(key as typeof tab)}
      />

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-800 text-sm">
            {tab === "employees" ? "ترتيب المندوبين" : "ترتيب المعارض"} — {MONTHS_AR[month]} {year}
          </h2>
          <button
            onClick={() => setSortDir((d) => d === "desc" ? "asc" : "desc")}
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            {sortDir === "desc" ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            ترتيب
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === "employees" && (
            <motion.div key="emp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {employees.map((emp, idx) => {
                const badgeKey = emp.badge as keyof typeof BADGE_STYLES;
                const style = BADGE_STYLES[badgeKey];
                const BadgeIcon = style.icon;
                return (
                  <motion.div
                    key={emp.rank}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex items-center gap-4 px-5 py-3.5 border-b border-neutral-50 hover:bg-neutral-50/70 transition-colors last:border-0"
                  >
                    <div className={`size-9 rounded-xl bg-gradient-to-br ${style.bg} flex items-center justify-center shadow-sm shrink-0`}>
                      <BadgeIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ring-2 ${style.ring} ${style.text} bg-white shrink-0`}>
                      {emp.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-neutral-900 truncate">{emp.name}</p>
                      <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                        <Store className="h-3 w-3 shrink-0" />
                        <span className="truncate">{emp.showroom}</span>
                        <span className="hidden sm:inline">•</span>
                        <MapPin className="h-3 w-3 shrink-0 hidden sm:inline" />
                        <span className="hidden sm:inline truncate">{emp.region}</span>
                      </div>
                    </div>
                    <div className="text-left hidden sm:block shrink-0">
                      <p className="text-sm font-bold text-neutral-900">{fmt(emp.sales)}</p>
                      <p className="text-xs text-neutral-400">من {fmt(emp.target)}</p>
                    </div>
                    <div className="shrink-0">
                      <AchievementPill value={emp.achievement} />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {tab === "showrooms" && (
            <motion.div key="show" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {showrooms.map((s, idx) => {
                const badgeKey = s.rank <= 3 ? (["gold","silver","bronze"] as const)[s.rank - 1] : "top";
                const style = BADGE_STYLES[badgeKey];
                const BadgeIcon = style.icon;
                return (
                  <motion.div
                    key={s.rank}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-4 px-5 py-3.5 border-b border-neutral-50 hover:bg-neutral-50/70 transition-colors last:border-0"
                  >
                    <div className={`size-9 rounded-xl bg-gradient-to-br ${style.bg} flex items-center justify-center shadow-sm shrink-0`}>
                      <BadgeIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ring-2 ${style.ring} ${style.text} bg-white shrink-0`}>
                      {s.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-neutral-900 truncate">{s.name}</p>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{s.region}</span>
                      </div>
                    </div>
                    <div className="text-left hidden sm:block shrink-0">
                      <p className="text-sm font-bold text-neutral-900">{fmt(s.sales)}</p>
                      <p className="text-xs text-neutral-400">من {fmt(s.target)}</p>
                    </div>
                    <div className="shrink-0">
                      <AchievementPill value={s.achievement} />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function PodiumCard({ person, position, height, featured = false }: {
  person: typeof TOP_EMPLOYEES[0];
  position: number;
  height: string;
  featured?: boolean;
}) {
  const colors = { 1: "from-yellow-400 to-amber-500", 2: "from-slate-300 to-slate-400", 3: "from-amber-600 to-amber-700" };
  const icons = { 1: Crown, 2: Medal, 3: Award };
  const Icon = icons[position as 1 | 2 | 3];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: position * 0.08 }}
      className={`flex flex-col items-center gap-2 ${featured ? "order-first sm:order-none" : ""}`}
    >
      <div className={`size-14 rounded-2xl bg-gradient-to-br ${colors[position as 1 | 2 | 3]} flex items-center justify-center shadow-lg ${featured ? "size-16" : ""}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="text-center px-1">
        <p className={`font-bold text-neutral-900 leading-tight ${featured ? "text-sm" : "text-xs"}`}>{person.name.split(" ").slice(0, 2).join(" ")}</p>
        <p className="text-[10px] text-neutral-400 mt-0.5 truncate max-w-[90px]">{person.showroom}</p>
        <p className={`text-xs font-bold mt-1 ${position === 1 ? "text-yellow-600" : position === 2 ? "text-slate-500" : "text-amber-700"}`}>
          {person.achievement}%
        </p>
      </div>
      <div className={`w-full ${height} rounded-t-xl bg-gradient-to-br ${colors[position as 1 | 2 | 3]} opacity-20 flex items-end justify-center pb-2`}>
        <span className={`text-lg font-black ${position === 1 ? "text-yellow-600" : position === 2 ? "text-slate-500" : "text-amber-700"}`}>{position}</span>
      </div>
    </motion.div>
  );
}

function AchievementPill({ value }: { value: number }) {
  const color = value >= 110 ? "bg-emerald-100 text-emerald-700" : value >= 100 ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${color}`}>
      <TrendingUp className="h-3 w-3" />
      {value}%
    </span>
  );
}
