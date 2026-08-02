const dailyTasks = [
  "تنظيف الواجهات والزجاج",
  "مسح وترتيب الأرفف",
  "التأكد من نظافة منطقة الكاشير",
  "مراجعة وترتيب المنتجات المعروضة",
  "تعبئة المنتجات الناقصة على الأرفف",
  "مطابقة الأسعار والعروض",
  "جرد الخزنة النقدية",
  "مراجعة المرتجعات والملاحظات",
  "إغلاق الحساب اليومي",
  "التأكد من إغلاق المعرض وتأمينه",
];

const storageKey = `deraah-daily-routine-${new Date().toISOString().slice(0, 10)}`;
const getCompletedTasks = () => {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(storageKey) || "[]"));
  } catch {
    return new Set<string>();
  }
};

const saveCompletedTasks = (completed: Set<string>) => {
  localStorage.setItem(storageKey, JSON.stringify([...completed]));
};

const ensureStyles = () => {
  if (document.getElementById("daily-routine-styles")) return;
  const style = document.createElement("style");
  style.id = "daily-routine-styles";
  style.textContent = `
    .daily-routine-backdrop{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:16px;background:rgba(15,23,42,.46);backdrop-filter:blur(5px);direction:rtl;font-family:inherit}
    .daily-routine-dialog{width:min(760px,100%);max-height:min(760px,calc(100vh - 32px));display:flex;flex-direction:column;overflow:hidden;border:1px solid #e5e7eb;border-radius:22px;background:#fff;box-shadow:0 24px 80px rgba(15,23,42,.22);animation:daily-routine-enter .22s ease-out}
    .daily-routine-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:22px 24px 18px;border-bottom:1px solid #eef0f3}
    .daily-routine-title-row{display:flex;align-items:center;gap:12px}
    .daily-routine-icon{display:grid;place-items:center;width:42px;height:42px;flex:none;border-radius:13px;background:#effaf7;color:#2e9f82}
    .daily-routine-title{margin:0;color:#111827;font-size:19px;font-weight:800}
    .daily-routine-subtitle{margin:5px 0 0;color:#6b7280;font-size:13px}
    .daily-routine-close{display:grid;place-items:center;width:36px;height:36px;border:0;border-radius:10px;background:#f5f6f8;color:#4b5563;cursor:pointer}
    .daily-routine-progress-wrap{padding:16px 24px;background:#fafcff;border-bottom:1px solid #eef0f3}
    .daily-routine-progress-meta{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px;color:#374151;font-size:13px;font-weight:700}
    .daily-routine-progress{height:8px;overflow:hidden;border-radius:999px;background:#e9edf2}
    .daily-routine-progress-value{height:100%;border-radius:inherit;background:#42b99b;transition:width .25s ease}
    .daily-routine-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:18px 24px;overflow:auto}
    .daily-routine-item{display:flex;align-items:center;gap:11px;min-height:66px;padding:12px 13px;border:1px solid #e8eaee;border-radius:14px;background:#fff;cursor:pointer;transition:border-color .18s,background .18s,transform .18s}
    .daily-routine-item:hover{border-color:#a8dfd1;transform:translateY(-1px)}
    .daily-routine-item.is-complete{border-color:#bceadd;background:#f3fcf9}
    .daily-routine-check{appearance:none;width:21px;height:21px;flex:none;margin:0;border:1.5px solid #9ca3af;border-radius:6px;background:#fff;cursor:pointer}
    .daily-routine-check:checked{border-color:#36aa8c;background:#36aa8c url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='none' stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2.4' d='m5 10 3 3 7-7'/%3E%3C/svg%3E") center/17px no-repeat}
    .daily-routine-copy{min-width:0;flex:1}
    .daily-routine-name{display:block;color:#20242b;font-size:14px;font-weight:700;line-height:1.5}
    .daily-routine-status{display:block;margin-top:2px;color:#9ca3af;font-size:12px;font-weight:600}
    .daily-routine-item.is-complete .daily-routine-status{color:#229878}
    .daily-routine-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 24px;border-top:1px solid #eef0f3;background:#fafcff}
    .daily-routine-reset{border:0;background:transparent;color:#6b7280;font:inherit;font-size:13px;font-weight:700;cursor:pointer}
    .daily-routine-done{min-width:118px;padding:10px 18px;border:0;border-radius:10px;background:#111;color:#fff;font:inherit;font-size:13px;font-weight:800;cursor:pointer}
    @keyframes daily-routine-enter{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:none}}
    @media(max-width:640px){.daily-routine-backdrop{padding:8px;place-items:end center}.daily-routine-dialog{max-height:92vh;border-radius:20px 20px 12px 12px}.daily-routine-header{padding:18px 16px 15px}.daily-routine-progress-wrap{padding:14px 16px}.daily-routine-list{grid-template-columns:1fr;padding:14px 16px}.daily-routine-footer{padding:13px 16px}.daily-routine-title{font-size:17px}}
    @media(prefers-reduced-motion:reduce){.daily-routine-dialog{animation:none}.daily-routine-item,.daily-routine-progress-value{transition:none}}
  `;
  document.head.appendChild(style);
};

