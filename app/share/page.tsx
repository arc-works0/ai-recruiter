import type { Metadata } from "next";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{
    scores?: string;
    mode?: string;
    s?: string;
    sc?: string;
    v?: string;
    title?: string;
    salary?: string;
    rank?: string;
    tier?: string;
    feedback?: string;
  }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  await searchParams;

  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://ai-recruiter-4o7e.vercel.app")
  ).replace(/\/$/, "");
  const origin = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;

  const metaTitle = "鑑定結果 | AI市場価値鑑定";
  const metaDesc = "GitHubに基づくエンジニア市場価値鑑定。技術力・貢献度・継続力・市場性を可視化。";

  return {
    title: metaTitle,
    description: metaDesc,
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      url: `${origin}/share`,
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
  await searchParams;
  redirect("/");
}
