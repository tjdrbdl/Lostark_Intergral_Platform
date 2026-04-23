import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 로스트아크 브랜드 컬러
        lostark: {
          gold: "#C8AA6E",
          dark: "#0A0E14",
          navy: "#1A2233",
          panel: "#1E2A3B",
          border: "#2E3D52",
        },
      },
    },
  },
  plugins: [],
};
export default config;
