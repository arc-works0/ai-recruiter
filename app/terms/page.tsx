export const metadata = {
  title: "利用規約 | エンジニア採用AI技術アセスメント",
  description: "利用規約",
};

export default function TermsPage() {
  return (
    <main className="relative min-h-screen bg-[#08080a] px-4 py-16 text-zinc-300">
      <div className="mx-auto max-w-2xl space-y-8">
        <header>
          <h1 className="text-xl font-bold text-white">利用規約</h1>
          <p className="mt-4 text-xs text-zinc-400">
            本利用規約（以下「本規約」といいます。）は、「AI市場価値鑑定」（以下「本サービス」といいます。）の提供条件および本サービスの利用に関する当社と利用者との間の権利義務関係を定めるものです。
            本サービスをご利用いただく前に、必ず本規約をお読みいただき、同意のうえご利用ください。
          </p>
        </header>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-white">第1条（適用）</h2>
          <p>
            1.
            本規約は、本サービスの利用に関する当社と利用者との間の一切の関係に適用されます。
          </p>
          <p>
            2.
            当社が本サービスに関して本ウェブサイト上に掲載する各種ガイドライン、ポリシー等は、本規約の一部を構成するものとします。
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-white">
            第2条（利用者および契約単位）
          </h2>
          <p>
            1.
            本サービスは、法人または個人事業主（以下総称して「法人等」といいます。）による利用を前提としています。
          </p>
          <p>
            2.
            本サービスの契約は法人等単位で締結され、契約主体は登録時に申請された法人名または屋号とします。
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-white">
            第3条（利用料金および支払方法）
          </h2>
          <p>
            1.
            本サービスの利用料金は、月額19,800円（税込）とし、サブスクリプション形式の継続課金となります。具体的な課金開始日および請求サイクルは、申込時の画面に表示される内容に従うものとします。
          </p>
          <p>
            2.
            利用料金の支払方法は、当社が指定する決済代行サービス「Stripe」を通じたクレジットカード決済のみとします。
          </p>
          <p>
            3.
            利用者は、登録したクレジットカード情報が常に有効かつ有効期限内であることを保証するものとします。
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-white">
            第4条（返金不可についての特約）
          </h2>
          <p className="font-semibold text-amber-300">
            【重要】本サービスはデジタルコンテンツおよびオンライン機能を提供する性質上、決済完了後の返金は、理由の如何を問わず一切受け付けておりません。
          </p>
          <p>
            1.
            利用者は、本サービスの性質および提供形態を十分に理解したうえで申込・決済を行うものとし、決済後に本サービスを利用しなかった場合や期待した結果が得られなかった場合であっても、返金は行われないことに同意するものとします。
          </p>
          <p>
            2.
            利用者は、契約の解約を希望する場合、本サービスが提供するマイページ等の画面から解約手続を行うものとし、解約月の翌請求分から課金停止が適用されます。既に支払われた当月分の利用料金については日割り精算や返金は行いません。
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-white">
            第5条（禁止事項）
          </h2>
          <p>利用者は、本サービスの利用にあたり、以下の行為を行ってはならないものとします。</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              1.
              1つの契約・アカウントを、契約主体を異にする法人・グループ・第三者と共有する行為
            </li>
            <li>
              2.
              本サービスが提供する解析結果・レポート・スコアリング等を、当該利用者の採用活動以外の目的で二次販売・再配布・有償提供する行為
            </li>
            <li>
              3.
              本サービスまたは本サービスで提供されるアルゴリズム・モデル・インターフェースについて、競合サービスの開発・調査等を目的として解析、逆コンパイル、リバースエンジニアリングその他これに類する行為を行うこと
            </li>
            <li>
              4.
              本サービスに関連して知り得た情報を用いて、当社または本サービスと同種・類似のサービスを不正に模倣し、もしくは不正な競業行為を行うこと
            </li>
            <li>
              5.
              法令または公序良俗に違反する行為、またはそれらのおそれのある行為
            </li>
          </ul>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-white">
            第6条（AI解析結果に関する免責）
          </h2>
          <p className="font-semibold text-amber-300">
            【重要】本サービスにおける評価・スコア・コメント等の結果は、AIによる解析およびアルゴリズムに基づく推定であり、その正確性、完全性、有用性、適合性等について、当社は一切の保証を行うものではありません。
          </p>
          <p>
            1.
            利用者は、本サービスが提供する解析結果をあくまで参考情報として利用するものとし、最終的な採用・評価・処遇等の判断は、利用者自身の責任と裁量において行うものとします。
          </p>
          <p>
            2.
            本サービスの解析結果に基づいて利用者が行った採用・不採用その他の意思決定、その結果として発生した損害（逸失利益、紛争、クレーム、評判毀損等を含みますがこれらに限られません。）について、当社は一切の責任を負わないものとします。
          </p>
          <p>
            3.
            GitHub等の外部サービス側の仕様変更、APIの制限、本サービスのアルゴリズムの変更その他の事情により、同一候補者に対する結果が時期により異なる場合がありますが、これに起因して利用者または第三者に生じた損害についても、当社は責任を負わないものとします。
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-white">
            第7条（サービスの変更・中断・終了）
          </h2>
          <p>
            1.
            当社は、事前の予告なく、本サービスの内容の一部または全部を変更・追加・停止することができるものとします。
          </p>
          <p>
            2.
            当社は、システム保守、障害対応、外部サービスの停止、天災地変その他の不可抗力等により、本サービスの提供を一時的に中断・停止することがあります。
          </p>
          <p>
            3.
            前2項に基づく本サービスの変更・中断・終了により利用者に生じた損害について、当社は一切の責任を負わないものとします。
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-base font-semibold text-white">
            第8条（規約の変更）
          </h2>
          <p>
            当社は、必要に応じて、本規約を変更することができるものとします。変更後の本規約は、本ウェブサイト上に掲示した時点から効力を生じるものとし、利用者が本規約変更後に本サービスを利用した場合、当該変更に同意したものとみなします。
          </p>
        </section>

        <section className="space-y-4 text-sm leading-relaxed pb-8">
          <h2 className="text-base font-semibold text-white">
            第9条（準拠法および合意管轄）
          </h2>
          <p>
            1. 本規約の解釈および適用については、日本法を準拠法とします。
          </p>
          <p>
            2.
            本サービスに関連して当社と利用者との間に紛争が生じた場合には、当社の所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </section>
      </div>
    </main>
  );
}
