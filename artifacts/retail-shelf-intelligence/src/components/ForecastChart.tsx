import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import type { ForecastPoint } from "../data/mockData";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 shadow-2xl border border-white/15 text-xs">
      <p className="font-bold text-white mb-2">{formatDate(label)}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/50">{p.name}:</span>
          <span className="font-bold text-white">{p.value ?? "—"}</span>
        </div>
      ))}
    </div>
  );
};

export default function ForecastChart({ data }: { data: ForecastPoint[] }) {
  const today = new Date().toISOString().split("T")[0];
  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
        <defs>
          <linearGradient id="demandG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="upperG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px", color: "rgba(255,255,255,0.5)" }} />
        <ReferenceLine x={today} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: "Today", fontSize: 10, fill: "#f59e0b" }} />
        <Area type="monotone" dataKey="upperBound" name="Upper" fill="url(#upperG)" stroke="#8b5cf6" strokeWidth={0} dot={false} />
        <Area type="monotone" dataKey="lowerBound" name="Lower" fill="url(#upperG)" stroke="#8b5cf6" strokeWidth={0} dot={false} />
        <Area type="monotone" dataKey="demand" name="Actual" fill="url(#demandG)" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3, fill: "#06b6d4" }} activeDot={{ r: 5, fill: "#06b6d4", stroke: "#fff", strokeWidth: 2 }} />
        <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: "#8b5cf6" }} activeDot={{ r: 5 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
