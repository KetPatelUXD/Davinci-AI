import { describe, expect, it } from 'vitest';
// @ts-expect-error plain ESM script without types
import { buildTheme, propose, PRESETS, brandTokens } from '../../bin/davinci.mjs';

describe('davinci theme CLI', () => {
  it('proposes a theme from a free-text brand description', () => {
    expect(propose('calm teal fintech, soft rounded, spacious, light by default')).toEqual({ primary: 'teal', density: 'large', radius: 'soft', mode: 'light' });
    expect(propose('')).toEqual({ primary: 'violet', density: 'medium', radius: 'balanced', mode: 'dark' });
  });

  it('every preset keeps the contrast rules (white on fill ≥ 4.5, text ≥ 4.5, focus ≥ 3)', () => {
    for (const p of Object.keys(PRESETS)) {
      const { report } = brandTokens(PRESETS[p]);
      expect(report.fillWhite, p).toBeGreaterThanOrEqual(4.5);
      expect(report.darkText, p).toBeGreaterThanOrEqual(4.5);
      expect(report.lightText, p).toBeGreaterThanOrEqual(4.5);
      expect(Math.min(report.darkFocus, report.lightFocus), p).toBeGreaterThanOrEqual(3);
    }
  });

  it('repairs awkward custom colours (yellow, near-white, near-black)', () => {
    for (const hex of ['#ffff00', '#f5f5f5', '#111111', '#00ff00']) {
      const { report } = brandTokens(hex);
      expect(report.fillWhite, hex).toBeGreaterThanOrEqual(4.5);
      expect(report.lightText, hex).toBeGreaterThanOrEqual(4.5);
      expect(report.darkText, hex).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('writes CSS, JSON and TS with radius and density overrides', () => {
    const t = buildTheme({ primary: '#0f766e', density: 'large', radius: 'sharp', mode: 'system' });
    expect(t.css).toContain("[data-theme='dark']");
    expect(t.css).toContain('--dv-radius-card: 12px');
    expect(t.css).toContain('--dv-button-height-md: 42px');
    expect(t.json.defaultTheme).toBe('system');
    expect(t.ts).toContain("defaultTheme: 'system'");
  });

  it('rejects invalid input with a helpful message', () => {
    expect(() => buildTheme({ primary: 'chartreuse-ish' })).toThrow(/Unknown primary colour/);
    expect(() => buildTheme({ density: 'huge' })).toThrow(/density/);
  });
});
