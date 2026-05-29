---
name: file-bug
description: Generate structured upstream bug reports with reproduction steps, duplicate detection, and filing via gh
category: development/debugging
tags: [bugs, debugging, github, issue-filing, upstream, reproduction]
source_path: development/debugging/file-bug
class: development
subclass: debugging
---

# File Bug

## Purpose

Create structured, high-quality upstream bug reports with all necessary context for maintainers to reproduce and fix the issue. Handle the full lifecycle from input analysis through duplicate detection to filing.

## Prompt

Generate and file a structured upstream bug report. Follow these guidelines:

1. **Accept multiple input formats.** The bug can be described via failed test output, a manual description of the problem, or a code snippet that demonstrates the issue. Extract the relevant details from whatever input is provided.
2. **Generate a structured report.** The report must include all of the following sections:
   - **Title**: Clear, concise summary of the bug (under 80 characters).
   - **Environment**: OS, runtime version, package version, and any relevant configuration.
   - **Reproduction steps**: Numbered step-by-step instructions to reproduce the issue.
   - **Minimal code sample**: The smallest possible code that triggers the bug.
   - **Expected behavior**: What should happen.
   - **Actual behavior**: What actually happens, including error messages or stack traces.
   - **Workaround**: Any known workaround, or "None known" if there is none.
   - **Impact**: Severity and scope of the issue (who is affected, how badly).
3. **Perform duplicate detection before filing.** Search existing issues in the target repository using `gh issue list --search` with relevant keywords. Report any potential duplicates and ask for confirmation before proceeding.
4. **Detect closed-but-not-fixed issues.** If a matching issue was previously closed without a real fix (e.g., closed as stale, closed by bot, or closed without a linked PR/commit), flag it and suggest reopening or filing a new issue referencing the old one.
5. **Show the report for review.** Present the complete formatted report to the user before filing. Wait for confirmation or edits.
6. **File via gh issue create.** Once confirmed, use `gh issue create` with the appropriate repo, title, and body. Apply relevant labels if the user has permission.
7. **Return the filed issue URL.** After filing, output the URL of the newly created issue.

## Examples

- "File a bug against lodash for the merge() deep copy issue" — generates a structured report targeting the lodash repo.
- "This test is failing because of an upstream bug: [paste test output]" — extracts details from the test output and drafts the report.
- "File a bug for this error: TypeError: Cannot read property 'map' of undefined in react-query v5.2.0" — builds the report from the error description.
