/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        brew: {
          bg: '#0b0d12',
          panel: '#12151c',
          line: '#1f2430',
          accent: '#f5a524',
          accent2: '#7c3aed',
          text: '#e6e8ee',
          muted: '#8a8f9c',
          success: '#22c55e',
          error: '#ef4444',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(245,165,36,.25), 0 8px 40px -10px rgba(245,165,36,.45)',
      },
    },
  },
  plugins: [],
}
