import { readFileSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { hashSync } from "bcryptjs";

loadDotEnv();

const [, , emailArg, passwordArg] = process.argv;
const email = normalizeEmail(emailArg ?? process.env.ADMIN_EMAIL ?? "");
const password = passwordArg ?? process.env.ADMIN_PASSWORD ?? "";

if (!email || !password) {
  console.error("Usage: npm run admin:create -- admin@konturagent.ru 'StrongPassword123'");
  process.exit(1);
}

if (/\s/.test(email) || /\s/.test(password) || password.length < 12 || !/\d/.test(password) || !/[A-Za-zА-Яа-я]/.test(password)) {
  console.error("Admin email/password are invalid. Password must be 12+ chars, include a letter and a digit, and contain no spaces.");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not configured.");
  process.exit(1);
}

const client = new Client({ connectionString: stripPrismaParams(process.env.DATABASE_URL) });
await client.connect();
await client.query(
  `
    INSERT INTO "User" ("id", "email", "passwordHash", "name", "role", "createdAt")
    VALUES ($1, $2, $3, $4, 'admin', NOW())
    ON CONFLICT ("email")
    DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash", "role" = 'admin', "name" = EXCLUDED."name"
  `,
  [`admin-${randomUUID()}`, email, hashSync(password, 12), "Администратор"],
);
await client.end();

console.log(`Admin account is ready: ${email}`);

function normalizeEmail(value) {
  return String(value).trim().toLowerCase();
}

function stripPrismaParams(value) {
  return value.replace(/\?.*$/, "");
}

function loadDotEnv() {
  if (!existsSync(".env")) return;
  const lines = readFileSync(".env", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}
