import { cn } from "../lib/utils";
import PageTabs from "./PageTabs";

interface PageHeaderProps<T extends string> {
  tabs: [T, string, React.ElementType?][];
  active: T;
  onChange: (value: T) => void;
  /* Page-specific toolbar content rendered below the tabs (optional) */
  children?: React.ReactNode;
  /* Extra classes for the inner wrapper (optional) */
  innerClassName?: string;
  /* When true, the tabs section is hidden (height collapses) */
  hideTabs?: boolean;
}

export default function PageHeader<T extends string>({ tabs, active, onChange, children, innerClassName, hideTabs }: PageHeaderProps<T>) {
  return (
    <div className="sticky top-0 z-40 md:z-30 bg-white dark:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700 rounded-xl max-w-[var(--page-max-w)] mx-auto w-full">
      <div className={cn("rounded-xl", innerClassName)}>
        <div className={cn("transition-all duration-300 overflow-hidden", hideTabs ? "max-h-0 opacity-0" : "max-h-32 opacity-100")}>
          <PageTabs tabs={tabs} active={active} onChange={onChange} />
        </div>
        {children}
      </div>
    </div>
  );
}
