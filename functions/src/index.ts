// ═══════════════════════════════════════════════════════════════
// askAssistant — Cloud Function (callable)
// Gemini 2.0 Flash + Tool Calling فوق بيانات النظام
// المفتاح محفوظ كسر: firebase functions:secrets:set GEMINI_API_KEY
// ═══════════════════════════════════════════════════════════════

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import {
  GoogleGenerativeAI,
  SchemaType,
  type FunctionDeclaration,
  type Content,
} from "@google/generative-ai";
import {
  ASST_EMPLOYEES,
  ASST_SHOWROOMS,
  ASST_TASKS,
  ASST_TRANSACTIONS,
  TASK_STATUS_AR,
  employeeMonthlySales,
  employeeMonthlyTarget,
  showroomMonthlySales,
  showroomRangeSales,
  employeeMonthlyLateness,
  employeeMonthlyAbsence,
  employeeLeaveBalance,
} from "./assistantData";

const geminiApiKey = defineSecret("GEMINI_API_KEY");

// ── تعريف الأدوات المتاحة للنموذج ─────────────────────────────
const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "getEmployeeSales",
    description: "جلب مبيعات موظف لشهر محدد مع المستهدف ونسبة التحقيق. الشهر 1-12.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        employeeName: { type: SchemaType.STRING, description: "اسم الموظف الكامل كما في قائمة الموظفين" },
        year: { type: SchemaType.NUMBER },
        month: { type: SchemaType.NUMBER, description: "1-12" },
      },
      required: ["employeeName", "year", "month"],
    },
  },
  {
    name: "getShowroomSales",
    description: "جلب مبيعات معرض لشهر محدد. الشهر 1-12.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        showroomName: { type: SchemaType.STRING, description: "اسم المعرض الكامل كما في قائمة المعارض" },
        year: { type: SchemaType.NUMBER },
        month: { type: SchemaType.NUMBER, description: "1-12" },
      },
      required: ["showroomName", "year", "month"],
    },
  },
  {
    name: "getShowroomRangeSales",
    description: "جلب مبيعات معرض لفترة بين تاريخين (شاملة الطرفين).",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        showroomName: { type: SchemaType.STRING },
        fromDate: { type: SchemaType.STRING, description: "YYYY-MM-DD" },
        toDate: { type: SchemaType.STRING, description: "YYYY-MM-DD" },
      },
      required: ["showroomName", "fromDate", "toDate"],
    },
  },
  {
    name: "getTasks",
    description: "جلب المهام مع إمكانية التصفية بالحالة أو المكلَّف. statuses: todo=معلقة, in-progress=قيد العمل, in-review=قيد المراجعة, overdue=متأخرة, completed=منتهية",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        statuses: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "حالات مطلوبة من: todo, in-progress, in-review, overdue, completed. اتركها فارغة لجلب الكل",
        },
        assignee: { type: SchemaType.STRING, description: "اسم الموظف المكلَّف (اختياري)" },
      },
    },
  },
  {
    name: "getLateness",
    description: "جلب تأخير وغياب موظف في شهر محدد (أيام التأخير، دقائق التأخير، أيام الغياب).",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        employeeName: { type: SchemaType.STRING },
        year: { type: SchemaType.NUMBER },
        month: { type: SchemaType.NUMBER, description: "1-12" },
      },
      required: ["employeeName", "year", "month"],
    },
  },
  {
    name: "getLeaveBalance",
    description: "جلب رصيد إجازات موظف (سنوية إجمالية/مستخدمة/متبقية، مرضية، تعويضية).",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        employeeName: { type: SchemaType.STRING },
      },
      required: ["employeeName"],
    },
  },
  {
    name: "getTransactions",
    description: "جلب المعاملات مع تصفية بالاتجاه (وارد/صادر) أو بموظف مرّت به المعاملة.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        direction: { type: SchemaType.STRING, description: "وارد أو صادر (اختياري)" },
        handlerName: { type: SchemaType.STRING, description: "اسم موظف مرّت به المعاملة (اختياري)" },
      },
    },
  },
];

