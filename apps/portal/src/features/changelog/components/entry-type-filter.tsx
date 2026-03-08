export type EntryTypeFilterValue = "all" | "releases" | "commits";

const OPTIONS: { label: string; value: EntryTypeFilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Releases", value: "releases" },
  { label: "Commits", value: "commits" },
];

interface EntryTypeFilterProps {
  onChange: (value: EntryTypeFilterValue) => void;
  value: EntryTypeFilterValue;
}

export function EntryTypeFilter({ value, onChange }: EntryTypeFilterProps) {
  return (
    <div className="flex items-center gap-1.5">
      {OPTIONS.map((option) => {
        const active = value === option.value;
        return (
          <button
            className={`rounded-md border px-2.5 py-1 font-medium text-xs transition-colors ${
              active
                ? "border-primary bg-primary/10 text-primary dark:bg-primary/20"
                : "border-border/50 bg-transparent text-muted-foreground hover:border-border hover:text-foreground dark:border-border/40"
            }`}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
