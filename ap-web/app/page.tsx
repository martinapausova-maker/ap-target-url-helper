"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { parseAPWorkbook, uniqueClients } from "@/lib/parseXlsx";
import { scoreRecords } from "@/lib/match";
import type { APRecord, ScoredAP, SiteSignals } from "@/lib/types";
import {
  addLocalPick,
  clearBundle,
  clearLocalPicks,
  loadBundle,
  loadLocalPicks,
  saveBundle,
} from "@/lib/storage";
import { PlacementChecklist } from "@/components/PlacementChecklist";

type HealthPayload = {
  version?: string;
  picks?: { configured?: boolean; hint?: string };
  node?: string;
};

export default function HomePage() {
  const [records, setRecords] = useState<APRecord[]>([]);
  const [uploadedAt, setUploadedAt] = useState<string | null>(null);
  const [clients, setClients] = useState<string[]>([]);
  const [client, setClient] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [skipFetch, setSkipFetch] = useState(false);
  const [signals, setSignals] = useState<SiteSignals | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [picks, setPicks] = useState<Set<string>>(new Set());
  const [sheetConfigured, setSheetConfigured] = useState<boolean | null>(null);
  const [results, setResults] = useState<ScoredAP[]>([]);
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const refreshPicks = useCallback(async () => {
    const res = await fetch("/api/picks", { cache: "no-store" });
    const data = (await res.json()) as {
      recordIds?: string[];
      configured?: boolean;
    };
    setSheetConfigured(data.configured ?? false);
    const remote = Array.isArray(data.recordIds) ? data.recordIds : [];
    const local = loadLocalPicks();
    setPicks(new Set([...remote, ...local]));
  }, []);

  useEffect(() => {
    const b = loadBundle();
    if (b?.records?.length) {
      setRecords(b.records);
      setUploadedAt(b.uploadedAt);
      setClients(uniqueClients(b.records));
    }
    void refreshPicks();
  }, [refreshPicks]);

  useEffect(() => {
    void fetch("/api/health", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setHealth(d as HealthPayload))
      .catch(() => setHealth(null));
  }, []);

  const onFile = async (file: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const parsed = await parseAPWorkbook(buf, true);
      const bundle = { uploadedAt: new Date().toISOString(), records: parsed };
      saveBundle(bundle);
      setRecords(parsed);
      setUploadedAt(bundle.uploadedAt);
      setClients(uniqueClients(parsed));
      setClient("");
      setResults([]);
      setSignals(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to parse file");
    } finally {
      setBusy(false);
    }
  };

  const runAnalyze = async () => {
    if (!client) {
      alert("Select a client (exact CLIENT column value).");
      return;
    }
    setBusy(true);
    setAnalyzeError(null);
    try {
      let sig: SiteSignals | null = null;
      if (!skipFetch && siteUrl.trim()) {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: siteUrl.trim() }),
        });
        sig = (await res.json()) as SiteSignals;
        if (!sig.ok) {
          setAnalyzeError(sig.error ?? "Could not fetch site");
        }
      } else {
        sig = {
          url: siteUrl.trim(),
          ok: false,
          tokens: [],
          detectedEvents: [],
          hasSpecificSportSignals: false,
          error: skipFetch ? "Skipped fetch (manual scoring)" : undefined,
        };
      }
      setSignals(sig);

      const scored = scoreRecords(records, client, sig?.ok ? sig : null, {
        minResults: 6,
        pickedRecordIds: picks,
      });
      setResults(scored);
      await refreshPicks();
    } finally {
      setBusy(false);
    }
  };

  const pickCount = useMemo(() => {
    return records.filter((r) => r.recordId && picks.has(r.recordId)).length;
  }, [records, picks]);

  const onPick = async (recordId: string) => {
    if (!recordId) {
      alert("This row has no Record ID — cannot sync pick.");
      return;
    }
    addLocalPick(recordId);
    await fetch("/api/picks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recordId, siteUrl: siteUrl.trim(), om: "" }),
    });
    const res = await fetch("/api/picks", { cache: "no-store" });
    const data = (await res.json()) as { recordIds?: string[] };
    const remote = Array.isArray(data.recordIds) ? data.recordIds : [];
    const local = loadLocalPicks();
    const nextPicks = new Set([...remote, ...local]);
    setPicks(nextPicks);
    const scored = scoreRecords(records, client, signals?.ok ? signals : null, {
      minResults: 6,
      pickedRecordIds: nextPicks,
    });
    setResults(scored);
  };

  const copyLine = (s: ScoredAP, index: number) => {
    const text = `${s.record.anchorText}\n${s.record.targetUrl}\nRecord ID: ${s.record.recordId}`;
    void navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    window.setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          AP Helper
        </h1>
        <p className="mt-2 text-slate-400">
          Upload monthly AP export (XLSX), choose the exact{" "}
          <span className="text-slate-200">CLIENT</span> value, paste the
          publisher URL, get ranked options. Picks sync to Google Sheet when{" "}
          <code className="rounded bg-slate-800 px-1">APPS_SCRIPT_PICKS_URL</code>{" "}
          is set; otherwise they stay in this browser only.
        </p>
        {health?.version && (
          <p className="mt-3 text-xs text-slate-500">
            App v{health.version}
            {health.node ? ` · ${health.node}` : ""} ·{" "}
            <a
              className="text-indigo-400 hover:underline"
              href="/api/health"
              target="_blank"
              rel="noreferrer"
            >
              /api/health
            </a>
          </p>
        )}
      </header>

      <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
        <h2 className="text-lg font-medium text-white">1. Monthly file</h2>
        <p className="mt-1 text-sm text-slate-400">
          Use the same export you put in SeaTable (e.g. Apr 2026). Data stays in
          your browser until you replace it.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
            Upload XLSX
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              disabled={busy}
              onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {uploadedAt && (
            <span className="text-sm text-slate-400">
              Loaded {records.length} rows ·{" "}
              {new Date(uploadedAt).toLocaleString()}
            </span>
          )}
          {records.length > 0 && (
            <button
              type="button"
              className="text-sm text-rose-400 hover:underline"
              onClick={() => {
                clearBundle();
                setRecords([]);
                setClients([]);
                setClient("");
                setResults([]);
                setUploadedAt(null);
              }}
            >
              Clear file
            </button>
          )}
        </div>
      </section>

      <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
        <h2 className="text-lg font-medium text-white">2. Client & site</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-slate-400">CLIENT (from sheet)</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              disabled={!clients.length}
            >
              <option value="">— select —</option>
              {clients.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-400">Publisher URL</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              placeholder="https://example.com/article"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
            />
          </div>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={skipFetch}
            onChange={(e) => setSkipFetch(e.target.checked)}
          />
          Skip fetching site (use sheet priorities only — if site blocks bots)
        </label>
        <button
          type="button"
          disabled={busy || !client}
          onClick={() => void runAnalyze()}
          className="mt-4 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-40"
        >
          {busy ? "Working…" : "Get recommendations"}
        </button>
        {analyzeError && (
          <p className="mt-2 text-sm text-amber-300">{analyzeError}</p>
        )}
      </section>

      <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-medium text-white">Picks (occupied)</h2>
          <div className="text-sm text-slate-400">
            {sheetConfigured === false && (
              <span className="text-amber-300">
                Sheet URL not configured — local browser only.{" "}
              </span>
            )}
            {sheetConfigured === true && (
              <span className="text-emerald-300">Sheet sync enabled. </span>
            )}
            Marked in this dataset: {pickCount} / {records.length}
          </div>
        </div>
        <button
          type="button"
          className="mt-2 text-sm text-slate-400 hover:text-white"
          onClick={() => {
            if (confirm("Clear local picks in this browser?")) {
              clearLocalPicks();
              void refreshPicks();
            }
          }}
        >
          Clear local picks (this browser)
        </button>
      </section>

      <section className="mb-8">
        <PlacementChecklist />
      </section>

      {signals && (
        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-lg font-medium text-white">Site signals</h2>
          <p className="mt-1 text-sm text-slate-400">
            {signals.ok
              ? "Fetched publisher page (best-effort)."
              : "No live signals — scoring uses sheet rules only."}
          </p>
          {signals.detectedEvents?.length > 0 && (
            <p className="mt-2 text-sm text-slate-300">
              Detected topics:{" "}
              <span className="text-white">
                {signals.detectedEvents.join(", ")}
              </span>
            </p>
          )}
          {signals.hasSpecificSportSignals && (
            <p className="mt-1 text-sm text-amber-200">
              Looks like multiple specific sports on site → avoid defaulting to
              FanDuel homepage if a sport URL fits.
            </p>
          )}
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-white">Recommendations</h2>
        {results.length === 0 && (
          <p className="text-slate-500">
            Upload a file, select CLIENT, then run recommendations.
          </p>
        )}
        {results.map((s, i) => (
          <article
            key={`${s.record.recordId}-${i}`}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  #{i + 1} · score {Math.round(s.score)}
                </p>
                <p className="mt-1 text-lg font-medium text-white">
                  {s.record.anchorText}
                </p>
                <a
                  href={s.record.targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-sm text-indigo-300 hover:underline"
                >
                  {s.record.targetUrl}
                </a>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                  {s.record.event && (
                    <span className="rounded bg-slate-800 px-2 py-0.5">
                      Event: {s.record.event}
                    </span>
                  )}
                  {s.record.priority && (
                    <span className="rounded bg-slate-800 px-2 py-0.5">
                      Priority: {s.record.priority}
                    </span>
                  )}
                  {s.record.recordId && (
                    <span className="rounded bg-slate-800 px-2 py-0.5 font-mono">
                      {s.record.recordId}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <button
                  type="button"
                  onClick={() => copyLine(s, i)}
                  className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
                >
                  {copiedIndex === i ? "Copied!" : "Copy details"}
                </button>
                <button
                  type="button"
                  onClick={() => void onPick(s.record.recordId)}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
                >
                  I used this AP
                </button>
              </div>
            </div>
            {s.reasons.length > 0 && (
              <ul className="mt-3 list-inside list-disc text-sm text-slate-400">
                {s.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
            {s.warnings.length > 0 && (
              <ul className="mt-2 list-inside list-disc text-sm text-amber-200">
                {s.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </section>

      <footer className="mt-16 border-t border-slate-800 pt-8 text-center text-xs text-slate-600">
        Internal tool — always verify target page content and SeaTable before
        publishing. Docs:{" "}
        <code className="text-slate-500">ap-web/README.md</code>,{" "}
        <code className="text-slate-500">
          ap-web/docs/SETUP_GOOGLE_SHEET.md
        </code>
        .
      </footer>
    </main>
  );
}
