import type { Metadata } from "next";
import ShareContent from "./ShareContent";
import { scoreToTier } from "../../lib/tiers";

const DEFAULT_SCORE = 40;
const MIN_SCORE = 0;
const MAX_SCORE = 100;
const MIN_SALARY_MAN = 300;
const MAX_SALARY_MAN = 3000;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function parseScore(sc: string | undefined): number {
  const raw = String(sc ?? "").trim();
  if (!/^\d+$/.test(raw)) return DEFAULT_SCORE;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) return DEFAULT_SCORE;
  return clamp(n, MIN_SCORE, MAX_SCORE);
}

function deriveScoresFromSc(score: number, salaryMan: number): number[] {
  const seed = (score * 97 + salaryMan * 13) % 17;
  const deltas = [2, -1, 1, -2].map((base, i) => base + (((seed + i * 3) % 3) - 1));
  return deltas.map((d) => clamp(score + d, MIN_SCORE, MAX_SCORE));
}

function parseScores(scoresParam: string | undefined, fallback: number, salaryMan: number): number[] {
  if (!scoresParam) return deriveScoresFromSc(fallback, salaryMan);
  const raw = scoresParam.split(",");
  if (raw.length !== 4) return deriveScoresFromSc(fallback, salaryMan);
  const parts: number[] = [];
  for (const s of raw) {
    const t = s.trim();
    if (!/^\d+$/.test(t)) return deriveScoresFromSc(fallback, salaryMan);
    const n = parseInt(t, 10);
    if (Number.isNaN(n)) return deriveScoresFromSc(fallback, salaryMan);
    parts.push(clamp(n, MIN_SCORE, MAX_SCORE));
  }
  return parts;
}

function parseSalaryMan(s: string | undefined): number {
  const raw = String(s ?? "").trim();
  if (!/^\d+$/.test(raw)) return 300;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) return 300;
  return clamp(n, MIN_SALARY_MAN, MAX_SALARY_MAN);
}

type Props = {
  searchParams: Promise<{
    scores?: string;
    mode?: string;
    s?: string;
    sc?: string;
    f?: string;
    v?: string;
    title?: string;
    salary?: string;
    rank?: string;
    tier?: string;
    feedback?: string;
  }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;

  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://ai-recruiter-4o7e.vercel.app")
  ).replace(/\/$/, "");
  const origin = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;

  const metaTitle = "鑑定結果 | AI市場価値鑑定";
  const metaDesc = "GitHubに基づくエンジニア市場価値鑑定。技術力・貢献度・継続力・市場性を可視化。";

  const s = params.s ?? "";
  const sc = params.sc ?? "";
  const shareParams = new URLSearchParams();
  if (s) shareParams.set("s", s);
  if (sc) shareParams.set("sc", sc);
  shareParams.set("f", "1");

  return {
    title: metaTitle,
    description: metaDesc,
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      url: `${origin}/share?${shareParams.toString()}`,
      type: "website",
      images: [
        {
          url: "https://ai-recruiter-pearl.vercel.app/og-image.png",
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      images: ["https://ai-recruiter-pearl.vercel.app/og-image.png"],
    },
  };
}

export default async function SharePage({ searchParams }: Props) {
  const params = await searchParams;
  const score = parseScore(params.sc);
  const salaryMan = parseSalaryMan(params.s);
  const scores = parseScores(params.scores, score, salaryMan);
  const salaryDisplay = `${salaryMan}万円`;
  const tier = scoreToTier(score);
  const rank = "";
  const tierFeedback = params.feedback ?? "";
  const jobTitle = params.title ?? "";

  return (
    <ShareContent
      scores={scores}
      jobTitle={jobTitle}
      salaryDisplay={salaryDisplay}
      rank={rank}
      tier={tier}
      tierFeedback={tierFeedback}
    />
  );
}
