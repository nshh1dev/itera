"use client";
import { MotionConfig } from "motion/react";
import { motionTokens } from "./motion-tokens";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user" transition={motionTokens.spring.smooth}>{children}</MotionConfig>;
}
