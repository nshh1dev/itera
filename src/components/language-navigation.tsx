import Link from "next/link";
import { languages, languageNames, type Language } from "@/lib/types";

export function LanguageNavigation({ language, pathname, label = "Lenguaje del progreso" }: { language: Language; pathname: string; label?: string }) {
  return <nav aria-label={label} className="segmented-control mt-5 flex-wrap">{languages.map(item => <Link key={item} href={`${pathname}?lenguaje=${item}`} aria-current={item === language ? "page" : undefined} className="segment">{languageNames[item]}</Link>)}</nav>;
}
