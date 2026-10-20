"use client";
// Adaptado de https://uiarc.dev/r/tabs.json (MIT; ../arc/LICENSE).
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { createContext, useContext, useId, useState } from "react";
import { LayoutGroup, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { motionTokens } from "../arc/motion-tokens";
import { useReducedMotion } from "../arc/use-reduced-motion";

const TabsContext = createContext("");
export function Tabs({ value, defaultValue, onValueChange, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const id = useId();
  return <TabsContext.Provider value={value ?? internal}><LayoutGroup id={id}><TabsPrimitive.Root {...props} value={value ?? internal} onValueChange={next => { if (value === undefined) setInternal(next); onValueChange?.(next); }} /></LayoutGroup></TabsContext.Provider>;
}

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className={cn("arc-tabs-list relative inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-surface-inset p-1", className)} {...props} />;
}

export function TabsTrigger({ className, children, value, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const active = useContext(TabsContext);
  const reduced = useReducedMotion();
  return <TabsPrimitive.Trigger {...props} value={value} className={cn("relative isolate min-h-11 shrink-0 rounded-md px-3 text-[13px] text-tonal-foreground hover:text-foreground data-[state=active]:text-foreground md:min-h-9", className)} onFocus={event => { event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" }); props.onFocus?.(event); }}>
    {active === value && <motion.span className="absolute inset-0 -z-10 rounded-md bg-control shadow-control" layoutId="selection" transition={reduced ? { duration: 0 } : motionTokens.spring.morph} aria-hidden="true" />}
    {children}
  </TabsPrimitive.Trigger>;
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  // Radix gestiona el montaje. No animamos altura ni duplicamos paneles con formularios.
  return <TabsPrimitive.Content className={cn("rounded-lg", className)} {...props} />;
}
