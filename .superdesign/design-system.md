# Deraah ERM — Task Journey Design System

## Product context

Deraah ERM is an Arabic-first internal operations system. The task workspace supports creating tasks, reviewing them in list/kanban/calendar views, direct inline editing, full editing, subtasks, attachments, activity, and comments.

Primary users are managers and employees who need to create, assign, update, and discuss tasks quickly without losing context.

## Task journey principles

1. **One task, one mental model.** Create, full edit, and details must reuse the same field order, labels, defaults, status language, and component behavior.
2. **Make persistence explicit.** A user must always know whether a change is a draft, saving, saved, failed, or immediately sent.
3. **Fast path first.** Title, description, owner, status, and due date are the essential fields. Project, source, tags, priority, progress, attachments, and subtasks remain accessible but visually secondary.
4. **Progressive disclosure.** Advanced metadata is grouped under a clear expandable section instead of presenting every control with equal weight.
5. **Comments are an independent immediate action.** Sending a comment is separate from saving task fields. The composer must state this through immediate feedback and an activity entry.
6. **Context survives transitions.** After create/save, keep the active view, search, filters, grouping, and scroll position. Highlight the changed task and offer “عرض المهمة” and “تراجع”.
7. **No invisible save behavior.** Direct detail edits auto-save with a persistent compact “تم الحفظ” indicator and undo. Full edit uses an explicit draft with Save/Cancel and an unsaved-changes guard.
8. **Viewport-safe overlays.** Inline popovers and action menus flip above the trigger and clamp to the visible viewport; they never render outside the screen.

## Canonical journey

### Create

- Primary toolbar CTA: “مهمة جديدة”.
- Opens a responsive task workspace:
  - Desktop: 44% form / 56% activity.
  - Mobile: full-screen sheet with “المهمة” and “النشاط” tabs.
- Header title: “إنشاء مهمة جديدة”.
- Essential section:
  - Task title — required, always labeled.
  - Description.
  - Assignee.
  - Status.
  - Due date.
- Advanced section:
  - Priority, project, source, tags, progress, dates, attachments.
- Related work section:
  - Subtasks with compact add/edit rows.
- Sticky footer:
  - “إلغاء” secondary.
  - Optional “حفظ كمسودة” only if drafts are supported.
  - “إنشاء المهمة” primary, disabled until title is valid.
- Validation:
  - Inline error under title.
  - Focus the first invalid field.
  - Error summary announced to assistive technology.
- Success:
  - Close editor.
  - Keep current task view and filters.
  - Place the task in the correct list/kanban/calendar location.
  - Highlight it for 2–3 seconds.
  - Toast: “تم إنشاء المهمة” with “عرض المهمة” and “تراجع”.

### View surfaces

- List is the dense management view.
- Task title opens details.
- Cell controls edit one field and save immediately.
- Each cell popover includes a meaningful label, viewport-safe positioning, loading feedback, and an undo affordance.
- Row action menu contains:
  - فتح التفاصيل.
  - تعديل كامل.
  - تكرار.
  - حذف (destructive section).
- Kanban cards preserve the same metadata hierarchy:
  - Title, project, assignee, due date, status/priority, progress.
  - Clicking opens details.
  - Dragging changes status and shows an undo toast.
- Calendar cards use the same title/status identity and open details.

### Details

- Header includes task state, task identity, “آخر حفظ”, share/print actions, and close.
- Details pane allows direct auto-save edits.
- Activity pane uses the approved WhatsApp-inspired conversation design.
- Desktop detail pane can collapse so activity uses full width.
- Mobile uses details/activity tabs and keeps the composer pinned to the safe-area bottom.
- Auto-save feedback states:
  - “جارٍ الحفظ…”
  - “تم الحفظ”
  - “تعذر الحفظ — إعادة المحاولة”
- Closing while a field request is in flight waits or warns.

### Full edit

