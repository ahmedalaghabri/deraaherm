# Key Page Dependency Trees

## Tasks workspace

Entry: `src/components/TasksPage.tsx`

Dependencies:

- `src/components/TasksPage.tsx`
  - `src/components/PageHeader.tsx`
    - `src/components/PageTabs.tsx`
      - `src/lib/utils.ts`
  - `src/components/CampaignsPage.tsx`
  - `src/components/TeamsPage.tsx`
  - `src/components/VisitsPage.tsx`
  - `src/components/TeamSchedulePage.tsx`
  - `src/components/TeamAttendancePage.tsx`
  - `src/components/ai/AIContext.tsx`
  - `src/lib/useFirestoreCollection.ts`
  - `src/lib/utils.ts`
- `src/index.css`
- `tailwind.config.js`
- `src/App.tsx` (application shell branch at line 3531)

The main task workspace render starts at `TasksPage.tsx:1021`. Its visually relevant ranges are:

- `1021:1592` — page tabs, search/filter/group controls, view switcher, create action.
- `1598:2113` — list, kanban, and calendar views.
- `2117:2933` — detail drawer and activity/comments pane.
- `2936:3837` — create/edit modal, metadata fields, subtasks, attachments, comments.
- `3838:4076` — fixed inline table edit popovers and action menu.

## Application shell

Entry: `src/App.tsx`

Dependencies:

- `src/App.tsx`
  - `src/components/TasksPage.tsx`
  - `src/components/PageHeader.tsx`
  - `src/components/ai/AIContext.tsx`
  - `src/components/ai/FloatingAssistant.tsx`
  - `src/components/ai/ChatPanel.tsx`
  - remaining business module pages
- `src/index.css`
- `tailwind.config.js`

## Sales performance

Entry: `src/components/SalesPerformancePage.tsx`

Dependencies:

- `src/components/SalesPerformancePage.tsx`
  - `src/components/PageHeader.tsx`
  - `src/components/ds/StatCard.tsx`
  - `src/lib/design-system.ts`
  - `src/lib/utils.ts`
- `src/index.css`

## Transactions

Entry: `src/components/TransactionsPage.tsx`

Dependencies:

- `src/components/TransactionsPage.tsx`
  - `src/components/TransactionDetailsPage.tsx`
  - `src/components/TransactionReplyModal.tsx`
  - `src/components/PageHeader.tsx`
  - `src/lib/utils.ts`
- `src/index.css`
