import type { Config } from "tailwindcss";

/**
 * TRACE DESIGN SYSTEM
 * ------------------------------------------------------------------
 * Materials, not "dark mode". The base is blackened metal / dark stone,
 * warmed toward brown so it never reads as neutral grey SaaS. Parchment
 * is aged cream rather than white.
 *
 * Signal colours are an *interaction* language and nothing else:
 *   green = open   red = close   blue = search   gold = declassified
 * They are never used decoratively.
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // blackened metal / dark stone — warm, never neutral grey
        ink: {
          950: "#060505",
          900: "#0B0A09",
          880: "#100E0C",
          850: "#15130F",
          800: "#1C1916",
          750: "#241F1A",
          700: "#2E2823",
          600: "#3C352E",
          500: "#4F463C",
          400: "#675B4D",
        },
        // aged paper
        parchment: {
          DEFAULT: "#EDE5D3",
          100: "#F8F3E6",
          200: "#EDE5D3",
          300: "#D8CFBA",
          400: "#B2A794",
          500: "#8A7F6D",
          600: "#655C4E",
          700: "#474036",
        },
        burgundy: {
          DEFAULT: "#6E1F2A",
          light: "#93303F",
          dark: "#4A141D",
        },
        forest: {
          DEFAULT: "#1E3A2C",
          light: "#2E5A44",
        },
        // antique gold — muted, never neon
        brass: {
          DEFAULT: "#B08D4A",
          light: "#D9BC7E",
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
        // wizarding gothic — TRACE wordmark only
        display: ["var(--font-display)", "Georgia", "serif"],
        // old-world serif — case titles, dossier headings
        serif: ["var(--font-serif)", "Georgia", "serif"],
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      // Tracking is deliberately restrained. Anything above `wide` is a
      // special case, not the house style.
      letterSpacing: {
        widest2: "0.16em",
        widest3: "0.24em",
      },
      borderRadius: {
        sharp: "2px",
      },
      boxShadow: {
        // physical shadow for lifted dossier paper, not a neon glow
        vault: "0 40px 120px -40px rgba(0,0,0,0.95), 0 2px 0 0 rgba(237,229,211,0.04) inset",
        lift: "0 26px 60px -28px rgba(0,0,0,0.9), 0 2px 8px -4px rgba(0,0,0,0.7)",
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
