import type { Config } from "tailwindcss";
import baseConfig from "@reborn/config/tailwind.config";

const config: Config = {
  ...baseConfig,
  darkMode: "class", // class-based dark mode driven by next-themes
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
} as Config;

export default config;
