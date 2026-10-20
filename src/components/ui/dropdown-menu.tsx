"use client";

import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuGroup = DropdownPrimitive.Group;
export const DropdownMenuLabel = DropdownPrimitive.Label;

export function DropdownMenuContent({ className, sideOffset = 8, ...props }: React.ComponentProps<typeof DropdownPrimitive.Content>) {
  return <DropdownPrimitive.Portal><DropdownPrimitive.Content sideOffset={sideOffset} className={cn("z-50 min-w-56 max-w-[calc(100vw-2rem)] rounded-xl border bg-surface p-1.5 text-foreground shadow-lg", className)} {...props} /></DropdownPrimitive.Portal>;
}

export function DropdownMenuItem({ className, ...props }: React.ComponentProps<typeof DropdownPrimitive.Item>) {
  return <DropdownPrimitive.Item className={cn("flex min-h-11 cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none focus:bg-selection data-[disabled]:pointer-events-none data-[disabled]:opacity-50 md:min-h-9 [&_svg]:size-4", className)} {...props} />;
}
