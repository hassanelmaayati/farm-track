import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import useChartTheme from "./useChartTheme";

export default function SpeciesChart({ data }) {
  const c = useChartTheme();
  if (data.length === 0) return <p className="py-16 text-center text-sm text-muted">No active animals yet.</p>;
  const top = data.slice(0, 8);
  return (
    <div style={{ height: Math.max(160, top.length * 36) }} role="img" aria-label="Active animals by species">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid stroke={c.grid} strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} stroke={c.axis} tick={{ fontSize: 12 }} tickLine={false} />
          <YAxis type="category" dataKey="name" width={80} stroke={c.axis} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={c.tooltip} cursor={{ fill: c.grid, opacity: 0.4 }} formatter={(v) => [v, "Animals"]} />
          <Bar dataKey="value" fill={c.brand} radius={[0, 4, 4, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
