"use client";
import { useEffect, useRef } from "react";
import { useSelectedLayoutSegments } from "next/navigation";
import { useAnimate } from "motion/react";
import { motionTokens } from "./arc/motion-tokens";
import { useReducedMotion } from "./arc/use-reduced-motion";

// No usar key en el contenedor: formularios, borradores y Monaco conservan su nodo.
export function MotionRegion({ children, motionKey, className }: { children: React.ReactNode; motionKey?: string; className?: string }) {
  const segments = useSelectedLayoutSegments();
  const key = motionKey ?? segments.join("/");
  const previous = useRef(key);
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const reduced = useReducedMotion();
  useEffect(() => {
    if (previous.current === key) return;
    previous.current = key;
    const node = scope.current;
    if (reduced || !node) return;
    const controls = animate(node, { opacity: [.65, 1] }, { duration: motionTokens.duration.fast, ease: motionTokens.ease.enter });
    return () => { controls.stop(); node.style.opacity = ""; };
  }, [key, reduced, animate, scope]);
  return <div ref={scope} className={className}>{children}</div>;
}
