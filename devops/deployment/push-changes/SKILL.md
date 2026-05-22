---
name: push-changes
description: Full commit-bump-tag-push cycle with conventional commits, version bumping, and CI/CD monitoring
category: devops/deployment
tags: [git, deployment, versioning, conventional-commits, ci-cd, tagging]
---

# Push Changes

## Purpose

Execute the full commit-bump-tag-push cycle: analyze changes, draft a conventional commit message, bump the patch version, create an annotated git tag, run local verification gates, push commits and tags, and monitor the CI/CD pipeline after push.

## Prompt

Perform a full commit-bump-tag-push cycle for the current repository. Follow these guidelines:

1. **Analyze staged and unstaged changes.** Run `git status` and `git diff` to understand what has changed. Summarize the changes to inform the commit message.
2. **Draft a conventional commit message.** Use the Conventional Commits specification (e.g., `feat:`, `fix:`, `chore:`, `refactor:`). The message should accurately reflect the nature of the changes. Present the draft for confirmation before committing.
3. **Bump the patch version in package.json.** Locate the root `package.json` (and workspace `package.json` files in monorepos) and increment the patch version (e.g., `1.2.3` -> `1.2.4`). Do NOT bump major or minor versions — that is out of scope.
4. **Create an annotated git tag.** After the version bump commit, create an annotated tag matching the new version (e.g., `v1.2.4`) with a message summarizing the release.
5. **Run local verification as a hard gate.** Execute lint and test commands (e.g., `npm run lint`, `npm test`). If either fails, stop the process and report the failure. Do NOT push if verification fails.
6. **Push commits and tags.** Run `git push && git push --tags` to push both commits and tags to the remote.
7. **Monitor the CI/CD pipeline after push.** Use `gh run list` and `gh run watch` to track the triggered workflow run. Report the final status (success/failure) and link to the run.
8. **Out of scope.** Do NOT perform deployment verification, blue-green deployments, major/minor version bumps, or PR creation. Those are handled by other skills.

## Examples

- "Push my changes" — analyzes diff, drafts conventional commit, bumps patch, tags, verifies, pushes, monitors CI.
- "Push changes for the auth module" — scopes analysis to auth-related changes, follows the same cycle.
- "Ship it" — shorthand for the full push-changes cycle.
