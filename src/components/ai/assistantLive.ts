// ═══════════════════════════════════════════════════════════════
// طبقة البيانات الحيّة للمساعد الذكي
// تقرأ نفس المصادر التي تعرضها الصفحات تماماً:
//   • المهام: Firestore (نفس مجموعة صفحة المهام) مع نفس البذرة عند الفراغ
//   • دوام فريق المعارض: نفس مولّد getDayAttendance ونفس معادلات الإجماليات
//   • المعاملات: نفس مصفوفات صفحة المعاملات (وارد/صادر/أرشيف)
//   • إجازات المستخدم الحالي: نفس بيانات صفحة الملف الشخصي
// ═══════════════════════════════════════════════════════════════

import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  getInitialTasks,
  TASKS_COLLECTION,
  TASK_STATUS_LABELS,
  ASSIGNEES,
  type Task,
  type TaskStatus,
} from "../TasksPage";
import {
  MOCK_INBOX,
  MOCK_OUTBOX,
  MOCK_ARCHIVE,
  TX_STATUS_LABELS,
  type Transaction,
} from "../TransactionsPage";
import {
  TA_REGIONS,
  TA_SHOWROOMS_BY_REGION,
  TA_SELLERS_BY_SHOWROOM,
  ATT_STATUS_LABELS,
  OFFICIAL_HOURS,
  getDayAttendance,
  type AttStatus,
} from "../TeamAttendancePage";
import { MY_LEAVE_BALANCES, MY_LEAVE_HISTORY } from "../EmployeeProfilePage";

export { ASSIGNEES };

const r2 = (n: number) => Math.round(n * 100) / 100;

function norm(s: string): string {
  return (s ?? "")
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ");
}

// ─────────────────────────────────────────────────────────────
// 1) المهام — Firestore الحي (نفس مجموعة صفحة المهام) مع كاش قصير
// ─────────────────────────────────────────────────────────────
let tasksCache: { rows: Task[]; at: number } | null = null;

async function fetchLiveTasks(): Promise<Task[]> {
  if (tasksCache && Date.now() - tasksCache.at < 30_000) return tasksCache.rows;
  try {
    const snap = await getDocs(collection(db, TASKS_COLLECTION));
    const rows = snap.docs.map(d => ({ ...(d.data() as Task), id: d.id }));
    const result = rows.length > 0 ? rows : getInitialTasks();
    tasksCache = { rows: result, at: Date.now() };
    return result;
  } catch {
    // دون اتصال: نفس مسار الصفحة (localStorage ثم البذرة الافتراضية)
    return getInitialTasks();
  }
}

export async function queryLiveTasks(filters: {
  statuses?: string[];
  assignee?: string;
}): Promise<Record<string, unknown>> {
  const all = await fetchLiveTasks();

  let tasks = all;
  const statuses = (filters.statuses ?? []).filter(s =>
    Object.keys(TASK_STATUS_LABELS).includes(s)
  ) as TaskStatus[];
  if (statuses.length > 0) tasks = tasks.filter(t => statuses.includes(t.status));

  let assigneeResolved: string | undefined;
  if (filters.assignee) {
    const n = norm(filters.assignee);
    assigneeResolved = ASSIGNEES.find(
      a => norm(a) === n || norm(a).includes(n) || n.includes(norm(a)) ||
        norm(a).split(" ").some(p => p.length >= 3 && n.includes(p))
    );
    if (!assigneeResolved) {
      return { error: "المكلَّف غير موجود", availableAssignees: ASSIGNEES };
    }
    tasks = tasks.filter(t => t.assignee === assigneeResolved);
  }

  const countsByStatus: Record<string, number> = {};
  (Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).forEach(s => {
    countsByStatus[TASK_STATUS_LABELS[s]] = tasks.filter(t => t.status === s).length;
  });

  return {
    source: "بيانات صفحة المهام الحيّة (Firestore)",
    totalInSystem: all.length,
    count: tasks.length,
    ...(assigneeResolved ? { assignee: assigneeResolved } : {}),
    countsByStatus,
    tasks: tasks.slice(0, 30).map(t => ({
      title: t.title,
      assignee: t.assignee,
      status: TASK_STATUS_LABELS[t.status] ?? t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      progress: t.progress,
      project: t.projectName,
    })),
  };
}

