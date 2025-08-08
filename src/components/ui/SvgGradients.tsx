"use client";

export const SvgGradients = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }}>
    <defs>
      <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--gradient-from))" />
        <stop offset="100%" stopColor="hsl(var(--gradient-to))" />
      </linearGradient>
    </defs>
  </svg>
);