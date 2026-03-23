import { ImageResponse } from "next/og";

export const runtime = "edge";

const width = 1200;
const height = 630;

const OG_HEADERS = {
  "Cache-Control": "public, no-cache, no-store, must-revalidate, max-age=0",
} as const;

/** salary を「◯◯万円」形式に正規化 */
function toManStr(salary: string | null): string {
  if (!salary?.trim()) return "";
  const digits = salary.replace(/,/g, "").replace(/[^\d]/g, "");
  const n = parseInt(digits, 10);
  if (isNaN(n)) return salary.slice(0, 48);
  const man = salary.includes("万") && n < 10000 ? n : Math.round(n / 10000);
  return `${man}万円`;
}

/** Satori / ImageResponse で落ちる制御文字・過長を除去 */
function safeOgText(s: string, max: number): string {
  const t = s
    .replace(/[\u0000-\u001F\u007F\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!t) return "";
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

function defaultOgResponse() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#050505",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p style={{ fontSize: 48, fontWeight: 800, color: "#fff", margin: 0 }}>
          エンジニア採用AI査定
        </p>
        <p style={{ fontSize: 24, fontWeight: 700, color: "#fbbf24", margin: "24px 0 0" }}>
          法人向けプラン受付中
        </p>
        <p style={{ fontSize: 20, color: "#a1a1aa", margin: "40px 0 0" }}>
          GitHubから技術力と自社適性をAIが即座に可視化
        </p>
      </div>
    ),
    { width, height, headers: OG_HEADERS }
  );
}

export async function GET(request: Request) {
  try {
    let searchParams: URLSearchParams;
    try {
      searchParams = new URL(request.url).searchParams;
    } catch {
      return defaultOgResponse();
    }

    const salaryRaw = searchParams.get("salary") ?? "";
    const titleRaw = searchParams.get("title") ?? "";
    const rankRaw = searchParams.get("rank") ?? searchParams.get("tier") ?? "";

    const salaryLabel = toManStr(salaryRaw);
    const title = safeOgText(titleRaw, 100);
    const rank = safeOgText(rankRaw, 24);

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#050505",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <p style={{ fontSize: 48, fontWeight: 800, color: "#fff", margin: 0 }}>
            エンジニア採用AI査定
          </p>
          {salaryLabel ? (
            <p style={{ fontSize: 32, fontWeight: 700, color: "#fbbf24", margin: "24px 0 0" }}>
              推定市場価値 {salaryLabel}
              {rank ? ` (${rank})` : ""}
            </p>
          ) : (
            <p style={{ fontSize: 24, fontWeight: 700, color: "#fbbf24", margin: "24px 0 0" }}>
              法人向けプラン受付中
            </p>
          )}
          <p style={{ fontSize: 20, color: "#a1a1aa", margin: "40px 0 0" }}>
            {title || "GitHubから技術力と自社適性をAIが即座に可視化"}
          </p>
        </div>
      ),
      {
        width,
        height,
        headers: OG_HEADERS,
      }
    );
  } catch {
    return defaultOgResponse();
  }
}
