import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  ShoppingBag,
  FileText,
  MapPin,
  BarChart2,
  Calendar,
  ChevronDown,
  ArrowUpDown,
  X,
  Check,
  Table,
  LayoutGrid,
  Rows,
  Pin,
  SlidersHorizontal,
  Filter,
  MoreVertical,
  Users,
  UserCircle,
  Store,
  Search,
  CalendarDays,
  CalendarRange,
  Sun,
} from "lucide-react";
import { cn } from "../lib/utils";
import PageTabs from "./PageTabs";

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────
const MONTHS_AR = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
const DAYS_SHORT_AR = ["أحد","اثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت"];

// ─────────────────────────────────────────
// Data — Generated (10 regions · 25 areas · 200 supervisors · 1000 showrooms · 1000 sellers)
// ─────────────────────────────────────────

// ── Deterministic pseudo-random helpers ──
function _ds(n: number) { return ((n * 9301 + 49297) % 233280) / 233280; }
function _dsk(...p: number[]) { return p.reduce((a, v, i) => a ^ ((v + 1) * (i * 7919 + 1)), 0); }
function _pick<T>(arr: T[], s: number): T { return arr[Math.floor(Math.abs(s) % 1 * arr.length)]; }
function _rng(lo: number, hi: number, s: number) { return Math.round(lo + s * (hi - lo)); }

// ── Name pools ──
const _FIRST = ["أحمد","محمد","عبدالله","خالد","فهد","سعد","عمر","ناصر","تركي","بندر","وليد","فيصل","ماجد","سلطان","نواف","بدر","منصور","راشد","زياد","عادل","يوسف","إبراهيم","حمد","صالح","جاسم","سامي","رامي","طارق","هاني","علي","حسن","عزيز","كريم","أنس","مازن","أيمن","رياض","بلال","وائل","أسامة","عاصم","حازم","مهند","لؤي","عمار","سيف","قيس","شادي","باسم","أيوب"];
const _LAST  = ["السلمي","الشمري","الدوسري","العمري","الحربي","النجار","الزهراني","القرني","الغامدي","الحسن","البلوي","المطيري","الرشيدي","القحطاني","العتيبي","الحمدان","الغريب","العجمي","العنزي","الرشيد","الشمراني","الجهني","الشريف","السبيعي","الحكمي","الجبير","الفيفي","الهاجري","الكثيري","البقمي","الصبيحي","الرويلي","الأنصاري","التميمي","القرشي","السهلي","الزيد","البسام","العيسى","العساف","الفضل","النويصر","الدخيل","الشايع","البراهيم","الموسى","الحمود","الصالح","المنصور","الخالدي"];
const _SFX   = ["العليا","المملكة","النزهة","الروضة","الملقا","الياسمين","الأندلس","السلام","الخليج","المزون","الراشد","النسيم","الوصل","الريان","الفيصلية","العقيق","حراء","النور","الصفاء","الجوهرة","البحر","الكورنيش","الفردوس","الغدير","التلال","الأفنان","البستان","الزيتون","الفلاح","الدانة","الهدى","المشرق","الرفيعة","الأمل","الريف","الواجهة","السحاب","الربوة","القمة","الأفق"];

// ── 10 Regions ──
const _REGION_META = [
  { n: "الرياض" },{ n: "الغربية" },{ n: "الخليج" },{ n: "الشمال" },{ n: "الجنوب" },
  { n: "الوسط"  },{ n: "الشرق"  },{ n: "تهامة"  },{ n: "نجد"    },{ n: "الحجاز" },
];

// ── 25 Areas (2–3 per region) ──
const _AREA_META: { n: string; ri: number }[] = [
  { n: "وسط الرياض",        ri: 0 },{ n: "شمال الرياض",       ri: 0 },{ n: "جنوب الرياض",      ri: 0 },
  { n: "جدة",               ri: 1 },{ n: "مكة المكرمة",       ri: 1 },{ n: "الطائف",            ri: 1 },
  { n: "الدمام",            ri: 2 },{ n: "الخبر",             ri: 2 },{ n: "الأحساء",           ri: 2 },
  { n: "القصيم",            ri: 3 },{ n: "الحدود الشمالية",   ri: 3 },{ n: "حائل",              ri: 3 },
  { n: "أبها",              ri: 4 },{ n: "نجران",             ri: 4 },{ n: "جيزان",             ri: 4 },
  { n: "الدوادمي",          ri: 5 },{ n: "الخرج",             ri: 5 },
  { n: "رفحاء",             ri: 6 },{ n: "عرعر",              ri: 6 },
  { n: "تبوك",              ri: 7 },{ n: "الوجه",             ri: 7 },
  { n: "عنيزة",             ri: 8 },{ n: "الرس",              ri: 8 },
  { n: "المدينة المنورة",   ri: 9 },{ n: "ينبع",              ri: 9 },
];

const REGIONS = _REGION_META.map((r, i) => ({ id: `r${i + 1}`, name: `إقليم ${r.n}` }));

const AREAS = _AREA_META.map((a, i) => ({
  id: `a${i + 1}`,
  name: `منطقة ${a.n}`,
  regionId: `r${a.ri + 1}`,
}));

// 100 supervisors: 4 per area (25 areas × 4 = 100)
const SUPERVISORS = Array.from({ length: 100 }, (_, i) => {
  const areaIdx = Math.floor(i / 4);              // area 0-24, 4 supervisors each
  const area    = AREAS[areaIdx];
  const s1 = _ds(_dsk(i, 1, 31));
  const s2 = _ds(_dsk(i, 2, 43));
  return {
    id: `sup${i + 1}`,
    name: `المشرف ${_pick(_FIRST, s1)} ${_pick(_LAST, s2)}`,
    areaId:   area.id,
    regionId: area.regionId,
  };
});

// 500 showrooms: 20 per area (25 areas × 20 = 500)
// Each group of 5 showrooms inside an area shares one supervisor (20 showrooms ÷ 4 supervisors = 5)
const SHOWROOMS = Array.from({ length: 500 }, (_, i) => {
  const areaIdx  = Math.floor(i / 20);            // area 0-24
  const area     = AREAS[areaIdx];
  const supLocal = Math.floor((i % 20) / 5);      // supervisor slot 0-3 within the area
  const supIdx   = areaIdx * 4 + supLocal;
  const sfx      = _pick(_SFX, _ds(_dsk(i, 77)));
  return {
    id:           `sh${i + 1}`,
    name:         `معرض ${_AREA_META[areaIdx].n} - ${sfx}`,
    regionId:     area.regionId,
    areaId:       area.id,
    supervisorId: `sup${supIdx + 1}`,
  };
});

// 500 sellers: 1 per showroom
const SELLERS = Array.from({ length: 500 }, (_, i) => {
  const showroom   = SHOWROOMS[i];
  const f1  = _ds(_dsk(i, 11, 100));
  const f2  = _ds(_dsk(i, 22, 200));
  const sales      = _rng(75_000, 780_000,  _ds(_dsk(i, 33)));
  const target     = Math.round(sales * (0.82 + _ds(_dsk(i, 44)) * 0.40) / 10_000) * 10_000;
  const prevSales  = Math.round(sales * (0.68 + _ds(_dsk(i, 55)) * 0.42));
  const invoices   = _rng(200, 3600, _ds(_dsk(i, 66)));
  const pieces     = _rng(500, 9200, _ds(_dsk(i, 77)));
  const avgPieceSar = parseFloat((2.4 + _ds(_dsk(i, 88)) * 1.6).toFixed(1));
  return {
    id:           `sel${i + 1}`,
    name:         `${_pick(_FIRST, f1)} ${_pick(_LAST, f2)}`,
    showroomId:   showroom.id,
    regionId:     showroom.regionId,
    areaId:       showroom.areaId,
    supervisorId: showroom.supervisorId,
    sales,
    target,
    prevSales,
    invoices,
    avgInvoice:   Math.max(1, Math.round(sales / invoices)),
    pieces,
    avgPiece:     Math.max(1, Math.round(sales / pieces)),
    avgPieceSar,
    customers:    _rng(12, 130, _ds(_dsk(i, 99))),
  };
});

const CATEGORIES = [
  { name: "الهدايا", pct: 90, color: "#00C9A7" },
  { name: "العطور", pct: 80, color: "#00B4D8" },
  { name: "العناية", pct: 78, color: "#F9A825" },
  { name: "التجميل", pct: 64, color: "#4D8AFF" },
  { name: "العود", pct: 45, color: "#845EC2" },
  { name: "الإكسيسوار", pct: 31, color: "#E91E8C" },
];

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function toArabicDigits(str: string) { return str; }

function formatNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toLocaleString("en-US");
}

function formatFull(n: number) { return n.toLocaleString("en-US"); }

function pctColor(pct: number) {
  if (pct >= 100) return "#00C9A7";
  if (pct >= 80) return "#4D8AFF";
  if (pct >= 60) return "#F9A825";
  return "#E91E8C";
}

function pctBg(pct: number) {
  if (pct >= 100) return "bg-emerald-100 text-emerald-700";
  if (pct >= 80) return "bg-blue-100 text-blue-700";
  if (pct >= 60) return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

// Deterministic pseudo-random — different result per unique integer key
function seed(n: number) { return ((n * 9301 + 49297) % 233280) / 233280; }

// Combine multiple integers into one unique seed key
function mkSeed(...parts: number[]) {
  return parts.reduce((acc, v, i) => acc ^ ((v + 1) * (i * 7919 + 1)), 0);
}

// ── Module-level caches (survive re-renders, reset never — data is deterministic) ──
const _monthDataCache = new Map<string, { day: number; current: number; prev: number }[]>();
const _dayDataCache   = new Map<string, { day: string; current: number; prev: number }[]>();
const _achCache       = new Map<string, number>();

// ── Per-seller, per-period sales generator ──────────────────────────────────

// Achievement ratio for a seller × year × month — ranges realistically 0.30 → 1.20
// Distribution: ~25% low (<60%), ~40% mid (60-90%), ~25% good (90-110%), ~10% excellent (>110%)
function sellerMonthAchievement(selIdx: number, year: number, month: number): number {
  const k = `${selIdx},${year},${month}`;
  if (_achCache.has(k)) return _achCache.get(k)!;
  const r = seed(mkSeed(selIdx + 3, year * 13, month * 7, 99));
  let v: number;
  if (r < 0.20) v = 0.28 + r * 1.6;
  else if (r < 0.55) v = 0.60 + (r - 0.20) * 1.71;
  else if (r < 0.80) v = 0.80 + (r - 0.55) * 1.20;
  else v = 1.10 + (r - 0.80) * 0.50;
  _achCache.set(k, v);
  return v;
}

// Daily variation factor within a month: ±35% around the monthly average
function dailyVariation(selIdx: number, year: number, month: number, day: number): number {
  return 0.65 + seed(mkSeed(selIdx, year, month, day, 1)) * 0.70;
}

function genSellerMonthData(selIdx: number, year: number, month: number) {
  const k = `${selIdx},${year},${month}`;
  if (_monthDataCache.has(k)) return _monthDataCache.get(k)!;
  const days = getDaysInMonth(year, month);
  const baseTarget  = SELLERS[selIdx].target;
  const achievement = sellerMonthAchievement(selIdx, year, month);
  const prevAch     = sellerMonthAchievement(selIdx, year - 1, month);
  const result = Array.from({ length: days }, (_, i) => {
    const d     = i + 1;
    const dv    = dailyVariation(selIdx, year, month, d);
    const dvP   = dailyVariation(selIdx, year - 1, month, d);
    const daily = (baseTarget * achievement / days) * dv;
    const prev  = (baseTarget * prevAch / days) * dvP;
    return { day: d, current: daily, prev };
  });
  _monthDataCache.set(k, result);
  return result;
}

function genSellerDayData(selIdx: number, year: number, month: number, day: number) {
  const k = `${selIdx},${year},${month},${day}`;
  if (_dayDataCache.has(k)) return _dayDataCache.get(k)!;
  const baseTarget  = SELLERS[selIdx].target;
  const achievement = sellerMonthAchievement(selIdx, year, month);
  const dailyTotal  = (baseTarget * achievement) / getDaysInMonth(year, month);
  const prevAch     = sellerMonthAchievement(selIdx, year - 1, month);
  const prevDaily   = (baseTarget * prevAch) / getDaysInMonth(year, month);
  const result = Array.from({ length: 12 }, (_, i) => {
    const h  = 8 + i;
    const s1 = seed(mkSeed(selIdx, year, month, day, h, 1));
    const s2 = seed(mkSeed(selIdx, year, month, day, h, 2));
    const hourWeight = 0.4 + Math.sin(((h - 8) / 14) * Math.PI) * 0.6;
    return {
      day: `${h}:00`,
      current: dailyTotal * hourWeight * (0.5 + s1 * 0.8) / 6,
      prev:    prevDaily  * hourWeight * (0.5 + s2 * 0.8) / 6,
    };
  });
  _dayDataCache.set(k, result);
  return result;
}

// Aggregate chart data across a list of seller indices for a given period
function genAggMonthData(selIdxs: number[], year: number, month: number) {
  const days = getDaysInMonth(year, month);
  const totals = new Float64Array(days * 2); // [cur0, prev0, cur1, prev1, ...]
  for (const si of selIdxs) {
    const rows = genSellerMonthData(si, year, month);
    for (let i = 0; i < days; i++) {
      totals[i * 2]     += rows[i].current;
      totals[i * 2 + 1] += rows[i].prev;
    }
  }
  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    current: totals[i * 2],
    prev:    totals[i * 2 + 1],
  }));
}

function genAggDayData(selIdxs: number[], year: number, month: number, day: number) {
  const totals = new Float64Array(24); // 12 hours × [cur, prev]
  for (const si of selIdxs) {
    const rows = genSellerDayData(si, year, month, day);
    for (let i = 0; i < 12; i++) {
      totals[i * 2]     += rows[i].current;
      totals[i * 2 + 1] += rows[i].prev;
    }
  }
  return Array.from({ length: 12 }, (_, i) => ({
    day: `${8 + i}:00`,
    current: totals[i * 2],
    prev:    totals[i * 2 + 1],
  }));
}

function genAggYearData(selIdxs: number[], year: number) {
  return MONTHS_AR.map((m, mIdx) => {
    const mData = genAggMonthData(selIdxs, year, mIdx);
    const prev  = genAggMonthData(selIdxs, year - 1, mIdx);
    return {
      day: m.slice(0, 3),
      current: mData.reduce((s, d) => s + d.current, 0) / 10,
      prev:    prev.reduce((s, d) => s + d.current, 0) / 10,
    };
  });
}

// ── Per-seller derived KPIs for a period ────────────────────────────────────
function sellerPeriodSales(selIdx: number, year: number, month: number, period: "day" | "month" | "year", day: number) {
  if (period === "day") {
    return genSellerDayData(selIdx, year, month, day).reduce((s, h) => s + h.current, 0);
  }
  if (period === "month") {
    return genSellerMonthData(selIdx, year, month).reduce((s, d) => s + d.current, 0);
  }
  // year
  return MONTHS_AR.reduce((s, _, mIdx) =>
    s + genSellerMonthData(selIdx, year, mIdx).reduce((ms, d) => ms + d.current, 0), 0);
}

function sellerPeriodPrevSales(selIdx: number, year: number, month: number, period: "day" | "month" | "year", day: number) {
  if (period === "day") {
    return genSellerDayData(selIdx, year, month, day).reduce((s, h) => s + h.prev, 0);
  }
  if (period === "month") {
    return genSellerMonthData(selIdx, year, month).reduce((s, d) => s + d.prev, 0);
  }
  return MONTHS_AR.reduce((s, _, mIdx) =>
    s + genSellerMonthData(selIdx, year - 1, mIdx).reduce((ms, d) => ms + d.current, 0), 0);
}

// Scale target to the selected period
function sellerPeriodTarget(selIdx: number, year: number, month: number, period: "day" | "month" | "year") {
  const annual = SELLERS[selIdx].target * 12;
  if (period === "year") return annual;
  const monthlyTarget = SELLERS[selIdx].target;
  if (period === "month") return monthlyTarget;
  return Math.round(monthlyTarget / getDaysInMonth(year, month));
}

// Scale invoices / pieces / customers proportionally to the period
function scalePeriodCount(base: number, year: number, month: number, period: "day" | "month" | "year") {
  if (period === "year") return base * 12;
  if (period === "month") return base;
  return Math.max(1, Math.round(base / getDaysInMonth(year, month)));
}

