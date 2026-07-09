# نظام التصميم — Design System

المرجع الأساسي: **صفحة الأداء** (`src/components/SalesPerformancePage.tsx`).
جميع الصفحات الرئيسية والداخلية والصفحات القادمة يجب أن تلتزم بهذا النظام.

## المصادر البرمجية

| الملف | الوصف |
|---|---|
| `src/lib/design-system.ts` | رموز الفئات (`ds`)، ألوان العلامة (`brand`)، دالة `pctColor` |
| `src/components/ds/StatCard.tsx` | بطاقة الإحصائيات الموحدة (مخطط KpiCard) |
| `src/components/PageTabs.tsx` | شريط التبويبات العلوي اللاصق |

## الاستخدام

```tsx
import { cn } from "@/lib/utils";
import { ds, brand, pctColor } from "@/lib/design-system";
import StatCard from "@/components/ds/StatCard";

// بطاقة
<div className={cn(ds.card, "p-4")}>...</div>

// بطاقة إحصائية
<StatCard title="نسبة التحقيق" value="131%" sub="نمو: +4%" icon={TrendingUp} progress={80} />
```

## 1. الألوان

### المحايدة (Tailwind neutral)

| الاستخدام | فاتح | غامق |
|---|---|---|
| خلفية الصفحة | `bg-neutral-0` | `dark:bg-neutral-900` |
| سطح البطاقة | `bg-white` | `dark:bg-neutral-800` |
| سطح ثانوي / لوحة | `bg-neutral-50` | `dark:bg-neutral-900/50` |
| صندوق أيقونة / رأس جدول | `bg-neutral-100` | `dark:bg-neutral-700` |
| حد قياسي | `border-neutral-100` | `dark:border-neutral-700` |
| حد قوي | `border-neutral-200` | `dark:border-neutral-600` |
| نص عنوان | `text-neutral-800` | `dark:text-neutral-200` |
| نص أساسي | `text-neutral-700` | `dark:text-neutral-300` |
| نص ثانوي | `text-neutral-600` | `dark:text-neutral-400` |
| نص خافت | `text-neutral-500` | `dark:text-neutral-400` |

### ألوان العلامة (`brand`)

| الرمز | القيمة | الاستخدام |
|---|---|---|
| `brand.primary` | `#4D8AFF` | أساسي / تحقيق "جيد" (80–99%) |
| `brand.success` | `#00C9A7` | نجاح / "ممتاز" (100%+) |
| `brand.warning` | `#F9A825` | تحذير / "متوسط" (60–79%) |
| `brand.danger` | `#E91E8C` | خطر / "ضعيف" (<60%) |
| `brand.accent` | `#B21063` | روابط الجداول، الفرز، التثبيت |
| `brand.info` | `#00B4D8` | معلومات |
| `brand.violet` | `#845EC2` | فئات إضافية |

الشارات الملوّنة تستخدم صيغة: `bg-{color}-100 text-{color}-800 dark:bg-{color}-900/30 dark:text-{color}-300`.

## 2. الأسطح والحواف

- **بطاقة قياسية** (`ds.card`): `rounded-xl` (12px)، حد `neutral-100/700`، `shadow-sm`.
- **بطاقة كبيرة** (`ds.cardLg`): `rounded-2xl` (16px) — للرسوم البيانية والجداول.
- **تحويم**: `hover:shadow-md transition-shadow` (`ds.cardHover`).
- **سطح زجاجي** (`ds.glass`): للهيدر اللاصق والشريط الجانبي — `bg-white/80 dark:bg-neutral-800/80 backdrop-blur`.
- صندوق الأيقونة: 8px radius، `bg-neutral-100 dark:bg-neutral-700`، الأيقونة `text-neutral-700 dark:text-neutral-300` — **بدون ألوان زاهية**.

## 3. الطباعة (RTL دائماً — `dir="rtl"`)

| العنصر | الفئات |
|---|---|
| عنوان بطاقة إحصائية | `text-[10px] sm:text-[14px] font-semibold` |
| قيمة رقمية | `text-sm sm:text-xl font-bold tracking-tight tabular-nums` |
| سطر فرعي | `text-[10px] sm:text-xs font-medium` |
| عنوان قسم | `text-sm font-bold` |
| خلايا الجداول | `text-[11px] sm:text-[13px]` |

الأرقام دائماً `tabular-nums` وبالتنسيق `toLocaleString("en-US")`.

## 4. المكوّنات

### StatCard (بطاقة إحصائية)
العنوان يمين + صندوق أيقونة محايد يسار ← القيمة ← سطر فرعي اختياري ← شريط تقدم اختياري.
عدّاد متحرك تلقائي للقيم الرقمية (easing تكعيبي، 900ms).

### PageTabs (تبويبات)
لاصقة أعلى الصفحة، التبويب النشط: `bg-neutral-900 text-white`، الخامل: `hover:bg-neutral-100 dark:hover:bg-neutral-700`.

### الجداول
- رأس: `ds.tableHead` — `bg-neutral-50 dark:bg-neutral-700`.
- صف: `ds.tableRow` — حد سفلي + تحويم خفيف.
- تذييل مجاميع: `ds.tableFoot` — `bg-neutral-100 dark:bg-neutral-700` + حد علوي مزدوج.
- الفرز/الفلترة النشطة بلون `brand.accent`.

### الأزرار
- أساسي: `ds.btnPrimary` — `bg-neutral-900 text-white rounded-xl`.
- خامل: `ds.btnGhost`.
- أيقونة (جرس/حساب): `ds.btnIcon` — 40×40، `rounded-xl`.
- مخطط (تصدير/طباعة): `ds.btnOutline` — `rounded-2xl`.

### الحقول
`ds.input` — `rounded-2xl`، `dark:bg-neutral-800 dark:border-neutral-600`.

### القوائم المنسدلة
`ds.dropdown` + `ds.dropdownItem` — `rounded-2xl shadow-xl`.

## 5. الحركة (Framer Motion)

- دخول العناصر: `initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}`.
- تأخير تعاقبي للقوائم: `transition={{ delay: 0.03 * idx }}`.
- المدة القياسية: 0.4–0.55s.

## 6. قواعد إلزامية للصفحات الجديدة

1. استيراد الرموز من `@/lib/design-system` بدلاً من كتابة فئات الألوان يدوياً.
2. كل فئة لونية فاتحة يجب أن تُرفق بنظيرتها الغامقة (`dark:`).
3. بطاقات الإحصائيات تستخدم `StatCard` الموحد فقط — لا تعريفات محلية.
4. التخطيط RTL: الأيقونات القيادية على اليمين، الأسهم الخلفية `ChevronRight`.
5. حاوية المحتوى: `max-w-[1400px] mx-auto`.
