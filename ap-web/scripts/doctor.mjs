#!/usr/bin/env node
/**
 * Run: npm run doctor
 * Checks Node version and reminds about env vars (no network).
 */

const wantMajor = 20;

const v = process.version; // v22.x
const major = Number.parseInt(v.slice(1).split(".")[0], 10);

console.log("AP Helper — environment check\n");
console.log(`Node:  ${v}  (recommended: ${wantMajor}+)`);
if (Number.isFinite(major) && major < wantMajor) {
  console.warn(
    `\n⚠️  Node ${wantMajor}+ is recommended for Next.js 15. Install LTS from https://nodejs.org\n`,
  );
} else {
  console.log("✓ Node version OK\n");
}

const fs = await import("node:fs");
const path = await import("node:path");
const { fileURLToPath } = await import("node:url");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, "utf8");
  const hasPicks = /^APPS_SCRIPT_PICKS_URL=\s*\S+/m.test(raw);
  console.log(".env.local: found");
  console.log(
    hasPicks
      ? "  APPS_SCRIPT_PICKS_URL: set"
      : "  APPS_SCRIPT_PICKS_URL: not set (picks = this browser only)",
  );
} else {
  console.log(".env.local: not found");
  console.log(
    "  Copy .env.local.example → .env.local and add APPS_SCRIPT_PICKS_URL when Sheet is ready.",
  );
}

console.log("\nNext: npm run dev  →  http://localhost:3000");
console.log("Docs: ap-web/docs/SETUP_GOOGLE_SHEET.md\n");