// ── Date-range helpers (used when viewMode==="table") ──────────────────────
function sellerRangeSales(selIdx: number, from: string, to: string): number {
  let total = 0;
  let [y, m] = [parseInt(from.slice(0, 4)), parseInt(from.slice(5, 7)) - 1];
  const [endY, endM] = [parseInt(to.slice(0, 4)), parseInt(to.slice(5, 7)) - 1];
  while (y < endY || (y === endY && m <= endM)) {
    const days = getDaysInMonth(y, m);
    const monthData = genSellerMonthData(selIdx, y, m);
    for (let d = 1; d <= days; d++) {
      const dt = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      if (dt >= from && dt <= to) total += monthData[d - 1].current;
    }
    if (++m > 11) { m = 0; y++; }
  }
  return total;
}
function sellerRangePrevSales(selIdx: number, from: string, to: string): number {
  let total = 0;
  let [y, m] = [parseInt(from.slice(0, 4)), parseInt(from.slice(5, 7)) - 1];
  const [endY, endM] = [parseInt(to.slice(0, 4)), parseInt(to.slice(5, 7)) - 1];
  while (y < endY || (y === endY && m <= endM)) {
    const days = getDaysInMonth(y, m);
    const monthData = genSellerMonthData(selIdx, y, m);
    for (let d = 1; d <= days; d++) {
      const dt = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      if (dt >= from && dt <= to) total += monthData[d - 1].prev;
    }
    if (++m > 11) { m = 0; y++; }
  }
  return total;
}
function sellerRangeTarget(selIdx: number, from: string, to: string): number {
  let total = 0;
  let [y, m] = [parseInt(from.slice(0, 4)), parseInt(from.slice(5, 7)) - 1];
  const [endY, endM] = [parseInt(to.slice(0, 4)), parseInt(to.slice(5, 7)) - 1];
  while (y < endY || (y === endY && m <= endM)) {
    const daysInM = getDaysInMonth(y, m);
    let inRange = 0;
    for (let d = 1; d <= daysInM; d++) {
      const dt = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      if (dt >= from && dt <= to) inRange++;
    }
    total += (SELLERS[selIdx].target * inRange) / daysInM;
    if (++m > 11) { m = 0; y++; }
  }
  return total;
}
function scaleRangeCount(base: number, from: string, to: string): number {
  let days = 0;
  let [y, m] = [parseInt(from.slice(0, 4)), parseInt(from.slice(5, 7)) - 1];
  const [endY, endM] = [parseInt(to.slice(0, 4)), parseInt(to.slice(5, 7)) - 1];
  while (y < endY || (y === endY && m <= endM)) {
    const daysInM = getDaysInMonth(y, m);
    for (let d = 1; d <= daysInM; d++) {
      const dt = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      if (dt >= from && dt <= to) days++;
    }
    if (++m > 11) { m = 0; y++; }
  }
  return Math.max(1, Math.round(base * days / 30));
}

// Calendar day achievement %s (uses per-seller aggregate for the filtered set)
function genPeriodDayPcts(selIdxs: number[], year: number, month: number) {
  const days = getDaysInMonth(year, month);
  const now = new Date();
  const todayDay = now.getDate();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const r: Record<number, number> = {};
  const isFutureMonth = year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth());
  for (let d = 1; d <= days; d++) {
    if (isFutureMonth || (isCurrentMonth && d > todayDay)) {
      r[d] = 0;
    } else {
      const current = selIdxs.reduce((s, si) => s + genSellerMonthData(si, year, month)[d - 1].current, 0);
      const target  = selIdxs.reduce((s, si) => s + sellerPeriodTarget(si, year, month, "day"), 0);
      r[d] = target > 0 ? Math.min(Math.round((current / target) * 100), 130) : 80;
    }
  }
  return r;
}

// Month-tab achievement % for the calendar strip
function genMonthPct(selIdxs: number[], year: number, month: number) {
  const now = new Date();
  if (year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth())) {
    return 0;
  }
  const current = selIdxs.reduce((s, si) => s + sellerPeriodSales(si, year, month, "month", 1), 0);
  const target  = selIdxs.reduce((s, si) => s + sellerPeriodTarget(si, year, month, "month"), 0);
  return target > 0 ? Math.min(Math.round((current / target) * 100), 130) : 80;
}


// ─────────────────────────────────────────
// Counting animation hook
// ─────────────────────────────────────────
function useCountUp(target: number, duration = 900) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    fromRef.current = 0;
    startRef.current = null;

    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(fromRef.current + (target - fromRef.current) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return current;
}

// Parse formatted value string → raw number + suffix
function parseFormattedValue(val: string): { num: number; suffix: string; prefix: string } {
  const prefix = val.startsWith("+") || val.startsWith("-") ? val[0] : "";
  const clean = val.replace(/^[+-]/, "");
  if (clean.endsWith("M")) return { num: parseFloat(clean) * 1_000_000, suffix: "M", prefix };
  if (clean.endsWith("K")) return { num: parseFloat(clean) * 1_000, suffix: "K", prefix };
  if (clean.endsWith("%")) return { num: parseFloat(clean), suffix: "%", prefix };
  const n = parseFloat(clean.replace(/,/g, ""));
  return { num: isNaN(n) ? 0 : n, suffix: "", prefix };
}

function formatAnimated(n: number, suffix: string, prefix: string): string {
  if (suffix === "M") return prefix + (n / 1_000_000).toFixed(2) + "M";
  if (suffix === "K") return prefix + (n / 1_000).toFixed(0) + "K";
  if (suffix === "%") return prefix + Math.round(n) + "%";
  return prefix + Math.round(n).toLocaleString("en-US");
}

