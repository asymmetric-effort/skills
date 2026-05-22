---
name: review-pr
description: Automate pull request code review with structured feedback, security checks, and actionable suggestions
category: development
tags: [code-review, pull-request, security, testing, github]
---

# Review PR

## Purpose

Perform structured code review on pull requests: fetch PR details and diff, analyze for correctness and security vulnerabilities, check for test coverage, provide actionable feedback, and optionally post review comments directly on the PR.

## Prompt

You are reviewing a pull request. Follow this workflow precisely:

### Step 1: Fetch PR Details

1. **Get the PR metadata** via `gh pr view <number> --json title,body,commits,files,additions,deletions,baseRefName,headRefName`.
2. **Get the full diff** via `gh pr diff <number>`.
3. **Get existing review comments** via `gh api repos/<owner>/<repo>/pulls/<number>/comments`.
4. **Get PR checks status** via `gh pr checks <number>`.

### Step 2: Understand Context

1. **Read the PR description** — understand what the PR claims to do.
2. **Review the linked issue(s)** — understand the original requirement.
3. **Check the commit history** — are commits well-structured and logically separated?
4. **Identify the scope** — is this a bug fix, feature, refactor, or mixed?

### Step 3: Analyze the Diff

Review every changed file for the following concerns:

#### Correctness
- Does the code do what the PR description says?
- Are there off-by-one errors, null pointer risks, or unhandled edge cases?
- Are error paths handled (try/catch, error returns, fallback behavior)?
- Are race conditions possible in concurrent code?

#### Security (OWASP Top 10)
- **Injection** — SQL, command, template injection in user inputs
- **Broken auth** — hardcoded credentials, missing auth checks, token leakage
- **Sensitive data exposure** — secrets in code, PII in logs, unencrypted storage
- **XXE / deserialization** — unsafe XML or JSON parsing
- **Access control** — missing authorization checks, IDOR vulnerabilities
- **Security misconfiguration** — debug mode, default credentials, permissive CORS
- **XSS** — unsanitized user input rendered in HTML/templates
- **Insecure dependencies** — known vulnerable packages introduced
- **Logging failures** — insufficient logging of security events
- **SSRF** — user-controlled URLs in server-side requests

#### Code Quality
- Is the code readable and well-named?
- Are there unnecessary complexity or over-engineering?
- Does it follow the project's existing patterns and conventions?
- Are there duplicated code blocks that should be extracted?
- Are magic numbers or strings replaced with named constants?

#### Test Coverage
- Are there tests for the new/changed code?
- Do tests cover the happy path AND edge cases?
- Are negative cases tested (invalid input, error conditions)?
- Is test quality high (meaningful assertions, not just "it doesn't throw")?

### Step 4: Produce Structured Review

Format the review as follows:

```markdown
## PR Review: #<number> — <title>

### Summary
One paragraph summarizing what the PR does and overall assessment.

### Approval Recommendation
- **APPROVE** — code is correct, secure, and well-tested
- **REQUEST CHANGES** — issues must be fixed before merge
- **COMMENT** — suggestions for improvement, but not blocking

### Issues Found

#### Critical (must fix)
- [ ] File:line — Description of the issue and why it's critical

#### Suggestions (should fix)
- [ ] File:line — Description of the suggestion and benefit

#### Nits (optional)
- [ ] File:line — Style or naming preference

### Security Assessment
- [ ] No injection vulnerabilities
- [ ] No hardcoded secrets or credential leakage
- [ ] Input validation present where needed
- [ ] Auth/authz checks appropriate

### Test Coverage Assessment
- Coverage of new code: adequate / insufficient / missing
- Missing test cases: <list specific scenarios>

### Questions for Author
- Any clarifying questions about design decisions
```

### Step 5: Post Review (Optional)

If requested, post the review directly on the PR:

1. **Post inline comments** on specific lines using `gh api`:
   ```bash
   gh api repos/<owner>/<repo>/pulls/<number>/comments \
     -f body="<comment>" -f path="<file>" -F line=<line> -f side=RIGHT -f commit_id="<sha>"
   ```
2. **Post the summary** as a PR review:
   ```bash
   gh pr review <number> --comment --body "<review summary>"
   ```

### Rules

- Never approve a PR with known security vulnerabilities.
- Always check for test coverage on new code.
- Be specific — reference exact file and line numbers.
- Be constructive — explain why something is an issue and suggest a fix.
- Distinguish between blocking issues and optional suggestions.

## Examples

**Review a PR by number:**
```
/review-pr 42
```

**Review a PR by URL:**
```
/review-pr https://github.com/org/repo/pull/42
```

**Review and post comments directly:**
```
/review-pr 42 --post
```

**Example output:**
```
## PR Review: #42 — Add JWT validation middleware

### Summary
Adds JWT token validation to the auth middleware. Implementation is correct
but missing error handling for expired tokens and has no tests for the
malformed token path.

### Approval Recommendation: REQUEST CHANGES

### Issues Found

#### Critical
- [ ] src/auth/jwt.ts:28 — `jwt.verify()` called without try/catch. Expired
  or malformed tokens will throw an unhandled exception and crash the server.

#### Suggestions
- [ ] src/auth/jwt.ts:15 — Extract the secret from env var instead of
  hardcoding `"my-secret"` (also a security issue).

### Security Assessment
- [x] No injection vulnerabilities
- [ ] FAIL: Hardcoded JWT secret on line 15
- [x] Input validation present
- [x] Auth checks appropriate

### Test Coverage Assessment
- Coverage: insufficient
- Missing: malformed token test, expired token test, missing header test
```
