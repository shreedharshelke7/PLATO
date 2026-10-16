import { ImageResponse } from "next/og";


export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle at center, #1A1A24 0%, #0A0A0F 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "16px solid #D4AF37",
          borderRadius: "24%",
          color: "#D4AF37",
        }}
      >
        <div style={{ fontSize: 240 }}>⚡</div>
        <div
          style={{
            fontSize: 56,
            fontFamily: "serif",
            fontWeight: "bold",
            letterSpacing: 10,
            marginTop: 10,
          }}
        >
          AMBROSIA
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  );
}
