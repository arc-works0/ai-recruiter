import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import HeaderButtons from "./HeaderButtons";

// openGraph.images / twitter.images は一切指定しない（𝕏の古いキャッシュ画像を出さない）
export const metadata: Metadata = {
  metadataBase: new URL("https://ai-recruiter-4o7e.vercel.app"),
  verification: {
    other: {
      "impact-site-verification": "97613a4f-e37a-499c-9cc0-0cb18e20695b",
    },
  },
  title: "AI市場価値鑑定 | AI Market Value Certification",
  description: "GitHubからエンジニアの市場価値をAIが高精度に鑑定。技術力・継続力・市場性を4軸で可視化するハイエンド診断ツールです。",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://ai-recruiter-4o7e.vercel.app",
    siteName: "AI市場価値鑑定｜AI Market Value Certification",
  },
  twitter: {
    card: "summary",
    title: "AI市場価値鑑定 | AI Market Value Certification",
    description: "GitHubからエンジニアの市場価値をAIが高精度に鑑定するハイエンド診断ツール。",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="ja">
        <body className="antialiased bg-[#050505] text-zinc-100">
          <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.06] bg-[#050505]/95 px-3 py-2.5 sm:px-4 sm:py-3 backdrop-blur-xl">
            <p className="text-xs sm:text-sm font-bold text-amber-400/90 tracking-wide">30秒でAI年収査定</p>
            <HeaderButtons />
          </header>
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}