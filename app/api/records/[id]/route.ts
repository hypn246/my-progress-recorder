import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { parseDate } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const id = Number((await params).id);

  const body = await req.json().catch(() => null);
  const checkIn = parseDate(body?.check_in);
  const running = !body?.check_out;
  const checkOut = running ? null : parseDate(body?.check_out);

  if (!checkIn || (!running && !checkOut)) {
    return NextResponse.json({ error: "Dates are not valid" }, { status: 400 });
  }
  if (checkOut && checkOut <= checkIn) {
    return NextResponse.json({ error: "Check-out must be after check-in" }, { status: 400 });
  }
  if (running) {
    const other = await sql`
      select id from records
      where user_id = ${uid} and check_out is null and id <> ${id}
    `;
    if (other.length > 0) {
      return NextResponse.json({ error: "Another record is still running" }, { status: 400 });
    }
  }

  await sql`
    update records
    set check_in = ${checkIn.toISOString()}, check_out = ${checkOut ? checkOut.toISOString() : null}
    where id = ${id} and user_id = ${uid}
  `;
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Params) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const id = Number((await params).id);

  await sql`delete from records where id = ${id} and user_id = ${uid}`;
  return NextResponse.json({ ok: true });
}
