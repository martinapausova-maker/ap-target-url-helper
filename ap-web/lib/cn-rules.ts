const BUSINESS_KW = [
  "b2b",
  "enterprise",
  "startup",
  "business loan",
  "business finance",
  "entrepreneur",
  "small business",
  "corporation",
];

const LOAN_KW = [
  "personal loan",
  "payday loan",
  "installment loan",
  "bad credit loan",
  "borrow money",
  "quick cash",
  "emergency loan",
  "credit score",
  "lending",
];

const FINANCE_KW = [
  "finance",
  "banking",
  "mortgage",
  "refinance",
  "debt",
  "savings",
  "investment",
  "financial planning",
];

export function detectSiteType(tokens: string[]): {
  siteType: "business" | "finance" | "law" | "generic";
  acceptsLoanTopics: boolean;
} {
  const haystack = tokens.join(" ").toLowerCase();

  const bizHits = BUSINESS_KW.filter((kw) => haystack.includes(kw)).length;
  const loanHits = LOAN_KW.filter((kw) => haystack.includes(kw)).length;
  const finHits = FINANCE_KW.filter((kw) => haystack.includes(kw)).length;

  if (haystack.includes("law firm") || haystack.includes("attorney") || haystack.includes("legal")) {
    return { siteType: "law", acceptsLoanTopics: false };
  }

  if (bizHits >= 3 && loanHits === 0) {
    return { siteType: "business", acceptsLoanTopics: false };
  }

  if (finHits >= 2 || loanHits >= 2) {
    return { siteType: "finance", acceptsLoanTopics: true };
  }

  if (loanHits >= 1) {
    return { siteType: "generic", acceptsLoanTopics: true };
  }

  return { siteType: "generic", acceptsLoanTopics: false };
}

export function isMoneyPageUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return (
      /\/(personal-loans|bad-credit|payday|installment|cash-advance|quick-cash)/.test(
        path,
      ) ||
      path === "/" ||
      path === ""
    );
  } catch {
    return false;
  }
}

export function isSupportPageUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return /\/(blog|finance|support|learn|articles|resources)/.test(path);
  } catch {
    return false;
  }
}
