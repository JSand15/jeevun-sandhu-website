// Full-bleed imagery for the premium scroll sections.
// Source: Unsplash (Unsplash License — free for commercial use, no attribution
// required, no watermark). Files are self-hosted under /public/luxury so the
// site has no third-party image dependency at runtime.

export interface LuxuryImage {
  src: string;
  alt: string;
}

export const luxuryImages = {
  skyline: {
    src: "/luxury/skyline-dusk.jpg",
    alt: "Manhattan skyline at dusk seen across the East River",
  },
  manhattan: {
    src: "/luxury/manhattan-gold.jpg",
    alt: "Midtown Manhattan avenues lit by low golden sunlight",
  },
  aerial: {
    src: "/luxury/aerial-city.jpg",
    alt: "Aerial view of a dense downtown skyline meeting the water",
  },
  watch: {
    src: "/luxury/watch.jpg",
    alt: "Close-up of a steel chronograph watch",
  },
  supercar: {
    src: "/luxury/supercar.jpg",
    alt: "Dark sports car moving at speed on an open highway",
  },
  flight: {
    src: "/luxury/flight.jpg",
    alt: "Aircraft wing above a cloud layer at sunset",
  },
  texture: {
    src: "/luxury/dark-texture.jpg",
    alt: "",
  },
  penthouse: {
    src: "/luxury/penthouse.jpg",
    alt: "Minimal modern living room with floor-to-ceiling glass",
  },
} satisfies Record<string, LuxuryImage>;
