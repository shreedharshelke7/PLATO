import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 80,
          background: "radial-gradient(circle at center, #1A1A24 0%, #0A0A0F 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#D4AF37",
          border: "4px solid #D4AF37",
          borderRadius: "28%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          ⚡
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
