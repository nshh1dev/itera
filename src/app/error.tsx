"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Disclosure } from "@/components/arc/disclosure";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main id="main-content" className="empty-state min-h-[70dvh]"><h1 className="page-title">No se pudo cargar la página.</h1><p className="max-w-md text-base leading-7 text-muted-foreground">Inténtalo de nuevo o comprueba la base de datos local.</p><div className="flex flex-wrap items-center justify-center gap-3"><Button onClick={reset}>Reintentar</Button><Button asChild variant="outline"><Link href="/inicio">Ir al inicio</Link></Button></div><Disclosure className="mt-2 w-full max-w-md text-sm text-muted-foreground" title="Ayuda técnica"><p className="mt-2 leading-6">Desde la carpeta del proyecto, <code className="break-words font-mono">npm run db:start</code> inicia la base de datos local.</p></Disclosure></main>;
}
