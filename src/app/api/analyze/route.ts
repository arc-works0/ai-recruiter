import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "nodejs";

type AnalyzeRequestBody = {
  githubUrl?: string;
};

type AnalyzeResponseBody = {
  technologies: string[];
  salaryRange: string;
  motivationScore: number;
  motivationText: string;
  scoutText: string;
};

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as AnalyzeRequestBody;
    const githubUrl = body.githubUrl?.trim();

    if (!githubUrl) {
      return NextResponse.json(
        { error: "githubUrl is required." },
        { status: 400 },
      );
    }

    const prompt = `
あなたは日本のエンジニア採用担当向けのAIアシスタントです。
以下のGitHubリポジトリURLから想定されるエンジニアのプロファイルを推定し、
必ずJSONのみで返してください（説明文は一切不要）。

対象のGitHub URL:
${githubUrl}

出力フォーマット（必ずこのキーでJSONオブジェクトとして出力してください）:
{
  "technologies": string[], // コアとなる技術スタック（3〜8個程度）
  "salaryRange": string, // 日本円での年収レンジ（例: "800〜1,000万円"）
  "motivationScore": number, // 1〜10の数値。転職意欲のスコア
  "motivationText": string, // なぜそのスコアになったのかの短い説明（日本語）
  "scoutText": string // 候補者に送るパーソナライズされたスカウト文（日本語、ビジネスメール調）
}

前提:
- 実際のリポジトリ内容にはアクセスできない可能性があるため、URLから推測される一般的な傾向をベースにしてください。
- 技術スタックや年収レンジ、スカウト文は、TypeScript/Next.jsなどモダンWebエンジニアを想定した自然な内容にしてください。
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that only returns valid JSON objects that match the requested schema. Do not include any additional text.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No content returned from OpenAI." },
        { status: 500 },
      );
    }

    const parsed = JSON.parse(content) as AnalyzeResponseBody;

    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze GitHub profile." },
      { status: 500 },
    );
  }
}

