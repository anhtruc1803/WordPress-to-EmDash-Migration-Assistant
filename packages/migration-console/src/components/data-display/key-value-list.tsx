import { cn } from "@console/lib/utils";

interface KeyValueListProps {
  items: Array<{ label: string; value: React.ReactNode }>;
  className?: string;
}

export function KeyValueList({ items, className }: KeyValueListProps) {
  return (
    <dl className={cn("grid gap-3", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-start justify-between gap-4">
          <dt className="text-sm text-muted-foreground shrink-0">{item.label}</dt>
          <dd className="text-sm font-medium text-right">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
