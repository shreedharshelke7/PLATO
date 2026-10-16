import { ImageResponse } from "next/og";


export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle at center, #1b1138 0%, #090514 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "6px solid #c89b3c",
          borderRadius: "24%",
          color: "#c89b3c",
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
