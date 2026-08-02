# Shared Layouts

## `src/components/PageHeader.tsx`

Sticky page-level header used by the tasks area and related tabbed sections.

```tsx
import { cn } from "../lib/utils";
import PageTabs from "./PageTabs";

interface PageHeaderProps<T extends string> {
  tabs: [T, string, React.ElementType?][];
  active: T;
  onChange: (value: T) => void;
  children?: React.ReactNode;
  innerClassName?: string;
}

export default function PageHeader<T extends string>({
  tabs,
  active,
  onChange,
  children,
  innerClassName,
}: PageHeaderProps<T>) {
  return (
    <div className="sticky top-0 z-40 md:z-30 bg-white dark:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700 rounded-xl max-w-[var(--page-max-w)] mx-auto w-full">
      <div className={cn("rounded-xl", innerClassName)}>
        <PageTabs tabs={tabs} active={active} onChange={onChange} />
        {children}
      </div>
    </div>
  );
}
```

## `src/components/PageTabs.tsx`

```tsx
import { cn } from "../lib/utils";

interface PageTabsProps<T extends string> {
  tabs: [T, string, React.ElementType?][];
  active: T;
  onChange: (value: T) => void;
}

export default function PageTabs<T extends string>({ tabs, active, onChange }: PageTabsProps<T>) {
  return (
    <div className="sticky top-0 z-40 bg-white dark:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700 px-1 sm:px-4 py-2 rounded-t-xl">
      <div className="flex items-center gap-1.5 sm:gap-2 w-fit mx-auto">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150 whitespace-nowrap",
              active === key
                ? "bg-neutral-900 text-white shadow-sm"
                : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## App shell — `src/App.tsx`

The application shell is currently embedded in the 3,800-line `App.tsx` monolith. The active desktop branch renders:

- RTL application root.
- A 72px desktop navigation rail with the Deraah logo and primary modules.
- A flexible `<main>` area where `renderContent()` mounts `TasksPage` for the `tasks` view.
- A fixed mobile bottom navigation below the same content branch.

The task route is selected by:

```tsx
if (view === "tasks") {
  return <TasksPage onBack={() => setView("dashboard")} onNewCampaign={() => setView("campaigns")} />;
}
```

The exact shell render branch starts at `src/App.tsx:3531`, and the task feature render starts at `src/components/TasksPage.tsx:1021`.
