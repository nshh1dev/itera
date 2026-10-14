"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main id="main-content" className="empty-state min-h-[70dvh]"><h1 className="page-title">Necesitamos un nuevo intento.</h1><p className="max-w-md text-sm leading-7 text-muted-foreground">No pudimos cargar esta página. Comprueba que PostgreSQL esté iniciado con <code className="font-mono">npm run db:start</code> y vuelve a intentarlo.</p><Button onClick={reset}>Volver a intentar</Button></main>;
}
