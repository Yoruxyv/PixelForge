import { describe, expect, it } from 'vitest';
import { evaluateProfile } from './check-lighthouse-budget';

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
});
