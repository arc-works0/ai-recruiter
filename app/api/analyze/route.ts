import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export type SummaryTriple = {
  summaryStrengths: string;
  summaryMarketValue: string;
  summaryOutlook: string;
};

export type BusinessExtra = {
  candidateStrengths: string;
  interviewConcerns: string;
};

const analysisCache = new Map<
  string,
  { result: string; scores: RadarScores; jobTitle: string; salaryDisplay: string; rank: string; tier: string; tierFeedback: string } & SummaryTriple & Partial<BusinessExtra>
>();

function getAnalysisCache(username: string) {
  return analysisCache.get(username) ?? null;
}

function setAnalysisCache(
  username: string,
  data: { result: string; scores: RadarScores; jobTitle: string; salaryDisplay: string; rank: string; tier: string; tierFeedback: string } & SummaryTriple & Partial<BusinessExtra>
) {
  analysisCache.set(username, data);
  if (analysisCache.size > 500) {
    const first = analysisCache.keys().next().value;
    if (first) analysisCache.delete(first);
  }
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h = (h << 5) - h + c;
    h |= 0;
  }
  return Math.abs(h) % 2147483647;
}

function extractUsername(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (!/^https?:\/\/github\.com/i.test(u.origin)) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    return parts[0] || null;
  } catch {
    return null;
  }
}

