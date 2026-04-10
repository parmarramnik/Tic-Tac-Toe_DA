import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
  color?: "cyan" | "violet" | "amber" | "red" | "green";
  trend?: "up" | "down" | "neutral";
  delay?: number;
}

const colorMap = {
  cyan: { bg: "bg-cyan-500/10", icon: "text-cyan-400", border: "border-cyan-500/20", glow: "shadow-cyan-500/20" },
  violet: { bg: "bg-violet-500/10", icon: "text-violet-400", border: "border-violet-500/20", glow: "shadow-violet-500/20" },
  amber: { bg: "bg-amber-500/10", icon: "text-amber-400", border: "border-amber-500/20", glow: "shadow-amber-500/20" },
  red: { bg: "bg-red-500/10", icon: "text-red-400", border: "border-red-500/20", glow: "shadow-red-500/20" },
  green: { bg: "bg-emerald-500/10", icon: "text-emerald-400", border: "border-emerald-500/20", glow: "shadow-emerald-500/20" },
};

export default function StatsCard({ label, value, sub, icon, color = "cyan", trend, delay = 0 }: StatsCardProps) {
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`glass rounded-xl border ${c.border} p-4 flex items-start gap-3 hover:shadow-lg ${c.glow} transition-all group`}
    >
      <div className={`rounded-xl p-2.5 ${c.bg} ${c.icon} shrink-0 border ${c.border} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-white/40 truncate">{label}</p>
        <p className="text-2xl font-black text-white tabular-nums mt-0.5 leading-tight">{value}</p>
        {sub && (
          <p className={`text-xs mt-0.5 ${
            trend === "up" ? "text-emerald-400" :
            trend === "down" ? "text-red-400" :
            "text-white/40"
          }`}>
            {trend === "up" ? "↑ " : trend === "down" ? "↓ " : ""}{sub}
          </p>
        )}
      </div>
    </motion.div>
  );
}
