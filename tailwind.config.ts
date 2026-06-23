/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          // Accent
          'xing-green': '#DEFF9A',
          'xing-green-2': '#B8E97A',
          'xing-red': '#FF5C5C',
          'xing-yellow': '#FFD166',

          // Backgrounds
          'xing-bg': '#050605',
          'xing-panel': '#0A0A0B',
          'xing-card': 'rgba(255,255,255,0.045)',
          'xing-card-hover': 'rgba(255,255,255,0.075)',
          'xing-card-active': 'rgba(222,255,154,0.085)',

          // Input fields
          'xing-input': 'rgba(255,255,255,0.045)',
          'xing-input-hover': 'rgba(255,255,255,0.060)',
          'xing-input-focus': 'rgba(255,255,255,0.070)',

          // Borders
          'xing-border': 'rgba(255,255,255,0.10)',
          'xing-border-subtle': 'rgba(255,255,255,0.06)',
          'xing-border-hover': 'rgba(255,255,255,0.18)',
          'xing-border-active': 'rgba(222,255,154,0.58)',

          // Text
          'xing-text': '#F5F5F2',
          'xing-text-2': 'rgba(245,245,242,0.70)',
          'xing-text-3': 'rgba(245,245,242,0.46)',
          'xing-text-disabled': 'rgba(245,245,242,0.25)',
        },
        fontFamily: {
          sans: ['Inter', 'Space Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
          mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        },
      },
    },
    plugins: [],
  }