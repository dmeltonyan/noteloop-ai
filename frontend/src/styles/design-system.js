// NoteLoop AI Design System - Extracted from Figma

export const colors = {
  // Background colors from Figma
  background: {
    primary: '#1B2838',      // Main dark navy
    secondary: '#2A4058',    // Mid navy blue
    tertiary: '#1F2937',     // Card backgrounds
    gradient: 'linear-gradient(180deg, #1B2838 0%, #2A4058 50%, #1B2838 100%)',
    card: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
    cardSolid: '#000000',
  },
  
  // Primary accent colors
  accent: {
    cyan: '#17D4D6',         // Primary cyan
    cyanLight: '#5EEAD4',
    cyanDark: '#0EA5E9',
    purple: '#6366F1',
    purpleLight: '#8B5CF6',
    green: '#10B981',
    greenDark: '#059669',
    red: '#EF4444',
    redDark: '#DC2626',
  },
  
  // Gradients
  gradients: {
    cyan: 'linear-gradient(135deg, #17D4D6 0%, #0EA5E9 100%)',
    purple: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    green: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    red: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    card: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.8) 100%)',
  },
  
  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#8B9AA8',
    muted: '#6B7280',
    hint: '#4B5563',
  },
  
  // Zone colors (from Figma - Comfortable/Optimal/Stretch)
  zones: {
    comfortable: {
      background: 'rgba(16, 185, 129, 0.1)',
      border: '#10B981',
      text: '#6EE7B7',
    },
    optimal: {
      background: 'rgba(59, 130, 246, 0.1)',
      border: '#3B82F6',
      text: '#60A5FA',
    },
    stretch: {
      background: 'rgba(168, 85, 247, 0.1)',
      border: '#A855F7',
      text: '#C084FC',
    },
  },
}

export const typography = {
  fontFamily: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"Courier New", Courier, monospace',
  },
  
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
}

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
}

export const borderRadius = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  full: '9999px',  // Circular
}

export const shadows = {
  sm: '0 2px 8px rgba(0, 0, 0, 0.1)',
  md: '0 4px 12px rgba(0, 0, 0, 0.2)',
  lg: '0 10px 25px rgba(0, 0, 0, 0.3)',
  xl: '0 20px 60px rgba(0, 0, 0, 0.5)',
  glow: '0 4px 20px rgba(23, 212, 214, 0.4)',
  glowPurple: '0 4px 20px rgba(99, 102, 241, 0.4)',
}

export const animations = {
  transition: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
}