// ─────────────────────────────────────────────────────────────
// 2) المعاملات — نفس مصفوفات صفحة المعاملات
// ─────────────────────────────────────────────────────────────
const TX_BOXES: Record<string, { label: string; rows: Transaction[] }> = {
  inbox: { label: "الوارد", rows: MOCK_INBOX },
  outbox: { label: "الصادر", rows: MOCK_OUTBOX },
  archive: { label: "الأرشيف", rows: MOCK_ARCHIVE },
};

export function queryTransactions(filters: {
  box?: string;
  status?: string;
  personName?: string;
}): Record<string, unknown> {
  const boxes = filters.box && TX_BOXES[filters.box]
    ? [[filters.box, TX_BOXES[filters.box]] as const]
    : (Object.entries(TX_BOXES) as [string, { label: string; rows: Transaction[] }][]);

  let rows = boxes.flatMap(([key, b]) => b.rows.map(t => ({ ...t, box: b.label, boxKey: key })));

  if (filters.status && filters.status in TX_STATUS_LABELS) {
    rows = rows.filter(t => t.status === filters.status);
  }
  if (filters.personName) {
    const n = norm(filters.personName);
    rows = rows.filter(t => norm(t.person).includes(n) || n.includes(norm(t.person)));
    if (rows.length === 0) {
      return {
        error: "لا توجد معاملات لهذا الشخص",
        availablePersons: [...new Set(Object.values(TX_BOXES).flatMap(b => b.rows.map(t => t.person)))],
      };
    }
  }

  const countsByStatus: Record<string, number> = {};
  (Object.keys(TX_STATUS_LABELS) as Transaction["status"][]).forEach(s => {
    countsByStatus[TX_STATUS_LABELS[s]] = rows.filter(t => t.status === s).length;
  });

  return {
    source: "بيانات صفحة المعاملات",
    boxCounts: { الوارد: MOCK_INBOX.length, الصادر: MOCK_OUTBOX.length, الأرشيف: MOCK_ARCHIVE.length },
    count: rows.length,
    countsByStatus,
    transactions: rows.map(t => ({
      number: t.number,
      title: t.title,
      type: t.type,
      box: t.box,
      status: TX_STATUS_LABELS[t.status],
      date: t.date,
      person: t.person,
    })),
  };
}

// ─────────────────────────────────────────────────────────────
// 3) دوام فريق المعارض — نفس مولّد الصفحة ونفس الإجماليات
// ─────────────────────────────────────────────────────────────
interface RosterEntry { name: string; showroom: string; region: string }

const ATT_ROSTER: RosterEntry[] = (() => {
  const list: RosterEntry[] = [];
  TA_REGIONS.forEach(r =>
    (TA_SHOWROOMS_BY_REGION[r] || []).forEach(sr =>
      (TA_SELLERS_BY_SHOWROOM[sr] || []).forEach(n => list.push({ name: n, showroom: sr, region: r }))
    )
  );
  return list;
})();

export function attendanceRoster(): Record<string, unknown> {
  return {
    source: "صفحة دوام فريق المعارض",
    officialHoursPerDay: OFFICIAL_HOURS,
    officialStart: "10:00 ص",
    weeklyRest: "الجمعة والسبت",
    regions: TA_REGIONS.map(r => ({
      region: r,
      showrooms: (TA_SHOWROOMS_BY_REGION[r] || []).map(sr => ({
        showroom: sr,
        sellers: TA_SELLERS_BY_SHOWROOM[sr] || [],
      })),
    })),
    totalSellers: ATT_ROSTER.length,
  };
}

function resolveSeller(name: string): RosterEntry[] {
  const n = norm(name);
  if (!n) return [];
  const exact = ATT_ROSTER.filter(e => norm(e.name) === n);
  if (exact.length > 0) return exact;
  const partial = ATT_ROSTER.filter(e => norm(e.name).includes(n) || n.includes(norm(e.name)));
  if (partial.length > 0) return partial;
  return ATT_ROSTER.filter(e =>
    norm(e.name).split(" ").some(p => p.length >= 3 && n.includes(p))
  );
}

