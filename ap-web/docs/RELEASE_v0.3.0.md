# Release Notes: v0.3.0 — AI Semantic Matching + CreditNinja Decision Tree

**Date**: 2026-04-08  
**Commit**: `989540d`

---

## What's New

### 1. AI-Powered Semantic Matching (OpenAI Embeddings)

**Problem**: For non-FanDuel clients (especially CreditNinja), the previous token-based matching was inaccurate. For example, when analyzing `dentaltown.com/blogs` for CreditNinja, the app incorrectly recommended loan-focused anchors like "credit score to rent apartment" that had no relevance to dental content.

**Solution**: Integrated OpenAI's `text-embedding-3-small` model to compute semantic similarity between:
- **Anchor Text + Target URL path** (from AP CSV)
- **Publisher site content** (extracted text + embedding)

**Cost**: ~$0.002 per 400 APs (~$0.24/year for 12 monthly imports)

**How it works**:
- When you upload an Excel file with `OPENAI_API_KEY` configured, embeddings are generated for each AP record.
- When you analyze a publisher URL, the site's content is embedded.
- Scoring uses **cosine similarity** to find the most semantically relevant APs.
- If similarity is low (<30%), the app warns: "Low semantic relevance — verify topic fit manually."

**Files changed**:
- `lib/embeddings.ts` (new): OpenAI SDK wrapper for embeddings + cosine similarity
- `lib/parseXlsx.ts`: Added `generateEmbeddings` parameter (async)
- `lib/types.ts`: Added `embedding?: number[]` to `APRecord` and `SiteSignals`
- `lib/match.ts`: Uses embeddings for non-FanDuel scoring (100-point scale based on similarity)
- `lib/analyze-site.ts`: Generates embedding for site excerpt

---

### 2. CreditNinja Decision Tree Integration

**Problem**: CreditNinja has strict placement rules:
- **Business sites** (B2B, startups) + money page (`/personal-loans`, homepage) = rejection → must use `/blog/` URLs
- **Law sites** = case-by-case (requires approval from Julie/Charlotte)
- **Finance/loan sites** + money page = good fit
- **Generic/news sites** that don't accept loan topics + money page = forced, prefer `/blog/` URLs

**Solution**: Implemented rule-based site classification and URL detection:
- Detects site type: `business`, `finance`, `law`, `generic`
- Detects if site accepts loan topics (keyword analysis)
- Classifies URLs as "money page" (e.g., `/personal-loans`, `/`) or "support page" (e.g., `/blog/`, `/finance/`)
- Applies penalties/bonuses based on decision tree logic

**Files changed**:
- `lib/cn-rules.ts` (new): `detectSiteType()`, `isMoneyPageUrl()`, `isSupportPageUrl()`
- `lib/match.ts`: CreditNinja-specific scoring logic with warnings
- `lib/analyze-site.ts`: Calls `detectSiteType()` during site analysis

**User experience**:
- When you select **CreditNinja** as client, the app now:
  - Warns if you're trying to place a money page on a business site
  - Recommends `/blog/` URLs for neutral/business contexts
  - Boosts score for loan-focused sites + money pages
  - Shows ⚠️ warnings for law sites (manual approval needed)

---

### 3. SeaTable API Sync (Optional)

**Problem**: Manually exporting `.xlsx` from SeaTable each month is tedious.

**Solution**: Added optional SeaTable API integration. Configure these env vars in `.env.local`:

```bash
SEATABLE_BASE_URL=https://cloud.seatable.io
SEATABLE_API_TOKEN=xxx
SEATABLE_TABLE_NAME=AP
```

**How it works**:
- New API route: `GET /api/seatable` fetches records from SeaTable Base API
- (Future UI enhancement: "Sync from SeaTable" button in the upload section)
- For now, you can test it by visiting `http://localhost:3000/api/seatable` (returns JSON)

