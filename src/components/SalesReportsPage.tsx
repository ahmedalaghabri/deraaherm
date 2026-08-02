import React, { useState, useMemo } from "react";
import { ChevronRight, ChevronLeft, Download, SlidersHorizontal, ArrowUpDown, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const MONTHS_AR = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

function formatFull(n: number) {
  return n.toLocaleString("en-US");
}

function pctColor(pct: number) {
  if (pct >= 100) return "bg-emerald-100 text-emerald-700";
  if (pct >= 80) return "bg-blue-100 text-blue-700";
  if (pct >= 60) return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

const rawData = [
  { name: "الرياض - العليا", region: "إقليم الرياض", customers: 74, sales6: 571194, target6: 510878, achievement6: 111.8, achieved: true, salesMar: 340488, pieces: 5533, avgPiece: 103, avgPieceSar: 2.8, invoices: 1994, avgInvoice: 286 },
  { name: "الدمام - الراشد", region: "إقليم الخليج", customers: 37, sales6: 167240, target6: 150639, achievement6: 111.0, achieved: true, salesMar: 37977, pieces: 1394, avgPiece: 120, avgPieceSar: 3.0, invoices: 465, avgInvoice: 360 },
  { name: "جدة - الأندلس", region: "إقليم الغربية", customers: 84, sales6: 331841, target6: 441309, achievement6: 75.2, achieved: false, salesMar: 212241, pieces: 7280, avgPiece: 46, avgPieceSar: 2.7, invoices: 2673, avgInvoice: 124 },
];

const COLUMNS = [
  { key: "name", label: "المعرض" },
  { key: "customers", label: "المعارض" },
  { key: "region", label: "الوصف" },
  { key: "sales6", label: "مبيعات 6 مارس" },
  { key: "target6", label: "مستهدف 6 مارس" },
  { key: "achievement6", label: "تحقيق 6 مارس %" },
  { key: "achieved", label: "متبقي 6 مارس" },
  { key: "invoices", label: "الفواتير" },
  { key: "avgInvoice", label: "م.الفاتورة" },
  { key: "pieces", label: "القطع" },
  { key: "avgPiece", label: "م.عدد القطع" },
  { key: "avgPieceSar", label: "م.س.القطعة" },
  { key: "salesMar", label: "مبيعات 1 مارس ٢٠٢٥" },
];

const MOBILE_PRIMARY_COLS = ["name", "sales6", "achievement6", "achieved"];

interface Props {
  onBack?: () => void;
}

export default function SalesReportsPage({ onBack }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [sortKey, setSortKey] = useState<string>("sales6");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [visibleCols, setVisibleCols] = useState<Set<string>>(new Set(COLUMNS.map(c => c.key)));
  const [showColPicker, setShowColPicker] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setPage(1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setPage(1);
  }

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  function toggleRow(i: number) {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  const sorted = useMemo(() => {
    return [...rawData].sort((a, b) => {
      const av = (a as any)[sortKey];
      const bv = (b as any)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv), "ar") : String(bv).localeCompare(String(av), "ar");
    });
  }, [sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const totals = {
    customers: rawData.reduce((s, r) => s + r.customers, 0),
    sales6: rawData.reduce((s, r) => s + r.sales6, 0),
    target6: rawData.reduce((s, r) => s + r.target6, 0),
    achievement6: Math.round(rawData.reduce((s, r) => s + r.sales6, 0) / rawData.reduce((s, r) => s + r.target6, 0) * 100 * 10) / 10,
    invoices: rawData.reduce((s, r) => s + r.invoices, 0),
    avgInvoice: Math.round(rawData.reduce((s, r) => s + r.avgInvoice, 0) / rawData.length),
    pieces: rawData.reduce((s, r) => s + r.pieces, 0),
    avgPiece: Math.round(rawData.reduce((s, r) => s + r.avgPiece, 0) / rawData.length * 10) / 10,
    avgPieceSar: Math.round(rawData.reduce((s, r) => s + r.avgPieceSar, 0) / rawData.length * 10) / 10,
    salesMar: rawData.reduce((s, r) => s + r.salesMar, 0),
  };

  function renderCell(row: typeof rawData[0], key: string) {
    if (key === "achievement6") {
      const pct = row.achievement6;
      return (
        <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-0.5", pctColor(pct))}>
          {pct}%
          {pct >= 100 ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
        </span>
      );
    }
    if (key === "achieved") {
      return row.achieved ? (
        <span className="text-emerald-600 font-bold text-xs">محقق</span>
      ) : (
        <span className="text-amber-600 font-semibold text-xs">{formatFull(row.sales6)}</span>
      );
    }
    const val = (row as any)[key];
    if (typeof val === "number") return <span className="text-xs">{formatFull(val)}</span>;
    return <span className="text-xs">{val}</span>;
  }

  function renderTotal(key: string) {
    if (key === "name") return <span className="text-xs font-bold">الإجمالي</span>;
    if (key === "region") return null;
    if (key === "achievement6") {
      return (
        <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-0.5", pctColor(totals.achievement6))}>
          {totals.achievement6}%
          <AlertCircle className="h-3 w-3" />
        </span>
      );
    }
    if (key === "achieved") return <span className="text-amber-600 font-semibold text-xs">{formatFull(totals.sales6)}</span>;
    const val = (totals as any)[key];
    if (val === undefined) return null;
    return <span className="text-xs font-bold">{formatFull(val)}</span>;
  }

  const activeCols = COLUMNS.filter(c => visibleCols.has(c.key));

  return (
    <div dir="rtl" className="px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto pb-24 md:pb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100">التقارير التفصيلية</h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Multi-Region Sales Report | 6 {MONTHS_AR[month]} {year}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Month Nav */}
          <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-2 py-1.5">
            <button onClick={prevMonth} className="p-1 hover:bg-neutral-100 rounded-lg">
              <ChevronRight className="h-4 w-4 text-neutral-500" />
            </button>
            <span className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-200 px-1 min-w-[70px] sm:min-w-[80px] text-center">
              {MONTHS_AR[month]} {year}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-neutral-100 rounded-lg">
              <ChevronLeft className="h-4 w-4 text-neutral-500" />
            </button>
          </div>

          {/* Column Toggle — desktop only */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowColPicker(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>الأعمدة</span>
            </button>
            {showColPicker && (
              <div className="absolute left-0 top-10 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl p-3 z-50 min-w-[200px]">
                <div className="text-xs font-bold text-neutral-500 mb-2">إظهار/إخفاء الأعمدة</div>
                {COLUMNS.map(c => (
                  <label key={c.key} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-neutral-50 rounded-lg px-1">
                    <input
                      type="checkbox"
                      checked={visibleCols.has(c.key)}
                      onChange={() => {
                        const next = new Set(visibleCols);
                        if (next.has(c.key)) { if (next.size > 3) next.delete(c.key); }
                        else next.add(c.key);
                        setVisibleCols(next);
                      }}
                      className="accent-[#B21063]"
                    />
                    <span className="text-xs text-neutral-700 dark:text-neutral-200">{c.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Export */}
          <button className="flex items-center gap-1.5 px-3 py-2 bg-[#B21063] text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#9a0d55] transition-colors">
            <Download className="h-4 w-4" />
            <span>تصدير</span>
          </button>
        </div>
      </div>

      {/* ===== Mobile Card View ===== */}
      <div className="sm:hidden space-y-3 mb-4">
        {paged.map((row, i) => {
          const isExpanded = expandedRows.has(i);
          return (
            <div key={i} className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
              <button
                className="w-full text-right px-4 py-3 flex items-center justify-between gap-2"
                onClick={() => toggleRow(i)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-neutral-800 dark:text-neutral-100 text-sm truncate">{row.name}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">{row.region}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", pctColor(row.achievement6))}>
                    {row.achievement6}%
                  </span>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-neutral-400" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
                </div>
              </button>

              {/* Summary always visible */}
              <div className="px-4 pb-3 grid grid-cols-2 gap-2">
                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-2.5">
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-0.5">المبيعات</div>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">{formatFull(row.sales6)}</div>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-2.5">
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-0.5">المستهدف</div>
                  <div className="font-semibold text-neutral-600 dark:text-neutral-300 text-sm">{formatFull(row.target6)}</div>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-neutral-100 dark:border-neutral-800 pt-3 grid grid-cols-2 gap-2">
                  <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-2.5">
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-0.5">المعارض</div>
                    <div className="font-semibold text-neutral-700 dark:text-neutral-200 text-sm">{row.customers}</div>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-2.5">
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-0.5">الفواتير</div>
                    <div className="font-semibold text-neutral-700 dark:text-neutral-200 text-sm">{formatFull(row.invoices)}</div>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-2.5">
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-0.5">القطع</div>
                    <div className="font-semibold text-neutral-700 dark:text-neutral-200 text-sm">{formatFull(row.pieces)}</div>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-2.5">
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-0.5">م. الفاتورة</div>
                    <div className="font-semibold text-neutral-700 dark:text-neutral-200 text-sm">{formatFull(row.avgInvoice)}</div>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-2.5">
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-0.5">م. عدد القطع</div>
                    <div className="font-semibold text-neutral-700 dark:text-neutral-200 text-sm">{row.avgPiece}</div>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-2.5">
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-0.5">مبيعات مارس</div>
                    <div className="font-semibold text-neutral-700 dark:text-neutral-200 text-sm">{formatFull(row.salesMar)}</div>
                  </div>
                  <div className="col-span-2 bg-neutral-50 dark:bg-neutral-900 rounded-xl p-2.5">
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-1">متبقي 6 مارس</div>
                    <div>{row.achieved ? <span className="text-emerald-600 font-bold text-sm">محقق</span> : <span className="text-amber-600 font-semibold text-sm">{formatFull(row.sales6)}</span>}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Mobile Totals Card */}
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-neutral-800 dark:text-neutral-100 text-sm">الإجمالي</span>
            <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", pctColor(totals.achievement6))}>
              {totals.achievement6}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-2.5 border border-neutral-100 dark:border-neutral-800">
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-0.5">إجمالي المبيعات</div>
              <div className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">{formatFull(totals.sales6)}</div>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-2.5 border border-neutral-100 dark:border-neutral-800">
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-0.5">إجمالي الهدف</div>
              <div className="font-semibold text-neutral-600 dark:text-neutral-300 text-sm">{formatFull(totals.target6)}</div>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-2.5 border border-neutral-100 dark:border-neutral-800">
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-0.5">الفواتير</div>
              <div className="font-semibold text-neutral-700 dark:text-neutral-200 text-sm">{formatFull(totals.invoices)}</div>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-2.5 border border-neutral-100 dark:border-neutral-800">
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-0.5">القطع</div>
              <div className="font-semibold text-neutral-700 dark:text-neutral-200 text-sm">{formatFull(totals.pieces)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Desktop Table View ===== */}
      <div className="hidden sm:block bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
                {activeCols.map(col => (
                  <th
                    key={col.key}
                    className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 whitespace-nowrap cursor-pointer hover:bg-neutral-100 select-none"
                    onClick={() => toggleSort(col.key)}
                  >
                    <span className="flex items-center justify-between gap-1 w-full">
                      <ArrowUpDown className={cn("h-3 w-3 order-last opacity-40 transition-opacity", sortKey === col.key && "opacity-100 text-[#B21063]")} />
                      <span>{col.label}</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {paged.map((row, i) => (
                <tr key={i} className="hover:bg-neutral-50 transition-colors">
                  {activeCols.map(col => (
                    <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                      {renderCell(row, col.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 font-bold">
                {activeCols.map(col => (
                  <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                    {renderTotal(col.key)}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-neutral-100 dark:border-neutral-800">
          <div className="text-xs text-neutral-500">
            عرض {Math.min((page - 1) * pageSize + 1, sorted.length)}-{Math.min(page * pageSize, sorted.length)} من {sorted.length}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(1)} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="px-3 py-1 bg-[#B21063] text-white rounded-full text-xs font-bold">
              {page} / {totalPages} صفحة
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Pagination */}
      {totalPages > 1 && (
        <div className="sm:hidden flex items-center justify-between mt-3 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 px-4 py-3">
          <div className="text-xs text-neutral-500">
            {Math.min((page - 1) * pageSize + 1, sorted.length)}-{Math.min(page * pageSize, sorted.length)} من {sorted.length}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30 border border-neutral-200 dark:border-neutral-700">
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="px-3 py-1 bg-[#B21063] text-white rounded-full text-xs font-bold">
              {page} / {totalPages}
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30 border border-neutral-200 dark:border-neutral-700">
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
