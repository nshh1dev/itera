import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() { return <main id="main-content" className="empty-state min-h-[70dvh]"><p className="eyebrow">404</p><h1 className="page-title">Este camino no existe.</h1><p className="text-muted-foreground">Volvamos a un buen punto de partida.</p><Button asChild className="mt-3"><Link href="/inicio">Volver a mi espacio</Link></Button></main>; }
