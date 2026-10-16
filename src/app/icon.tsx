import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "#0A0A0F",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#D4AF37",
          borderRadius: "50%",
          border: "2px solid #D4AF37",
          fontFamily: "serif",
          fontWeight: 900,
        }}
      >
        ⚡
      </div>
    ),
    {
      ...size,
    }
  );
}
