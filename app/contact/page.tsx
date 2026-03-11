"use client";

import { useState } from "react";
import Link from "next/link";
import { getLocaleFromBrowser, type Locale } from "../../lib/i18n";
import { useEffect } from "react";

export default function ContactPage() {
  const [locale, setLocale] = useState<Locale>("ja");
  useEffect(() => setLocale(getLocaleFromBrowser()), []);

  const t = locale === "ja"
    ? {
        title: "【法人様専用】無料トライアル・導入相談窓口",
        subtitle: "大規模利用・API連携・導入相談は以下のフォームにご記入のうえ、送信内容をメールでお送りください。",
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
        submit: "無料で法人トライアルを申し込む",
        sslNotice: "送信されたデータはSSLで暗号化され、安全に保護されます",
        copy: "内容をコピー",
        sendMail: "メールで送る",
        back: "トップへ戻る",
        composedTitle: "以下の内容でメールをお送りください",
        composedDesc: "「メールで送る」を押すとメールソフトが開きます。宛先はご自身のメールアドレスをBCCに追加するか、担当者へ転送してください。",
      }
    : {
        title: "[For Business] Free trial & consultation",
        subtitle: "For enterprise, API, or bulk use, please fill out the form and send the content via email.",
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
        submit: "Apply for free business trial",
        sslNotice: "Your data is encrypted with SSL and protected securely",
        copy: "Copy to clipboard",
        sendMail: "Send via email",
        back: "Back to top",
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
      <div className="relative z-10 mx-auto max-w-xl px-4 py-16 sm:py-24">
        <h1 className="text-center text-2xl font-semibold text-white sm:text-3xl">
          {t.title}
        </h1>
        <p className="mt-3 text-center text-sm text-zinc-500">
          {t.subtitle}
        </p>

        {!showComposed ? (
          <div className="mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-xl backdrop-blur-xl sm:p-8">
            <form onSubmit={(e) => { e.preventDefault(); setShowComposed(true); }} className="space-y-5">
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
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 py-3.5 px-8 text-sm font-bold text-black shadow-[0_4px_20px_rgba(251,191,36,0.4)] transition hover:from-amber-400 hover:via-yellow-400 hover:to-amber-300 hover:shadow-[0_6px_24px_rgba(251,191,36,0.5)] active:scale-[0.99]"
              >
                {t.submit}
              </button>
              <Link
                href="/"
                className="rounded-xl border border-white/[0.12] bg-white/[0.04] py-3 px-6 text-center text-sm font-medium text-white transition hover:bg-white/[0.08]"
              >
                {t.back}
              </Link>
            </div>
            <p className="mt-5 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
              <svg className="h-4 w-4 shrink-0 text-emerald-500/80" aria-hidden fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {t.sslNotice}
            </p>
            </form>
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-xl backdrop-blur-xl sm:p-8">
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
            <div className="mt-6">
              <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
                ← {t.back}
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
