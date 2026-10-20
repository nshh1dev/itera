"use client";
// Adaptado de https://uiarc.dev/r/dialog.json (MIT; ../arc/LICENSE).
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { createContext, useContext, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { motionTokens } from "../arc/motion-tokens";
import { useReducedMotion } from "../arc/use-reduced-motion";

const OpenContext = createContext(false);

export function Dialog({ open: controlled, defaultOpen = false, onOpenChange, ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  const [internal, setInternal] = useState(defaultOpen);
  const open = controlled ?? internal;
  return <OpenContext.Provider value={open}><DialogPrimitive.Root {...props} open={open} onOpenChange={value => { if (controlled === undefined) setInternal(value); onOpenChange?.(value); }} /></OpenContext.Provider>;
}

export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ children, className, onExitComplete, onPointerDownOutside, ...props }: React.ComponentProps<typeof DialogPrimitive.Content> & { onExitComplete?: () => void }) {
  const open = useContext(OpenContext);
  const reduced = useReducedMotion();
  const drawer = className?.includes("navigation-drawer");
  // Arc evita que una pulsación anterior al último cambio cierre un panel recién reabierto.
  const change = useRef({ open, at: 0 });
  useLayoutEffect(() => { change.current = { open, at: performance.now() }; }, [open]);
  const pressOutside: React.ComponentProps<typeof DialogPrimitive.Content>["onPointerDownOutside"] = event => {
    onPointerDownOutside?.(event);
    if (!change.current.open || event.detail.originalEvent.timeStamp < change.current.at) event.preventDefault();
  };
  const leave = { duration: reduced ? 0 : motionTokens.duration.fast, ease: motionTokens.ease.standard };
  return <AnimatePresence onExitComplete={onExitComplete}>
    {open && <DialogPrimitive.Portal key="dialog" forceMount>
      <DialogPrimitive.Overlay forceMount asChild><motion.div className="dialog-overlay fixed inset-0 z-50" initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={leave} /></DialogPrimitive.Overlay>
      <DialogPrimitive.Content {...props} onPointerDownOutside={pressOutside} forceMount asChild>
        <motion.div className={cn("dialog-content fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl", className)}
          initial={reduced ? false : drawer ? { x: -40, opacity: 0 } : { opacity: 0, y: 8, scale: .96 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : drawer ? { x: -24, opacity: 0, transition: leave } : { opacity: 0, y: 4, scale: .98, transition: leave }}
          transition={reduced ? { duration: 0 } : { default: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } }}>
          <div className="dialog-body">{children}</div>
          <DialogPrimitive.Close className="dialog-close absolute top-2 right-2 flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-selection md:top-3 md:right-3 md:size-8" aria-label="Cerrar"><X className="size-4" /></DialogPrimitive.Close>
        </motion.div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>}
  </AnimatePresence>;
}
