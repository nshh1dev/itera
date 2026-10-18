"use client";
import { useEffect, useRef, useState } from "react";

// El arrastre pinta como máximo una vez por frame; solo el valor confirmado se
// persiste. El teclado confirma inmediatamente, igual que antes.
export function usePanelSize(initial: number, min: number, max: number) {
  const [value, setValue] = useState(initial);
  const [committed, setCommitted] = useState(initial);
  const pending = useRef(initial);
  const frame = useRef<number | null>(null);
  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current); }, []);

  function move(next: number) {
    pending.current = Math.min(max, Math.max(min, next));
    if (frame.current === null) frame.current = requestAnimationFrame(() => {
      frame.current = null;
      setValue(pending.current);
    });
  }
  function finish() {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    setValue(pending.current);
    setCommitted(pending.current);
  }
  function step(delta: number) {
    pending.current = Math.min(max, Math.max(min, pending.current + delta));
    finish();
  }
  return { value, committed, move, finish, step };
}
