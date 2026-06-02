import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        bg: {
          DEFAULT: "#08090a",
          secondary: "#0f1011",
          tertiary: "#1a1b1e",
          elevated: "#141516",
        },
        "text-primary": "#f5f5f5",
        "text-secondary": "#a0a0a0",
        "text-tertiary": "#6b6b6b",
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          hover: "rgba(255, 255, 255, 0.12)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
