import { NextResponse } from "next/server";
import { clearUserCookie } from "@/lib/auth/session";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  clearUserCookie(response);
  return response;
}
