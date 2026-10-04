import { describe, expect, it } from 'vitest';
import { color, contrast, MODES, over, surfaces, theme, VARIANTS, type Variant } from './colors';

/**
 * WCAG contrast gates (3.4 of the build prompt). Every text / icon token is checked against every surface it can sit on
 * in both modes (and the colour-blind-safe + inverted-direction variants). The build fails on regressions.
 */
const BODY = 4.5, LARGE = 3;

const TEXT = ['text', 'text-secondary', 'text-muted'];
const STATUS_TEXT = ['positive', 'negative', 'warning', 'info', 'brand'];
const FILLS = ['brand-fill', 'positive-fill', 'negative-fill', 'warning-fill', 'info-fill'];
const GRAPHICS = ['data-1', 'data-2', 'data-4', 'data-5', 'data-6', 'chart-line'];

for (const mode of MODES) {
  for (const variant of VARIANTS) {
    const t = theme(mode, variant);
    const S = surfaces(t);
    const label = `${mode}${variant === 'default' ? '' : ` / ${variant}`}`;
    const base = S.filter((s) => !s.name.startsWith('field on'));

    describe(`contrast · ${label}`, () => {
      for (const tok of TEXT) {
        it(`${tok} ≥ ${BODY}:1 on every surface (incl. lit card corner + spotlight)`, () => {
          const fails = base.filter((s) => contrast(color(t, tok), s.color) < BODY).map((s) => `${s.name}=${contrast(color(t, tok), s.color).toFixed(2)}`);
          expect(fails, `${tok} too faint on: ${fails.join(', ')}`).toEqual([]);
        });
      }

      it('text-muted (placeholders) ≥ 4.5:1 on field fills', () => {
        const fails = S.filter((s) => s.name.startsWith('field on')).filter((s) => contrast(color(t, 'text-muted'), s.color) < BODY).map((s) => s.name);
        expect(fails).toEqual([]);
      });

      for (const tok of STATUS_TEXT) {
        it(`${tok} text ≥ ${BODY}:1 on every surface`, () => {
          const fails = base.filter((s) => contrast(color(t, tok), s.color) < BODY).map((s) => `${s.name}=${contrast(color(t, tok), s.color).toFixed(2)}`);
          expect(fails, fails.join(', ')).toEqual([]);
        });
      }

      for (const tone of ['positive', 'negative', 'warning', 'info', 'brand']) {
        const wash = tone === 'brand' ? 'wash-brand' : `wash-${tone}`;
        it(`${tone} text ≥ ${BODY}:1 on its wash over every surface (subtle buttons, badges, callouts)`, () => {
          const fails = base
            .filter((s) => /^(bg|bg-elevated|surface|raised|hover|well|card\[stop \d\])$/.test(s.name))
            .filter((s) => contrast(color(t, tone), over(color(t, wash), s.color)) < BODY)
            .map((s) => s.name);
          expect(fails).toEqual([]);
        });
      }

      for (const tok of GRAPHICS) {
        it(`${tok} (icon / graphic) ≥ ${LARGE}:1 on card + surface`, () => {
          const fails = base.filter((s) => /^(bg|surface|raised|card\[stop \d\])$/.test(s.name)).filter((s) => contrast(color(t, tok), s.color) < LARGE).map((s) => `${s.name}=${contrast(color(t, tok), s.color).toFixed(2)}`);
          expect(fails, fails.join(', ')).toEqual([]);
        });
      }

      it('control border (border-strong) ≥ 3:1 against card, surface, raised and field fills', () => {
        const fails = S.filter((s) => /^(surface|raised|card\[stop \d\]|field on .*)$/.test(s.name)).filter((s) => contrast(color(t, 'border-strong'), s.color) < LARGE).map((s) => `${s.name}=${contrast(color(t, 'border-strong'), s.color).toFixed(2)}`);
        expect(fails, fails.join(', ')).toEqual([]);
      });

      it('focus ring ≥ 3:1 against every surface', () => {
        const fails = base.filter((s) => contrast(color(t, 'focus'), s.color) < LARGE).map((s) => `${s.name}=${contrast(color(t, 'focus'), s.color).toFixed(2)}`);
        expect(fails, fails.join(', ')).toEqual([]);
      });

      it('on-text ≥ 4.5:1 on the neutral `on` fill, `on` ≥ 3:1 against surfaces (selected thumb)', () => {
        expect(contrast(color(t, 'on-text'), color(t, 'on'))).toBeGreaterThanOrEqual(BODY);
        const fails = base.filter((s) => /^(bg|surface|card\[stop \d\]|panel\[stop \d\])$/.test(s.name)).filter((s) => contrast(color(t, 'on'), s.color) < LARGE).map((s) => s.name);
        expect(fails).toEqual([]);
      });

      for (const f of FILLS) {
        it(`white label on ${f} ≥ ${BODY}:1`, () => {
          expect(contrast(color(t, 'on-fill'), color(t, f))).toBeGreaterThanOrEqual(BODY);
        });
      }

      it('tooltip / selected chip: on-text on on', () => {
        expect(contrast(color(t, 'on-text'), color(t, 'on'))).toBeGreaterThanOrEqual(BODY);
      });
    });
  }
}

describe('variants keep long/short distinguishable', () => {
  for (const mode of MODES) {
    for (const variant of ['default', 'cvd', 'inverted'] as Variant[]) {
      it(`${mode} / ${variant}: positive and negative fills differ`, () => {
        const t = theme(mode, variant);
        expect(t['positive-fill']).not.toEqual(t['negative-fill']);
        expect(t.positive).not.toEqual(t.negative);
      });
    }
  }
});
