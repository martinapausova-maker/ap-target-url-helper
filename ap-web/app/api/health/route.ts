import { NextResponse } from "next/server";
import { APP_VERSION } from "@/lib/version";

export const runtime = "nodejs";

/**
 * Quick status for admins / debugging. Safe to expose (no secrets).
 */
export async function GET() {
  const picksUrl = Boolean(process.env.APPS_SCRIPT_PICKS_URL?.trim());
  return NextResponse.json({
    ok: true,
    app: "ap-helper",
    version: APP_VERSION,
    picks: {
      configured: picksUrl,
      hint: picksUrl
        ? "APPS_SCRIPT_PICKS_URL is set"
        : "Set APPS_SCRIPT_PICKS_URL in .env.local for shared picks (see docs/SETUP_GOOGLE_SHEET.md)",
    },
    node: process.version,
  });
}
