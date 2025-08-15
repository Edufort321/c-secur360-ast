import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'slideDown': 'slideDown 0.3s ease-out',
        'fadeIn': 'fadeIn 0.5s ease-out',
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      colors: {
        'ast-blue': '#3498db',
        'ast-green': '#27ae60',
        'ast-red': '#e74c3c',
        'ast-yellow': '#f39c12',
        'ast-purple': '#9b59b6',
        'chart-line': 'var(--color-chart-line)',
        'chart-electrique': 'var(--color-chart-electrique)',
        'chart-chute': 'var(--color-chart-chute)',
        'chart-equipement': 'var(--color-chart-equipement)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
