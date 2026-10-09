import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import useChartTheme from "./useChartTheme";
import { STATUS_STYLES } from "../../lib/constants";

export default function StatusChart({ data }) {
  const c = useChartTheme();
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) return <p className="py-16 text-center text-sm text-muted">No animals yet.</p>;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-48 w-48 shrink-0" role="img" aria-label="Health status distribution">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={2} stroke="none">
              {data.map((d) => (
                <Cell key={d.name} fill={STATUS_STYLES[d.name]?.chart ?? "#999"} />
              ))}
            </Pie>
            <Tooltip contentStyle={c.tooltip} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* the legend doubles as the exact numbers, so the chart never depends on colour alone */}
      <ul className="w-full space-y-1.5 text-sm">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="size-2.5 rounded-sm" style={{ background: STATUS_STYLES[d.name]?.chart }} aria-hidden="true" />
            <span className="flex-1">{d.name}</span>
            <span className="tabular-nums text-muted">
              {d.value} · {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
