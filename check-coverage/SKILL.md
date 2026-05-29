---
name: check-coverage
description: Test coverage analysis with gap identification, threshold enforcement, and regression detection
category: testing/test-strategy
tags: [testing, coverage, quality, test-strategy, regression, thresholds]
source_path: testing/test-strategy/check-coverage
class: testing
subclass: test-strategy
---

# Check Coverage

## Purpose

Run the test suite with coverage instrumentation, analyze the results, identify uncovered code with specific line numbers, suggest test cases for each gap, enforce configurable coverage thresholds, and detect regressions against previous runs.

## Prompt

Analyze test coverage for the current project. Follow these guidelines:

1. **Run the test suite with coverage instrumentation.** Execute the project's test command with coverage enabled (e.g., `npm test -- --coverage`, `pytest --cov`). Capture the full coverage output.
2. **Parse coverage results.** Extract coverage percentages for statements, branches, functions, and lines. Identify the per-file breakdown.
3. **Identify uncovered code with line numbers.** For each file with gaps, list the specific uncovered statements, branches, and functions with their exact line numbers. Group findings by file.
4. **Suggest specific test cases for each gap.** For every uncovered block, propose a concrete test case that would cover it. Include the test name, a brief description of what it tests, and which lines it would cover.
5. **Enforce a configurable coverage threshold.** Default threshold is 98%. If overall coverage falls below the threshold, report it as a failure. Support user-specified thresholds (e.g., "check coverage with 90% threshold").
6. **Detect regressions vs previous run.** Compare current coverage against the most recent previous coverage data (if available). Flag any files where coverage decreased, showing the before/after percentages.
7. **Support focus mode for changed files only.** When requested or when a diff is available, limit the analysis to files that have been modified. Report coverage for only those files while noting the overall project coverage.
8. **Produce a clear summary.** Output a table of per-file coverage, a list of gaps with suggested tests, the threshold pass/fail verdict, and any regressions detected.

## Examples

- "Check coverage" — runs tests with coverage, reports gaps, enforces 98% threshold.
- "Check coverage for changed files only" — focuses on modified files in the current branch.
- "Check coverage with 90% threshold" — uses a custom threshold instead of the default.
