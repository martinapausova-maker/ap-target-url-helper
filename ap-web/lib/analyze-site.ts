import { load } from "cheerio";
import { EVENT_KEYWORDS } from "./event-keywords";
import type { SiteSignals } from "./types";
import { getEmbedding } from "./embeddings";
import { detectSiteType } from "./cn-rules";

const SPECIFIC = ["NFL", "NBA", "MLB", "NHL", "Golf", "Soccer"];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+/]+/g)
    .filter((t) => t.length >= 3)
    .slice(0, 4000);
}

function uniq(arr: string[]): string[] {
  return [...new Set(arr)];
}

export async function analyzeSiteUrl(urlRaw: string): Promise<SiteSignals> {
  let url: URL;
  try {
    url = new URL(urlRaw.trim().startsWith("http") ? urlRaw.trim() : `https://${urlRaw.trim()}`);
  } catch {
    return {
      url: urlRaw,
      ok: false,
      error: "Invalid URL",
      tokens: [],
      detectedEvents: [],
      hasSpecificSportSignals: false,
    };
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 18_000);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; APHelper/1.0; +https://example.invalid)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      return {
        url: url.toString(),
        ok: false,
        error: `HTTP ${res.status}`,
        tokens: [],
        detectedEvents: [],
        hasSpecificSportSignals: false,
      };
    }

    const html = await res.text();
    const $ = load(html);

    $("script, style, noscript, svg").remove();
    const navText = $("nav a, header a, [role='navigation'] a")
      .slice(0, 250)
      .map((_, el) => $(el).text())
      .get()
      .join(" ");
    const bodyText = $("body").text().slice(0, 14_000);
    const combined = `${navText}\n${bodyText}`;
    const tokens = uniq(tokenize(combined));

    const haystack = tokens.join(" ");
    const detected: string[] = [];

    for (const [event, kws] of Object.entries(EVENT_KEYWORDS)) {
      let hits = 0;
      for (const kw of kws) {
        const k = kw.toLowerCase();
        if (haystack.includes(k)) hits++;
      }
      if (hits >= 1) detected.push(event);
    }

    let specificCount = 0;
    for (const ev of SPECIFIC) {
      const kws = EVENT_KEYWORDS[ev];
      if (!kws) continue;
      let ok = false;
      for (const kw of kws) {
        if (haystack.includes(kw.toLowerCase())) {
          ok = true;
          break;
        }
      }
      if (ok) specificCount++;
    }

    const classification = detectSiteType(tokens);
    const embeddingText = combined.slice(0, 3000);
    const embedding = await getEmbedding(embeddingText);

    return {
      url: url.toString(),
      ok: true,
      tokens,
      detectedEvents: uniq(detected),
      hasSpecificSportSignals: specificCount >= 2,
      excerpt: combined.slice(0, 400).replace(/\s+/g, " ").trim(),
      embedding: embedding ?? undefined,
      siteType: classification.siteType,
      acceptsLoanTopics: classification.acceptsLoanTopics,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Fetch failed";
    return {
      url: url.toString(),
      ok: false,
      error: msg,
      tokens: [],
      detectedEvents: [],
      hasSpecificSportSignals: false,
    };
  } finally {
    clearTimeout(t);
  }
}
