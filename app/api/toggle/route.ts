import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUserId } from "@/lib/auth";

export async function POST() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const open = await sql`
    select id from records
    where user_id = ${uid} and check_out is null
    order by check_in desc limit 1
  `;

  if (open.length > 0) {
    await sql`update records set check_out = now() where id = ${open[0].id}`;
    return NextResponse.json({ checkedIn: false });
  }

  await sql`insert into records (user_id, check_in) values (${uid}, now())`;
  return NextResponse.json({ checkedIn: true });
}