// ── منفّذ الأدوات ─────────────────────────────────────────────
function resolveEmployee(name: string): string | null {
  const n = name.trim();
  const exact = ASST_EMPLOYEES.find(e => e.name === n);
  if (exact) return exact.name;
  const partial = ASST_EMPLOYEES.find(e => e.name.includes(n) || n.includes(e.name));
  if (partial) return partial.name;
  const word = ASST_EMPLOYEES.find(e => e.name.split(" ").some(p => n.includes(p) && p.length >= 3));
  return word ? word.name : null;
}

function resolveShowroom(name: string): string | null {
  const n = name.trim();
  const exact = ASST_SHOWROOMS.find(s => s === n);
  if (exact) return exact;
  const partial = ASST_SHOWROOMS.find(s => s.includes(n) || n.includes(s));
  if (partial) return partial;
  const city = ASST_SHOWROOMS.find(s => {
    const c = s.replace("معرض ", "").split(" - ")[0];
    return n.includes(c);
  });
  return city ?? null;
}

function executeTool(name: string, args: Record<string, unknown>): Record<string, unknown> {
  switch (name) {
    case "getEmployeeSales": {
      const emp = resolveEmployee(String(args.employeeName));
      if (!emp) return { error: "الموظف غير موجود", availableEmployees: ASST_EMPLOYEES.map(e => e.name) };
      const year = Number(args.year);
      const month = Number(args.month) - 1;
      const sales = employeeMonthlySales(emp, year, month);
      const target = employeeMonthlyTarget(emp, year, month);
      return { employee: emp, year, month: Number(args.month), salesSAR: sales, targetSAR: target, achievementPct: Math.round((sales / target) * 100) };
    }
    case "getShowroomSales": {
      const sr = resolveShowroom(String(args.showroomName));
      if (!sr) return { error: "المعرض غير موجود", availableShowrooms: ASST_SHOWROOMS };
      const year = Number(args.year);
      const month = Number(args.month) - 1;
      return { showroom: sr, year, month: Number(args.month), salesSAR: showroomMonthlySales(sr, year, month) };
    }
    case "getShowroomRangeSales": {
      const sr = resolveShowroom(String(args.showroomName));
      if (!sr) return { error: "المعرض غير موجود", availableShowrooms: ASST_SHOWROOMS };
      const from = new Date(String(args.fromDate));
      const to = new Date(String(args.toDate));
      if (isNaN(from.getTime()) || isNaN(to.getTime()) || from > to) return { error: "فترة غير صالحة" };
      return { showroom: sr, from: String(args.fromDate), to: String(args.toDate), salesSAR: showroomRangeSales(sr, from, to) };
    }
    case "getTasks": {
      const statuses = Array.isArray(args.statuses) ? (args.statuses as string[]) : [];
      let tasks = ASST_TASKS;
      if (statuses.length > 0) tasks = tasks.filter(t => statuses.includes(t.status));
      if (args.assignee) {
        const emp = resolveEmployee(String(args.assignee));
        if (emp) tasks = tasks.filter(t => t.assignee === emp);
      }
      return {
        count: tasks.length,
        tasks: tasks.map(t => ({ title: t.title, assignee: t.assignee, status: TASK_STATUS_AR[t.status], dueDate: t.dueDate, priority: t.priority })),
      };
    }
    case "getLateness": {
      const emp = resolveEmployee(String(args.employeeName));
      if (!emp) return { error: "الموظف غير موجود", availableEmployees: ASST_EMPLOYEES.map(e => e.name) };
      const year = Number(args.year);
      const month = Number(args.month) - 1;
      const { lateDays, lateMinutes } = employeeMonthlyLateness(emp, year, month);
      return { employee: emp, year, month: Number(args.month), lateDays, lateMinutes, absenceDays: employeeMonthlyAbsence(emp, year, month) };
    }
    case "getLeaveBalance": {
      const emp = resolveEmployee(String(args.employeeName));
      if (!emp) return { error: "الموظف غير موجود", availableEmployees: ASST_EMPLOYEES.map(e => e.name) };
      const b = employeeLeaveBalance(emp);
      return { employee: emp, annualTotal: b.annualTotal, annualUsed: b.annualUsed, annualRemaining: b.annualTotal - b.annualUsed, sickUsed: b.sickUsed, compensatory: b.compensatory };
    }
    case "getTransactions": {
      let txs = ASST_TRANSACTIONS;
      if (args.direction === "وارد" || args.direction === "صادر") txs = txs.filter(t => t.direction === args.direction);
      if (args.handlerName) {
        const emp = resolveEmployee(String(args.handlerName));
        if (emp) txs = txs.filter(t => t.handlers.includes(emp));
        else return { error: "الموظف غير موجود", availableEmployees: ASST_EMPLOYEES.map(e => e.name) };
      }
      return {
        count: txs.length,
        transactions: txs.map(t => ({ id: t.id, title: t.title, type: t.type, direction: t.direction, status: t.status, date: t.date, handlers: t.handlers })),
      };
    }
    default:
      return { error: `أداة غير معروفة: ${name}` };
  }
}