async function fetchGitHubData(username: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "ai-recruiter-app",
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, { headers, cache: "no-store" }),
    fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`,
      { headers, cache: "no-store" }
    ),
  ]);

  if (!userRes.ok) {
    throw new Error(`GitHubユーザーが見つかりません: ${username}`);
  }

  const user = await userRes.json();
  const repos = reposRes.ok ? await reposRes.json() : [];

  const languages: Record<string, number> = {};
  let totalStars = 0;
  for (const repo of repos) {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
    totalStars += repo.stargazers_count || 0;
  }

  const createdAt = user.created_at ? new Date(user.created_at) : null;
  const accountYears = createdAt
    ? Math.max(0, (Date.now() - createdAt.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 0;

  return {
    name: user.name || username,
    bio: user.bio || "なし",
    followers: user.followers || 0,
    publicRepos: user.public_repos || 0,
    totalStars,
    accountYears: Math.round(accountYears * 10) / 10,
    company: user.company || "不明",
    location: user.location || "不明",
    topLanguages: Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang]) => lang),
    topRepos: repos.slice(0, 5).map((r: { name: string; stargazers_count: number; description?: string; language?: string }) => ({
      name: r.name,
      stars: r.stargazers_count,
      description: r.description || "",
      language: r.language || "不明",
    })),
  };
}

export type RadarScores = {
  technical: number;
  contribution: number;
  sustainability: number;
  market: number;
};

const DEFAULT_SCORES: RadarScores = {
  technical: 70,
  contribution: 70,
  sustainability: 70,
  market: 70,
};

export type CertificationMeta = {
  jobTitle: string;
  salaryDisplay: string;
  rank: string;
  tier: string;
  tierFeedback: string;
};

const VALID_TIERS = ["S+", "S", "A", "B", "C", "D", "E"] as const;

const defaultSummary: SummaryTriple = {
  summaryStrengths: "",
  summaryMarketValue: "",
  summaryOutlook: "",
};

const defaultBusinessExtra: BusinessExtra = {
  candidateStrengths: "",
  interviewConcerns: "",
};

function parseScoresFromContent(content: string): {
  markdown: string;
  scores: RadarScores;
  jobTitle: string;
  salaryDisplay: string;
  rank: string;
  tier: string;
  tierFeedback: string;
} & SummaryTriple & Partial<BusinessExtra> {
  const jsonBlock = content.match(/```json\s*([\s\S]*?)\s*```/);
  const defaultMeta = {
    jobTitle: "フルスタックの設計士",
    salaryDisplay: "—",
    rank: "B",
    tier: "B",
    tierFeedback: "土台は十分。あとは可視化と実績で一段上へ。",
  };
  if (jsonBlock) {
    const markdown = content.replace(/\s*```json[\s\S]*?```\s*$/, "").trim();
    try {
      const parsed = JSON.parse(jsonBlock[1].trim()) as Record<string, unknown>;
      const scores: RadarScores = {
        technical: Math.min(100, Math.max(0, Number(parsed.technical) || DEFAULT_SCORES.technical)),
        contribution: Math.min(100, Math.max(0, Number(parsed.contribution) || DEFAULT_SCORES.contribution)),
        sustainability: Math.min(100, Math.max(0, Number(parsed.sustainability) || DEFAULT_SCORES.sustainability)),
        market: Math.min(100, Math.max(0, Number(parsed.market) || DEFAULT_SCORES.market)),
      };
      const tier =
        typeof parsed.tier === "string" && VALID_TIERS.includes(parsed.tier as (typeof VALID_TIERS)[number])
          ? parsed.tier
          : defaultMeta.tier;
      const summary: SummaryTriple = {
        summaryStrengths: typeof parsed.summaryStrengths === "string" ? parsed.summaryStrengths.trim() : defaultSummary.summaryStrengths,
        summaryMarketValue: typeof parsed.summaryMarketValue === "string" ? parsed.summaryMarketValue.trim() : defaultSummary.summaryMarketValue,
        summaryOutlook: typeof parsed.summaryOutlook === "string" ? parsed.summaryOutlook.trim() : defaultSummary.summaryOutlook,
      };
      const businessExtra: Partial<BusinessExtra> = {
        candidateStrengths: typeof parsed.candidateStrengths === "string" ? parsed.candidateStrengths.trim() : defaultBusinessExtra.candidateStrengths,
        interviewConcerns: typeof parsed.interviewConcerns === "string" ? parsed.interviewConcerns.trim() : defaultBusinessExtra.interviewConcerns,
      };
      return {
        markdown,
        scores,
        jobTitle: typeof parsed.jobTitle === "string" ? parsed.jobTitle : defaultMeta.jobTitle,
        salaryDisplay: typeof parsed.salaryDisplay === "string" ? parsed.salaryDisplay : defaultMeta.salaryDisplay,
        rank: typeof parsed.rank === "string" ? parsed.rank : defaultMeta.rank,
        tier,
        tierFeedback:
          typeof parsed.tierFeedback === "string" && parsed.tierFeedback.trim()
            ? parsed.tierFeedback.trim()
            : defaultMeta.tierFeedback,
        ...summary,
        ...businessExtra,
      };
    } catch {
      return { markdown: content.trim(), scores: DEFAULT_SCORES, ...defaultMeta, ...defaultSummary, ...defaultBusinessExtra };
    }
  }
  return { markdown: content.trim(), scores: DEFAULT_SCORES, ...defaultMeta, ...defaultSummary, ...defaultBusinessExtra };
}

function buildSystemPrompt(locale: "ja" | "en", mode: "personal" | "business"): string {
  const isJa = locale === "ja";
  const isBusiness = mode === "business";
  const jobTitleRule = isBusiness
    ? (isJa
      ? "プロフェッショナルな日本語の称号のみ（例：シニアエンジニア（トップ5％）、フルスタックアーキテクト）。英語禁止。"
      : "Professional title only (e.g. Senior Engineer (Top 5%), Full-stack Architect). No Japanese.")
    : (isJa
      ? "日本人が直感的に凄さを感じる日本語の称号のみ（例：TypeScriptの魔術師、フロントエンドの開拓者、精密な設計士、API職人）。英語は1語も禁止。"
      : "Professional English title only. Use titles like 'Master of TypeScript', 'Frontend Architect', 'Full-stack Specialist' — natural for English-speaking engineers. NO Japanese (no 魔術師, 開拓者, etc).");

  const tonePersonalJa = "【文体】個人モード: 語尾は丁寧に（〜です、〜ます）で統一。遊び心のある称号はそのまま。プロの診断ツールとしての品格を保つ。";
  const toneBusinessJa = "【文体】法人モード: 専門用語を使いつつ、読みやすいビジネス文に。硬すぎる表現は避け、同じサービスのプロ版として個人版とトーンが繋がるように。";
  const tonePersonalEn = "【Tone】Personal mode: Use polite endings. Keep the playful title style. Maintain a professional diagnostic tone.";
  const toneBusinessEn = "【Tone】Business mode: Use professional terms but keep the text readable and approachable. Same service, pro version—not a completely different document.";

  const langBlock = isJa
    ? `【最重要】あなたは日本のIT専門家です。全ての出力（本文・称号・フィードバック・評価ラベル）は自然な日本語のみで行い、英語は1単語も使わないこと。英語の専門用語はカタカナか適切な日本語訳を使用（例：Repository→リポジトリ、Framework→フレームワーク、Full-stack→フルスタック）。\n${isBusiness ? toneBusinessJa : tonePersonalJa}`
    : `You are a global IT expert. Produce ALL results (Job Title, Feedback, markdown body, labels, advice) STRICTLY in professional English. Do NOT use any Japanese. Every single word in jobTitle and tierFeedback must be in English. Avoid Japanese-style titles like 魔術師; use professional English titles instead (e.g. "Master of TypeScript", "Frontend Architect").\n${isBusiness ? toneBusinessEn : tonePersonalEn}`;

  const formatBlock = isJa
    ? (isBusiness
      ? `1) Markdownで、以下のセクションを日本語で記述。意味の通る自然な日本語のみ。採用担当者が面接でそのまま使える情報にする。

