import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
const username = process.env.SEED_USERNAME || "me";
const password = process.env.SEED_PASSWORD;

if (!url) {
  console.error("DATABASE_URL is missing. Put it in .env.local");
  process.exit(1);
}
if (!password) {
  console.error("SEED_PASSWORD is missing. Put it in .env.local");
  process.exit(1);
}

const sql = neon(url);

const statements = readFileSync("db/schema.sql", "utf8")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
}
console.log("Tables are ready.");

await sql.query(
  `insert into users (username, password) values ($1, $2)
   on conflict (username) do update set password = excluded.password`,
  [username, password]
);
console.log(`Account "${username}" is ready.`);
