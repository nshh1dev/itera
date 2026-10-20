import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs leading-4 font-medium [&_svg]:size-3 [&_svg]:shrink-0", {
  variants: {
    variant: { default: "bg-surface-secondary text-tonal-foreground", outline: "border border-border-soft text-muted-foreground", filter: "bg-surface-secondary text-foreground hover:bg-selection" },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({ className, variant, asChild = false, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  return <Comp className={cn(badgeVariants({ variant, className }))} {...props} />;
}
