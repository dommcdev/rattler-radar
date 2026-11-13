import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

/** Better Auth's endpoints: Google sign-in, its callback, sign out, and session lookups. */
export const { GET, POST } = toNextJsHandler(auth);
