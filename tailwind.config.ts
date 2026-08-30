import type { Config } from "tailwindcss";

/**
 * TRACE DESIGN SYSTEM
 * ------------------------------------------------------------------
 * Surfaces are warm-near-black "Ministry archive" tones.
 * Parchment is the primary foreground (never pure white).
 * Signal colours are restrained and only ever used as *interaction*
 * language: green = open, red = close, blue = search/trace, gold =
 * release/verified.
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#050607",
          900: "#08090A",
          880: "#0A0C0D",
          850: "#0D0F10",
          800: "#111416",
          750: "#15181A",
          700: "#1A1E20",
          600: "#23282B",
          500: "#2E3438",
          400: "#3D4449",
        },
        parchment: {
          DEFAULT: "#E9E3D5",
          100: "#F4F0E6",
          200: "#E9E3D5",
          300: "#CFC8B7",
          400: "#A8A192",
          500: "#7E7869",
          600: "#5C584D",
          700: "#403D35",
        },
        burgundy: {
          DEFAULT: "#7A2231",
          light: "#9E3040",
          dark: "#4E1420",
        },
        forest: {
          DEFAULT: "#1E3A2C",
          light: "#2E5A44",
        },
        brass: {
          DEFAULT: "#B79749",
          light: "#DCC079",
          dark: "#7A6231",
        },
        signal: {
          open: "#5CA97C",
          openGlow: "#8FE8B4",
          close: "#C04736",
          closeGlow: "#F0705A",
          search: "#4C86D8",
          searchGlow: "#8CC3FF",
          gold: "#C6A455",
          goldGlow: "#F0D89A",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      letterSpacing: {
        widest2: "0.28em",
        widest3: "0.42em",
      },
      borderRadius: {
        sharp: "2px",
      },
      boxShadow: {
        vault: "0 40px 120px -40px rgba(0,0,0,0.9)",
        "glow-brass": "0 0 0 1px rgba(183,151,73,0.35), 0 0 40px -12px rgba(183,151,73,0.35)",
        "glow-search": "0 0 0 1px rgba(76,134,216,0.5), 0 0 36px -8px rgba(76,134,216,0.55)",
      },
      transitionTimingFunction: {
        vault: "cubic-bezier(0.16, 1, 0.3, 1)",
        snap: "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      keyframes: {
        "trace-sweep": {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(220%)" },
        },
        "seal-shimmer": {
          "0%, 92%, 100%": { opacity: "0" },
          "95%": { opacity: "0.55" },
          "97%": { opacity: "0.18" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-10%)", opacity: "0" },
          "10%": { opacity: "0.5" },
          "90%": { opacity: "0.5" },
          "100%": { transform: "translateY(110%)", opacity: "0" },
        },
        "stamp-in": {
          "0%": { transform: "scale(1.5) rotate(-16deg)", opacity: "0" },
          "60%": { transform: "scale(0.97) rotate(-11deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(-12deg)", opacity: "1" },
        },
        "flicker-fail": {
          "0%, 100%": { opacity: "1" },
          "20%": { opacity: "0.35" },
          "40%": { opacity: "0.9" },
          "60%": { opacity: "0.45" },
        },
        "hit-glow": {
          "0%": {
            boxShadow: "0 0 0 0 rgba(140,195,255,0)",
            backgroundColor: "rgba(76,134,216,0.55)",
          },
          "35%": {
            boxShadow: "0 0 22px 4px rgba(76,134,216,0.55)",
            backgroundColor: "rgba(76,134,216,0.42)",
          },
          "100%": {
            boxShadow: "0 0 0 0 rgba(76,134,216,0)",
            backgroundColor: "rgba(76,134,216,0.22)",
          },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(0,-8px,0)" },
        },
      },
      animation: {
        "trace-sweep": "trace-sweep 3.6s cubic-bezier(0.4,0,0.2,1) infinite",
        "seal-shimmer": "seal-shimmer 7s ease-in-out infinite",
        "scan-line": "scan-line 5.5s linear infinite",
        "stamp-in": "stamp-in 520ms cubic-bezier(0.16,1,0.3,1) both",
        "flicker-fail": "flicker-fail 340ms ease-in-out",
        "hit-glow": "hit-glow 620ms ease-out",
        drift: "drift 9s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
