import { neon } from "@neondatabase/serverless";

let client: ReturnType<typeof neon> | null = null;

export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  if (!client) client = neon(process.env.DATABASE_URL!);
  return client(strings, ...values) as unknown as Promise<Record<string, any>[]>;
}
