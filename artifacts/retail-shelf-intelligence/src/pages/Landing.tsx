import { useRef, useEffect, useState, useCallback } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Package, BarChart3, AlertTriangle, Brain, Camera, Zap, Shield, TrendingUp,
  ArrowRight, ChevronRight, Star, Globe2, Activity, Eye, Cpu, Check,
  RefreshCw, Bell, Database, Layers
} from "lucide-react";
import HeroShelf3D from "../components/HeroShelf3D";
import ParticleField from "../components/ParticleField";
import AnimatedCounter from "../components/AnimatedCounter";
import DataGlobe3D from "../components/DataGlobe3D";
import FloatingProducts3D from "../components/FloatingProducts3D";
import WireframeRings3D from "../components/WireframeRings3D";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25,0.46,0.45,0.94] } },
};

/* ─── Glitch Text ─────────────────────────────────────────── */
function GlitchText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`glitch relative inline-block ${className}`} data-text={text}>
      {text}
    </span>
  );
}

/* ─── Scramble Text hook ──────────────────────────────────── */
function useScramble(target: string, trigger: boolean, speed = 30) {
  const [display, setDisplay] = useState(target);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%";
  useEffect(() => {
    if (!trigger) return;
    let iter = 0;
    const interval = setInterval(() => {
      setDisplay(
        target.split("").map((c, i) => {
          if (i < iter) return c;
          return c === " " ? " " : chars[Math.floor(Math.random() * chars.length)];
        }).join("")
      );
      iter += 1;
      if (iter > target.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [trigger, target]);
  return display;
}

/* ─── Ticker feed ─────────────────────────────────────────── */
const FEED_ITEMS = [
  { text: "Stockout detected: SKU-001 Dairy Aisle A", color: "#ef4444" },
  { text: "Replenishment completed: 120 units restocked", color: "#10b981" },
  { text: "Compliance violation: SKU-007 wrong facing", color: "#f59e0b" },
  { text: "AI Forecast updated: +18% demand Saturday", color: "#06b6d4" },
  { text: "Alert resolved: $487 revenue protected", color: "#10b981" },
  { text: "New planogram deployed: Bakery section", color: "#8b5cf6" },
];

function LiveFeed() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % FEED_ITEMS.length), 3000);
    return () => clearInterval(t);
  }, []);
  const item = FEED_ITEMS[idx];
  return (
    <div className="flex items-center gap-3 glass rounded-full px-4 py-2 border border-white/10 overflow-hidden">
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 animate-pulse" />
      <span className="text-xs text-white/40 shrink-0 font-mono">LIVE</span>
      <div className="relative h-5 overflow-hidden flex-1">
        <AnimatePresence mode="wait">
          <motion.p
            key={idx}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="text-xs font-medium whitespace-nowrap"
            style={{ color: item.color }}
          >
            {item.text}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Magnetic Button ─────────────────────────────────────── */
function MagneticButton({ children, onClick, className = "" }: {
  children: React.ReactNode; onClick?: () => void; className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
  }, []);
  const handleMouseLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  }, []);

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-200 ${className}`}
      style={{ willChange: "transform" }}
    >
      {children}
    </button>
  );
}

/* ─── Animated Data Card ──────────────────────────────────── */
function DataCard({ label, value, sub, color, delay = 0 }: {
  label: string; value: string; sub: string; color: string; delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5, type: "spring", bounce: 0.3 }}
      className="glass rounded-2xl p-5 text-center relative overflow-hidden group"
      style={{ borderColor: `${color}25` }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 50% 50%, ${color}10 0%, transparent 70%)` }}
      />
      {/* Spinning ring behind */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-24 h-24 rounded-full border opacity-10 group-hover:opacity-20 transition-opacity spin-slow"
          style={{ borderColor: color }}
        />
      </div>
      <p className="text-3xl font-black relative" style={{ color }}>{value}</p>
      <p className="text-xs text-white/60 font-semibold mt-1 relative">{label}</p>
      <p className="text-xs text-white/30 mt-0.5 relative">{sub}</p>
    </motion.div>
  );
}

