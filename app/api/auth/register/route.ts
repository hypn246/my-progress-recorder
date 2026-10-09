// The create-account handler is switched off on purpose.
// To use it: uncomment the code below, then call
//   POST /api/auth/register   { "username": "...", "password": "..." }
// The middleware only lets logged-in users reach this route.
// To allow public sign-up, add "/api/auth/register" to publicPaths in middleware.ts.

// import { NextResponse } from "next/server";
// import { sql } from "@/lib/db";
//
// export async function POST(req: Request) {
//   const body = await req.json().catch(() => null);
//   const username = String(body?.username ?? "").trim();
//   const password = String(body?.password ?? "");
//
//   if (username.length < 2 || password.length < 4) {
//     return NextResponse.json({ error: "Username or password is too short" }, { status: 400 });
//   }
//
//   const exists = await sql`select id from users where username = ${username}`;
//   if (exists.length > 0) {
//     return NextResponse.json({ error: "Username already taken" }, { status: 409 });
//   }
//
//   await sql`insert into users (username, password) values (${username}, ${password})`;
//   return NextResponse.json({ ok: true });
// }

export {};
