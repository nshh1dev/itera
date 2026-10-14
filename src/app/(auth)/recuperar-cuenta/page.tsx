import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Recuperar cuenta" };
export default function Page() { return <Suspense><AuthForm mode="forgot" /></Suspense>; }
