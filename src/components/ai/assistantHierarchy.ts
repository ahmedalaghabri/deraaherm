// ═══════════════════════════════════════════════════════════════
// Hierarchy Query Layer — يقرأ نفس بيانات صفحة أداء المبيعات
// 10 أقاليم · 25 منطقة · 100 مشرف · 500 معرض · 500 بائع
// الأرقام محسوبة بنفس دوال الصفحة (فترة يوم/شهر/سنة أو مدى تواريخ)
// ═══════════════════════════════════════════════════════════════

import {
  REGIONS,
  AREAS,
  SUPERVISORS,
  SHOWROOMS,
  SELLERS,
  sellerPeriodSales,
  sellerPeriodPrevSales,
  sellerPeriodTarget,
  scalePeriodCount,
  sellerRangeSales,
  sellerRangePrevSales,
  sellerRangeTarget,
  scaleRangeCount,
} from "../SalesPerformancePage";

type Seller = (typeof SELLERS)[number];

// فهرس سريع: معرف البائع → موقعه في المصفوفة
const SELLER_IDX = new Map<string, number>(SELLERS.map((s, i) => [s.id, i]));

// ── الفترة الزمنية ────────────────────────────────────────────
export interface PeriodOpts {
  year?: number;
  month?: number; // 1-12
  period?: string; // "day" | "month" | "year"
  day?: number;
  fromDate?: string; // YYYY-MM-DD → وضع المدى
  toDate?: string;
}

type Resolved =
  | { mode: "period"; year: number; month0: number; period: "day" | "month" | "year"; day: number; label: string }
  | { mode: "range"; from: string; to: string; label: string };

const MONTH_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

function resolvePeriod(o: PeriodOpts | undefined): Resolved {
  const now = new Date();
  if (o?.fromDate && o?.toDate) {
    return { mode: "range", from: o.fromDate, to: o.toDate, label: `من ${o.fromDate} إلى ${o.toDate}` };
  }
  const year = o?.year ?? now.getFullYear();
  const month0 = o?.month ? Math.min(12, Math.max(1, o.month)) - 1 : now.getMonth();
  const period = (o?.period === "day" || o?.period === "year" ? o.period : "month") as "day" | "month" | "year";
  const day = o?.day ?? now.getDate();
  const label =
    period === "year" ? `سنة ${year}`
    : period === "day" ? `يوم ${day} ${MONTH_AR[month0]} ${year}`
    : `${MONTH_AR[month0]} ${year}`;
  return { mode: "period", year, month0, period, day, label };
}

// ── حسابات بائع واحد وفق الفترة (نفس دوال الصفحة) ────────────
function sSales(i: number, r: Resolved): number {
  return r.mode === "range" ? sellerRangeSales(i, r.from, r.to) : sellerPeriodSales(i, r.year, r.month0, r.period, r.day);
}
function sPrev(i: number, r: Resolved): number {
  return r.mode === "range" ? sellerRangePrevSales(i, r.from, r.to) : sellerPeriodPrevSales(i, r.year, r.month0, r.period, r.day);
}
function sTarget(i: number, r: Resolved): number {
  return r.mode === "range" ? sellerRangeTarget(i, r.from, r.to) : sellerPeriodTarget(i, r.year, r.month0, r.period);
}
function sCount(base: number, r: Resolved): number {
  return r.mode === "range" ? scaleRangeCount(base, r.from, r.to) : scalePeriodCount(base, r.year, r.month0, r.period);
}

