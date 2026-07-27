import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const stylesPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../src/styles.css',
);

let css;

beforeAll(() => {
  css = readFileSync(stylesPath, 'utf-8');
});

function ruleFor(selector, source) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(^|[^\\w-])${escaped}\\s*\\{([^}]*)\\}`, 'm');
  const match = source.match(pattern);
  return match ? match[2] : null;
}

describe('CA-I-28 — no fixed pixel widths on layout containers', () => {
  it('declares no fixed pixel width wider than 320px for .app, .board, .config-panel, .scoreboard', () => {
    ['.app', '.board', '.config-panel', '.scoreboard'].forEach((selector) => {
      const rule = ruleFor(selector, css);
      expect(rule, `expected a rule for ${selector}`).not.toBeNull();
      const pxWidths = [...rule.matchAll(/(?<!max-|min-)width\s*:\s*(\d+)px/g)].map((m) =>
        Number(m[1]),
      );
      pxWidths.forEach((value) => {
        expect(value, `${selector} declares a fixed width of ${value}px`).toBeLessThanOrEqual(
          320,
        );
      });
    });
  });
});

describe('CA-I-29 — single column below 768px, min-width breakpoint', () => {
  it('base rule for .app is a single-column flex/grid layout', () => {
    const rule = ruleFor('.app', css);
    expect(rule).not.toBeNull();
    const isSingleColumnFlex = /display\s*:\s*flex/.test(rule) && /flex-direction\s*:\s*column/.test(rule);
    const isSingleColumnGrid = /grid-template-columns\s*:\s*1fr\b/.test(rule);
    expect(isSingleColumnFlex || isSingleColumnGrid).toBe(true);
  });

  it('any multi-column .app rule exists only inside a min-width(768px) media query', () => {
    const minWidthBlocks = [...css.matchAll(/@media\s*\(min-width:\s*768px\)\s*\{/g)];
    expect(minWidthBlocks.length).toBeGreaterThan(0);

    const maxWidthBlocks = [...css.matchAll(/@media\s*\([^)]*max-width[^)]*\)\s*\{([\s\S]*?)\n\}/g)];
    maxWidthBlocks.forEach((block) => {
      expect(ruleFor('.app', block[1])).toBeNull();
    });

    const outsideMedia = css.replace(/@media[^{]*\{[\s\S]*?\n\}/g, '');
    const baseAppRule = ruleFor('.app', outsideMedia);
    expect(baseAppRule).not.toBeNull();
    expect(/display\s*:\s*grid/.test(baseAppRule) && /grid-template-columns\s*:\s*(?!1fr\b)/.test(baseAppRule)).toBe(
      false,
    );
  });
});
