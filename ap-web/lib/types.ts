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
  embedding?: number[];
};

export type SiteSignals = {
  url: string;
  ok: boolean;
  error?: string;
  tokens: string[];
  detectedEvents: string[];
  hasSpecificSportSignals: boolean;
  excerpt?: string;
  embedding?: number[];
  siteType?: "business" | "finance" | "news" | "law" | "generic";
  acceptsLoanTopics?: boolean;
};

export type ScoredAP = {
  record: APRecord;
  score: number;
  reasons: string[];
  warnings: string[];
};
