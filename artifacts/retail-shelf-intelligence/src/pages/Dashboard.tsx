import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useLocation } from "wouter";
import {
  Package, AlertTriangle, BarChart3, ShoppingCart, CheckCircle2,
  Clock, DollarSign, Activity, RefreshCw, ArrowLeft, Zap, TrendingUp,
  Eye, Wifi, Bell, ChevronRight,
} from "lucide-react";
import Shelf3D from "../components/Shelf3D";
import StatsCard from "../components/StatsCard";
import AlertsList from "../components/AlertsList";
import ForecastChart from "../components/ForecastChart";
import SKUTable from "../components/SKUTable";
import ComplianceHeatmap from "../components/ComplianceHeatmap";
import {
  aisles, alerts, forecastData, skuMetrics, dashboardStats, type ShelfSlot,
} from "../data/mockData";

type Tab = "3d_view" | "alerts" | "forecast" | "inventory" | "compliance";

const TABS: { id: Tab; label: string; icon: typeof Package }[] = [
  { id: "3d_view", label: "3D Shelf View", icon: Eye },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "forecast", label: "Forecast", icon: BarChart3 },
  { id: "inventory", label: "Inventory", icon: ShoppingCart },
  { id: "compliance", label: "Compliance", icon: CheckCircle2 },
];

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.18 } },
};

/* Animated ring indicator */
function LiveIndicator() {
  return (
    <div className="relative flex items-center gap-2">
      <div className="relative w-3 h-3">
        <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-60" />
        <span className="relative block w-3 h-3 rounded-full bg-cyan-400" />
      </div>
      <span className="text-xs text-cyan-400 font-semibold">LIVE</span>
    </div>
  );
}

/* Glowing metric number */
function GlowMetric({ value, label, color = "#06b6d4" }: { value: string; label: string; color?: string }) {
  return (
    <div className="text-center">
      <motion.p
        className="text-3xl font-black tabular-nums"
        style={{ color, textShadow: `0 0 20px ${color}60` }}
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        {value}
      </motion.p>
      <p className="text-xs text-white/35 mt-0.5">{label}</p>
    </div>
  );
}

/* Animated compliance ring */
function ComplianceRing({ score }: { score: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 90 ? "#10b981" : score >= 75 ? "#06b6d4" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="64" height="64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <motion.circle
          cx="32" cy="32" r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <span className="text-sm font-black" style={{ color }}>{score}%</span>
    </div>
  );
}

