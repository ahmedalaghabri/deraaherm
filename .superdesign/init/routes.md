# Route and View Map

The app is a Vite SPA without React Router. `src/App.tsx` owns a `view` state and dispatches views through `renderContent()`.

| URL | View key | Component | Layout |
| --- | --- | --- | --- |
| `/` | `dashboard` | inline dashboard in `src/App.tsx` | App shell |
| `/` | `tasks` | `src/components/TasksPage.tsx` | App shell + PageHeader |
| `/` | `campaigns` | `src/components/CampaignsPage.tsx` | App shell |
| `/` | `transactions` | inline hub / TransactionsPage | App shell |
| `/` | `attendance` | AttendanceDashboard hub | App shell |
| `/` | `sales_kpi` | `src/components/SalesPerformancePage.tsx` | App shell |
| `/` | `employee_profile` | `src/components/EmployeeProfilePage.tsx` | App shell |

Task-specific internal view state:

- `activeTab`: tasks, campaigns, teams, visits, team schedule, team attendance.
- `viewMode`: list, kanban, calendar.
- `modalOpen`: create/edit task modal.
- `detailOpen`: task detail + activity drawer.
- `detailMobileTab`: details or activity.
- `formMobileTab`: details or activity.

Primary task journey:

1. Tasks view toolbar → “مهمة جديدة”.
2. Create modal → details, assignment, dates, metadata, subtasks, attachments, comments.
3. Save → task added to the same tasks state collection.
4. Task appears in list/kanban/calendar derived from the same state.
5. Table cells allow inline editing; task title opens details; action menu opens full edit.
6. Detail drawer allows direct field edits and WhatsApp-style activity/comments.
7. Full edit modal supports the original field set and comments.
