// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,svelte,ts}',
  ],
  theme: {
    extend: {
      colors: {
        // SHADCN-Svelte Design Tokens (Primary)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },

        // Legacy colors (for backwards compatibility)
        'accent-legacy': {
          DEFAULT: 'var(--accent)',
          dark: 'var(--accent-dark)',
          light: 'rgba(var(--accent-rgb), 0.1)',
          hover: 'rgba(var(--accent-rgb), 0.8)'
        },
        'primary-legacy': {
          light: 'var(--primary-light)',
          mid: 'var(--primary-mid)',
          dark: 'var(--primary-dark)'
        },
        surface: {
          background: 'var(--background-color)',
          card: 'var(--card-background, white)',
          input: 'var(--input-background, white)'
        },
        text: {
          primary: 'var(--text-color)',
          secondary: 'var(--text-secondary, rgba(var(--primary-dark-rgb), 0.7))',
          light: 'var(--text-light, rgba(var(--primary-light-rgb), 0.9))'
        }
      },
      spacing: {
        // Consistent spacing system
        xs: '0.25rem',    // 4px
        sm: '0.5rem',     // 8px
        md: '1rem',       // 16px
        lg: '1.5rem',     // 24px
        xl: '2rem',       // 32px
        '2xl': '3rem',    // 48px
        '3xl': '4rem'     // 64px
      },
      borderRadius: {
        // Consistent border radius system
        none: '0',
        sm: '0.25rem',    // 4px
        DEFAULT: '0.375rem', // 6px
        md: '0.5rem',     // 8px
        lg: '0.75rem',    // 12px
        xl: '1rem',       // 16px
        full: '9999px'
      },
      fontSize: {
        // Consistent typography sizes
        xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
        sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
        lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
      },
      boxShadow: {
        // Consistent shadow system
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      },
    },
  },
  plugins: [
    // Custom plugin to replace 'start' with 'flex-start' to fix compatibility warnings
    function({ addUtilities, matchUtilities, theme }) {
      // Override justifyContent utilities to use flex-start instead of start
      addUtilities({
        '.justify-start': {
          'justify-content': 'flex-start',
        },
        '.content-start': {
          'align-content': 'flex-start',
        },
        '.items-start': {
          'align-items': 'flex-start',
        },
        '.self-start': {
          'align-self': 'flex-start',
        },
      });
    }
  ],
  darkMode: 'class',
};