import { ImageResponse } from "next/og";

export const runtime = "edge";

const width = 1200;
const height = 630;

const OG_HEADERS = {
  "Cache-Control": "public, no-cache, no-store, must-revalidate, max-age=0",
} as const;

const MAX_LINE = 50;

function stripControl(s: string): string {
  return s.replace(/[\x00-\x1F\x7F]/g, "");
}

/** 取得は常に成功扱い。例外時は "" */
function getParam(sp: URLSearchParams, key: string): string {
  try {
    const v = sp.get(key);
    return typeof v === "string" ? v : "";
  } catch {
    return "";
  }
}

/** salary を「◯◯万円」形式に正規化（短縮は SVG 直前に実施） */
function toManStr(salary: string): string {
  const raw = stripControl(salary).trim();
  if (!raw) return "";
  try {
    const digits = raw.replace(/,/g, "").replace(/[^\d]/g, "");
    const n = parseInt(digits, 10);
    if (isNaN(n)) return raw.slice(0, MAX_LINE);
    const man = raw.includes("万") && n < 10000 ? n : Math.round(n / 10000);
    return `${man}万円`;
  } catch {
    return raw.slice(0, MAX_LINE);
  }
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
        <p
          style={{
            fontSize: 20,
            color: "#a1a1aa",
            margin: "40px 0 0",
            maxWidth: 1100,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
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
    } catch (e) {
      console.error("[api/og] new URL failed", e, request.url);
      return defaultOgResponse();
    }

    const salaryRaw = getParam(searchParams, "salary");
    const titleRaw = getParam(searchParams, "title");
    const rankRaw = getParam(searchParams, "rank") || getParam(searchParams, "tier");

    const salaryLabel = toManStr(salaryRaw);
    const salaryLine = salaryLabel ? salaryLabel.substring(0, MAX_LINE) : "";
    const titleLine = stripControl(titleRaw).replace(/\s+/g, " ").trim().substring(0, MAX_LINE);
    const rankLine = stripControl(rankRaw).replace(/\s+/g, " ").trim().substring(0, MAX_LINE);

    const subtitle =
      titleLine || "GitHubから技術力と自社適性をAIが即座に可視化";

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
          {salaryLine ? (
            <p
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#fbbf24",
                margin: "24px 0 0",
                maxWidth: 1100,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              推定市場価値 {salaryLine}
              {rankLine ? ` (${rankLine})` : ""}
            </p>
          ) : (
            <p style={{ fontSize: 24, fontWeight: 700, color: "#fbbf24", margin: "24px 0 0" }}>
              法人向けプラン受付中
            </p>
          )}
          <p
            style={{
              fontSize: 20,
              color: "#a1a1aa",
              margin: "40px 0 0",
              maxWidth: 1100,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {subtitle}
          </p>
        </div>
      ),
      {
        width,
        height,
        headers: OG_HEADERS,
      }
    );
  } catch (err) {
    console.error("[api/og] ImageResponse failed", err instanceof Error ? err.message : String(err), err);
    if (err instanceof Error && err.stack) {
      console.error("[api/og] stack", err.stack);
    }
    return defaultOgResponse();
  }
}
