import { ImageResponse } from "next/og";


export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle at center, #221645 0%, #090514 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "16px solid #c89b3c",
          borderRadius: "24%",
          color: "#c89b3c",
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
