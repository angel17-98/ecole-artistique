import { NextResponse } from "next/server";

const COOKIE_NAME = "site_unlock";

export async function POST(req: Request) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const from = String(form.get("from") ?? "/");

  const expected = process.env.SITE_PASSWORD || "";

  if (!expected) {
    return NextResponse.json(
      { error: "SITE_PASSWORD n’est pas défini dans .env.local" },
      { status: 500 }
    );
  }

  if (password !== expected) {
    const url = new URL("/unlock", req.url);
    url.searchParams.set("error", "1");
    return NextResponse.redirect(url, 302);
  }

  const res = NextResponse.redirect(new URL(from, req.url), 302);

  res.cookies.set(COOKIE_NAME, "ok", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}