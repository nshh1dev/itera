"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main id="main-content" className="empty-state min-h-[70dvh]"><h1 className="page-title">No se pudo cargar la página.</h1><p className="max-w-md text-base leading-7 text-muted-foreground">Vuelve a intentarlo. Si el problema continúa, comprueba que la base de datos local esté iniciada con <code className="break-words font-mono">npm run db:start</code>.</p><Button onClick={reset}>Volver a intentar</Button></main>;
}