function to12(min: number | null): string {
  if (min === null) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  const period = h >= 12 ? "م" : "ص";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

const WEEKDAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export function sellerAttendance(args: {
  sellerName: string;
  year?: number;
  month?: number; // 1-12
  day?: number;   // يوم محدد اختياري
}): Record<string, unknown> {
  const today = new Date();
  const year = args.year ?? today.getFullYear();
  const month1 = args.month ?? today.getMonth() + 1;
  const month = month1 - 1;

  const matches = resolveSeller(args.sellerName);
  if (matches.length === 0) {
    return {
      error: "البائع غير موجود في فريق المعارض",
      hint: "استخدم أداة getAttendanceRoster لعرض جميع البائعين",
      availableSellers: ATT_ROSTER.map(e => `${e.name} (${e.showroom})`),
    };
  }
  const emp = matches[0];
  const alsoMatched = matches.length > 1 ? matches.slice(1).map(e => `${e.name} (${e.showroom})`) : undefined;

  // يوم محدد → تفاصيل اليوم كما في نافذة تفاصيل اليوم بالصفحة
  if (args.day) {
    const att = getDayAttendance(emp.name, year, month, args.day);
    const date = new Date(year, month, args.day);
    return {
      source: "صفحة دوام فريق المعارض",
      seller: emp.name,
      showroom: emp.showroom,
      region: emp.region,
      date: `${year}-${String(month1).padStart(2, "0")}-${String(args.day).padStart(2, "0")}`,
      weekday: WEEKDAYS_AR[date.getDay()],
      status: ATT_STATUS_LABELS[att.status],
      checkIn: to12(att.inMin),
      checkOut: to12(att.outMin),
      actualHours: r2(att.actualH),
      delayAtCheckInH: r2(att.delayInH),
      totalDelayH: r2(att.totalDelayH),
      compensatedH: r2(att.compH),
      netDelayH: r2(att.dayDelayH),
      netHours: r2(att.netH),
      personalPermitH: r2(att.personalPermitH),
      missionH: r2(att.missionH),
      ...(alsoMatched ? { otherMatches: alsoMatched } : {}),
    };
  }

  // شهر كامل → نفس معادلات إجماليات جدول الصفحة تماماً
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let required = 0, actual = 0, comp = 0, personal = 0, missionPermit = 0, fullAbsences = 0;
  let netDelay = 0;
  const statusDays: Record<AttStatus, number> = {
    present: 0, late: 0, absent: 0, weekly_leave: 0, annual_leave: 0, sick_leave: 0, mission: 0,
  };
  const lateDays: number[] = [];
  const absentDays: number[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const att = getDayAttendance(emp.name, year, month, day);
    statusDays[att.status] += 1;
    if (["present", "late", "absent"].includes(att.status)) required += OFFICIAL_HOURS;
    if (att.status === "mission") { required += OFFICIAL_HOURS; missionPermit += att.missionH; }
    actual += att.actualH;
    comp += att.compH;
    personal += att.personalPermitH;
    netDelay += att.dayDelayH;
    if (att.status === "absent") { fullAbsences += 1; absentDays.push(day); }
    if (att.status === "late") lateDays.push(day);
  }
  const net = actual + comp - required;
  const absenceH = Math.min(0, net);

  const daysByStatus: Record<string, number> = {};
  (Object.keys(statusDays) as AttStatus[]).forEach(s => {
    daysByStatus[ATT_STATUS_LABELS[s]] = statusDays[s];
  });

  return {
    source: "صفحة دوام فريق المعارض (نفس أرقام جدول الشهر)",
    seller: emp.name,
    showroom: emp.showroom,
    region: emp.region,
    year,
    month: month1,
    daysInMonth,
    daysByStatus,
    lateDaysOfMonth: lateDays,
    absentDaysOfMonth: absentDays,
    hours: {
      requiredH: r2(required),
      actualH: r2(actual),
      compensatedH: r2(comp),
      personalPermitH: r2(personal),
      missionPermitH: r2(missionPermit),
      netH: r2(net),
      absenceH: r2(absenceH),
      netDelayH: r2(netDelay),
    },
    fullAbsenceDays: fullAbsences,
    ...(alsoMatched ? { otherMatches: alsoMatched } : {}),
  };
}

// ─────────────────────────────────────────────────────────────
// 4) إجازات المستخدم الحالي — نفس بيانات صفحة الملف الشخصي
// ─────────────────────────────────────────────────────────────
export function myLeaves(): Record<string, unknown> {
  return {
    source: "صفحة الملف الشخصي — تبويب الإجازات",
    balances: MY_LEAVE_BALANCES.map(b => ({
      type: b.type,
      total: b.total,
      used: b.used,
      remaining: b.total - b.used,
    })),
    history: MY_LEAVE_HISTORY,
  };
}
