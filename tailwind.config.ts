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
        // Couleurs modernes unifiées (alignées avec design-system.css)
        primary: {
          DEFAULT: '#3b82f6',  // Blue-500
          dark: '#1d4ed8',     // Blue-700
          light: '#60a5fa',    // Blue-400
        },
        success: {
          DEFAULT: '#10b981',  // Emerald-500
          dark: '#059669',     // Emerald-600
          light: '#34d399',    // Emerald-400
        },
        warning: {
          DEFAULT: '#f59e0b',  // Amber-500
          dark: '#d97706',     // Amber-600
          light: '#fbbf24',    // Amber-400
        },
        danger: {
          DEFAULT: '#ef4444',  // Red-500
          dark: '#dc2626',     // Red-600
          light: '#f87171',    // Red-400
        },
        info: {
          DEFAULT: '#06b6d4',  // Cyan-500
          dark: '#0891b2',     // Cyan-600
          light: '#22d3ee',    // Cyan-400
        },
        // Couleurs LOTO spécialisées
        loto: {
          available: '#64748b',  // Slate-500
          applied: '#dc2626',    // Red-600
          verified: '#f59e0b',   // Amber-500
          removed: '#10b981',    // Emerald-500
        },
        // Couleurs de risque
        risk: {
          critical: '#7f1d1d',   // Red-900
          high: '#dc2626',       // Red-600
          medium: '#ea580c',     // Orange-600
          low: '#ca8a04',        // Yellow-600
          minimal: '#15803d',    // Green-700
        },
        // Legacy (pour compatibilité - DEPRECATED)
        'ast-blue': '#3b82f6',
        'ast-green': '#10b981',
        'ast-red': '#ef4444',
        'ast-yellow': '#f59e0b',
        'ast-purple': '#8b5cf6',
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
