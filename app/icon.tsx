import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0c 0%, #1a1a1e 100%)",
          borderRadius: 6,
          border: "1px solid rgba(217, 119, 6, 0.4)",
          fontSize: 18,
          fontWeight: 800,
          color: "rgba(251, 191, 36, 0.95)",
        }}
      >
        AI
      </div>
    ),
    { ...size }
  );
}
