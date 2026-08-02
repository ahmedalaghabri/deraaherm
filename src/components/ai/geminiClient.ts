// ═══════════════════════════════════════════════════════════════
// Gemini Client (متصفح) — tool calling مع تنفيذ الأدوات محلياً
// ⚠️ مؤقت: المفتاح في كود الواجهة حتى تتم ترقية Blaze،
//    ثم ننتقل إلى Cloud Function (functions/src/index.ts) ونبدّل المفتاح
// ═══════════════════════════════════════════════════════════════

import {
  ASSIGNEES,
  queryLiveTasks,
  queryTransactions,
  attendanceRoster,
  sellerAttendance,
  myLeaves,
} from "./assistantLive";
import {
  orgStructure,
  listRegions,
  listAreas,
  listSupervisors,
  listShowrooms,
  listSellers,
  findEntity,
  topPerformers,
} from "./assistantHierarchy";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? "";
const MODEL = "gemini-flash-latest";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const CURRENT_USER = "احمد الاغبري";

// معاملات الفترة المشتركة لأدوات الهيكل (افتراضياً: الشهر الحالي)
const PERIOD_PROPS = {
  year: { type: "NUMBER", description: "السنة (افتراضي: الحالية)" },
  month: { type: "NUMBER", description: "الشهر 1-12 (افتراضي: الحالي)" },
  period: { type: "STRING", description: "month (افتراضي) أو day أو year" },
  day: { type: "NUMBER", description: "اليوم عند period=day (افتراضي: اليوم)" },
  fromDate: { type: "STRING", description: "بداية مدى YYYY-MM-DD (مع toDate يتجاوز period)" },
  toDate: { type: "STRING", description: "نهاية مدى YYYY-MM-DD" },
} as const;

