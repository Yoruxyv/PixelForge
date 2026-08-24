import { appendFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const LIGHTHOUSE_BUDGET = Object.freeze({
  runCount: 5,
  performanceMeanMin: 95,
  performanceRunMin: 90,
  accessibilityMin: 100,
  bestPracticesMin: 100,
  seoMin: 100,
});

const categoryScore = (report, category) => {
  const score = report.categories?.[category]?.score;

  if (typeof score !== 'number') {
    throw new Error(`Missing Lighthouse category score: ${category}`);
  }

  return score * 100;
};

const displayScore = (score) =>
  Number.isInteger(score) ? score.toString() : score.toFixed(1);

export function evaluateProfile(profile, reports, budget = LIGHTHOUSE_BUDGET) {
  if (reports.length !== budget.runCount) {
    throw new Error(
      `${profile} requires ${budget.runCount} reports; received ${reports.length}.`,
    );
  }

  const rows = reports.map((report, index) => ({
    run: index + 1,
    performance: categoryScore(report, 'performance'),
    accessibility: categoryScore(report, 'accessibility'),
    bestPractices: categoryScore(report, 'best-practices'),
    seo: categoryScore(report, 'seo'),
  }));
  const performanceMean =
    rows.reduce((sum, row) => sum + row.performance, 0) / rows.length;
  const failures = [];

  for (const row of rows) {
    if (row.performance < budget.performanceRunMin) {
      failures.push(
        `${profile} run ${row.run} Performance ${row.performance} < individual floor ${budget.performanceRunMin}`,
      );
    }
    if (row.accessibility < budget.accessibilityMin) {
      failures.push(
        `${profile} run ${row.run} Accessibility ${row.accessibility} < required ${budget.accessibilityMin}`,
      );
    }
    if (row.bestPractices < budget.bestPracticesMin) {
      failures.push(
        `${profile} run ${row.run} Best Practices ${row.bestPractices} < required ${budget.bestPracticesMin}`,
      );
    }
    if (row.seo < budget.seoMin) {
      failures.push(
        `${profile} run ${row.run} SEO ${row.seo} < required ${budget.seoMin}`,
      );
    }
  }

  if (performanceMean < budget.performanceMeanMin) {
    failures.push(
      `${profile} performance mean ${performanceMean.toFixed(1)} < required ${budget.performanceMeanMin}`,
    );
  }

  return {
    profile,
    rows,
    performanceMean,
    failures,
    passed: failures.length === 0,
  };
}

const formatResult = (result) => {
  const lines = [result.profile];

  for (const row of result.rows) {
    lines.push(
      `Run ${row.run}: Perf ${displayScore(row.performance)} | A11y ${displayScore(row.accessibility)} | BP ${displayScore(row.bestPractices)} | SEO ${displayScore(row.seo)}`,
    );
  }

  lines.push(
    '',
    `Performance mean: ${result.performanceMean.toFixed(1)}`,
    `Required mean:    ${LIGHTHOUSE_BUDGET.performanceMeanMin}`,
  );

  if (result.passed) {
    lines.push('PASS');
  } else {
    lines.push('FAIL:', ...result.failures.map((failure) => `- ${failure}`));
  }

  return lines.join('\n');
};

const readProfileReports = (directory, profile) =>
  Array.from({ length: LIGHTHOUSE_BUDGET.runCount }, (_, index) => {
    const path = resolve(directory, `${profile.toLowerCase()}-${index + 1}.json`);
    return JSON.parse(readFileSync(path, 'utf8'));
  });

export function checkReportDirectory(directory) {
  return ['Desktop', 'Mobile'].map((profile) =>
    evaluateProfile(profile, readProfileReports(directory, profile)),
  );
}

export function main(args = process.argv.slice(2)) {
  try {
    const directory = resolve(args[0] ?? 'lighthouse-reports');
    const results = checkReportDirectory(directory);
    const output = [
      'PixelForge Lighthouse Budget',
      '',
      ...results.flatMap((result, index) => [
        formatResult(result),
        ...(index < results.length - 1 ? [''] : []),
      ]),
    ].join('\n');

    console.log(output);

    if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(
        process.env.GITHUB_STEP_SUMMARY,
        `## PixelForge Lighthouse Budget\n\n\`\`\`text\n${output}\n\`\`\`\n`,
      );
    }

    return results.every((result) => result.passed) ? 0 : 1;
  } catch (error) {
    console.error(`PixelForge Lighthouse Budget\n\nFAIL:\n${error.message}`);
    return 1;
  }
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  process.exitCode = main();
}
