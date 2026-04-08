# SeaTable Integration Guide

## Overview

Starting with v0.3.0, the app can optionally fetch AP records directly from **SeaTable** instead of manually uploading an Excel file each month. This is useful for keeping the app in sync with your SeaTable base without exporting `.xlsx` files.

## Setup (Optional)

1. **Get your SeaTable Base URL and API Token**  
   - In SeaTable, navigate to your base → **Advanced** → **API Token** (or use your account-level token).
   - Your base URL will look like: `https://cloud.seatable.io` (or your self-hosted URL).

2. **Configure environment variables**  
   Add these to `ap-web/.env.local`:

   ```bash
   SEATABLE_BASE_URL=https://cloud.seatable.io
   SEATABLE_API_TOKEN=your-base-api-token
   SEATABLE_TABLE_NAME=AP
   ```

3. **Test the integration**  
   Start the dev server:
   ```bash
   npm run dev
   ```

   Then visit:
   ```
   http://localhost:3000/api/seatable
   ```

   You should see JSON with your AP records (if the credentials are correct).

## Using SeaTable Sync in the UI

(Future enhancement) — The UI will include a **"Sync from SeaTable"** button alongside the Excel upload. This will:

1. Fetch records from `/api/seatable` (via the API token you configured).
2. Optionally generate embeddings for each record (if `OPENAI_API_KEY` is set).
3. Store them in `localStorage` just like the uploaded Excel.

For now, you can still upload an Excel file as before. SeaTable sync is **optional** for the MVP pilot.

## Notes

- **Permissions**: The API token must have read access to the AP table.
- **Column names**: The code expects columns named: `Client`, `Month`, `AP Status`, `Event`, `Category`, `Priority`, `Anchor Text`, `Target URL`, `AP ID`, `Notes`. If your columns differ, adjust the mapping in `app/api/seatable/route.ts`.
- **Security**: Keep your `.env.local` file **out of Git**. It is already in `.gitignore`.
