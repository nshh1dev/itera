import Link from "next/link";
import { cn } from "@/lib/utils";
export function Logo({ className, href = "/inicio" }: { className?: string; href?: string }) {
  return <Link href={href} className={cn("inline-flex items-center gap-2.5", className)} aria-label="Itera, inicio"><span className="flex size-8 items-center justify-center rounded-[10px] bg-foreground text-background" aria-hidden="true"><svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="m9 6-5 6 5 6m6-12 5 6-5 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span><span className="text-[25px] leading-none font-semibold tracking-[-0.07em]">itera<span className="text-primary">.</span></span></Link>;
}
