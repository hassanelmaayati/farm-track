import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import useChartTheme from "./useChartTheme";
import { formatMoney, formatMonth } from "../../lib/format";

export default function FinanceChart({ data }) {
  const c = useChartTheme();
  return (
    <div className="h-64" role="img" aria-label="Revenue and expenses by month">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid stroke={c.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickFormatter={formatMonth} stroke={c.axis} tick={{ fontSize: 12 }} tickLine={false} />
          <YAxis stroke={c.axis} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
          <Tooltip contentStyle={c.tooltip} labelFormatter={formatMonth} formatter={(v) => formatMoney(v)} cursor={{ fill: c.grid, opacity: 0.4 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="revenue" name="Revenue" fill={c.revenue} radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Expenses" fill={c.expenses} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
