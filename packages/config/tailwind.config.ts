import type { Config } from "tailwindcss";

const config: Partial<Config> = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        "bloom-rose": {
          DEFAULT: "#C86B7A",
          50: "#fdf2f4",
          100: "#fce7ea",
          200: "#f9d3d8",
          300: "#f4aeb8",
          400: "#ec8090",
          500: "#C86B7A",
          600: "#b54d5e",
          700: "#983d4e",
          800: "#7f3544",
          900: "#6d2f3d",
        },
        "soft-blush": {
          DEFAULT: "#F7E6E8",
          50: "#fdf7f8",
          100: "#F7E6E8",
          200: "#efcdd2",
        },
        ivory: {
          DEFAULT: "#FFFDF9",
          50: "#FFFDF9",
          100: "#fdf8f0",
        },
        sage: {
          DEFAULT: "#8FA99B",
          50: "#f2f6f4",
          100: "#e0ebe5",
          200: "#c2d6cc",
          300: "#8FA99B",
          400: "#6e9082",
          500: "#557669",
          600: "#435e53",
        },
        charcoal: {
          DEFAULT: "#2D2929",
          50: "#f6f5f5",
          100: "#e7e5e5",
          200: "#d2cecd",
          300: "#b0aaa9",
          400: "#867f7d",
          500: "#6b6463",
          600: "#524d4c",
          700: "#433f3e",
          800: "#3a3636",
          900: "#2D2929",
        },
        taupe: {
          DEFAULT: "#8A7D76",
          50: "#f5f3f2",
          100: "#e8e4e2",
          200: "#d3cbc7",
          300: "#b8aca6",
          400: "#9d8f87",
          500: "#8A7D76",
          600: "#72655e",
          700: "#5e534d",
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
        "soft": "0 2px 15px rgba(200, 107, 122, 0.08)",
        "card": "0 1px 3px rgba(45,41,41,0.06), 0 8px 24px rgba(45,41,41,0.04)",
        "card-hover": "0 4px 12px rgba(45,41,41,0.08), 0 16px 40px rgba(45,41,41,0.06)",
        "elevated": "0 8px 32px rgba(45,41,41,0.12)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "skeleton": "skeleton 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        skeleton: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #F7E6E8 0%, #FFFDF9 50%, #f2f6f4 100%)",
        "gradient-hero": "linear-gradient(160deg, #fdf2f4 0%, #FFFDF9 40%, #f2f6f4 100%)",
        "gradient-cta": "linear-gradient(135deg, #C86B7A 0%, #b54d5e 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