const openDailyRoutine = () => {
  if (document.querySelector(".daily-routine-backdrop")) return;
  ensureStyles();
  const completed = getCompletedTasks();
  const backdrop = document.createElement("div");
  backdrop.className = "daily-routine-backdrop";
  backdrop.innerHTML = `
    <section class="daily-routine-dialog" role="dialog" aria-modal="true" aria-labelledby="daily-routine-title">
      <header class="daily-routine-header">
        <div class="daily-routine-title-row">
          <span class="daily-routine-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1.2 1.2L7 4.8M3.5 12l1.2 1.2L7 10.8M3.5 18l1.2 1.2L7 16.8"/></svg>
          </span>
          <div>
            <h2 id="daily-routine-title" class="daily-routine-title">المهام اليومية</h2>
            <p class="daily-routine-subtitle">قائمة الأعمال الروتينية للبائع — ${dailyTasks.length} مهام</p>
          </div>
        </div>
        <button class="daily-routine-close" type="button" aria-label="إغلاق">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 6 12 12M18 6 6 18"/></svg>
        </button>
      </header>
      <div class="daily-routine-progress-wrap">
        <div class="daily-routine-progress-meta"><span>التقدم اليومي</span><span data-progress-label></span></div>
        <div class="daily-routine-progress"><div class="daily-routine-progress-value" data-progress-bar></div></div>
      </div>
      <div class="daily-routine-list">
        ${dailyTasks.map((task, index) => `
          <label class="daily-routine-item ${completed.has(task) ? "is-complete" : ""}">
            <input class="daily-routine-check" type="checkbox" data-task-index="${index}" ${completed.has(task) ? "checked" : ""}>
            <span class="daily-routine-copy">
              <span class="daily-routine-name">${task}</span>
              <span class="daily-routine-status">${completed.has(task) ? "مكتمل" : "بانتظار التنفيذ"}</span>
            </span>
          </label>`).join("")}
      </div>
      <footer class="daily-routine-footer">
        <button class="daily-routine-reset" type="button">إلغاء تحديد الكل</button>
        <button class="daily-routine-done" type="button">تم</button>
      </footer>
    </section>`;

  const close = () => {
    document.removeEventListener("keydown", onKeydown);
    backdrop.remove();
    document.body.style.overflow = "";
  };
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") close();
  };
  const updateProgress = () => {
    const checked = backdrop.querySelectorAll<HTMLInputElement>(".daily-routine-check:checked").length;
    const percentage = Math.round((checked / dailyTasks.length) * 100);
    const label = backdrop.querySelector<HTMLElement>("[data-progress-label]");
    const bar = backdrop.querySelector<HTMLElement>("[data-progress-bar]");
    if (label) label.textContent = `${checked} من ${dailyTasks.length} مكتملة`;
    if (bar) bar.style.width = `${percentage}%`;
  };

  backdrop.addEventListener("change", (event) => {
    const checkbox = event.target as HTMLInputElement;
    if (!checkbox.matches(".daily-routine-check")) return;
    const index = Number(checkbox.dataset.taskIndex);
    const task = dailyTasks[index];
    const item = checkbox.closest(".daily-routine-item");
    const status = item?.querySelector(".daily-routine-status");
    if (checkbox.checked) completed.add(task);
    else completed.delete(task);
    item?.classList.toggle("is-complete", checkbox.checked);
    if (status) status.textContent = checkbox.checked ? "مكتمل" : "بانتظار التنفيذ";
    saveCompletedTasks(completed);
    updateProgress();
  });
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) close();
  });
  backdrop.querySelector(".daily-routine-close")?.addEventListener("click", close);
  backdrop.querySelector(".daily-routine-done")?.addEventListener("click", close);
  backdrop.querySelector(".daily-routine-reset")?.addEventListener("click", () => {
    completed.clear();
    saveCompletedTasks(completed);
    backdrop.querySelectorAll<HTMLInputElement>(".daily-routine-check").forEach((checkbox) => {
      checkbox.checked = false;
      const item = checkbox.closest(".daily-routine-item");
      item?.classList.remove("is-complete");
      const status = item?.querySelector(".daily-routine-status");
      if (status) status.textContent = "بانتظار التنفيذ";
    });
    updateProgress();
  });
  document.addEventListener("keydown", onKeydown);
  document.body.appendChild(backdrop);
  document.body.style.overflow = "hidden";
  updateProgress();
  backdrop.querySelector<HTMLElement>(".daily-routine-close")?.focus();
};

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const card = target.closest("button");
  if (!card) return;
  const text = (card.textContent || "").replace(/\s+/g, " ").trim();
  if (!text.includes("مهام يومية")) return;
  event.preventDefault();
  event.stopPropagation();
  openDailyRoutine();
}, true);
