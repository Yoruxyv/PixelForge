import { describe, expect, it } from 'vitest';
import {
  evaluateProfile,
  formatResult,
  LIGHTHOUSE_BUDGET,
} from './check-lighthouse-budget';

const report = ({ performance = 100, accessibility = 100, bestPractices = 100, seo = 100 } = {}) => ({
  categories: {
    performance: { score: performance / 100 },
    accessibility: { score: accessibility / 100 },
    'best-practices': { score: bestPractices / 100 },
    seo: { score: seo / 100 },
  },
});

const evaluate = (overrides = {}) =>
  evaluateProfile(
    'Mobile',
    Array.from({ length: 5 }, (_, index) =>
      report(typeof overrides === 'function' ? overrides(index) : overrides),
    ),
  );

describe('Lighthouse budget evaluation', () => {
  it('keeps the blocking budget unchanged', () => {
    expect(LIGHTHOUSE_BUDGET).toEqual({
      runCount: 5,
      performanceMeanMin: 95,
      performanceRunMin: 90,
      accessibilityMin: 100,
      bestPracticesMin: 100,
      seoMin: 100,
    });
  });

  it('passes an arithmetic performance mean of 95', () => {
    const scores = [90, 95, 95, 95, 100];
    const result = evaluate((index) => ({ performance: scores[index] }));

    expect(result.performanceMean).toBe(95);
    expect(result.passed).toBe(true);
  });

  it('fails a performance mean below 95', () => {
    const scores = [94, 94, 94, 94, 98];
    const result = evaluate((index) => ({ performance: scores[index] }));

    expect(result.performanceMean).toBe(94.8);
    expect(result.failures).toContain(
      'Mobile performance mean 94.8 < required 95',
    );
  });

  it('fails an individual performance run below 90', () => {
    const scores = [89, 100, 100, 100, 100];
    const result = evaluate((index) => ({ performance: scores[index] }));

    expect(result.failures).toContain(
      'Mobile run 1 Performance 89 < individual floor 90',
    );
  });

  it.each([
    ['Accessibility', { accessibility: 99 }],
    ['Best Practices', { bestPractices: 99 }],
    ['SEO', { seo: 99 }],
  ])('fails when %s is below 100', (label, overrides) => {
    const result = evaluate(overrides);

    expect(result.failures.some((failure) => failure.includes(`${label} 99`))).toBe(true);
  });

  it('formats passing results as a deterministic plain-text table', () => {
    expect(formatResult(evaluate())).toBe(`Mobile

┌─────┬──────┬──────┬─────┬─────┐
│ Run │ Perf │ A11y │ BP  │ SEO │
├─────┼──────┼──────┼─────┼─────┤
│   1 │  100 │  100 │ 100 │ 100 │
│   2 │  100 │  100 │ 100 │ 100 │
│   3 │  100 │  100 │ 100 │ 100 │
│   4 │  100 │  100 │ 100 │ 100 │
│   5 │  100 │  100 │ 100 │ 100 │
└─────┴──────┴──────┴─────┴─────┘

Performance mean : 100.0
Required mean    : 95
Per-run minimum  : 90

PASS`);
  });

  it('keeps failure details below the table', () => {
    const output = formatResult(evaluate({ accessibility: 99 }));

    expect(output).toContain('\nFAIL:\n');
    expect(output).toContain(
      '- Mobile run 1 Accessibility 99 < required 100',
    );
  });
});
