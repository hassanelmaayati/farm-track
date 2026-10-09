import Card from "./Card";

export default function StatCard({ icon: Icon, label, value, hint, tone = "text-brand" }) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className={`rounded-lg bg-soft p-2.5 ${tone}`}>
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        {hint && <p className="truncate text-xs text-muted">{hint}</p>}
      </div>
    </Card>
  );
}
