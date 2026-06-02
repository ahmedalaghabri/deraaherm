import { useState, useMemo } from "react";
import { Users, Building2, Scale, Phone, BadgeCheck, CalendarDays, Crown } from "lucide-react";
import { cn } from "../lib/utils";

type GroupType = "team" | "department" | "committee";
type FilterType = "all" | GroupType;
type ViewMode = "table" | "cards";

interface Employee {
  name: string;
  title: string;
  empNo: string;
  hireDate: string;
  mobile: string;
}

interface Group {
  name: string;
  type: GroupType;
  head?: string;
  members: string[];
}

const EMPLOYEES: Record<string, Employee> = {
  "فهد العتيبي": { name: "فهد العتيبي", title: "مدير المبيعات", empNo: "EMP-1001", hireDate: "2019-03-15", mobile: "0551234567" },
  "نورة السبيعي": { name: "نورة السبيعي", title: "أخصائي تسويق", empNo: "EMP-1002", hireDate: "2020-06-01", mobile: "0552345678" },
  "خالد القحطاني": { name: "خالد القحطاني", title: "محاسب أول", empNo: "EMP-1003", hireDate: "2018-01-20", mobile: "0553456789" },
  "منى الزهراني": { name: "منى الزهراني", title: "مديرة الجودة", empNo: "EMP-1004", hireDate: "2021-09-10", mobile: "0554567890" },
  "أحمد الشمري": { name: "أحمد الشمري", title: "مطور منتجات", empNo: "EMP-1005", hireDate: "2019-11-05", mobile: "0555678901" },
  "سارة الدوسري": { name: "سارة الدوسري", title: "أخصائية عناية", empNo: "EMP-1006", hireDate: "2022-02-14", mobile: "0556789012" },
  "ريم المطيري": { name: "ريم المطيري", title: "أمين مستودع", empNo: "EMP-1007", hireDate: "2020-12-01", mobile: "0557890123" },
  "سلطان الحربي": { name: "سلطان الحربي", title: "مشرف مخزون", empNo: "EMP-1008", hireDate: "2017-08-22", mobile: "0558901234" },
};

const GROUPS: Group[] = [
  { name: "فريق المبيعات", type: "team", head: "فهد العتيبي", members: ["فهد العتيبي", "نورة السبيعي", "خالد القحطاني"] },
  { name: "فريق التسويق", type: "team", head: "منى الزهراني", members: ["منى الزهراني", "أحمد الشمري", "سارة الدوسري"] },
  { name: "قسم تطوير المنتجات", type: "department", head: "أحمد الشمري", members: ["أحمد الشمري", "فهد العتيبي", "منى الزهراني", "سارة الدوسري"] },
  { name: "قسم العطور", type: "department", head: "فهد العتيبي", members: ["فهد العتيبي", "نورة السبيعي", "خالد القحطاني"] },
  { name: "لجنة جرد المخزون", type: "committee", head: "سلطان الحربي", members: ["سلطان الحربي", "ريم المطيري", "خالد القحطاني", "نورة السبيعي"] },
  { name: "لجنة الجودة", type: "committee", head: "منى الزهراني", members: ["منى الزهراني", "فهد العتيبي", "سارة الدوسري"] },
];

const TYPE_CONFIG: Record<GroupType, { label: string; singular: string; icon: React.ElementType; accent: string; badgeBg: string; badgeText: string; iconBg: string }> = {
  team: { label: "الفرق", singular: "فريق", icon: Users, accent: "bg-teal-500", badgeBg: "bg-teal-50 dark:bg-teal-900/30", badgeText: "text-teal-600 dark:text-teal-300", iconBg: "bg-teal-500" },
  department: { label: "الأقسام", singular: "قسم", icon: Building2, accent: "bg-blue-500", badgeBg: "bg-blue-50 dark:bg-blue-900/30", badgeText: "text-blue-600 dark:text-blue-300", iconBg: "bg-blue-500" },
  committee: { label: "اللجان", singular: "لجنة", icon: Scale, accent: "bg-violet-500", badgeBg: "bg-violet-50 dark:bg-violet-900/30", badgeText: "text-violet-600 dark:text-violet-300", iconBg: "bg-violet-500" },
};

