import { motion } from "framer-motion";
import type { Aisle } from "../data/mockData";

interface ComplianceHeatmapProps {
  aisles: Aisle[];
  selectedAisleId: string;
  onSelectAisle: (id: string) => void;
}

function scoreColor(s: number) {
  if (s >= 90) return { bar: "from-emerald-500 to-emerald-400", text: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" };
  if (s >= 75) return { bar: "from-cyan-500 to-cyan-400", text: "text-cyan-400", border: "border-cyan-500/30", bg: "bg-cyan-500/10" };
  if (s >= 60) return { bar: "from-amber-500 to-amber-400", text: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10" };
  return { bar: "from-red-500 to-red-400", text: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/10" };
}

export default function ComplianceHeatmap({ aisles, selectedAisleId, onSelectAisle }: ComplianceHeatmapProps) {
  return (
    <div className="space-y-3">
      {aisles.map((aisle, i) => {
        const isSelected = aisle.id === selectedAisleId;
        const emptyCount = aisle.slots.filter(s => s.stock === "empty").length;
        const lowCount = aisle.slots.filter(s => s.stock === "low").length;
        const c = scoreColor(aisle.complianceScore);

        return (
          <motion.button
            key={aisle.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => onSelectAisle(aisle.id)}
            className={`w-full text-left rounded-xl border p-3 transition-all hover:shadow-lg cursor-pointer ${
              isSelected
                ? `${c.bg} ${c.border} ring-1 ring-cyan-500/50 shadow-lg shadow-cyan-500/10`
                : "glass border-white/10 hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-semibold text-white">{aisle.name}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  {emptyCount > 0 && <span className="text-xs text-red-400">{emptyCount} empty</span>}
                  {lowCount > 0 && <span className="text-xs text-amber-400">{lowCount} low</span>}
                </div>
              </div>
              <span className={`text-xl font-black tabular-nums ${c.text}`}>
                {aisle.complianceScore}%
              </span>
            </div>

            {/* Slot mini-grid */}
            <div className="flex gap-px flex-wrap mb-2">
              {aisle.slots.map((slot) => (
                <div
                  key={slot.id}
                  className="w-3 h-2.5 rounded-sm transition-colors"
                  style={{
                    background: slot.stock === "full" ? "#06b6d4" : slot.stock === "low" ? "#f59e0b" : "#ef4444",
                    opacity: slot.stock === "full" ? 0.7 : 0.9,
                    boxShadow: !slot.compliant ? "0 0 0 1px #8b5cf6" : undefined,
                  }}
                />
              ))}
            </div>

            {/* Score bar */}
            <div className="h-1 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${c.bar}`}
                initial={{ width: 0 }}
                animate={{ width: `${aisle.complianceScore}%` }}
                transition={{ delay: i * 0.07 + 0.3, duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.button>
        );
      })}

      <div className="flex items-center gap-4 text-xs text-white/30 pt-1 px-1 flex-wrap">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2 rounded-sm inline-block" style={{ background: "#06b6d4" }} />Full</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2 rounded-sm inline-block" style={{ background: "#f59e0b" }} />Low</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2 rounded-sm inline-block" style={{ background: "#ef4444" }} />Empty</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2 rounded-sm inline-block border border-violet-400" />Non-compliant</span>
      </div>
    </div>
  );
}
