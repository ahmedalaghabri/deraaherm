import { useState, useRef, useEffect, useMemo } from "react";
import { MapPin, Clock, CheckSquare, Store } from "lucide-react";
import PageHeader from "./PageHeader";
import VisitsPage from "./VisitsPage";
import TeamSchedulePage from "./TeamSchedulePage";
import TeamAttendancePage, { TA_REGIONS, TA_SHOWROOMS_BY_REGION } from "./TeamAttendancePage";
import { cn } from "../lib/utils";

type ShowroomTab = "visits" | "team_schedule" | "team_attendance";

export default function ShowroomsPage() {
  const [activeTab, setActiveTab] = useState<ShowroomTab>("visits");

  // Team schedule showroom state
  const [tsShowroom, setTsShowroom] = useState<string>("");
  const [tsShowroomOpen, setTsShowroomOpen] = useState(false);
  const [tsShowroomSearch, setTsShowroomSearch] = useState("");
  const tsShowroomRef = useRef<HTMLDivElement>(null);
  const TS_SHOWROOMS = [
    "معرض الرياض - العليا",
    "معرض جدة - التحلية",
    "معرض الدمام - الشاطئ",
    "معرض مكة - العزيزية",
    "معرض المدينة - قباء",
    "معرض أبها - الخالدية",
    "معرض تبوك - المروج",
    "معرض حائل - السمراء",
  ];

  // Team attendance filters state
  const [taRegions, setTaRegions] = useState<string[]>([]);
  const [taShowroom, setTaShowroom] = useState<string>("");
  const [taSeller, setTaSeller] = useState<string>("");
  const [taDropdown, setTaDropdown] = useState<"region" | "showroom" | "seller" | null>(null);
  const taFilterRef = useRef<HTMLDivElement>(null);

  const toggleTaRegion = (r: string) => {
    setTaRegions(prev => {
      const next = prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r];
      const validShowrooms = next.flatMap(x => TA_SHOWROOMS_BY_REGION[x] || []);
      if (taShowroom && !validShowrooms.includes(taShowroom)) { setTaShowroom(""); setTaSeller(""); }
      return next;
    });
  };
  const toggleTaAllRegions = () => {
    setTaRegions(prev => {
      if (prev.length === TA_REGIONS.length) { setTaShowroom(""); setTaSeller(""); return []; }
      return [...TA_REGIONS];
    });
  };
  const taRegionLabel = taRegions.length === 0 ? "" : taRegions.length === TA_REGIONS.length ? "الكل" : taRegions.length === 1 ? taRegions[0] : `${taRegions.length} أقاليم`;

  const [taSearch, setTaSearch] = useState("");
  const showroomRegion = (sr: string) => TA_REGIONS.find(r => (TA_SHOWROOMS_BY_REGION[r] || []).includes(sr)) || "";

  const pickTaSeller = (name: string, sr: string) => {
    setTaSeller(name);
    if (taShowroom !== sr) {
      setTaShowroom(sr);
      const reg = showroomRegion(sr);
      if (reg) setTaRegions(prev => (prev.includes(reg) ? prev : [...prev, reg]));
    }
  };

  // Visits supervisor state
  const [svSupervisor, setSvSupervisor] = useState<string>("");
  const [svSupervisorOpen, setSvSupervisorOpen] = useState(false);
  const [svSupervisorSearch, setSvSupervisorSearch] = useState("");
  const svSupervisorRef = useRef<HTMLDivElement>(null);
  const SV_SUPERVISORS = [
    { id: "s1", name: "محمد القحطاني" },
    { id: "s2", name: "خالد الشمري" },
    { id: "s3", name: "فهد العنزي" },
    { id: "s4", name: "عبدالرحمن الدوسري" },
    { id: "s5", name: "سعد الحربي" },
    { id: "s6", name: "طلال الراشد" },
    { id: "s7", name: "سلطان العتيبي" },
    { id: "s8", name: "نواف المطيري" },
  ];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tsShowroomRef.current && !tsShowroomRef.current.contains(e.target as Node)) setTsShowroomOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (svSupervisorRef.current && !svSupervisorRef.current.contains(e.target as Node)) setSvSupervisorOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (taFilterRef.current && !taFilterRef.current.contains(e.target as Node)) setTaDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const tsFilteredShowrooms = useMemo(() => {
    const q = tsShowroomSearch.trim();
    if (!q) return TS_SHOWROOMS;
    return TS_SHOWROOMS.filter(s => s.includes(q));
  }, [tsShowroomSearch]);

  const svFilteredSupervisors = useMemo(() => {
    const q = svSupervisorSearch.trim();
    if (!q) return SV_SUPERVISORS;
    return SV_SUPERVISORS.filter(s => s.name.includes(q));
  }, [svSupervisorSearch]);

  return (
    <div className="min-h-screen font-sans" dir="rtl" style={{ ["--page-max-w" as string]: "calc(92% + 20px)" }}>
      <PageHeader
        tabs={[
          ["visits", "الزيارات", MapPin],
          ["team_schedule", "دوام الفريق", Clock],
          ["team_attendance", "حضور الفريق", CheckSquare],
        ]}
        active={activeTab}
        onChange={(key) => setActiveTab(key as ShowroomTab)}
      >
        <div className="px-2 sm:px-6 py-2 sm:py-[14px]">
          {activeTab === "visits" && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-0 sm:max-w-xs" ref={svSupervisorRef}>
                <button
                  onClick={() => setSvSupervisorOpen(v => !v)}
                  className="flex h-9 w-full items-center gap-2 px-3 rounded-lg border text-sm font-medium transition-colors bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60"
                >
                  <span className="text-neutral-400 dark:text-neutral-500 font-normal shrink-0">المشرف:</span>
                  <span className="truncate text-neutral-700 dark:text-neutral-200">{svSupervisor || "جميع المشرفين"}</span>
                </button>
                {svSupervisorOpen && (
                  <div className="absolute right-0 top-full mt-2 z-[60] flex min-w-[260px] max-h-[360px] flex-col overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 shadow-lg">
                    <div className="p-2 border-b border-neutral-100 dark:border-neutral-700">
                      <input
                        autoFocus
                        value={svSupervisorSearch}
                        onChange={(e) => setSvSupervisorSearch(e.target.value)}
                        placeholder="بحث عن مشرف..."
                        className="h-9 w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 px-3 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30"
                      />
                    </div>
                    <div className="flex-1 overflow-y-auto p-1">
                      <button
                        onClick={() => { setSvSupervisor(""); setSvSupervisorOpen(false); setSvSupervisorSearch(""); }}
                        className={cn("w-full px-3 py-2 text-sm text-right rounded-lg transition-colors", !svSupervisor ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700")}
                      >
                        جميع المشرفين
                      </button>
                      {svFilteredSupervisors.map(s => (
                        <button
                          key={s.id}
                          onClick={() => { setSvSupervisor(s.name); setSvSupervisorOpen(false); setSvSupervisorSearch(""); }}
                          className={cn("w-full px-3 py-2 text-sm text-right rounded-lg transition-colors", svSupervisor === s.name ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700")}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "team_schedule" && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-0 sm:max-w-xs" ref={tsShowroomRef}>
                <button
                  onClick={() => setTsShowroomOpen(v => !v)}
                  className="flex h-9 w-full items-center gap-2 px-3 rounded-lg border text-sm font-medium transition-colors bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60"
                >
                  <Store className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate text-neutral-700 dark:text-neutral-200">{tsShowroom || "اختر المعرض"}</span>
                </button>
                {tsShowroomOpen && (
                  <div className="absolute right-0 top-full mt-2 z-[60] flex min-w-[260px] max-h-[360px] flex-col overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 shadow-lg">
                    <div className="p-2 border-b border-neutral-100 dark:border-neutral-700">
                      <input
                        autoFocus
                        value={tsShowroomSearch}
                        onChange={(e) => setTsShowroomSearch(e.target.value)}
                        placeholder="بحث عن معرض..."
                        className="h-9 w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 px-3 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30"
                      />
                    </div>
                    <div className="flex-1 overflow-y-auto p-1">
                      {tsFilteredShowrooms.map(s => (
                        <button
                          key={s}
                          onClick={() => { setTsShowroom(s); setTsShowroomOpen(false); setTsShowroomSearch(""); }}
                          className={cn("w-full px-3 py-2 text-sm text-right rounded-lg transition-colors", tsShowroom === s ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700")}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "team_attendance" && (
            <div className="flex items-center gap-2" ref={taFilterRef}>
              <div className="relative shrink-0">
                <button
                  onClick={() => setTaDropdown(d => d === "region" ? null : "region")}
                  className="flex h-9 items-center gap-2 px-3 rounded-lg border text-sm font-medium transition-colors bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60"
                >
                  <span className="text-neutral-400 dark:text-neutral-500 font-normal shrink-0">الإقليم:</span>
                  <span className="truncate max-w-[120px] text-neutral-700 dark:text-neutral-200">{taRegionLabel || "الكل"}</span>
                </button>
                {taDropdown === "region" && (
                  <div className="absolute right-0 top-full mt-2 z-[60] min-w-[200px] max-h-[300px] overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 shadow-lg p-1">
                    <button
                      onClick={toggleTaAllRegions}
                      className={cn("w-full px-3 py-2 text-sm text-right rounded-lg transition-colors", taRegions.length === TA_REGIONS.length ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700")}
                    >
                      الكل
                    </button>
                    {TA_REGIONS.map(r => (
                      <button
                        key={r}
                        onClick={() => toggleTaRegion(r)}
                        className={cn("w-full px-3 py-2 text-sm text-right rounded-lg transition-colors flex items-center justify-between", taRegions.includes(r) ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/20 dark:text-indigo-300" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700")}
                      >
                        {r}
                        {taRegions.includes(r) && <CheckSquare className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative flex-1 min-w-0 sm:max-w-xs">
                <input
                  value={taSearch}
                  onChange={e => setTaSearch(e.target.value)}
                  placeholder="بحث عن معرض أو بائع..."
                  className="w-full h-9 px-3 text-sm rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 text-right"
                />
              </div>
            </div>
          )}
        </div>
      </PageHeader>

      <div className="max-w-[var(--page-max-w)] mx-auto px-2 sm:px-0 py-4">
        {activeTab === "visits" && <VisitsPage selectedSupervisor={svSupervisor} />}
        {activeTab === "team_schedule" && <TeamSchedulePage selectedShowroom={tsShowroom} />}
        {activeTab === "team_attendance" && <TeamAttendancePage region={taRegions[0] || ""} regions={taRegions} showroom={taShowroom} seller={taSeller} allMode={taRegions.length > 0 && !taShowroom} onEmployeeClick={(name, sr) => { pickTaSeller(name, sr); window.scrollTo({ top: 0, behavior: "smooth" }); }} />}
      </div>
    </div>
  );
}
