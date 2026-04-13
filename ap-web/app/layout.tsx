import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AP Helper — Anchor & target matcher",
  description: "Match SeaTable AP rows to publisher sites (Searchtides internal)",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // #region agent log
  console.log("[LAYOUT-N] RootLayout rendered (server)", { ts: Date.now(), vercel: process.env.VERCEL });
  // #endregion
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
