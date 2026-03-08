"use client";

import Link from "next/link";
import { JSX, useCallback, useEffect, useRef, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { translations, getLocaleFromBrowser, type Locale, type AppMode } from "../lib/i18n";
import { getTierConfig } from "../lib/tiers";

const RADAR_KEYS = ["technical", "contribution", "sustainability", "market"] as const;

type RadarScores = {
  technical: number;
  contribution: number;
  sustainability: number;
  market: number;
};

function InlineBold({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-white">{part}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function SimpleMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const result: JSX.Element[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("|") && lines[i + 1]?.match(/^\|[-| ]+\|$/)) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        if (!lines[i].match(/^\|[-| ]+\|$/)) tableLines.push(lines[i]);
        i++;
      }
      const headers = tableLines[0].split("|").filter(Boolean).map((h) => h.trim());
      const rows = tableLines.slice(1).map((row) => row.split("|").filter(Boolean).map((c) => c.trim()));
      result.push(
        <table key={i} className="my-4 w-full border-collapse text-sm">
          <thead>
            <tr>
              {headers.map((h, j) => (
                <th key={j} className="border border-white/[0.06] bg-white/[0.04] px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, j) => (
              <tr key={j} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                {row.map((cell, k) => (
                  <td key={k} className="border border-white/[0.04] px-4 py-2.5 text-zinc-300">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
      continue;
    }
    if (line.startsWith("### ")) {
      result.push(<h3 key={i} className="mb-1 mt-5 text-base font-semibold text-zinc-100 first:mt-0">{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      result.push(<h2 key={i} className="mb-1 mt-5 text-lg font-semibold text-white first:mt-0">{line.slice(3)}</h2>);
    } else if (line.startsWith("# ")) {
      result.push(<h1 key={i} className="mb-2 mt-5 text-xl font-bold text-white first:mt-0">{line.slice(2)}</h1>);
    } else if (line.startsWith("- ")) {
      result.push(<li key={i} className="ml-4 list-disc text-zinc-200"><InlineBold text={line.slice(2)} /></li>);
    } else if (line.trim() === "") {
      result.push(<div key={i} className="h-2" />);
    } else {
      result.push(<p key={i} className="leading-relaxed text-zinc-200"><InlineBold text={line} /></p>);
    }
    i++;
  }
  return <div className="space-y-0.5">{result}</div>;
}

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMouse = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mouse-x", `${x}%`);
    el.style.setProperty("--mouse-y", `${y}%`);
  }, []);
  return (
    <div
      ref={ref}
      className={`glass-card-interactive ${className}`}
      onMouseMove={handleMouse}
    >
      {children}
    </div>
  );
}

const DEFAULT_TRANSFER_JA = "https://doda.jp/";
const DEFAULT_TRANSFER_EN = "https://www.linkedin.com/jobs/";
const DEFAULT_LEARNING_JA = "https://www.udemy.com/";
const DEFAULT_LEARNING_EN = "https://www.udemy.com/";
const DEFAULT_SIDEBIZ_JA = "https://crowdworks.jp/";
const DEFAULT_SIDEBIZ_EN = "https://www.upwork.com/";

const DEFAULT_BUSINESS_STEP1 = "https://www.geekly.co.jp/";
const DEFAULT_BUSINESS_STEP2 = "https://techacademy.jp/biz/training";
const USAGE_LIMIT = 3;
const RATE_LIMIT_MS = 5000;

export default function Home() {
  const [locale, setLocale] = useState<Locale>("ja");
  const [mode, setMode] = useState<AppMode>("personal");
  const [githubUrl, setGithubUrl] = useState("");
  const [result, setResult] = useState("");
  const [scores, setScores] = useState<RadarScores | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [salaryDisplay, setSalaryDisplay] = useState("");
  const [rank, setRank] = useState("");
  const [tier, setTier] = useState("");
  const [tierFeedback, setTierFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [pdfExporting, setPdfExporting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [limitExceededOpen, setLimitExceededOpen] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [isCoolingDown, setIsCoolingDown] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const count = parseInt(localStorage.getItem("ai-recruiter-usage") ?? "0", 10);
        setUsageCount(isNaN(count) ? 0 : count);
      } catch {
        setUsageCount(0);
      }
    }
  }, []);

  useEffect(() => {
    setLocale(getLocaleFromBrowser());
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches);
    check();
    const mql = window.matchMedia("(max-width: 639px)");
    mql.addEventListener("change", check);
    return () => mql.removeEventListener("change", check);
  }, []);

  const t = translations[locale];

  const analyze = async () => {
    if (!githubUrl.trim()) {
      setError(t.errorUrlRequired);
      return;
    }
    if (usageCount >= USAGE_LIMIT) {
      setLimitExceededOpen(true);
      return;
    }
    if (isCoolingDown) {
      setError(t.rateLimitMessage);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubUrl: githubUrl.trim(),
          locale,
          language: locale,
          mode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult("");
        setScores(null);
        setJobTitle("");
        setSalaryDisplay("");
        setRank("");
        setTier("");
        setTierFeedback("");
        setError(data.error || t.errorAnalyzeFailed);
        return;
      }
      setResult(data.result ?? "");
      setScores(data.scores ?? null);
      setJobTitle(data.jobTitle ?? "");
      setSalaryDisplay(data.salaryDisplay ?? "");
      setRank(data.rank ?? "");
      setTier(data.tier ?? "");
      setTierFeedback(data.tierFeedback ?? "");
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      try {
        localStorage.setItem("ai-recruiter-usage", String(newCount));
      } catch {}
      setIsCoolingDown(true);
      setTimeout(() => setIsCoolingDown(false), RATE_LIMIT_MS);
    } catch {
      setResult("");
      setScores(null);
      setJobTitle("");
      setSalaryDisplay("");
      setRank("");
      setTier("");
      setTierFeedback("");
      setError(t.errorNetwork);
    } finally {
      setLoading(false);
    }
  };

  const businessStep1Url = process.env.NEXT_PUBLIC_AFFILIATE_BUSINESS_STEP1 || DEFAULT_BUSINESS_STEP1;
  const businessStep2Url = process.env.NEXT_PUBLIC_AFFILIATE_BUSINESS_STEP2 || DEFAULT_BUSINESS_STEP2;
  const businessStep3Url = process.env.NEXT_PUBLIC_AFFILIATE_BUSINESS_STEP3 || process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL || "#";
  const stripeCheckoutUrl = process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL ?? "#";

  const transferUrl = locale === "ja"
    ? (process.env.NEXT_PUBLIC_AFFILIATE_TRANSFER ?? DEFAULT_TRANSFER_JA)
    : (process.env.NEXT_PUBLIC_AFFILIATE_TRANSFER_EN ?? DEFAULT_TRANSFER_EN);
  const learningUrl = locale === "ja"
    ? (process.env.NEXT_PUBLIC_AFFILIATE_LEARNING ?? DEFAULT_LEARNING_JA)
    : (process.env.NEXT_PUBLIC_AFFILIATE_LEARNING_EN ?? DEFAULT_LEARNING_EN);
  const sideBizUrl = locale === "ja"
    ? (process.env.NEXT_PUBLIC_AFFILIATE_SIDEBIZ ?? DEFAULT_SIDEBIZ_JA)
    : (process.env.NEXT_PUBLIC_AFFILIATE_SIDEBIZ_EN ?? DEFAULT_SIDEBIZ_EN);

  const tierCfg = tier ? getTierConfig(tier) : null;
  const tierLabel = tierCfg ? (locale === "ja" ? tierCfg.labelJa : tierCfg.labelEn) : "";

  const reportRef = useRef<HTMLElement>(null);

  const handleShareOnX = useCallback(() => {
    if (typeof window === "undefined") return;
    const appUrl = scores
      ? `${window.location.origin}/share?${new URLSearchParams({
          scores: [scores.technical, scores.contribution, scores.sustainability, scores.market].join(","),
          ...(jobTitle && { title: jobTitle }),
          ...(salaryDisplay && { salary: salaryDisplay }),
          ...(rank && { rank }),
          ...(tier && { tier }),
          ...(tierFeedback && { feedback: tierFeedback }),
          mode,
          v: "final",
        }).toString()}`
      : window.location.href;
    const tierCfg = tier ? getTierConfig(tier) : null;
    const rankName = tierCfg ? (locale === "ja" ? tierCfg.labelJa : tierCfg.labelEn) : (tier || rank || "—");
    const shareText =
      locale === "ja"
        ? `【AI市場価値鑑定】私の市場価値を可視化しました！判定は「${rankName}」です。 #AI鑑定 #エンジニア市場価値`
        : `Got my engineer market value certified by AI! My tier: ${rankName} #AICertification #EngineerSalary`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(appUrl)}`;
    window.open(tweetUrl, "_blank", "noopener,noreferrer");
  }, [scores, jobTitle, salaryDisplay, rank, tier, tierFeedback, locale]);

  const handlePdfExport = useCallback(() => {
    if (typeof window === "undefined" || !reportRef.current || pdfExporting || isMobile) return;
    setPdfExporting(true);
    const prevTitle = document.title;
    document.title = mode === "business" ? (locale === "ja" ? "エンジニアスキルレポート" : "Engineer Skill Report") : (locale === "ja" ? "AI市場価値鑑定" : "AI Market Value Certification");
    const onAfterPrint = () => {
      document.title = prevTitle;
      setPdfExporting(false);
      window.removeEventListener("afterprint", onAfterPrint);
    };
    window.addEventListener("afterprint", onAfterPrint);
    requestAnimationFrame(() => window.print());
  }, [mode, locale, pdfExporting, isMobile]);

  return (
    <main
      className="relative min-h-screen overflow-hidden font-sans text-zinc-100 animate-page-in"
      data-theme={mode}
    >
      <div className="pointer-events-none fixed inset-0 bg-mesh" aria-hidden />
      <div className="meteors-layer" aria-hidden>
        {[...Array(7)].map((_, i) => (
          <div key={i} className="meteor" />
        ))}
      </div>
      {loading && (
        <div className="scan-overlay" aria-hidden>
          <div className="absolute inset-0 bg-[#030303]/20" />
        </div>
      )}

      <div className="fixed top-14 right-4 z-50 flex items-center gap-2">
        <div className="mode-tabs">
          <button
            type="button"
            onClick={() => setMode("personal")}
            data-active={mode === "personal"}
            aria-label={t.modePersonal}
          >
            {t.modePersonal}
          </button>
          <button
            type="button"
            onClick={() => setMode("business")}
            data-active={mode === "business"}
            aria-label={t.modeBusiness}
          >
            {t.modeBusiness}
          </button>
        </div>
        <div className="flex items-center gap-0 rounded-xl border border-white/[0.1] bg-black/60 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setLocale("ja")}
            className={`rounded-l-xl px-3 py-2 text-xs font-semibold transition-colors ${locale === "ja" ? (mode === "business" ? "bg-amber-600/80 text-white" : "bg-blue-500/80 text-white") : "text-zinc-500 hover:text-zinc-300"}`}
            aria-label={t.langJa}
          >
            JA
          </button>
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={`rounded-r-xl px-3 py-2 text-xs font-semibold transition-colors ${locale === "en" ? (mode === "business" ? "bg-amber-600/80 text-white" : "bg-blue-500/80 text-white") : "text-zinc-500 hover:text-zinc-300"}`}
            aria-label={t.langEn}
          >
            EN
          </button>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <header className="space-y-6 text-center break-words">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500 backdrop-blur-xl"
            style={{
              boxShadow: mode === "business" ? "0 0 0 1px rgba(217,119,6,0.25) inset" : "0 0 0 1px rgba(59,130,246,0.2) inset",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: mode === "business" ? "#d97706" : "#3b82f6",
                boxShadow: mode === "business" ? "0 0 12px rgba(217,119,6,0.6)" : "0 0 12px rgba(59,130,246,0.6)",
              }}
            />
            {mode === "personal" ? t.badge : t.businessBadge}
          </div>
          <h1
            className={`font-semibold tracking-[-0.02em] text-white leading-tight ${mode === "personal" ? "break-words text-2xl sm:text-4xl md:text-5xl" : "mx-auto w-full text-center text-xl sm:text-3xl md:text-4xl"}`}
          >
            {mode === "personal" ? (
              t.title
            ) : (
              <>
                {t.businessTitle1}<br />
                {t.businessTitle2}
              </>
            )}
          </h1>
          <p
            className={`mx-auto max-w-md break-words text-zinc-200 ${mode === "personal" ? "text-sm leading-[1.7] sm:text-base" : "text-sm leading-[1.6] sm:text-base"}`}
            style={mode === "business" ? { textWrap: "balance" } : undefined}
          >
            {mode === "personal" ? t.subtitle : t.businessSubtitle}
          </p>
        </header>

        <GlassCard className="mt-14 rounded-2xl glass-panel-strong p-6 transition-all duration-300 sm:p-8">
          <div className="flex flex-col gap-5 relative">
            <input
              type="text"
              placeholder={t.placeholder}
              className="input-premium w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-[15px] text-white outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-white/[0.12] focus:bg-white/[0.06] sm:text-base"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />
            {error && <p className="text-sm font-medium text-rose-400/90">{error}</p>}
            <button
              onClick={analyze}
              disabled={loading || isCoolingDown || usageCount >= USAGE_LIMIT}
              className="flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-[15px] font-medium text-black shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-300 hover:bg-zinc-100 hover:shadow-[0_8px_32px_rgba(0,0,0,0.45)] hover:translate-y-[-1px] active:translate-y-0 active:scale-[0.995] disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  {t.analyzing}
                </>
              ) : (
                t.analyze
              )}
            </button>
          </div>
        </GlassCard>

        {result && (
          <section ref={reportRef} data-print-report className="mt-14 space-y-8">
            <div className="space-y-8">
            {mode === "business" && jobTitle && (
              <div className="print-cert-single">
                <GlassCard className="animate-fade-in-up stagger-1 card-gradient-border rounded-2xl overflow-hidden">
                  <div className="flex min-h-0 flex-col rounded-2xl glass-panel-strong p-6 sm:p-8 print:max-h-[100%] print:overflow-hidden">
                    <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500 print:mb-2 print:text-[9px]">
                      {t.certTitle}
                    </p>
                    <p className="text-center text-xl font-bold tracking-tight text-white sm:text-2xl print:text-lg">
                      {jobTitle}
                    </p>
                    {salaryDisplay && (
                      <p className="mt-3 text-center text-lg font-semibold text-zinc-300 print:mt-2 print:text-base">
                        {t.businessReportMarketValue}: {salaryDisplay}
                      </p>
                    )}
                    {scores && (
                      <div className="print-skill-scores mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 print:mt-3 print:gap-2 print:p-2 print:rounded">
                        {[scores.technical, scores.contribution, scores.sustainability, scores.market].map((val, i) => (
                          <div key={i} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-center print:border print:border-slate-200 print:bg-slate-50/80 print:rounded print:p-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 print:text-[8px] print:text-slate-600">{t.businessRadarLabels[i]}</p>
                            <p className="mt-1 text-2xl font-bold text-white print:mt-0 print:text-lg print:text-slate-900">{val}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {(tierFeedback || result) && (
                      <div className="mx-auto mt-6 max-w-lg print:mt-3 print:max-w-full">
                        <p className="text-center text-sm leading-relaxed text-zinc-300 print:text-[9px] print:leading-snug print:text-slate-700">
                          {tierFeedback || result.split("\n").slice(0, 4).join(" ").slice(0, 200) + "…"}
                        </p>
                      </div>
                    )}
                    {scores && (
                      <div className="print-radar-section mt-6 print:mt-3">
                        <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500 print:mb-1 print:text-[8px]">
                          {t.businessRadarHeading}
                        </p>
                        <div className="print-radar-bg mx-auto h-[200px] w-[200px] sm:h-[280px] sm:w-full max-w-[320px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart
                              data={RADAR_KEYS.map((key, i) => ({
                                subject: t.businessRadarLabels[i],
                                value: scores[key],
                                fullMark: 100,
                              }))}
                            >
                              <PolarGrid stroke="rgba(255,255,255,0.12)" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 10 }} />
                              <Radar name={t.radarScore} dataKey="value" stroke="#1e40af" fill="#2563eb" fillOpacity={0.35} strokeWidth={2} />
                              <Legend wrapperStyle={{ fontSize: 10 }} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                    <div className="print-advice-section mt-6 print:mt-3 print:flex-1 print:min-h-0">
                      <SimpleMarkdown content={result} />
                    </div>
                    <p className="print-cert-footer mt-8 hidden text-center text-[9px] font-medium tracking-widest text-zinc-500 print:mt-4 print:block print:text-[8px] print:text-slate-500">
                      {t.certFooter}
                    </p>
                  </div>
                </GlassCard>
              </div>
            )}

            {mode === "personal" && jobTitle && (
              <GlassCard className="animate-fade-in-up stagger-1 card-gradient-border rounded-2xl overflow-hidden">
                <div className="rounded-2xl glass-panel-strong p-6 sm:p-8">
                  <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                    {t.jobTitleLabel}
                  </p>
                    <p className="text-center text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-300 to-indigo-300 sm:text-3xl">
                    {jobTitle}
                  </p>
                  {(salaryDisplay || rank) && (
                    <div className="mt-4 flex flex-wrap justify-center gap-4">
                      {salaryDisplay && (
                        <span className="rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white">
                          {salaryDisplay}
                        </span>
                      )}
                      {rank && (
                        <span className="rounded-lg border border-blue-500/30 bg-blue-500/20 px-4 py-2 text-sm font-bold text-blue-200">
                          {t.rankLabel} {rank}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </GlassCard>
            )}

            {mode === "personal" && tier && tierCfg && (
              <GlassCard className="animate-fade-in-up stagger-2 card-gradient-border rounded-2xl overflow-hidden">
                <div className="rounded-2xl glass-panel-strong p-6 sm:p-8">
                  <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                    {t.tierBadge}
                  </p>
                  <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
                    <div
                      className="flex items-center gap-2 rounded-xl px-5 py-3 text-lg font-black"
                      style={{
                        background: tierCfg.gradient,
                        color: "#030303",
                        boxShadow: `0 0 24px ${tierCfg.color}40`,
                      }}
                    >
                      <span className="opacity-90">{tierCfg.badgeSymbol}</span>
                      <span>{t.tierDisplay} {tier}</span>
                      <span className="text-sm font-bold opacity-90">（{tierLabel}）</span>
                    </div>
                  </div>
                  {tierFeedback && (
                    <p className="mt-4 text-center text-sm italic leading-relaxed text-zinc-200">
                      &ldquo;{tierFeedback}&rdquo;
                    </p>
                  )}
                </div>
              </GlassCard>
            )}

            {mode === "personal" && scores && (
              <GlassCard className="animate-fade-in-up stagger-3 card-gradient-border rounded-2xl overflow-hidden">
                <div className="rounded-2xl glass-panel-strong p-6 sm:p-8">
                  <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                    {t.radarTitle}
                  </p>
                  <h2 className="text-center text-lg font-semibold tracking-tight text-white">
                    {t.radarHeading}
                  </h2>
                  <div className="mx-auto mt-6 h-[280px] w-full sm:h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        data={RADAR_KEYS.map((key, i) => ({
                          subject: t.radarLabels[i],
                          value: scores[key],
                          fullMark: 100,
                        }))}
                      >
                        <PolarGrid stroke="rgba(255,255,255,0.12)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 10 }} />
                        <Radar name={t.radarScore} dataKey="value" stroke="#8b5cf6" fill="#a78bfa" fillOpacity={0.35} strokeWidth={2} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </GlassCard>
            )}

            {mode === "personal" && (
            <GlassCard className="animate-fade-in-up stagger-4 card-gradient-border rounded-2xl overflow-hidden">
              <div className="rounded-2xl glass-panel-strong overflow-hidden p-6 sm:p-8">
                <SimpleMarkdown content={result} />
              </div>
            </GlassCard>
            )}

            {mode === "personal" && (
            <div className="no-print animate-fade-in-up stagger-4b space-y-4">
              <p className="text-center text-sm font-semibold text-zinc-300">
                {t.nextActionTitle}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <a
                  href={transferUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="golden-vip-button flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl px-6 py-5 text-center transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] sm:min-h-[64px] sm:py-6"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-100">
                    {t.vipCtaTransfer}
                  </span>
                  <span className="text-base font-bold text-white drop-shadow-sm sm:text-lg">
                    {locale === "ja" ? "doda・転職サイト →" : "LinkedIn / Job Boards →"}
                  </span>
                </a>
                <a
                  href={learningUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="golden-vip-button flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl px-6 py-5 text-center transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] sm:min-h-[64px] sm:py-6"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-100">
                    {t.vipCtaLearning}
                  </span>
                  <span className="text-base font-bold text-white drop-shadow-sm sm:text-lg">
                    {locale === "ja" ? "Udemy・スクール →" : "Udemy / Courses →"}
                  </span>
                </a>
              </div>
            </div>
            )}

            {mode === "business" && (
            <>
            <div className="no-print animate-fade-in-up stagger-4b space-y-4">
              <p className="text-center text-sm font-semibold text-zinc-300">{t.nextActionTitle}</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <a
                  href={businessStep1Url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-amber-500/50 bg-amber-500/10 px-4 py-4 text-center text-sm font-medium text-amber-400 transition-all hover:bg-amber-500/20 hover:border-amber-500/50 sm:py-5"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider">Step 1</span>
                  {t.businessStep1}
                </a>
                <a
                  href={businessStep2Url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-amber-500/50 bg-amber-500/10 px-4 py-4 text-center text-sm font-medium text-amber-400 transition-all hover:bg-amber-500/20 hover:border-amber-500/50 sm:py-5"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider">Step 2</span>
                  {t.businessStep2}
                </a>
                <a
                  href={businessStep3Url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-amber-500/50 bg-amber-500/10 px-4 py-4 text-center text-sm font-medium text-amber-400 transition-all hover:bg-amber-500/20 hover:border-amber-500/50 sm:py-5"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider">Step 3</span>
                  {t.businessStep3}
                </a>
              </div>
            </div>
            <div className="no-print animate-fade-in-up stagger-4b flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-center">
                <button
                  type="button"
                  onClick={handlePdfExport}
                  disabled={pdfExporting || isMobile}
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.06] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-xl transition-all hover:bg-white/[0.1] hover:border-white/[0.18] disabled:pointer-events-none disabled:opacity-80 sm:min-w-0"
                >
                  {pdfExporting ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {t.pdfExporting}
                    </>
                  ) : (
                    t.pdfExport
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="flex min-h-12 flex-1 items-center justify-center rounded-xl border border-amber-500/50 bg-amber-500/20 px-6 py-3.5 text-center text-sm font-semibold text-amber-400 transition-all hover:bg-amber-500/30 sm:min-w-0"
                >
                  {t.contactEnterprise}
                </button>
              </div>
              <p className="text-center text-xs text-zinc-500">{t.pdfNote}</p>
            </div>
            </>
            )}
            </div>

            {limitExceededOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="limit-modal-title">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setLimitExceededOpen(false)} aria-hidden />
                <div className="relative w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0f0f12] p-6 shadow-2xl">
                  <h2 id="limit-modal-title" className="text-lg font-semibold text-white">{t.limitExceededTitle}</h2>
                  <p className="mt-2 text-sm text-zinc-400">{t.limitExceededMessage}</p>
                  <a
                    href={stripeCheckoutUrl}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                  >
                    {t.fullReportCta}
                  </a>
                  <button
                    type="button"
                    onClick={() => setLimitExceededOpen(false)}
                    className="mt-4 w-full rounded-xl bg-white/10 py-2.5 text-sm font-medium text-white hover:bg-white/15"
                  >
                    {t.contactClose}
                  </button>
                </div>
              </div>
            )}

            {contactOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setContactOpen(false)} aria-hidden />
                <div className="relative w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0f0f12] p-6 shadow-2xl">
                  <h2 id="contact-modal-title" className="text-lg font-semibold text-white">{t.contactModalTitle}</h2>
                  <p className="mt-2 text-sm text-zinc-400">{t.contactModalDesc}</p>
                  <div className="mt-6 space-y-3">
                    <Link
                      href="/contact"
                      className="block rounded-xl border border-indigo-500/30 bg-indigo-500/20 px-4 py-3 text-sm font-medium text-indigo-200 transition hover:bg-indigo-500/30"
                    >
                      {t.contactFormPage}
                    </Link>
                    {(process.env.NEXT_PUBLIC_CONTACT_FORM_URL || process.env.NEXT_PUBLIC_CONTACT_GOOGLE_FORM) && (
                      <a
                        href={process.env.NEXT_PUBLIC_CONTACT_FORM_URL || process.env.NEXT_PUBLIC_CONTACT_GOOGLE_FORM}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                      >
                        {t.contactForm}
                      </a>
                    )}
                    {(process.env.NEXT_PUBLIC_CONTACT_X_DM || process.env.NEXT_PUBLIC_CONTACT_TWITTER) && (
                      <a
                        href={process.env.NEXT_PUBLIC_CONTACT_X_DM || process.env.NEXT_PUBLIC_CONTACT_TWITTER}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                      >
                        {t.contactX}
                      </a>
                    )}
                    {(() => {
                    const emailOrEnterprise = process.env.NEXT_PUBLIC_CONTACT_EMAIL || process.env.NEXT_PUBLIC_CONTACT_ENTERPRISE;
                    const mailtoHref = emailOrEnterprise
                      ? (String(emailOrEnterprise).startsWith("mailto:") ? String(emailOrEnterprise) : `mailto:${emailOrEnterprise}`)
                      : "mailto:info@example.com?subject=大規模利用・API連携のご相談";
                    return (
                      <a
                        href={mailtoHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                      >
                        {t.contactEmail}
                      </a>
                    );
                  })()}
                  </div>
                  <button
                    type="button"
                    onClick={() => setContactOpen(false)}
                    className="mt-6 w-full rounded-xl bg-white/10 py-2.5 text-sm font-medium text-white hover:bg-white/15"
                  >
                    {t.contactClose}
                  </button>
                </div>
              </div>
            )}

            {mode === "personal" && (
            <GlassCard className="animate-fade-in-up stagger-5 card-gradient-border rounded-2xl overflow-hidden">
              <div className="rounded-2xl glass-panel border border-white/[0.06] p-6 sm:p-8">
              <h2 className="text-center text-lg font-semibold tracking-tight text-white">
                {t.threeStepsTitle}
              </h2>
              <p className="mt-2 text-center text-[13px] leading-relaxed text-zinc-500">
                {t.threeStepsSubtitle}
              </p>
              <div className="mt-6 space-y-4 sm:mt-8">
                {[
                  { title: t.step1Title, desc: t.step1Desc, cta: t.ctaTransfer, href: transferUrl, bg: "rgba(99,102,241,0.2)", fg: "#a5b4fc" },
                  { title: t.step2Title, desc: t.step2Desc, cta: t.ctaLearning, href: learningUrl, bg: "rgba(16,185,129,0.2)", fg: "#6ee7b7" },
                  { title: t.step3Title, desc: t.step3Desc, cta: t.ctaSideBiz, href: sideBizUrl, bg: "rgba(245,158,11,0.2)", fg: "#fcd34d" },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="group flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.05] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:translate-y-[-2px] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex gap-4">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors"
                        style={{ backgroundColor: step.bg, color: step.fg }}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-medium text-white">{step.title}</p>
                        <p className="mt-0.5 text-[13px] text-zinc-500">{step.desc}</p>
                      </div>
                    </div>
                    <a
                      href={step.href}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="shrink-0 rounded-lg bg-white px-4 py-2.5 text-[13px] font-medium text-black shadow-[0_2px_12px_rgba(0,0,0,0.25)] transition-all duration-300 hover:bg-zinc-100 hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:translate-y-[-1px]"
                    >
                      {step.cta}
                    </a>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-center text-[11px] text-zinc-600">{t.affiliateNote}</p>
              </div>
            </GlassCard>
            )}

            {mode === "personal" && (
            <div className="animate-fade-in-up stagger-6 space-y-4">
              <p className="text-center text-[11px] font-medium uppercase tracking-widest text-zinc-600">
                {t.shareLabel}
              </p>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleShareOnX}
                  className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-8 py-3.5 text-sm font-medium text-amber-200 backdrop-blur-xl transition-all duration-300 hover:bg-amber-500/20 hover:border-amber-500/50 hover:translate-y-[-1px]"
                >
                  {t.saveImageAndShare}
                </button>
              </div>
            </div>
            )}

            {mode === "personal" && (
            <div className="animate-fade-in-up stagger-7 rounded-2xl glass-panel border border-white/[0.06] p-6 sm:p-8">
              <p className="mb-1 text-center text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                {t.recommendLabel}
              </p>
              <p className="text-center text-sm text-zinc-500">{t.recommendDesc}</p>
              <div className="mt-4 flex justify-center">
                <a
                  href="https://google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-zinc-300 transition-all duration-300 hover:bg-white/[0.06]"
                >
                  {t.recommendCta}
                </a>
              </div>
            </div>
            )}
          </section>
        )}

        <footer className="mt-16 pb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
            <span className="text-[11px] font-medium text-zinc-500">{t.securityBadge}</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
