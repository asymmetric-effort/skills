---
name: monitor-issues
description: Monitor repo GitHub issues from trusted sources, categorize, prioritize, and produce structured reports
category: automation/workflows
tags: [github, issues, monitoring, triage, automation, cron]
source_path: automation/workflows/monitor-issues
class: automation
subclass: workflows
---

# Monitor Issues

## Purpose

Monitor a repository's GitHub issues from trusted sources only, categorize and prioritize each qualifying issue, and produce a structured report of actionable vs skipped items. Automatically renew the cron schedule to keep monitoring active.

## Prompt

Monitor GitHub issues for the current repository, filtering to trusted sources only. Follow these guidelines:

1. **Define trusted sources.** By default, only process issues from: `dependabot`, `dependabot[bot]`, `github-code-scanning[bot]`, the repository owner, and issues with the `approved-for-claude` label. Support additional trusted authors and labels via config.
2. **Fetch recent issues.** Use `gh issue list` to retrieve open issues. Filter out any issue whose author is not in the trusted list and that lacks an approved label.
3. **Categorize each qualifying issue.** Assign a category such as: security vulnerability, dependency update, bug report, feature request, code quality, or infrastructure.
4. **Assess priority.** Rate each issue as critical, high, medium, or low based on severity, affected scope, and whether it is security-related.
5. **Summarize each issue.** Provide a concise 1-2 sentence summary explaining what the issue is and why it matters.
6. **Recommend an action.** For each issue, suggest a concrete next step: apply patch, bump dependency, investigate further, defer, or dismiss with reason.
7. **Produce a structured report.** Output two sections: (a) Actionable issues with category, priority, summary, and recommended action; (b) Skipped issues with reason for skipping (untrusted author, no approved label, etc.).
8. **Auto-renew the cron schedule.** Re-register the monitoring schedule every 6 days to stay ahead of the 7-day expiry window. Include the renewal confirmation in the report output.
9. **Support configuration.** Allow users to specify additional trusted authors and labels beyond the defaults, either inline or via a config file.

## Examples

- "Monitor issues" — fetches open issues, filters to trusted sources, produces categorized report.
- "Monitor issues and add @security-team to trusted authors" — includes issues from that team in the trusted filter.
- "Check for new dependabot alerts" — runs the monitor with default trusted sources, focusing on dependency updates.
