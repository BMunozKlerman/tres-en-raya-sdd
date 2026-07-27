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

describe('CA-I-30 — board container is square (aspect-ratio 1/1)', () => {
  it('declares aspect-ratio 1 / 1 and a relative width/max-width', () => {
    const rule = ruleFor('.board', css);
    expect(rule).not.toBeNull();
    expect(/aspect-ratio\s*:\s*1\s*\/\s*1/.test(rule)).toBe(true);
    const hasRelativeWidth = /(?:^|\s)(width|max-width)\s*:\s*(min\(|max\(|clamp\(|\d+(\.\d+)?(%|vw))/.test(
      rule,
    );
    expect(hasRelativeWidth).toBe(true);
    const fixedPxWidths = [...rule.matchAll(/(?<!max-|min-)width\s*:\s*(\d+)px/g)];
    expect(fixedPxWidths.length).toBe(0);
  });
});

describe('CA-I-31 — interactive controls declare 44x44px minimum', () => {
  it('every interactive-control selector declares min-width/min-height of at least 44px', () => {
    ['button', '.cell', 'select'].forEach((selector) => {
      const rule = ruleFor(selector, css);
      expect(rule, `expected a rule for ${selector}`).not.toBeNull();
      const minWidthMatch = rule.match(/min-width\s*:\s*(\d+)px/);
      const minHeightMatch = rule.match(/min-height\s*:\s*(\d+)px/);
      expect(minWidthMatch, `${selector} has no min-width`).not.toBeNull();
      expect(minHeightMatch, `${selector} has no min-height`).not.toBeNull();
      expect(Number(minWidthMatch[1])).toBeGreaterThanOrEqual(44);
      expect(Number(minHeightMatch[1])).toBeGreaterThanOrEqual(44);
    });
  });
});

describe('CA-I-32 — configuration controls not clipped or overflow-hidden', () => {
  it('the configuration container has no overflow:hidden paired with a narrow fixed width', () => {
    const rule = ruleFor('.config-panel', css);
    expect(rule).not.toBeNull();
    const hasOverflowHidden = /overflow\s*:\s*hidden/.test(rule);
    const hasNarrowFixedWidth = /(?<!max-|min-)width\s*:\s*(\d+)px/.test(rule) &&
      Number(rule.match(/(?<!max-|min-)width\s*:\s*(\d+)px/)[1]) < 320;
    expect(hasOverflowHidden && hasNarrowFixedWidth).toBe(false);
  });

  it('no interactive control forces white-space: nowrap', () => {
    ['button', '.cell', 'select', '.config-panel'].forEach((selector) => {
      const rule = ruleFor(selector, css);
      if (rule) {
        expect(/white-space\s*:\s*nowrap/.test(rule)).toBe(false);
      }
    });
  });
});