- ### 【鑑定結果】技術アセスメント
- **想定年収**: 300万〜1500万円の範囲で1円単位（例：5,200,000円）
- **市場価値ランク**: S+ / S / A / B / C / D / E の7段階と1行の理由

**【この候補者の強み】** 採用・面接でアピールすべき技術的強みを2〜3文で。具体例（言語・リポジトリ・貢献）を含める。

**【面接で深掘りすべき技術的懸念点】** コード品質・経験の偏り・スキルギャップなど、面接で確認すべき点を2〜3文で。

**【技術の深さ】** どの言語・フレームワークをどの程度使いこなしているか。**【保守性・可読性】** 開発頻度・継続性から見える信頼性。**【今後の展望】** 次に学ぶべき技術を具体的に。`
      : `1) Markdownで、以下の3セクションを日本語で記述。意味の通る自然な日本語のみ。直訳や不自然な表現禁止。

- ### 【鑑定結果】市場価値診断書
- **想定年収**: 300万〜1500万円の範囲で1円単位（例：5,200,000円）
- **格付け**: S+ / S / A / B / C / D / E の7段階と1行の理由

**【技術的な強み】** どの言語・フレームワークを、どの程度使いこなしているか。具体例で記述。

**【実務への貢献度】** 開発頻度・継続性から見える、エンジニアとしての信頼性。

**【今後の展望】** 年収・市場価値を上げるために、次に学ぶべき技術を3つ具体的に。`)
    : (isBusiness
      ? `1) Markdown in English. Produce hiring-manager-ready content.

- ### Technical Assessment Report
- **Estimated salary**: 3M–15M JPY, exact figure
- **Market value rank**: S+ / S / A / B / C / D / E with one-line rationale

**【Candidate strengths】** 2–3 sentences on technical strengths to highlight in interview (languages, repos, contributions).

**【Technical concerns to probe in interview】** 2–3 sentences on code quality, experience gaps, or skills to verify.

**【Technical depth】** Languages/frameworks proficiency. **【Maintainability & readability】** Reliability from activity. **【Next steps】** Concrete technologies to learn.`
      : `1) Markdown in English only (tables, bold, formal style). All text must be in professional English. No Japanese.

- ### Certification Report — Market Value Assessment
- **Estimated salary**: 3M–15M JPY, exact figure (e.g. 5,200,000円)
- **Grade**: S+ / S / A / B / C / D / E with one-line rationale

**【Technical strengths】** Which languages and frameworks, and how well they are used. Be specific.

**【Contribution & reliability】** Development frequency and consistency that demonstrate reliability as an engineer.

