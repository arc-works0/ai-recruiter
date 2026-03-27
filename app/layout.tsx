import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
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
            <p className="text-xs sm:text-sm font-bold text-amber-400/90 tracking-wide">エンジニア採用AI技術アセスメント</p>
            <HeaderButtons />
          </header>
          <main>{children}</main>
          <footer className="border-t border-white/[0.06] bg-[#050505] px-4 py-6 text-xs text-zinc-400">
            <div className="mx-auto max-w-4xl">
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <p className="text-[11px] sm:text-xs">
                  &copy; {new Date().getFullYear()} AI市場価値鑑定. All rights reserved.
                </p>
                <nav className="flex flex-wrap gap-4">
                  <Link
                    href="/privacy"
                    className="transition-colors hover:text-zinc-200"
                  >
                    プライバシーポリシー
                  </Link>
                  <Link
                    href="/terms"
                    className="transition-colors hover:text-zinc-200"
                  >
                    利用規約
                  </Link>
                  <Link
                    href="/tokushoho"
                    className="transition-colors hover:text-zinc-200"
                  >
                    特定商取引法に基づく表記
                  </Link>
                </nav>
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-zinc-500">
                当サイトは各転職エージェントの公式サービスではありません。推定年収はAIによる独自の算出結果であり、実際のオファー額を保証するものではありません。詳細な求人情報は各提携先サービスにてご確認ください。
              </p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}