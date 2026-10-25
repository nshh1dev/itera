import { auth } from "@/server/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { uncachedAuthHandler } from "@/lib/auth-security";
export const { GET, POST } = toNextJsHandler(uncachedAuthHandler(request => auth.handler(request)));
