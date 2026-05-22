---
name: commit
description: Automate git commits with conventional messages, staged change analysis, and co-authorship attribution
category: development
tags: [git, commit, conventional-commits, automation, workflow]
---

# Commit

## Purpose

Automate the git commit workflow: analyze staged and unstaged changes, match the repository's commit message style, draft a conventional commit message, stage relevant files (while avoiding secrets), create the commit with co-authorship attribution, and handle pre-commit hook failures gracefully.

## Prompt

You are creating a git commit. Follow this workflow precisely:

### Step 1: Analyze Changes

1. **Run `git status`** to see all tracked, untracked, staged, and unstaged files. Never use the `-uall` flag.
2. **Run `git diff`** to see unstaged changes and `git diff --cached` to see staged changes.
3. **Run `git log --oneline -10`** to review recent commit messages and match the repository's style.
4. **Identify secret files** — warn and exclude any files matching these patterns:
   - `.env`, `.env.*`
   - `credentials.json`, `secrets.yml`, `*.pem`, `*.key`
   - Any file containing `token`, `secret`, `password`, or `api_key` in its name

### Step 2: Draft the Commit Message

1. **Determine the change type** from the diff content:
   - `feat:` — new feature or capability
   - `fix:` — bug fix
   - `test:` — adding or updating tests
   - `docs:` — documentation changes only
   - `refactor:` — code restructuring without behavior change
   - `perf:` — performance improvement
   - `chore:` — maintenance, dependency updates, config changes
   - `ci:` — CI/CD pipeline changes
   - `style:` — formatting, whitespace, semicolons (no logic change)
2. **Write a concise message** (under 72 characters for the subject line) that describes the "why" not the "what."
3. **Add a body** (separated by blank line) for complex changes explaining motivation and context.
4. If the user provided a `-m` flag, use their message instead of drafting one.

### Step 3: Stage Files

1. **Stage relevant files** by name — prefer `git add <file1> <file2>` over `git add -A` or `git add .`.
2. **Never stage** files likely containing secrets (see Step 1).
3. **Review the final staging** with `git diff --cached --stat` before committing.

### Step 4: Create the Commit

1. **Commit** with the drafted message.
2. **Include co-authorship** attribution in every commit:
   ```
   Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
   ```
3. **Use a HEREDOC** for the commit message to preserve formatting:
   ```bash
   git commit -m "$(cat <<'EOF'
   feat: add user authentication middleware

   Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
   EOF
   )"
   ```

### Step 5: Handle Pre-Commit Hook Failures

1. **If a pre-commit hook fails**, the commit did NOT happen.
2. **Fix the issue** reported by the hook (lint errors, formatting, type errors).
3. **Re-stage** the fixed files.
4. **Create a NEW commit** — NEVER use `--amend`, as that would modify the previous commit, not the failed one.
5. **Never skip hooks** with `--no-verify` unless the user explicitly requests it.

### Step 6: Verify

1. **Run `git status`** after the commit to confirm success.
2. **Run `git log -1`** to display the new commit.

### Rules (Never Break These)

- Never amend existing commits unless the user explicitly asks.
- Never stage files likely containing secrets.
- Never use `git add -A` or `git add .` — always add specific files.
- Never skip pre-commit hooks.
- Always include the co-authorship trailer.
- If there are no changes to commit, do not create an empty commit.

## Examples

**Basic commit (auto-drafted message):**
```
/commit
```
Output:
```
Analyzed 3 changed files:
  M src/auth/middleware.ts
  M src/auth/middleware.test.ts
  A src/auth/types.ts

Committed: feat: add JWT validation to auth middleware

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```

**Commit with user-supplied message:**
```
/commit -m "fix: handle null user in session middleware"
```

**Commit with pre-commit hook failure:**
```
/commit
> Pre-commit hook failed: eslint found 2 errors in src/auth/middleware.ts
> Fixed: added missing semicolons
> Re-staged src/auth/middleware.ts
> Committed: feat: add JWT validation to auth middleware
```
