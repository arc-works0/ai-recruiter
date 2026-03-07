import { ImageResponse } from "next/og";

export const runtime = "edge";

function parseScores(scoresParam: string | null): number[] {
  if (!scoresParam) return [70, 70, 70, 70];
  const parts = scoresParam.split(",").map((s) => parseInt(s.trim(), 10));
  return [
    Math.min(100, Math.max(0, parts[0] ?? 70)),
    Math.min(100, Math.max(0, parts[1] ?? 70)),
    Math.min(100, Math.max(0, parts[2] ?? 70)),
    Math.min(100, Math.max(0, parts[3] ?? 70)),
  ];
}

function decode(s: string | null): string {
  if (!s) return "";
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

const TIER_LABELS: Record<string, string> = {
  "S+": "Divine",
  S: "Top",
  A: "Upper",
  B: "Mid",
  C: "Growing",
  D: "Developing",
  E: "Entry",
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scores = parseScores(searchParams.get("scores"));
    const title = searchParams.get("title");
    const salary = searchParams.get("salary");
    const rank = searchParams.get("rank");
    const tier = searchParams.get("tier");
    const mode = searchParams.get("mode") || "personal";

    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / 4);
    const tierLabel = (tier && TIER_LABELS[tier]) || "Mid";

    const isBusiness = mode === "business";

    if (isBusiness) {
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
              background: "#f1f5f9",
              fontFamily: "sans-serif",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: "#64748b", marginBottom: 8 }}>
              ENGINEER SKILL REPORT
            </div>
            {title ? <div style={{ fontSize: 28, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>{decode(title)}</div> : null}
            {salary ? <div style={{ fontSize: 24, fontWeight: 800, color: "#1d4ed8", marginBottom: 16 }}>{decode(salary)}</div> : null}
            <div style={{ display: "flex", flexDirection: "row", gap: 24 }}>
              {scores.map((s, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", background: "#e2e8f0", color: "#1e293b", fontSize: 18, fontWeight: 700 }}>
                    {s}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#64748b", marginTop: 16 }}>Total Score {avg}/100</div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
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
              background: "#08080a",
              fontFamily: "sans-serif",
            }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "#a1a1aa", marginBottom: 12 }}>
            AI MARKET VALUE ASSESSMENT
          </div>
          <div style={{ display: "flex", flexDirection: "row", gap: 48, marginBottom: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 24, background: "#27272a" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", marginBottom: 8 }}>ESTIMATED ANNUAL SALARY</div>
              <div style={{ fontSize: 40, fontWeight: 900, color: "#fff" }}>{salary ? decode(salary) : "—"}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 24, background: "#3b82f6" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)", marginBottom: 8 }}>SCOUTER RANK</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#fff" }}>{tier ? decode(tier) : rank ? decode(rank) : "—"} {tierLabel}</div>
            </div>
          </div>
          {title ? <div style={{ fontSize: 22, fontWeight: 700, color: "#c4b5fd", marginBottom: 8 }}>{decode(title)}</div> : null}
          <div style={{ fontSize: 14, fontWeight: 600, color: "#71717a" }}>
            Total Score {avg}/100 · GitHub-based assessment
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch {
    return new ImageResponse(
      (
        <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "white",
              fontFamily: "sans-serif",
            }}
        >
          <span style={{ fontSize: 64, fontWeight: "bold", color: "red" }}>ERROR</span>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
