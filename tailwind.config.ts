import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Pulled 1:1 from somosacida.com's own token values (src/styles.css),
        // converted from oklch to sRGB hex so Tailwind's /NN opacity
        // modifiers keep working across the app.
        cream: "#F2ECE0",
        bone: "#E3DBD3",
        ink: "#191919",
        terracotta: "#C4522D",
        mustard: "#DBC772",
        olive: "#333311",
        indigo: "#495A8A",
        blush: "#E2BBBE",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        label: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};
export default config;