const AVATAR_COLORS = ["bg-violet-500", "bg-cyan-500", "bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-blue-500"];
function avatarColor(name: string) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]; }
function initials(name: string) { const p = name.trim().split(" "); return p.length >= 2 ? p[0][0] + p[1][0] : name.slice(0, 2); }
function fmtDate(d: string) {
  if (!d) return "";
  const [y, m, day] = d.split("-").map(Number);
  const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  return `${day} ${months[m - 1]} ${y}`;
}

interface TeamsPageProps {
  filter?: FilterType;
  search?: string;
  view?: ViewMode;
}

export default function TeamsPage({ filter: externalFilter, search: externalSearch, view: externalView }: TeamsPageProps = {}) {
  const [internalFilter, _setInternalFilter] = useState<FilterType>("all");
  const [internalView, _setInternalView] = useState<ViewMode>("table");
  const [internalSearch, _setInternalSearch] = useState("");

  const filter = externalFilter ?? internalFilter;
  const view = externalView ?? internalView;
  const search = externalSearch ?? internalSearch;

  const visibleGroups = useMemo(() => {
    let g = filter === "all" ? GROUPS : GROUPS.filter(x => x.type === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      g = g.filter(grp => grp.name.toLowerCase().includes(q) || grp.members.some(m => m.toLowerCase().includes(q)));
    }
    return g;
  }, [filter, search]);

  return (
    <div className="max-w-[1600px] mx-auto px-2 sm:px-4 py-4 space-y-4">
      {/* Groups */}
      {visibleGroups.length === 0 ? (
        <div className="py-20 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">لا توجد نتائج مطابقة</p>
        </div>
      ) : (
        visibleGroups.map(group => {
          const cfg = TYPE_CONFIG[group.type];
          const Icon = cfg.icon;
          return (
            <div key={group.name} className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-700 overflow-hidden">
              {/* Group header */}
              <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100 dark:border-neutral-700">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0", cfg.iconBg)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">{group.name}</h3>
                      <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", cfg.badgeBg, cfg.badgeText)}>{cfg.singular}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{group.members.length} أعضاء{group.head ? ` · المسؤول: ${group.head}` : ""}</p>
                  </div>
                </div>
              </div>

              {/* Members */}
              {view === "table" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[720px]">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-neutral-700 text-right text-xs text-gray-400">
                        <th className="px-4 py-3 font-medium">الاسم</th>
                        <th className="px-4 py-3 font-medium">المسمى الوظيفي</th>
                        <th className="px-4 py-3 font-medium">الرقم الوظيفي</th>
                        <th className="px-4 py-3 font-medium">تاريخ التعيين</th>
                        <th className="px-4 py-3 font-medium text-right">رقم الجوال</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.members.map(name => {
                        const emp = EMPLOYEES[name];
                        const isHead = group.head === name;
                        return (
                          <tr key={name} className="border-b border-gray-50 dark:border-neutral-700/50 hover:bg-gray-50/60 dark:hover:bg-neutral-700/20 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0", avatarColor(name))}>{initials(name)}</div>
                                <span className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-1">
                                  {name}
                                  {isHead && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{emp?.title || "—"}</td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{emp?.empNo || "—"}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{emp ? fmtDate(emp.hireDate) : "—"}</td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400 text-right" dir="ltr">{emp?.mobile || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.members.map(name => {
                    const emp = EMPLOYEES[name];
                    const isHead = group.head === name;
                    return (
                      <div key={name} className="rounded-xl border border-gray-100 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-700/30 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn("w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0", avatarColor(name))}>{initials(name)}</div>
                          <div className="text-right min-w-0">
                            <h4 className="font-bold text-gray-800 dark:text-gray-100 truncate flex items-center gap-1">
                              {name}
                              {isHead && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{emp?.title || "—"}</p>
                          </div>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <BadgeCheck className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="font-mono">{emp?.empNo || "—"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <CalendarDays className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{emp ? fmtDate(emp.hireDate) : "—"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="font-mono" dir="ltr">{emp?.mobile || "—"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
