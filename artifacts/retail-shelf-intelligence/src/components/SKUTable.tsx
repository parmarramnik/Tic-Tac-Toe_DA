import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { SKUMetric } from "../data/mockData";

function StockBar({ current, reorder, max = 100 }: { current: number; reorder: number; max?: number }) {
  const pct = Math.min((current / max) * 100, 100);
  const reorderPct = (reorder / max) * 100;
  const color = current <= 0 ? "#ef4444" : current <= reorder ? "#f59e0b" : "#06b6d4";
  return (
    <div className="relative w-24 h-1.5 bg-white/10 rounded-full overflow-visible">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color, boxShadow: `0 0 6px ${color}66` }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 rounded-full bg-amber-400"
        style={{ left: `${reorderPct}%` }}
      />
    </div>
  );
}

export default function SKUTable({ metrics }: { metrics: SKUMetric[] }) {
  const maxStock = Math.max(...metrics.map(m => m.currentStock));
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {["Product", "SKU", "Stock Level", "Demand/wk", "Revenue", "Trend"].map((h, i) => (
              <th key={h} className={`py-3 px-3 text-xs font-semibold text-white/30 ${i > 3 ? "text-right" : i === 5 ? "text-center" : "text-left"}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((m, i) => (
            <motion.tr
              key={m.sku}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors group"
            >
              <td className="py-3 px-3">
                <div className="font-semibold text-white text-xs truncate max-w-[140px]">{m.name}</div>
                <div className="text-xs text-white/30">{m.category}</div>
              </td>
              <td className="py-3 px-3">
                <span className="text-xs font-mono text-cyan-500/70 bg-cyan-500/10 rounded px-1.5 py-0.5">{m.sku}</span>
              </td>
              <td className="py-3 px-3">
                <div className="flex items-center gap-2">
                  <StockBar current={m.currentStock} reorder={m.reorderPoint} max={maxStock} />
                  <span className={`text-xs font-bold tabular-nums ${
                    m.currentStock <= 0 ? "text-red-400" :
                    m.currentStock <= m.reorderPoint ? "text-amber-400" : "text-emerald-400"
                  }`}>{m.currentStock}</span>
                </div>
              </td>
              <td className="py-3 px-3 text-right text-xs text-white/60 tabular-nums">{m.weeklyDemand}</td>
              <td className="py-3 px-3 text-right text-xs font-bold text-white tabular-nums">
                ${m.revenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </td>
              <td className="py-3 px-3 text-center">
                {m.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto" />
                ) : m.trend === "down" ? (
                  <TrendingDown className="w-4 h-4 text-red-400 mx-auto" />
                ) : (
                  <Minus className="w-4 h-4 text-white/30 mx-auto" />
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
