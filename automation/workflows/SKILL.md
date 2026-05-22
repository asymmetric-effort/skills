---
name: resolve-issues
description: Automate the workflow of resolving GitHub issues using TDD, git worktrees, pull requests, and automated releases
category: automation
tags: [github, issues, tdd, worktrees, ci-cd, automation, releases]
---

# Resolve Issues

## Purpose

Automate the end-to-end workflow of resolving GitHub issues: listing open issues by label, creating isolated worktree branches, implementing fixes via TDD, validating through lint/test/build, creating pull requests, waiting for CI, merging, and optionally cutting a release with version bump and tagging.

## Prompt

You are resolving GitHub issues in an automated, structured workflow. Follow these steps precisely:

### Step 1: Issue Discovery

1. **List open issues** filtered by label (default: issues assigned to the current user or labeled for automation).
   ```bash
   gh issue list -R <owner/repo> --state open --label <label> --json number,title,body,labels
   ```
2. **Sort by priority** — process `high priority` and `critical` labels first, then by issue number (oldest first).
3. **Skip issues** that are blocked by other issues (check for "blocked" label or cross-references).

### Step 2: Worktree Branch (per issue)

1. **Create a git worktree** for the issue to isolate work from the main branch:
   ```bash
   git worktree add ../worktree-issue-<number> -b issue-<number>/short-description main
   ```
2. Work inside the worktree directory for all subsequent steps.
3. Worktrees prevent interference between concurrent issue resolutions and keep `main` clean.

### Step 3: TDD Implementation

1. **Write failing tests first** that capture the expected behavior described in the issue.
2. **Run the test suite** to confirm the new tests fail (red phase).
3. **Implement the minimum code** to make the tests pass (green phase).
4. **Refactor** if needed while keeping tests green.
5. **Run the full test suite** to ensure no regressions.

### Step 4: Validation (Hard Gate)

Run all validation checks — **do not proceed** if any fail:

1. **Linting** — `eslint`, `prettier --check`, or the project's configured linter.
2. **Type checking** — `tsc --noEmit` or equivalent.
3. **Full test suite** — all tests must pass.
4. **Build** — `npm run build` or equivalent must succeed.

If any check fails, fix the issue and re-validate before proceeding.

### Step 5: Commit and Push

1. Stage all changes and commit with a descriptive message referencing the issue:
   ```
   fix: resolve #<number> — <short description>
   ```
2. Push the worktree branch to origin:
   ```bash
   git push origin issue-<number>/short-description
   ```

### Step 6: Pull Request

1. **Create a PR** using `gh pr create` with:
   - Title referencing the issue: `fix: <description> (closes #<number>)`
   - Body summarizing changes, test coverage, and linking the issue
   - The `closes #<number>` keyword to auto-close the issue on merge
2. **Wait for CI** — monitor the PR's checks until they pass or fail.
3. **On CI failure** — diagnose, fix in the worktree, push, and wait again.
4. **On CI success** — merge the PR (prefer squash merge for clean history).

### Step 7: Cleanup

1. Remove the worktree: `git worktree remove ../worktree-issue-<number>`
2. Delete the local and remote branch if merged.

### Step 8: Release (after all issues resolved)

1. **Bump the patch version** in `package.json` (or the project's version file).
2. **Commit** the version bump: `chore: bump version to X.Y.Z`
3. **Create an annotated tag**: `git tag -a vX.Y.Z -m "vX.Y.Z"`
4. **Push** commits and tags: `git push && git push --tags`
5. **Publish** if applicable (e.g., `npm publish`).

### Configuration (parameterize for reuse)

The following values should be adapted per repository:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `repo` | GitHub repository (owner/repo) | `asymmetric-effort/my-project` |
| `label` | Issue label filter | `approved-for-claude` |
| `build_cmd` | Build command | `npm run build` |
| `test_cmd` | Test command | `npm test` |
| `lint_cmd` | Lint command | `npm run lint` |
| `version_file` | Version file path | `package.json` |
| `publish_cmd` | Publish command (optional) | `npm publish` |

## Examples

**Resolve all issues labeled "approved-for-claude":**
```
/resolve-issues --label approved-for-claude
```

**Resolve a specific issue:**
```
/resolve-issues --issue 42
```

**Resolve issues without publishing a release:**
```
/resolve-issues --label bug --no-release
```

**Example workflow output:**
```
## Resolve Issues Report

### Processed (3 issues)
- #42 [fix] useState throws on unmounted component — merged via PR #58
- #38 [feat] Add useTransition hook — merged via PR #59
- #35 [fix] SSR hydration mismatch — merged via PR #60

### Release
- Version bumped: 0.2.98 → 0.2.99
- Tag: v0.2.99
- Published to npm

### Skipped (1 issue)
- #40 — blocked by #42 (resolved this run, eligible next run)
```
