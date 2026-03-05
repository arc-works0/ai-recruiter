import { NextResponse } from "next/server";

type AnalyzeResponseBody = {
  technologies: string[];
  salaryRange: string;
  motivationScore: number;
  motivationText: string;
  scoutText: string;
  technicalScore: number;
  organizationalContribution: string;
  sustainabilityScore: number;
  sustainabilityText: string;
};

const MOCK_RESPONSE: AnalyzeResponseBody = {
  technologies: ["Next.js", "TypeScript", "AWS"],
  salaryRange: "1,200〜1,500万円",
  motivationScore: 9.1,
  motivationText:
    "リポジトリの更新頻度と継続的なアウトプットから、高いコミットメントが継続している状態と推定。",
  scoutText: `〇〇様

GitHub 上でのご活動内容を拝見し、技術的な深さと継続的な貢献度の高さに強い関心を持ちご連絡しております。

特に Next.js / TypeScript / AWS を軸としたモダンなアーキテクチャ設計や、レビュー履歴・イシュー運用のスタイルから、
プロダクト視点とチーム視点の双方を意識した開発姿勢がうかがえました。

弊社では、事業インパクトを意識した技術選定や、長期的なプロダクト成長を見据えた改善提案をリードいただけるエンジニアの方を求めております。
〇〇様のご経験は、まさにその要件に高い親和性があると考えております。

まずはカジュアルなお打ち合わせからで構いませんので、
ご興味をお持ちいただけましたら、直近のご状況や今後のご志向も含めてお話しできれば幸いです。`,
  technicalScore: 90,
  organizationalContribution:
    "コードベースへの貢献に加え、レビュー・ディスカッション・イシュー運用を通じて、チーム全体の生産性向上に寄与していると評価できるプロファイル。",
  sustainabilityScore: 9.3,
  sustainabilityText:
    "複数年にわたり安定したペースでアウトプットが継続しており、立ち上がり後も長期的に価値を発揮し続ける人材像と推定。",
};

export async function POST() {
  // リクエスト内容に関わらず、常に同一の解析結果を 200 OK で返却
  return NextResponse.json<AnalyzeResponseBody>(MOCK_RESPONSE, { status: 200 });
}

