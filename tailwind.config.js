/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#070709',
          900: '#0c0c10',
          850: '#121218',
          800: '#17171f',
          700: '#22222c',
          600: '#2e2e3a',
        },
        rose: {
          soft: '#ff8fb1',
          deep: '#e0436a',
        },
        plum: {
          soft: '#b79cff',
          deep: '#7c53e8',
        },
        ember: '#ff7a59',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,.06), 0 8px 24px -8px rgba(0,0,0,.18)',
        lift: '0 24px 60px -22px rgba(0,0,0,.55)',
        glow: '0 0 0 1px rgba(255,255,255,.06), 0 30px 80px -30px rgba(224,67,106,.55)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(.22,1,.36,1)',
        smooth: 'cubic-bezier(.4,0,.2,1)',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-14px,0)' },
        },
        drift: {
          '0%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(3%,-4%,0) scale(1.08)' },
          '100%': { transform: 'translate3d(0,0,0) scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 7s cubic-bezier(.4,0,.2,1) infinite',
        drift: 'drift 22s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
      },
    },
  },
  plugins: [],
}
