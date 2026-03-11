import Link from "next/link";

export const metadata = {
  title: "利用規約 | エンジニア採用AI技術アセスメント",
  description: "利用規約",
};

export default function TermsPage() {
  return (
    <main className="relative min-h-screen bg-[#08080a] px-4 py-16 text-zinc-300">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-xl font-bold text-white">利用規約</h1>
        <p className="mt-4 text-sm">
          本ページは準備中です。利用規約は改めて公開いたします。
        </p>
        <Link href="/" className="mt-8 inline-block text-sm font-medium text-amber-400 hover:text-amber-300">
          ← トップへ戻る
        </Link>
      </div>
    </main>
  );
}
