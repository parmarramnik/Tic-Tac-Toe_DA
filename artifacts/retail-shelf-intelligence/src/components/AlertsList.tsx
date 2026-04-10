import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, AlertTriangle, Info, Clock, DollarSign, ChevronRight } from "lucide-react";
import type { Alert } from "../data/mockData";

const SEVERITY = {
  critical: {
    bg: "bg-red-500/10 border-red-500/30",
    badge: "bg-red-500/20 text-red-400 border border-red-500/30",
    icon: AlertCircle, iconColor: "text-red-400",
    glow: "hover:shadow-red-500/15",
    dot: "bg-red-400",
  },
  warning: {
    bg: "bg-amber-500/10 border-amber-500/30",
    badge: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    icon: AlertTriangle, iconColor: "text-amber-400",
    glow: "hover:shadow-amber-500/15",
    dot: "bg-amber-400",
  },
  info: {
    bg: "bg-cyan-500/10 border-cyan-500/30",
    badge: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
    icon: Info, iconColor: "text-cyan-400",
    glow: "hover:shadow-cyan-500/15",
    dot: "bg-cyan-400",
  },
};

const TYPE_LABELS: Record<string, string> = {
  stockout: "Stockout",
  low_stock: "Low Stock",
  planogram: "Planogram",
  price_error: "Price Error",
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function AlertsList({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="space-y-3">
      <AnimatePresence>
        {alerts.map((alert, i) => {
          const s = SEVERITY[alert.severity];
          const Icon = s.icon;
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className={`rounded-xl border p-4 ${s.bg} hover:shadow-lg ${s.glow} transition-all cursor-default group`}
            >
              <div className="flex items-start gap-3">
                <div className="relative mt-0.5">
                  <Icon className={`w-4 h-4 ${s.iconColor} shrink-0`} />
                  <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.badge}`}>
                      {TYPE_LABELS[alert.type]}
                    </span>
                    <span className="text-sm font-semibold text-white truncate">{alert.product}</span>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(alert.timestamp)}
                    </span>
                    <span>·</span>
                    <span className="truncate">{alert.aisle}</span>
                    {alert.revenueImpact > 0 && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-0.5 text-red-400 font-semibold">
                          <DollarSign className="w-3 h-3" />
                          {alert.revenueImpact.toFixed(0)} lost
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 shrink-0 transition-colors" />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
