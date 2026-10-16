"use client";
import { useEffect } from "react";
import { motion, reducedMotion } from "@/lib/motion";

export function MotionController() {
  useEffect(() => {
    const running = new Map<HTMLDetailsElement, { animation: Animation; opening: boolean }>();
    function disclose(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || reducedMotion()) return;
      const target = event.target instanceof Element ? event.target : null;
      const summary = target?.closest("summary");
      const details = summary?.parentElement;
      if (!(details instanceof HTMLDetailsElement) || details.classList.contains("action-menu") || !details.animate || target?.closest("a,button,input,select")) return;
      event.preventDefault();
      const previous = running.get(details);
      const opening = previous ? !previous.opening : !details.open;
      const from = details.getBoundingClientRect().height;
      previous?.animation.cancel();
      details.open = true;
      const to = opening ? details.getBoundingClientRect().height : summary!.getBoundingClientRect().height + parseFloat(getComputedStyle(details).paddingTop) + parseFloat(getComputedStyle(details).paddingBottom);
      details.style.overflow = "hidden";
      const animation = details.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: motion.disclosure, easing: motion.ease });
      running.set(details, { animation, opening });
      animation.finished.then(() => {
        if (running.get(details)?.animation !== animation) return;
        details.open = opening;
        details.style.overflow = "";
        running.delete(details);
      }).catch(() => {});
    }
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    function finish() {
      for (const [details, { animation, opening }] of running) { animation.cancel(); details.open = opening; details.style.overflow = ""; }
      running.clear();
      for (const animation of document.getAnimations()) {
        if (animation.effect?.getTiming().iterations !== Infinity) { try { animation.finish(); } catch {} }
      }
    }
    function theme() {
      if (reducedMotion()) return;
      document.documentElement.classList.add("theme-changing");
      clearTimeout(themeTimer);
      themeTimer = setTimeout(() => document.documentElement.classList.remove("theme-changing"), motion.disclosure);
    }
    let themeTimer: ReturnType<typeof setTimeout>;
    document.addEventListener("click", disclose);
    window.addEventListener("itera:theme-changing", theme);
    preference.addEventListener("change", finish);
    return () => { document.removeEventListener("click", disclose); window.removeEventListener("itera:theme-changing", theme); preference.removeEventListener("change", finish); clearTimeout(themeTimer); document.documentElement.classList.remove("theme-changing"); finish(); };
  }, []);
  return null;
}
