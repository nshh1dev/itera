"use client";
import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, reducedMotion } from "@/lib/motion";

// Cambia la presentación, no la identidad de los hijos: Monaco y formularios no se remontan.
export function MotionRegion({ children, motionKey, className }: { children: React.ReactNode; motionKey?: string; className?: string }) {
  const pathname = usePathname();
  const element = useRef<HTMLDivElement>(null);
  const key = motionKey ?? pathname;
  useLayoutEffect(() => {
    if (!element.current || reducedMotion() || !element.current.animate) return;
    const animation = element.current.animate([{ opacity: .65, transform: "translateY(5px)" }, { opacity: 1, transform: "none" }], { duration: motion.navigation, easing: motion.ease });
    return () => animation.cancel();
  }, [key]);
  return <div ref={element} className={className}>{children}</div>;
}
