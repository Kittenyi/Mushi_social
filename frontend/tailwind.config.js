/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Cormorant Garamond', 'serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        mushi: {
          neon: 'hsl(var(--mushi-neon))',
          purple: 'hsl(var(--mushi-purple))',
          cyan: 'hsl(var(--mushi-cyan))',
          mint: 'hsl(var(--mushi-mint))',
          pink: 'hsl(var(--mushi-pink))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        jelly: '32px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 20px hsl(80 100% 54% / 0.3), 0 0 40px hsl(258 89% 66% / 0.2)',
          },
          '50%': {
            boxShadow: '0 0 40px hsl(80 100% 54% / 0.5), 0 0 60px hsl(258 89% 66% / 0.3)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, hsl(var(--mushi-neon)), hsl(var(--mushi-cyan)))',
        'gradient-purple': 'linear-gradient(135deg, hsl(var(--mushi-purple)), hsl(var(--mushi-cyan)))',
        'gradient-forest': 'linear-gradient(135deg, hsl(var(--mushi-neon)), hsl(var(--mushi-purple)))',
      },
      boxShadow: {
        neon: '0 0 20px hsl(80 100% 54% / 0.3), 0 0 40px hsl(80 100% 54% / 0.15)',
        purple: '0 0 20px hsl(258 89% 66% / 0.3), 0 0 40px hsl(258 89% 66% / 0.15)',
        cyan: '0 0 20px hsl(184 100% 50% / 0.3), 0 0 40px hsl(184 100% 50% / 0.15)',
        glass: '0 8px 32px hsl(220 40% 0% / 0.5), inset 0 1px 0 hsl(0 0% 100% / 0.05)',
        soft: '0 4px 24px hsl(220 40% 0% / 0.6)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
