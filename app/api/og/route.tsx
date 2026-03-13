import { ImageResponse } from "next/og";

export const runtime = "edge";

const width = 1200;
const height = 630;

/** salary を「◯◯万円」形式に正規化 */
function toManStr(salary: string | null): string {
  if (!salary?.trim()) return "";
  const digits = salary.replace(/,/g, "").replace(/[^\d]/g, "");
  const n = parseInt(digits, 10);
  if (isNaN(n)) return salary;
  const man = salary.includes("万") && n < 10000 ? n : Math.round(n / 10000);
  return `${man}万円`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const salary = searchParams.get("salary") ?? "";
  const title = searchParams.get("title") ?? "";
  const rank = searchParams.get("rank") ?? searchParams.get("tier") ?? "";
  const salaryLabel = toManStr(salary);

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
          background: "linear-gradient(180deg, #0a0a0c 0%, #050505 50%, #0a0a0c 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 80% 50% at 50% 30%, rgba(217, 119, 6, 0.12) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />
        <p
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "#fff",
            margin: 0,
            textAlign: "center",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          エンジニア採用AI査定
        </p>
        {salaryLabel ? (
          <div
            style={{
              marginTop: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px 36px",
              borderRadius: 12,
              border: "2px solid rgba(251, 191, 36, 0.7)",
              background: "linear-gradient(135deg, rgba(217, 119, 6, 0.35) 0%, rgba(251, 191, 36, 0.2) 100%)",
              boxShadow: "0 0 24px rgba(217, 119, 6, 0.25)",
            }}
          >
            <span
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "rgba(251, 191, 36, 1)",
                letterSpacing: "0.05em",
              }}
            >
              推定市場価値 {salaryLabel}
              {rank ? ` (${rank})` : ""}
            </span>
          </div>
        ) : (
          <div
            style={{
              marginTop: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 28px",
              borderRadius: 12,
              border: "2px solid rgba(251, 191, 36, 0.7)",
              background: "linear-gradient(135deg, rgba(217, 119, 6, 0.35) 0%, rgba(251, 191, 36, 0.2) 100%)",
              boxShadow: "0 0 24px rgba(217, 119, 6, 0.25)",
            }}
          >
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "rgba(251, 191, 36, 1)",
                letterSpacing: "0.05em",
              }}
            >
              法人向けプラン受付中
            </span>
          </div>
        )}
        <p
          style={{
            fontSize: 22,
            color: "rgba(161, 161, 170, 0.9)",
            marginTop: 48,
            textAlign: "center",
          }}
        >
          {title || "GitHubから技術力と自社適性をAIが即座に可視化"}
        </p>
      </div>
    ),
    { width, height }
  );
}
