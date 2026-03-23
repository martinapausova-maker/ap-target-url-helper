import type { APRecord, SiteSignals, ScoredAP } from "./types";
import aprilPlan from "./april-plan.json";
import { EVENT_KEYWORDS, normalizeEventKey } from "./event-keywords";

const MAIN_FANDUEL_CLIENT = "FanDuel";

/** Tier 1: highest global priority for main FanDuel */
const TIER_1 = new Set(["NBA", "MLB", "NFL", "NHL", "PREDICTS"]);
const TIER_2 = new Set(["GOLF", "SOCCER", "Golf", "Soccer"]);

function eventTier(eventRaw: string): 1 | 2 | 3 {
  const e = normalizeEventKey(eventRaw);
  const upper = e.toUpperCase();
  if (upper === "PREDICTS" || TIER_1.has(upper)) return 1;
  if (TIER_2.has(e) || TIER_2.has(upper)) return 2;
  return 3;
}

function priorityBoost(priority: string): number {
  const p = priority.trim().toLowerCase();
  if (p === "highest") return 12;
  if (p === "high") return 8;
  if (p === "average") return 4;
  if (p === "low") return 0;
  return 2;
}

function planBoostForEvent(eventRaw: string): number {
  const upper = normalizeEventKey(eventRaw).toUpperCase();
  const plan = aprilPlan.plan as Record<string, number>;
  // Map CSV events to plan keys
  const keyMap: Record<string, keyof typeof plan | undefined> = {
    NFL: "NFL",
    MLB: "MLB",
    NBA: "NBA",
    NHL: "NHL",
    GOLF: "GOLF",
    Golf: "GOLF",
    SOCCER: "SOCCER",
    Soccer: "SOCCER",
    PREDICTS: "PREDICTS",
    Sports: "SBK",
    SBK: "SBK",
    NCAAB: "NCAAB",
    NCAAF: "NCAAF",
    Tennis: "TENNIS",
    "UFC/MMA": "MMA",
    MMA: "MMA",
    BOXING: "BOXING",
    MOTORSPORT: "MOTORSPORT",
    WNBA: "WNBA",
  };
  const k = keyMap[upper] ?? keyMap[eventRaw];
  if (!k) return 0;
  const v = plan[k];
  if (v === undefined || v <= 0) return 0;
  // Soft signal: larger monthly quota → slightly higher nudge
  return Math.min(20, Math.round(v / 10));
}

function tokenSet(tokens: string[]): Set<string> {
  return new Set(tokens.map((t) => t.toLowerCase()));
}

function countKeywordHits(
  tokenBag: Set<string>,
  haystack: string,
  keywords: string[],
): number {
  let hits = 0;
  const lower = haystack.toLowerCase();
  for (const kw of keywords) {
    const k = kw.toLowerCase();
    if (tokenBag.has(k) || lower.includes(k)) hits += 1;
  }
  return hits;
}

function isSportsbookHomepage(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const path = u.pathname.replace(/\/$/, "") || "/";
    if (host === "sportsbook.fanduel.com" && path === "/") return true;
    if (host === "www.fanduel.com" && path === "/predicts") return false;
    return false;
  } catch {
    return false;
  }
}

function isPredictsUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.hostname.toLowerCase().includes("fanduel.com") &&
      u.pathname.toLowerCase().includes("/predicts")
    );
  } catch {
    return false;
  }
}

/**
 * Score AP rows for a chosen client and optional site signals.
 */
