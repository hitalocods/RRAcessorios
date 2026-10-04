// Aplica src/lib/schema.sql no banco. Uso: node --env-file=.env.local scripts/migrate.mjs
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const statements = readFileSync(new URL("../src/lib/schema.sql", import.meta.url), "utf8")
  .split(/;\s*$/m)
  .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
}

console.log(`OK: ${statements.length} comandos aplicados`);
