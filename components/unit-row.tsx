export type UnitItem = { label: string; value: string };

export function UnitRow({ items }: { items: UnitItem[] }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 rounded-lg bg-muted px-2 py-2 text-center">
          <p className="truncate font-mono text-sm font-semibold tabular-nums">{item.value}</p>
          <p className="truncate text-[11px] text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
