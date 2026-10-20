"use client";
import type { ComponentProps } from "react";
import { ArcButton } from "@/components/arc/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva("arc-button inline-flex max-w-full shrink-0 items-center justify-center gap-2 whitespace-normal rounded-lg text-center text-sm font-medium active:brightness-95 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0", {
  variants: {
    variant: { default: "bg-primary text-primary-foreground shadow-control hover:brightness-95", secondary: "secondary-control bg-surface-secondary text-foreground hover:bg-selection", outline: "border border-input bg-control text-foreground hover:bg-surface-secondary", ghost: "text-tonal-foreground hover:bg-selection hover:text-foreground", segment: "text-tonal-foreground hover:text-foreground aria-pressed:bg-control aria-pressed:text-foreground aria-pressed:shadow-control", destructive: "bg-destructive text-background shadow-control" },
    size: { default: "min-h-11 px-4 py-2 text-sm md:min-h-10", sm: "min-h-11 px-3 py-2 text-xs md:min-h-9", lg: "min-h-12 px-6 py-3 md:min-h-11", icon: "size-11 md:size-8" },
  }, defaultVariants: { variant: "default", size: "default" },
});

export function Button({ className, variant, size, ...props }: ComponentProps<typeof ArcButton> & VariantProps<typeof buttonVariants>) {
  return <ArcButton className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
