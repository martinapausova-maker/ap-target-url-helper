import { NextResponse } from "next/server";
import { analyzeSiteUrl } from "@/lib/analyze-site";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { url?: string };
    const url = body.url?.trim();
    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }
    const signals = await analyzeSiteUrl(url);
    return NextResponse.json(signals);
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
