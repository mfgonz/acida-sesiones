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
        cream: "#F1E8E5",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};
export default config;