// ─────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────
function KpiCard({ title, value, sub, icon: Icon, color = "#4D8AFF", progress }: {
  title: string; value: string; sub?: string; icon: React.ElementType; color?: string; progress?: number;
}) {
  const { num, suffix, prefix } = parseFormattedValue(value);
  const animated = useCountUp(num);
  const displayValue = formatAnimated(animated, suffix, prefix);

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-2 sm:p-4 flex flex-col gap-1 sm:gap-1.5 hover:shadow-md transition-shadow" style={{ borderRadius: 12 }}>
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] sm:text-[14px] text-neutral-700 dark:text-neutral-300 font-semibold leading-tight line-clamp-1">{title}</span>
        <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 bg-neutral-100 dark:bg-neutral-700" style={{ borderRadius: 8 }}>
          <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-700 dark:text-neutral-300" />
        </div>
      </div>
      <div className="text-sm sm:text-xl font-bold text-neutral-800 dark:text-neutral-200 tracking-tight tabular-nums">{displayValue}</div>
      {sub && <div className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-medium truncate">{sub}</div>}
      {progress !== undefined && (
        <div className="h-1 sm:h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-700 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: color }} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// Drill-down hierarchy types
// ─────────────────────────────────────────
type DrillLevel = "team" | "regions" | "areas" | "supervisors" | "showrooms" | "sellers" | "days";

interface DrillCrumb {
  level: DrillLevel;
  id: string;
  name: string;
}

interface DrillRow {
  id: string;
  name: string;
  regionName?: string;
  areaName?: string;
  supervisorName?: string;
  showroomName?: string;
  sales: number;
  target: number;
  prevSales: number;
  invoices: number;
  pieces: number;
  customers: number;
  avgInvoice: number;
  avgPiece: number;
  nextLevel: DrillLevel;
}

interface DrillTableProps {
  title: string;
  rowCount: number;
  rows: DrillRow[];
  onDrill: (id: string, name: string) => void;
  totalSales: number; totalTarget: number; totalPrevSales: number;
  totalInvoices: number; totalPieces: number; totalCustomers: number;
  achievementPct: number;
  sortKey: string; sortDir: "asc" | "desc";
  toggleSort: (key: string) => void;
  tablePage: number; setTablePage: (fn: (p: number) => number) => void; totalPages: number;
  nameLabel?: string; drillLabel?: string;
  filterType?: FilterType;
  searchQuery?: string;
  onClearSearch?: () => void;
}

function DrillTable({
  title, rowCount, rows, onDrill,
  totalSales, totalTarget, totalPrevSales, totalInvoices, totalPieces, totalCustomers, achievementPct,
  sortKey, sortDir, toggleSort, tablePage, setTablePage, totalPages,
  nameLabel = "الاسم", drillLabel = "تفاصيل",
  filterType = "team",
  searchQuery = "",
  onClearSearch,
  mobileTableMode,
  setMobileTableMode,
}: DrillTableProps & { mobileTableMode?: "default" | "pinned" | "cards" | "single", setMobileTableMode?: (mode: "default" | "pinned" | "cards" | "single") => void }) {
  // Detect which hierarchy columns have data
  const hasRegion    = rows.some(r => r.regionName);
  const hasArea      = rows.some(r => r.areaName);
  const hasSupervisor = rows.some(r => r.supervisorName);
  const hasShowroom  = rows.some(r => r.showroomName);

  const hierarchyCols = [
    ...(hasRegion     ? [{ key: "regionName",     label: "الإقليم" }]     : []),
    ...(hasArea       ? [{ key: "areaName",       label: "المنطقة" }]     : []),
    ...(hasSupervisor ? [{ key: "supervisorName", label: "المشرف" }] : []),
    ...(hasShowroom   ? [{ key: "showroomName",   label: "المعرض" }]     : []),
  ];

  // Columns vary by tab
  const teamCols = [
    { key: "name", label: nameLabel },
    ...hierarchyCols,
    { key: "sales", label: "المبيعات" },
    { key: "target", label: "الهدف" },
    { key: "invoices", label: "الفواتير" },
    { key: "pieces", label: "القطع" },
    { key: "prevSales", label: "مبيعات سابق" },
  ];
  const showroomCols = [
    { key: "name", label: nameLabel },
    ...hierarchyCols,
    { key: "sales", label: "المبيعات" },
    { key: "target", label: "الهدف" },
    { key: "invoices", label: "الفواتير" },
    { key: "pieces", label: "القطع" },
    { key: "customers", label: "العملاء" },
    { key: "prevSales", label: "مبيعات سابق" },
  ];
  const sellerCols = [
    { key: "name", label: nameLabel },
    ...hierarchyCols,
    { key: "sales", label: "المبيعات" },
    { key: "target", label: "الهدف" },
    { key: "invoices", label: "الفواتير" },
    { key: "avgInvoice", label: "م. الفاتورة" },
    { key: "pieces", label: "القطع" },
    { key: "avgPiece", label: "م. القطع" },
    { key: "prevSales", label: "مبيعات سابق" },
  ];
  const activeCols = filterType === "sellers" ? sellerCols : filterType === "showrooms" ? showroomCols : teamCols;

  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const [optGroupOpen, setOptGroupOpen] = useState(false);
  const visibleCols = activeCols.filter(col => !hiddenCols.has(col.key));
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const hasSearch = normalizedSearch.length > 0;

  // ── Column filter states ──
  type ColFilter = { type: "numeric"; min: string; max: string } | { type: "text"; value: string };
  const [colFilters, setColFilters] = useState<Record<string, ColFilter>>({});
  const [filterMenuCol, setFilterMenuCol] = useState<string | null>(null);
  const [filterAnchorRect, setFilterAnchorRect] = useState<DOMRect | null>(null);

  const NUMERIC_KEYS = new Set(["sales","target","invoices","pieces","customers","prevSales","avgInvoice","avgPiece"]);

  function isFilterActive(key: string) {
    const f = colFilters[key] as any;
    if (!f) return false;
    return f.type === "numeric" ? (f.min !== "" || f.max !== "") : !!f.value;
  }
  const activeFilterCount = visibleCols.filter(c => isFilterActive(c.key)).length;

  function openFilter(colKey: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (filterMenuCol === colKey) { setFilterMenuCol(null); setFilterAnchorRect(null); return; }
    setFilterMenuCol(colKey);
    setFilterAnchorRect((e.currentTarget as HTMLElement).getBoundingClientRect());
  }
  function updateNumFilter(key: string, field: "min" | "max", val: string) {
    setColFilters(prev => {
      const cur = (prev[key] as any) || { type: "numeric", min: "", max: "" };
      return { ...prev, [key]: { ...cur, type: "numeric", [field]: val } };
    });
  }
  function updateTextFilter(key: string, val: string) {
    setColFilters(prev => ({ ...prev, [key]: { type: "text", value: val } }));
  }
  function clearFilter(key: string) {
    setColFilters(prev => { const n = { ...prev }; delete n[key]; return n; });
    setFilterMenuCol(null);
  }

  // ── Apply column filters, sort & page ──
  const searchedRows = hasSearch ? rows.filter(row => {
    const haystack = [
      row.name,
      row.regionName,
      row.areaName,
      row.supervisorName,
      row.showroomName,
      row.sales,
      row.target,
      row.prevSales,
      row.invoices,
      row.pieces,
      row.customers,
      row.avgInvoice,
      row.avgPiece,
    ]
      .map(v => String(v ?? ""))
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedSearch);
  }) : rows;

  const filteredRows = searchedRows.filter(row => {
    for (const [key, filter] of Object.entries(colFilters)) {
      const f = filter as any;
      if (f.type === "numeric") {
        const val = (row as any)[key] ?? 0;
        if (f.min !== "" && !isNaN(parseFloat(f.min)) && val < parseFloat(f.min)) return false;
        if (f.max !== "" && !isNaN(parseFloat(f.max)) && val > parseFloat(f.max)) return false;
      } else {
        const str = String((row as any)[key] ?? "").toLowerCase();
        if (f.value && !str.includes(f.value.toLowerCase())) return false;
      }
    }
    return true;
  });
  const sorted = [...filteredRows].sort((a, b) => {
    const aVal = (a as any)[sortKey] ?? 0;
    const bVal = (b as any)[sortKey] ?? 0;
    return sortDir === "desc" ? bVal - aVal : aVal - bVal;
  });
  const PAGE_SIZE = 40;
  const start = (tablePage - 1) * PAGE_SIZE;
  const paged = sorted.slice(start, start + PAGE_SIZE);
  const pages = Math.ceil(sorted.length / PAGE_SIZE);

  const totalAvgInvoice = totalInvoices > 0 ? Math.round(totalSales / totalInvoices) : 0;
  const totalAvgPiece = totalInvoices > 0 ? Math.round(totalPieces / totalInvoices) : 0;

  function renderCell(row: DrillRow, key: string) {
    if (key === "name") return (
      <div className="flex items-center gap-1.5">
        <span className="font-semibold text-[#B21063] whitespace-nowrap hover:underline">{row.name}</span>
        <ChevronLeft className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
      </div>
    );
    if (key === "regionName") return <span className="text-neutral-500 dark:text-neutral-400 text-[11px] whitespace-nowrap">{row.regionName ?? "—"}</span>;
    if (key === "areaName") return <span className="text-neutral-500 dark:text-neutral-400 text-[11px] whitespace-nowrap">{row.areaName ?? "—"}</span>;
    if (key === "supervisorName") return <span className="text-neutral-500 dark:text-neutral-400 text-[11px] whitespace-nowrap">{row.supervisorName ?? "—"}</span>;
    if (key === "showroomName") return <span className="text-neutral-500 dark:text-neutral-400 text-[11px] whitespace-nowrap">{row.showroomName ?? "—"}</span>;
    if (key === "sales") return <span className="text-neutral-700 dark:text-neutral-300 font-semibold tabular-nums">{formatFull(Math.round(row.sales))}</span>;
    if (key === "target") return <span className="text-neutral-500 dark:text-neutral-400 tabular-nums">{formatFull(row.target)}</span>;
    if (key === "invoices") return <span className="text-neutral-600 dark:text-neutral-400 tabular-nums">{formatFull(row.invoices)}</span>;
    if (key === "avgInvoice") return <span className="text-neutral-600 dark:text-neutral-400 tabular-nums">{formatFull(row.avgInvoice)}</span>;
    if (key === "pieces") return <span className="text-neutral-600 dark:text-neutral-400 tabular-nums">{formatFull(row.pieces)}</span>;
    if (key === "avgPiece") return <span className="text-neutral-600 dark:text-neutral-400 tabular-nums">{row.avgPiece}</span>;
    if (key === "customers") return <span className="text-neutral-600 dark:text-neutral-400 tabular-nums">{row.customers}</span>;
    if (key === "prevSales") return <span className="text-neutral-500 dark:text-neutral-400 tabular-nums">{formatFull(Math.round(row.prevSales))}</span>;
    return null;
  }

  function renderFooterCell(key: string) {
    if (key === "name") return <span className="text-neutral-800 dark:text-neutral-200 font-bold">الإجمالي</span>;
    if (["regionName","areaName","supervisorName","showroomName"].includes(key)) return null;
    if (key === "sales") return <span className="text-neutral-800 dark:text-neutral-200 tabular-nums">{formatFull(Math.round(totalSales))}</span>;
    if (key === "target") return <span className="text-neutral-700 dark:text-neutral-300 tabular-nums">{formatFull(totalTarget)}</span>;
    if (key === "invoices") return <span className="text-neutral-700 dark:text-neutral-300 tabular-nums">{formatFull(totalInvoices)}</span>;
    if (key === "avgInvoice") return <span className="text-neutral-700 dark:text-neutral-300 tabular-nums">{formatFull(totalAvgInvoice)}</span>;
    if (key === "pieces") return <span className="text-neutral-700 dark:text-neutral-300 tabular-nums">{formatFull(totalPieces)}</span>;
    if (key === "avgPiece") return <span className="text-neutral-700 dark:text-neutral-300 tabular-nums">{totalAvgPiece}</span>;
    if (key === "customers") return <span className="text-neutral-700 dark:text-neutral-300 tabular-nums">{totalCustomers}</span>;
    if (key === "prevSales") return <span className="text-neutral-700 dark:text-neutral-300 tabular-nums">{formatFull(Math.round(totalPrevSales))}</span>;
    return null;
  }

  // Mobile view modes
  const renderMobilePinnedView = () => {
    const mainCol = hierarchyCols[0] || { key: "name", label: nameLabel };
    const otherCols = visibleCols.filter(col => col.key !== mainCol.key);
    
    return (
      <div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] sm:text-[13px]" style={{ minWidth: 320 }}>
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-700">
                <th className="px-2 py-2 text-right font-bold text-neutral-600 dark:text-neutral-400 sticky right-0 bg-white dark:bg-neutral-800 z-10 border-l border-neutral-200 dark:border-neutral-600">
                  <div className="flex items-center gap-1">
                    <Pin className="w-3 h-3 text-[#B21063]" />
                    <span>{mainCol.label}</span>
                  </div>
                </th>
                {otherCols.map(col => (
                  <th key={col.key} onClick={() => toggleSort(col.key)}
                    className="px-2 py-2 text-right font-bold text-neutral-600 dark:text-neutral-400 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors select-none whitespace-nowrap">
                    <div className="flex items-center justify-between gap-1 w-full">
                      <ArrowUpDown className={cn("w-2 h-2.5 order-last", sortKey === col.key ? "text-[#B21063]" : "text-neutral-300")} />
                      <span>{col.label}</span>
                    </div>
                  </th>
                ))}
                <th className="px-2 py-2 text-right font-bold text-neutral-600 dark:text-neutral-400">تحقيق</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((row, idx) => {
                const pct = row.target > 0 ? Math.round((row.sales / row.target) * 100) : 0;
                return (
                  <tr key={row.id} className={cn("border-b border-neutral-50 hover:bg-blue-50/30 transition-colors cursor-pointer", idx % 2 === 0 ? "bg-white dark:bg-neutral-800" : "bg-neutral-50 dark:bg-neutral-700/30")}
                    onClick={() => onDrill(row.id, row.name)}>
                    <td className="px-2 py-2 sticky right-0 bg-white dark:bg-neutral-800 z-10 border-l border-neutral-200 dark:border-neutral-600 font-medium text-neutral-800 dark:text-neutral-200">
                      {renderCell(row, mainCol.key)}
                    </td>
                    {otherCols.map(col => (
                      <td key={col.key} className="px-2 py-2 whitespace-nowrap">
                        {renderCell(row, col.key)}
                      </td>
                    ))}
                    <td className="px-2 py-2">
                      <span className={cn("text-[12px] font-bold px-1.5 py-0.5 rounded-lg", pctBg(pct))}>{pct}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderMobileCardsView = () => {
    return (
      <div className="p-2 space-y-2">
        {paged.map((row, idx) => {
          const pct = row.target > 0 ? Math.round((row.sales / row.target) * 100) : 0;
          return (
            <div key={row.id} className={cn("bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl p-3 hover:shadow-md transition-shadow cursor-pointer", idx % 2 === 0 ? "bg-white dark:bg-neutral-800" : "bg-neutral-50 dark:bg-neutral-700/30")}
              onClick={() => onDrill(row.id, row.name)}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 truncate flex-1">{row.name}</h4>
                <span className={cn("text-xs font-bold px-2 py-1 rounded-lg mr-2", pctBg(pct))}>{pct}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">المبيعات:</span>
                  <span className="font-semibold">{formatFull(Math.round(row.sales))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">الهدف:</span>
                  <span className="font-semibold">{formatFull(row.target)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">الفواتير:</span>
                  <span className="font-semibold">{formatFull(row.invoices)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">العملاء:</span>
                  <span className="font-semibold">{row.customers}</span>
                </div>
              </div>
              {hierarchyCols.length > 0 && (
                <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-700 flex flex-wrap gap-2">
                  {hierarchyCols.map(col => (
                    <span key={col.key} className="text-[12px] text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-700 px-2 py-1 rounded">
                      {renderCell(row, col.key)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMobileSingleView = () => {
    return (
      <div className="space-y-3">
        {paged.map((row, idx) => {
          const pct = row.target > 0 ? Math.round((row.sales / row.target) * 100) : 0;
          return (
            <div key={row.id} className={cn("bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl overflow-hidden", idx % 2 === 0 ? "bg-white dark:bg-neutral-800" : "bg-neutral-50 dark:bg-neutral-700/30")}>
              <div className="px-3 py-2 bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-700 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                onClick={() => onDrill(row.id, row.name)}>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 truncate flex-1">{row.name}</h4>
                  <span className={cn("text-xs font-bold px-2 py-1 rounded-lg mr-2", pctBg(pct))}>{pct}%</span>
                  <ChevronLeft className="w-4 h-4 text-neutral-400" />
                </div>
              </div>
              <div className="divide-y divide-neutral-100">
                {activeCols.map(col => (
                  <div key={col.key} className="px-3 py-2 flex justify-between items-center">
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{col.label}</span>
                    <span className="text-xs text-neutral-800 dark:text-neutral-200">{renderCell(row, col.key)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden mx-2">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-700">
        <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            {activeFilterCount > 0 || hasSearch ? `${sorted.length} / ${rowCount}` : `${rowCount}`} سجل
            {activeFilterCount > 0 && (
              <button onClick={() => setColFilters({})} className="mr-1.5 text-[12px] text-red-500 hover:text-red-700 font-normal">× مسح الفلاتر ({activeFilterCount})</button>
            )}
            {hasSearch && (
              <button onClick={() => onClearSearch?.()} className="mr-1.5 text-[12px] text-red-500 hover:text-red-700 font-normal">× مسح البحث</button>
            )}
          </span>
          {/* Options toggle button — mobile only */}
          <button onClick={() => setOptGroupOpen(v => !v)}
            className={cn("p-1.5 rounded-lg transition-colors sm:hidden",
              optGroupOpen ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700")}>
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {/* Options icon group — always visible on desktop */}
          <div className={cn("flex items-center gap-0.5 bg-neutral-100 dark:bg-neutral-700 rounded-lg p-0.5", !optGroupOpen && "hidden sm:flex")}>
            {/* Column picker */}
            <div className="relative">
              <button onClick={() => setColMenuOpen(v => !v)}
                title="إظهار/إخفاء الأعمدة"
                className={cn("px-1.5 py-1 rounded-md text-xs font-medium transition-all flex items-center",
                  colMenuOpen ? "bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 shadow-sm" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-300 dark:hover:text-neutral-200")}>
                <SlidersHorizontal className="w-3 h-3" />
              </button>
              {colMenuOpen && (
                <>
                  <div className="fixed inset-0 z-[55]" onClick={() => setColMenuOpen(false)} />
                  <div className="absolute left-0 top-full mt-1 z-[60] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-xl p-2 min-w-[140px]">
                    <p className="text-[12px] font-bold text-neutral-400 dark:text-neutral-500 dark:text-neutral-400 uppercase px-2 pb-1">إظهار الأعمدة</p>
                    {activeCols.filter(col => col.key !== "name").map(col => (
                      <button key={col.key}
                        onClick={() => setHiddenCols(prev => { const next = new Set(prev); next.has(col.key) ? next.delete(col.key) : next.add(col.key); return next; })}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-50 dark:bg-neutral-700">
                        <div className={cn("w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors",
                          !hiddenCols.has(col.key) ? "bg-neutral-900 border-neutral-900" : "border-neutral-300")}>
                          {!hiddenCols.has(col.key) && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className="text-xs text-neutral-700 dark:text-neutral-300">{col.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            {/* View mode buttons */}
            {setMobileTableMode && (
              <>
                <div className="w-px h-4 bg-neutral-300 mx-0.5" />
                {([ ["default", "افتراضي", Table], ["pinned", "مثبت", Pin], ["cards", "بطاقات", LayoutGrid], ["single", "مفرد", Rows] ] as [string, string, React.ElementType][]).map(([mode, label, Icon]) => (
                  <button key={mode} onClick={() => setMobileTableMode(mode as "default" | "pinned" | "cards" | "single")}
                    className={cn("px-1.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1",
                      mobileTableMode === mode ? "bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 shadow-sm" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-300")}
                    title={label}>
                    <Icon className="w-3 h-3" />
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Default table view */}
      {(!mobileTableMode || mobileTableMode === "default") && (
      <div className="overflow-x-auto max-h-[70vh] overflow-y-auto relative">
        <table className="w-full text-[11px] sm:text-[13px]" style={{ minWidth: 600 }}>
          <thead className="sticky top-0 z-10">
            <tr className="bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-700">
              {visibleCols.map(col => (
                <th key={col.key}
                  className="px-2 sm:px-3 py-2 sm:py-3 text-right font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:bg-neutral-700 transition-colors select-none whitespace-nowrap text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-700">
                  <div className="flex items-center justify-between gap-0.5 w-full">
                    <div className="flex items-center gap-0.5 order-last shrink-0">
                      <button onClick={() => toggleSort(col.key)} className="p-0.5 rounded hover:bg-neutral-200">
                        <ArrowUpDown className={cn("w-2 h-2.5 sm:w-2.5 sm:h-2.5", sortKey === col.key ? "text-[#B21063]" : "text-neutral-300")} />
                      </button>
                      <button onClick={e => openFilter(col.key, e)}
                        className={cn("p-0.5 rounded hover:bg-neutral-200 transition-colors",
                          isFilterActive(col.key) ? "text-[#B21063]" : "text-neutral-300 hover:text-neutral-500 dark:text-neutral-400")}>
                        <Filter className="w-2 h-2.5 sm:w-2.5 sm:h-2.5" />
                      </button>
                    </div>
                    <span className="cursor-pointer hover:text-neutral-900" onClick={() => toggleSort(col.key)}>{col.label}</span>
                  </div>
                </th>
              ))}
              <th className="px-2 sm:px-3 py-2 sm:py-3 text-right font-bold text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-700">تحقيق</th>
              <th className="px-2 sm:px-3 py-2 sm:py-3 text-right font-bold text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-700">{drillLabel}</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row, idx) => {
              const pct = row.target > 0 ? Math.round((row.sales / row.target) * 100) : 0;
              return (
                <tr key={row.id} className={cn("border-b border-neutral-50 hover:bg-blue-50/30 transition-colors cursor-pointer", idx % 2 === 0 ? "bg-white dark:bg-neutral-800" : "bg-neutral-50 dark:bg-neutral-700/30")}
                  onClick={() => onDrill(row.id, row.name)}>
                  {visibleCols.map(col => (
                    <td key={col.key} className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm">
                      {renderCell(row, col.key)}
                    </td>
                  ))}
                  <td className="px-2 sm:px-3 py-2 sm:py-2.5">
                    <span className={cn("text-[12px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-lg", pctBg(pct))}>{pct}%</span>
                  </td>
                  <td className="px-2 sm:px-3 py-2 sm:py-2.5">
                    <span className="text-[12px] sm:text-[12px] text-neutral-400 font-medium">انقر للعرض</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-neutral-100 dark:bg-neutral-700 border-t-2 border-neutral-300 dark:border-neutral-600 font-bold">
              {visibleCols.map(col => (
                <td key={col.key} className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm bg-neutral-100 dark:bg-neutral-700">
                  {renderFooterCell(col.key)}
                </td>
              ))}
              <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap bg-neutral-100 dark:bg-neutral-700">
                <span className="text-[12px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-lg" style={{ backgroundColor: "#00C9A7", color: "white" }}>
                  {achievementPct}%
                </span>
              </td>
              <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap bg-neutral-100 dark:bg-neutral-700">
                <span className="text-[12px] sm:text-[12px] text-neutral-400 font-medium">—</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      )}

      {/* Other views */}
      <div>
        {false && (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]" style={{ minWidth: 600 }}>
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-700">
                  {activeCols.map(col => (
                    <th key={col.key} onClick={() => toggleSort(col.key)}
                      className="px-2 py-2 text-right font-bold text-neutral-600 dark:text-neutral-400 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors select-none whitespace-nowrap">
                      <div className="flex items-center justify-between gap-1 w-full">
                        <ArrowUpDown className={cn("w-2 h-2.5 order-last", sortKey === col.key ? "text-[#B21063]" : "text-neutral-300")} />
                        <span>{col.label}</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-2 py-2 text-right font-bold text-neutral-600 dark:text-neutral-400">تحقيق</th>
                  <th className="px-2 py-2 text-right font-bold text-neutral-600 dark:text-neutral-400">{drillLabel}</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((row, idx) => {
                  const pct = row.target > 0 ? Math.round((row.sales / row.target) * 100) : 0;
                  return (
                    <tr key={row.id} className={cn("border-b border-neutral-50 hover:bg-blue-50/30 transition-colors cursor-pointer", idx % 2 === 0 ? "bg-white dark:bg-neutral-800" : "bg-neutral-50 dark:bg-neutral-700/30")}
                      onClick={() => onDrill(row.id, row.name)}>
                      {activeCols.map(col => (
                        <td key={col.key} className="px-2 py-2 whitespace-nowrap">
                          {renderCell(row, col.key)}
                        </td>
                      ))}
                      <td className="px-2 py-2">
                        <span className={cn("text-[12px] font-bold px-1.5 py-0.5 rounded-lg", pctBg(pct))}>{pct}%</span>
                      </td>
                      <td className="px-2 py-2">
                        <span className="text-[12px] text-neutral-400 font-medium">انقر للعرض</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {mobileTableMode === "pinned" && renderMobilePinnedView()}
        {mobileTableMode === "cards" && renderMobileCardsView()}
        {mobileTableMode === "single" && renderMobileSingleView()}
        {!mobileTableMode && null}
      </div>
      
      {pages > 1 && (
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-t border-neutral-100 dark:border-neutral-700">
          <button onClick={() => setTablePage(p => Math.max(1, p - 1))} disabled={tablePage === 1}
            className="flex items-center gap-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 disabled:opacity-30 hover:text-neutral-800 dark:text-neutral-200 transition-colors font-medium">
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> السابق
          </button>
          <span className="text-[12px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-medium">صفحة {tablePage} من {pages}</span>
          <button onClick={() => setTablePage(p => Math.min(pages, p + 1))} disabled={tablePage === pages}
            className="flex items-center gap-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 disabled:opacity-30 hover:text-neutral-800 dark:text-neutral-200 transition-colors font-medium">
            التالي <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      {/* ── Column filter portal ── */}
      {filterMenuCol && filterAnchorRect && createPortal(
        <>
          <div className="fixed inset-0 z-[99]" onClick={() => { setFilterMenuCol(null); setFilterAnchorRect(null); }} />
          <div className="fixed z-[100] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-2xl p-3 w-52"
            style={{ top: filterAnchorRect.bottom + 6, right: window.innerWidth - filterAnchorRect.right }}>
            <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-2 pb-1.5 border-b border-neutral-100 dark:border-neutral-700">
              {NUMERIC_KEYS.has(filterMenuCol) ? "تصفية الأرقام" : "بحث في العمود"}
            </p>
            {NUMERIC_KEYS.has(filterMenuCol) ? (
              <div className="space-y-2">
                <div>
                  <label className="text-[12px] text-neutral-400 block mb-0.5">أكبر من أو يساوي</label>
                  <input type="number" dir="ltr" placeholder="0"
                    className="w-full border border-neutral-200 dark:border-neutral-600 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-neutral-400"
                    value={(colFilters[filterMenuCol] as any)?.min ?? ""}
                    onChange={e => updateNumFilter(filterMenuCol, "min", e.target.value)} />
                </div>
                <div>
                  <label className="text-[12px] text-neutral-400 block mb-0.5">أصغر من أو يساوي</label>
                  <input type="number" dir="ltr" placeholder="∞"
                    className="w-full border border-neutral-200 dark:border-neutral-600 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-neutral-400"
                    value={(colFilters[filterMenuCol] as any)?.max ?? ""}
                    onChange={e => updateNumFilter(filterMenuCol, "max", e.target.value)} />
                </div>
              </div>
            ) : (
              <input type="text" placeholder="ابحث..." autoFocus
                className="w-full border border-neutral-200 dark:border-neutral-600 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-neutral-400"
                value={(colFilters[filterMenuCol] as any)?.value ?? ""}
                onChange={e => updateTextFilter(filterMenuCol, e.target.value)} />
            )}
            {isFilterActive(filterMenuCol) && (
              <button onClick={() => clearFilter(filterMenuCol)}
                className="mt-2 w-full text-[12px] text-red-500 hover:text-red-700 text-right py-0.5">
                × مسح هذا الفلتر
              </button>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}


function TeamSummary({ data }: { data: { label: string; value: number; pct: number }[] }) {
  const total = data.length || 1;
  const tiers = [
    { label: "ممتاز", min: 100, max: Infinity, color: "#00C9A7", bg: "bg-emerald-50",  text: "text-emerald-700" },
    { label: "جيد",   min: 80,  max: 99,       color: "#4D8AFF", bg: "bg-blue-50",     text: "text-blue-700"   },
    { label: "متوسط", min: 60,  max: 79,       color: "#F9A825", bg: "bg-amber-50",    text: "text-amber-700"  },
    { label: "ضعيف",  min: 0,   max: 59,       color: "#E91E8C", bg: "bg-rose-50",     text: "text-rose-700"   },
  ];
  const buckets = tiers.map(t => ({ ...t, count: data.filter(d => d.pct >= t.min && d.pct <= t.max).length }));
  const top3 = [...data].sort((a, b) => b.pct - a.pct).slice(0, 3);

  return (
    <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Stacked distribution bar */}
      <div className="flex h-2.5 rounded-full overflow-hidden" style={{ gap: 2 }}>
        {buckets.map((b, i) => (
          <motion.div key={i} title={`${b.label}: ${b.count}`}
            style={{ width: `${(b.count / total) * 100}%`, backgroundColor: b.color, minWidth: b.count ? 4 : 0 }}
            className="h-full"
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: i * 0.08 + 0.1, duration: 0.5, ease: "easeOut" }} />
        ))}
      </div>

      {/* Tier rows */}
      <div className="space-y-2">
        {buckets.map((b, i) => (
          <motion.div key={i} className="flex items-center gap-2" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 + 0.2, duration: 0.4 }}>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
            <span className="text-[12px] font-semibold text-neutral-600 dark:text-neutral-400 w-10 shrink-0">{b.label}</span>
            <div className="flex-1 bg-neutral-100 dark:bg-neutral-700 rounded-full h-1.5 overflow-hidden">
              <motion.div className="h-full rounded-full"
                style={{ backgroundColor: b.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(b.count / total) * 100}%` }}
                transition={{ delay: i * 0.08 + 0.3, duration: 0.6, ease: "easeOut" }} />
            </div>
            <span className={cn("text-[11px] font-bold min-w-[28px] text-center rounded-md px-1.5 py-0.5", b.bg, b.text)}>
              {b.count}
            </span>
            <span className="text-[12px] text-neutral-400 w-7 text-right shrink-0">
              {Math.round((b.count / total) * 100)}%
            </span>
          </motion.div>
        ))}
      </div>

      {/* Top performers */}
      {top3.length > 0 && (
        <motion.div className="border-t border-neutral-100 dark:border-neutral-700 pt-2.5 space-y-1.5" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}>
          <p className="text-[12px] font-semibold text-neutral-400 mb-1">الأعلى أداءً</p>
          {top3.map((d, i) => (
            <motion.div key={i} className="flex items-center gap-2" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.08, duration: 0.35 }}>
              <span className="text-[12px] font-bold text-neutral-300 w-3 shrink-0">{i + 1}</span>
              <span className="text-[11px] text-neutral-700 dark:text-neutral-300 truncate flex-1">
                {d.label.split(" ").slice(0, 2).join(" ")}
              </span>
              <span className="text-[11px] font-bold tabular-nums" style={{ color: pctColor(d.pct) }}>{d.pct}%</span>
              <span className="text-[12px] text-neutral-400 tabular-nums">{formatNum(d.value)}</span>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.p className="text-[12px] text-neutral-400 text-center pt-0.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.3 }}>{total.toLocaleString()} عنصر</motion.p>
    </motion.div>
  );
}

function AreaChart({ data, height = 120 }: { data: { day: number | string; current: number; prev: number }[]; height?: number }) {
  if (!data.length) return null;
  const max = Math.max(...data.flatMap(d => [d.current, d.prev]), 1);
  const W = data.length * 22;
  const H = height;

  const polyline = (key: "current" | "prev") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"} ${i * 22 + 11} ${H - 10 - ((d[key] / max) * (H - 20))}`).join(" ");

  const area = (key: "current" | "prev") =>
    polyline(key) + ` L ${(data.length - 1) * 22 + 11} ${H - 10} L 11 ${H - 10} Z`;

  const xLabels = data.filter((_, i) => i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 5) === 0);

  return (
    <motion.svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: W, height }} preserveAspectRatio="none"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <defs>
        <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00C9A7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00C9A7" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F9A825" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#F9A825" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(t => (
        <motion.line key={t} x1="0" y1={H - 10 - t * (H - 20)} x2={W} y2={H - 10 - t * (H - 20)}
          stroke="#f0f0f0" strokeWidth="0.6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: t * 0.1, duration: 0.3 }} />
      ))}
      <motion.path d={area("prev")} fill="url(#gp)"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }} />
      <motion.path d={polyline("prev")} fill="none" stroke="#F9A825" strokeWidth="1.2" strokeDasharray="4 2" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 1.2, ease: "easeInOut" }} />
      <motion.path d={area("current")} fill="url(#gc)"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }} />
      <motion.path d={polyline("current")} fill="none" stroke="#00C9A7" strokeWidth="1.8" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 1.2, ease: "easeInOut" }} />
      {xLabels.map((d, i) => {
        const idx = data.indexOf(d);
        return (
          <motion.text key={i} x={idx * 22 + 11} y={H - 1} textAnchor="middle" fontSize="6" fill="#9ca3af"
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + i * 0.05, duration: 0.3 }}>
            {d.day}
          </motion.text>
        );
      })}
    </motion.svg>
  );
}

// ─────────────────────────────────────────
// Arabic Date Range Picker
// ─────────────────────────────────────────
const DAYS_FULL_AR = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function parseDateStr(s: string): [number, number, number] {
  const [y, m, d] = s.split("-").map(Number);
  return [y, m - 1, d];
}
function formatArabicDate(s: string) {
  const [y, m, d] = parseDateStr(s);
  const date = new Date(y, m, d);
  return `${DAYS_FULL_AR[date.getDay()]} ${d} ${MONTHS_AR[m]}`;
}

interface DateRangePickerProps {
  dateFrom: string;
  dateTo: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  iconOnly?: boolean;
  active?: boolean;
}

function DateRangePicker({ dateFrom, dateTo, onFromChange, onToChange, iconOnly, active }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<"from" | "to">("from");
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  // Left calendar = calMonth, Right calendar = calMonth - 1 (RTL: right is earlier)
  const rightMonth = calMonth === 0 ? 11 : calMonth - 1;
  const rightYear  = calMonth === 0 ? calYear - 1 : calYear;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      const inTrigger = containerRef.current?.contains(target);
      const inPanel = panelRef.current?.contains(target);
      if (!inTrigger && !inPanel) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [])

  function openDropdown() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const panelW = Math.min(520, vw - 32);
      const center = rect.left + rect.width / 2;
      let left = center - panelW / 2;
      if (left < 16) left = 16;
      if (left + panelW > vw - 16) left = vw - panelW - 16;
      setDropdownPos({
        top: rect.bottom + 8,
        left,
        width: panelW,
      });
    }
    setOpen(v => !v);
    setSelecting("from");
  }

  function handleDayClick(dateStr: string) {
    if (selecting === "from") {
      onFromChange(dateStr);
      if (dateTo && dateStr > dateTo) onToChange(dateStr);
      setSelecting("to");
    } else {
      if (dateStr < dateFrom) {
        onFromChange(dateStr);
        setSelecting("to");
      } else {
        onToChange(dateStr);
        setSelecting("from");
        setOpen(false);
      }
    }
  }

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }

  function renderMonth(year: number, month: number, isLeft: boolean) {
    const days = getDaysInMonth(year, month);
    const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
    const cells: (number | null)[] = Array(firstDow).fill(null);
    for (let d = 1; d <= days; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    return (
      <div className="flex-1 min-w-[200px] sm:min-w-[240px]">
        {/* Month header */}
        <div className="flex items-center justify-between px-2 sm:px-3 pb-2 sm:pb-3">
          {isLeft ? (
            <button onClick={nextMonth} className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors">
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-500 dark:text-neutral-400" />
            </button>
          ) : <div className="w-6 sm:w-7" />}
          <span className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200">{MONTHS_AR[month]} {year}</span>
          {!isLeft ? (
            <button onClick={prevMonth} className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors">
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-500 dark:text-neutral-400" />
            </button>
          ) : <div className="w-6 sm:w-7" />}
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS_FULL_AR.map((d, i) => (
            <div key={i} className={cn(
              "text-center text-[9px] sm:text-[12px] font-semibold py-0.5 sm:py-1",
              i === 5 ? "text-[#2563EB]" : i === 6 ? "text-[#2563EB]" : "text-neutral-500 dark:text-neutral-400"
            )}>
              {d.slice(0, d === "الاثنين" || d === "الثلاثاء" || d === "الأربعاء" || d === "الخميس" ? 6 : 4)}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const dateStr = toDateStr(year, month, d);
            const isFrom = dateStr === dateFrom;
            const isTo = dateStr === dateTo;
            const endDate = hoveredDate && selecting === "to" ? hoveredDate : dateTo;
            const inRange = dateStr > dateFrom && dateStr < endDate;
            const isRangeStart = isFrom;
            const isRangeEnd = isTo || (selecting === "to" && hoveredDate === dateStr);
            const isFriSat = new Date(year, month, d).getDay() === 5 || new Date(year, month, d).getDay() === 6;

            return (
              <div
                key={i}
                className={cn(
                  "relative flex items-center justify-center h-6 sm:h-8 cursor-pointer select-none transition-colors",
                  inRange ? "bg-blue-50" : "",
                )}
                onMouseEnter={() => setHoveredDate(dateStr)}
                onMouseLeave={() => setHoveredDate(null)}
                onClick={() => handleDayClick(dateStr)}
              >
                <span className={cn(
                  "w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-[11px] sm:text-[13px] font-medium transition-colors z-10 relative",
                  (isFrom || isTo) ? "bg-[#2563EB] text-white font-bold" : "",
                  !isFrom && !isTo && inRange ? "text-neutral-700 dark:text-neutral-300" : "",
                  !isFrom && !isTo && !inRange && isFriSat ? "text-[#2563EB]" : "",
                  !isFrom && !isTo && !inRange && !isFriSat ? "text-neutral-700 dark:text-neutral-300" : ""
                )}>
                  {d}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const displayFrom = dateFrom ? formatArabicDate(dateFrom) : "من تاريخ";
  const displayTo   = dateTo   ? formatArabicDate(dateTo)   : "إلى تاريخ";

  const dropdown = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          ref={panelRef}
          className="dropdown-menu bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-600 shadow-xl p-3 sm:p-4"
          style={{
            position: "fixed",
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
            zIndex: 9999,
          }}
          dir="rtl"
        >
          {/* Header showing selected range */}
          <div className="flex items-center gap-2 sm:gap-3 border-b border-neutral-100 dark:border-neutral-700 pb-2 sm:pb-3 mb-3 sm:mb-4">
            <button
              onClick={() => setSelecting("from")}
              className={cn(
                "flex-1 text-center py-1 sm:py-1.5 px-2 sm:px-3 rounded-xl text-[12px] sm:text-[12px] font-bold border-2 transition-colors",
                selecting === "from" ? "border-[#2563EB] text-[#2563EB] bg-blue-50" : "border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400"
              )}
            >
              {displayFrom}
            </button>
            <span className="text-neutral-400 text-xs sm:text-sm font-bold">—</span>
            <button
              onClick={() => setSelecting("to")}
              className={cn(
                "flex-1 text-center py-1 sm:py-1.5 px-2 sm:px-3 rounded-xl text-[12px] sm:text-[12px] font-bold border-2 transition-colors",
                selecting === "to" ? "border-[#2563EB] text-[#2563EB] bg-blue-50" : "border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400"
              )}
            >
              {displayTo}
            </button>
          </div>

          {/* Dual month calendars — RTL: right=earlier, left=later */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-x-reverse divide-neutral-100">
            {renderMonth(calYear, calMonth, true)}
            <div className="hidden sm:block w-px bg-neutral-100 dark:bg-neutral-700 self-stretch mx-1" />
            {renderMonth(rightYear, rightMonth, false)}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div ref={containerRef} className="relative shrink-0" dir="rtl">
      {/* Trigger button */}
      {iconOnly ? (
        <button
          ref={btnRef}
          onClick={openDropdown}
          title={`${displayFrom} — ${displayTo}`}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold transition-all whitespace-nowrap rounded-lg",
            active
              ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-sm"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          )}
        >
          <CalendarRange className="w-3.5 h-3.5" />
          محدد
        </button>
      ) : (
        <button
          ref={btnRef}
          onClick={openDropdown}
          className="flex items-center gap-1.5 sm:gap-2 border border-neutral-200 dark:border-neutral-600 rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors shadow-sm"
        >
          <Calendar className="w-3 h-3.5 sm:w-3.5 sm:h-3.5 text-neutral-400 shrink-0" />
          <span className="text-[12px] sm:text-[12px] font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
            {displayFrom}
          </span>
          <span className="text-[9px] sm:text-[12px] text-neutral-400 mx-0.5 sm:mx-1">—</span>
          <span className={cn("text-[12px] sm:text-[12px] font-semibold whitespace-nowrap", selecting === "to" && open ? "text-[#2563EB]" : "text-neutral-700 dark:text-neutral-300")}>
            {displayTo}
          </span>
        </button>
      )}

      {createPortal(dropdown, document.body)}
    </div>
  );
}

// ─────────────────────────────────────────
// MultiSelectDropdown
// ─────────────────────────────────────────
interface MultiSelectOption { id: string; name: string; }
interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  placeholder: string;
  activeColor?: string;
}
function MultiSelectDropdown({ options, selected, onChange, placeholder, activeColor = "#B21063" }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      const target = e.target as Node;
      const inTrigger = ref.current?.contains(target);
      const inPanel = panelRef.current?.contains(target);
      if (!inTrigger && !inPanel) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const filtered = options.filter(o => o.name.includes(search));
  const hasSelection = selected.size > 0;

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    onChange(next);
  }

  function toggleAll() {
    if (selected.size === options.length) onChange(new Set());
    else onChange(new Set(options.map(o => o.id)));
  }

  const label = hasSelection
    ? selected.size === 1
      ? options.find(o => o.id === [...selected][0])?.name ?? placeholder
      : `محدد: ${selected.size}`
    : placeholder;

  return (
    <div ref={ref} className="relative shrink-0" dir="rtl">
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          "flex items-center gap-1.5 sm:gap-2 text-[12px] sm:text-[14px] border rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-neutral-800 focus:outline-none cursor-pointer font-semibold sm:font-bold transition-colors whitespace-nowrap",
          hasSelection ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300"
        )}
      >
        <span className="max-w-[100px] sm:max-w-[140px] truncate">{label}</span>
        <ChevronDown className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 transition-transform", open ? "rotate-180" : "", hasSelection ? "text-indigo-500" : "text-neutral-400")} />
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          style={{
            position: "fixed",
            top: (ref.current?.getBoundingClientRect().bottom ?? 0) + 4,
            right: window.innerWidth - (ref.current?.getBoundingClientRect().right ?? 0),
            zIndex: 9999,
            width: "min(260px, calc(100vw - 2rem))",
            maxWidth: "calc(100vw - 2rem)",
          }}
          className="dropdown-menu bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-2xl shadow-xl overflow-hidden"
          dir="rtl"
        >
          <div className="p-2.5 border-b border-neutral-100 dark:border-neutral-700">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="بحث..."
                className="w-full text-[12px] sm:text-[13px] border border-neutral-200 dark:border-neutral-600 rounded-xl pr-9 pl-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
          <div className="p-1.5 border-b border-neutral-100 dark:border-neutral-700">
            <button
              onClick={toggleAll}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[12px] sm:text-[13px] font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-neutral-600 dark:text-neutral-400"
            >
              <span className={cn("w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                selected.size === options.length ? "bg-indigo-500 border-indigo-500" : "border-neutral-300 dark:border-neutral-500"
              )}>
                {selected.size === options.length && <Check className="w-2.5 h-2.5 text-white" />}
              </span>
              {selected.size === options.length ? "إلغاء تحديد الكل" : "تحديد الكل"}
            </button>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 && <p className="text-center text-[12px] sm:text-[13px] text-neutral-400 py-3">لا توجد نتائج</p>}
            {filtered.map(opt => {
              const isSelected = selected.has(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggle(opt.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] sm:text-[13px] hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-right"
                >
                  <span className={cn("w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                    isSelected ? "bg-indigo-500 border-indigo-500" : "border-neutral-300 dark:border-neutral-500"
                  )}>
                    {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                  </span>
                  <span className="truncate text-neutral-700 dark:text-neutral-300 font-medium flex-1">{opt.name}</span>
                </button>
              );
            })}
          </div>
          {hasSelection && (
            <div className="p-2 border-t border-neutral-100 dark:border-neutral-700">
              <button onClick={() => { onChange(new Set()); setOpen(false); }}
                className="w-full text-[12px] sm:text-[13px] text-neutral-400 hover:text-red-500 transition-colors font-medium py-1">
                مسح التحديد
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────
type Period = "day" | "month" | "year";
type FilterType = "team" | "areas" | "supervisors" | "showrooms" | "sellers";
type ViewMode = "analytics" | "table";

interface Props { onBack?: () => void; }

export default function SalesPerformancePage({ onBack }: Props) {
  const today = new Date();

  // Period
  const [period, setPeriod] = useState<Period>("day");
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());

  // Date range (for table/detail view)
  const firstOfMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [dateFrom, setDateFrom] = useState<string>(firstOfMonth);
  const [dateTo, setDateTo] = useState<string>(todayStr);
  const [customRangeActive, setCustomRangeActive] = useState(false);

  // Filter
  const [filterType, setFilterType] = useState<FilterType>("team");
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set());
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(new Set());
  const [selectedSupervisors, setSelectedSupervisors] = useState<Set<string>>(new Set());
  const [selectedShowrooms, setSelectedShowrooms] = useState<Set<string>>(new Set());
  const [selectedSellers, setSelectedSellers] = useState<Set<string>>(new Set());
  const [tableSearch, setTableSearch] = useState("");

  // Mobile table view mode
  const [mobileTableMode, setMobileTableMode] = useState<"default" | "pinned" | "cards" | "single">("default");

  function resetTableFilters() {
    setSelectedRegions(new Set());
    setSelectedAreas(new Set());
    setSelectedSupervisors(new Set());
    setSelectedShowrooms(new Set());
    setSelectedSellers(new Set());
  }

  const hasActiveTableFilter =
    selectedRegions.size > 0 || selectedAreas.size > 0 ||
    selectedSupervisors.size > 0 || selectedShowrooms.size > 0 || selectedSellers.size > 0;

  // Drill-down navigation
  // drillPath[0] is always team root; each subsequent item is a clicked entity
  const [drillPath, setDrillPath] = useState<DrillCrumb[]>([]);

  // Current drill level and context id
  const currentDrillLevel: DrillLevel = drillPath.length === 0 ? "regions"
    : drillPath[drillPath.length - 1].level === "regions" ? "areas"
    : drillPath[drillPath.length - 1].level === "areas" ? "supervisors"
    : drillPath[drillPath.length - 1].level === "supervisors" ? "showrooms"
    : drillPath[drillPath.length - 1].level === "showrooms" ? "sellers"
    : drillPath[drillPath.length - 1].level === "sellers" ? "days"
    : "days";

  const currentDrillId = drillPath.length > 0 ? drillPath[drillPath.length - 1].id : null;

  function drillInto(level: DrillLevel, id: string, name: string) {
    setDrillPath(prev => [...prev, { level, id, name }]);
    setViewMode("table");
  }

  function drillTo(index: number) {
    setDrillPath(prev => prev.slice(0, index));
    setViewMode("table");
  }

  // View
  const [viewMode, setViewMode] = useState<ViewMode>("analytics");

  // Table sorting
  const [sortKey, setSortKey] = useState<string>("sales");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [tablePage, setTablePage] = useState(1);
  const TABLE_PAGE_SIZE = 40;

  // Scroll collapse
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const collapsedRef = useRef(false);
  const animLock = useRef(false); // locked during animation to prevent layout-shift loop

  useEffect(() => {
    let rafId: number | null = null;
    const el = scrollRef.current;

    const onScroll = () => {
      if (rafId !== null || animLock.current) return;
      rafId = requestAnimationFrame(() => {
        const currentY = (el && el.scrollTop > 0) ? el.scrollTop : window.scrollY;
        const diff = currentY - lastScrollY.current;

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

        lastScrollY.current = currentY;
        rafId = null;
      });
    };

    el?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      el?.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  // Calendar
  const daysInMonth = getDaysInMonth(year, month);

  // Filtered sellers — respects drill-down path
  const filteredSellers = useMemo(() => {
    // If drillPath has a context, filter by drill context instead of filter tabs
    if (drillPath.length > 0) {
      const last = drillPath[drillPath.length - 1];
      if (last.level === "regions") return SELLERS.filter(s => s.regionId === last.id);
      if (last.level === "areas") return SELLERS.filter(s => s.areaId === last.id);
      if (last.level === "supervisors") return SELLERS.filter(s => s.supervisorId === last.id);
      if (last.level === "showrooms") return SELLERS.filter(s => s.showroomId === last.id);
      if (last.level === "sellers") return SELLERS.filter(s => s.id === last.id);
      return SELLERS;
    }
    // Table view: cascading 5-level filter
    if (viewMode === "table") {
      return SELLERS.filter(s => {
        if (selectedRegions.size > 0 && !selectedRegions.has(s.regionId)) return false;
        if (selectedAreas.size > 0 && !selectedAreas.has(s.areaId)) return false;
        if (selectedSupervisors.size > 0 && !selectedSupervisors.has(s.supervisorId)) return false;
        if (selectedShowrooms.size > 0 && !selectedShowrooms.has(s.showroomId)) return false;
        if (selectedSellers.size > 0 && !selectedSellers.has(s.id)) return false;
        return true;
      });
    }
    return SELLERS.filter(s => {
      if (filterType === "team") return selectedRegions.size === 0 || selectedRegions.has(s.regionId);
      if (filterType === "areas") return selectedAreas.size === 0 || selectedAreas.has(s.areaId);
      if (filterType === "supervisors") return selectedSupervisors.size === 0 || selectedSupervisors.has(s.supervisorId);
      if (filterType === "showrooms") return selectedShowrooms.size === 0 || selectedShowrooms.has(s.showroomId);
      if (filterType === "sellers") return selectedSellers.size === 0 || selectedSellers.has(s.id);
      return true;
    });
  }, [filterType, selectedRegions, selectedAreas, selectedSupervisors, selectedShowrooms, selectedSellers, drillPath, viewMode]);

  const filteredIdxs = useMemo(
    () => filteredSellers.map(s => SELLERS.indexOf(s)),
    [filteredSellers]
  );

  // Dynamic KPIs — recalculate when period / month / year / day / filter changes
  const isFuturePeriod = year > today.getFullYear()
    || (year === today.getFullYear() && month > today.getMonth())
    || (period === "day" && year === today.getFullYear() && month === today.getMonth() && selectedDay > today.getDate());
  const periodKpis = useMemo(() => {
    if (isFuturePeriod) {
      const prevSales = filteredIdxs.reduce((s, si) => s + sellerPeriodPrevSales(si, year, month, period, selectedDay), 0);
      return { sales: 0, prevSales, target: 0, invoices: 0, pieces: 0, customers: 0 };
    }
    if (viewMode === "table") {
      const sales     = filteredIdxs.reduce((s, si) => s + sellerRangeSales(si, dateFrom, dateTo), 0);
      const prevSales = filteredIdxs.reduce((s, si) => s + sellerRangePrevSales(si, dateFrom, dateTo), 0);
      const target    = filteredIdxs.reduce((s, si) => s + sellerRangeTarget(si, dateFrom, dateTo), 0);
      const invoices  = filteredIdxs.reduce((s, si) => s + scaleRangeCount(SELLERS[si].invoices, dateFrom, dateTo), 0);
      const pieces    = filteredIdxs.reduce((s, si) => s + scaleRangeCount(SELLERS[si].pieces, dateFrom, dateTo), 0);
      const customers = filteredIdxs.reduce((s, si) => s + scaleRangeCount(SELLERS[si].customers, dateFrom, dateTo), 0);
      return { sales, prevSales, target, invoices, pieces, customers };
    }
    const sales     = filteredIdxs.reduce((s, si) => s + sellerPeriodSales(si, year, month, period, selectedDay), 0);
    const prevSales = filteredIdxs.reduce((s, si) => s + sellerPeriodPrevSales(si, year, month, period, selectedDay), 0);
    const target    = filteredIdxs.reduce((s, si) => s + sellerPeriodTarget(si, year, month, period), 0);
    const invoices  = filteredIdxs.reduce((s, si) => s + scalePeriodCount(SELLERS[si].invoices, year, month, period), 0);
    const pieces    = filteredIdxs.reduce((s, si) => s + scalePeriodCount(SELLERS[si].pieces, year, month, period), 0);
    const customers = filteredIdxs.reduce((s, si) => s + scalePeriodCount(SELLERS[si].customers, year, month, period), 0);
    return { sales, prevSales, target, invoices, pieces, customers };
  }, [filteredIdxs, period, year, month, selectedDay, viewMode, dateFrom, dateTo, isFuturePeriod]);

  const totalSales    = periodKpis.sales;
  const totalTarget   = periodKpis.target;
  const totalPrevSales = periodKpis.prevSales;
  const totalInvoices = periodKpis.invoices;
  const totalPieces   = periodKpis.pieces;
  const totalCustomers = periodKpis.customers;
  const achievementPct = totalTarget > 0 ? Math.round((totalSales / totalTarget) * 100) : 0;
  const growthPct = isFuturePeriod ? 0 : (totalPrevSales > 0 ? Math.round(((totalSales - totalPrevSales) / totalPrevSales) * 100) : 0);
  const avgInvoice = totalInvoices > 0 ? Math.round(totalSales / totalInvoices) : 0;

  // Calendar day pcts — based on filtered sellers
  const dayPcts = useMemo(() => genPeriodDayPcts(filteredIdxs, year, month), [filteredIdxs, year, month]);

  // Chart data — aggregated over filtered sellers
  const chartData = useMemo(() => {
    if (period === "day") return genAggDayData(filteredIdxs, year, month, selectedDay);
    if (period === "year") return genAggYearData(filteredIdxs, year);
    return genAggMonthData(filteredIdxs, year, month);
  }, [filteredIdxs, period, year, month, selectedDay]);

  // Bar chart data — grouped by filterType
  const barData = useMemo(() => {
    function groupData(items: { id: string; name: string }[], keyFn: (s: typeof SELLERS[number]) => string) {
      return items.map(item => {
        const idxs = filteredSellers.map((s, i) => keyFn(s) === item.id ? filteredIdxs[i] : -1).filter(i => i >= 0);
        if (isFuturePeriod) {
          return { label: item.name, value: 0, pct: 0 };
        }
        const value = idxs.reduce((a, si) => a + sellerPeriodSales(si, year, month, period, selectedDay), 0);
        const tgt   = idxs.reduce((a, si) => a + sellerPeriodTarget(si, year, month, period), 0);
        return { label: item.name, value, pct: tgt > 0 ? Math.round((value / tgt) * 100) : 0 };
      }).filter(d => isFuturePeriod || d.value > 0 || d.pct > 0);
    }
    if (filterType === "areas") return groupData(AREAS, s => s.areaId);
    if (filterType === "supervisors") return groupData(SUPERVISORS, s => s.supervisorId);
    if (filterType === "showrooms") return groupData(SHOWROOMS, s => s.showroomId);
    // sellers or team
    return filteredSellers.map((s, i) => {
      const si = filteredIdxs[i];
      if (isFuturePeriod) {
        return { label: s.name, value: 0, pct: 0 };
      }
      const value = sellerPeriodSales(si, year, month, period, selectedDay);
      const tgt   = sellerPeriodTarget(si, year, month, period);
      return { label: s.name, value, pct: tgt > 0 ? Math.round((value / tgt) * 100) : 0 };
    });
  }, [filteredSellers, filteredIdxs, filterType, period, year, month, selectedDay, isFuturePeriod]);

  // Table data — period-aware rows (range-aware when viewMode=table)
  const tableRows = useMemo(() =>
    filteredSellers.map((s, i) => {
      const si = filteredIdxs[i];
      const useRange = viewMode === "table";
      if (isFuturePeriod) {
        const prev = useRange ? sellerRangePrevSales(si, dateFrom, dateTo) : sellerPeriodPrevSales(si, year, month, period, selectedDay);
        return { ...s, sales: 0, target: 0, prevSales: prev, invoices: 0, pieces: 0, customers: 0 };
      }
      const sales     = useRange ? sellerRangeSales(si, dateFrom, dateTo)     : sellerPeriodSales(si, year, month, period, selectedDay);
      const target    = useRange ? sellerRangeTarget(si, dateFrom, dateTo)    : sellerPeriodTarget(si, year, month, period);
      const prev      = useRange ? sellerRangePrevSales(si, dateFrom, dateTo) : sellerPeriodPrevSales(si, year, month, period, selectedDay);
      const invoices  = useRange ? scaleRangeCount(s.invoices, dateFrom, dateTo)  : scalePeriodCount(s.invoices, year, month, period);
      const pieces    = useRange ? scaleRangeCount(s.pieces, dateFrom, dateTo)    : scalePeriodCount(s.pieces, year, month, period);
      const customers = useRange ? scaleRangeCount(s.customers, dateFrom, dateTo) : scalePeriodCount(s.customers, year, month, period);
      return { ...s, sales, target, prevSales: prev, invoices, pieces, customers };
    }),
    [filteredSellers, filteredIdxs, period, year, month, selectedDay, viewMode, dateFrom, dateTo, isFuturePeriod]
  );

  const tableData = useMemo(() => {
    const sorted = [...tableRows].sort((a, b) => {
      const aVal = (a as any)[sortKey] ?? 0;
      const bVal = (b as any)[sortKey] ?? 0;
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
    const start = (tablePage - 1) * TABLE_PAGE_SIZE;
    return { rows: sorted.slice(start, start + TABLE_PAGE_SIZE), total: sorted.length };
  }, [tableRows, sortKey, sortDir, tablePage]);

  const currentSales   = useMemo(() => chartData.reduce((s, d) => s + d.current, 0), [chartData]);
  const prevSalesChart = useMemo(() => chartData.reduce((s, d) => s + d.prev, 0), [chartData]);

  const totalPages = Math.ceil(tableData.total / TABLE_PAGE_SIZE);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
    setTablePage(1);
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(1);
  }

  return (
    <div dir="rtl" className="min-h-screen bg-neutral-0 dark:bg-neutral-900 flex flex-col">
      {/* ── Fixed Header (filters + tabs) ── */}
      <div className="sticky top-0 z-40 md:z-30 bg-white dark:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700 rounded-xl">
        <div className="max-w-[1400px] mx-auto px-0 sm:px-2 rounded-xl overflow-hidden">
          {/* Filter type tabs — always sticky and visible */}
          <PageTabs
            tabs={[
              ["team","الفريق", Users],
              ["areas","المناطق", MapPin],
              ["supervisors","المشرفين", UserCircle],
              ["showrooms","المعارض", Store],
              ["sellers","البائعين", ShoppingBag]
            ]}
            active={filterType}
            onChange={(type) => { setFilterType(type as FilterType); resetTableFilters(); }}
          />

          {/* Filters and view mode */}
          <AnimatePresence initial={false}>
          {(!headerCollapsed || viewMode === "table") && (
          <motion.div
            key="filters-row"
            variants={{
              show: {
                height: "auto", opacity: 1,
                transition: {
                  height: { type: "spring", stiffness: 700, damping: 42, mass: 0.4 },
                  opacity: { duration: 0.07, ease: "easeOut" }
                }
              },
              hide: {
                height: 0, opacity: 0,
                transition: {
                  height: { type: "spring", stiffness: 500, damping: 38, mass: 0.8 },
                  opacity: { duration: 0.1, ease: "easeIn" }
                }
              }
            }}
            initial="hide"
            animate="show"
            exit="hide"
            className="overflow-hidden px-2 sm:px-6"
          >
          <div className="py-1 pb-0 mb-1 sm:py-[14px] sm:pb-0">
            <div className="flex items-center gap-3 sm:gap-4 w-full overflow-x-auto">
              {viewMode === "table" ? (
                /* ── Table view: 5-level cascading filters + date range ── */
                <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto min-w-0 flex-1 pb-2 ">
                  {/* Clear button */}
                  {hasActiveTableFilter && (
                    <button
                      onClick={() => { resetTableFilters(); setTableSearch(""); }}
                      className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors ml-1 text-neutral-400 hover:text-neutral-700 dark:text-neutral-300"
                      title="مسح الفلاتر"
                    >
                      <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  )}

                  {/* الإقليم */}
                  <MultiSelectDropdown
                    options={REGIONS}
                    selected={selectedRegions}
                    onChange={s => { setSelectedRegions(s); setSelectedAreas(new Set()); setSelectedSupervisors(new Set()); setSelectedShowrooms(new Set()); setSelectedSellers(new Set()); }}
                    placeholder="جميع الأقاليم"
                  />
                  {/* المنطقة */}
                  <MultiSelectDropdown
                    options={selectedRegions.size > 0 ? AREAS.filter(a => selectedRegions.has(a.regionId)) : AREAS}
                    selected={selectedAreas}
                    onChange={s => { setSelectedAreas(s); setSelectedSupervisors(new Set()); setSelectedShowrooms(new Set()); setSelectedSellers(new Set()); }}
                    placeholder="جميع المناطق"
                  />
                  {/* المشرف */}
                  <MultiSelectDropdown
                    options={SUPERVISORS.filter(sup =>
                      (selectedRegions.size === 0 || selectedRegions.has(sup.regionId)) &&
                      (selectedAreas.size === 0 || selectedAreas.has(sup.areaId))
                    )}
                    selected={selectedSupervisors}
                    onChange={s => { setSelectedSupervisors(s); setSelectedShowrooms(new Set()); setSelectedSellers(new Set()); }}
                    placeholder="جميع المشرفين"
                  />
                  {/* المعرض */}
                  <MultiSelectDropdown
                    options={SHOWROOMS.filter(sh =>
                      (selectedRegions.size === 0 || selectedRegions.has(sh.regionId)) &&
                      (selectedAreas.size === 0 || selectedAreas.has(sh.areaId)) &&
                      (selectedSupervisors.size === 0 || selectedSupervisors.has(sh.supervisorId))
                    )}
                    selected={selectedShowrooms}
                    onChange={s => { setSelectedShowrooms(s); setSelectedSellers(new Set()); }}
                    placeholder="جميع المعارض"
                  />
                  {/* البائع */}
                  <MultiSelectDropdown
                    options={SELLERS.filter(s =>
                      (selectedRegions.size === 0 || selectedRegions.has(s.regionId)) &&
                      (selectedAreas.size === 0 || selectedAreas.has(s.areaId)) &&
                      (selectedSupervisors.size === 0 || selectedSupervisors.has(s.supervisorId)) &&
                      (selectedShowrooms.size === 0 || selectedShowrooms.has(s.showroomId))
                    )}
                    selected={selectedSellers}
                    onChange={setSelectedSellers}
                    placeholder="جميع البائعين"
                  />
                  <div className="relative shrink-0 w-[135px] sm:w-[180px]">
                    <input
                      value={tableSearch}
                      onChange={e => setTableSearch(e.target.value)}
                      placeholder="بحث في النتائج"
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-1.5 text-[12px] sm:text-[14px] font-medium sm:font-bold text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#B21063]/30"
                    />
                  </div>
                  <div className="hidden sm:block flex-1 min-w-[1px]" />
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-neutral-100 dark:bg-neutral-700/60 rounded-xl p-1 gap-0.5">
                      {([["day","يومي",Sun],["month","شهري",CalendarDays]] as [Period, string, React.ElementType][]).map(([p, l, Icon]) => (
                        <button key={p} onClick={() => { setPeriod(p as Period); setCustomRangeActive(false); }}
                          className={cn("flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold transition-all whitespace-nowrap rounded-lg",
                            period === p && !customRangeActive ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-sm" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200")}>
                          <Icon className="w-3.5 h-3.5" />
                          {l}
                        </button>
                      ))}
                      <DateRangePicker iconOnly active={customRangeActive} dateFrom={dateFrom} dateTo={dateTo}
                        onFromChange={v => { setDateFrom(v); setCustomRangeActive(true); }}
                        onToChange={v => { setDateTo(v); setCustomRangeActive(true); }} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={prevMonth} className="w-7 h-7 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors">
                        <ChevronRight className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                      </button>
                      <span className="text-[14px] font-bold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">{MONTHS_AR[month]} {year}</span>
                      <button onClick={nextMonth} className="w-7 h-7 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors">
                        <ChevronLeft className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Analytics view: simple title + single filter ── */
                <>
                  <div className="flex items-center justify-center sm:justify-center gap-3 sm:gap-4 w-full overflow-x-auto">
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs sm:text-[14px] font-bold text-neutral-700 dark:text-neutral-300">مؤشر أداء</span>
                      <span className="text-[12px] sm:text-[14px] font-bold text-neutral-400">
                        {period === "day"
                          ? `${selectedDay} ${MONTHS_AR[month]} ${toArabicDigits(String(year))}`
                          : period === "month"
                          ? `${MONTHS_AR[month]} ${toArabicDigits(String(year))}`
                          : toArabicDigits(String(year))}
                      </span>
                      {filterType === "team" && (
                        <MultiSelectDropdown options={REGIONS} selected={selectedRegions} onChange={setSelectedRegions} placeholder="جميع الأقاليم" />
                      )}
                      {filterType === "areas" && (
                        <MultiSelectDropdown options={AREAS} selected={selectedAreas} onChange={setSelectedAreas} placeholder="جميع المناطق" />
                      )}
                      {filterType === "supervisors" && (
                        <MultiSelectDropdown options={SUPERVISORS} selected={selectedSupervisors} onChange={setSelectedSupervisors} placeholder="جميع المشرفين" />
                      )}
                      {filterType === "showrooms" && (
                        <MultiSelectDropdown options={SHOWROOMS} selected={selectedShowrooms} onChange={setSelectedShowrooms} placeholder="جميع المعارض" />
                      )}
                      {filterType === "sellers" && (
                        <MultiSelectDropdown options={SELLERS} selected={selectedSellers} onChange={setSelectedSellers} placeholder="جميع البائعين" />
                      )}
                    </div>
                    <div className="hidden sm:block flex-1 min-w-[1px]" />
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                      <div className="flex items-center bg-neutral-100 dark:bg-neutral-700/60 rounded-xl p-1 gap-0.5">
                        {([["day","يومي",Sun],["month","شهري",CalendarDays]] as [Period, string, React.ElementType][]).map(([p, l, Icon]) => (
                          <button key={p} onClick={() => { setPeriod(p as Period); setCustomRangeActive(false); }}
                            className={cn("flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold transition-all whitespace-nowrap rounded-lg",
                              period === p && !customRangeActive ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-sm" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200")}>
                            <Icon className="w-3.5 h-3.5" />
                            {l}
                          </button>
                        ))}
                        <DateRangePicker iconOnly active={customRangeActive} dateFrom={dateFrom} dateTo={dateTo}
                          onFromChange={v => { setDateFrom(v); setCustomRangeActive(true); }}
                          onToChange={v => { setDateTo(v); setCustomRangeActive(true); }} />
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={prevMonth} className="w-7 h-7 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors">
                          <ChevronRight className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                        </button>
                        <span className="text-[14px] font-bold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">{MONTHS_AR[month]} {year}</span>
                        <button onClick={nextMonth} className="w-7 h-7 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors">
                          <ChevronLeft className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="mr-auto flex items-center gap-1 sm:gap-1.5 shrink-0">
                {/* View mode tabs */}
                <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-700 rounded-xl p-1">
                  {([
                    ["analytics", "ملخص", BarChart2],
                    ["table", "تفصيلي", Table]
                  ] as const).map(([mode, label, IconComponent]) => (
                    <button key={mode} onClick={() => setViewMode(mode)}
                      className={cn("flex items-center justify-center px-2 py-1.5 text-xs font-bold rounded-lg transition-all duration-200",
                        viewMode === mode ? "bg-neutral-900 text-white shadow-sm" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600")}
                      title={label}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Scrollable Content ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-8 sm:pb-10">
        <div className="max-w-[1400px] mx-auto px-1 sm:px-2 space-y-3 pt-1 sm:pt-2">
          {/* ── Calendar / Period Navigator ── */}
          <div className="border-b border-neutral-100 dark:border-neutral-700 px-1 py-2 -mx-1 mb-3 mt-1">
            <div className="flex items-center gap-2 mb-2 sm:hidden">
              <div className="flex items-center bg-neutral-100 dark:bg-neutral-700/60 rounded-xl p-1 gap-0.5">
                {([["day","يومي",Sun],["month","شهري",CalendarDays]] as [Period, string, React.ElementType][]).map(([p, l, Icon]) => (
                  <button key={p} onClick={() => { setPeriod(p as Period); setCustomRangeActive(false); }}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold transition-all whitespace-nowrap rounded-lg",
                      period === p && !customRangeActive ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-sm" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200")}>
                    <Icon className="w-3.5 h-3.5" />
                    {l}
                  </button>
                ))}
                <DateRangePicker iconOnly active={customRangeActive} dateFrom={dateFrom} dateTo={dateTo}
                  onFromChange={v => { setDateFrom(v); setCustomRangeActive(true); }}
                  onToChange={v => { setDateTo(v); setCustomRangeActive(true); }} />
              </div>
              <div className="flex items-center gap-1 mr-auto">
                <button onClick={prevMonth} className="w-7 h-7 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                </button>
                <span className="text-[14px] font-bold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">{MONTHS_AR[month]} {year}</span>
                <button onClick={nextMonth} className="w-7 h-7 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                </button>
              </div>
            </div>
            {(period === "month" || period === "year") ? (
              <div className="overflow-x-auto scrollbar-hide py-1">
                <div className="flex gap-0.5 pb-1 justify-center" style={{ minWidth: "max-content", margin: "0 auto" }}>
                  {MONTHS_AR.map((mName, mIdx) => {
                    const isSelected = period === "month" && mIdx === month;
                    const isFutureMonth = year > today.getFullYear() || (year === today.getFullYear() && mIdx > today.getMonth());
                    const pct = genMonthPct(filteredIdxs, year, mIdx);
                    const color = pctColor(pct);
                    return (
                      <button key={mIdx} onClick={() => { setMonth(mIdx); setPeriod("month"); }}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-xl px-2 py-2 transition-all shrink-0 active:scale-95",
                          "sm:min-w-[76px] min-w-[calc((100vw-2rem-1rem)/7)]",
                          isSelected ? "bg-[#111111] dark:bg-[#242c52]" : "bg-white dark:bg-[#111529]",
                          isFutureMonth && !isSelected && "opacity-40"
                        )}
                        style={{
                          border: isSelected ? "0px solid rgba(0,0,0,0.25)" : "0px solid #e5e5e5",
                          boxShadow: isSelected ? "0 0px 0px rgba(0,0,0,0.18)" : "0 0px 0px rgba(0,0,0,0.08)",
                        }}>
                        <span className={cn("text-[12px] sm:text-[12px] font-bold whitespace-nowrap", isSelected ? "text-white" : "text-[#030303] dark:text-[#e6e9f7]")}>{mName}</span>
                        <span className="text-xs sm:text-sm font-extrabold whitespace-nowrap" style={{ color: isSelected ? "#ffffff" : color }}>{pct}%</span>
                        <div className={cn("w-full h-1 sm:h-1.5 rounded-full overflow-hidden", isSelected ? "bg-white/25" : "bg-[#dddddd] dark:bg-white/10")}>
                          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: isSelected ? "#ffffff" : color }} />
                        </div>
                      </button>
                    );
                  })}
                  {(() => {
                    const isFutureYear = year > today.getFullYear();
                    const yearPct = isFutureYear ? 0 : Math.round(MONTHS_AR.reduce((s, _, mIdx) => s + genMonthPct(filteredIdxs, year, mIdx), 0) / 12);
                    const isYearSelected = period === "year";
                    return (
                      <button onClick={() => setPeriod("year")}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-xl px-2 py-2 transition-all shrink-0 active:scale-95",
                          "sm:min-w-[76px] min-w-[calc((100vw-2rem-1rem)/7)]",
                          isYearSelected ? "bg-[#111111] dark:bg-[#242c52]" : "bg-white dark:bg-[#111529]",
                          isFutureYear && !isYearSelected && "opacity-40"
                        )}
                        style={{
                          border: isYearSelected ? "1.5px solid rgba(0,0,0,0.25)" : "1.5px solid transparent",
                          boxShadow: isYearSelected ? "0 2px 8px rgba(0,0,0,0.18)" : "none",
                        }}>
                        <span className="text-[12px] sm:text-[12px] font-bold whitespace-nowrap" style={{ color: isYearSelected ? "#ffffff" : "#B21063" }}>السنوي</span>
                        <span className="text-xs sm:text-sm font-extrabold whitespace-nowrap" style={{ color: isYearSelected ? "#ffffff" : pctColor(yearPct) }}>{yearPct}%</span>
                        <div className={cn("w-full h-1.5 rounded-full overflow-hidden", isYearSelected ? "bg-white/25" : "bg-[#dddddd] dark:bg-white/10")}>
                          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(yearPct, 100)}%`, backgroundColor: isYearSelected ? "#ffffff" : "#B21063" }} />
                        </div>
                      </button>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-hide py-1">
                <div className="flex gap-0.5 pb-1 justify-center px-1" style={{ minWidth: `${daysInMonth * 44 + 32}px`, width: "max-content", margin: "0 auto" }}>
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const pct = dayPcts[day];
                    const isSelected = selectedDay === day;
                    const isFuture = year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth()) || (year === today.getFullYear() && month === today.getMonth() && day > today.getDate());
                    const dayName = DAYS_SHORT_AR[new Date(year, month, day).getDay()];
                    const color = pctColor(pct);
                    return (
                      <button key={day} onClick={() => setSelectedDay(day)}
                        className={cn(
                          "flex flex-col items-center gap-0.5 rounded-xl py-2 transition-all shrink-0 active:scale-95",
                          "sm:min-w-[42px] min-w-[calc((100vw-2rem-1rem)/7)]",
                          isSelected ? "bg-[#111111] dark:bg-[#242c52] text-white shadow-sm" : "bg-white dark:bg-[#111529]",
                          isFuture && !isSelected && "opacity-40"
                        )}
                        style={{
                          border: isSelected ? "1.5px solid rgba(0,0,0,0.25)" : "1.5px solid transparent",
                          boxShadow: isSelected ? "0 2px 8px rgba(0,0,0,0.18)" : "none",
                        }}>
                        <span className={cn("text-[9px] font-semibold leading-none", isSelected ? "text-white/65" : "text-[#737373] dark:text-[#8088aa]")}>{dayName}</span>
                        <span className={cn("text-[13px] font-extrabold leading-tight", isSelected ? "text-white" : "text-[#1a1a1a] dark:text-[#e6e9f7]")}>{day}</span>
                        <span className="text-[12px] font-bold leading-none" style={{ color: isSelected ? "#ffffff" : color }}>{pct}%</span>
                        <div className={cn("w-4/5 h-1.5 rounded-full overflow-hidden mt-0.5", isSelected ? "bg-white/25" : "bg-[#dddddd] dark:bg-white/10")}>
                          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: isSelected ? "#ffffff" : color }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>{/* end sticky wrapper */}

        {/* ── KPI Cards ── */}
        <div className={cn(
          "transition-all duration-300 overflow-hidden",
          headerCollapsed ? "opacity-0 max-h-0 !m-0 pointer-events-none" : "opacity-100 max-h-[500px]"
        )}>

        {/* Breadcrumb drill-down trail */}
        {drillPath.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mb-2 bg-neutral-50 dark:bg-neutral-700 rounded-xl px-3 py-2 border border-neutral-100 dark:border-neutral-700">
            <button onClick={() => setDrillPath([])}
              className="text-[11px] font-semibold text-[#B21063] hover:underline shrink-0 transition-colors">
              الفريق
            </button>
            {drillPath.map((crumb, i) => (
              <React.Fragment key={i}>
                <ChevronLeft className="w-3 h-3 text-neutral-300 shrink-0" />
                {i < drillPath.length - 1 ? (
                  <button onClick={() => drillTo(i + 1)}
                    className="text-[11px] font-semibold text-[#B21063] hover:underline shrink-0 transition-colors truncate max-w-[120px]">
                    {crumb.name}
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 shrink-0 truncate max-w-[140px]">{crumb.name}</span>
                )}
              </React.Fragment>
            ))}
            <button onClick={() => setDrillPath([])}
              className="mr-auto text-[12px] text-neutral-400 hover:text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded-lg hover:bg-neutral-200 transition-colors">
              إعادة ضبط
            </button>
          </div>
        )}

        {drillPath.length > 0 && (() => {
          const last = drillPath[drillPath.length - 1];
          const level = last.level;
          const entityId = last.id;
          const entityName = last.name;

          const showroom = SHOWROOMS.find(s => s.id === entityId);
          const seller = SELLERS.find(s => s.id === entityId);
          const supervisor = SUPERVISORS.find(s => s.id === entityId);
          const area = AREAS.find(a => a.id === entityId);
          const region = REGIONS.find(r => r.id === (area?.regionId || showroom?.regionId || seller?.regionId));

          const seedNum = parseInt(entityId.replace(/\D/g, "")) || 1;
          const getEntityCode = (id: string, pfx = "DTS") => `${pfx}${String(parseInt(id.replace(/\D/g, "")) || 1).padStart(5, "0")}`;
          const getGrade = (id: string) => {
            const grades = ["A+", "A", "B+", "B", "C+", "C"]; return grades[(parseInt(id.replace(/\D/g, "")) || 1) % grades.length];
          };
          const getStatus = (id: string) => {
            const states = [ { label: "Active", color: "bg-emerald-100 text-emerald-700" }, { label: "Inactive", color: "bg-rose-100 text-rose-700" }, { label: "موقّت", color: "bg-amber-100 text-amber-700" } ];
            return states[(parseInt(id.replace(/\D/g, "")) || 1) % states.length];
          };
          const getDates = (id: string) => {
            const n = parseInt(id.replace(/\D/g, "")) || 1; const y = 2010 + (n % 12);
            return { openDate: `${y}-08-${String((n % 28) + 1).padStart(2, "0")}`, localizationDate: `${y + 7}-09-${String((n % 28) + 1).padStart(2, "0")}`, ladiesOnlyDate: `${y + 8}-08-${String((n % 28) + 1).padStart(2, "0")}` };
          };
          const brand = ["درعه", "عود", "عطور", "اكسسوارات", "+C"][seedNum % 5];
          const layout = ["مختلط", "رجالي", "نسائي"][seedNum % 3];
          const managerName = (salt: number) => `${_pick(_FIRST, _ds(_dsk(seedNum, salt, 1)))} ${_pick(_LAST, _ds(_dsk(seedNum, salt, 2)))}`;

          function Header({ icon, sub: subProp }: { icon: React.ReactNode; sub?: string }) {
            const code = getEntityCode(entityId, level === "sellers" ? "SEL" : level === "supervisors" ? "SUP" : level === "areas" ? "AR" : level === "regions" ? "RGN" : "DTS");
            const status = getStatus(entityId);
            const defaultSub = level === "showrooms" || level === "sellers" ? `${area ? area.name : ""} • ${region ? region.name : ""}` : level === "supervisors" ? `${area ? area.name : ""} • ${region ? region.name : ""}` : level === "areas" ? `${region ? region.name : ""}` : "";
            const sub = subProp ?? defaultSub;
            return (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shrink-0 bg-[#B21063]/10 rounded-xl">{icon}</div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm sm:text-base font-bold text-neutral-800 dark:text-white leading-tight">{entityName}</h2>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B21063] bg-[#B21063]/10 px-2 py-0.5 rounded-lg">
                        {code}
                        <ChevronDown className="w-3 h-3" />
                      </span>
                    </div>
                    {!!sub && <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{sub}</p>}
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${status.color}`}>{status.label}</span>
              </div>
            );
          }

          function KV({ label, value }: { label: string; value: React.ReactNode }) {
            return (
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-medium">{label}</span>
                <span className="text-[12px] sm:text-sm font-bold text-neutral-800 dark:text-white text-left truncate max-w-[60%]">{value}</span>
              </div>
            );
          }

          const dates = getDates(entityId);

          if (level === "showrooms" || level === "sellers") {
            const sh = showroom || SHOWROOMS.find(s => s.id === seller?.showroomId);
            const sup = sh ? SUPERVISORS.find(s => s.id === sh.supervisorId) : null;
            const ar = sh ? AREAS.find(a => a.id === sh.areaId) : null;
            const reg = ar ? REGIONS.find(r => r.id === ar.regionId) : null;
            return (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-3 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-4 sm:p-5">
                <Header icon={<ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-[#B21063]" />} sub={`${ar?.name || ""} • ${reg?.name || ""}`} />
                <div className="my-3 border-t border-neutral-100 dark:border-neutral-700" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1"><h4 className="text-[12px] sm:text-sm font-bold text-neutral-800 dark:text-neutral-100">معلومات المعرض</h4><MapPin className="w-4 h-4 text-[#B21063]" /></div>
                    <KV label="رمز المعرض" value={getEntityCode(sh?.id || entityId)} />
                    <KV label="الماركة" value={brand} />
                    <KV label="التصنيف" value={getGrade(entityId)} />
                    <KV label="حالة المعرض" value={getStatus(entityId).label} />
                    <KV label="الوضع" value={layout} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1"><h4 className="text-[12px] sm:text-sm font-bold text-neutral-800 dark:text-neutral-100">التواريخ</h4><Calendar className="w-4 h-4 text-[#B21063]" /></div>
                    <KV label="تاريخ الافتتاح" value={dates.openDate} />
                    <KV label="تاريخ التوطين" value={dates.localizationDate} />
                    <KV label="تاريخ السيدات فقط" value={dates.ladiesOnlyDate} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1"><h4 className="text-[12px] sm:text-sm font-bold text-neutral-800 dark:text-neutral-100">الإدارة والمشرفون</h4><Users className="w-4 h-4 text-[#B21063]" /></div>
                    <KV label="مدير الإقليم" value={managerName(10)} />
                    <KV label="مدير المنطقة" value={managerName(20)} />
                    <KV label="المشرف" value={sup?.name || "—"} />
                  </div>
                </div>
              </motion.div>
            );
          }

          if (level === "supervisors") {
            const sup = supervisor; const ar = sup ? AREAS.find(a => a.id === sup.areaId) : null; const reg = ar ? REGIONS.find(r => r.id === ar.regionId) : null;
            return (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-3 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-4 sm:p-5">
                <Header icon={<Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#B21063]" />} sub={`${ar?.name || ""} • ${reg?.name || ""}`} />
                <div className="my-3 border-t border-neutral-100 dark:border-neutral-700" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-[12px] sm:text-sm font-bold text-neutral-800 dark:text-neutral-100 mb-1">معلومات المشرف</h4>
                    <KV label="المنطقة" value={ar?.name || "—"} />
                    <KV label="الإقليم" value={reg?.name || "—"} />
                    <KV label="التصنيف" value={getGrade(entityId)} />
                  </div>
                  <div>
                    <h4 className="text-[12px] sm:text-sm font-bold text-neutral-800 dark:text-neutral-100 mb-1">التواريخ</h4>
                    <KV label="تاريخ التعيين" value={dates.openDate} />
                  </div>
                  <div>
                    <h4 className="text-[12px] sm:text-sm font-bold text-neutral-800 dark:text-neutral-100 mb-1">الإدارة</h4>
                    <KV label="مدير الإقليم" value={managerName(10)} />
                    <KV label="مدير المنطقة" value={managerName(20)} />
                  </div>
                </div>
              </motion.div>
            );
          }

          if (level === "areas") {
            const ar = area; const reg = ar ? REGIONS.find(r => r.id === ar.regionId) : null;
            return (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-3 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-4 sm:p-5">
                <Header icon={<MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#B21063]" />} sub={`${reg?.name || ""}`} />
                <div className="my-3 border-t border-neutral-100 dark:border-neutral-700" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-[12px] sm:text-sm font-bold text-neutral-800 dark:text-neutral-100 mb-1">معلومات المنطقة</h4>
                    <KV label="الإقليم" value={reg?.name || "—"} />
                    <KV label="التصنيف" value={getGrade(entityId)} />
                    <KV label="الحالة" value={getStatus(entityId).label} />
                  </div>
                  <div>
                    <h4 className="text-[12px] sm:text-sm font-bold text-neutral-800 dark:text-neutral-100 mb-1">التواريخ</h4>
                    <KV label="تاريخ التأسيس" value={dates.openDate} />
                  </div>
                  <div>
                    <h4 className="text-[12px] sm:text-sm font-bold text-neutral-800 dark:text-neutral-100 mb-1">الإدارة</h4>
                    <KV label="مدير الإقليم" value={managerName(10)} />
                    <KV label="مدير المنطقة" value={managerName(20)} />
                  </div>
                </div>
              </motion.div>
            );
          }

          if (level === "regions") {
            return (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-3 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-4 sm:p-5">
                <Header icon={<MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#B21063]" />} />
                <div className="my-3 border-t border-neutral-100 dark:border-neutral-700" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-[12px] sm:text-sm font-bold text-neutral-800 dark:text-neutral-100 mb-1">معلومات الإقليم</h4>
                    <KV label="الرمز" value={getEntityCode(entityId, "RGN")} />
                    <KV label="التصنيف" value={getGrade(entityId)} />
                  </div>
                  <div>
                    <h4 className="text-[12px] sm:text-sm font-bold text-neutral-800 dark:text-neutral-100 mb-1">التواريخ</h4>
                    <KV label="تاريخ التأسيس" value={dates.openDate} />
                  </div>
                  <div>
                    <h4 className="text-[12px] sm:text-sm font-bold text-neutral-800 dark:text-neutral-100 mb-1">الإدارة</h4>
                    <KV label="مدير الإقليم" value={managerName(10)} />
                  </div>
                </div>
              </motion.div>
            );
          }

          return null;
        })()}

                {viewMode !== "table" && <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-1 sm:gap-2.5 pb-2 overflow-visible mx-1 sm:mx-0">
          <KpiCard title="إجمالي المبيعات" value={formatNum(totalSales)} sub={`الهدف: ${formatNum(totalTarget)}`} icon={ShoppingBag} color="#00C9A7" progress={achievementPct} />
          <KpiCard title="نسبة التحقيق" value={`${achievementPct}%`} sub={`نمو: ${growthPct >= 0 ? "+" : ""}${growthPct}%`} icon={TrendingUp} color={pctColor(achievementPct)} />
          <KpiCard title="الفواتير" value={formatFull(totalInvoices)} sub={`متوسط: ${formatFull(avgInvoice)}`} icon={FileText} color="#4D8AFF" />
          <KpiCard title="القطع" value={formatFull(totalPieces)} sub={`م.قطعة: ${Math.round(totalPieces / Math.max(totalInvoices, 1))}`} icon={ShoppingBag} color="#F9A825" />
          <KpiCard title="المعارض" value={formatFull(totalCustomers)} sub={`بائعين: ${filteredSellers.length}`} icon={MapPin} color="#845EC2" />
          <KpiCard title="مبيعات سابق" value={formatNum(totalPrevSales)} sub={`الفرق: ${formatNum(Math.abs(totalSales - totalPrevSales))}`} icon={BarChart2} color="#E91E8C" />
        </div>}
        </div>

        {/* ── ANALYTICS VIEW ── */}
        <AnimatePresence mode="wait">
          {viewMode === "analytics" && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
              className="space-y-4 mx-1 sm:mx-0">

              {/* Row: bar charts + trend */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Team/Showrooms/Sellers bar chart */}
                <motion.div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} whileHover={{ scale: 1.01 }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                      {{ team: "أداء الفريق", areas: "أداء المناطق", supervisors: "أداء المشرفين", showrooms: "أداء المعارض", sellers: "أداء البائعين" }[filterType]}
                    </h3>
                    <span className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full", pctBg(achievementPct))}>
                      متوسط {achievementPct}%
                    </span>
                  </div>
                  <TeamSummary data={barData} />
                </motion.div>

                {/* Category radial gauge chart */}
                <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">تحقيق الفئات</h3>
                    <span className="text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 px-2.5 py-0.5 rounded-full font-medium">توزيع المبيعات</span>
                  </div>
                  {(() => {
                    const activeCats = CATEGORIES.filter(c => c.pct > 0);
                    const size = 200;
                    const cx = size / 2;
                    const cy = size / 2;
                    const maxR = 85;
                    const strokeW = 8;
                    const gap = 6;
                    return (
                      <div className="flex items-center gap-4">
                        {/* Labels on the left */}
                        <div className="flex flex-col gap-2 flex-1">
                          {activeCats.map((cat, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">{cat.name}</span>
                              </div>
                              <span className="text-sm font-bold" style={{ color: cat.color }}>{cat.pct}</span>
                            </div>
                          ))}
                        </div>
                        {/* SVG radial gauge */}
                        <motion.div className="shrink-0 flex flex-col items-center gap-2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} whileHover={{ scale: 1.03 }}>
                          <div style={{ width: size, height: size }}>
                            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                              {activeCats.map((cat, i) => {
                                const r = maxR - i * (strokeW + gap);
                                const circ = 2 * Math.PI * r;
                                const arcLen = circ * 0.75; // 270 degree arc
                                const filled = (cat.pct / 100) * arcLen;
                                return (
                                  <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08, duration: 0.4 }}>
                                    {/* background track — full gray circle */}
                                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth={strokeW}
                                      strokeLinecap="round" />
                                    {/* filled arc */}
                                    <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke={cat.color} strokeWidth={strokeW}
                                      strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
                                      initial={{ pathLength: 0 }}
                                      animate={{ pathLength: cat.pct / 100 }}
                                      transition={{ delay: i * 0.12 + 0.2, duration: 0.8, ease: "easeOut" }} />
                                  </motion.g>
                                );
                              })}
                            </svg>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })()}
                </div>

                {/* Sales trend chart */}
                <motion.div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }} whileHover={{ scale: 1.01 }}>
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                      {period === "day" ? `مبيعات يوم ${selectedDay} ${MONTHS_AR[month]}` :
                       period === "year" ? `مبيعات سنة ${year}` :
                       `مبيعات ${MONTHS_AR[month]} ${year}`}
                    </h3>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 rounded bg-emerald-400 inline-block" />
                        <span className="text-neutral-500 dark:text-neutral-400 font-medium">حالي</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 rounded bg-amber-400 inline-block" style={{ borderBottom: "2px dashed" }} />
                        <span className="text-neutral-500 dark:text-neutral-400 font-medium">سابق</span>
                      </span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <AreaChart data={chartData} height={130} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-neutral-50">
                    <motion.div className="text-center" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.35 }}>
                      <div className="text-xs text-neutral-400 font-medium">حالي</div>
                      <motion.div className="text-sm font-bold text-emerald-600" initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.85, duration: 0.3, type: "spring", stiffness: 200 }}>{formatNum(currentSales)}</motion.div>
                    </motion.div>
                    <motion.div className="text-center" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.35 }}>
                      <div className="text-xs text-neutral-400 font-medium">سابق</div>
                      <motion.div className="text-sm font-bold text-amber-600" initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.95, duration: 0.3, type: "spring", stiffness: 200 }}>{formatNum(prevSalesChart)}</motion.div>
                    </motion.div>
                    <motion.div className="text-center" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.35 }}>
                      <div className="text-xs text-neutral-400 font-medium">النمو</div>
                      <motion.div className={cn("text-sm font-bold", growthPct >= 0 ? "text-emerald-600" : "text-rose-500")} initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 1.05, duration: 0.3, type: "spring", stiffness: 200 }}>
                        {growthPct >= 0 ? "+" : ""}{growthPct}%
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* Target achievement — filter + drill aware mini cards */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                    {(() => {
                      if (drillPath.length > 0) {
                        if (currentDrillLevel === "areas") return "أداء المناطق";
                        if (currentDrillLevel === "supervisors") return "أداء المشرفين";
                        if (currentDrillLevel === "showrooms") return "أداء المعارض";
                        if (currentDrillLevel === "sellers") return "أداء البائعين";
                        return "تفصيل الأداء";
                      }
                      if (filterType === "areas") return selectedAreas.size > 0 ? "أداء المناطق المحددة" : "أداء جميع المناطق";
                      if (filterType === "supervisors") return selectedSupervisors.size > 0 ? "أداء المشرفين المحددين" : "أداء جميع المشرفين";
                      if (filterType === "showrooms") return selectedShowrooms.size > 0 ? "أداء المعارض المحددة" : "أداء جميع المعارض";
                      if (filterType === "sellers") return selectedSellers.size > 0 ? "أداء البائعين المحددين" : "أداء جميع البائعين";
                      if (selectedSellers.size > 0) return "أداء البائعين المحددين";
                      if (selectedShowrooms.size > 0) return "أداء بائعي المعارض المحددة";
                      if (selectedSupervisors.size > 0) return "أداء معارض المشرفين المحددين";
                      if (selectedAreas.size > 0) return "أداء مشرفي المناطق المحددة";
                      if (selectedRegions.size > 0) return "أداء مناطق الأقاليم المحددة";
                      return "أداء الأقاليم";
                    })()}
                  </h3>
                  <span className="text-[12px] text-neutral-400 font-medium">انقر للتفصيل</span>
                </div>
                <div className="space-y-2">
                  {(() => {
                    // Helper: compute period-aware sales/target for a group of sellers
                    function miniCard(id: string, name: string, sellers: typeof SELLERS[number][], onDrill?: () => void, noChevron = false) {
                      const idxs = sellers.map(s => SELLERS.indexOf(s));
                      const sales  = idxs.reduce((a, si) => a + sellerPeriodSales(si, year, month, period, selectedDay), 0);
                      const target = idxs.reduce((a, si) => a + sellerPeriodTarget(si, year, month, period), 0);
                      const pct = target > 0 ? Math.min(Math.round((sales / target) * 100), 130) : 0;
                      if (sales === 0 && target === 0) return null;
                      return noChevron ? (
                        <div key={id} className="flex items-center gap-3 px-2 py-1.5">
                          <div className="w-20 sm:w-32 shrink-0">
                            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 truncate block">{name}</span>
                            <span className="text-[11px] text-neutral-400 font-medium">{formatNum(sales)}</span>
                          </div>
                          <div className="flex-1 h-2 rounded-full bg-neutral-100 dark:bg-neutral-700 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: pctColor(pct) }} />
                          </div>
                          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-lg shrink-0 w-14 text-center", pctBg(pct))}>{pct}%</span>
                        </div>
                      ) : (
                        <button key={id} onClick={onDrill}
                          className="flex items-center gap-3 w-full text-right hover:bg-neutral-50 dark:bg-neutral-700 rounded-xl px-2 py-1.5 transition-colors group">
                          <div className="w-20 sm:w-32 shrink-0">
                            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 truncate block group-hover:text-[#B21063] transition-colors">{name}</span>
                            <span className="text-[11px] text-neutral-400 font-medium">{formatNum(sales)}</span>
                          </div>
                          <div className="flex-1 h-2 rounded-full bg-neutral-100 dark:bg-neutral-700 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: pctColor(pct) }} />
                          </div>
                          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-lg shrink-0 w-14 text-center", pctBg(pct))}>{pct}%</span>
                          <ChevronLeft className="w-3.5 h-3.5 text-neutral-300 group-hover:text-[#B21063] shrink-0 transition-colors" />
                        </button>
                      );
                    }

                    // Drill path takes priority
                    if (drillPath.length > 0) {
                      const last = drillPath[drillPath.length - 1];
                      if (currentDrillLevel === "areas") {
                        return AREAS.filter(a => a.regionId === last.id && filteredSellers.some(s => s.areaId === a.id))
                          .map(a => miniCard(a.id, a.name, filteredSellers.filter(s => s.areaId === a.id), () => drillInto("areas", a.id, a.name)));
                      }
                      if (currentDrillLevel === "supervisors") {
                        return SUPERVISORS.filter(sup => sup.areaId === last.id && filteredSellers.some(s => s.supervisorId === sup.id))
                          .map(sup => miniCard(sup.id, sup.name, filteredSellers.filter(s => s.supervisorId === sup.id), () => drillInto("supervisors", sup.id, sup.name)));
                      }
                      if (currentDrillLevel === "showrooms") {
                        return SHOWROOMS.filter(sh => sh.supervisorId === last.id && filteredSellers.some(s => s.showroomId === sh.id))
                          .map(sh => miniCard(sh.id, sh.name, filteredSellers.filter(s => s.showroomId === sh.id), () => drillInto("showrooms", sh.id, sh.name)));
                      }
                      if (currentDrillLevel === "sellers") {
                        return filteredSellers.filter(s => s.showroomId === last.id)
                          .map(s => miniCard(s.id, s.name, [s], () => drillInto("sellers", s.id, s.name)));
                      }
                      if (currentDrillLevel === "days") {
                        return filteredSellers.map(s => miniCard(s.id, s.name, [s], undefined, true));
                      }
                    }

                    // No drill path — filterType is primary
                    if (filterType === "areas") {
                      return AREAS.filter(a => filteredSellers.some(s => s.areaId === a.id))
                        .map(a => miniCard(a.id, a.name, filteredSellers.filter(s => s.areaId === a.id), () => drillInto("areas", a.id, a.name)));
                    }
                    if (filterType === "supervisors") {
                      return SUPERVISORS.filter(sup => filteredSellers.some(s => s.supervisorId === sup.id))
                        .map(sup => miniCard(sup.id, sup.name, filteredSellers.filter(s => s.supervisorId === sup.id), () => drillInto("supervisors", sup.id, sup.name)));
                    }
                    if (filterType === "showrooms") {
                      return SHOWROOMS.filter(sh => filteredSellers.some(s => s.showroomId === sh.id))
                        .map(sh => miniCard(sh.id, sh.name, filteredSellers.filter(s => s.showroomId === sh.id), () => drillInto("showrooms", sh.id, sh.name)));
                    }
                    if (filterType === "sellers") {
                      return filteredSellers.map(s => miniCard(s.id, s.name, [s], () => drillInto("sellers", s.id, s.name)));
                    }
                    // team tab — drill by most specific active filter
                    if (selectedSellers.size > 0) {
                      return filteredSellers.map(s => miniCard(s.id, s.name, [s], () => drillInto("sellers", s.id, s.name)));
                    }
                    if (selectedShowrooms.size > 0) {
                      return filteredSellers.map(s => miniCard(s.id, s.name, [s], () => drillInto("sellers", s.id, s.name)));
                    }
                    if (selectedSupervisors.size > 0) {
                      return SHOWROOMS.filter(sh => filteredSellers.some(s => s.showroomId === sh.id))
                        .map(sh => miniCard(sh.id, sh.name, filteredSellers.filter(s => s.showroomId === sh.id), () => drillInto("showrooms", sh.id, sh.name)));
                    }
                    if (selectedAreas.size > 0) {
                      return SUPERVISORS.filter(sup => filteredSellers.some(s => s.supervisorId === sup.id))
                        .map(sup => miniCard(sup.id, sup.name, filteredSellers.filter(s => s.supervisorId === sup.id), () => drillInto("supervisors", sup.id, sup.name)));
                    }
                    if (selectedRegions.size > 0) {
                      return AREAS.filter(a => filteredSellers.some(s => s.areaId === a.id))
                        .map(a => miniCard(a.id, a.name, filteredSellers.filter(s => s.areaId === a.id), () => drillInto("areas", a.id, a.name)));
                    }
                    // Default: all regions
                    return REGIONS.filter(r => filteredSellers.some(s => s.regionId === r.id))
                      .map(r => miniCard(r.id, r.name, filteredSellers.filter(s => s.regionId === r.id), () => drillInto("regions", r.id, r.name)));
                  })()}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── TABLE VIEW ── */}
          {viewMode === "table" && (
            <motion.div key="table" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
              className="space-y-4">

              {/* ── DAYS view (leaf level: show seller daily breakdown) ── */}
              {currentDrillLevel === "days" && drillPath.length > 0 && (() => {
                const selId = drillPath[drillPath.length - 1].id;
                const selIdx = SELLERS.findIndex(s => s.id === selId);
                const daysCount = getDaysInMonth(year, month);
                const dayRows = Array.from({ length: daysCount }, (_, i) => {
                  const d = i + 1;
                  const dayData = genSellerDayData(selIdx, year, month, d);
                  const daySales = dayData.reduce((s, h) => s + h.current, 0);
                  const prevDaySales = dayData.reduce((s, h) => s + h.prev, 0);
                  const dayTarget = sellerPeriodTarget(selIdx, year, month, "day");
                  const pct = dayTarget > 0 ? Math.round((daySales / dayTarget) * 100) : 0;
                  const dayName = DAYS_SHORT_AR[new Date(year, month, d).getDay()];
                  return { day: d, dayName, sales: daySales, prevSales: prevDaySales, target: dayTarget, pct };
                });
                return (
                  <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-700">
                      <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                        تقرير الأيام — {drillPath[drillPath.length - 1].name}
                      </h3>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">{MONTHS_AR[month]} {year}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[11px] sm:text-[13px]" style={{ minWidth: 520 }}>
                        <thead>
                          <tr className="bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-700">
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-right font-bold text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-xs sm:text-sm">اليوم</th>
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-right font-bold text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-xs sm:text-sm">التاريخ</th>
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-right font-bold text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-xs sm:text-sm">المبيعات</th>
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-right font-bold text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-xs sm:text-sm">الهدف</th>
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-right font-bold text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-xs sm:text-sm">السابق</th>
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-right font-bold text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-xs sm:text-sm">التحقيق</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dayRows.map((row, idx) => (
                            <tr key={row.day} className={cn("border-b border-neutral-50 transition-colors", idx % 2 === 0 ? "bg-white dark:bg-neutral-800" : "bg-neutral-50 dark:bg-neutral-700/30")}>
                              <td className="px-2 sm:px-3 py-2 sm:py-2.5 font-medium text-neutral-700 dark:text-neutral-300 whitespace-nowrap text-xs sm:text-sm">{row.dayName}</td>
                              <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-neutral-500 dark:text-neutral-400 tabular-nums whitespace-nowrap text-xs sm:text-sm">{row.day}/{month + 1}/{year}</td>
                              <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-neutral-700 dark:text-neutral-300 font-semibold tabular-nums text-xs sm:text-sm">{formatFull(Math.round(row.sales))}</td>
                              <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-neutral-500 dark:text-neutral-400 tabular-nums text-xs sm:text-sm">{formatFull(row.target)}</td>
                              <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-neutral-500 dark:text-neutral-400 tabular-nums text-xs sm:text-sm">{formatFull(Math.round(row.prevSales))}</td>
                              <td className="px-2 sm:px-3 py-2 sm:py-2">
                                <span className={cn("text-[12px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-lg", pctBg(row.pct))}>{row.pct}%</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-neutral-50 dark:bg-neutral-700 border-t-2 border-neutral-200 dark:border-neutral-600 font-bold">
                            <td className="px-2 sm:px-3 py-2 sm:py-3 text-neutral-800 dark:text-neutral-200 text-xs sm:text-sm" colSpan={2}>الإجمالي</td>
                            <td className="px-2 sm:px-3 py-2 sm:py-3 text-neutral-800 dark:text-neutral-200 tabular-nums text-xs sm:text-sm">{formatFull(Math.round(dayRows.reduce((s, r) => s + r.sales, 0)))}</td>
                            <td className="px-2 sm:px-3 py-2 sm:py-3 text-neutral-700 dark:text-neutral-300 tabular-nums text-xs sm:text-sm">{formatFull(dayRows.reduce((s, r) => s + r.target, 0))}</td>
                            <td className="px-2 sm:px-3 py-2 sm:py-3 text-neutral-700 dark:text-neutral-300 tabular-nums text-xs sm:text-sm">{formatFull(Math.round(dayRows.reduce((s, r) => s + r.prevSales, 0)))}</td>
                            <td className="px-2 sm:px-3 py-2 sm:py-2.5">
                              <span className={cn("text-[12px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-lg", pctBg(achievementPct))}>{achievementPct}%</span>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* ── Smart table: determined by most specific active filter ── */}
              {(() => {
                // Helper: aggregate period-aware KPIs for a set of seller indices
                const periodLabel = period === "day"
                  ? `يوم ${selectedDay} ${MONTHS_AR[month]} ${year}`
                  : period === "year" ? `سنة ${year}`
                  : `${MONTHS_AR[month]} ${year}`;

                function aggRows<T extends { id: string; name: string }>(
                  items: T[],
                  getSellers: (item: T) => typeof SELLERS[number][],
                  nextLevel: DrillLevel
                ): DrillRow[] {
                  return items.map(item => {
                    const ss = getSellers(item);
                    const idxs = ss.map(s => SELLERS.indexOf(s));
                    if (isFuturePeriod) {
                      const prevSales = idxs.reduce((a, si) => a + sellerPeriodPrevSales(si, year, month, period, selectedDay), 0);
                      return { id: item.id, name: item.name, regionName: undefined, areaName: undefined, supervisorName: undefined, showroomName: undefined, sales: 0, target: 0, prevSales, invoices: 0, pieces: 0, customers: 0, avgInvoice: 0, avgPiece: 0, nextLevel };
                    }
                    const sales     = idxs.reduce((a, si) => a + sellerPeriodSales(si, year, month, period, selectedDay), 0);
                    const target    = idxs.reduce((a, si) => a + sellerPeriodTarget(si, year, month, period), 0);
                    const prevSales = idxs.reduce((a, si) => a + sellerPeriodPrevSales(si, year, month, period, selectedDay), 0);
                    const invoices  = idxs.reduce((a, si) => a + scalePeriodCount(SELLERS[si].invoices, year, month, period), 0);
                    const pieces    = idxs.reduce((a, si) => a + scalePeriodCount(SELLERS[si].pieces, year, month, period), 0);
                    const customers = idxs.reduce((a, si) => a + scalePeriodCount(SELLERS[si].customers, year, month, period), 0);
                    const avgInvoice = invoices > 0 ? Math.round(sales / invoices) : 0;
                    const avgPiece   = invoices > 0 ? Math.round(pieces / invoices) : 0;
                    // Hierarchy context — infer from first seller
                    const rep = ss[0] as (typeof SELLERS[number]) | undefined;
                    const regionName     = (nextLevel === "areas" || nextLevel === "supervisors" || nextLevel === "showrooms" || nextLevel === "sellers")
                      ? REGIONS.find(r => r.id === (rep as any)?.regionId)?.name : undefined;
                    const areaName       = (nextLevel === "supervisors" || nextLevel === "showrooms" || nextLevel === "sellers")
                      ? AREAS.find(a => a.id === (rep as any)?.areaId)?.name : undefined;
                    const supervisorName = (nextLevel === "showrooms" || nextLevel === "sellers")
                      ? SUPERVISORS.find(s => s.id === (rep as any)?.supervisorId)?.name : undefined;
                    const showroomName   = (nextLevel === "sellers")
                      ? SHOWROOMS.find(s => s.id === (rep as any)?.showroomId)?.name : undefined;
                    return { id: item.id, name: item.name, regionName, areaName, supervisorName, showroomName, sales, target, prevSales, invoices, pieces, customers, avgInvoice, avgPiece, nextLevel };
                  }).filter(r => isFuturePeriod || r.sales > 0 || r.target > 0);
                }

                const commonProps = {
                  totalSales, totalTarget, totalPrevSales,
                  totalInvoices, totalPieces, totalCustomers,
                  achievementPct, sortKey, sortDir, toggleSort,
                  tablePage, setTablePage, totalPages,
                  mobileTableMode, setMobileTableMode,
                  searchQuery: tableSearch,
                  onClearSearch: () => setTableSearch(""),
                };

                // Drill path takes priority
                if (drillPath.length > 0) {
                  const last = drillPath[drillPath.length - 1];

                  if (last.level === "sellers" || currentDrillLevel === "days") return null; // handled above

                  if (currentDrillLevel === "areas") {
                    const items = AREAS.filter(a => a.regionId === last.id && filteredSellers.some(s => s.areaId === a.id));
                    return <DrillTable key="areas" title={`تقرير المناطق | ${last.name} | ${periodLabel}`} rowCount={items.length}
                      rows={aggRows(items, a => filteredSellers.filter(s => s.areaId === a.id), "areas")}
                      onDrill={(id, name) => drillInto("areas", id, name)} {...commonProps} nameLabel="المنطقة" />;
                  }
                  if (currentDrillLevel === "supervisors") {
                    const items = SUPERVISORS.filter(sup => sup.areaId === last.id && filteredSellers.some(s => s.supervisorId === sup.id));
                    return <DrillTable key="supervisors" title={`تقرير المشرفين | ${last.name} | ${periodLabel}`} rowCount={items.length}
                      rows={aggRows(items, sup => filteredSellers.filter(s => s.supervisorId === sup.id), "supervisors")}
                      onDrill={(id, name) => drillInto("supervisors", id, name)} {...commonProps} nameLabel="المشرف" />;
                  }
                  if (currentDrillLevel === "showrooms") {
                    const items = SHOWROOMS.filter(sh => sh.supervisorId === last.id && filteredSellers.some(s => s.showroomId === sh.id));
                    return <DrillTable key="showrooms" title={`تقرير المعارض | ${last.name} | ${periodLabel}`} rowCount={items.length}
                      rows={aggRows(items, sh => filteredSellers.filter(s => s.showroomId === sh.id), "showrooms")}
                      onDrill={(id, name) => drillInto("showrooms", id, name)} {...commonProps} nameLabel="المعرض" />;
                  }
                  if (currentDrillLevel === "sellers") {
                    const items = filteredSellers.filter(s => s.showroomId === last.id);
                    return <DrillTable key="sellers" title={`تقرير البائعين | ${last.name} | ${periodLabel}`} rowCount={items.length}
                      rows={aggRows(items, s => [s], "sellers")}
                      onDrill={(id, name) => drillInto("sellers", id, name)} {...commonProps} nameLabel="البائع" drillLabel="الأيام" />;
                  }
                }

                // No drill path — filterType is primary
                if (filterType === "areas") {
                  const areaItems = AREAS.filter(a => filteredSellers.some(s => s.areaId === a.id));
                  return <DrillTable key="all-areas" title={`تقرير المناطق | ${periodLabel}`} rowCount={areaItems.length}
                    rows={aggRows(areaItems, a => filteredSellers.filter(s => s.areaId === a.id), "areas")}
                    onDrill={(id, name) => drillInto("areas", id, name)} {...commonProps} nameLabel="المنطقة" />;
                }
                if (filterType === "supervisors") {
                  const supItems = SUPERVISORS.filter(sup => filteredSellers.some(s => s.supervisorId === sup.id));
                  return <DrillTable key="all-supervisors" title={`تقرير المشرفين | ${periodLabel}`} rowCount={supItems.length}
                    rows={aggRows(supItems, sup => filteredSellers.filter(s => s.supervisorId === sup.id), "supervisors")}
                    onDrill={(id, name) => drillInto("supervisors", id, name)} {...commonProps} nameLabel="المشرف" />;
                }
                if (filterType === "sellers") {
                  return <DrillTable key="all-sellers" title={`تقرير البائعين | ${periodLabel}`} rowCount={filteredSellers.length}
                    rows={aggRows(filteredSellers, s => [s], "sellers")}
                    onDrill={(id, name) => drillInto("sellers", id, name)} {...commonProps} nameLabel="البائع" drillLabel="الأيام" />;
                }
                if (filterType === "showrooms") {
                  const showroomItems = SHOWROOMS.filter(sh => filteredSellers.some(s => s.showroomId === sh.id));
                  return <DrillTable key="all-showrooms" title={`تقرير المعارض | ${periodLabel}`} rowCount={showroomItems.length}
                    rows={aggRows(showroomItems, sh => filteredSellers.filter(s => s.showroomId === sh.id), "showrooms")}
                    onDrill={(id, name) => drillInto("showrooms", id, name)} {...commonProps} nameLabel="المعرض" />;
                }

                // team tab: cascade by most specific active multi-filter
                if (selectedSellers.size > 0 || selectedShowrooms.size > 0) {
                  return <DrillTable key="filtered-sellers" title="تقرير البائعين المحددين" rowCount={filteredSellers.length}
                    rows={aggRows(filteredSellers, s => [s], "sellers")}
                    onDrill={(id, name) => drillInto("sellers", id, name)} {...commonProps} nameLabel="البائع" drillLabel="الأيام" />;
                }
                if (selectedSupervisors.size > 0) {
                  const showroomItems = SHOWROOMS.filter(sh => filteredSellers.some(s => s.showroomId === sh.id));
                  return <DrillTable key="sup-showrooms" title="تقرير معارض المشرفين المحددين" rowCount={showroomItems.length}
                    rows={aggRows(showroomItems, sh => filteredSellers.filter(s => s.showroomId === sh.id), "showrooms")}
                    onDrill={(id, name) => drillInto("showrooms", id, name)} {...commonProps} nameLabel="المعرض" />;
                }
                if (selectedAreas.size > 0) {
                  const supItems = SUPERVISORS.filter(sup => filteredSellers.some(s => s.supervisorId === sup.id));
                  return <DrillTable key="area-supervisors" title="تقرير مشرفي المناطق المحددة" rowCount={supItems.length}
                    rows={aggRows(supItems, sup => filteredSellers.filter(s => s.supervisorId === sup.id), "supervisors")}
                    onDrill={(id, name) => drillInto("supervisors", id, name)} {...commonProps} nameLabel="المشرف" />;
                }
                if (selectedRegions.size > 0) {
                  const areaItems = AREAS.filter(a => filteredSellers.some(s => s.areaId === a.id));
                  return <DrillTable key="region-areas" title="تقرير مناطق الأقاليم المحددة" rowCount={areaItems.length}
                    rows={aggRows(areaItems, a => filteredSellers.filter(s => s.areaId === a.id), "areas")}
                    onDrill={(id, name) => drillInto("areas", id, name)} {...commonProps} nameLabel="المنطقة" />;
                }

                // team default: all regions
                const regionItems = REGIONS.filter(r => filteredSellers.some(s => s.regionId === r.id));
                return <DrillTable key="regions" title={`تقرير الأقاليم | ${periodLabel}`} rowCount={regionItems.length}
                  rows={aggRows(regionItems, r => filteredSellers.filter(s => s.regionId === r.id), "regions")}
                  onDrill={(id, name) => drillInto("regions", id, name)} {...commonProps} nameLabel="الإقليم" />;
              })()}

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
