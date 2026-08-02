# Extractable Components

## PageHeader

- Source: `src/components/PageHeader.tsx`
- Category: layout
- Description: Sticky centered page header that combines product-area tabs and an optional toolbar.
- Extractable props: `active` (string, default `"tasks"`).
- Hardcoded: centered tabs structure, white/dark surfaces, border, radius, sticky behavior.

## PageTabs

- Source: `src/components/PageTabs.tsx`
- Category: layout
- Description: RTL horizontal module tabs with a dark active state.
- Extractable props: `active` (string, default `"tasks"`).
- Hardcoded: task module labels, spacing, typography, radius, active and hover colors.

## AppNavigationRail

- Source: `src/App.tsx:3531:3610`
- Category: layout
- Description: Desktop Deraah logo and compact vertical primary navigation rail.
- Extractable props: `activeItem` (string, default `"tasks"`).
- Hardcoded: logo asset, module names and icons, rail size, fixed labels.

## TaskToolbar

- Source: `src/components/TasksPage.tsx:1021:1592`
- Category: layout
- Description: Search, active filters, filter drawer trigger, grouping control, view switcher, and create-task CTA.
- Extractable props: `activeView` (string, default `"list"`), `activeFilterCount` (number, default `0`).
- Hardcoded: icon set, Arabic labels, interaction order and visual classes.

## TaskCard

- Source: `src/components/TasksPage.tsx:1885:2004`
- Category: basic
- Description: Kanban task card with title, project, assignee, date, priority, subtasks, and progress.
- Extractable props: none; content data remains hardcoded in design drafts.
- Hardcoded: metadata order, status surfaces, card spacing and typography.

## TaskDetailWorkspace

- Source: `src/components/TasksPage.tsx:2117:2933`
- Category: layout
- Description: Responsive split workspace: task details on the left and activity/comments on the right.
- Extractable props: `detailsCollapsed` (boolean, default `false`), `activeMobileTab` (string, default `"details"`).
- Hardcoded: 45/55 split, conversation tools, metadata groups and controls.
