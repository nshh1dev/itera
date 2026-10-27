import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import "@/components/arc/motion.css";
import { MotionProvider } from "@/components/arc/motion-provider";

const sourceSans = localFont({
  src: [
    { path: "./fonts/source-sans-3.ttf", weight: "200 900", style: "normal" },
    { path: "./fonts/source-sans-3-italic.ttf", weight: "200 900", style: "italic" },
  ],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = { title: { default: "Itera — Un intento más cerca", template: "%s · Itera" }, description: "Tu espacio para aprender y fortalecer la lógica de programación. Practica a tu ritmo, en tu computadora.", robots: { index: false, follow: false } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" className={sourceSans.variable} suppressHydrationWarning><body><ThemeProvider><MotionProvider><a href="#main-content" className="skip-link">Saltar al contenido</a>{children}</MotionProvider></ThemeProvider></body></html>;
}
