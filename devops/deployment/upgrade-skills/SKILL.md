---
name: upgrade-skills
description: Bump the skills git submodule to a newer version tag with changelog preview
category: devops
tags: [submodule, versioning, skills, upgrade, git]
---

# Upgrade Skills

## Purpose

Bump the shared skills git submodule to a newer version tag. This automates the fetch-compare-checkout-commit cycle that every consumer project must perform when new skills are added or updated. No Claude restart is required — skills are read on demand from disk, not cached at startup.

## Prompt

Upgrade the skills submodule to a target version. Follow these steps in order:

### 1. Detect the Submodule

- Look for the skills submodule at `.claude/skills/` (default path)
- If not found, check `.gitmodules` for a submodule pointing to the skills repo
- If no skills submodule exists, report the error and abort: "No skills submodule found. Add one with: `git submodule add git@github.com:asymmetric-effort/skills.git .claude/skills`"

### 2. Check for Local Modifications

- Run `git -C <submodule-path> status --porcelain`
- If there are uncommitted changes in the submodule, **warn and abort**: "Skills submodule has local modifications. Commit or stash them before upgrading."
- Also check the parent repo: if the submodule path is dirty in the parent's working tree, warn before proceeding

### 3. Fetch Available Versions

- Run `cd <submodule-path> && git fetch --tags origin`
- List all semver tags sorted by version: `git tag --sort=v:refname`
- Identify the currently checked-out version: `git describe --tags --exact-match HEAD 2>/dev/null` (fall back to the commit SHA if not on a tag)

### 4. Handle Invocation Modes

**`/upgrade-skills --list`**:
- Display the current version and all available versions
- Highlight which is current and which is latest
- Exit without making changes

**`/upgrade-skills v0.0.N`** (specific version):
- Verify the requested tag exists
- If it doesn't exist, show available tags and abort
- If it matches the current version, report "already on v0.0.N" and exit

**`/upgrade-skills`** (no arguments):
- Determine the latest semver tag
- If already on the latest, report "already up to date at v0.0.N" and exit
- Otherwise, target the latest tag

### 5. Show Changelog

- List commits between the current version and the target: `git log --oneline <current>...<target>`
- Summarize what changed: new skills added, skills updated, documentation changes
- Show the count of commits and affected files

### 6. Checkout the Target Version

- Run `git -C <submodule-path> checkout <target-tag>`
- Verify the checkout succeeded: `git -C <submodule-path> describe --tags --exact-match HEAD`

### 7. Commit the Submodule Pointer Update

- In the parent repo, stage the submodule: `git add <submodule-path>`
- Commit with message: `chore: bump skills to <target-tag>`
- Do not push — let the user or `/push-changes` handle that

### 8. Report

- Confirm the upgrade: "Skills upgraded from v0.0.X to v0.0.Y"
- List new or updated skills (derived from the changelog)
- Remind the user: "No restart needed — new skills are available immediately"

## Examples

### List available versions

```
> /upgrade-skills --list

Skills Submodule: .claude/skills/
Current version: v0.0.12

Available versions:
  v0.0.1   v0.0.2   v0.0.3   v0.0.4   v0.0.5
  v0.0.6   v0.0.7   v0.0.8   v0.0.9   v0.0.10
  v0.0.11  v0.0.12* v0.0.13  v0.0.14  v0.0.15
  v0.0.16  v0.0.17

Latest: v0.0.17
```

### Upgrade to latest

```
> /upgrade-skills

Skills Submodule: .claude/skills/
Current: v0.0.12 → Target: v0.0.17

Changelog (5 versions, 8 commits):
  v0.0.13 — Add check-coverage skill for test coverage analysis
  v0.0.14 — Add ci-status skill for CI/CD pipeline health check
  v0.0.15 — Add project-plan, gap-analysis, and pentest skills
  v0.0.16 — Add CLAUDE.md and comprehensive README
  v0.0.17 — Add upgrade-skills skill

✓ Checked out v0.0.17
✓ Committed: chore: bump skills to v0.0.17

Skills upgraded from v0.0.12 to v0.0.17
No restart needed — new skills are available immediately.
```

### Upgrade to specific version

```
> /upgrade-skills v0.0.14

Skills Submodule: .claude/skills/
Current: v0.0.12 → Target: v0.0.14

Changelog (2 versions, 2 commits):
  v0.0.13 — Add check-coverage skill
  v0.0.14 — Add ci-status skill

✓ Checked out v0.0.14
✓ Committed: chore: bump skills to v0.0.14

Skills upgraded from v0.0.12 to v0.0.14
```

### Already up to date

```
> /upgrade-skills

Skills Submodule: .claude/skills/
Already up to date at v0.0.17.
```

### Local modifications detected

```
> /upgrade-skills

Skills Submodule: .claude/skills/
⚠ Skills submodule has local modifications:
  M security/pentest/SKILL.md
  ?? security/custom-skill/

Commit or stash local changes before upgrading. Aborting.
```
