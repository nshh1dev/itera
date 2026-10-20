"use client";
import { motion } from "motion/react";
import { motionTokens } from "./arc/motion-tokens";
import { useReducedMotion } from "./arc/use-reduced-motion";

// Solo fundido: animar altura haría crecer el marco de ayudas por fotograma.
export function MotionReveal({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return <motion.div initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : motionTokens.duration.instant, ease: motionTokens.ease.enter }}>{children}</motion.div>;
}
