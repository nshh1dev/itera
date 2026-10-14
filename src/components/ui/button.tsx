import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva("inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0", {
  variants: {
    variant: { default: "bg-primary text-primary-foreground hover:brightness-95", secondary: "bg-surface text-foreground hover:bg-border", outline: "border border-border bg-background hover:bg-surface", ghost: "hover:bg-surface text-muted-foreground hover:text-foreground", destructive: "bg-destructive text-background" },
    size: { default: "h-11 px-4", sm: "h-9 px-3 text-xs", lg: "h-12 px-6", icon: "size-11" },
  }, defaultVariants: { variant: "default", size: "default" },
});

export function Button({ className, variant, size, asChild = false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
