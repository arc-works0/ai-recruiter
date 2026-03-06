import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import HeaderButtons from "./HeaderButtons";

// Xカード表示のため: metadataBase は NEXT_PUBLIC_APP_URL を最優先、OGPは必ず絶対URL
const metadataBase = process.env.NEXT_PUBLIC_APP_URL
  ? new URL(String(process.env.NEXT_PUBLIC_APP_URL).replace(/\/$/, ""))
  : new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
const ogImageUrl = `${metadataBase.origin}/api/og`;

export const metadata: Metadata = {
  metadataBase,
  title: "AI市場価値鑑定 | GitHubからあなたの市場価値を可視化",
  description: "GitHubデータに基づき、エンジニアの市場価値を鑑定。推定年収・格付け・スキルレーダーを1枚の鑑定書で。",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: metadataBase.origin,
    siteName: "AI市場価値鑑定",
    images: [{ url: ogImageUrl, width: 1200, height: 630, alt: "AI市場価値鑑定" }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "AI市場価値鑑定 | GitHubからあなたの市場価値を可視化",
    description: "GitHubデータに基づき、エンジニアの市場価値を鑑定。推定年収・格付け・スキルレーダーを1枚の鑑定書で。",
    images: [ogImageUrl],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="ja">
        <body className="antialiased bg-[#08080a] text-zinc-100">
          <header className="sticky top-0 z-50 flex justify-end border-b border-white/[0.06] bg-[#0a0a0f]/80 px-4 py-3 backdrop-blur-xl">
            <HeaderButtons />
          </header>
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}