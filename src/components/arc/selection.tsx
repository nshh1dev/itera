"use client";
// Indicador compartido de Arc Tabs, reutilizado sin cambiar la semántica del control.
import { motion } from "motion/react";
import { motionTokens } from "./motion-tokens";
import { useReducedMotion } from "./use-reduced-motion";

export function Selection({ id, className = "bg-selection" }: { id: string; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.span aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 rounded-[inherit] ${className}`} layoutId={id} transition={reduced ? { duration: 0 } : motionTokens.spring.morph} />;
}
