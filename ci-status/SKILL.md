---
name: ci-status
description: CI/CD pipeline health check with failure classification, log analysis, and multi-branch status view
category: devops/ci-cd
tags: [ci-cd, github-actions, debugging, pipeline, devops, monitoring]
source_path: devops/ci-cd/ci-status
class: devops
subclass: ci-cd
---

# CI Status

## Purpose

Check CI/CD pipeline health by querying recent workflow runs, parsing failed job logs, extracting root causes, classifying failure types, providing multi-branch status views, and offering retry for transient failures.

## Prompt

Check the CI/CD pipeline status for the current repository. Follow these guidelines:

1. **Query recent workflow runs across branches.** Use `gh run list` to fetch recent workflow runs. Include runs from the current branch and main/default branch at minimum. Support querying additional branches when specified.
2. **Fetch and parse failed job logs.** For any failed runs, use `gh run view --log-failed` to retrieve the failure logs. Extract the relevant error output with approximately 20 lines of context around the failure point.
3. **Extract the root cause.** From the failure logs, identify the specific error message, failing test, or build error that caused the failure. Present it concisely with enough context to understand the problem.
4. **Classify failures.** Categorize each failure into one of these types:
   - **test**: A test assertion or test execution failure.
   - **lint**: A linter or formatter violation.
   - **build**: A compilation or build step failure.
   - **lockfile**: A package lockfile out-of-sync issue.
   - **PDV**: A post-deploy verification failure.
   - **flaky**: A test that sometimes passes and sometimes fails (detect by checking run history).
   - **infrastructure**: A runner, network, or service timeout issue.
   - **dependency**: A package resolution or installation failure.
5. **Provide multi-branch status view.** Show a summary table of recent runs across branches: branch name, workflow name, status (pass/fail/in-progress), and timestamp.
6. **Offer retry for infra/flaky failures.** If the failure is classified as infrastructure or flaky, offer to retry the run using `gh run rerun`. Confirm before executing.
7. **Watch in-progress runs.** If any runs are currently in progress, offer to watch them using `gh run watch` and report the result when they complete.

## Examples

- "CI status" — shows recent run status across branches, analyzes any failures.
- "Why is CI failing?" — fetches the latest failed run, extracts root cause, classifies the failure.
- "Watch CI" — monitors an in-progress run and reports when it completes.
