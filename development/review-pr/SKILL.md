---
name: review-pr
description: Perform structured code reviews on GitHub pull requests with actionable feedback
category: development
tags: [code-review, pull-requests, github, quality, security]
---

# Review PR

## Purpose

Perform thorough code reviews on GitHub pull requests — analyzing for correctness, security, style, and test coverage, then providing structured feedback with an approval recommendation. Optionally post inline review comments directly on the PR.

## Prompt

Review a GitHub pull request. Follow these guidelines:

1. **Accept PR input flexibly.** Support both PR numbers and full URLs. Extract the owner, repo, and PR number as needed. Use the `gh` CLI for all GitHub interactions.
2. **Fetch PR details.** Run `gh pr view <number> --json title,body,files,additions,deletions,baseRefName,headRefName` to get the PR metadata. Run `gh pr diff <number>` to get the full diff.
3. **Understand the context.** Read the PR description, linked issues, and any conversation. Understand what the change is intended to do before judging the implementation.
4. **Analyze for correctness.** Check each changed file for:
   - Logic errors, off-by-one mistakes, null/undefined handling
   - Edge cases not covered by the implementation
   - Breaking changes to existing interfaces or contracts
   - Race conditions or concurrency issues
5. **Analyze for security.** Look for:
   - Injection vulnerabilities (SQL, XSS, command injection)
   - Exposed secrets, hardcoded credentials, or API keys
   - Missing input validation or sanitization
   - Insecure dependencies or configurations
   - Authentication/authorization gaps
6. **Check test coverage.** Verify that:
   - New functionality has corresponding tests
   - Edge cases and error paths are tested
   - Tests are meaningful (not just asserting truthy values)
   - Existing tests are not broken or removed without justification
7. **Evaluate style and consistency.** Check adherence to the project's existing conventions for naming, formatting, file organization, and documentation.
8. **Provide structured feedback.** Organize the review into clear sections:
   - **Summary:** One-paragraph overview of what the PR does and overall assessment
   - **Issues:** Bugs, security problems, or correctness concerns that must be fixed (label severity: critical/major/minor)
   - **Suggestions:** Non-blocking improvements for code quality, readability, or performance
   - **Approval recommendation:** Approve, request changes, or comment-only, with justification
9. **Optionally post inline comments.** If requested, use `gh api` to submit a pull request review with inline comments on specific lines. Group related comments into a single review submission.
10. **Be constructive.** Focus on the code, not the author. Explain why something is a problem and suggest a fix. Acknowledge good patterns when you see them.

## Examples

**Review by PR number:**
```bash
gh pr view 42 --json title,body,files,additions,deletions
gh pr diff 42
```

**Review by URL:**
```bash
# Input: https://github.com/acme/widget/pull/42
gh pr view 42 -R acme/widget --json title,body,files
gh pr diff 42 -R acme/widget
```

**Structured feedback output:**
```markdown
## Summary
This PR adds rate limiting to the /api/users endpoint. The implementation
is solid overall but has one correctness issue with the sliding window
calculation.

## Issues
- **[Critical]** `rateLimiter.ts:45` — The window slides by wall-clock
  time but tokens are counted by request time, causing drift under load.
- **[Minor]** `config.ts:12` — Rate limit threshold is hardcoded;
  should come from environment config.

## Suggestions
- Consider adding a test for the boundary case when the window resets
  exactly at the rate limit count.
- The error message on line 38 could include the retry-after header value.

## Recommendation
**Request changes** — the sliding window bug needs to be fixed before merge.
```
