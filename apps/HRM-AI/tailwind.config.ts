import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1600px",
      },
    },
    extend: {
      // ═══════════════════════════════════════════════════════════
      // BLOOMBERG FONTS
      // ═══════════════════════════════════════════════════════════
      fontFamily: {
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "Consolas", "monospace"],
      },

      // ═══════════════════════════════════════════════════════════
      // BLOOMBERG FONT SIZES
      // ═══════════════════════════════════════════════════════════
      fontSize: {
        "xs": ["0.6875rem", { lineHeight: "1rem" }],
        "sm": ["0.8125rem", { lineHeight: "1.25rem" }],
        "base": ["0.875rem", { lineHeight: "1.375rem" }],
        "md": ["0.9375rem", { lineHeight: "1.5rem" }],
        "lg": ["1.0625rem", { lineHeight: "1.625rem" }],
        "xl": ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.375rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.75rem" }],
        // Data typography (Mono)
        "data-xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.02em" }],
        "data-sm": ["0.75rem", { lineHeight: "1.125rem", letterSpacing: "0.01em" }],
        "data-base": ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0" }],
        "data-lg": ["1.125rem", { lineHeight: "1.5rem", letterSpacing: "-0.01em" }],
        "data-xl": ["1.5rem", { lineHeight: "1.875rem", letterSpacing: "-0.02em" }],
        "data-2xl": ["2rem", { lineHeight: "2.25rem", letterSpacing: "-0.025em" }],
        "data-3xl": ["2.5rem", { lineHeight: "2.75rem", letterSpacing: "-0.03em" }],
      },

      // ═══════════════════════════════════════════════════════════
      // BLOOMBERG COLORS
      // ═══════════════════════════════════════════════════════════
      colors: {
        // Terminal backgrounds
        terminal: {
          DEFAULT: "hsl(var(--terminal))",
          foreground: "hsl(var(--terminal-foreground, var(--foreground)))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          foreground: "hsl(var(--foreground))",
        },
        elevated: {
          DEFAULT: "hsl(var(--elevated, var(--muted)))",
          foreground: "hsl(var(--foreground))",
        },

        // Semantic colors (shadcn compatible)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Bloomberg Orange Accent (static palette)
        "accent-orange": {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },

        // Status colors
        success: {
          DEFAULT: "hsl(var(--success))",
          muted: "hsl(var(--success-muted, 142 71% 45% / 0.1))",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          muted: "hsl(var(--warning-muted, 48 96% 53% / 0.1))",
          foreground: "#ffffff",
        },
        error: {
          DEFAULT: "hsl(var(--destructive))",
          muted: "hsl(var(--error-muted, 0 72% 51% / 0.1))",
          foreground: "#ffffff",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          muted: "hsl(var(--info-muted, 217 91% 60% / 0.1))",
          foreground: "#ffffff",
        },

        // Sidebar
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },

      // ═══════════════════════════════════════════════════════════
      // PREMIUM ANIMATIONS
      // ═══════════════════════════════════════════════════════════
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Entrance
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInDown: {
          "0%": { opacity: "0", transform: "translateY(-24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        scaleInCenter: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        // Exit
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        fadeOutDown: {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(8px)" },
        },
        scaleOut: {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.95)" },
        },
        // Continuous
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(249, 115, 22, 0.4)" },
          "50%": { opacity: "0.9", boxShadow: "0 0 0 8px rgba(249, 115, 22, 0)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px hsl(var(--primary) / 0.3), 0 0 10px hsl(var(--primary) / 0.1)" },
          "50%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.5), 0 0 30px hsl(var(--primary) / 0.2)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        // Data
        numberTick: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "50%": { transform: "translateY(10%)", opacity: "0.8" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        countUp: {
          "0%": { transform: "translateY(20%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        progressFill: {
          "0%": { transform: "scaleX(0)", transformOrigin: "left" },
          "100%": { transform: "scaleX(1)", transformOrigin: "left" },
        },
        chartGrow: {
          "0%": { transform: "scaleY(0)", transformOrigin: "bottom" },
          "100%": { transform: "scaleY(1)", transformOrigin: "bottom" },
        },
        // Micro-interactions
        bounceSm: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-3deg)" },
          "75%": { transform: "rotate(3deg)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
        },
        pingOnce: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "75%, 100%": { transform: "scale(2)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // Entrance
        "fade-in": "fadeIn 0.2s ease-out forwards",
        "fade-in-fast": "fadeIn 0.15s ease-out forwards",
        "fade-in-slow": "fadeIn 0.4s ease-out forwards",
        "fade-in-up": "fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in-up-fast": "fadeInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in-down": "fadeInDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-right": "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-left": "slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-up": "slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-down": "slideInDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in-center": "scaleInCenter 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        // Exit
        "fade-out": "fadeOut 0.15s ease-in forwards",
        "fade-out-down": "fadeOutDown 0.2s ease-in forwards",
        "scale-out": "scaleOut 0.15s ease-in forwards",
        // Continuous
        "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "spin-slow": "spin 3s linear infinite",
        // Data
        "number-tick": "numberTick 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "count-up": "countUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "progress-fill": "progressFill 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "chart-grow": "chartGrow 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        // Micro-interactions
        "bounce-sm": "bounceSm 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "wiggle": "wiggle 0.5s ease-in-out",
        "shake": "shake 0.4s ease-in-out",
        "ping-once": "pingOnce 0.75s cubic-bezier(0, 0, 0.2, 1)",
      },

      // ═══════════════════════════════════════════════════════════
      // SHADOWS
      // ═══════════════════════════════════════════════════════════
      boxShadow: {
        "glow-sm": "0 0 10px -3px hsl(var(--primary) / 0.3)",
        "glow": "0 0 15px -3px hsl(var(--primary) / 0.4)",
        "glow-lg": "0 0 25px -5px hsl(var(--primary) / 0.5)",
        "inner-glow": "inset 0 0 20px -10px hsl(var(--primary) / 0.3)",
        "terminal": "0 1px 3px rgba(0, 0, 0, 0.3), 0 0 0 1px hsl(var(--border))",
        "elevated": "0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 1px hsl(var(--border))",
      },

      // ═══════════════════════════════════════════════════════════
      // BORDER RADIUS
      // ═══════════════════════════════════════════════════════════
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 1px)",
        sm: "calc(var(--radius) - 2px)",
      },

      // ═══════════════════════════════════════════════════════════
      // TRANSITIONS
      // ═══════════════════════════════════════════════════════════
      transitionDuration: {
        "50": "50ms",
        "75": "75ms",
        "250": "250ms",
        "350": "350ms",
        "400": "400ms",
        "500": "500ms",
      },
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "bounce": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "snap": "cubic-bezier(0.16, 1, 0.3, 1)",
        "ease-out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "ease-in-out-expo": "cubic-bezier(0.87, 0, 0.13, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
