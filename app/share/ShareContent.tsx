"use client";

import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getTierConfig } from "../../lib/tiers";
import { translations, getLocaleFromBrowser, type Locale } from "../../lib/i18n";

const LABELS_EN = ["Technical", "Contribution", "Sustainability", "Market"];
const LABELS_JA = ["技術力", "貢献度", "継続力", "市場性"];
const KEYS = ["technical", "contribution", "sustainability", "market"] as const;

function decode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

type Props = {
  scores: number[];
  jobTitle?: string;
  salaryDisplay?: string;
  rank?: string;
  tier?: string;
  tierFeedback?: string;
};

export default function ShareContent({ scores, jobTitle, salaryDisplay, rank, tier, tierFeedback }: Props) {
  const [locale, setLocale] = useState<Locale>("ja");
  useEffect(() => setLocale(getLocaleFromBrowser()), []);

  const t = translations[locale];
  const labels = locale === "ja" ? LABELS_JA : LABELS_EN;
  const data = KEYS.map((key, i) => ({
    subject: labels[i],
    value: scores[i] ?? 70,
    fullMark: 100,
  }));

  const tierCfg = tier ? getTierConfig(tier) : null;
  const tierLabel = tierCfg ? (locale === "ja" ? tierCfg.labelJa : tierCfg.labelEn) : "";

  return (
    <main className="relative min-h-screen overflow-hidden font-sans text-zinc-100 animate-page-in bg-[#050505]">
      <div className="pointer-events-none fixed inset-0 bg-mesh bg-[#050505] modal-bg" aria-hidden />
      <div className="meteors-layer modal-bg" aria-hidden>
        {[...Array(7)].map((_, i) => (
          <div key={i} className="meteor" />
        ))}
      </div>

      <div className="fixed top-4 right-4 z-50 flex items-center gap-0 rounded-xl border border-white/[0.1] bg-black/60 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setLocale("ja")}
          className={`rounded-l-xl px-3 py-2.5 text-xs font-semibold transition-colors min-h-[44px] sm:min-h-0 sm:py-2 ${locale === "ja" ? "bg-amber-600/80 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
          aria-label={t.langJa}
        >
          JA
        </button>
        <button
          type="button"
          onClick={() => setLocale("en")}
          className={`rounded-r-xl px-3 py-2.5 text-xs font-semibold transition-colors min-h-[44px] sm:min-h-0 sm:py-2 ${locale === "en" ? "bg-amber-600/80 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
          aria-label={t.langEn}
        >
          EN
        </button>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-xl px-4 pt-6 pb-24 sm:px-6 sm:pt-16 sm:pb-12">
        {/* シェアされた結果をまず表示 */}
        <div className="refined-card rounded-2xl border border-white/[0.08] overflow-hidden p-4 sm:p-6 shadow-xl">
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400/90">
            {t.title}
          </p>
          {jobTitle && (
            <p className="mt-3 text-center text-xl sm:text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-indigo-300">
              {decode(jobTitle)}
            </p>
          )}
          {tier && tierCfg && (
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              <span
                className="rounded-xl px-4 py-2 text-sm font-black"
                style={{
                  background: tierCfg.gradient,
                  color: "#030303",
                  boxShadow: `0 0 16px ${tierCfg.color}50`,
                }}
              >
                {t.tierDisplay} {tier}（{tierLabel}）
              </span>
            </div>
          )}
          {(salaryDisplay || rank) && (
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              {salaryDisplay && (
                <span className="rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-1.5 text-sm font-semibold text-white">
                  {decode(salaryDisplay)}
                </span>
              )}
              {rank && (
                <span className="rounded-lg border border-indigo-500/30 bg-indigo-500/20 px-3 py-1.5 text-sm font-bold text-indigo-200">
                  {t.rankLabel} {decode(rank)}
                </span>
              )}
            </div>
          )}
          {tierFeedback && (
            <p className="mt-3 text-center text-sm italic text-zinc-300">&ldquo;{decode(tierFeedback)}&rdquo;</p>
          )}
          <h1 className="mt-4 text-center text-lg font-semibold text-white">
            {t.sharePageTitle}
          </h1>
          <div className="mx-auto mt-6 h-[240px] w-full sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data}>
                <defs>
                  <linearGradient id="radarGradShare" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#d97706" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <PolarGrid stroke="rgba(217, 119, 6, 0.35)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 9 }} />
                <Radar name={t.radarScore} dataKey="value" stroke="rgba(255,255,255,0.9)" fill="url(#radarGradShare)" fillOpacity={1} strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* その直下に「自分も今すぐ無料で診断する」を大きく表示 */}
        <a
          href="/"
          className="mt-6 flex w-full min-h-14 sm:min-h-[60px] items-center justify-center gap-2 rounded-2xl bg-white py-4 text-base font-bold text-black shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-300 hover:bg-zinc-100 hover:shadow-[0_8px_32px_rgba(0,0,0,0.45)] hover:translate-y-[-1px] active:translate-y-0 active:scale-[0.995] sm:py-3.5"
        >
          {t.sharePageCtaPrimary}
          <span className="text-xl">→</span>
        </a>
        <p className="mt-4 text-center">
          <a href="/" className="text-sm font-medium text-zinc-500 underline underline-offset-2 hover:text-zinc-300 transition-colors">
            {t.sharePageBack}
          </a>
        </p>
      </div>
    </main>
  );
}
