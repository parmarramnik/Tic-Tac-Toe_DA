import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export default function AnimatedCounter({ value, prefix = "", suffix = "", decimals = 0, duration = 2, className = "" }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const end = start + duration * 1000;
    const tick = () => {
      const now = Date.now();
      const progress = Math.min((now - start) / (end - start), 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(ease * value);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  );
}
