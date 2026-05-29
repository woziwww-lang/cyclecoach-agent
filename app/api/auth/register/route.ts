import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { setUserCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

const RegisterSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8),
  name: z.string().min(1).max(80).optional()
});

export async function POST(request: Request) {
  const form = await request.formData();
  const parsed = RegisterSchema.safeParse({
    email: form.get("email"),
    password: form.get("password"),
    name: form.get("name") || undefined
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/register?error=invalid", request.url), { status: 303 });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return NextResponse.redirect(new URL("/login?error=already_exists", request.url), { status: 303 });
  }

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name ?? parsed.data.email.split("@")[0],
      passwordHash: await hashPassword(parsed.data.password)
    }
  });

  const response = NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 });
  setUserCookie(response, user.id);
  return response;
}