/* ─── Feature Card with 3D tilt ──────────────────────────── */
function FeatureCard({ icon: Icon, title, desc, color, delay }: {
  icon: React.ElementType; title: string; desc: string; color: string; delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 8}deg) scale(1.02)`;
  };
  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)";
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="glass rounded-2xl p-6 cursor-default relative overflow-hidden"
      style={{ transition: "transform 0.15s ease, border-color 0.3s", willChange: "transform" }}
    >
      {/* Glow corner */}
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-xl opacity-20"
        style={{ background: color }}
      />
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 relative"
        style={{ background: `${color}18`, border: `1px solid ${color}35` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <h3 className="font-bold text-white text-sm mb-2">{title}</h3>
      <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
      <div
        className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />
    </motion.div>
  );
}

/* ─── Data Stream Column ──────────────────────────────────── */
function DataStreamColumn({ values, delay, color }: { values: string[]; delay: number; color: string }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % values.length), 1200 + delay * 200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col gap-1.5 text-right">
      {values.map((v, i) => (
        <motion.div
          key={v}
          animate={{ opacity: i === idx ? 1 : 0.15 }}
          className="text-xs font-mono font-bold"
          style={{ color }}
        >{v}</motion.div>
      ))}
    </div>
  );
}

/* ─── Nav ─────────────────────────────────────────────────── */
function NavBar({ onLaunch }: { onLaunch: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass border-b border-white/10 shadow-xl shadow-black/60" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-2.5"
          whileHover={{ scale: 1.03 }}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center pulse-glow">
            <Package className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-lg tracking-tight">
            <span className="text-white">Shelf</span>
            <span className="neon-gradient">IQ</span>
          </span>
        </motion.div>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
          {["Features", "How It Works", "Live Data"].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              className="hover:text-cyan-400 transition-colors relative group">
              {item}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-cyan-400 group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        <MagneticButton
          onClick={onLaunch}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-bold px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-cyan-500/30"
        >
          Launch Dashboard
          <ArrowRight className="w-4 h-4" />
        </MagneticButton>
      </div>
    </motion.nav>
  );
}

/* ─── Hero ────────────────────────────────────────────────── */
function HeroSection({ onLaunch }: { onLaunch: () => void }) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.4], [0, -120]);
  const opacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const [started, setStarted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setStarted(true), 600); return () => clearTimeout(t); }, []);

  const words = ["Smarter", "Faster", "Intelligent", "Autonomous"];
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % words.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Layered backgrounds */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="absolute inset-0 hex-pattern" />
      <div className="absolute inset-0">
        <ParticleField count={55} className="opacity-60" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/6 via-transparent to-violet-500/8" />
      <div className="scan-line" />

      {/* 3D floating products in background */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <FloatingProducts3D className="w-full h-full" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent z-10" />

      <motion.div style={{ y, opacity }} className="relative z-20 max-w-7xl mx-auto px-6 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Left */}
          <div>
            {/* Live feed */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 max-w-md"
            >
              <LiveFeed />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-cyan-400 font-semibold mb-5 border border-cyan-500/30"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              AI-Powered Retail Intelligence Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-5xl lg:text-7xl font-black leading-[1.05] mb-5 tracking-tight"
            >
              Make Retail
              <br />
              <span className="relative inline-block overflow-hidden h-[1.15em]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIdx}
                    initial={{ y: "100%", rotateX: -45 }}
                    animate={{ y: 0, rotateX: 0 }}
                    exit={{ y: "-100%", rotateX: 45 }}
                    transition={{ duration: 0.45, ease: [0.25,0.46,0.45,0.94] }}
                    className="neon-gradient inline-block"
                    style={{ transformOrigin: "bottom" }}
                  >
                    {words[wordIdx]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-white/55 text-lg leading-relaxed max-w-lg mb-8"
            >
              Real-time shelf monitoring with computer vision. Detect stockouts within{" "}
              <span className="text-cyan-400 font-semibold">5 minutes</span>, enforce planogram
              compliance, and auto-generate replenishment orders with{" "}
              <span className="text-violet-400 font-semibold">91.7% forecast accuracy</span>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex flex-wrap gap-4 mb-8"
            >
              <MagneticButton
                onClick={onLaunch}
                className="relative flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold px-8 py-3.5 rounded-full text-sm overflow-hidden group shadow-xl shadow-cyan-500/20"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Launch Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </MagneticButton>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 glass border border-white/15 text-white/80 font-semibold px-6 py-3.5 rounded-full text-sm hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
              >
                <Star className="w-4 h-4" />
                View Demo
              </motion.button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-6 text-xs text-white/35"
            >
              {["97.3% Accuracy", "5min Alerts", "1200+ SKUs", "Zero Hardware"].map(b => (
                <span key={b} className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-cyan-500" />{b}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right — 3D Shelf card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, rotateY: 8 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative h-[500px]"
            style={{ perspective: "1200px" }}
          >
            <div className="absolute -inset-6 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 rounded-full bg-cyan-500/8 blur-[90px]" />
              <div className="absolute w-48 h-48 rounded-full bg-violet-500/10 blur-[70px] translate-x-16" />
            </div>

            {/* Decorative orbit rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-cyan-500/40 spin-slow" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-violet-500/30 spin-reverse" />
            </div>

            <div className="relative h-full rounded-2xl overflow-hidden glass border border-white/10 shadow-2xl shadow-cyan-500/10">
              <HeroShelf3D />
              {/* HUD overlays */}
              <div className="absolute top-4 left-4 glass rounded-xl px-3 py-2 text-xs border border-cyan-500/40 shadow-lg shadow-cyan-500/10">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  LIVE MONITORING
                </div>
                <div className="text-white/40 mt-0.5">Camera A1 · Dairy Section</div>
              </div>
              <div className="absolute top-4 right-4 glass rounded-xl px-3 py-2 text-xs border border-violet-500/40">
                <div className="text-violet-400 font-bold">Compliance</div>
                <div className="text-3xl font-black text-white leading-none">87%</div>
              </div>
              <div className="absolute bottom-4 left-4 glass rounded-xl px-3 py-2 text-xs border border-red-500/40">
                <div className="flex items-center gap-1.5 text-red-400 font-bold">
                  <AlertTriangle className="w-3 h-3" />3 Stockouts
                </div>
                <div className="text-white/40">Revenue at risk: $478</div>
              </div>
              {/* Scan line inside */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent scan-line" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/25 text-xs z-20"
        >
          <span>Scroll to explore</span>
          <ChevronRight className="w-4 h-4 rotate-90" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── Stats + Globe section ───────────────────────────────── */
function GlobeSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    { label: "Detection Accuracy", value: 97.3, suffix: "%", sub: "across 1,200+ SKUs", color: "#06b6d4" },
    { label: "Annual Revenue Saved", value: 1.2, suffix: "B+", sub: "globally by ShelfIQ", color: "#8b5cf6" },
    { label: "Alert Latency", value: 5, suffix: "min", sub: "camera to notification", color: "#22d3ee" },
    { label: "Forecast Accuracy", value: 91.7, suffix: "%", sub: "WMAPE 8.3% average", color: "#a78bfa" },
    { label: "Stores Deployed", value: 2400, suffix: "+", sub: "across 38 countries", color: "#06b6d4" },
    { label: "SKUs Recognized", value: 1200, suffix: "+", sub: "per store model", color: "#8b5cf6" },
  ];

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/4 to-transparent" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Globe */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="relative h-[420px]"
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 rounded-full bg-cyan-500/8 blur-[80px]" />
            </div>
            <DataGlobe3D className="w-full h-full" />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
              <p className="text-xs text-white/30 font-semibold tracking-widest">GLOBAL NETWORK</p>
              <p className="text-xs text-white/20">2,400+ stores · 38 countries · real-time</p>
            </div>
          </motion.div>

          {/* Stats grid */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <h2 className="text-4xl font-black text-white mb-3">
                Platform <span className="neon-gradient">By The Numbers</span>
              </h2>
              <p className="text-white/45 leading-relaxed">
                Deployed in major grocery, pharmacy, and convenience retail chains globally.
              </p>
            </motion.div>
            <div className="grid grid-cols-2 gap-3">
              {stats.map(({ label, value, suffix, sub, color }, i) => (
                <DataCard
                  key={label}
                  label={label}
                  value={`${value % 1 !== 0 ? value.toFixed(1) : value}${suffix}`}
                  sub={sub}
                  color={color}
                  delay={i * 0.07}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Features ────────────────────────────────────────────── */
const FEATURES = [
  { icon: Camera, title: "Computer Vision AI", desc: "YOLO-powered detection identifies products, stock levels, and planogram violations across all camera feeds at 30fps.", color: "#06b6d4" },
  { icon: Brain, title: "Demand Forecasting", desc: "Prophet + LSTM models predict 7-day demand using POS history, weather, promotions, and events with 91.7% accuracy.", color: "#8b5cf6" },
  { icon: Bell, title: "5-Minute Alerting", desc: "Smart alert delivery via dashboard, SMS, and email within 5 minutes. Prioritized by revenue impact per product.", color: "#f59e0b" },
  { icon: Shield, title: "Planogram Compliance", desc: "Automated comparison against live planogram layouts. Detects misplacements, wrong facings, and price errors.", color: "#22d3ee" },
  { icon: Database, title: "SKU-Level Recognition", desc: "Distinguishes 1,200+ similar products with 97.3% accuracy under varying lighting, angles, and partial occlusion.", color: "#a78bfa" },
  { icon: Layers, title: "Multi-Store Orchestration", desc: "Centralized view across 2,400+ stores with region drill-down, comparative analytics, and bulk replenishment orders.", color: "#34d399" },
];

function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="features" ref={ref} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 fine-grid opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/4 via-transparent to-cyan-500/4" />
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden" animate={inView ? "show" : "hidden"}
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-violet-400 font-semibold mb-4 border border-violet-500/30">
            <Cpu className="w-3.5 h-3.5" />Platform Capabilities
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-black text-white mb-4">
            <GlitchText text="Eliminate Shelf" /> <span className="neon-gradient">Blind Spots</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/45 text-lg max-w-xl mx-auto">
            End-to-end intelligent shelf monitoring powered by the latest CV and forecasting AI.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon, title, desc, color }, i) => (
            <FeatureCard key={title} icon={icon} title={title} desc={desc} color={color} delay={i * 0.07} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Live Intelligence feed section ─────────────────────── */
function LiveDataSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="live-data" ref={ref} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-25" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Wireframe 3D rings */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7 }}
            className="relative h-[380px] order-2 lg:order-1"
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 rounded-full bg-violet-500/8 blur-[80px]" />
            </div>
            <WireframeRings3D className="w-full h-full" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial="hidden" animate={inView ? "show" : "hidden"}
            variants={stagger}
            className="order-1 lg:order-2"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-cyan-400 font-semibold mb-4 border border-cyan-500/30">
              <Activity className="w-3.5 h-3.5" />Live Intelligence Engine
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl font-black text-white mb-4">
              From Camera Feed to<br /><span className="neon-gradient">Action in 5 Minutes</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/45 leading-relaxed mb-8">
              ShelfIQ's real-time pipeline processes every camera frame, detects events, and
              triggers automated workflows before a single associate even notices.
            </motion.p>

            {/* Stream stats */}
            <motion.div variants={stagger} className="space-y-3">
              {[
                { label: "Frames Processed / sec", vals: ["8,420", "8,518", "8,391", "8,602"], color: "#06b6d4" },
                { label: "Active Camera Feeds", vals: ["124", "126", "124", "125"], color: "#8b5cf6" },
                { label: "Alerts Generated Today", vals: ["47", "51", "49", "53"], color: "#f59e0b" },
                { label: "Revenue Protected ($)", vals: ["12,480", "12,967", "13,245", "13,102"], color: "#10b981" },
              ].map(({ label, vals, color }, i) => (
                <motion.div
                  key={label}
                  variants={fadeUp}
                  className="flex items-center justify-between glass rounded-xl px-4 py-3 border border-white/8"
                >
                  <span className="text-xs text-white/50">{label}</span>
                  <DataStreamColumn values={vals} delay={i} color={color} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── How it works ────────────────────────────────────────── */
const STEPS = [
  { step: "01", icon: Camera, title: "Camera Ingestion", desc: "Connect existing in-store cameras. Zero hardware changes required.", color: "#06b6d4" },
  { step: "02", icon: Brain, title: "AI Analysis", desc: "CV models process 30fps detecting stock, SKU placement, and price accuracy.", color: "#8b5cf6" },
  { step: "03", icon: Bell, title: "Alert & Action", desc: "Associates get prioritized alerts in 5 minutes. Orders auto-generated.", color: "#f59e0b" },
  { step: "04", icon: TrendingUp, title: "Continuous Learning", desc: "Models improve with each store's unique products week-over-week.", color: "#10b981" },
];

function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="how-it-works" ref={ref} className="relative py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial="hidden" animate={inView ? "show" : "hidden"} variants={stagger} className="text-center mb-14">
          <motion.h2 variants={fadeUp} className="text-4xl font-black text-white mb-4">
            Four Steps to <span className="neon-gradient">Zero Blind Spots</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/45 text-lg max-w-xl mx-auto">
            A streamlined pipeline from raw video to replenishment orders.
          </motion.p>
        </motion.div>

        <div className="relative">
          {/* Connecting SVG line */}
          <svg className="absolute top-10 left-0 w-full h-20 hidden lg:block" viewBox="0 0 1000 40" preserveAspectRatio="none">
            {inView && (
              <motion.path
                d="M 60 20 L 940 20"
                stroke="url(#lineGrad)"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="1000"
                initial={{ strokeDashoffset: 1000 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
              />
            )}
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
                <stop offset="30%" stopColor="#06b6d4" stopOpacity="0.6" />
                <stop offset="70%" stopColor="#8b5cf6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          <div className="grid lg:grid-cols-4 gap-5">
            {STEPS.map(({ step, icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="glass rounded-2xl p-6 relative group hover:border-white/20 transition-all"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 relative z-10"
                  style={{ background: `${color}15`, border: `1px solid ${color}35` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <span className="text-6xl font-black text-white/6 font-mono absolute top-3 right-4">{step}</span>
                <h3 className="font-bold text-white text-sm mb-2">{title}</h3>
                <p className="text-white/45 text-xs leading-relaxed">{desc}</p>
                <div
                  className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─────────────────────────────────────────────────── */
function CTASection({ onLaunch }: { onLaunch: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative py-36 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-cyan-500/8 blur-[120px]" />
        <div className="absolute w-80 h-80 rounded-full bg-violet-500/10 blur-[90px] translate-x-24" />
      </div>
      {/* Orbit decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-10">
        <div className="w-full h-full rounded-full border border-cyan-500/40 spin-slow" />
        <div className="absolute inset-12 rounded-full border border-violet-500/30 spin-reverse" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-cyan-400 font-semibold mb-6 border border-cyan-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Ready in Minutes · No Hardware Required
          </div>
          <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
            Stop Losing Revenue to<br />
            <GlitchText text="Empty Shelves" className="neon-gradient" />
          </h2>
          <p className="text-white/55 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Every minute a shelf is empty costs revenue. ShelfIQ detects, alerts, and resolves
            stockouts faster than any manual process — automatically.
          </p>
          <MagneticButton
            onClick={onLaunch}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-black px-12 py-4 rounded-full text-base shadow-2xl shadow-cyan-500/30"
          >
            <span>Launch Dashboard Now</span>
            <ArrowRight className="w-5 h-5" />
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Marquee strip ───────────────────────────────────────── */
const MARQUEE_ITEMS = ["Computer Vision", "Stockout Detection", "Demand Forecasting", "Planogram Compliance", "SKU Recognition", "Real-Time Alerts", "Revenue Analytics", "Auto-Replenishment"];
function MarqueeStrip() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="relative py-3 border-y border-white/6 overflow-hidden bg-white/2">
      <div className="flex whitespace-nowrap marquee gap-8">
        {items.map((item, i) => (
          <span key={`${item}-${i}`} className="text-xs font-semibold text-white/30 flex items-center gap-3 shrink-0">
            <span className="w-1 h-1 rounded-full bg-cyan-500/60" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Root ────────────────────────────────────────────────── */
export default function Landing() {
  const [, setLocation] = useLocation();
  const handleLaunch = () => setLocation("/dashboard");

  return (
    <div className="min-h-screen bg-background">
      <NavBar onLaunch={handleLaunch} />
      <HeroSection onLaunch={handleLaunch} />
      <MarqueeStrip />
      <GlobeSection />
      <FeaturesSection />
      <LiveDataSection />
      <HowItWorksSection />
      <CTASection onLaunch={handleLaunch} />

      <footer className="border-t border-white/6 py-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center">
            <Package className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-black text-white/70 tracking-tight">ShelfIQ</span>
        </div>
        <p className="text-white/25 text-xs">Smart Retail Shelf Intelligence · AI-Powered Monitoring · 2,400+ Stores Worldwide</p>
      </footer>
    </div>
  );
}
