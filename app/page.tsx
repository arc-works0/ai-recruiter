"use client";

import Link from "next/link";
import { JSX, useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
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

/** スコア(0-100)を言語ラベルに変換 */
function scoreToLabel(score: number, t: { printScoreLabelJunior: string; printScoreLabelGrowing: string; printScoreLabelStandard: string; printScoreLabelExpert: string; printScoreLabelGodly: string }): string {
  if (score <= 30) return t.printScoreLabelJunior;
  if (score <= 50) return t.printScoreLabelGrowing;
  if (score <= 70) return t.printScoreLabelStandard;
  if (score <= 85) return t.printScoreLabelExpert;
  return t.printScoreLabelGodly;
}

/** 印刷用：テキストを最大行数・文字数に制限（各セクション3行以内） */
function truncateToLines(text: string, maxLines: number): string {
  if (!text?.trim()) return "";
  const lines = text.trim().split(/\n/).filter(Boolean);
  const joined = lines.slice(0, maxLines).join(" ");
  const maxChars = 110;
  const out = joined.length > maxChars ? joined.slice(0, maxChars).trim() + "…" : joined;
  return lines.length > maxLines && !out.endsWith("…") ? out + "…" : out;
}

/** テキストを3行以上の所見として整形 */
function ensureMinLines(text: string, minLines: number): string {
  if (!text?.trim()) return "";
  const byPeriod = text.split(/(?<=[。.])/).map((t) => t.trim()).filter(Boolean);
  const byNewline = text.split(/\n+/).filter(Boolean);
  let lines = byPeriod.length >= minLines ? byPeriod : byNewline.length >= minLines ? byNewline : byPeriod.length > 0 ? byPeriod : [text];
  while (lines.length < minLines && lines[0]) {
    const last = lines[lines.length - 1];
    const mid = Math.floor((last?.length ?? 0) / 2);
    if (mid < 10) break;
    lines = [...lines.slice(0, -1), last!.slice(0, mid), last!.slice(mid)];
  }
  return lines.slice(0, Math.max(minLines, 1)).join("\n");
}

/** スコア別にAI解析所見（3行以上）を取得 */
function getScoreFindings(
  key: "technical" | "contribution" | "sustainability" | "market",
  opts: { summaryStrengths: string; summaryMarketValue: string; summaryOutlook: string; tierFeedback: string; result: string }
): string {
  const r = opts.result || "";
  switch (key) {
    case "technical": return ensureMinLines(opts.summaryStrengths || r.slice(0, 350), 3);
    case "contribution": return ensureMinLines(opts.tierFeedback || r.slice(350, 700), 3);
    case "sustainability": return ensureMinLines(opts.summaryOutlook || r.slice(700, 1050), 3);
    case "market": return ensureMinLines(opts.summaryMarketValue || r.slice(1050, 1400), 3);
    default: return ensureMinLines(r.slice(0, 200), 3);
  }
}

/** 印刷用：鑑定結果を約30%に要約（各見出しセクション3行以内） */
function condenseMarkdownForPrint(md: string): string {
  if (!md?.trim()) return "";
  const maxChars = Math.floor(md.length * 0.32);
  const sections = md.split(/(?=^#{2,3}\s)/m);
  const out: string[] = [];
  let total = 0;
  for (const sec of sections) {
    if (total >= maxChars) break;
    const lines = sec.trim().split("\n");
    const kept = lines.slice(0, 3).join("\n");
    const len = kept.length;
    if (total + len > maxChars) {
      const remainder = maxChars - total - 2;
      out.push(kept.slice(0, Math.max(0, remainder)) + "…");
      break;
    }
    out.push(kept);
    total += len;
  }
  return out.join("\n\n").trim() || md.slice(0, maxChars) + "…";
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
  const [summaryStrengths, setSummaryStrengths] = useState("");
  const [summaryMarketValue, setSummaryMarketValue] = useState("");
  const [summaryOutlook, setSummaryOutlook] = useState("");
  const [candidateStrengths, setCandidateStrengths] = useState("");
  const [interviewConcerns, setInterviewConcerns] = useState("");
  const [showFullMobile, setShowFullMobile] = useState(false);
  const [githubStats, setGithubStats] = useState<{ totalStars: number; publicRepos: number; topLanguages: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [pdfExporting, setPdfExporting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [limitExceededOpen, setLimitExceededOpen] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [shareSparkle, setShareSparkle] = useState(false);

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
    if (usageCount >= USAGE_LIMIT) {
      setLimitExceededOpen(true);
      return;
    }
    if (!githubUrl.trim()) {
      setError(t.errorUrlRequired);
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
        setSummaryStrengths("");
        setSummaryMarketValue("");
        setSummaryOutlook("");
        setCandidateStrengths("");
        setInterviewConcerns("");
        setShowFullMobile(false);
        setGithubStats(null);
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
      setSummaryStrengths(data.summaryStrengths ?? "");
      setSummaryMarketValue(data.summaryMarketValue ?? "");
      setSummaryOutlook(data.summaryOutlook ?? "");
      setCandidateStrengths(data.candidateStrengths ?? "");
      setInterviewConcerns(data.interviewConcerns ?? "");
      setShowFullMobile(false);
      setGithubStats(data.githubStats ?? null);
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
      setSummaryStrengths("");
      setSummaryMarketValue("");
      setSummaryOutlook("");
      setCandidateStrengths("");
      setInterviewConcerns("");
      setGithubStats(null);
      setError(t.errorNetwork);
    } finally {
      setLoading(false);
    }
  };

  const contactFormUrl = "/contact";
  const baseUrl = typeof window !== "undefined"
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://ai-recruiter-4o7e.vercel.app");
  const contactFullUrl = `${baseUrl}/contact`;
  const businessStep1Url = process.env.NEXT_PUBLIC_AFFILIATE_BUSINESS_STEP1 || DEFAULT_BUSINESS_STEP1;
  const businessStep2Url = process.env.NEXT_PUBLIC_AFFILIATE_BUSINESS_STEP2 || DEFAULT_BUSINESS_STEP2;
  const businessStep3Url = process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL ?? "#";
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

  const handleShareBrag = useCallback(() => {
    if (typeof window === "undefined") return;
    setShareSparkle(true);
    setTimeout(() => setShareSparkle(false), 650);
    const appUrl = scores
      ? `${window.location.origin}/share?${new URLSearchParams({
          scores: [scores.technical, scores.contribution, scores.sustainability, scores.market].join(","),
          ...(jobTitle && { title: jobTitle }),
          ...(salaryDisplay && { salary: salaryDisplay }),
          mode,
          v: "final",
        }).toString()}`
      : window.location.href;
    const numMatch = salaryDisplay?.match(/[\d,]+/);
    const manStr = numMatch
      ? `${Math.round(parseInt(numMatch[0].replace(/,/g, ""), 10) / 10000)}`
      : (locale === "ja" ? "〇〇" : "—");
    const shareText = (t.shareBragTweet as string).replace("{salary}", manStr);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(appUrl)}`;
    window.open(tweetUrl, "_blank", "noopener,noreferrer");
  }, [scores, jobTitle, salaryDisplay, locale, t]);

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
    /* ③ ステート/DOM の描画完了を保証してから印刷 */
    flushSync(() => {});
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = reportRef.current;
        if (el) {
          void el.offsetHeight; /* リフロー強制 */
        }
        setTimeout(() => {
          const _forceReflow = document.body.offsetHeight;
          void _forceReflow;
          window.print();
        }, 1200);
      });
    });
  }, [mode, locale, pdfExporting, isMobile]);

  return (
    <main
      className="relative min-h-screen overflow-hidden font-sans text-zinc-100 animate-page-in bg-[#050505]"
      data-theme={mode}
      data-modal-open={String(limitExceededOpen)}
    >
      <div className="pointer-events-none fixed inset-0 bg-mesh bg-[#050505] modal-bg" aria-hidden />
      <div className="meteors-layer modal-bg" aria-hidden>
        {[...Array(7)].map((_, i) => (
          <div key={i} className="meteor" />
        ))}
      </div>
      {loading && (
        <div className="scan-overlay" aria-hidden>
          <div className="absolute inset-0 bg-[#030303]/20" />
        </div>
      )}

      {/* スマホ: フロー内に配置して重なり防止 / PC: fixed */}
      <div className="relative z-50 flex flex-wrap items-center justify-end gap-2 px-4 pt-4 sm:fixed sm:right-4 sm:top-14 sm:flex-nowrap sm:pt-0">
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
      </div>

      <div className="print-content-wrapper relative z-10 mx-auto w-full max-w-xl px-4 pt-6 pb-24 sm:px-6 sm:pt-16 sm:pb-12">
        <section className="mb-8 sm:mb-10 text-center">
          <h1 className="text-xl font-bold leading-tight text-white sm:text-2xl md:text-3xl tracking-tight">
            {locale === "ja" ? "エンジニア採用の書類選考を1分に短縮。GitHubから技術力と自社適性をAIが即座に可視化" : "Shorten document screening to 1 minute. AI visualizes technical skills and company fit from GitHub instantly."}
          </h1>
            <Link
            href={contactFormUrl}
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 px-8 py-3 text-sm font-bold text-black shadow-[0_4px_24px_rgba(217,119,6,0.5)] transition-all hover:from-amber-500 hover:via-amber-400 hover:to-amber-300 hover:shadow-[0_8px_32px_rgba(217,119,6,0.55)] active:scale-[0.98]"
          >
            {t.ctaEnterpriseTrial}
          </Link>
        </section>
        <GlassCard className="refined-card rounded-2xl p-4 transition-all duration-300 sm:p-6">
          <div className="flex flex-col gap-4 relative">
            <input
              type="text"
              placeholder={t.placeholder}
              className="input-premium w-full min-h-14 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-4 text-[15px] text-white outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-white/[0.12] focus:bg-white/[0.06] sm:text-base sm:min-h-12 sm:py-3.5"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />
            {error && <p className="text-sm font-medium text-rose-400/90">{error}</p>}
            <button
              onClick={analyze}
              disabled={loading}
              className="flex w-full min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white py-4 text-[15px] font-medium text-black shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-300 hover:bg-zinc-100 hover:shadow-[0_8px_32px_rgba(0,0,0,0.45)] hover:translate-y-[-1px] active:translate-y-0 active:scale-[0.995] disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0 sm:min-h-12 sm:py-3.5"
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
          <section ref={reportRef} data-print-report className="mt-6 sm:mt-10">
            <div className="space-y-5 sm:space-y-6 print-hide-web">
            {mode === "business" && jobTitle && (
              <>
                {/* Web表示：印刷時は完全非表示 */}
                <div className="print-hide-web">
                  <GlassCard className="business-report-card animate-fade-in-up stagger-1 card-gradient-border rounded-2xl overflow-hidden">
                    <div className="business-report-watermark" aria-hidden>Confidential</div>
                    <div className="flex min-h-0 flex-col rounded-2xl glass-panel-strong p-6 sm:p-8 relative z-[1]">
                      <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">{t.certTitle}</p>
                      <p className="text-center text-xl font-bold text-white sm:text-2xl">{jobTitle}</p>
                      <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                        {salaryDisplay && <p className="text-center text-lg font-semibold text-zinc-300">{t.businessReportMarketValue}: {salaryDisplay}</p>}
                        {(tier || rank) && tierCfg && (
                          <span className="inline-flex items-center gap-1.5 rounded-md border-2 border-amber-400/50 bg-amber-500/25 px-3.5 py-2 text-sm font-extrabold text-amber-100">
                            <span className="text-[10px] font-semibold uppercase">{t.marketValueRankLabel}</span>
                            <span className="rounded bg-white/10 px-1.5 py-0.5 font-black tabular-nums">{tier || rank}</span>
                          </span>
                        )}
                      </div>
                      {scores && (
                        <div className="print-skill-scores mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {[scores.technical, scores.contribution, scores.sustainability, scores.market].map((val, i) => (
                            <div key={i} className="score-card-cell flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-center">
                              <p className="score-card-label text-xs font-semibold text-zinc-500">{t.businessRadarLabels[i]}</p>
                              <p className="mt-1.5 text-xl font-bold text-white">{val}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {scores && (
                        <div className="print-radar-section mt-6">
                          <p className="mb-2 text-center text-[10px] font-semibold uppercase text-zinc-500">{t.businessRadarHeading}</p>
                          <div className="radar-chart-wrapper mx-auto flex justify-center">
                            <div className={`radar-chart-inner h-[200px] w-full max-w-[200px] sm:h-[280px] sm:max-w-[320px] ${isMobile ? "scale-[0.8] origin-center" : ""}`}>
                              <ResponsiveContainer width="100%" height="100%">
                                <RadarChart margin={{ top: 24, right: 24, bottom: 24, left: 24 }} data={RADAR_KEYS.map((key, i) => ({ subject: t.businessRadarLabels[i], value: scores[key], fullMark: 100 }))}>
                                  <PolarGrid stroke="rgba(255,255,255,0.12)" />
                                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#a1a1aa", fontSize: isMobile ? 11 : 14 }} />
                                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#71717a", fontSize: isMobile ? 10 : 12 }} />
                                  <Radar name={t.radarScore} dataKey="value" stroke="#1e40af" fill="#2563eb" fillOpacity={0.35} strokeWidth={2} />
                                  <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 9 }} />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      )}
                      {(summaryStrengths || summaryMarketValue || summaryOutlook) && (
                        <div className="mx-auto mt-6 max-w-lg">
                          <ul className="space-y-2 text-left text-sm text-zinc-300">
                            {[summaryStrengths, summaryMarketValue, summaryOutlook].filter(Boolean).slice(0, 3).map((text, i) => (
                              <li key={i}><span className="font-semibold text-zinc-100">{[t.summaryLabelStrengths, t.summaryLabelMarketValue, t.summaryLabelOutlook][[summaryStrengths, summaryMarketValue, summaryOutlook].indexOf(text)]}: </span>{text}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {(candidateStrengths || interviewConcerns) && (
                        <div className="mx-auto mt-6 max-w-lg space-y-4">
                          {candidateStrengths && <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4"><p className="mb-2 text-[10px] font-semibold text-amber-400/90">{t.candidateStrengthsLabel}</p><p className="text-sm text-zinc-200">{candidateStrengths}</p></div>}
                          {interviewConcerns && <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4"><p className="mb-2 text-[10px] font-semibold text-indigo-400/90">{t.businessInterviewConcernsLabel}</p><p className="text-sm text-zinc-200">{interviewConcerns}</p></div>}
                        </div>
                      )}
                      {(!isMobile || showFullMobile) && <div className="mt-6"><SimpleMarkdown content={result} /></div>}
                    </div>
                  </GlassCard>
                </div>
              </>
            )}

            {mode === "personal" && jobTitle && (
              <>
              {/* 1. 推定年収＋シェアを最優先表示 */}
              <GlassCard className="refined-card animate-fade-in-up stagger-1 rounded-2xl overflow-hidden">
                <div className="rounded-2xl p-4 sm:p-6 space-y-4">
                  {salaryDisplay && (
                    <div className="text-center">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400/90">
                        {locale === "ja" ? "推定年収" : "Est. Salary"}
                      </p>
                      <p className="mt-1 text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-indigo-300">
                        {salaryDisplay}
                      </p>
                    </div>
                  )}
                  <div className={`share-sparkle-container relative ${shareSparkle ? "is-sparkling" : ""}`}>
                    {shareSparkle && [...Array(12)].map((_, i) => (
                      <span
                        key={i}
                        className="share-sparkle"
                        style={{
                          left: `${15 + (i % 4) * 25}%`,
                          top: `${20 + Math.floor(i / 4) * 60}%`,
                          animationDelay: `${i * 0.04}s`,
                        }}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={handleShareBrag}
                      className="flex w-full min-h-14 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-indigo-600 py-4 text-base font-bold text-white shadow-[0_0_24px_rgba(217,119,6,0.4)] transition-all hover:from-amber-500 hover:via-amber-400 hover:to-indigo-500 hover:shadow-[0_0_32px_rgba(217,119,6,0.5)] active:scale-[0.99] sm:min-h-12 sm:py-3"
                    >
                      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      {t.shareBragCta}
                    </button>
                  </div>
                  <Link
                    href={contactFormUrl}
                    className="golden-vip-button flex w-full min-h-14 items-center justify-center gap-3 rounded-2xl px-6 py-4 text-center transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] sm:min-h-[60px]"
                  >
                    <span className="text-lg font-bold text-white drop-shadow-sm">
                      {t.geeklyMainCta}
                    </span>
                    <span className="text-2xl">→</span>
                  </Link>
                </div>
              </GlassCard>
              {/* 2. 称号＋グラフ */}
              <GlassCard className="refined-card animate-fade-in-up stagger-1b rounded-2xl overflow-hidden">
                <div className="rounded-2xl p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 sm:gap-6 items-center">
                    <div className="order-2 sm:order-1 text-center sm:text-left">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400/90">
                        {t.jobTitleLabel}
                      </p>
                      <p className="mt-1 font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-indigo-300 text-2xl sm:text-3xl md:text-4xl">
                        {jobTitle}
                      </p>
                      <p className="mt-1 text-[10px] font-medium tracking-widest text-indigo-400/80">
                        {t.verifiedByAI}
                      </p>
                      {rank && (
                        <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-md border-2 border-indigo-400/40 bg-indigo-500/20 px-3.5 py-2 text-sm font-extrabold tracking-wider text-indigo-100 shadow-[0_0_0_1px_rgba(99,102,241,0.2),0_2px_8px_rgba(0,0,0,0.2)]">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-300/90">{t.rankLabel}</span>
                            <span className="rounded bg-white/10 px-1.5 py-0.5 font-black tabular-nums">{rank}</span>
                          </span>
                        </div>
                      )}
                    </div>
                    {scores && (
                      <div className="order-1 sm:order-2 radar-reveal radar-chart-wrapper mx-auto flex h-[220px] w-full min-w-0 max-w-[260px] flex-col justify-center px-4 py-4 sm:h-[180px] sm:max-w-[200px] sm:px-0 sm:py-0">
                        <div className={`radar-chart-inner h-full w-full min-w-0 ${isMobile ? "scale-[0.8] origin-center" : ""}`}>
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart
                              margin={{ top: 20, right: 22, bottom: 20, left: 22 }}
                              data={RADAR_KEYS.map((key, i) => ({
                                subject: t.radarLabels[i],
                                value: scores[key],
                                fullMark: 100,
                              }))}
                            >
                              <defs>
                                <linearGradient id="radarGradPersonal" x1="0" y1="0" x2="1" y2="1">
                                  <stop offset="0%" stopColor="#d97706" stopOpacity={0.85} />
                                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.6} />
                                </linearGradient>
                              </defs>
                              <PolarGrid stroke="rgba(217, 119, 6, 0.35)" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: isMobile ? 11 : 14 }} />
                              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: isMobile ? 10 : 12 }} />
                            <Radar name={t.radarScore} dataKey="value" stroke="rgba(255,255,255,0.9)" strokeWidth={2} fill="url(#radarGradPersonal)" fillOpacity={1} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
              {githubStats && (
                <GlassCard className="achievement-id-card refined-card animate-fade-in-up stagger-1b rounded-2xl overflow-hidden">
                  <div className="relative rounded-2xl p-4 sm:p-6 z-[1]">
                    <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-400/90">
                      {t.achievementCardTitle}
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-xl border border-amber-500/20 bg-white/[0.04] p-3 text-center">
                        <p className="text-xl font-bold text-amber-400 sm:text-2xl">{githubStats.totalStars}</p>
                        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">{t.achievementStars}</p>
                      </div>
                      <div className="rounded-xl border border-indigo-500/20 bg-white/[0.04] p-3 text-center">
                        <p className="text-xl font-bold text-emerald-400 sm:text-2xl">{githubStats.publicRepos}</p>
                        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">{t.achievementRepos}</p>
                      </div>
                      {githubStats.topLanguages.slice(0, 2).map((lang, i) => (
                        <div key={i} className="rounded-xl border border-indigo-500/20 bg-white/[0.04] p-3 text-center">
                          <p className="text-base font-bold text-indigo-300 sm:text-lg truncate" title={lang}>{lang}</p>
                          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                            {locale === "ja" ? "主要言語" : "Top Lang"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              )}
              </>
            )}

            {mode === "personal" && tier && tierCfg && (
              <GlassCard className="refined-card animate-fade-in-up stagger-2 rounded-2xl overflow-hidden">
                <div className="rounded-2xl p-4 sm:p-6">
                  <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                    {t.tierBadge}
                  </p>
                  <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
                    <div
                      className="flex items-center gap-2.5 rounded-xl border-2 border-white/20 px-5 py-3.5 text-lg font-black shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.25)]"
                      style={{
                        background: tierCfg.gradient,
                        color: "#030303",
                        boxShadow: `0 0 24px ${tierCfg.color}40, 0 0 0 1px rgba(255,255,255,0.08)`,
                      }}
                    >
                      <span className="text-2xl opacity-95">{tierCfg.badgeSymbol}</span>
                      <span className="tracking-tight">{t.tierDisplay} {tier}</span>
                      <span className="rounded bg-black/10 px-2 py-0.5 text-sm font-bold">（{tierLabel}）</span>
                    </div>
                  </div>
                  {["D", "E"].includes(tier) && (
                    <p className="mt-3 text-center text-sm font-medium text-amber-400/90">
                      {t.potentialInfinite}
                    </p>
                  )}
                  {tierFeedback && (
                    <p className="mt-4 text-center text-sm italic leading-relaxed text-zinc-200">
                      &ldquo;{tierFeedback}&rdquo;
                    </p>
                  )}
                </div>
              </GlassCard>
            )}

            {mode === "personal" && result && (
            <GlassCard className="refined-card animate-fade-in-up stagger-4 rounded-2xl overflow-hidden">
              <div className="rounded-2xl overflow-hidden p-4 sm:p-6">
                {(summaryStrengths || summaryMarketValue || summaryOutlook) ? (
                  <>
                    <ul className="space-y-3 text-zinc-200">
                      {summaryStrengths && (
                        <li className="flex gap-2">
                          <span className="shrink-0 mt-0.5 h-1.5 w-1.5 rounded-full bg-amber-400/90" aria-hidden />
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/90">{t.summaryLabelStrengths}</p>
                            <p className="mt-0.5 text-sm leading-relaxed">{summaryStrengths}</p>
                          </div>
                        </li>
                      )}
                      {summaryMarketValue && (
                        <li className="flex gap-2">
                          <span className="shrink-0 mt-0.5 h-1.5 w-1.5 rounded-full bg-indigo-400/90" aria-hidden />
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400/90">{t.summaryLabelMarketValue}</p>
                            <p className="mt-0.5 text-sm leading-relaxed">{summaryMarketValue}</p>
                          </div>
                        </li>
                      )}
                      {summaryOutlook && (
                        <li className="flex gap-2">
                          <span className="shrink-0 mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400/90" aria-hidden />
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/90">{t.summaryLabelOutlook}</p>
                            <p className="mt-0.5 text-sm leading-relaxed">{summaryOutlook}</p>
                          </div>
                        </li>
                      )}
                    </ul>
                    {isMobile && (
                      <button
                        type="button"
                        onClick={() => setShowFullMobile((v) => !v)}
                        className="mt-4 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/10"
                      >
                        {showFullMobile ? t.readLessMobile : t.readMoreMobile}
                      </button>
                    )}
                    {(!isMobile || showFullMobile) && (
                      <div className="mt-4 border-t border-white/5 pt-4">
                        <SimpleMarkdown content={result} />
                      </div>
                    )}
                  </>
                ) : (
                  <SimpleMarkdown content={result} />
                )}
              </div>
            </GlassCard>
            )}

            {/* 法人: アフィリエイトなし。PDF・お問い合わせのみ */}
            {mode === "business" && (
            <>
            <div className="no-print animate-fade-in-up stagger-4b flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-center">
                <button
                  type="button"
                  onClick={handlePdfExport}
                  disabled={pdfExporting || isMobile}
                  className="flex w-full min-h-14 flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.06] px-6 py-4 text-sm font-semibold text-white backdrop-blur-xl transition-all hover:bg-white/[0.1] hover:border-white/[0.18] disabled:pointer-events-none disabled:opacity-80 sm:min-w-0 sm:min-h-12 sm:py-3.5"
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
                <Link
                  href={contactFormUrl}
                  className="flex w-full min-h-14 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 px-6 py-4 text-center text-sm font-bold text-black shadow-[0_4px_20px_rgba(217,119,6,0.4)] transition-all hover:from-amber-500 hover:via-amber-400 hover:to-amber-300 hover:shadow-[0_6px_24px_rgba(217,119,6,0.5)] sm:min-w-0 sm:min-h-12 sm:py-3.5"
                >
                  {t.ctaEnterpriseTrial}
                </Link>
              </div>
              <p className="text-center text-xs text-zinc-500">{t.pdfNote}</p>
            </div>
            </>
            )}
            </div>
            {/* PDF出力専用：2カラム・テーブル構造・高密度（法人/個人共通） */}
            {(jobTitle || scores) && (
              <div className="print-only-root hidden">
                <table className="print-table">
                  <thead>
                    <tr>
                      <th colSpan={2} className="print-th">{t.printReportTitle} / {t.printSubjectLabel}</th>
                    </tr>
                    <tr>
                      <th colSpan={2} className="print-th">{new Date().toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="print-td print-td-label">{t.businessReportMarketValue}</td>
                      <td className="print-td">{salaryDisplay || "—"}{(tier || rank) && ` / ${t.marketValueRankLabel}: ${tier || rank}`}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="print-td print-td-section">{t.businessReportSkillRadar}（{t.printReportSubtitle}）</td>
                    </tr>
                    {scores && RADAR_KEYS.map((key) => (
                      <tr key={key}>
                        <td className="print-td print-td-label">{t.businessRadarLabels[RADAR_KEYS.indexOf(key)]} {scores[key]}（{scoreToLabel(scores[key], t)}）</td>
                        <td className="print-td print-td-findings">{getScoreFindings(key, { summaryStrengths: summaryStrengths || "", summaryMarketValue: summaryMarketValue || "", summaryOutlook: summaryOutlook || "", tierFeedback: tierFeedback || "", result: result || "" }).split("\n").map((line, i) => <span key={i}>{line}<br /></span>)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={2} className="print-td print-td-section">{t.summaryLabelStrengths}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="print-td">{summaryStrengths || "—"}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="print-td print-td-section">{t.summaryLabelMarketValue}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="print-td">{summaryMarketValue || "—"} {t.printMarketValueBasisSuffix}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="print-td print-td-section">{t.summaryLabelOutlook}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="print-td">{summaryOutlook || "—"}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="print-td print-td-section">{t.printRiskReductionTitle}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="print-td">{t.printRiskReductionText}</td>
                    </tr>
                    {githubStats && (
                      <>
                        <tr>
                          <td colSpan={2} className="print-td print-td-section">{t.printGitHubStatsTitle}</td>
                        </tr>
                        <tr>
                          <td className="print-td print-td-label">{t.printStatsRepos}</td>
                          <td className="print-td">{githubStats.publicRepos}</td>
                        </tr>
                        <tr>
                          <td className="print-td print-td-label">{t.printStatsStars}</td>
                          <td className="print-td">{githubStats.totalStars}</td>
                        </tr>
                        <tr>
                          <td className="print-td print-td-label">{t.printStatsStarRate}</td>
                          <td className="print-td">{(githubStats.totalStars / Math.max(1, githubStats.publicRepos)).toFixed(1)}</td>
                        </tr>
                        <tr>
                          <td className="print-td print-td-label">{t.printStatsLanguages}</td>
                          <td className="print-td">{githubStats.topLanguages.join(", ") || "—"}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
                <div className="print-signature">{t.printSignature}</div>
                <div className="print-footer-fixed">
                  <span className="print-stamp">{t.printStampText}</span>
                  <div className="print-qr-section">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=56x56&data=${encodeURIComponent(contactFullUrl)}`} alt="QR" width={56} height={56} />
                    <span className="print-qr-guidance">{t.printQrGuidance}</span>
                  </div>
                </div>
              </div>
            )}

            {limitExceededOpen && (
              <div className="modal-lock-overlay limit-modal-premium" role="dialog" aria-modal="true" aria-labelledby="limit-modal-title">
                <div className="absolute inset-0" onClick={() => setLimitExceededOpen(false)} aria-hidden />
                <div className="relative z-10 flex w-full flex-shrink-0 flex-grow-0 flex-col items-center justify-center px-6 py-6 text-center">
                  <div className="limit-modal-card w-full max-w-md space-y-6 rounded-3xl border border-amber-500/20 bg-[#0a0a0c]/98 p-8 shadow-2xl backdrop-blur-xl sm:space-y-8 sm:p-10">
                    <div className="space-y-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-400/90">
                        {t.limitInvitationLabel}
                      </p>
                      <h2 id="limit-modal-title" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        {t.limitExceededTitle}
                      </h2>
                      <p className="text-left text-base leading-relaxed text-zinc-400 sm:text-center">
                        {t.limitExceededMessage}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            const count = parseInt(localStorage.getItem("ai-recruiter-usage") ?? "0", 10);
                            const next = Math.max(0, count - 1);
                            localStorage.setItem("ai-recruiter-usage", String(next));
                            setUsageCount(next);
                          } catch {}
                          const shareText = locale === "ja" ? "GitHub技術資産をAIで鑑定できるサービスを使いました。 #GitHub鑑定" : "I got my GitHub technical assets certified by AI. #GitHubCertification";
                          const url = typeof window !== "undefined" ? window.location.origin : "https://ai-recruiter-4o7e.vercel.app";
                          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
                          setLimitExceededOpen(false);
                        }}
                        className="flex w-full min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1da1f2] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#1a91da] active:scale-[0.99] sm:min-h-[52px]"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        {t.limitExceededCtaShare}
                      </button>
                      <Link
                        href={contactFormUrl}
                        className="limit-modal-geekly-cta golden-vip-button flex w-full min-h-12 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white transition hover:scale-[1.01] active:scale-[0.99] sm:min-h-[52px]"
                      >
                        {t.limitExceededCtaBusiness}
                        <span className="text-lg">→</span>
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLimitExceededOpen(false)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-zinc-500 transition hover:bg-white/10 hover:text-zinc-300"
                    >
                      {t.contactClose}
                    </button>
                  </div>
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

          </section>
        )}

        {/* スマホ: 結果画面でシェアボタンを画面下部に固定（モーダル中は非表示） */}
        {mode === "personal" && result && !limitExceededOpen && (
          <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:hidden">
            <button
              type="button"
              onClick={handleShareBrag}
              className="flex w-full max-w-xl min-h-14 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-indigo-600 py-4 text-base font-bold text-white shadow-[0_0_24px_rgba(217,119,6,0.4)] transition-all active:scale-[0.98]"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              {t.shareBragCta}
            </button>
          </div>
        )}

        <footer className="mt-16 pb-12 text-center sm:pb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
            <span className="text-[11px] font-medium text-zinc-500">{t.securityBadge}</span>
          </div>
          <p className="mt-6 text-[10px] leading-relaxed text-zinc-500 max-w-xl mx-auto">
            {t.footerTrust}
            <span className="block mt-1 text-zinc-600">{t.footerTrustEn}</span>
          </p>
          <div className="footer-legal mt-8 pt-6 border-t border-white/[0.06]">
            <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-zinc-500">
              <Link href="/terms" className="underline-offset-2 hover:text-zinc-400 hover:underline">
                {locale === "ja" ? "利用規約" : "Terms of Use"}
              </Link>
              <span className="text-white/20">|</span>
              <Link href="/privacy" className="underline-offset-2 hover:text-zinc-400 hover:underline">
                {locale === "ja" ? "プライバシーポリシー" : "Privacy Policy"}
              </Link>
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
