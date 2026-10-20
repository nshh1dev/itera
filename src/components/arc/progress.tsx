"use client";
// Adaptado de https://uiarc.dev/r/progress.json (MIT; see LICENSE).
import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { motionTokens } from "./motion-tokens";
import { useReducedMotion } from "./use-reduced-motion";
import { cn } from "@/lib/utils";

export function Progress({ value = 0, max = 100, label, className }: { value?: number; max?: number; label: string; className?: string }) {
  const reduced = useReducedMotion();
  const safeMax = max > 0 ? max : 1;
  const safeValue = Math.min(Math.max(value, 0), safeMax);
  const percentage = safeValue / safeMax * 100;
  const progress = useMotionValue(percentage);
  const x = useTransform(progress, latest => `${Math.min(Math.max(latest, 0), 100) - 100}%`);
  useEffect(() => {
    if (reduced) { progress.jump(percentage); return; }
    const controls = animate(progress, percentage, motionTokens.spring.smooth);
    return () => controls.stop();
  }, [percentage, progress, reduced]);
  return <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={safeMax} aria-valuenow={safeValue} aria-valuetext={`${Math.round(percentage)}%`} className={cn("progress-track overflow-hidden", className)}>
    <motion.div className="progress-fill w-full" style={{ x }} />
  </div>;
}
