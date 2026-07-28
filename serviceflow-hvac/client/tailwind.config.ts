import type { Config } from "tailwindcss";

// Brand palette: warm charcoal ink + clay (vivid terracotta) accent.
// Deliberately away from the generic "blue SaaS" look -- warm neutrals throughout.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f6f5f3",
          100: "#e8e5e0",
          200: "#d1cbc0",
          300: "#aca192",
          400: "#7d7266",
          500: "#5c5347",
          600: "#423b32",
          700: "#2e2924",
          800: "#1f1b17",
          900: "#14110e",
        },
        clay: {
          50: "#fdf0ec",
          100: "#fad9cd",
          200: "#f4b39b",
          300: "#ec8763",
          400: "#e2633a",
          500: "#c94a22",
          600: "#a13a19",
          700: "#7a2c14",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(20 17 14 / 0.06), 0 1px 3px 0 rgb(20 17 14 / 0.08)",
        "card-hover": "0 8px 24px -6px rgb(20 17 14 / 0.14), 0 2px 8px -2px rgb(20 17 14 / 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
