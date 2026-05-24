---
name: upgrade-skills
description: Upgrade installed Claude Code skills to a newer version via install.sh
category: devops
tags: [versioning, skills, upgrade, install]
---

# Upgrade Skills

## Purpose

Upgrade the installed Claude Code skills to a newer version. This runs the install script to download the target release tarball from GitHub and extract it to `.claude/skills/`. No Claude restart is required — skills are read on demand from disk, not cached at startup.

## Prompt

Upgrade the installed skills to a target version. Follow these steps in order:

### 1. Check Current Installation

- Look for `.claude/skills/VERSION` to determine the currently installed version
- If `.claude/skills/` doesn't exist, report: "No skills installed. Run: `curl -fsSL https://skills.asymmetric-effort.com/install.sh | sh`"
- Report the current version

### 2. Determine Target Version

**`/upgrade-skills --list`**:
- Query available versions: `curl -fsSL https://api.github.com/repos/asymmetric-effort/skills/releases | jq '.[].tag_name'`
- Display the current version and all available versions
- Highlight which is current and which is latest
- Exit without making changes

**`/upgrade-skills v0.0.N`** (specific version):
- Verify the requested version exists as a GitHub Release
- If it doesn't exist, show available versions and abort
- If it matches the current version, report "already on v0.0.N" and exit

**`/upgrade-skills`** (no arguments):
- Query the latest release: `curl -fsSL https://api.github.com/repos/asymmetric-effort/skills/releases/latest | jq -r .tag_name`
- If already on the latest, report "already up to date at v0.0.N" and exit
- Otherwise, target the latest version

### 3. Show What's New

- Compare the current and target version numbers
- If possible, fetch the release notes for the target version from the GitHub API
- Summarize what changed: new skills added, skills updated

### 4. Run the Install Script

- Execute: `curl -fsSL https://skills.asymmetric-effort.com/install.sh | sh -s <target-version>`
- The install script removes the existing `.claude/skills/` directory and extracts the new version
- Verify the new VERSION file matches the target

### 5. Report

- Confirm the upgrade: "Skills upgraded from v0.0.X to v0.0.Y"
- Report the skill count
- Remind the user: "No restart needed — new skills are available immediately"

## Examples

### List available versions

```
> /upgrade-skills --list

Current: v0.0.20

Available versions:
  v0.0.18  v0.0.19  v0.0.20*  v0.0.21  v0.0.22
  v0.0.23  v0.0.24  v0.0.25

Latest: v0.0.25
```

### Upgrade to latest

```
> /upgrade-skills

Current: v0.0.20 → Target: v0.0.25

Installing v0.0.25...
  Installed 26 skills (v0.0.25)

Skills upgraded from v0.0.20 to v0.0.25
No restart needed — new skills are available immediately.
```

### Upgrade to specific version

```
> /upgrade-skills v0.0.23

Current: v0.0.20 → Target: v0.0.23

Installing v0.0.23...
  Installed 26 skills (v0.0.23)

Skills upgraded from v0.0.20 to v0.0.23
```

### Already up to date

```
> /upgrade-skills

Already up to date at v0.0.25.
```
