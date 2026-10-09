import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUserId } from "@/lib/auth";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  await sql`
    insert into settings (user_id, start_date, target_date, target_hours)
    values (${uid}, current_date, current_date + 90, 100)
    on conflict (user_id) do nothing
  `;
  const rows = await sql`
    select start_date::text as start_date, target_date::text as target_date,
           target_hours::float8 as target_hours
    from settings where user_id = ${uid}
  `;
  return NextResponse.json(rows[0]);
}

export async function PUT(req: Request) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const start = String(body?.start_date ?? "");
  const target = String(body?.target_date ?? "");
  const hours = Number(body?.target_hours);

  if (!DATE.test(start) || !DATE.test(target)) {
    return NextResponse.json({ error: "Dates are not valid" }, { status: 400 });
  }
  if (target < start) {
    return NextResponse.json({ error: "Target day must be after the start day" }, { status: 400 });
  }
  if (!(hours > 0)) {
    return NextResponse.json({ error: "Target hours must be more than 0" }, { status: 400 });
  }

  await sql`
    insert into settings (user_id, start_date, target_date, target_hours)
    values (${uid}, ${start}, ${target}, ${hours})
    on conflict (user_id) do update
    set start_date = excluded.start_date,
        target_date = excluded.target_date,
        target_hours = excluded.target_hours
  `;
  return NextResponse.json({ ok: true });
}
