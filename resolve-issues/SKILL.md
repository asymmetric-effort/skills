---
name: resolve-issues
description: Automate resolving GitHub issues end-to-end using TDD, git worktrees, PRs, and automated releases
category: automation/workflows
tags: [automation, github, tdd, worktrees, ci-cd, pull-requests, releases]
source_path: automation/workflows/resolve-issues
class: automation
subclass: workflows
---

# Resolve Issues

## Purpose

Automate the full lifecycle of resolving GitHub issues — from listing open issues by label through TDD implementation in git worktrees, PR creation, CI validation, merge, and finally a versioned release. Designed to batch-process multiple issues in a single run with full parameterization for different repos and toolchains.

## Prompt

Automate resolving GitHub issues for a repository. Follow these guidelines:

1. **Accept parameters up front.** The workflow must be parameterized with at minimum: repository name (owner/repo), package manager (npm, pnpm, yarn, pip, go, etc.), and build/test/lint commands. Never hardcode repo-specific values.
2. **List open issues by label.** Use `gh issue list` filtered by a configurable label (e.g., `bug`, `enhancement`, `autofix`). Parse issue number, title, and body for each.
3. **For each issue, create a worktree branch.** Use `git worktree add` to create an isolated working directory on a new branch named after the issue (e.g., `fix/issue-42`). This prevents conflicts between parallel issue resolutions.
4. **Implement using TDD.** For each issue:
   - Write a failing test that captures the expected behavior described in the issue.
   - Implement the minimal code change to make the test pass.
   - Refactor if needed while keeping tests green.
5. **Validate before committing.** Run the full validation suite in order: lint, test, build. All three must pass before proceeding. If any step fails, fix the issue and re-validate.
6. **Create a pull request.** Use `gh pr create` with a descriptive title referencing the issue number and a body summarizing the change. Link the PR to the issue using `Closes #N` in the body.
7. **Wait for CI to pass.** Poll the PR's check status using `gh pr checks` or `gh run list`. Do not merge until all required checks are green. If CI fails, diagnose and fix.
8. **Merge the PR.** Use `gh pr merge` with squash or merge commit per the repo's convention. Clean up the worktree branch after merge with `git worktree remove`.
9. **After all issues are resolved, cut a release.** Bump the patch version (using the repo's versioning tool or manually), create a git tag, push the tag, and create a GitHub release using `gh release create`.
10. **Handle failures gracefully.** If any issue cannot be resolved, log the failure, skip it, and continue with remaining issues. Provide a summary at the end listing successes and failures.

## Examples

**Basic invocation:**
```
Resolve all issues labeled "autofix" in myorg/myrepo using npm.
Lint: npm run lint, Test: npm test, Build: npm run build.
```

**Parameterized workflow:**
```
repo: acme/widget-lib
package_manager: pnpm
label: bug
lint: pnpm lint
test: pnpm test
build: pnpm build
```

**Expected flow for a single issue:**
```
1. gh issue list -l autofix -R acme/widget-lib
2. git worktree add ../worktree-42 -b fix/issue-42
3. cd ../worktree-42
4. Write failing test -> implement fix -> tests pass
5. pnpm lint && pnpm test && pnpm build
6. gh pr create --title "fix: resolve issue #42" --body "Closes #42"
7. gh pr checks 123 --watch
8. gh pr merge 123 --squash
9. git worktree remove ../worktree-42
```

**Release step after all issues:**
```
npm version patch
git push --tags
gh release create v1.2.4 --generate-notes
```
