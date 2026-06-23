#!/usr/bin/env python3

filepath = "/Users/ahmadoz/Documents/ERMDERAAH-main/src/components/TasksPage.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Find the start of the create/edit modal: "      {/* Modal */}"
start = None
for i, line in enumerate(lines):
    if line.strip() == "{/* Modal */}" and i > 1400:
        start = i
        break

# Find the end: the AnimatePresence close after the modal
end = None
for i in range(start + 1, len(lines)):
    if lines[i].strip() == "</AnimatePresence>" and i > start + 100:
        end = i
        break

print(f"Found modal from line {start+1} to {end+1}")

# Extract inner content from the body - we need to keep lines between
# the body start and the footer
# Body starts after: <div className="p-6 space-y-5" dir="rtl">
# Footer starts before: {/* Footer */}

# Actually, let's just rebuild the whole thing

new_modal = '''      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]"
              onClick={() => { setModalOpen(false); setFormMobileTab("details"); setFormComment(""); }}
            />
            <motion.div
              key="task-form"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="fixed inset-4 sm:inset-8 lg:inset-12 z-[70] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-w-[1320px] mx-auto"
              dir="rtl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs text-neutral-400 flex items-center gap-1.5 shrink-0">
                    <span className="px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700 text-[11px] font-medium bg-neutral-50 dark:bg-neutral-800">{editing ? "تعديل" : "جديد"}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => { setModalOpen(false); setFormMobileTab("details"); setFormComment(""); }} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mobile tabs */}
              <div className="flex sm:hidden border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
                <button onClick={() => setFormMobileTab("details")} className={cn("flex-1 py-2.5 text-xs font-bold transition-colors", formMobileTab === "details" ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-500" : "text-neutral-500 dark:text-neutral-400")}>المهمة</button>
                <button onClick={() => setFormMobileTab("activity")} className={cn("flex-1 py-2.5 text-xs font-bold transition-colors", formMobileTab === "activity" ? "text-teal-600 dark:text-teal-400 border-b-2 border-teal-500" : "text-neutral-500 dark:text-neutral-400")}>النشاط والتعليقات</button>
              </div>

              {/* Body - vertical split: 45% form / 55% activity */}
              <div className="flex-1 overflow-hidden flex flex-col sm:flex-row">
                {/* Main content - left 45% */}
                <div className={cn("sm:w-[45%] min-w-0 overflow-y-auto", formMobileTab === "activity" ? "hidden sm:block" : "")}>
                  <div className="p-5 space-y-5" dir="rtl">
                    {/* Title */}
                    <input value={form.title || ""} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full text-xl font-bold text-neutral-900 dark:text-white bg-transparent focus:outline-none text-right placeholder:text-neutral-300" placeholder="اسم المهمة" autoFocus />

                    {/* Description */}
                    <textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full min-h-[60px] text-sm text-neutral-600 dark:text-neutral-300 bg-transparent focus:outline-none resize-none text-right placeholder:text-neutral-400" placeholder="أضف وصفاً..." />

                    {/* Quick action pills */}
                    <div className="flex flex-wrap gap-2" ref={formDropdownRef}>
'''

# Now we need to insert the existing pills code from the old modal
# The pills start at the old line that has "{/* Status Pill */}"
# and end before "{/* Progress Pill */}" or before the footer

# Let's find the pills in the old modal body
old_start_idx = None
old_end_idx = None
for i in range(start, end):
    if "{/* Status Pill */}" in lines[i]:
        old_start_idx = i
    if "{/* Selected tags */}" in lines[i]:
        old_end_idx = i
        # Go until the end of the selected tags block
        while old_end_idx < end and lines[old_end_idx].strip() != "</div>":
            old_end_idx += 1
        # Include the closing </div>
        old_end_idx += 1
        break

print(f"Pills from {old_start_idx+1} to {old_end_idx+1}")

# Add the pills
for i in range(old_start_idx, old_end_idx):
    new_modal += lines[i]

