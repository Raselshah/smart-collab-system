import { cookies } from "next/headers";
import { verifyJWT, type JWTPayload } from "./jwt";
import prisma from "./prisma";

export async function getCurrentUser(): Promise<JWTPayload | null> {
  try {
    // 1. Add 'await' here because cookies() is asynchronous in Next.js 15
    const cookieStore = await cookies();

    // 2. Now cookieStore is the actual ReadonlyRequestCookies instance
    console.log("cookieStore resolved successfully");

    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    const payload = verifyJWT(token);
    if (!payload) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, name: true },
    });

    if (!user) {
      return null;
    }

    return payload;
  } catch (error) {
    // Pro-tip: Always log errors during development so bugs don't stay hidden!
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export function hasRole(user: JWTPayload | null, roles: string[]) {
  if (!user) return false;
  return roles.includes(user.role);
}