// ── الدالة السحابية ───────────────────────────────────────────
interface AskPayload {
  question: string;
  history?: { role: "user" | "model"; text: string }[];
  currentUser?: string;
}

export const askAssistant = onCall(
  {
    secrets: [geminiApiKey],
    region: "europe-west1",
    maxInstances: 5,
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (request) => {
    const { question, history = [], currentUser = "احمد الاغبري" } = (request.data ?? {}) as AskPayload;
    if (!question || typeof question !== "string" || question.trim().length === 0) {
      throw new HttpsError("invalid-argument", "السؤال مطلوب");
    }
    if (question.length > 1000) {
      throw new HttpsError("invalid-argument", "السؤال طويل جداً");
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey.value());
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      tools: [{ functionDeclarations: toolDeclarations }],
      systemInstruction: `أنت "مساعد درعه الذكي" داخل نظام ERM لإدارة الموارد والمبيعات.
- تاريخ اليوم: ${todayStr}
- المستخدم الحالي: ${currentUser} (أسئلة "لدي/تبقى لي/كم عندي" تعود عليه)
- الموظفون: ${ASST_EMPLOYEES.map(e => e.name).join("، ")}
- المعارض: ${ASST_SHOWROOMS.join("، ")}

قواعدك:
1. استخدم الأدوات المتاحة لجلب البيانات — لا تخترع أرقاماً أبداً.
2. أجب بالعربية بإيجاز ووضوح، ونسّق الأرقام المهمة بين ** ** وافصل النقاط بأسطر جديدة تبدأ بـ •
3. المبالغ بالريال السعودي، ونسّقها بفواصل الآلاف.
4. عند المقارنة بين فترتين احسب الفارق والنسبة المئوية ووضّح الاتجاه (ارتفاع/انخفاض).
5. إذا لم يحدد المستخدم سنة فاستخدم السنة الحالية، وإن لم يحدد شهراً فاستخدم الشهر الحالي.
6. إن كان السؤال خارج نطاق بيانات النظام فاعتذر بلطف واذكر ما تستطيع المساعدة به.`,
    });

    // آخر 10 رسائل كسياق
    const chatHistory: Content[] = history.slice(-10).map(h => ({
      role: h.role,
      parts: [{ text: h.text }],
    }));

    const chat = model.startChat({ history: chatHistory });

    try {
      let result = await chat.sendMessage(question.trim());

      // حلقة تنفيذ الأدوات (حد أقصى 6 جولات)
      for (let round = 0; round < 6; round++) {
        const calls = result.response.functionCalls();
        if (!calls || calls.length === 0) break;
        const responses = calls.map(call => ({
          functionResponse: {
            name: call.name,
            response: executeTool(call.name, call.args as Record<string, unknown>),
          },
        }));
        result = await chat.sendMessage(responses);
      }

      const text = result.response.text();
      if (!text) throw new HttpsError("internal", "رد فارغ من النموذج");
      return { reply: text, source: "gemini" };
    } catch (err: unknown) {
      if (err instanceof HttpsError) throw err;
      const msg = err instanceof Error ? err.message : String(err);
      console.error("askAssistant error:", msg);
      throw new HttpsError("internal", "تعذر الاتصال بالنموذج", msg);
    }
  }
);
