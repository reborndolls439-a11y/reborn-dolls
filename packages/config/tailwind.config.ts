import type { Config } from "tailwindcss";

const config: Partial<Config> = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Primary: Teal #2FE6DE ────────────────────────────────────────────
        "bloom-rose": {
          DEFAULT: "#2FE6DE",
          50:  "#f0fdfc",
          100: "#ccfaf8",
          200: "#99f4f1",
          300: "#5dece8",
          400: "#2FE6DE",
          500: "#18cec6",
          600: "#11a9a2",
          700: "#118580",
          800: "#136a66",
          900: "#145855",
          950: "#062e2c",
        },
        // ─── Secondary: Deep Navy #02182B ─────────────────────────────────────
        "soft-blush": {
          DEFAULT: "#e8f1f8",
          50:  "#f5f9fc",
          100: "#e8f1f8",
          200: "#cce0ef",
        },
        ivory: {
          DEFAULT: "#F7FBFE",
          50:  "#F7FBFE",
          100: "#eef6fc",
        },
        sage: {
          DEFAULT: "#4A8FA3",
          50:  "#f0f8fa",
          100: "#d9eef4",
          200: "#b3ddea",
          300: "#4A8FA3",
          400: "#3a7a8e",
          500: "#2e6273",
          600: "#254e5c",
        },
        charcoal: {
          DEFAULT: "#02182B",
          50:  "#f2f6f9",
          100: "#dce8f0",
          200: "#b9d1e2",
          300: "#84afc8",
          400: "#4d87a8",
          500: "#2d6a8e",
          600: "#1e5275",
          700: "#143d58",
          800: "#0b2a3f",
          900: "#02182B",
        },
        taupe: {
          DEFAULT: "#5a7a8a",
          50:  "#f3f7f9",
          100: "#e3ecf0",
          200: "#c8dae2",
          300: "#9bbcca",
          400: "#6f9aac",
          500: "#5a7a8a",
          600: "#486374",
          700: "#3c515f",
        },
      },
      fontFamily: {
        heading: ["Playfair Display", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["4.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["3rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "display-sm": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        "soft":       "0 2px 15px rgba(47, 230, 222, 0.12)",
        "card":       "0 1px 3px rgba(2,24,43,0.06), 0 8px 24px rgba(2,24,43,0.04)",
        "card-hover": "0 4px 12px rgba(2,24,43,0.10), 0 16px 40px rgba(2,24,43,0.07)",
        "elevated":   "0 8px 32px rgba(2,24,43,0.16)",
      },
      animation: {
        "fade-in":  "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "skeleton": "skeleton 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:    { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp:   { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideDown: { "0%": { opacity: "0", transform: "translateY(-8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        scaleIn:   { "0%": { opacity: "0", transform: "scale(0.95)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        skeleton:  { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.4" } },
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #e8f1f8 0%, #F7FBFE 50%, #f0f8fa 100%)",
        "gradient-hero":  "linear-gradient(160deg, #f0fdfc 0%, #F7FBFE 40%, #f0f8fa 100%)",
        "gradient-cta":   "linear-gradient(135deg, #2FE6DE 0%, #18cec6 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