/* Pulsing data bar */
function DataBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1 bg-white/8 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ background: color, boxShadow: `0 0 8px ${color}66` }}
      />
    </div>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("3d_view");
  const [selectedAisleId, setSelectedAisleId] = useState(aisles[0].id);
  const [selectedSlot, setSelectedSlot] = useState<ShelfSlot | null>(null);
  const selectedAisle = aisles.find(a => a.id === selectedAisleId) ?? aisles[0];
  const criticalAlerts = alerts.filter(a => a.severity === "critical").length;
  const overallCompliance = Math.round(aisles.reduce((s, a) => s + a.complianceScore, 0) / aisles.length);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-56 shrink-0 flex flex-col border-r border-white/8"
        style={{ background: "hsl(222 47% 4%)" }}
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/8">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center shrink-0 pulse-glow">
              <Package className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-black tracking-tight">
                <span className="text-white">Shelf</span>
                <span className="neon-gradient">IQ</span>
              </p>
              <p className="text-xs text-white/30">Retail Intelligence</p>
            </div>
          </div>
          <LiveIndicator />
        </div>

        {/* Back */}
        <button
          onClick={() => setLocation("/")}
          className="mx-3 mt-3 flex items-center gap-2 text-xs text-white/30 hover:text-cyan-400 transition-all px-2.5 py-1.5 rounded-lg hover:bg-cyan-500/10 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </button>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-1">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            const badge = id === "alerts" ? criticalAlerts : 0;
            return (
              <motion.button
                key={id}
                onClick={() => setActiveTab(id)}
                whileTap={{ scale: 0.97 }}
                className={`relative w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left overflow-hidden transition-colors ${
                  isActive
                    ? "text-background font-bold"
                    : "text-white/50 hover:bg-white/6 hover:text-white/80"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActive"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <Icon className="w-4 h-4 shrink-0 relative z-10" />
                <span className="truncate relative z-10 flex-1">{label}</span>
                {badge > 0 && (
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="relative z-10 text-[10px] font-black bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0"
                  >
                    {badge}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Sidebar metrics */}
        <div className="p-3 border-t border-white/8 space-y-3">
          <div className="glass rounded-xl p-3 border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40">Store Compliance</span>
              <span className="text-xs font-black text-cyan-400">{overallCompliance}%</span>
            </div>
            <DataBar pct={overallCompliance} color="#06b6d4" />
          </div>
          <div className="glass rounded-xl p-3 border border-white/8">
            <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
              <RefreshCw className="w-3 h-3" />
              <span>Last synced</span>
            </div>
            <p className="text-xs text-white/60 font-semibold">Just now · All systems up</p>
          </div>
        </div>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.45 }}
          className="shrink-0 px-6 py-3.5 border-b border-white/8 glass flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            {(() => {
              const t = TABS.find(t => t.id === activeTab);
              const Icon = t?.icon ?? Package;
              return (
                <>
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-white">{t?.label}</h1>
                    <p className="text-xs text-white/30">
                      {activeTab === "3d_view" && `${selectedAisle.name} · ${selectedAisle.slots.filter(s => s.stock === "empty").length} stockouts`}
                      {activeTab === "alerts" && `${alerts.length} alerts · ${criticalAlerts} critical`}
                      {activeTab === "forecast" && "7-day demand forecast with 85% confidence"}
                      {activeTab === "inventory" && `${skuMetrics.length} SKUs · ${skuMetrics.filter(s => s.currentStock <= s.reorderPoint).length} at reorder`}
                      {activeTab === "compliance" && `Store score: ${overallCompliance}% · Target: 95%`}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>

          <div className="flex items-center gap-3">
            {criticalAlerts > 0 && (
              <motion.div
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                className="flex items-center gap-2 bg-red-500/15 text-red-400 border border-red-500/35 rounded-xl px-3 py-1.5 text-xs font-bold"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {criticalAlerts} Critical
              </motion.div>
            )}
            <div className="flex items-center gap-2 glass rounded-xl px-3 py-1.5 border border-white/10">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-semibold">All Feeds Active</span>
            </div>
          </div>
        </motion.header>

        {/* Stats bar */}
        <div className="shrink-0 px-5 py-3 border-b border-white/8">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "In Stock", value: dashboardStats.inStockCount.toLocaleString(), sub: `of ${dashboardStats.totalProducts.toLocaleString()}`, icon: <CheckCircle2 className="w-4 h-4" />, color: "green" as const, delay: 0.15 },
              { label: "Active Alerts", value: String(dashboardStats.activeAlerts), sub: `${criticalAlerts} critical`, icon: <Bell className="w-4 h-4" />, color: "red" as const, trend: "down" as const, delay: 0.2 },
              { label: "Revenue at Risk", value: `$${dashboardStats.estimatedRevenueLost.toFixed(0)}`, sub: "stockouts today", icon: <DollarSign className="w-4 h-4" />, color: "amber" as const, delay: 0.25 },
              { label: "Avg Alert Time", value: `${dashboardStats.avgReplenishmentTime}m`, sub: "target: 15 min", icon: <Clock className="w-4 h-4" />, color: "cyan" as const, delay: 0.3 },
            ].map(p => (
              <StatsCard key={p.label} {...p} />
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">

            {activeTab === "3d_view" && (
              <motion.div key="3d_view" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full flex">
                <div className="flex-1 h-full">
                  <Shelf3D aisle={selectedAisle} selectedSlot={selectedSlot} onSlotSelect={setSelectedSlot} />
                </div>

                {/* Right panel */}
                <div className="w-60 shrink-0 border-l border-white/8 flex flex-col overflow-hidden" style={{ background: "hsl(222 47% 4%)" }}>
                  <div className="p-3 border-b border-white/8">
                    <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Aisles</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
                    {aisles.map((aisle, i) => {
                      const isSelected = aisle.id === selectedAisleId;
                      const empty = aisle.slots.filter(s => s.stock === "empty").length;
                      const low = aisle.slots.filter(s => s.stock === "low").length;
                      return (
                        <motion.button
                          key={aisle.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          onClick={() => { setSelectedAisleId(aisle.id); setSelectedSlot(null); }}
                          className={`w-full text-left rounded-xl border px-3 py-2.5 transition-all group ${
                            isSelected
                              ? "bg-cyan-500/12 border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                              : "glass border-white/8 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-white">{aisle.name.split("–")[1]?.trim() || aisle.name}</span>
                            <ComplianceRing score={aisle.complianceScore} />
                          </div>
                          <div className="flex gap-2">
                            {empty > 0 && (
                              <span className="text-[10px] font-bold text-red-400 bg-red-500/10 rounded px-1.5 py-0.5 border border-red-500/20">
                                {empty} empty
                              </span>
                            )}
                            {low > 0 && (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 rounded px-1.5 py-0.5 border border-amber-500/20">
                                {low} low
                              </span>
                            )}
                          </div>
                          <div className="mt-2">
                            <DataBar pct={aisle.complianceScore} color={aisle.complianceScore >= 85 ? "#10b981" : aisle.complianceScore >= 70 ? "#06b6d4" : "#ef4444"} />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {selectedSlot && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-t border-white/8 p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Selected</p>
                        <button onClick={() => setSelectedSlot(null)} className="text-white/20 hover:text-white/50 transition-colors text-xs">✕</button>
                      </div>
                      <p className="text-sm font-bold text-white leading-snug">{selectedSlot.name}</p>
                      <p className="text-xs text-cyan-500 mt-0.5 font-mono">{selectedSlot.sku}</p>
                      <div className="mt-3 space-y-2">
                        <DataBar
                          pct={(selectedSlot.quantity / selectedSlot.maxQuantity) * 100}
                          color={selectedSlot.stock === "full" ? "#06b6d4" : selectedSlot.stock === "low" ? "#f59e0b" : "#ef4444"}
                        />
                        {[
                          ["Status", selectedSlot.stock, selectedSlot.stock === "full" ? "#06b6d4" : selectedSlot.stock === "low" ? "#f59e0b" : "#ef4444"],
                          ["Qty", `${selectedSlot.quantity}/${selectedSlot.maxQuantity}`, "#fff"],
                          ["Price", `$${selectedSlot.price}`, "#fff"],
                          ["Compliant", selectedSlot.compliant ? "Yes" : "No", selectedSlot.compliant ? "#10b981" : "#ef4444"],
                        ].map(([label, value, color]) => (
                          <div key={label as string} className="flex justify-between text-xs">
                            <span className="text-white/35 capitalize">{label}</span>
                            <span className="font-bold capitalize" style={{ color: color as string }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "alerts" && (
              <motion.div key="alerts" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-xs text-white/35">Sorted by revenue impact · auto-resolves on restock</p>
                    <LiveIndicator />
                  </div>
                  <AlertsList alerts={alerts} />
                </div>
              </motion.div>
            )}

            {activeTab === "forecast" && (
              <motion.div key="forecast" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-5">
                  <div className="glass rounded-2xl border border-white/10 p-5">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="font-bold text-white">Demand Forecast — Organic Whole Milk 1L</h2>
                        <p className="text-xs text-white/35 mt-0.5">SKU-001 · 7-day projection · 85% confidence bands</p>
                      </div>
                      <div className="text-right glass rounded-xl px-4 py-2 border border-emerald-500/25">
                        <p className="text-xs text-white/35">WMAPE Error</p>
                        <p className="text-2xl font-black text-emerald-400">8.3%</p>
                      </div>
                    </div>
                    <ForecastChart data={forecastData} />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Predicted Peak", value: "Saturday", sub: "+30% vs weekday avg", color: "#06b6d4", icon: TrendingUp },
                      { label: "Reorder Point", value: "48 units", sub: "Trigger replenishment now", color: "#f59e0b", icon: AlertTriangle },
                      { label: "Suggested Order", value: "120 units", sub: "Covers 7-day demand", color: "#10b981", icon: Package },
                    ].map(({ label, value, sub, color, icon: Icon }) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, scale: 0.93 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass rounded-2xl border border-white/10 p-5 text-center group hover:border-white/20 transition-all"
                      >
                        <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                          <Icon className="w-5 h-5" style={{ color }} />
                        </div>
                        <p className="text-xs text-white/35 mb-1">{label}</p>
                        <p className="text-2xl font-black" style={{ color }}>{value}</p>
                        <p className="text-xs text-white/25 mt-1">{sub}</p>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-2xl border border-amber-500/30 p-4 bg-amber-500/5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                        <Zap className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-amber-300">AI Replenishment Recommendation</p>
                        <p className="text-xs text-white/45 mt-1 leading-relaxed">
                          Issue replenishment for <span className="text-white font-semibold">SKU-001 (120u)</span> and{" "}
                          <span className="text-white font-semibold">SKU-007 (80u)</span> by 14:00 today to prevent weekend stockouts.
                          Estimated revenue protected: <span className="text-emerald-400 font-bold">$487.20</span>.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === "inventory" && (
              <motion.div key="inventory" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto">
                  <div className="glass rounded-2xl border border-white/10 overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-white/8 flex items-center justify-between">
                      <h2 className="font-bold text-white text-sm">SKU Performance Overview</h2>
                      <div className="flex items-center gap-4 text-xs text-white/30">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-0.5 bg-amber-400 inline-block" />Reorder point</span>
                      </div>
                    </div>
                    <SKUTable metrics={skuMetrics} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "compliance" && (
              <motion.div key="compliance" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto space-y-5">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Store Score", value: `${overallCompliance}%`, color: "#06b6d4", sub: "Target: 95%", icon: CheckCircle2 },
                      { label: "Total Violations", value: aisles.reduce((s, a) => s + a.slots.filter(sl => !sl.compliant).length, 0), color: "#f59e0b", sub: "across all aisles", icon: AlertTriangle },
                      { label: "Aisles at Risk", value: aisles.filter(a => a.complianceScore < 80).length, color: "#ef4444", sub: "below 80% threshold", icon: Activity },
                    ].map(({ label, value, color, sub, icon: Icon }) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass rounded-2xl border border-white/10 p-5"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                            <Icon className="w-4.5 h-4.5" style={{ color }} />
                          </div>
                          <span className="text-xs text-white/35">{label}</span>
                        </div>
                        <p className="text-3xl font-black" style={{ color, textShadow: `0 0 20px ${color}50` }}>{value}</p>
                        <p className="text-xs text-white/25 mt-1">{sub}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="glass rounded-2xl border border-white/10 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-white text-sm">Aisle Compliance</h2>
                      <span className="text-xs text-white/30">Click aisle to view 3D shelf</span>
                    </div>
                    <ComplianceHeatmap
                      aisles={aisles}
                      selectedAisleId={selectedAisleId}
                      onSelectAisle={(id) => { setSelectedAisleId(id); setActiveTab("3d_view"); }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
