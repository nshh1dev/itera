import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Nueva contraseña" };
export default function Page() { return <Suspense><AuthForm mode="reset" /></Suspense>; }
