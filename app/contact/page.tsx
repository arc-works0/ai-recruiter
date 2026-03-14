"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getLocaleFromBrowser, type Locale } from "../../lib/i18n";

const SHARE_TWEET_JA = "GitHub技術資産をAIで鑑定できるサービスを使いました。 #GitHub鑑定";
const SHARE_TWEET_EN = "I got my GitHub technical assets certified by AI. #GitHubCertification";

export default function ContactPage() {
  const [locale, setLocale] = useState<Locale>("ja");
  useEffect(() => setLocale(getLocaleFromBrowser()), []);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const appUrl = baseUrl || "https://ai-recruiter-4o7e.vercel.app";

  const handleShareForBonus = () => {
    const shareText = locale === "ja" ? SHARE_TWEET_JA : SHARE_TWEET_EN;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(appUrl)}`;
    try {
      const bonus = parseInt(localStorage.getItem("ai-recruiter-share-bonus") ?? "0", 10);
      localStorage.setItem("ai-recruiter-share-bonus", String(Math.max(0, bonus) + 1));
    } catch {}
    window.open(tweetUrl, "_blank", "noopener,noreferrer");
  };

  const t = locale === "ja"
    ? {
        title: "追加鑑定・法人お問い合わせ",
        personalTitle: "個人の方へ：SNSシェアで追加鑑定",
        personalCopy: "X（Twitter）で鑑定結果をシェアしてくれた方は、追加でもう1回無料で鑑定できます。",
        personalCta: "Xでシェアして追加1回無料鑑定",
        businessTitle: "法人・採用担当者様へ：無制限プランのご案内",
        businessCopy: "採用候補者のスキルを客観的に可視化し、面接工数を削減しませんか？ 月額制の無制限鑑定プランをご用意しています。",
        subtitle: "以下のフォームにご記入のうえ、送信内容をメールでお送りください。",
        purposeLabel: "導入目的",
        purposeOptions: ["書類選考の効率化", "既存社員の評価", "その他"] as const,
        companyLabel: "貴社名",
        companyPlaceholder: "株式会社サンプル",
        roleDeptLabel: "役職/部署名",
        roleDeptPlaceholder: "例：人事部 採用担当",
        nameLabel: "お名前",
        namePlaceholder: "山田 太郎",
        emailLabel: "メールアドレス",
        emailPlaceholder: "example@company.co.jp",
        messageLabel: "お問い合わせ内容",
        messagePlaceholder: "ご用件・ご要望をご記入ください。",
        submit: "入力内容を確認して送信する",
        sslNotice: "入力されたデータはSSL暗号化により保護されます",
        copy: "内容をコピー",
        sendMail: "メールで送る",
        contactCta: "お問い合わせ",
        composedTitle: "以下の内容でメールをお送りください",
        composedDesc: "「メールで送る」を押すとメールソフトが開きます。宛先はご自身のメールアドレスをBCCに追加するか、担当者へ転送してください。",
      }
    : {
        title: "Additional certification & business inquiry",
        personalTitle: "For individuals: Share to get +1 free",
        personalCopy: "Share your certification result on X (Twitter) to get 1 additional free certification.",
        personalCta: "Share on X for +1 free certification",
        businessTitle: "For recruiters: Unlimited plan",
        businessCopy: "Objectively visualize candidate skills and reduce interview workload. We offer an unlimited certification plan on a monthly basis.",
        subtitle: "Please fill out the form below and send the content via email.",
        purposeLabel: "Purpose",
        purposeOptions: ["Document screening efficiency", "Existing staff evaluation", "Other"] as const,
        companyLabel: "Company name",
        companyPlaceholder: "Acme Inc.",
        roleDeptLabel: "Title / Department",
        roleDeptPlaceholder: "e.g. HR, Recruitment",
        nameLabel: "Name",
        namePlaceholder: "John Doe",
        emailLabel: "Email",
        emailPlaceholder: "you@company.com",
        messageLabel: "Message",
        messagePlaceholder: "Your inquiry or request.",
        submit: "Review and send",
        sslNotice: "Your entered data is protected by SSL encryption.",
        copy: "Copy to clipboard",
        sendMail: "Send via email",
        contactCta: "Contact",
        composedTitle: "Send the following via email",
        composedDesc: "Click \"Send via email\" to open your mail client. BCC yourself or forward to your contact.",
      };

  const [companyName, setCompanyName] = useState("");
  const [roleDept, setRoleDept] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");
  const [showComposed, setShowComposed] = useState(false);
  const [copied, setCopied] = useState(false);

  const composedText = [
    `【${t.title}】`,
    "",
    ...(t.companyLabel ? [`${t.companyLabel}: ${companyName || "—"}`, ""] : []),
    ...(t.roleDeptLabel ? [`${t.roleDeptLabel}: ${roleDept || "—"}`, ""] : []),
    `${t.nameLabel}: ${name || "—"}`,
    `${t.emailLabel}: ${email || "—"}`,
    ...(t.purposeLabel ? ["", `${t.purposeLabel}: ${purpose || "—"}`] : []),
    "",
    `${t.messageLabel}:`,
    message || "—",
  ].join("\n");

  const subject = locale === "ja" ? `【お問い合わせ】${name || "（お名前未記入）"}` : `[Contact] ${name || "(Name not provided)"}`;
  const mailtoHref = `mailto:${encodeURIComponent(email || "info@example.com")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(composedText)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(composedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08080a] font-sans text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-mesh" aria-hidden />
      <div className="meteors-layer" aria-hidden>
        {[...Array(7)].map((_, i) => (
          <div key={i} className="meteor" />
        ))}
      </div>
      <div className="relative z-10 mx-auto max-w-xl px-4 py-16 sm:py-24 space-y-10">
        <h1 className="text-center text-2xl font-semibold text-white sm:text-3xl">
          {t.title}
        </h1>

        {/* 1. 個人の方へ：Xシェアで追加1回 */}
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
          <Link href="/" className="mt-3 block text-center text-xs text-zinc-500 hover:text-zinc-300">
            {locale === "ja" ? "鑑定ページに戻る" : "Back to certification"}
          </Link>
        </div>

        {/* 2. 法人・採用担当者様へ：無制限プラン＋お問い合わせフォーム */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-xl backdrop-blur-xl">
          <h2 className="text-base font-semibold text-amber-400/90">{t.businessTitle}</h2>
          <p className="mt-2 text-sm text-zinc-300">{t.businessCopy}</p>
          <p className="mt-1 text-xs text-zinc-500">{t.subtitle}</p>

        {!showComposed ? (
          <div className="mt-6">
            <form id="contact-form" onSubmit={(e) => { e.preventDefault(); setShowComposed(true); }} className="space-y-5">
              <div>
                <label htmlFor="contact-company" className="block text-xs font-medium text-zinc-400">
                  {t.companyLabel} <span className="text-rose-400/80">*</span>
                </label>
                <input
                  id="contact-company"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={t.companyPlaceholder}
                  required
                  className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-white placeholder:text-zinc-600 focus:border-white/[0.15] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="contact-role-dept" className="block text-xs font-medium text-zinc-400">
                  {t.roleDeptLabel} <span className="text-rose-400/80">*</span>
                </label>
                <input
                  id="contact-role-dept"
                  type="text"
                  value={roleDept}
                  onChange={(e) => setRoleDept(e.target.value)}
                  placeholder={t.roleDeptPlaceholder}
                  required
                  className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-white placeholder:text-zinc-600 focus:border-white/[0.15] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="contact-name" className="block text-xs font-medium text-zinc-400">
                  {t.nameLabel}
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-white placeholder:text-zinc-600 focus:border-white/[0.15] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-xs font-medium text-zinc-400">
                  {t.emailLabel}
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-white placeholder:text-zinc-600 focus:border-white/[0.15] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="contact-purpose" className="block text-xs font-medium text-zinc-400">
                  {t.purposeLabel}
                </label>
                <select
                  id="contact-purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-white focus:border-white/[0.15] focus:outline-none [&>option]:bg-[#0a0a0c]"
                >
                  <option value="">—</option>
                  {t.purposeOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-xs font-medium text-zinc-400">
                  {t.messageLabel}
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.messagePlaceholder}
                  className="mt-1.5 w-full resize-y rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-white placeholder:text-zinc-600 focus:border-white/[0.15] focus:outline-none"
                />
              </div>
            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 py-3.5 px-8 text-sm font-bold text-black shadow-[0_4px_20px_rgba(251,191,36,0.4)] transition hover:from-amber-400 hover:via-yellow-400 hover:to-amber-300 hover:shadow-[0_6px_24px_rgba(251,191,36,0.5)] active:scale-[0.99]"
              >
                {t.submit}
              </button>
            </div>
            <p className="mt-5 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
              <svg className="h-4 w-4 shrink-0 text-emerald-500/80" aria-hidden fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {t.sslNotice}
            </p>
            </form>
          </div>
        ) : null}
        {showComposed ? (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-white">{t.composedTitle}</h2>
            <p className="mt-2 text-xs text-zinc-500">{t.composedDesc}</p>
            <pre className="mt-6 whitespace-pre-wrap rounded-xl border border-white/[0.06] bg-black/20 p-4 text-sm text-zinc-300">
              {composedText}
            </pre>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-xl border border-white/[0.12] bg-white/[0.06] py-2.5 px-5 text-sm font-medium text-white hover:bg-white/[0.1]"
              >
                {copied ? (locale === "ja" ? "コピーしました" : "Copied") : t.copy}
              </button>
              <a
                href={mailtoHref}
                className="rounded-xl bg-white py-2.5 px-5 text-sm font-semibold text-black hover:bg-zinc-100"
              >
                {t.sendMail}
              </a>
              <button
                type="button"
                onClick={() => setShowComposed(false)}
                className="rounded-xl border border-white/[0.08] py-2.5 px-5 text-sm text-zinc-400 hover:text-white"
              >
                {locale === "ja" ? "編集に戻る" : "Back to edit"}
              </button>
            </div>
          </div>
        ) : null}
        </div>
      </div>
    </main>
  );
}
