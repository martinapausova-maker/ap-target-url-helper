"use client";

/**
 * Reminders from SOP — not enforced by data, shown for OM discipline.
 */
export function PlacementChecklist() {
  return (
    <details className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">
      <summary className="cursor-pointer font-medium text-slate-200">
        Before you lock the link in content / SeaTable
      </summary>
      <ul className="mt-3 list-inside list-disc space-y-1.5 text-slate-400">
        <li>
          Open the <strong className="text-slate-300">target URL</strong> and
          confirm the page matches the article topic.
        </li>
        <li>
          Place the link in the <strong className="text-slate-300">body</strong>
          , not intro/conclusion (per team rules).
        </li>
        <li>
          <strong className="text-slate-300">One link per paragraph</strong>{" "}
          (no stacking).
        </li>
        <li>
          SEO anchors can be imperfect — still get blog-owner approval when
          needed.
        </li>
        <li>
          After choosing an AP here, update the{" "}
          <strong className="text-slate-300">SeaTable</strong> record as usual
          (this app is not the source of truth for delivery).
        </li>
      </ul>
    </details>
  );
}
