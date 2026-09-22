import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#0b0d10",
          900: "#111418",
          850: "#161a1f",
          800: "#1c2127",
          700: "#262c34",
          600: "#343c46",
        },
        accent: {
          DEFAULT: "#635EF2",
          dark: "#595FD9",
          purple: "#8b5cf6",
          red: "#F25757",
        },
        cream: "#E8E6D2",
        ink: "#262623",
        terracotta: "#D4682B",
        mustard: "#EFE29C",
        olive: "#383510",
        sage: "#A6CBCD",
        dusty: {
          blue: "#475881",
          pink: "#E5BEE3",
        },
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
