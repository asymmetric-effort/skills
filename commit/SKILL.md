---
name: commit
description: Analyze changes and create well-structured conventional git commits with co-authorship
category: development
tags: [git, commit, conventional-commits, workflow, version-control]
source_path: development/commit
class: development
subclass: commit
---

# Commit

## Purpose

Create well-structured git commits by analyzing staged and unstaged changes, reviewing recent commit history for style consistency, and drafting conventional commit messages. Handles the full commit workflow including staging, message drafting, pre-commit hook failures, and post-commit verification.

## Prompt

Create a git commit for the current changes. Follow these guidelines:

1. **Analyze the working tree first.** Run `git status` to see all untracked and modified files. Run `git diff` and `git diff --staged` to understand both staged and unstaged changes. Never use the `-uall` flag as it can cause memory issues on large repos.
2. **Review recent commit history.** Run `git log --oneline -10` to understand the repository's commit message style and conventions. Match the existing patterns.
3. **Draft a conventional commit message.** Use the appropriate prefix based on the nature of the change:
   - `feat:` — a new feature
   - `fix:` — a bug fix
   - `test:` — adding or updating tests
   - `docs:` — documentation changes
   - `refactor:` — code restructuring without behavior change
   - `perf:` — performance improvements
   - `chore:` — maintenance, dependencies, tooling
4. **Focus on the "why" not the "what".** The diff shows what changed; the commit message should explain why. Keep it concise (1-2 sentences). Use the body for details if needed.
5. **Stage files carefully.** Prefer adding specific files by name rather than `git add -A` or `git add .`. Never stage files that likely contain secrets (`.env`, `credentials.json`, API keys, tokens). Warn the user if they request committing such files.
6. **Add co-authorship.** Append the co-author trailer to every commit message:
   ```
   Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
   ```
7. **Use a HEREDOC for the commit message.** Always pass the commit message via HEREDOC to ensure correct formatting with multi-line messages:
   ```bash
   git commit -m "$(cat <<'EOF'
   feat: add user profile validation

   Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
   EOF
   )"
   ```
8. **Verify after committing.** Run `git status` after the commit to confirm it succeeded and the working tree is in the expected state.
9. **Handle pre-commit hook failures.** If a pre-commit hook fails, the commit did NOT happen. Fix the issue, re-stage the files, and create a NEW commit. Never use `--amend` after a hook failure — that would modify the previous commit and risk losing work.
10. **Support optional -m flag.** If the user provides a message via `-m`, use it directly (with co-authorship appended) instead of drafting one.
11. **Never skip hooks.** Do not use `--no-verify` or `--no-gpg-sign` unless the user explicitly requests it.

## Examples

**Standard commit flow:**
```bash
git status
git diff --staged
git log --oneline -10
git add src/validation.ts src/validation.test.ts
git commit -m "$(cat <<'EOF'
feat: add email format validation to user registration

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
git status
```

**After pre-commit hook failure:**
```bash
# Hook failed — fix linting issues
npm run lint -- --fix
git add src/validation.ts
# Create a NEW commit (never --amend after hook failure)
git commit -m "$(cat <<'EOF'
feat: add email format validation to user registration

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

**With user-provided message:**
```bash
git commit -m "$(cat <<'EOF'
fix: correct off-by-one error in pagination

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```