# Continue with the rest of the left panel
new_modal += '''                    </div>

                    {/* Progress Pill */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">نسبة الإنجاز: {form.progress ?? 0}%</span>
                      <input type="range" min={0} max={100} value={form.progress || 0} onChange={e => setForm(f => ({ ...f, progress: parseInt(e.target.value) }))} className="w-20 h-1.5 accent-teal-500 cursor-pointer" />
                    </div>

                    {/* Subtasks */}
                    <div className="space-y-2">
                      {(form.subtasks || []).map((st, i) => (
                        <div key={st.id} className="flex items-center gap-2">
                          <button onClick={() => { const next = (form.subtasks || []).map((s, idx) => idx === i ? { ...s, completed: !s.completed } : s); setForm(f => ({ ...f, subtasks: next })); }} className={cn("w-4 h-4 rounded border flex items-center justify-center transition-colors", st.completed ? "bg-teal-500 border-teal-500" : "border-neutral-300")}>
                            {st.completed && <CheckSquare className="w-3 h-3 text-white" />}
                          </button>
                          <input value={st.title} onChange={e => { const next = (form.subtasks || []).map((s, idx) => idx === i ? { ...s, title: e.target.value } : s); setForm(f => ({ ...f, subtasks: next })); }} className="flex-1 text-sm bg-transparent focus:outline-none text-right" />
                          <button onClick={() => { const next = (form.subtasks || []).filter((_, idx) => idx !== i); setForm(f => ({ ...f, subtasks: next })); }} className="text-neutral-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                      <button onClick={() => { const next = [...(form.subtasks || []), { id: String(Date.now()), title: "مهمة فرعية جديدة", completed: false }]; setForm(f => ({ ...f, subtasks: next })); }} className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center"><CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /></div>
                        إضافة مهمة فرعية
                      </button>
                    </div>

                    {/* Footer actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      <button className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"><Paperclip className="w-4 h-4" /></button>
                      <button className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"><Bell className="w-4 h-4" /></button>
                      <button onClick={save} className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 transition-colors">{editing ? "حفظ التعديلات" : "إنشاء مهمة"}</button>
                    </div>
                  </div>
                </div>

                {/* Activity sidebar - right 55% */}
                <div className={cn("sm:w-[55%] min-w-0 border-t sm:border-t-0 sm:border-r border-neutral-100 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 overflow-y-auto flex flex-col", formMobileTab === "details" ? "hidden sm:flex" : "")}>
                  {/* Activity header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">النشاط والتعليقات</h3>
                    <div className="flex items-center gap-0.5 text-neutral-400">
                      <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"><Search className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"><Bell className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  {/* Activity items */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Created task entry */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center shrink-0 shadow-sm border border-teal-100 dark:border-teal-800/40">
                        <FilePlus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">أنشأت هذه المهمة</p>
                        <span className="text-xs text-neutral-400 mt-0.5 block">{form.createdAt || today}</span>
                      </div>
                    </div>

                    {((editing ? editing.comments : form.comments) || []).length === 0 && (
                      <div className="flex flex-col items-center justify-center py-6 text-neutral-400">
                        <Bell className="w-8 h-8 mb-2 opacity-40" />
                        <p className="text-sm">لا يوجد نشاط بعد</p>
                      </div>
                    )}
                    {((editing ? editing.comments : form.comments) || []).map(c => (
                      <div key={c.id} className="flex gap-3">
                        <span className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm", avatarColor(c.author))}>{initials(c.author)}</span>
                        <div className="flex-1 min-w-0 bg-white dark:bg-neutral-800 rounded-xl p-3 shadow-sm border border-neutral-100 dark:border-neutral-700/60">
                          <p className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed text-right">
                            <span className="font-semibold text-neutral-900 dark:text-white">{c.author}</span>
                          </p>
                          <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed text-right">{c.text}</p>
                          <span className="text-[11px] text-neutral-400 mt-2 block">{c.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Comment input */}
                  <div className="p-3 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shrink-0">
                    <div className="relative">
                      <textarea
                        value={formComment}
                        onChange={e => setFormComment(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter" && !e.shiftKey && formComment.trim()) {
                            e.preventDefault();
                            const newComment = { id: String(Date.now()), author: "أنت", text: formComment.trim(), date: "الآن" };
                            const currentComments = editing ? (editing.comments || []) : (form.comments || []);
                            const next = [...currentComments, newComment];
                            if (editing) {
                              setForm(f => ({ ...f, comments: next }));
                              setTasks(p => p.map(t => t.id === editing.id ? { ...t, comments: next } : t));
                            } else {
                              setForm(f => ({ ...f, comments: next }));
                            }
                            setFormComment("");
                          }
                        }}
                        placeholder="اكتب تعليقاً..."
                        className="w-full min-h-[48px] p-2.5 pr-10 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-sm text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400/50 resize-none text-right transition-all"
                      />
                      <button className="absolute left-2 bottom-2 p-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-500 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors"><Send className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
'''

result = lines[:start] + [new_modal] + lines[end+1:]

with open(filepath, "w", encoding="utf-8") as f:
    f.writelines(result)

print("Done")
