"use client";
import { useLayoutEffect, useRef } from "react";
import { useSelectedLayoutSegments } from "next/navigation";
import { motion, reducedMotion } from "@/lib/motion";

// Cambia la presentación, no la identidad de los hijos: Monaco y formularios no se remontan.
// La clave son los segmentos que este layout renderiza de verdad: abrir un panel
// interceptado cambia la URL sin cambiar el contenido, y no debe repetir la entrada.
export function MotionRegion({ children, motionKey, className }: { children: React.ReactNode; motionKey?: string; className?: string }) {
  const segments = useSelectedLayoutSegments() ?? [];
  const element = useRef<HTMLDivElement>(null);
  const key = motionKey ?? segments.join("/");
  useLayoutEffect(() => {
    if (!element.current || reducedMotion() || !element.current.animate) return;
    const animation = element.current.animate([{ opacity: .65, transform: "translateY(5px)" }, { opacity: 1, transform: "none" }], { duration: motion.navigation, easing: motion.ease });
    return () => animation.cancel();
  }, [key]);
  return <div ref={element} className={className}>{children}</div>;
}
