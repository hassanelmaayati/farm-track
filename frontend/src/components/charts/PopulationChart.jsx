import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import useChartTheme from "./useChartTheme";
import { formatMonth } from "../../lib/format";

export default function PopulationChart({ data }) {
  const c = useChartTheme();
  return (
    <div className="h-64" role="img" aria-label="Herd population over the last 12 months">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="pop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.brand} stopOpacity={0.35} />
              <stop offset="100%" stopColor={c.brand} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={c.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickFormatter={formatMonth} stroke={c.axis} tick={{ fontSize: 12 }} tickLine={false} />
          <YAxis allowDecimals={false} stroke={c.axis} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={c.tooltip} labelFormatter={formatMonth} formatter={(v) => [v, "Animals"]} />
          <Area type="monotone" dataKey="population" stroke={c.brand} strokeWidth={2.5} fill="url(#pop)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
