import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#3B82F6", fg: "#0F172A" },
        accent: { lime: "#84CC16" }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        serif: ["Lora", "Georgia", "serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
