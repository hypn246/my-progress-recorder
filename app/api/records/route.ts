import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { parseDate } from "@/lib/utils";

export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const rows = await sql`
    select id, check_in, check_out from records
    where user_id = ${uid} order by check_in desc
  `;
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const checkIn = parseDate(body?.check_in);
  const checkOut = parseDate(body?.check_out);

  if (!checkIn || !checkOut) {
    return NextResponse.json({ error: "Check-in and check-out are required" }, { status: 400 });
  }
  if (checkOut <= checkIn) {
    return NextResponse.json({ error: "Check-out must be after check-in" }, { status: 400 });
  }

  await sql`
    insert into records (user_id, check_in, check_out)
    values (${uid}, ${checkIn.toISOString()}, ${checkOut.toISOString()})
  `;
  return NextResponse.json({ ok: true });
}
