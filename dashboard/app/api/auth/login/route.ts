import { NextResponse } from "next/server";
import { LOCAL_USER_ID, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/constants";
import { devPassword, passwordsMatch, signSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let password = "";
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { password?: string };
    password = body.password ?? "";
  } else {
    const form = await request.formData();
    password = String(form.get("password") ?? "");
  }

  const url = new URL(request.url);
  if (!passwordsMatch(password, devPassword())) {
    return NextResponse.redirect(new URL("/login?error=1", url), 303);
  }

  const token = await signSession(LOCAL_USER_ID);
  const response = NextResponse.redirect(new URL("/", url), 303);
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
