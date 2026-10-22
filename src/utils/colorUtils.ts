/**
 * Habitale Color & Contrast Utility Functions
 * WCAG AA & AAA contrast calculations and color conversions
 */

export function isValidHex(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim());
}

export function normalizeHex(hex: string): string {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    return `#${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`.toUpperCase();
  }
  if (clean.length === 6) {
    return `#${clean}`.toUpperCase();
  }
  return hex;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex) return null;
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

export function hexToRgba(hex: string, alpha: number): string {
  if (!hex) return `rgba(0, 0, 0, ${alpha})`;
  if (hex.startsWith('rgba')) {
    return hex.replace(/[\d.]+\)$/g, `${alpha})`);
  }
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(0, 0, 0, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(hex1: string, hex2: string): number | null {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return null;
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

export function isDarkColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const lum = getLuminance(rgb.r, rgb.g, rgb.b);
  return lum < 0.25;
}

export interface ContrastStatus {
  ratio: number;
  isCompliant: boolean;
  level: 'AAA' | 'AA' | 'Fail';
  message: string;
}

export function checkTextContrast(textColor: string, bgColor: string): ContrastStatus {
  const ratio = getContrastRatio(textColor, bgColor) || 1;
  if (ratio >= 7) {
    return {
      ratio,
      isCompliant: true,
      level: 'AAA',
      message: `Optimal contrast (${ratio}:1). Exceeds WCAG AAA guidelines.`,
    };
  }
  if (ratio >= 4.5) {
    return {
      ratio,
      isCompliant: true,
      level: 'AA',
      message: `Good contrast (${ratio}:1). Meets WCAG AA guidelines for body text.`,
    };
  }
  return {
    ratio,
    isCompliant: false,
    level: 'Fail',
    message: `Low contrast (${ratio}:1). Text may be difficult to read on this background.`,
  };
}