- Same field hierarchy and visual components as Create.
- Header title: “تعديل المهمة”.
- Changes remain in a local draft until “حفظ التعديلات”.
- Cancel/close with dirty fields asks:
  - “متابعة التعديل”
  - “تجاهل التغييرات”
- Comments remain immediate and are visually separated from draft fields. After send, show the message immediately with delivered state.
- Save success returns to the prior view, highlights the row/card, and shows an undo-capable toast.

## Visual language

- Direction: RTL.
- Font: SF Arabic.
- Light task workspace: `#FAFCFF`.
- White input/card surface: `#FFFFFF`.
- Primary action: teal `#14B8A6`; hover `#0D9488`.
- Primary neutral: `#171717`.
- Main text: `#111827`.
- Secondary text: `#667085`.
- Muted text: `#98A2B3`.
- Border: `#E5E7EB`.
- Error: `#E5484D`.
- Warning: `#F59E0B`.
- Success: `#12B76A`.
- Information: `#3B82F6`.
- Chat outgoing: `#D9FDD3`.
- Chat incoming: `#FFFFFF`.
- Conversation dark: `#0B141A`.

## Typography

- Page/task title: 20px desktop, 18px mobile, bold.
- Section title: 14px, semibold.
- Body/control: 14px.
- Mobile form input: 16px minimum to avoid browser zoom.
- Metadata: 12px.
- Timestamp/helper: 10–11px.
- Never use 9px for actionable or essential information.

## Layout and spacing

- 4px micro alignment.
- 8px compact control gap.
- 12px field/card internal gap.
- 16px section gap.
- 20–24px major panel padding.
- Control height: 40px desktop, 44px mobile.
- Icon action target: minimum 40px desktop / 44px mobile.
- Radius: 8px inputs, 12px cards/popovers, 16px major workspaces.
- Major modal max width: 1320px.

## Components

### Labeled field

- Label always remains visible; placeholder is an example, not the label.
- Required marker is restrained but visible.
- Helper/error message reserves predictable space.
- Focus ring: teal at 30–40% opacity.

### Metadata pill

- 40px minimum height.
- Icon/dot + current value + chevron.
- Unset values say “غير محدد”, not the field name.
- Label appears above or in an accessible tooltip/aria-label.

### Sticky action bar

- White / `#FAFCFF` surface with top border and subtle shadow.
- Primary action at the logical end.
- Secondary cancel always visible.
- Shows save state near primary action.

### Task row

- 44px minimum row height.
- Title is the dominant link.
- Inline-edit cells show hover/focus affordance without making the row visually noisy.
- Updated row highlight: pale teal background fading over 2–3 seconds.

### Popover

- 12px radius, white surface, strong but soft shadow.
- 8px viewport margin.
- Position below by default, flip above when needed.
- Never extend beyond left/right viewport edges.
- Escape closes and returns focus to the trigger.

### Toast

- Top or bottom safe zone depending on viewport.
- Success icon, concise text, optional “عرض” or “تراجع”.
- `aria-live="polite"`.

## Motion

- Panel/modal: 180–240ms, ease-out or spring without excessive bounce.
- Popover: 120–160ms fade/scale.
- Row highlight: 2–3 seconds then fades.
- Save status transition: 150ms.
- Respect `prefers-reduced-motion`.

## Responsive behavior

- Desktop: dense information with strong alignment and 44/56 task workspace split.
- Tablet: preserve split only when both panes retain usable width.
- Mobile:
  - Full-screen modal with safe-area padding.
  - Details/activity tabs.
  - Sticky header and sticky action/composer footer.
  - No horizontally clipped critical actions.
  - Kanban may scroll horizontally, but active column title remains clear and a column navigator is available.

## Accessibility

- Every icon-only button has Arabic `aria-label` and `title`.
- Modal uses focus trapping, Escape close, focus return, and an unsaved-change guard.
- Errors use `aria-describedby` and `aria-invalid`.
- Save/comment status uses live regions.
- Keyboard users can open, edit, save, cancel, and traverse every popover.
- Minimum contrast meets WCAG AA.
