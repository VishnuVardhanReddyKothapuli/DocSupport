/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Apple-inspired Editorial & Product Palette
        apple: {
          canvas: "#FBFBFD",
          surface: "#F5F5F7",
          card: "#FFFFFF",
          border: "#D2D2D7",
          borderSubtle: "#E5E5EA",
          textPrimary: "#1D1D1F",
          textSecondary: "#6E6E73",
          textTertiary: "#86868B",
          blue: "#0071E3",
          blueHover: "#0077ED",
          darkCanvas: "#000000",
          darkSurface: "#161617",
          darkCard: "#1D1D1F",
          darkBorder: "rgba(255, 255, 255, 0.12)",
          darkTextPrimary: "#F5F5F7",
          darkTextSecondary: "#A1A1A6",
        },
      },
      fontFamily: {
        sans: [
          'SF Pro Display',
          'SF Pro Text',
          '-apple-system',
          'BlinkMacSystemFont',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
        mono: [
          'SF Mono',
          'SFMono-Regular',
          'ui-monospace',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace'
        ],
      },
      letterSpacing: {
        tighter: '-0.035em',
        tight: '-0.02em',
        normal: '0',
        wide: '0.02em',
      },
      boxShadow: {
        'subtle': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'elevated': '0 12px 32px rgba(0, 0, 0, 0.06)',
        'dark-elevated': '0 12px 32px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