// ── تعريف الأدوات ─────────────────────────────────────────────
const toolDeclarations = [
  {
    name: "getTasks",
    description: "جلب المهام الحيّة من صفحة المهام (Firestore) مع تصفية اختيارية بالحالة أو المكلَّف. الحالات: todo=قيد الانتظار, in-progress=قيد العمل, in-review=تحت المراجعة, completed=منتهية, overdue=متأخرة. يرجع العدد الكلي وتوزيع الحالات وقائمة المهام.",
    parameters: {
      type: "OBJECT",
      properties: {
        statuses: { type: "ARRAY", items: { type: "STRING" }, description: "قائمة حالات اختيارية (بالإنجليزية)" },
        assignee: { type: "STRING", description: "اسم الموظف المكلَّف (اختياري)" },
      },
    },
  },
  {
    name: "getTransactions",
    description: "جلب المعاملات من صفحة المعاملات مع تصفية اختيارية بالصندوق أو الحالة أو الشخص. الحالات: completed=مكتملة, pending=معلقة, urgent=عاجلة, rejected=مرفوضة.",
    parameters: {
      type: "OBJECT",
      properties: {
        box: { type: "STRING", description: "inbox=الوارد | outbox=الصادر | archive=الأرشيف (اختياري، الافتراضي الكل)" },
        status: { type: "STRING", description: "completed | pending | urgent | rejected (اختياري)" },
        personName: { type: "STRING", description: "اسم صاحب المعاملة (اختياري)" },
      },
    },
  },
  {
    name: "getAttendanceRoster",
    description: "هيكل فريق المعارض لصفحة الدوام: الأقاليم الثلاثة ومعارضها وبائعو كل معرض (36 بائعاً)، مع الدوام الرسمي والراحة الأسبوعية. استخدمها لمعرفة من يعمل في أي معرض أو عند غموض اسم بائع.",
    parameters: { type: "OBJECT", properties: {} },
  },
  {
    name: "getTeamAttendance",
    description: "دوام بائع من صفحة دوام فريق المعارض. بدون day: ملخص الشهر كاملاً (أيام حسب الحالة، أيام التأخير والغياب، ساعات مطلوبة/فعلية/تعويض/استئذان/صافي/خصم). مع day: تفاصيل يوم محدد (حضور/انصراف/تأخير/صافي).",
    parameters: {
      type: "OBJECT",
      properties: {
        sellerName: { type: "STRING", description: "اسم البائع" },
        year: { type: "NUMBER", description: "السنة (افتراضي: الحالية)" },
        month: { type: "NUMBER", description: "الشهر 1-12 (افتراضي: الحالي)" },
        day: { type: "NUMBER", description: "يوم محدد للتفاصيل اليومية (اختياري)" },
      },
      required: ["sellerName"],
    },
  },
  {
    name: "getMyLeaves",
    description: "أرصدة إجازات المستخدم الحالي وسجل إجازاته من صفحة الملف الشخصي (سنوية، مرضية، طارئة: الإجمالي والمستخدم والمتبقي).",
    parameters: { type: "OBJECT", properties: {} },
  },
  // ── أدوات الهيكل التنظيمي والمبيعات التفصيلية ──
  {
    name: "getOrgStructure",
    description: "ملخص الهيكل التنظيمي الكامل: عدد وأسماء الأقاليم ومناطق كل إقليم، وإجماليات المبيعات لكامل الشركة للفترة المحددة.",
    parameters: { type: "OBJECT", properties: { ...PERIOD_PROPS } },
  },
  {
    name: "listRegions",
    description: "جميع الأقاليم (10) مع مؤشرات كل إقليم للفترة: المبيعات، المستهدف، نسبة التحقيق، النمو، عدد المناطق/المشرفين/المعارض/البائعين.",
    parameters: { type: "OBJECT", properties: { ...PERIOD_PROPS } },
  },
  {
    name: "listAreas",
    description: "المناطق (25) مع مؤشراتها للفترة، ويمكن تصفيتها بإقليم محدد.",
    parameters: {
      type: "OBJECT",
      properties: {
        regionName: { type: "STRING", description: "اسم الإقليم (اختياري)" },
        ...PERIOD_PROPS,
      },
    },
  },
  {
    name: "listSupervisors",
    description: "المشرفون (100) مع مؤشرات فرقهم للفترة، بتصفية اختيارية بالإقليم/المنطقة وترقيم صفحات (limit/offset).",
    parameters: {
      type: "OBJECT",
      properties: {
        regionName: { type: "STRING" },
        areaName: { type: "STRING" },
        limit: { type: "NUMBER", description: "الحد الأقصى (افتراضي 20، أقصى 50)" },
        offset: { type: "NUMBER", description: "للترقيم" },
        ...PERIOD_PROPS,
      },
    },
  },
  {
    name: "listShowroomsDetailed",
    description: "المعارض (500) مع البائع والمشرف ومؤشرات الفترة، بتصفية اختيارية بالإقليم/المنطقة/المشرف وترقيم صفحات.",
    parameters: {
      type: "OBJECT",
      properties: {
        regionName: { type: "STRING" },
        areaName: { type: "STRING" },
        supervisorName: { type: "STRING" },
        limit: { type: "NUMBER" },
        offset: { type: "NUMBER" },
        ...PERIOD_PROPS,
      },
    },
  },
  {
    name: "listSellersDetailed",
    description: "البائعون (500) بتفاصيل كاملة للفترة (مبيعات، مستهدف، تحقيق، نمو، فواتير، قطع، عملاء) مع تصفية بأي مستوى وترتيب وترقيم.",
    parameters: {
      type: "OBJECT",
      properties: {
        regionName: { type: "STRING" },
        areaName: { type: "STRING" },
        supervisorName: { type: "STRING" },
        showroomName: { type: "STRING" },
        sortBy: { type: "STRING", description: "sales | target | prevSales | achievement | growth | invoices | pieces | customers | avgInvoice" },
        order: { type: "STRING", description: "desc (افتراضي) أو asc" },
        limit: { type: "NUMBER" },
        offset: { type: "NUMBER" },
        ...PERIOD_PROPS,
      },
    },
  },
  {
    name: "findEntity",
    description: "بحث ذكي عن أي كيان بالاسم (إقليم/منطقة/مشرف/معرض/بائع) ويرجع تفاصيله الكاملة للفترة مع التسلسل الإداري.",
    parameters: {
      type: "OBJECT",
      properties: {
        name: { type: "STRING", description: "الاسم أو جزء منه" },
        ...PERIOD_PROPS,
      },
      required: ["name"],
    },
  },
  {
    name: "getTopPerformers",
    description: "ترتيب الأفضل/الأسوأ على أي مستوى (regions/areas/supervisors/showrooms/sellers) بأي مؤشر (sales/achievement/growth/invoices/avgInvoice/pieces/customers) للفترة المحددة.",
    parameters: {
      type: "OBJECT",
      properties: {
        level: { type: "STRING", description: "regions | areas | supervisors | showrooms | sellers" },
        metric: { type: "STRING", description: "sales (افتراضي) | target | achievement | growth | invoices | avgInvoice | pieces | customers" },
        order: { type: "STRING", description: "desc للأفضل (افتراضي)، asc للأسوأ" },
        limit: { type: "NUMBER", description: "افتراضي 10" },
        ...PERIOD_PROPS,
      },
      required: ["level"],
    },
  },
];