export function scoreRecords(
  records: APRecord[],
  client: string,
  signals: SiteSignals | null,
  options?: { minResults?: number; pickedRecordIds?: Set<string> },
): ScoredAP[] {
  const minResults = options?.minResults ?? 4;
  const picked = options?.pickedRecordIds ?? new Set<string>();
  const tokenBag = signals?.tokens?.length
    ? tokenSet(signals.tokens)
    : new Set<string>();
  const haystack = (signals?.tokens ?? []).join(" ");
  const isMainFD = client === MAIN_FANDUEL_CLIENT;

  const scored: ScoredAP[] = [];

  for (const record of records) {
    if (record.client !== client) continue;
    if (record.recordId && picked.has(record.recordId)) continue;
    if (record.status && record.status.toLowerCase() !== "available") continue;

    const reasons: string[] = [];
    const warnings: string[] = [];

    let score = 0;
    const ev = normalizeEventKey(record.event);
    const evUpper = ev.toUpperCase();

    // --- Relevance: keywords for this EVENT vs site ---
    const kwList =
      EVENT_KEYWORDS[ev] ??
      EVENT_KEYWORDS[evUpper] ??
      (evUpper === "PREDICTS" ? EVENT_KEYWORDS.PREDICTS : undefined) ??
      [];

    if (kwList.length && (tokenBag.size || haystack.length)) {
      const hits = countKeywordHits(tokenBag, haystack, kwList);
      score += hits * 15;
      if (hits > 0) reasons.push(`Site text matches ${ev} themes (${hits} signals)`);
    }

    // --- FanDuel main: tier + plan + row priority ---
    if (isMainFD) {
      const tier = eventTier(record.event);
      if (tier === 1) {
        score += 55;
        reasons.push("High-priority EVENT tier (NBA/MLB/NFL/NHL/PREDICTS)");
      } else if (tier === 2) {
        score += 30;
        reasons.push("Secondary priority EVENT (Golf/Soccer)");
      }

      score += priorityBoost(record.priority);
      if (record.priority)
        reasons.push(`Row Priority in sheet: ${record.priority}`);

      const pb = planBoostForEvent(record.event);
      score += pb;
      if (pb > 0) reasons.push(`Apr Plan quota nudge (${evUpper})`);

      // PREDICTS: boost if site mentions prediction markets; penalize mismatch
      if (evUpper === "PREDICTS") {
        const pHits = countKeywordHits(
          tokenBag,
          haystack,
          EVENT_KEYWORDS.PREDICTS,
        );
        if (pHits === 0 && signals?.ok) {
          score -= 40;
          warnings.push(
            "PREDICTS AP: site shows little prediction-market language — use only if topic fits.",
          );
        }
      }

      // Homepage trap
      if (signals?.hasSpecificSportSignals && isSportsbookHomepage(record.targetUrl)) {
        score -= 70;
        warnings.push(
          "Homepage sportsbook URL: site looks sport-specific — prefer a sport navigation URL if possible.",
        );
      }

      if (isSportsbookHomepage(record.targetUrl) && !signals?.hasSpecificSportSignals) {
        score += 10;
        reasons.push("Generic / betting-heavy site → homepage SBK can be appropriate.");
      }

      if (evUpper === "SPORTS" && isSportsbookHomepage(record.targetUrl)) {
        score += 8;
        reasons.push("Sports + homepage target → aligns with SBK-style usage.");
      }
    } else {
      // Non-main clients: light keyword match on anchor + URL path
      const anchor = record.anchorText.toLowerCase();
      let aHits = 0;
      for (const t of tokenBag) {
        if (t.length > 3 && anchor.includes(t)) aHits++;
      }
      score += Math.min(40, aHits * 8);
      if (aHits) reasons.push("Anchor text overlaps with site vocabulary");
    }

    // CreditNinja: warn money page on non-loan vocabulary (very soft heuristic)
    if (client === "CreditNinja") {
      try {
        const path = new URL(record.targetUrl).pathname.toLowerCase();
        const isLikelyMoney =
          /\/(personal-loans|bad-credit|payday|installment|cash-advance)/.test(
            path,
          ) || path === "/" || path === "";
        if (isLikelyMoney && haystack.length > 0) {
          const biz = ["business", "b2b", "startup", "enterprise"].some((w) =>
            haystack.includes(w),
          );
          if (biz) {
            warnings.push(
              "Possible business-site mismatch: consider a /blog or support URL per CN guidelines.",
            );
            score -= 25;
          }
        }
      } catch {
        /* ignore */
      }
    }

    // Predicts URL alignment
    if (isMainFD && evUpper === "PREDICTS" && !isPredictsUrl(record.targetUrl)) {
      warnings.push("EVENT is PREDICTS but target is not a /predicts URL — double-check.");
    }

    scored.push({ record, score, reasons, warnings });
  }

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, Math.max(minResults, 8));
}
