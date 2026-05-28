import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

const cookieName = process.env.SESSION_COOKIE_NAME ?? "cc_user_id";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(cookieName)?.value;
  if (!userId) return null;

  return prisma.user.findUnique({ where: { id: userId } });
}

export function setUserCookie(response: NextResponse, userId: string) {
  response.cookies.set(cookieName, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}