// ── تجميع مؤشرات مجموعة بائعين ────────────────────────────────
function aggregate(sellers: Seller[], r: Resolved) {
  let sales = 0, target = 0, prev = 0, invoices = 0, pieces = 0, customers = 0;
  for (const s of sellers) {
    const i = SELLER_IDX.get(s.id)!;
    sales += sSales(i, r);
    target += sTarget(i, r);
    prev += sPrev(i, r);
    invoices += sCount(s.invoices, r);
    pieces += sCount(s.pieces, r);
    customers += sCount(s.customers, r);
  }
  sales = Math.round(sales);
  prev = Math.round(prev);
  target = Math.round(target);
  return {
    salesSAR: sales,
    targetSAR: target,
    achievementPct: target > 0 ? Math.round((sales / target) * 100) : 0,
    prevPeriodSalesSAR: prev,
    growthPct: prev > 0 ? Math.round(((sales - prev) / prev) * 100) : 0,
    invoices,
    avgInvoiceSAR: invoices > 0 ? Math.round(sales / invoices) : 0,
    pieces,
    customers,
    sellersCount: sellers.length,
  };
}

function sellerDetails(s: Seller, r: Resolved) {
  const i = SELLER_IDX.get(s.id)!;
  const sales = Math.round(sSales(i, r));
  const target = Math.round(sTarget(i, r));
  const prev = Math.round(sPrev(i, r));
  const invoices = sCount(s.invoices, r);
  const pieces = sCount(s.pieces, r);
  return {
    name: s.name,
    showroom: SHOWROOMS.find(x => x.id === s.showroomId)?.name,
    supervisor: SUPERVISORS.find(x => x.id === s.supervisorId)?.name,
    area: AREAS.find(x => x.id === s.areaId)?.name,
    region: REGIONS.find(x => x.id === s.regionId)?.name,
    salesSAR: sales,
    targetSAR: target,
    achievementPct: target > 0 ? Math.round((sales / target) * 100) : 0,
    prevPeriodSalesSAR: prev,
    growthPct: prev > 0 ? Math.round(((sales - prev) / prev) * 100) : 0,
    invoices,
    avgInvoiceSAR: invoices > 0 ? Math.round(sales / invoices) : 0,
    pieces,
    customers: sCount(s.customers, r),
  };
}

