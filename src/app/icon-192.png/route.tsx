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
          border: "6px solid #D4AF37",
          borderRadius: "24%",
          color: "#D4AF37",
        }}
      >
        <div style={{ fontSize: 90 }}>⚡</div>
        <div
          style={{
            fontSize: 22,
            fontFamily: "serif",
            fontWeight: "bold",
            letterSpacing: 4,
            marginTop: 4,
          }}
        >
          PLATO
        </div>
      </div>
    ),
    {
      width: 192,
      height: 192,
    }
  );
}