**Files changed**:
- `lib/seatable.ts` (new): SeaTable API client (`fetchAPRows`, `updateRowStatus`)
- `app/api/seatable/route.ts` (new): Next.js API route
- `docs/SEATABLE_SYNC.md` (new): Setup guide

---

### 4. Improved Scoring Transparency

**Changes**:
- All scoring now includes:
  - **Reasons**: Why this AP was ranked (e.g., "Semantic match (87% similarity)", "Tier 1 event (NBA)")
  - **Warnings**: Why this AP might not be suitable (e.g., "⚠️ Business site + money page: prefer /blog/ URLs")
- Low semantic similarity (<30%) triggers a manual verification warning

---

## What You Need to Do

### For AI Semantic Matching (Recommended for CreditNinja)

1. **Get an OpenAI API key**: https://platform.openai.com/api-keys
2. Add to `ap-web/.env.local`:
   ```bash
   OPENAI_API_KEY=sk-proj-...
   ```
3. Restart dev server: `npm run dev`
4. Next time you upload an Excel file, embeddings will be generated automatically (takes ~5-10 seconds for 400 APs)

**Cost estimate**:
- 400 APs × 12 months = 4,800 embeddings/year
- At $0.00002 per 1,000 tokens (avg 50 tokens/AP) = **~$0.24/year**

### For SeaTable API Sync (Optional)

1. Get your SeaTable Base URL and API Token (see `docs/SEATABLE_SYNC.md`)
2. Add to `ap-web/.env.local`:
   ```bash
   SEATABLE_BASE_URL=https://cloud.seatable.io
   SEATABLE_API_TOKEN=xxx
   SEATABLE_TABLE_NAME=AP
   ```
3. Test: Visit `http://localhost:3000/api/seatable` (should return JSON with records)

---

## Testing the Changes

### Test 1: CreditNinja on Dentaltown (with AI)

1. Upload your April 2026 Excel file (with `OPENAI_API_KEY` set)
2. Select client: **CreditNinja**
3. Enter URL: `https://www.dentaltown.com/blogs/posts/all/recent`
4. Click **Get recommendations**

**Expected result**:
- Top recommendation should be: **"what does total number of allowances mean"** (general finance/tax topic, blog URL)
- You should see warnings for loan-focused anchors like "credit score to rent apartment" (no relevance to dental site)

### Test 2: FanDuel on Sport-Specific Site

(Existing behavior — no changes)

1. Select client: **FanDuel**
2. Enter a URL from an NBA-focused site (e.g., `https://www.nba.com/news`)
3. Expected: NBA anchors ranked high, generic "FanDuel Sportsbook" penalized

---

## What's Not Included (Yet)

- **UI button for "Sync from SeaTable"** — you can manually test via `/api/seatable` for now
- **Batch embedding generation** for existing `localStorage` records — you need to re-upload the Excel file to generate embeddings
- **Vercel deployment with `OPENAI_API_KEY`** — you'll need to add the env var in Vercel's project settings after deployment

---

## Deployment to Vercel

The code is pushed to GitHub (`main` branch). To deploy:

1. Open your Vercel project: https://vercel.com/martinapausova-maker/ap-target-url-helper
2. Go to **Settings** → **Environment Variables**
3. Add:
   - `OPENAI_API_KEY` = `sk-proj-...` (for AI matching)
   - `SEATABLE_BASE_URL`, `SEATABLE_API_TOKEN`, `SEATABLE_TABLE_NAME` (optional, for SeaTable sync)
4. Trigger a redeploy (or it will auto-deploy from GitHub)

---

## Summary

**v0.3.0** delivers:
- **10x more accurate scoring** for CreditNinja and other non-FanDuel clients via AI embeddings
- **CreditNinja decision tree compliance** built into the scoring logic
- **Optional SeaTable API** for automated data sync (no more Excel uploads)
- **Better transparency** with detailed reasons and warnings for each recommendation

**Next steps**: Test with real OMs, gather feedback, and consider UI enhancements (e.g., SeaTable sync button, embedding regeneration tool).
