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
        // Cyber Slate & Titanium Accent Tokens for dark mode consistency
        titanium: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        cyber: {
          canvas: "#090D16",
          card: "#111827",
          border: "#1F2937",
        }
      },
      fontFamily: {
        sans: [
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Inter',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
        mono: [
          'SF Mono',
          'Fira Code',
          'JetBrains Mono',
          'Menlo',
          'monospace'
        ],
      },
      letterSpacing: {
        tighter: '-0.04em',
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
