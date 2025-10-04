import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        'sans': ['-apple-system', 'SF Pro Display', 'SF Pro Text', 'system-ui', 'sans-serif'],
        'libre-baskerville': ['Libre Baskerville', 'serif'],
        'work-sans': ['Work Sans', 'sans-serif'],
        
        // Newsletter Design System Fonts
        'display': ['Playfair Display', 'Libre Baskerville', 'serif'],
        'headline': ['Crimson Text', 'Source Serif 4', 'serif'],
        'body': ['Inter', 'Work Sans', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Geist Mono', 'monospace'],
      },
      keyframes: {
        'slide-in-top': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-30px) scale(0.95)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)'
          }
        },
        'simple-slide': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'slide-out-left': {
          '0%': {
            opacity: '1',
            transform: 'translateX(0) scale(1)'
          },
          '100%': {
            opacity: '0',
            transform: 'translateX(-100px) scale(0.8)'
          }
        },
        'fade-in': {
          '0%': {
            opacity: '0'
          },
          '100%': {
            opacity: '1'
          }
        },
        'scale-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          }
        },
        'pulse-glow': {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '1'
          },
          '50%': {
            transform: 'scale(1.2)',
            opacity: '0.8'
          }
        },
        'collapsible-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'slide-in-top': 'slide-in-top 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'simple-slide': 'simple-slide 0.6s ease-out forwards',
        'slide-out-left': 'slide-out-left 0.3s ease-in-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'scale-in-delayed': 'scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both',
        'scale-in-delayed-2': 'scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'collapsible-down': 'collapsible-down 0.2s ease-out',
        'collapsible-up': 'collapsible-up 0.2s ease-out',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
