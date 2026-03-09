/** Design tokens — single source of truth for the neumorphic green theme */

export const colors = {
  green: {
    50: "#f0f9f1",
    100: "#dcf0df",
    200: "#bbe2c1",
    300: "#8dcb97",
    400: "#5aaf6a",
    500: "#48b356",
    600: "#339143",
    700: "#2d7a3a",
    800: "#265f30",
    900: "#1a4d24",
    950: "#0e2b14",
  },
  neutral: {
    bg: "#f5f5f5",
    shadow: "#cecece",
    light: "#ffffff",
    text: {
      primary: "#1a1a1a",
      secondary: "#6b7280",
      muted: "#9ca3af",
    },
    border: "#e5e7eb",
  },
  status: {
    new: "#3b82f6",
    reviewing: "#f59e0b",
    approved: "#48b356",
    rejected: "#ef4444",
  },
} as const;

export const shadows = {
  neu: "8px 8px 16px #cecece, -8px -8px 16px #ffffff",
  neuSm: "4px 4px 8px #cecece, -4px -4px 8px #ffffff",
  neuXs: "2px 2px 4px #cecece, -2px -2px 4px #ffffff",
  neuIn: "inset 4px 4px 8px #cecece, inset -4px -4px 8px #ffffff",
  neuInSm: "inset 2px 2px 4px #cecece, inset -2px -2px 4px #ffffff",
} as const;

export const spacing = {
  sidebar: "224px",
  sidebarCollapsed: "64px",
} as const;

export const radii = {
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  full: "9999px",
} as const;

export const typography = {
  fontFamily: {
    heading: "'Prompt', sans-serif",
    body: "'Sarabun', sans-serif",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
  },
} as const;
