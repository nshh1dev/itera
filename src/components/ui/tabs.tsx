"use client";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import { useLayoutEffect, useRef } from "react";
export const Tabs = TabsPrimitive.Root;
export function TabsList({ className, children, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  const list = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const node = list.current;
    const marker = indicator.current;
    if (!node || !marker) return;
    function update() {
      const active = node!.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
      if (!active) return;
      marker!.style.width = `${active.offsetWidth}px`;
      marker!.style.height = `${active.offsetHeight}px`;
      marker!.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
      node!.dataset.indicator = "ready";
    }
    update();
    const mutations = new MutationObserver(update);
    mutations.observe(node, { subtree: true, attributes: true, attributeFilter: ["data-state"] });
    const resize = new ResizeObserver(update);
    resize.observe(node);
    return () => { mutations.disconnect(); resize.disconnect(); };
  }, []);
  return <TabsPrimitive.List ref={list} className={cn("tabs-tray relative inline-flex gap-1 rounded-xl bg-surface-inset p-1", className)} {...props}><span ref={indicator} className="tabs-indicator" aria-hidden="true" />{children}</TabsPrimitive.List>;
}
export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) { return <TabsPrimitive.Trigger className={cn("min-h-11 rounded-md px-3 text-[13px] text-tonal-foreground transition-colors hover:text-foreground data-[state=active]:bg-control data-[state=active]:text-foreground data-[state=active]:shadow-control md:min-h-9", className)} {...props} />; }
export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) { return <TabsPrimitive.Content className={cn("rounded-lg", className)} {...props} />; }
