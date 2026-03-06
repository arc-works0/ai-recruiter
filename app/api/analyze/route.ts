import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function extractUsername(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    return parts[0] || null;
  } catch {
    return null;
  }
}

async function fetchGitHubData(username: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, { headers }),
    fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, { headers }),
  ]);

  if (!userRes.ok) throw new Error(`GitHubユーザーが見つかりません: ${username}`);

  const user = await userRes.json();
  const repos = reposRes.ok ? await reposRes.json() : [];

  const languages: Record<string, number> = {};
  for (const repo of repos) {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  }

  return {
    name: user.name || username,
    bio: user.bio || "なし",
    followers: user.followers,
    publicRepos: user.public_repos,
    company: user.company || "不明",
    location: user.location || "不明",
    topLanguages: Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang]) => lang),
    topRepos: repos.slice(0, 5).map((r: any) => ({
      name: r.name,
      stars: r.stargazers_count,
      description: r.description || "",
      language: r.language || "不明",
    })),
  };
}

export async function POST(req: NextRequest) {
  try {
    const { githubUrl } = await req.json();

    if (!githubUrl) {
      return NextResponse.json({ error: "GitHubのURLを入力してください" }, { status: 400 });
    }

    const username = extractUsername(githubUrl);
    if (!username) {
      return NextResponse.json({ error: "正しいGitHub URLを入力してください" }, { status: 400 });
    }

    const githubData = await fetchGitHubData(username);

    const profileSummary = `
ユーザー名: ${username}
名前: ${githubData.name}
自己紹介: ${githubData.bio}
フォロワー数: ${githubData.followers}
公開リポジトリ数: ${githubData.publicRepos}
会社/所属: ${githubData.company}
場所: ${githubData.location}
主要言語: ${githubData.topLanguages.join(", ")}
主なリポジトリ:
${githubData.topRepos.map((r: {name: string; stars: number; language: string; description: string}) => `  - ${r.name}（★${r.stars}）${r.language} ${r.description}`).join("\n")}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "あなたはエンジニア専用の冷徹でプロフェッショナルな査定エージェントです。GitHubプロフィール情報を元に、想定年収を1円単位で算出し、技術力をS〜Dの5段階で評価し、年収を300万上げるために今後3ヶ月で習得すべき3つの技術を提示してください。Markdownの表や太字を使い、公式な鑑定書のような見た目で出力してください。",
        },
        {
          role: "user",
          content: `以下のGitHubプロフィール情報を査定してください:\n\n${profileSummary}`,
        },
      ],
    });

    return NextResponse.json({ result: completion.choices[0].message.content });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "査定に失敗しました" },
      { status: 500 }
    );
  }
}