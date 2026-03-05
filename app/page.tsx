"use client";

import { useCallback, useState } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";

const initialProfile = {
  githubUrl: "https://github.com/example/awesome-engineer",
  technologies: ["TypeScript", "Next.js", "React", "Node.js", "GraphQL", "AWS"],
  salaryRange: "900〜1,100万円",
  motivationScore: 8.4,
  motivationText: "高い（直近6ヶ月で活発にOSS活動・個人開発を継続）",
};

const initialScoutText = `〇〇様

この度は、GitHubでのご活動内容を拝見し、ご連絡させていただきました。
貴殿の継続的なアウトプットとモダンな技術スタックに深く感銘を受けております。

弊社では、プロダクト主導で自律的に開発を推進できるエンジニアの方を探しており、
まさに〇〇様のご経験・スタイルがフィットすると感じております。

ぜひ一度、カジュアルにお話できる機会を頂戴できませんでしょうか。`;

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  accent?: "blue" | "violet" | "emerald";
};

const StatCard = ({
  title,
  value,
  description,
  accent = "blue",
}: StatCardProps) => {
  const accentClass =
    accent === "violet"
      ? "from-violet-500/40 to-fuchsia-500/10 border-violet-400/60 shadow-violet-500/40"
      : accent === "emerald"
      ? "from-emerald-400/40 to-cyan-400/10 border-emerald-400/60 shadow-emerald-500/40"
      : "from-sky-500/40 to-indigo-500/10 border-sky-400/60 shadow-sky-500/40";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br p-[1px] shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.24),transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.9),transparent_60%)] opacity-80" />
      <div
        className={`relative h-full rounded-[22px] border bg-slate-950/70 px-5 py-4 backdrop-blur-xl ${accentClass}`}
      >
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400/90">
            {title}
          </span>
          <p className="text-[22px] font-semibold text-slate-50 tracking-tight">
            {value}
          </p>
          <p className="text-xs text-slate-400/90">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { isSignedIn } = useAuth(); // ログイン状態をチェック
  const [githubUrl, setGithubUrl] = useState(initialProfile.githubUrl);
  const [profile, setProfile] = useState(initialProfile);
  const [scoutText, setScoutText] = useState(initialScoutText);
  const [isLoading, setIsLoading] = useState(false);
  const [isFromAI, setIsFromAI] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = useCallback(async () => {
    const trimmed = githubUrl.trim();
    if (!trimmed) {
      return;
    }
    setIsLoading(true);
    setCopied(false);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl: trimmed }),
      });
      if (!res.ok) {
        // モックAPIのため、ここには通常入らない想定
        return;
      }
      const data = await res.json();
      setProfile({
        githubUrl: trimmed,
        technologies: data.technologies ?? [],
        salaryRange: data.salaryRange ?? "解析不能",
        motivationScore: data.motivationScore ?? 0,
        motivationText: data.motivationText ?? "",
      });
      setScoutText(data.scoutText || "");
      setIsFromAI(true);
    } catch (e) {
      // モック運用ではエラー表示は行わない
    } finally {
      setIsLoading(false);
    }
  }, [githubUrl]);

  const handleCopy = useCallback(() => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(scoutText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [scoutText]);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      {/* 深いネイビーとグラデーションで構成された信頼感のある背景 */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.16),transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,1),transparent_60%)]" />
        <div className="absolute inset-0 bg-[conic-gradient(from_220deg_at_10%_0%,rgba(15,23,42,0.98),rgba(15,23,42,0.96),rgba(15,23,42,0.98),rgba(8,47,73,0.98))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.22),transparent_55%)] mix-blend-screen opacity-70" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-16 md:px-8 md:pt-20">
        {/* ヒーローコピー */}
        <section className="w-full max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-[6px] text-[11px] font-medium text-sky-100 shadow-[0_12px_40px_rgba(56,189,248,0.5)]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_5px_rgba(16,185,129,0.45)]" />
            GitHub ベースのエンジニア診断ダッシュボード
          </div>
          <h1 className="text-[26px] font-semibold tracking-tight text-slate-50 sm:text-[30px] md:text-[34px]">
            あなたのエンジニアとしての価値を、
            <span className="block bg-gradient-to-r from-sky-300 via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
              AIが客観的に証明する
            </span>
          </h1>
          <p className="mt-4 text-[13px] leading-relaxed text-slate-400 sm:text-sm">
            GitHub の活動履歴から技術スタック、OSS への貢献度、市場での需要感、想定年収レンジを横断的に分析。
            タレントレビューや昇給査定、スカウトメッセージの裏付けとなる「エビデンス付きプロファイル」を数分で生成します。
          </p>
        </section>

        {/* 中央配置の診断フォーム */}
        <section className="mt-8 w-full max-w-2xl sm:mt-10">
          <div className="relative overflow-hidden rounded-[28px] border border-sky-500/20 bg-slate-900/60 px-5 py-5 shadow-[0_28px_80px_rgba(15,23,42,0.95)] backdrop-blur-2xl sm:px-8 sm:py-7">
            <div className="pointer-events-none absolute -left-10 -top-24 h-40 w-64 rounded-full bg-[radial-gradient(circle,_rgba(56,189,248,0.7),transparent_60%)] opacity-40 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 bottom-[-60px] h-44 w-64 rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.5),transparent_60%)] opacity-40 blur-3xl" />

            <div className="relative flex flex-col gap-4">
              <div className="space-y-1.5 text-left sm:text-center">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
                  Diagnosis
                </p>
                <p className="text-sm font-medium text-slate-100 sm:text-base">
                  GitHub プロフィールまたは代表的なリポジトリの URL を入力してください
                </p>
              </div>

              <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),transparent_55%)] opacity-0 transition-opacity duration-300 peer-focus-within:opacity-100" />
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="peer w-full rounded-2xl border border-slate-700/70 bg-slate-950/70 px-4 py-3.5 text-sm outline-none transition duration-300 placeholder:text-slate-500 focus:border-sky-300 focus:bg-slate-950/90 focus:shadow-[0_0_0_1px_rgba(191,219,254,0.8),0_0_35px_rgba(56,189,248,0.55)] focus:ring-2 focus:ring-sky-400/70 sm:text-[13px]"
                    placeholder="https://github.com/username or /username/repository"
                  />
                </div>

                {/* ログイン状態によるボタンの切り替え */}
                {!isSignedIn ? (
                  <SignInButton mode="modal">
                    <button className="w-full whitespace-nowrap rounded-2xl bg-gradient-to-r from-slate-100 to-slate-300 px-5 py-3 text-xs font-semibold text-slate-900 shadow-[0_18px_55px_rgba(148,163,184,0.7)] transition hover:translate-y-[1px] hover:shadow-[0_12px_40px_rgba(148,163,184,0.8)] sm:w-auto">
                      ログインして分析を開始
                    </button>
                  </SignInButton>
                ) : (
                  <button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="group flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 px-5 py-3 text-xs font-semibold text-slate-950 shadow-[0_22px_60px_rgba(56,189,248,0.8)] transition hover:translate-y-[1px] hover:shadow-[0_16px_45px_rgba(56,189,248,0.9)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {isLoading && (
                      <span className="inline-block h-3 w-3 animate-spin rounded-full border-[2px] border-slate-900/70 border-t-transparent" />
                    )}
                    {isLoading ? "AI が診断中..." : "AI に診断してもらう"}
                  </button>
                )}
              </div>

              {isFromAI && (
                <p className="text-[11px] text-emerald-300/90">
                  最新の分析結果を反映しました。ダッシュボードとスカウト文は、そのまま決裁資料や候補者連絡にご利用いただけます。
                </p>
              )}
            </div>
          </div>
        </section>

        {/* 分析ダッシュボード（統計カード） */}
        <section className="mt-10 w-full space-y-5 sm:mt-12">
          <div className="flex flex-col items-center gap-1 text-center">
            <h2 className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400/90">
              ANALYTICS DASHBOARD
            </h2>
            <p className="text-sm font-medium text-slate-100 sm:text-[15px]">
              技術スタック・市場レンジ・コミットメントを一画面で把握
            </p>
            <p className="max-w-2xl text-[12px] text-slate-400 sm:text-[13px]">
              候補者レビューや面談前の事前共有にそのまま転記できる粒度で、コアスキルと期待レンジ、継続性を数値化します。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="技術スタック・専門領域"
              value={profile.technologies.slice(0, 3).join(" / ")}
              description="中長期的に扱ってきたコア技術領域を抽出し、スキルポートフォリオの重心を可視化"
            />
            <StatCard
              title="市場レンジの目安"
              value={profile.salaryRange}
              description="責任範囲と技術難易度を踏まえた、日本国内フルタイム想定の年収レンジ"
              accent="emerald"
            />
            <StatCard
              title="コミットメント指標"
              value={`${profile.motivationScore.toFixed(1)}/10`}
              description={
                profile.motivationText ||
                "リポジトリの活動密度や更新リズムから総合的に推定"
              }
              accent="violet"
            />
          </div>
        </section>

        {/* スカウト文エリア */}
        <section className="relative mt-8 w-full overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/80 shadow-[0_24px_80px_rgba(15,23,42,0.98)] backdrop-blur-2xl sm:mt-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.22),transparent_55%)] opacity-75" />
          <div className="relative flex flex-col gap-4 p-6 sm:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-300 uppercase">
                  AI Scout Copy
                </p>
                <p className="mt-1 text-sm font-medium text-slate-50">
                  候補者にそのまま送信できる、トーンの整ったスカウトテンプレート
                </p>
              </div>
              <button
                onClick={handleCopy}
                disabled={!scoutText}
                className="mt-2 inline-flex items-center justify-center rounded-2xl border border-slate-600/80 bg-slate-900/70 px-4 py-2 text-[11px] font-medium text-slate-100 shadow-[0_12px_36px_rgba(15,23,42,0.9)] transition hover:border-sky-400/80 hover:text-sky-100 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0"
              >
                {copied ? "コピーしました" : "スカウト文をコピー"}
              </button>
            </div>

            <div className="rounded-2xl border border-slate-700/80 bg-slate-950/85 p-4 text-xs leading-relaxed text-slate-100/95 shadow-[0_18px_55px_rgba(15,23,42,0.95)] sm:p-5">
              <pre className="whitespace-pre-wrap font-sans text-[12px] tracking-[0.01em]">
                {scoutText || initialScoutText}
              </pre>
            </div>
          </div>
        </section>

        {/* 信頼性を支える分析項目の一覧 */}
        <section className="mt-10 w-full border-t border-slate-800/80 pt-8 sm:mt-14 sm:pt-10">
          <div className="mb-5 flex flex-col items-center gap-1 text-center sm:mb-6">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
              分析項目
            </p>
            <p className="text-sm font-medium text-slate-100 sm:text-[15px]">
              採用・評価の現場でそのまま使える、4つの診断観点
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3 rounded-2xl bg-slate-900/60 p-4">
              <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/15 text-[11px] font-semibold text-sky-300">
                Tech
              </span>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-100">
                  技術スタック
                </p>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  使用言語・フレームワーク・クラウド基盤から、専門領域とスキルポートフォリオの重心を特定。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-slate-900/60 p-4">
              <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-[11px] font-semibold text-emerald-300">
                OSS
              </span>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-100">
                  OSS 貢献度
                </p>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  コミット履歴やイシュー対応状況から、コミュニティ貢献・レビュー文化へのフィット感を評価。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-slate-900/60 p-4">
              <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/15 text-[11px] font-semibold text-indigo-300">
                Demand
              </span>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-100">
                  市場需要
                </p>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  技術トレンドや採用マーケットの動向を踏まえ、現時点での需要度合いと希少性を推定。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-slate-900/60 p-4">
              <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15 text-[11px] font-semibold text-amber-300">
                Value
              </span>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-100">
                  年収推移予測
                </p>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  スキル構成と継続的なアウトプットから、中長期の市場価値レンジの推移イメージを提示。
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
