"use client";
// Adaptado de https://uiarc.dev/r/accordion.json (MIT; see LICENSE).
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { motionTokens } from "./motion-tokens";
import { useReducedMotion } from "./use-reduced-motion";
import { cn } from "@/lib/utils";

export function Disclosure({ title, children, defaultOpen = false, className, triggerClassName }: { title: ReactNode; children: ReactNode; defaultOpen?: boolean; className?: string; triggerClassName?: string }) {
  const [value, setValue] = useState(defaultOpen ? "content" : "");
  const open = value === "content";
  const reduced = useReducedMotion();
  return <AccordionPrimitive.Root type="single" collapsible value={value} onValueChange={setValue} className={className}>
    <AccordionPrimitive.Item value="content">
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger className={cn("arc-disclosure-trigger flex min-h-11 w-full items-center gap-2 py-3 text-left text-sm font-medium", triggerClassName)}>
          <span className="flex min-w-0 flex-1 items-center gap-2">{title}</span>
          <motion.span className="ml-auto flex shrink-0 text-muted-foreground" initial={false} animate={{ rotate: open ? 180 : 0 }} transition={reduced ? { duration: 0 } : motionTokens.spring.snappy}><ChevronDown className="size-3.5" aria-hidden="true" /></motion.span>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content forceMount asChild>
        <motion.div initial={false} inert={!open} aria-hidden={!open} className="overflow-hidden"
          animate={open ? { height: "auto", opacity: 1, visibility: "visible" } : { height: 0, opacity: 0, transitionEnd: { visibility: "hidden" } }}
          transition={reduced ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } }}>
          <div className="min-w-0">{children}</div>
        </motion.div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  </AccordionPrimitive.Root>;
}
