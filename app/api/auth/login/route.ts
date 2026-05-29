import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPassword } from "@/lib/auth/password";
import { setUserCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

const LoginSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  const form = await request.formData();
  const parsed = LoginSchema.safeParse({
    email: form.get("email"),
    password: form.get("password")
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url), { status: 303 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const ok = await verifyPassword(parsed.data.password, user?.passwordHash);
  if (!user || !ok) {
    return NextResponse.redirect(new URL("/login?error=bad_credentials", request.url), { status: 303 });
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 });
  setUserCookie(response, user.id);
  return response;
}
