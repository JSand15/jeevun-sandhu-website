import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/data/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = siteConfig.name;

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        backgroundColor: "#0a0a0a",
        color: "#fafafa",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          width: 64,
          height: 6,
          backgroundColor: "#3b82f6",
          borderRadius: 3,
          marginBottom: 40,
        }}
      />
      <div
        style={{
          display: "flex",
          fontSize: 76,
          fontWeight: 600,
          letterSpacing: -2,
        }}
      >
        {siteConfig.name}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 24,
          fontSize: 32,
          color: "#a1a1aa",
          maxWidth: 900,
        }}
      >
        {siteConfig.role}
      </div>
    </div>,
    { ...size },
  );
}