**【Next steps】** 3 concrete technologies to learn next to increase salary and market value.`);

  const jsonExample = isBusiness
    ? (isJa
      ? `{"technical": 70, "contribution": 65, "sustainability": 75, "market": 70, "jobTitle": "...", "salaryDisplay": "5,200,000円", "rank": "B", "tier": "B", "tierFeedback": "...", "summaryStrengths": "...", "summaryMarketValue": "...", "summaryOutlook": "...", "candidateStrengths": "この候補者の技術的強みを2〜3文で。", "interviewConcerns": "面接で深掘りすべき技術的懸念点を2〜3文で。"}`
      : `{"technical": 70, "contribution": 65, "sustainability": 75, "market": 70, "jobTitle": "...", "salaryDisplay": "5,200,000円", "rank": "B", "tier": "B", "tierFeedback": "...", "summaryStrengths": "...", "summaryMarketValue": "...", "summaryOutlook": "...", "candidateStrengths": "2-3 sentences on candidate strengths.", "interviewConcerns": "2-3 sentences on technical concerns to probe."}`)
    : (isJa
      ? `{"technical": 70, "contribution": 65, "sustainability": 75, "market": 70, "jobTitle": "...", "salaryDisplay": "5,200,000円", "rank": "B", "tier": "B", "tierFeedback": "...", "summaryStrengths": "技術的な強みを1文で要約（例：TypeScriptとReactを軸にフロント開発の実績があります。）", "summaryMarketValue": "市場価値の根拠を1文で（例：継続的なコミットとスター数から、信頼性が評価されています。）", "summaryOutlook": "今後の展望を1文で（例：クラウド・API設計を習得すると年収アップが見込めます。）"}`
      : `{"technical": 70, "contribution": 65, "sustainability": 75, "market": 70, "jobTitle": "...", "salaryDisplay": "5,200,000円", "rank": "B", "tier": "B", "tierFeedback": "...", "summaryStrengths": "One-sentence summary of technical strengths.", "summaryMarketValue": "One-sentence basis for market value.", "summaryOutlook": "One-sentence future outlook."}`);

  return `You are an expert in engineer market value certification. Provide data-driven, credible assessments.

${langBlock}

【STRICT SALARY RULES】
- Estimated annual salary MUST be 3,000,000–15,000,000 JPY. Never overestimate.
- Evaluate: total stars, followers, repo count, account age. Align with Japanese engineer market.
- Examples: repos<5 + stars<10 + followers<20 → 3–5M JPY. stars>100 + followers>200 + quality → 8–12M JPY.

Output format:

${formatBlock}

