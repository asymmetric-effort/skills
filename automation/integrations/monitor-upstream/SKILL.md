---
name: monitor-upstream
description: Track external dependency releases and upstream issue status with automated verification
category: automation/integrations
tags: [dependencies, monitoring, npm, github-releases, upstream, integrations]
---

# Monitor Upstream

## Purpose

Track external dependency releases and upstream issue status. Monitor for new versions, flag premature issue closures, verify fixes by bumping and testing, and integrate with related skills for filing bugs and pushing changes.

## Prompt

Monitor upstream dependencies and issues for the current project. Follow these guidelines:

1. **Monitor for new dependency releases.** Check the npm registry and GitHub releases for each tracked dependency. Compare the latest available version against what is currently installed. Report any new versions with their changelogs or release notes.
2. **Track upstream issue status.** For issues previously filed or watched, check their current status (open, closed, reopened). Report any status changes since the last check.
3. **Flag premature closures.** If a tracked upstream issue was closed without a merged fix (no linked PR, closed by bot, or closed as stale), flag it as a premature closure and recommend action (reopen, re-file, or escalate).
4. **Verify fixes by bumping and testing.** When an upstream fix is released, bump the dependency to the new version and run targeted tests to verify the fix resolves the original problem. Report pass/fail results.
5. **Support a config file.** Read dependency watch configuration from `.claude/upstream-watch.yml`. The config should support specifying which packages to track, which upstream issues to monitor, and any custom test commands for verification.
6. **Pair with related skills.** This skill works alongside `/file-bug` (for filing new upstream issues), `/loop` (for recurring monitoring), and `/push-changes` (for pushing verified dependency bumps). Reference these skills in recommendations when appropriate.
7. **Produce a structured report.** Output sections for: new releases available, issue status changes, premature closures flagged, and verification results.

## Examples

- "Monitor upstream" — checks all tracked dependencies for new releases and upstream issue status changes.
- "Check if the lodash security fix was actually released" — verifies a specific upstream fix by bumping and running tests.
- "Watch react-query for the next release" — adds react-query to the watch list and reports when a new version appears.
