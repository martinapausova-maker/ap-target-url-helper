/**
 * Map canonical EVENT values (as in SeaTable / XLSX) to site-text keywords.
 * Used to score overlap between publisher site and AP row.
 */
export const EVENT_KEYWORDS: Record<string, string[]> = {
  NFL: ["nfl", "football", "super bowl", "touchdown", "quarterback", "afc", "nfc"],
  NBA: ["nba", "basketball", "lakers", "celtics", "playoffs"],
  MLB: ["mlb", "baseball", "world series", "pitcher", "yankees", "dodgers"],
  NHL: ["nhl", "hockey", "stanley cup", "puck"],
  NCAAB: ["ncaab", "march madness", "college basketball", "ncaa basketball"],
  NCAAF: ["ncaaf", "college football", "ncaa football", "heisman"],
  Golf: ["golf", "pga", "masters", "ryder cup", "us open", "open championship"],
  Soccer: ["soccer", "premier league", "champions league", "mls", "epl", "la liga"],
  Tennis: ["tennis", "wimbledon", "us open tennis", "australian open", "french open"],
  "UFC/MMA": ["ufc", "mma", "mixed martial arts", "octagon"],
  MMA: ["ufc", "mma", "mixed martial arts"],
  BOXING: ["boxing", "heavyweight", "welterweight"],
  MOTORSPORT: ["nascar", "f1", "formula 1", "indy", "motorsport", "daytona"],
  PREDICTS: [
    "predicts",
    "prediction market",
    "prediction markets",
    "kalshi",
    "polymarket",
    "crypto prediction",
  ],
  /** Generic sportsbook / multi-sport */
  Sports: [
    "sports betting",
    "sportsbook",
    "betting odds",
    "odds",
    "parlay",
    "spread",
    "moneyline",
  ],
  SBK: ["sports betting", "sportsbook", "betting odds", "odds", "parlay"],
};

export function normalizeEventKey(event: string): string {
  return event.trim();
}