// استخراج معاملات الفترة من وسائط الأداة
function periodArgs(args: Record<string, unknown>) {
  return {
    year: args.year ? Number(args.year) : undefined,
    month: args.month ? Number(args.month) : undefined,
    period: args.period ? String(args.period) : undefined,
    day: args.day ? Number(args.day) : undefined,
    fromDate: args.fromDate ? String(args.fromDate) : undefined,
    toDate: args.toDate ? String(args.toDate) : undefined,
  };
}

// ── منفّذ الأدوات (محلي) ──────────────────────────────────────
async function executeTool(name: string, args: Record<string, unknown>): Promise<Record<string, unknown>> {
  switch (name) {
    case "getTasks":
      return queryLiveTasks({
        statuses: Array.isArray(args.statuses) ? (args.statuses as string[]) : undefined,
        assignee: args.assignee ? String(args.assignee) : undefined,
      });
    case "getTransactions":
      return queryTransactions({
        box: args.box ? String(args.box) : undefined,
        status: args.status ? String(args.status) : undefined,
        personName: args.personName ? String(args.personName) : undefined,
      });
    case "getAttendanceRoster":
      return attendanceRoster();
    case "getTeamAttendance":
      return sellerAttendance({
        sellerName: String(args.sellerName ?? ""),
        year: args.year ? Number(args.year) : undefined,
        month: args.month ? Number(args.month) : undefined,
        day: args.day ? Number(args.day) : undefined,
      });
    case "getMyLeaves":
      return myLeaves();
    case "getOrgStructure":
      return orgStructure(periodArgs(args));
    case "listRegions":
      return listRegions(periodArgs(args));
    case "listAreas":
      return listAreas(args.regionName ? String(args.regionName) : undefined, periodArgs(args));
    case "listSupervisors":
      return listSupervisors({
        regionName: args.regionName ? String(args.regionName) : undefined,
        areaName: args.areaName ? String(args.areaName) : undefined,
        limit: args.limit ? Number(args.limit) : undefined,
        offset: args.offset ? Number(args.offset) : undefined,
        ...periodArgs(args),
      });
    case "listShowroomsDetailed":
      return listShowrooms({
        regionName: args.regionName ? String(args.regionName) : undefined,
        areaName: args.areaName ? String(args.areaName) : undefined,
        supervisorName: args.supervisorName ? String(args.supervisorName) : undefined,
        limit: args.limit ? Number(args.limit) : undefined,
        offset: args.offset ? Number(args.offset) : undefined,
        ...periodArgs(args),
      });
    case "listSellersDetailed":
      return listSellers({
        regionName: args.regionName ? String(args.regionName) : undefined,
        areaName: args.areaName ? String(args.areaName) : undefined,
        supervisorName: args.supervisorName ? String(args.supervisorName) : undefined,
        showroomName: args.showroomName ? String(args.showroomName) : undefined,
        sortBy: args.sortBy ? String(args.sortBy) : undefined,
        order: args.order ? String(args.order) : undefined,
        limit: args.limit ? Number(args.limit) : undefined,
        offset: args.offset ? Number(args.offset) : undefined,
        ...periodArgs(args),
      });
    case "findEntity":
      return findEntity(String(args.name ?? ""), periodArgs(args));
    case "getTopPerformers":
      return topPerformers({
        level: String(args.level ?? ""),
        metric: args.metric ? String(args.metric) : undefined,
        order: args.order ? String(args.order) : undefined,
        limit: args.limit ? Number(args.limit) : undefined,
        ...periodArgs(args),
      });
    default:
      return { error: `أداة غير معروفة: ${name}` };
  }
}

// ── استدعاء Gemini مع حلقة الأدوات ────────────────────────────
interface GeminiPart {
  text?: string;
  functionCall?: { name: string; args: Record<string, unknown>; id?: string };
  functionResponse?: { name: string; response: Record<string, unknown>; id?: string };
  thoughtSignature?: string;
}
interface GeminiContent {
  role: string;
  parts: GeminiPart[];
}

