export const metadata = {
  title: "特定商取引法に基づく表記 | エンジニア採用AI技術アセスメント",
  description: "特定商取引法に基づく表記",
};

export default function TokushohoPage() {
  return (
    <main className="relative min-h-screen bg-[#08080a] px-4 py-16 text-zinc-300">
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="text-xl font-bold text-white">
          特定商取引法に基づく表記
        </h1>

        <section className="space-y-3 text-sm leading-relaxed">
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
            <span className="w-32 shrink-0 text-zinc-400">販売業者</span>
            <p className="flex-1 text-zinc-100">山口 和真</p>
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
            <span className="w-32 shrink-0 text-zinc-400">運営責任者</span>
            <p className="flex-1 text-zinc-100">山口 和真</p>
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
            <span className="w-32 shrink-0 text-zinc-400">所在地</span>
            <p className="flex-1 text-zinc-100">
              〒454-0042 愛知県名古屋市中川区応仁町2丁目8番地カルム応仁202
            </p>
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
            <span className="w-32 shrink-0 text-zinc-400">メールアドレス</span>
            <p className="flex-1 text-zinc-100 break-all">
              kazuyama0917@gmail.com
            </p>
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:gap-4 pt-3">
            <span className="w-32 shrink-0 text-zinc-400">販売価格</span>
            <p className="flex-1 text-zinc-100">19,800円（税込）/ 月</p>
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
            <span className="w-32 shrink-0 text-zinc-400">
              商品代金以外の必要料金
            </span>
            <p className="flex-1 text-zinc-100">なし</p>
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
            <span className="w-32 shrink-0 text-zinc-400">引き渡し時期</span>
            <p className="flex-1 text-zinc-100">決済完了後、即時</p>
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
            <span className="w-32 shrink-0 text-zinc-400">お支払方法</span>
            <p className="flex-1 text-zinc-100">クレジットカード（Stripe）</p>
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:gap-4 pt-3">
            <span className="w-32 shrink-0 text-zinc-400">
              返品・交換・キャンセル
            </span>
            <p className="flex-1 text-zinc-100">
              デジタルコンテンツの特性上、返品・返金は受け付けておりません。
              解約はいつでもマイページから可能です。
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

