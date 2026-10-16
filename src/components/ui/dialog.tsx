"use client";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { createContext, useContext, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, originFrom, reducedMotion, type MotionOrigin } from "@/lib/motion";

const DialogMotion = createContext<{ open: boolean; origin: React.RefObject<MotionOrigin | undefined>; captureOrigin: (element: HTMLElement) => void } | null>(null);

export function Dialog({ open: controlled, defaultOpen = false, onOpenChange, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  const [internal, setInternal] = useState(defaultOpen);
  const origin = useRef<MotionOrigin>(undefined);
  const open = controlled ?? internal;
  return <DialogMotion.Provider value={{ open, origin, captureOrigin: element => { origin.current = originFrom(element); } }}><DialogPrimitive.Root {...props} open={open} onOpenChange={value => { setInternal(value); onOpenChange?.(value); }}>{children}</DialogPrimitive.Root></DialogMotion.Provider>;
}

export function DialogTrigger({ onClick, ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  const context = useContext(DialogMotion);
  return <DialogPrimitive.Trigger {...props} onClick={event => { context?.captureOrigin(event.currentTarget); onClick?.(event); }} />;
}

export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
export const DialogClose = DialogPrimitive.Close;

function DialogSurface({ origin, onExitComplete }: { origin?: MotionOrigin; onExitComplete?: () => void }) {
  const context = useContext(DialogMotion);
  const surface = useRef<HTMLSpanElement>(null);
  const animation = useRef<Animation | null>(null);
  const completed = useRef(onExitComplete);
  useLayoutEffect(() => { completed.current = onExitComplete; });
  const open = context?.open ?? true;

  useLayoutEffect(() => {
    const layer = surface.current;
    const panel = layer?.parentElement;
    if (!panel || !layer) return;
    const source = origin ?? context?.origin.current;
    const drawer = panel.classList.contains("navigation-drawer");
    const rect = panel.getBoundingClientRect();
    const usable = source?.element.isConnected && source.element.getClientRects().length;
    const sourceRect = usable ? source!.element.getBoundingClientRect() : null;
    const from = drawer ? "translateX(-100%)" : sourceRect
      ? `translate(${sourceRect.left + sourceRect.width / 2 - rect.left - rect.width / 2}px, ${sourceRect.top + sourceRect.height / 2 - rect.top - rect.height / 2}px) scale(${Math.max(.08, Math.min(1, sourceRect.width / rect.width))}, ${Math.max(.08, Math.min(1, sourceRect.height / rect.height))})`
      : "scale(.97)";
    const currentStyle = getComputedStyle(layer);
    const current = animation.current ? currentStyle.transform : open ? from : "none";
    const opacity = animation.current ? currentStyle.opacity : open && !usable && !drawer ? .5 : 1;
    animation.current?.cancel();
    if (reducedMotion() || typeof layer.animate !== "function") {
      layer.style.transform = "none";
      if (!open) queueMicrotask(() => completed.current?.());
      return;
    }
    const active = layer.animate([{ transform: current, opacity }, { transform: open ? "none" : from, opacity: !open && !usable && !drawer ? 0 : 1 }], { duration: open ? motion.panelOpen : motion.panelClose, easing: motion.ease, fill: "both" });
    animation.current = active;
    active.finished.then(() => { if (!open) completed.current?.(); }).catch(() => {});
    // La siguiente transición recoge la posición actual antes de cancelar; no salta al pulsar rápido.
  }, [open, origin, context?.origin]);

  useLayoutEffect(() => () => { animation.current?.cancel(); }, []);

  return <span ref={surface} className="dialog-surface" aria-hidden="true" />;
}

export function DialogContent({ children, className, origin, onExitComplete, ...props }: React.ComponentProps<typeof DialogPrimitive.Content> & { origin?: MotionOrigin; onExitComplete?: () => void }) {
  return <DialogPrimitive.Portal forceMount={onExitComplete ? true : undefined}>
    <DialogPrimitive.Overlay className="dialog-overlay fixed inset-0 z-50" />
    <DialogPrimitive.Content className={cn("dialog-content fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl", className)} {...props}>
      <DialogSurface origin={origin} onExitComplete={onExitComplete} />
      <div className="dialog-body">{children}</div>
      <DialogPrimitive.Close className="dialog-close absolute top-2 right-2 flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-selection md:top-3 md:right-3 md:size-8" aria-label="Cerrar"><X className="size-4" /></DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>;
}
