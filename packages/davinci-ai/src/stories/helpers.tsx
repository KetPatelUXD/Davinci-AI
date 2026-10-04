import type { CSSProperties, ReactNode } from 'react';

/** Layout helpers used only by stories. */
export const Row = ({ children, gap = 12, align = 'center', style }: { children: ReactNode; gap?: number; align?: CSSProperties['alignItems']; style?: CSSProperties }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: align, gap, ...style }}>{children}</div>
);
export const Col = ({ children, gap = 16, width, style }: { children: ReactNode; gap?: number; width?: number | string; style?: CSSProperties }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap, width, ...style }}>{children}</div>
);
export const Label = ({ children }: { children: ReactNode }) => (
  <div style={{ color: 'var(--dv-text-muted)', fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 8 }}>{children}</div>
);
export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section><Label>{title}</Label>{children}</section>
);
export const series = [64, 66, 65, 69, 68, 72, 70, 75, 74, 79, 77, 76, 81, 80, 84, 83, 86, 85, 88, 90];
export const seriesDown = [...series].reverse();
