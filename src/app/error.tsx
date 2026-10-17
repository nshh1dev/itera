"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main id="main-content" className="empty-state min-h-[70dvh]"><h1 className="page-title">No se pudo cargar la página.</h1><p className="max-w-md text-base leading-7 text-muted-foreground">Vuelve a intentarlo. Si el problema continúa, comprueba que la base de datos local esté iniciada.</p><div className="flex flex-wrap items-center justify-center gap-3"><Button onClick={reset}>Volver a intentar</Button><Button asChild variant="outline"><Link href="/inicio">Volver a mi espacio</Link></Button></div><Link href="/ejercicios" className="text-link">Explorar ejercicios</Link><details className="mt-2 max-w-md text-xs text-muted-foreground"><summary className="min-h-11 cursor-pointer">Si mantienes el proyecto</summary><p className="mt-2 leading-6">Desde la carpeta del proyecto, <code className="break-words font-mono">npm run db:start</code> inicia la base de datos local.</p></details></main>;
}
