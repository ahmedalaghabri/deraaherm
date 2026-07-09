import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ds } from "@/lib/design-system";

/**
 * StatCard — بطاقة إحصائية موحدة (نفس مخطط KpiCard في صفحة الأداء)
 *
 * التخطيط: العنوان يمين + صندوق أيقونة محايد يسار، القيمة بالأسفل،
 * ثم سطر فرعي اختياري وشريط تقدم اختياري.
 * تدعم عدّاداً متحركاً للقيم الرقمية تلقائياً.
 */

function useCountUp(target: number, duration = 900) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;
    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(target * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return current;
}

function parseStatValue(value: string): { num: number; suffix: string; prefix: string } {
  const match = value.match(/^([^\d]*)([\d,.]+)\s*(.*)$/);
  if (!match || !match[2]) return { num: NaN, suffix: "", prefix: "" };
  const num = parseFloat(match[2].replace(/,/g, ""));
  return {
    num: isNaN(num) ? NaN : num,
    suffix: match[3] ? " " + match[3].trim() : "",
    prefix: match[1] || "",
  };
}

export interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  /** سطر فرعي أسفل القيمة */
  sub?: string;
  /** نسبة شريط التقدم (0–100) */
  progress?: number;
  /** لون شريط التقدم */
  color?: string;
  /** تعطيل العدّاد المتحرك */
  animate?: boolean;
  className?: string;
}

export default function StatCard({ title, value, icon: Icon, sub, progress, color = "#4D8AFF", animate = true, className }: StatCardProps) {
  const { num, suffix, prefix } = parseStatValue(value);
  const canAnimate = animate && !isNaN(num);
  const animated = useCountUp(canAnimate ? num : 0);
  const displayValue = canAnimate
    ? `${prefix}${Number.isInteger(num) ? Math.round(animated).toLocaleString("en-US") : animated.toFixed(1)}${suffix}`
    : value;

  return (
    <div className={cn(ds.card, ds.cardHover, "p-2 sm:p-4 flex flex-col gap-1 sm:gap-1.5", className)} style={{ borderRadius: 12 }}>
      <div className="flex items-center justify-between gap-1">
        <span className={cn("text-[10px] sm:text-[14px] font-semibold leading-tight line-clamp-1", ds.textPrimary)}>{title}</span>
        <div className={cn(ds.iconBox, "w-6 h-6 sm:w-8 sm:h-8")} style={{ borderRadius: 8 }}>
          <Icon className={cn("w-3 h-3 sm:w-4 sm:h-4", ds.iconBoxIcon)} />
        </div>
      </div>
      <div className={cn("text-sm sm:text-xl", ds.textValue)}>{displayValue}</div>
      {sub && <div className={cn("text-[10px] sm:text-xs font-medium truncate", ds.textMuted)}>{sub}</div>}
      {progress !== undefined && (
        <div className="h-1 sm:h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-700 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: color }} />
        </div>
      )}
    </div>
  );
}
