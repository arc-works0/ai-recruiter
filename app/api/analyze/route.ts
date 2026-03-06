import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { githubUrl } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `あなたは年収1000万超えを狙うエンジニア専用の、冷徹でプロフェッショナルな査定エージェントです。
          入力された情報を元に、以下の形式で厳格に鑑定してください。
          
          ### 【鑑定結果】市場価値診断書
          
          1. **想定年収**: 市場価値を1円単位で算出。
          2. **技術力判定**: S〜Dの5段階で厳しく評価。
          3. **キャリアアップ戦略**: 年収をあと300万上げるために、今後3ヶ月で習得すべき3つの具体的技術を提示。
          
          ※Markdownの表や太字を使い、公式な鑑定書のような威厳のある見た目で出力してください。
          ※口調はプロフェッショナルで、根拠に基づいたシビアなものにすること。`,
        },
        {
          role: "user",
          content: `以下の情報を査定せよ: ${githubUrl}`,
        },
      ],
    });

    return NextResponse.json({ result: completion.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: "査定に失敗しました" }, { status: 500 });
  }
}