function systemPrompt(): string {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return `أنت "مساعد درعه الذكي" داخل نظام ERM لإدارة الموارد والمبيعات.
- تاريخ اليوم: ${todayStr}
- المستخدم الحالي: ${CURRENT_USER} (أسئلة "لدي/تبقى لي/كم عندي" تعود عليه)

مصادر البيانات (كلها مطابقة تماماً لما تعرضه صفحات النظام):
أ) لوحة أداء المبيعات (أدوات: getOrgStructure, listRegions, listAreas, listSupervisors, listShowroomsDetailed, listSellersDetailed, findEntity, getTopPerformers):
   • 10 أقاليم ← 25 منطقة ← 100 مشرف ← 500 معرض ← 500 بائع
   • لكل كيان: المبيعات، المستهدف، نسبة التحقيق، مبيعات الفترة السابقة، النمو، الفواتير، متوسط الفاتورة، القطع، العملاء
   • كل أداة تقبل الفترة: year + month (افتراضي الشهر الحالي) أو period=day/year أو مدى fromDate/toDate — مرّر الفترة التي يقصدها المستخدم دائماً
   • النتائج تتضمن حقل period يوضّح الفترة — اذكرها في إجابتك
   • للأسماء الغامضة استخدم findEntity أولاً
ب) صفحة المهام — بيانات حيّة من قاعدة البيانات (أداة getTasks). المكلّفون: ${ASSIGNEES.join("، ")}
ج) صفحة دوام فريق المعارض (أداتا getAttendanceRoster و getTeamAttendance): 3 أقاليم (الرياض، الغربية، الشرقية) × 3 معارض × 4 بائعين = 36 بائعاً. الدوام الرسمي 10:00 ص × 8 ساعات، الراحة الجمعة والسبت. أسئلة التأخير/الغياب/الحضور للبائعين تُجاب من هنا.
د) صفحة المعاملات (أداة getTransactions): وارد، صادر، أرشيف.
هـ) إجازات المستخدم الحالي (أداة getMyLeaves): أرصدة السنوية/المرضية/الطارئة وسجل الإجازات.

قواعدك:
1. استخدم الأدوات المتاحة لجلب البيانات — لا تخترع أرقاماً أبداً، ولا تجب عن أرقام من ذاكرتك.
2. أجب بالعربية بإيجاز ووضوح، وضع الأرقام المهمة بين ** ** وافصل النقاط بأسطر تبدأ بـ •
3. المبالغ بالريال السعودي منسّقة بفواصل الآلاف.
4. عند المقارنة احسب الفارق والنسبة المئوية ووضّح الاتجاه (ارتفاع/انخفاض).
5. إذا لم تُحدد سنة فاستخدم سنة اليوم، وإن لم يُحدد شهر فاستخدم شهر اليوم.
6. للأسئلة التحليلية (أفضل/أسوأ، ترتيب، ملخص) استخدم getTopPerformers أو استدعِ عدة أدوات ثم حلّل.
7. القوائم الطويلة: اعرض أول 10-15 واذكر الإجمالي، واستخدم limit/offset للمزيد عند الطلب.
8. إن كان السؤال خارج نطاق بيانات النظام فاعتذر بلطف واذكر ما تستطيع المساعدة به.
9. إن أرجعت أداة error مع قائمة متاحة، اقترح أقرب الأسماء على المستخدم.`;
}

export async function askGemini(
  question: string,
  history: { role: "user" | "model"; text: string }[]
): Promise<string> {
  const contents: GeminiContent[] = [
    ...history.slice(-10).map(h => ({ role: h.role, parts: [{ text: h.text }] })),
    { role: "user", parts: [{ text: question }] },
  ];

  for (let round = 0; round < 6; round++) {
    let res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt() }] },
        contents,
        tools: [{ functionDeclarations: toolDeclarations }],
        generationConfig: { temperature: 0.2 },
      }),
    });

    // محاولة واحدة إضافية عند تجاوز حد الطلبات (429) أو ازدحام النموذج (503)
    if (res.status === 429 || res.status === 503) {
      await new Promise(r => setTimeout(r, 2500));
      res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt() }] },
          contents,
          tools: [{ functionDeclarations: toolDeclarations }],
          generationConfig: { temperature: 0.2 },
        }),
      });
    }

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      throw new Error(`Gemini HTTP ${res.status}: ${errBody.slice(0, 200)}`);
    }

    const data = await res.json();
    const candidate = data?.candidates?.[0];
    const parts: GeminiPart[] = candidate?.content?.parts ?? [];
    if (parts.length === 0) throw new Error("رد فارغ من النموذج");

    const functionCalls = parts.filter(p => p.functionCall);
    if (functionCalls.length === 0) {
      const text = parts.map(p => p.text ?? "").join("").trim();
      if (!text) throw new Error("رد نصي فارغ");
      return text;
    }

    // أضف رد النموذج كما هو (يحافظ على thoughtSignature) ثم نتائج الأدوات
    contents.push({ role: "model", parts });
    const responseParts: GeminiPart[] = [];
    for (const p of functionCalls) {
      responseParts.push({
        functionResponse: {
          name: p.functionCall!.name,
          ...(p.functionCall!.id ? { id: p.functionCall!.id } : {}),
          response: await executeTool(p.functionCall!.name, p.functionCall!.args ?? {}),
        },
      });
    }
    contents.push({ role: "user", parts: responseParts });
  }

  throw new Error("تجاوز حد جولات الأدوات");
}
