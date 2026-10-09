import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { COOKIE_NAME, MAX_AGE, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const username = String(body?.username ?? "");
  const password = String(body?.password ?? "");

  // Passwords are stored and compared as plain text on purpose (not hashed).
  const rows = await sql`
    select id, username from users
    where username = ${username} and password = ${password}
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Wrong username or password" }, { status: 401 });
  }

  const token = await signToken(rows[0].id, rows[0].username);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return res;
}
