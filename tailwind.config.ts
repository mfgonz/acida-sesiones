import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Pulled 1:1 from somosacida.com's own token values (src/styles.css),
        // sourced from the September 2026 brand manual (Morimori).
        cream: "#F7F7EF",
        bone: "#EBE9D8",
        ink: "#2B2B27",
        terracotta: "#DD7130",
        mustard: "#F5EFA7",
        olive: "#403F0E",
        indigo: "#4E628D",
        blush: "#EAC5E6",
        celeste: "#AED2D3",
      },
      fontFamily: {
        // Apfel Grotezk serves both display and body copy; labels/tags/micro
        // text use IBM Plex Mono, always uppercase with wide tracking.
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-display)", "sans-serif"],
        label: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        // Brand labels (IBM Plex Mono, uppercase) track at 0.08em.
        wide: "0.08em",
      },
      borderRadius: {
        // Sharp corners everywhere by brand mandate — fields, cards, photos,
        // inputs. The few 6px exceptions (buttons, tags) are set explicitly
        // with rounded-[6px] rather than through the scale.
        none: "0px",
        sm: "0px",
        DEFAULT: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
        "3xl": "0px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
export default config;
