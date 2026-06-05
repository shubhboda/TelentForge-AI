import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "hsl(var(--bg))",
        fg: "hsl(var(--fg))",
        card: "hsl(var(--card))",
        border: "hsl(var(--border))",
        accent: "hsl(var(--accent))",
        brand: {
          50: "#eefbf6",
          100: "#d4f6e5",
          200: "#a9ecd0",
          300: "#78dcb6",
          400: "#42c08d",
          500: "#16996d",
          600: "#127a59",
          700: "#125f48",
          800: "#114c3b",
          900: "#103e31"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(22,153,109,0.18), 0 24px 80px rgba(16,62,49,0.22)"
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at top left, rgba(22,153,109,0.20), transparent 35%), radial-gradient(circle at top right, rgba(245,158,11,0.16), transparent 30%), linear-gradient(180deg, rgba(5,15,12,1), rgba(9,19,16,1))"
      }
    }
  },
  plugins: []
} satisfies Config;
