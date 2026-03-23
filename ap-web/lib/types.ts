export type APRecord = {
  recordId: string;
  client: string;
  month: string;
  status: string;
  event: string;
  category: string;
  priority: string;
  anchorText: string;
  targetUrl: string;
  apIdLabel: string;
  notes: string;
};

export type SiteSignals = {
  url: string;
  ok: boolean;
  error?: string;
  /** Normalized tokens from nav + visible text (lowercase) */
  tokens: string[];
  /** Sports / topics inferred from keywords */
  detectedEvents: string[];
  /** Heuristic: site has clear multi-sport or specific sport sections */
  hasSpecificSportSignals: boolean;
  /** Short excerpt for debugging / transparency */
  excerpt?: string;
};

export type ScoredAP = {
  record: APRecord;
  score: number;
  reasons: string[];
  warnings: string[];
};
