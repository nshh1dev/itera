"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { createExecutionTracker } from "@/lib/execution-tracker";
import type { ExecutionResult } from "@/lib/types";

// Se monta solo en los editores ya hidratados, aislados por cuenta y contexto.
export function useExecution(options: { key: string; variantId: string; diagnosticItemId?: string; initialResult?: ExecutionResult | null }) {
  const router = useRouter();
  const [tracker] = useState(() => createExecutionTracker({ ...options, storage: () => localStorage, fetch: (...args) => fetch(...args) }));
  const state = useSyncExternalStore(tracker.subscribe, tracker.getSnapshot, tracker.getSnapshot);
  const active = !!state.pending;

  useEffect(() => {
    if (!active) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    async function tick() {
      await tracker.step();
      if (!stopped) timer = setTimeout(tick, tracker.getDelay());
    }
    timer = setTimeout(tick, 0);
    return () => { stopped = true; clearTimeout(timer); };
  }, [tracker, active]);

  useEffect(() => { if (state.completed) router.refresh(); }, [state.completed, router]);

  return { ...state, busy: active, start: tracker.start };
}
