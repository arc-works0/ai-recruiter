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
  title: "AI Market Value Assessment",
  description: "Analyze your GitHub and estimate your market value.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ai-recruiter-4o7e.vercel.app",
    siteName: "AI Market Value Assessment",
  },
  twitter: {
    card: "summary",
    title: "AI Market Value Assessment",
    description: "Analyze your GitHub and estimate your market value.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="ja">
        <body className="antialiased bg-[#050505] text-zinc-100">
          <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.06] bg-[#050505]/95 px-4 py-3 backdrop-blur-xl">
            <p className="text-sm font-bold text-amber-400/90">30秒でAI年収査定</p>
            <HeaderButtons />
          </header>
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}