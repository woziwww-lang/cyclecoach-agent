import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#FC4C02",
        ink: "#111827",
        muted: "#6B7280",
        panel: "#FFFFFF",
        page: "#F7F8FA"
      },
      boxShadow: {
        soft: "0 8px 30px rgba(17, 24, 39, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
