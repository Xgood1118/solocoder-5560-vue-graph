import type { ThemeName } from '@/types'

export const THEME_CSS_VARS: Record<ThemeName, Record<string, string>> = {
  light: {
    '--canvas-bg': '#f8f9fa',
    '--panel-bg': '#ffffff',
    '--panel-border': '#e2e8f0',
    '--text-primary': '#1a1a2e',
    '--text-secondary': '#64748b',
    '--accent': '#0066ff',
    '--accent-hover': '#0052cc',
    '--danger': '#ef4444',
    '--grid-dot': '#cbd5e1',
    '--node-shadow': 'rgba(0,0,0,0.1)',
    '--selection-glow': 'rgba(0,102,255,0.4)',
    '--minimap-bg': 'rgba(255,255,255,0.9)',
    '--minimap-viewport': 'rgba(0,102,255,0.3)',
    '--toolbar-bg': '#ffffff',
    '--toolbar-hover': '#f1f5f9',
    '--input-bg': '#f8fafc',
    '--input-border': '#e2e8f0',
  },
  dark: {
    '--canvas-bg': '#1e1e2e',
    '--panel-bg': '#2a2a3e',
    '--panel-border': '#3a3a4e',
    '--text-primary': '#e0e0e0',
    '--text-secondary': '#a0a0b0',
    '--accent': '#00d4aa',
    '--accent-hover': '#00b894',
    '--danger': '#ff6b35',
    '--grid-dot': '#3a3a4e',
    '--node-shadow': 'rgba(0,0,0,0.3)',
    '--selection-glow': 'rgba(0,212,170,0.4)',
    '--minimap-bg': 'rgba(30,30,46,0.9)',
    '--minimap-viewport': 'rgba(0,212,170,0.3)',
    '--toolbar-bg': '#2a2a3e',
    '--toolbar-hover': '#3a3a4e',
    '--input-bg': '#1e1e2e',
    '--input-border': '#3a3a4e',
  },
  print: {
    '--canvas-bg': '#ffffff',
    '--panel-bg': '#ffffff',
    '--panel-border': '#cccccc',
    '--text-primary': '#000000',
    '--text-secondary': '#666666',
    '--accent': '#333333',
    '--accent-hover': '#555555',
    '--danger': '#cc0000',
    '--grid-dot': '#dddddd',
    '--node-shadow': 'none',
    '--selection-glow': 'rgba(0,0,0,0.2)',
    '--minimap-bg': 'rgba(255,255,255,0.95)',
    '--minimap-viewport': 'rgba(0,0,0,0.2)',
    '--toolbar-bg': '#ffffff',
    '--toolbar-hover': '#f0f0f0',
    '--input-bg': '#ffffff',
    '--input-border': '#cccccc',
  },
  ocean: {
    '--canvas-bg': '#0a1628',
    '--panel-bg': '#0f2035',
    '--panel-border': '#1a3a5c',
    '--text-primary': '#c0d8f0',
    '--text-secondary': '#7aa3c8',
    '--accent': '#00b4d8',
    '--accent-hover': '#0096b7',
    '--danger': '#ff6b6b',
    '--grid-dot': '#1a3a5c',
    '--node-shadow': 'rgba(0,0,0,0.4)',
    '--selection-glow': 'rgba(0,180,216,0.4)',
    '--minimap-bg': 'rgba(10,22,40,0.9)',
    '--minimap-viewport': 'rgba(0,180,216,0.3)',
    '--toolbar-bg': '#0f2035',
    '--toolbar-hover': '#1a3a5c',
    '--input-bg': '#0a1628',
    '--input-border': '#1a3a5c',
  },
}

export function applyThemeToDom(theme: ThemeName): void {
  const vars = THEME_CSS_VARS[theme]
  if (!vars) return
  const root = document.documentElement
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value)
  }
}
