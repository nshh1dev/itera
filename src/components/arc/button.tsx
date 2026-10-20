"use client";

// Adaptado de https://uiarc.dev/r/button.json (MIT; see LICENSE).
// Itera conserva sus variantes, enlaces asChild y etiquetas multilínea.
import { isValidElement, type ReactNode, type Ref } from "react";
import { Slot } from "@radix-ui/react-slot";
import { AnimatePresence, motion, useIsPresent, type HTMLMotionProps } from "motion/react";
import { motionTokens } from "./motion-tokens";
import { useReducedMotion } from "./use-reduced-motion";

const MotionSlot = motion.create(Slot);

function labelKey(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number" || typeof node === "bigint") return String(node);
  if (Array.isArray(node)) return node.map(labelKey).join("");
  if (!isValidElement(node)) return "";
  const type = node.type as string | { displayName?: string; name?: string };
  return `<${typeof type === "string" ? type : type?.displayName ?? type?.name ?? ""}>${labelKey((node.props as { children?: ReactNode }).children)}`;
}

function LabelPhase({ children, reduced, ref }: { children: ReactNode; reduced: boolean; ref?: Ref<HTMLSpanElement> }) {
  const present = useIsPresent();
  return <motion.span ref={ref} className="arc-button-label" aria-hidden={present ? undefined : true}
    initial={reduced ? false : { opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, transition: { duration: reduced ? 0 : motionTokens.duration.instant } }}
    transition={{ duration: reduced ? 0 : motionTokens.duration.fast, ease: motionTokens.ease.enter }}>
    {children}
  </motion.span>;
}

export function ArcButton({ asChild = false, loading = false, children, disabled, onClick, ...props }: Omit<HTMLMotionProps<"button">, "children"> & { children?: ReactNode; asChild?: boolean; loading?: boolean }) {
  const reduced = useReducedMotion();
  const popup = props["aria-haspopup"];
  const anchorsLayer = (popup !== undefined && popup !== false && popup !== "false") || props.role === "combobox" || "data-state" in props;
  const inert = disabled || loading || props["aria-disabled"] === true || props["aria-disabled"] === "true";
  const feedback = {
    whileTap: reduced || anchorsLayer || inert ? undefined : { scale: .97 },
    transition: reduced ? { duration: 0 } : motionTokens.spring.snappy,
  };
  // No envoltorios dentro de enlaces: Slot debe recibir exactamente su hijo original.
  if (asChild) return <MotionSlot {...props} {...feedback} onClick={onClick}>{children}</MotionSlot>;
  return <motion.button {...props} {...feedback} disabled={disabled} aria-busy={loading || props["aria-busy"] || undefined}
    aria-disabled={loading || props["aria-disabled"] || undefined} onClick={loading ? event => event.preventDefault() : onClick}>
    {loading && <span className="arc-button-loader" aria-hidden="true"><span className="arc-spinner" /></span>}
    <span className="arc-button-slot" style={loading ? { opacity: 0 } : undefined}>
      <AnimatePresence initial={false} mode="popLayout"><LabelPhase key={labelKey(children)} reduced={!!reduced}>{children}</LabelPhase></AnimatePresence>
    </span>
  </motion.button>;
}