// ── مطابقة أسماء عربية مرنة ───────────────────────────────────
function norm(s: string): string {
  return (s ?? "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ًٌٍَُِّْ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
function matches(hay: string, needle: string): boolean {
  const h = norm(hay);
  const n = norm(needle);
  return h === n || h.includes(n) || n.includes(h);
}

function findRegion(name: string) { return REGIONS.find(r => matches(r.name, name)) ?? null; }
function findArea(name: string) { return AREAS.find(a => matches(a.name, name)) ?? null; }
function findSupervisor(name: string) { return SUPERVISORS.find(s => matches(s.name, name)) ?? null; }
function findShowroom(name: string) { return SHOWROOMS.find(s => matches(s.name, name)) ?? null; }
function findSellersByName(name: string) { return SELLERS.filter(s => matches(s.name, name)); }

// تصفية بائعين حسب أي مستوى بالاسم
function filterSellers(f: { regionName?: string; areaName?: string; supervisorName?: string; showroomName?: string }): { sellers: Seller[]; error?: string } {
  let sellers = SELLERS as Seller[];
  if (f.regionName) {
    const r = findRegion(f.regionName);
    if (!r) return { sellers: [], error: `إقليم غير موجود: ${f.regionName}` };
    sellers = sellers.filter(s => s.regionId === r.id);
  }
  if (f.areaName) {
    const a = findArea(f.areaName);
    if (!a) return { sellers: [], error: `منطقة غير موجودة: ${f.areaName}` };
    sellers = sellers.filter(s => s.areaId === a.id);
  }
  if (f.supervisorName) {
    const sup = findSupervisor(f.supervisorName);
    if (!sup) return { sellers: [], error: `مشرف غير موجود: ${f.supervisorName}` };
    sellers = sellers.filter(s => s.supervisorId === sup.id);
  }
  if (f.showroomName) {
    const sh = findShowroom(f.showroomName);
    if (!sh) return { sellers: [], error: `معرض غير موجود: ${f.showroomName}` };
    sellers = sellers.filter(s => s.showroomId === sh.id);
  }
  return { sellers };
}

// ═══ الأدوات العامة ═══════════════════════════════════════════

/** ملخص الهيكل التنظيمي الكامل */
export function orgStructure(opts?: PeriodOpts) {
  const r = resolvePeriod(opts);
  return {
    period: r.label,
    regionsCount: REGIONS.length,
    areasCount: AREAS.length,
    supervisorsCount: SUPERVISORS.length,
    showroomsCount: SHOWROOMS.length,
    sellersCount: SELLERS.length,
    totals: aggregate(SELLERS, r),
    regions: REGIONS.map(rg => ({
      name: rg.name,
      areas: AREAS.filter(a => a.regionId === rg.id).map(a => a.name),
    })),
  };
}

/** الأقاليم مع مؤشراتها */
export function listRegions(opts?: PeriodOpts) {
  const r = resolvePeriod(opts);
  return {
    period: r.label,
    count: REGIONS.length,
    regions: REGIONS.map(rg => {
      const sellers = SELLERS.filter(s => s.regionId === rg.id);
      return {
        name: rg.name,
        areasCount: AREAS.filter(a => a.regionId === rg.id).length,
        supervisorsCount: SUPERVISORS.filter(s => s.regionId === rg.id).length,
        showroomsCount: SHOWROOMS.filter(s => s.regionId === rg.id).length,
        ...aggregate(sellers, r),
      };
    }),
  };
}

/** المناطق (كلها أو داخل إقليم) مع مؤشراتها */
export function listAreas(regionName?: string, opts?: PeriodOpts) {
  const r = resolvePeriod(opts);
  let areas = AREAS;
  if (regionName) {
    const rg = findRegion(regionName);
    if (!rg) return { error: `إقليم غير موجود: ${regionName}`, availableRegions: REGIONS.map(x => x.name) };
    areas = AREAS.filter(a => a.regionId === rg.id);
  }
  return {
    period: r.label,
    count: areas.length,
    areas: areas.map(a => {
      const sellers = SELLERS.filter(s => s.areaId === a.id);
      return {
        name: a.name,
        region: REGIONS.find(x => x.id === a.regionId)?.name,
        supervisorsCount: SUPERVISORS.filter(s => s.areaId === a.id).length,
        showroomsCount: SHOWROOMS.filter(s => s.areaId === a.id).length,
        ...aggregate(sellers, r),
      };
    }),
  };
}

/** المشرفون (بتصفية اختيارية) مع مؤشرات فرقهم */
export function listSupervisors(args: { regionName?: string; areaName?: string; limit?: number; offset?: number } & PeriodOpts) {
  const r = resolvePeriod(args);
  let sups = SUPERVISORS;
  if (args.regionName) {
    const rg = findRegion(args.regionName);
    if (!rg) return { error: `إقليم غير موجود: ${args.regionName}`, availableRegions: REGIONS.map(x => x.name) };
    sups = sups.filter(s => s.regionId === rg.id);
  }
  if (args.areaName) {
    const a = findArea(args.areaName);
    if (!a) return { error: `منطقة غير موجودة: ${args.areaName}`, availableAreas: AREAS.map(x => x.name) };
    sups = sups.filter(s => s.areaId === a.id);
  }
  const offset = Math.max(0, args.offset ?? 0);
  const limit = Math.min(50, Math.max(1, args.limit ?? 20));
  const page = sups.slice(offset, offset + limit);
  return {
    period: r.label,
    totalCount: sups.length,
    returned: page.length,
    offset,
    supervisors: page.map(sup => {
      const sellers = SELLERS.filter(s => s.supervisorId === sup.id);
      return {
        name: sup.name,
        area: AREAS.find(a => a.id === sup.areaId)?.name,
        region: REGIONS.find(x => x.id === sup.regionId)?.name,
        showroomsCount: SHOWROOMS.filter(s => s.supervisorId === sup.id).length,
        ...aggregate(sellers, r),
      };
    }),
  };
}

/** المعارض (بتصفية اختيارية) مع بائعها ومؤشراتها */
export function listShowrooms(args: { regionName?: string; areaName?: string; supervisorName?: string; limit?: number; offset?: number } & PeriodOpts) {
  const r = resolvePeriod(args);
  let shs = SHOWROOMS;
  if (args.regionName) {
    const rg = findRegion(args.regionName);
    if (!rg) return { error: `إقليم غير موجود: ${args.regionName}`, availableRegions: REGIONS.map(x => x.name) };
    shs = shs.filter(s => s.regionId === rg.id);
  }
  if (args.areaName) {
    const a = findArea(args.areaName);
    if (!a) return { error: `منطقة غير موجودة: ${args.areaName}`, availableAreas: AREAS.map(x => x.name) };
    shs = shs.filter(s => s.areaId === a.id);
  }
  if (args.supervisorName) {
    const sup = findSupervisor(args.supervisorName);
    if (!sup) return { error: `مشرف غير موجود: ${args.supervisorName}` };
    shs = shs.filter(s => s.supervisorId === sup.id);
  }
  const offset = Math.max(0, args.offset ?? 0);
  const limit = Math.min(50, Math.max(1, args.limit ?? 20));
  const page = shs.slice(offset, offset + limit);
  return {
    period: r.label,
    totalCount: shs.length,
    returned: page.length,
    offset,
    showrooms: page.map(sh => {
      const sellers = SELLERS.filter(s => s.showroomId === sh.id);
      return {
        name: sh.name,
        supervisor: SUPERVISORS.find(x => x.id === sh.supervisorId)?.name,
        area: AREAS.find(x => x.id === sh.areaId)?.name,
        region: REGIONS.find(x => x.id === sh.regionId)?.name,
        sellers: sellers.map(s => s.name),
        ...aggregate(sellers, r),
      };
    }),
  };
}

/** البائعون (بتصفية وترتيب) بتفاصيلهم الكاملة */
export function listSellers(args: {
  regionName?: string; areaName?: string; supervisorName?: string; showroomName?: string;
  sortBy?: string; order?: string; limit?: number; offset?: number;
} & PeriodOpts) {
  const r = resolvePeriod(args);
  const { sellers, error } = filterSellers(args);
  if (error) return { error };
  const rows = sellers.map(s => sellerDetails(s, r));
  const keyMap: Record<string, keyof (typeof rows)[number]> = {
    sales: "salesSAR", target: "targetSAR", prevSales: "prevPeriodSalesSAR",
    achievement: "achievementPct", growth: "growthPct",
    invoices: "invoices", avgInvoice: "avgInvoiceSAR", pieces: "pieces", customers: "customers",
  };
  const key = keyMap[args.sortBy ?? "sales"] ?? "salesSAR";
  const dir = args.order === "asc" ? 1 : -1;
  rows.sort((a, b) => (Number(a[key]) - Number(b[key])) * dir);
  const offset = Math.max(0, args.offset ?? 0);
  const limit = Math.min(50, Math.max(1, args.limit ?? 20));
  return {
    period: r.label,
    totalCount: sellers.length,
    returned: Math.min(limit, rows.length - offset),
    offset,
    aggregate: aggregate(sellers, r),
    sellers: rows.slice(offset, offset + limit),
  };
}

/** بحث عن أي كيان بالاسم عبر كل المستويات */
export function findEntity(name: string, opts?: PeriodOpts) {
  const r = resolvePeriod(opts);
  const results: Record<string, unknown>[] = [];
  const rg = findRegion(name);
  if (rg) {
    results.push({
      type: "إقليم", name: rg.name, period: r.label,
      areas: AREAS.filter(a => a.regionId === rg.id).map(a => a.name),
      ...aggregate(SELLERS.filter(s => s.regionId === rg.id), r),
    });
  }
  const a = findArea(name);
  if (a) {
    results.push({
      type: "منطقة", name: a.name, period: r.label,
      region: REGIONS.find(x => x.id === a.regionId)?.name,
      supervisors: SUPERVISORS.filter(s => s.areaId === a.id).map(s => s.name),
      showroomsCount: SHOWROOMS.filter(s => s.areaId === a.id).length,
      ...aggregate(SELLERS.filter(s => s.areaId === a.id), r),
    });
  }
  const sup = findSupervisor(name);
  if (sup) {
    results.push({
      type: "مشرف", name: sup.name, period: r.label,
      area: AREAS.find(x => x.id === sup.areaId)?.name,
      region: REGIONS.find(x => x.id === sup.regionId)?.name,
      showrooms: SHOWROOMS.filter(s => s.supervisorId === sup.id).map(s => s.name),
      ...aggregate(SELLERS.filter(s => s.supervisorId === sup.id), r),
    });
  }
  const sh = findShowroom(name);
  if (sh) {
    const sellers = SELLERS.filter(s => s.showroomId === sh.id);
    results.push({
      type: "معرض", name: sh.name, period: r.label,
      supervisor: SUPERVISORS.find(x => x.id === sh.supervisorId)?.name,
      area: AREAS.find(x => x.id === sh.areaId)?.name,
      region: REGIONS.find(x => x.id === sh.regionId)?.name,
      ...aggregate(sellers, r),
      sellers: sellers.map(s => sellerDetails(s, r)),
    });
  }
  for (const s of findSellersByName(name).slice(0, 5)) {
    results.push({ type: "بائع", period: r.label, ...sellerDetails(s, r) });
  }
  if (results.length === 0) return { error: `لا يوجد كيان بهذا الاسم: ${name}` };
  return { matchesCount: results.length, results };
}

/** الترتيب: الأفضل/الأسوأ على أي مستوى وبأي مؤشر */
export function topPerformers(args: { level: string; metric?: string; order?: string; limit?: number } & PeriodOpts) {
  const r = resolvePeriod(args);
  const metric = args.metric ?? "sales";
  const order = args.order === "asc" ? "asc" : "desc";
  const limit = Math.min(50, Math.max(1, args.limit ?? 10));

  type Row = { name: string; parent?: string } & ReturnType<typeof aggregate>;
  let rows: Row[] = [];

  if (args.level === "sellers") {
    rows = SELLERS.map(s => ({
      name: s.name,
      parent: SHOWROOMS.find(x => x.id === s.showroomId)?.name,
      ...aggregate([s], r),
    }));
  } else if (args.level === "showrooms") {
    rows = SHOWROOMS.map(sh => ({
      name: sh.name,
      parent: AREAS.find(x => x.id === sh.areaId)?.name,
      ...aggregate(SELLERS.filter(s => s.showroomId === sh.id), r),
    }));
  } else if (args.level === "supervisors") {
    rows = SUPERVISORS.map(sup => ({
      name: sup.name,
      parent: AREAS.find(x => x.id === sup.areaId)?.name,
      ...aggregate(SELLERS.filter(s => s.supervisorId === sup.id), r),
    }));
  } else if (args.level === "areas") {
    rows = AREAS.map(a => ({
      name: a.name,
      parent: REGIONS.find(x => x.id === a.regionId)?.name,
      ...aggregate(SELLERS.filter(s => s.areaId === a.id), r),
    }));
  } else if (args.level === "regions") {
    rows = REGIONS.map(rg => ({
      name: rg.name,
      ...aggregate(SELLERS.filter(s => s.regionId === rg.id), r),
    }));
  } else {
    return { error: `مستوى غير صالح: ${args.level}. المستويات: regions, areas, supervisors, showrooms, sellers` };
  }

  const metricMap: Record<string, keyof Row> = {
    sales: "salesSAR",
    target: "targetSAR",
    achievement: "achievementPct",
    growth: "growthPct",
    invoices: "invoices",
    avgInvoice: "avgInvoiceSAR",
    pieces: "pieces",
    customers: "customers",
  };
  const mKey = metricMap[metric] ?? "salesSAR";
  rows.sort((a, b) => (Number(b[mKey]) - Number(a[mKey])) * (order === "desc" ? 1 : -1));

  return {
    period: r.label,
    level: args.level,
    metric,
    order,
    items: rows.slice(0, limit).map((row, i) => ({ rank: i + 1, ...row })),
  };
}
