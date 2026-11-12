import { cookies } from "next/headers";
import { verifyToken, TokenPayload } from "@/lib/auth/jwt";

export const SESSION_COOKIE_NAME = "habib_session_token";

export async function getServerSessionUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function getRequestSessionUser(request: Request): TokenPayload | null {
  try {
    // 1. Try Authorization header
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      const payload = verifyToken(token);
      if (payload) return payload;
    }

    // 2. Try Cookie header
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const cookiesArr = cookieHeader.split(";").map((c) => c.trim());
      const sessionCookie = cookiesArr.find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
      if (sessionCookie) {
        const token = sessionCookie.substring(`${SESSION_COOKIE_NAME}=`.length);
        const payload = verifyToken(token);
        if (payload) return payload;
      }
    }

    return null;
  } catch {
    return null;
  }
}
