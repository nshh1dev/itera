"use client";
import { motion } from "motion/react";
import { motionTokens } from "./arc/motion-tokens";
import { useReducedMotion } from "./arc/use-reduced-motion";

// Revelado de contenido de Arc Accordion, sin volver a montar pistas anteriores.
export function MotionReveal({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return <motion.div initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={reduced ? { duration: 0 } : motionTokens.spring.smooth} className="overflow-hidden">{children}</motion.div>;
}
