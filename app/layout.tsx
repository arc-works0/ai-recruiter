import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import HeaderButtons from "./HeaderButtons";

// 画像指定は意図的になし（𝕏の古いキャッシュ画像表示を防ぎ、ユーザーは保存画像を自分で添付）
export const metadata: Metadata = {
  metadataBase: new URL("https://ai-recruiter-4o7e.vercel.app"),
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