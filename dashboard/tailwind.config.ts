import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f3efe6",
        card: "#fffdf8",
        ink: "#1c1915",
        muted: "#6f675c",
        line: "#e4dccf",
        pine: "#1e4d3a",
        moss: "#e7f2ec",
        clay: "#8c3b24",
        claybg: "#f8ebe4",
        amber: "#8a5a12",
        sand: "#f7f1e6",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(28,25,21,0.04), 0 16px 40px rgba(28,25,21,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
