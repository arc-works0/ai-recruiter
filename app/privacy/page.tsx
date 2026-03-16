export const metadata = {
  title: "プライバシーポリシー | エンジニア採用AI技術アセスメント",
  description: "プライバシーポリシー",
};

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen bg-[#08080a] px-4 py-16 text-zinc-300">
      <div className="mx-auto max-w-2xl space-y-8">
        <header>
          <h1 className="text-xl font-bold text-white">プライバシーポリシー</h1>
          <p className="mt-4 text-xs text-zinc-400">
            「AI市場価値鑑定」（以下「本サービス」といいます。）は、利用者のプライバシーを尊重し、個人情報および各種データの適切な保護と管理を重要な責務と考えています。本プライバシーポリシー（以下「本ポリシー」といいます。）は、本サービスにおける情報の取扱いについて定めるものです。
          </p>
        </header>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-white">
            第1条（適用範囲）
          </h2>
          <p>
            本ポリシーは、本サービスの提供に関連して当社が取得・利用する利用者に関する情報（個人情報保護法上の「個人情報」およびそれ以外のデータを含みます。）の取扱いに適用されます。
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-white">
            第2条（取得する情報の種類）
          </h2>
          <p>当社は、本サービスの提供にあたり、主に以下の情報を取得します。</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              1.
              利用登録情報：法人名または屋号、担当者名、メールアドレス、その他申込時にフォームへ入力された情報
            </li>
            <li>
              2.
              GitHub関連情報：利用者が連携を許可したGitHubアカウントに関する公開リポジトリ、コミット履歴、言語構成、コントリビューション状況など、採用アセスメントに必要な範囲の情報
            </li>
            <li>
              3.
              決済関連情報：決済に必要なクレジットカード情報等（ただし、クレジットカード番号等のセンシティブな情報は後記のとおり決済代行事業者が管理し、当社サーバー内には保存しません）
            </li>
            <li>
              4.
              サービス利用状況情報：ログイン履歴、画面閲覧履歴、IPアドレス、ブラウザ情報、Cookie等の技術情報
            </li>
          </ul>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-white">
            第3条（情報の利用目的）
          </h2>
          <p>
            当社は、取得した情報を、以下の目的の範囲内で利用します。以下に定めのない目的で利用する場合は、あらかじめ利用者の同意を得るものとします。
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              1.
              GitHubデータおよび関連技術情報を用いたエンジニア採用アセスメント機能（スコアリング、レポート生成等）の提供
            </li>
            <li>
              2.
              利用者からの問い合わせ対応、サポート対応、運用上必要な連絡の実施
            </li>
            <li>
              3.
              利用料金の請求、決済処理、本人確認等の決済関連業務の遂行
            </li>
            <li>
              4.
              本サービスの品質向上、新機能の開発、利便性向上のための統計的分析（ただし個人が特定されない形で実施します）
            </li>
            <li>
              5.
              不正利用の防止、セキュリティ対策、障害対応等の安全管理措置の実施
            </li>
          </ul>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-white">
            第4条（通信の暗号化とセキュリティ）
          </h2>
          <p className="font-semibold text-amber-300">
            本サービスと利用者のブラウザとの通信は、すべてSSL/TLSによって暗号化され、安全に送受信されます。
          </p>
          <p>
            当社は、不正アクセス、情報の漏えい・改ざん・滅失等を防止するため、適切な技術的・組織的安全管理措置を講じ、情報の安全な管理に努めます。
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-white">
            第5条（決済情報とStripeの利用）
          </h2>
          <p className="font-semibold text-amber-300">
            本サービスのクレジットカード決済は、世界的に信頼性の高い決済プラットフォームである Stripe
            を利用して行われます。
          </p>
          <p>
            1.
            クレジットカード番号、有効期限、セキュリティコード等のセンシティブなカード情報は、Stripeが提供する決済システム上でのみ取り扱われ、当社のサーバーには保存されません。
          </p>
          <p>
            2.
            当社は、Stripeから提供されるトークン化された情報および決済結果情報のみを取得し、利用料金の請求および決済状況の管理の目的で利用します。
          </p>
          <p>
            3.
            Stripeのセキュリティおよびデータ取扱いに関する詳細は、Stripe社が公表するポリシー等をご確認ください。
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-white">
            第6条（第三者提供）
          </h2>
          <p>
            当社は、次の各号に該当する場合を除き、本人の同意なく個人情報を第三者に提供することはありません。
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>1. 法令に基づく場合</li>
            <li>
              2.
              人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき
            </li>
            <li>
              3.
              公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき
            </li>
            <li>
              4.
              国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき
            </li>
            <li>
              5.
              利用目的の達成に必要な範囲で業務委託先に提供する場合（この場合、当社は当該委託先に対して適切な管理・監督を行います）
            </li>
          </ul>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-white">
            第7条（個人情報の開示・訂正・利用停止等）
          </h2>
          <p>
            利用者は、当社が保有する自己の個人情報について、開示・訂正・追加・削除・利用停止等を求めることができます。具体的な手続方法については、本サービスのお問い合わせ窓口までご連絡ください。当社は、法令に基づき適切な範囲で対応します。
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-white">
            第8条（Cookie等の利用）
          </h2>
          <p>
            当社は、本サービスの利便性向上、トラフィック測定、不正アクセス防止等を目的として、Cookieや類似の技術を利用することがあります。これらにより収集される情報には、特定の個人を直接識別する情報は含まれません。
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-white">
            第9条（プライバシーポリシーの変更）
          </h2>
          <p>
            当社は、法令の改正や本サービス内容の変更等に応じて、本ポリシーを適宜見直し、変更することがあります。重要な変更がある場合には、本ウェブサイト上での掲示等によりお知らせします。
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed pb-8">
          <h2 className="text-base font-semibold text-white">第10条（お問い合わせ窓口）</h2>
          <p>本ポリシーおよび個人情報の取扱いに関するお問い合わせは、以下の窓口までご連絡ください。</p>
          <div className="mt-2 space-y-1 text-xs text-zinc-400">
            <p>AI市場価値鑑定 運営窓口</p>
            <p>メールアドレス：kazuyama0917@gmail.com</p>
          </div>
        </section>
      </div>
    </main>
  );
}
