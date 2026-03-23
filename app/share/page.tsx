import type { Metadata } from "next";
import { buildOgImageSearchParams } from "../../lib/shareUrlParams";
import ShareContent from "./ShareContent";

function parseScores(scoresParam: string | null): number[] {
  if (!scoresParam) return [70, 70, 70, 70];
  return scoresParam.split(",").map((s) => Math.min(100, Math.max(0, parseInt(s.trim(), 10) || 70)));
}

type Props = {
  searchParams: Promise<{
    scores?: string;
    mode?: string;
    s?: string;
    sc?: string;
    t?: string;
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
  const scores = params.scores ?? "70,70,70,70";
  const mode = params.mode ?? "personal";
  const t = params.t ?? "";
  const s = params.s ?? "";
  const sc = params.sc ?? "";

  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://ai-recruiter-4o7e.vercel.app")
  ).replace(/\/$/, "");
  const origin = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;

  const ogParams = new URLSearchParams();
  ogParams.set("scores", scores);
  ogParams.set("mode", mode);
  if (params.v) ogParams.set("v", params.v);
  if (s) ogParams.set("s", s);
  if (sc) ogParams.set("sc", sc);
  if (t) ogParams.set("t", t);

  const ogImageAbsoluteUrl = `${origin}/api/og?${buildOgImageSearchParams({ s, sc, t }).toString()}`;

  const metaTitle = "鑑定結果 | AI市場価値鑑定";
  const metaDesc =
    s || sc
      ? `推定年収（万円単位の数値）とスコアを表示。GitHubからあなたの市場価値を鑑定。`
      : "GitHubに基づくエンジニア市場価値鑑定。技術力・貢献度・継続力・市場性を可視化。";

  return {
    title: metaTitle,
    description: metaDesc,
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      url: `${origin}/share?${ogParams.toString()}`,
      type: "website",
      images: [{ url: ogImageAbsoluteUrl, width: 1200, height: 630, alt: "AI市場価値鑑定ポスター" }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: metaTitle,
      description: metaDesc,
      images: [ogImageAbsoluteUrl],
    },
  };
}

export default async function SharePage({ searchParams }: Props) {
  const params = await searchParams;
  const scores = parseScores(params.scores ?? null);
  const sNum = parseInt(String(params.s ?? "").replace(/\D/g, ""), 10);
  const salaryFromM = !Number.isNaN(sNum) && sNum > 0 ? `${sNum}万円` : "";
  const legacySalary = params.salary ?? "";
  const salaryDisplay = salaryFromM || legacySalary;
  const tier = params.tier ?? "";
  const rank = params.rank ?? "";
  const tierFeedback = params.feedback ?? "";
  const legacyTitle = params.title ?? "";

  return (
    <ShareContent
      scores={scores}
      jobTitle={legacyTitle}
      salaryDisplay={salaryDisplay}
      rank={rank}
      tier={tier}
      tierFeedback={tierFeedback}
    />
  );
}