2) Append exactly one JSON block. jobTitle and tierFeedback: ${isJa ? "必ず日本語のみ。英語禁止。" : "English only."}
${isJa ? "JSONには必ず summaryStrengths, summaryMarketValue, summaryOutlook を1文ずつ含めること（スマホで箇条書き表示する要約用）。" : "Include summaryStrengths, summaryMarketValue, summaryOutlook (one sentence each) for bullet display."}
${isBusiness ? (isJa ? "法人モードでは candidateStrengths（この候補者の強み・2〜3文）と interviewConcerns（面接で深掘りすべき技術的懸念点・2〜3文）を必ず含めること。" : "In business mode include candidateStrengths and interviewConcerns (2-3 sentences each).") : ""}
\`\`\`json
${jsonExample}
\`\`\`
- technical, contribution, sustainability, market: 0–100 integers
- salaryDisplay: salary string (3–15M JPY)
- rank, tier: S+ / S / A / B / C / D / E
- summaryStrengths, summaryMarketValue, summaryOutlook: 各1文の要約（必須）
${isBusiness ? "- candidateStrengths, interviewConcerns: 法人時は必須（各2〜3文）" : ""}`;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* ignore */
  }
  const locale = (body.locale === "en" || body.language === "en" ? "en" : "ja") as "ja" | "en";
  const mode = (body.mode === "business" ? "business" : "personal") as "personal" | "business";
  const err = (ja: string, en: string) => (locale === "ja" ? ja : en);

  if (!OPENAI_API_KEY || OPENAI_API_KEY.trim() === "") {
    console.error("OPENAI_API_KEY is not set");
    return NextResponse.json(
      { error: err("鑑定サービスは現在設定中のためご利用できません。しばらくしてからお試しください。", "Service is currently being configured. Please try again later.") },
      { status: 503 }
    );
  }

  try {
    const githubUrl = typeof body.githubUrl === "string" ? body.githubUrl.trim() : "";

    if (!githubUrl) {
      return NextResponse.json(
        { error: err("GitHubのURLを入力してください", "Please enter a GitHub URL") },
        { status: 400 }
      );
    }

    const username = extractUsername(githubUrl);
    if (!username) {
      return NextResponse.json(
        { error: err("正しいGitHubのURLを入力してください（例: https://github.com/username）", "Please enter a valid GitHub URL (e.g. https://github.com/username)") },
        { status: 400 }
      );
    }

    const githubData = await fetchGitHubData(username);

    const profileSummary = locale === "ja"
      ? `
ユーザー名: ${username}
名前: ${githubData.name}
自己紹介: ${githubData.bio}
フォロワー数: ${githubData.followers}
公開リポジトリ数: ${githubData.publicRepos}
総スター数（対象リポジトリ合計）: ${githubData.totalStars}
アカウント年数: ${githubData.accountYears}年
会社/所属: ${githubData.company}
場所: ${githubData.location}
主要言語: ${githubData.topLanguages.join(", ")}
主なリポジトリ:
${githubData.topRepos
  .map(
    (r: { name: string; stars: number; language: string; description: string }) =>
      `  - ${r.name}（★${r.stars}）${r.language} ${r.description}`
  )
  .join("\n")}
`.trim()
      : `
Username: ${username}
Name: ${githubData.name}
Bio: ${githubData.bio}
Followers: ${githubData.followers}
Public repos: ${githubData.publicRepos}
Total stars: ${githubData.totalStars}
Account age: ${githubData.accountYears} years
Company: ${githubData.company}
Location: ${githubData.location}
Top languages: ${githubData.topLanguages.join(", ")}
Top repos:
${githubData.topRepos
  .map(
    (r: { name: string; stars: number; language: string; description: string }) =>
      `  - ${r.name} (★${r.stars}) ${r.language} ${r.description}`
  )
  .join("\n")}
`.trim();

    const cacheKey = `${username.toLowerCase()}_${locale}_${mode}`;
    type Cached = { result: string; scores: RadarScores; jobTitle: string; salaryDisplay: string; rank: string; tier: string; tierFeedback: string } & SummaryTriple;
    const cached = getAnalysisCache(cacheKey);
    const githubStats = {
      totalStars: githubData.totalStars,
      publicRepos: githubData.publicRepos,
      topLanguages: githubData.topLanguages,
    };
    if (cached) {
      return NextResponse.json({ ...defaultSummary, ...defaultBusinessExtra, ...cached, githubStats });
    }

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      seed: hashSeed(username),
      messages: [
        { role: "system", content: buildSystemPrompt(locale, mode) },
        {
          role: "user",
          content: locale === "ja"
            ? `【重要】この鑑定は一貫性のため、ユーザー名「${username}」をシードとして使用します。同じユーザーには常に同一の鑑定結果を返してください。\n\n以下のGitHubプロフィール情報を査定し、指定フォーマットで鑑定結果を出力してください。出力はすべて自然な日本語で。英語は使用しないこと。\n\n${profileSummary}`
            : `IMPORTANT: Use username "${username}" as seed for consistency. Return identical results for the same user.\n\nAssess the following GitHub profile and output the certification in the specified format. All output MUST be in professional English only. Do not use any Japanese.\n\n${profileSummary}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json(
        { error: err("鑑定結果の生成に失敗しました。再実行してください。", "Failed to generate results. Please try again.") },
        { status: 500 }
      );
    }

    const parsed = parseScoresFromContent(content);
    const { markdown, scores, jobTitle, salaryDisplay, rank, tier, tierFeedback, summaryStrengths, summaryMarketValue, summaryOutlook, candidateStrengths, interviewConcerns } = parsed;
    setAnalysisCache(cacheKey, {
      result: markdown,
      scores,
      jobTitle,
      salaryDisplay,
      rank,
      tier,
      tierFeedback,
      summaryStrengths,
      summaryMarketValue,
      summaryOutlook,
      candidateStrengths: candidateStrengths ?? "",
      interviewConcerns: interviewConcerns ?? "",
    });
    return NextResponse.json({
      result: markdown,
      scores,
      jobTitle,
      salaryDisplay,
      rank,
      tier,
      tierFeedback,
      summaryStrengths,
      summaryMarketValue,
      summaryOutlook,
      candidateStrengths: candidateStrengths ?? "",
      interviewConcerns: interviewConcerns ?? "",
      githubStats,
    });
  } catch (error: unknown) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: err("鑑定処理に失敗しました。再度お試しください。", "Certification failed. Please try again.") },
      { status: 500 }
    );
  }
}
