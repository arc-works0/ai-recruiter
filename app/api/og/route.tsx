import { ImageResponse } from "next/og";

export const runtime = "edge";

const width = 1200;
const height = 630;

export async function GET() {
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
        <p
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: "rgba(251, 191, 36, 0.95)",
            marginTop: 24,
            textAlign: "center",
          }}
        >
          法人向けプラン提供中
        </p>
        <p
          style={{
            fontSize: 22,
            color: "rgba(161, 161, 170, 0.9)",
            marginTop: 48,
            textAlign: "center",
          }}
        >
          GitHubから技術力と自社適性をAIが即座に可視化
        </p>
      </div>
    ),
    { width, height }
  );
}
