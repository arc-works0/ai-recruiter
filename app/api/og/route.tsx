import { ImageResponse } from "next/og";

export const runtime = "edge";

const width = 1200;
const height = 630;

const OG_HEADERS = {
  "Cache-Control": "public, no-cache, no-store, must-revalidate, max-age=0",
} as const;

const FIXED_SUBTITLE = "エンジニア技術鑑定結果";

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
          {FIXED_SUBTITLE}
        </p>
      </div>
    ),
    { width, height, headers: OG_HEADERS }
  );
}

/** new URL(request.url) を使わず query 文字列のみパース */
function parseSearchParamsFromRequestUrl(requestUrl: string): URLSearchParams {
  const qPart = requestUrl.split("?")[1] ?? "";
  const beforeHash = qPart.split("#")[0] ?? "";
  try {
    return new URLSearchParams(beforeHash);
  } catch {
    return new URLSearchParams();
  }
}

export async function GET(request: Request) {
  console.log("Full URL:", request.url);

  try {
    const searchParams = parseSearchParamsFromRequestUrl(request.url);

    const mRaw = searchParams.get("m") ?? "";
    const scRaw = searchParams.get("sc") ?? "";
    const gRaw = (searchParams.get("g") ?? "").trim().slice(0, 1).toUpperCase();

    const m = parseInt(mRaw.replace(/\D/g, ""), 10);
    const sc = parseInt(scRaw.replace(/\D/g, ""), 10);
    const hasM = !Number.isNaN(m) && m > 0 && m < 1_000_000;
    const hasSc = !Number.isNaN(sc) && sc >= 0 && sc <= 100;
    const g = /^[A-E]$/.test(gRaw) ? gRaw : "";

    const salaryLine = hasM ? `推定市場価値 ${m}万円${g ? ` (${g})` : ""}` : "";
    const scoreLine = hasSc ? `鑑定スコア ${sc}` : "";

    if (!hasM && !hasSc) {
      return defaultOgResponse();
    }

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
          {hasM ? (
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
              {salaryLine}
            </p>
          ) : null}
          {hasSc ? (
            <p
              style={{
                fontSize: hasM ? 26 : 32,
                fontWeight: 700,
                color: "#fbbf24",
                margin: hasM ? "16px 0 0" : "24px 0 0",
              }}
            >
              {scoreLine}
            </p>
          ) : null}
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
            {FIXED_SUBTITLE}
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
