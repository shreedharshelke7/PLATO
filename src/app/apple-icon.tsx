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
          background: "radial-gradient(circle at center, #1a1033 0%, #090514 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#c89b3c",
          border: "4px solid #c89b3c",
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
