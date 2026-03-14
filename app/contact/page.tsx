"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getLocaleFromBrowser, type Locale } from "../../lib/i18n";

const SHARE_TWEET_JA = "GitHub技術資産をAIで鑑定できるサービスを使いました。 #GitHub鑑定";
const SHARE_TWEET_EN = "I got my GitHub technical assets certified by AI. #GitHubCertification";

const STRIPE_CHECKOUT_URL = process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL || "#";

export default function PlanPage() {
  const [locale, setLocale] = useState<Locale>("ja");
  useEffect(() => setLocale(getLocaleFromBrowser()), []);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const appUrl = baseUrl || "https://ai-recruiter-4o7e.vercel.app";

  const handleShareForBonus = () => {
    try {
      const count = parseInt(localStorage.getItem("ai-recruiter-usage") ?? "0", 10);
      const next = Math.max(0, count - 1);
      localStorage.setItem("ai-recruiter-usage", String(next));
    } catch {}
    const shareText = locale === "ja" ? SHARE_TWEET_JA : SHARE_TWEET_EN;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(appUrl)}`;
    window.open(tweetUrl, "_blank", "noopener,noreferrer");
  };

  const t = locale === "ja"
    ? {
        title: "プラン選択",
        personalTitle: "個人の方へ：Xシェアで追加1回",
        personalCopy: "X（Twitter）で鑑定結果をシェアしてくれた方は、鑑定回数が1回回復します。",
        personalCta: "Xでシェアして回数を回復",
        businessTitle: "法人向け無制限プラン",
        businessPrice: "月額19,800円（税別）",
        businessCopy: "採用候補者のスキルを客観的に可視化し、面接工数を削減。月額制で無制限に鑑定できます。",
        businessCta: "Stripeで今すぐ申し込む",
        backToCert: "鑑定ページに戻る",
      }
    : {
        title: "Plan Selection",
        personalTitle: "For individuals: Share to get +1",
        personalCopy: "Share your result on X (Twitter) to restore 1 certification count.",
        personalCta: "Share on X to restore count",
        businessTitle: "Unlimited Plan for Business",
        businessPrice: "¥19,800/month (excl. tax)",
        businessCopy: "Objectively visualize candidate skills and reduce interview workload. Unlimited certifications per month.",
        businessCta: "Subscribe via Stripe",
        backToCert: "Back to certification",
      };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08080a] font-sans text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-mesh" aria-hidden />
      <div className="meteors-layer" aria-hidden>
        {[...Array(7)].map((_, i) => (
          <div key={i} className="meteor" />
        ))}
      </div>
      <div className="relative z-10 mx-auto max-w-xl px-4 py-16 sm:py-24 space-y-8">
        <h1 className="text-center text-2xl font-semibold text-white sm:text-3xl">
          {t.title}
        </h1>

        {/* 1. 個人：Xシェアで回数回復 */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-xl backdrop-blur-xl">
          <h2 className="text-base font-semibold text-amber-400/90">{t.personalTitle}</h2>
          <p className="mt-2 text-sm text-zinc-300">{t.personalCopy}</p>
          <button
            type="button"
            onClick={handleShareForBonus}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1da1f2] py-3.5 px-6 text-sm font-bold text-white transition hover:bg-[#1a91da] active:scale-[0.99]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            {t.personalCta}
          </button>
        </div>

        {/* 2. 法人向け無制限プラン（メインカード） */}
        <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-transparent p-8 shadow-xl backdrop-blur-xl">
          <div className="text-center">
            <h2 className="text-xl font-bold text-amber-400/95 sm:text-2xl">{t.businessTitle}</h2>
            <p className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">{t.businessPrice}</p>
            <p className="mt-4 text-sm text-zinc-300">{t.businessCopy}</p>
            <Link
              href={STRIPE_CHECKOUT_URL}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 py-4 px-8 text-base font-bold text-black shadow-[0_4px_24px_rgba(251,191,36,0.4)] transition hover:from-amber-400 hover:via-yellow-400 hover:to-amber-300 hover:shadow-[0_6px_28px_rgba(251,191,36,0.5)] active:scale-[0.99]"
            >
              {t.businessCta}
            </Link>
          </div>
        </div>

        <Link href="/" className="block text-center text-sm text-zinc-500 hover:text-zinc-300">
          {t.backToCert}
        </Link>
      </div>
    </main>
  );
}
