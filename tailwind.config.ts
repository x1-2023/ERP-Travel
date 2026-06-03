import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        graphite: {
          950: "#080b0f",
          900: "#10151d",
          850: "#151b24",
          800: "#1c2430",
          700: "#2b3543",
        },
        coach: {
          teal: "#2dd4bf",
          amber: "#f6b450",
          red: "#fb7185",
          green: "#7ddf9a",
        },
      },
      boxShadow: {
        soft: "0 20px 70px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
