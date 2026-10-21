/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        match: "rgb(var(--color-match) / <alpha-value>)",
        gap: "rgb(var(--color-gap) / <alpha-value>)",
        score: "rgb(var(--color-score) / <alpha-value>)",
        slate: "rgb(var(--color-slate) / <alpha-value>)",
      },
      fontFamily: {
        mono: ["IBM Plex Mono", "monospace"],
        sans: ["IBM Plex Sans", "sans-serif"],
      },
      fontSize: {
        xs: ["0.8125rem", { lineHeight: "1.25rem" }],
        sm: ["0.9375rem", { lineHeight: "1.5rem" }],
      },
    },
  },
  plugins: [],
};
