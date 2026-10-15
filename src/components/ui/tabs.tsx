"use client";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
export const Tabs = TabsPrimitive.Root;
export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) { return <TabsPrimitive.List className={cn("tabs-tray inline-flex gap-1 rounded-xl bg-surface-inset p-1", className)} {...props} />; }
export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) { return <TabsPrimitive.Trigger className={cn("min-h-11 rounded-md px-3 text-[13px] text-tonal-foreground transition-colors hover:text-foreground data-[state=active]:bg-control data-[state=active]:text-foreground data-[state=active]:shadow-control md:min-h-9", className)} {...props} />; }
export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) { return <TabsPrimitive.Content className={cn("rounded-lg", className)} {...props} />; }
