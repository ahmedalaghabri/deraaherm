import { cn } from "../lib/utils";

interface PageTabsProps<T extends string> {
  tabs: [T, string, React.ElementType?][];
  active: T;
  onChange: (value: T) => void;
}

export default function PageTabs<T extends string>({ tabs, active, onChange }: PageTabsProps<T>) {
  return (
    <div className="sticky top-0 z-40 bg-white dark:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700 px-1 sm:px-4 py-2">
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
