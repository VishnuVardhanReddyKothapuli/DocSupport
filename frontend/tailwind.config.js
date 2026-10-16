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
        // Octet AI Chat Palette (https://octet.design/colors/palette/ai-chat-color-palette-1732614389/)
        octet: {
          white: "#fefefe",
          lilac: "#f4eff7",
          rose: "#f3e5ec",
          border: "#d6cdd1",
          muted: "#b2a3a4",
          charcoal: "#565656",
        },
        // Electric Indigo & Cyber Slate Tokens
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Electric Indigo
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        cyber: {
          canvas: "#090D16",
          card: "#111827",
          cardLight: "#FFFFFF",
          border: "#1F2937",
          borderLight: "#E2E8F0",
          text: "#F3F4F6",
          muted: "#9CA3AF"
        }
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(99, 102, 241, 0.25)',
        'glow-md': '0 0 25px rgba(99, 102, 241, 0.35)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.45)',
        'soft-purple': '0 4px 20px rgba(244, 239, 247, 0.8)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}
