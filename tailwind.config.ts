import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#F97316",
        green: "#22C55E",
        electric: "#14B8A6",
        sky: "#0EA5E9",
        ink: "#111827",
        muted: "#6B7280",
        panel: "#FFFFFF",
        page: "#F7F8FA"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.07)"
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem"
      }
    }
  },
  plugins: []
};

export default config;
