<p align="center">
  <img src="logo.png" alt="Skills" width="128" height="128" />
</p>

<h1 align="center">Skills</h1>

<p align="center">
  A centralized, versioned library of reusable <a href="https://claude.ai/claude-code">Claude Code</a> skills for the Asymmetric Effort organization.
</p>

<p align="center">
  <a href="https://skills.asymmetric-effort.com">Documentation</a> ·
  <a href="https://github.com/asymmetric-effort/skills/issues">Issues</a>
</p>

## What Are Skills?

Skills are structured Markdown files that teach Claude Code how to perform specific tasks. Each skill contains a prompt with detailed instructions, guidelines, and examples that Claude follows when the skill is invoked as a slash command (e.g., `/push-changes`, `/pentest`, `/commit`). Think of them as reusable playbooks — instead of re-explaining a workflow every session, you invoke a skill and Claude executes it consistently.

## Why a Shared Repository?

Without a shared skills repo, every project reinvents the same prompts: "how to commit," "how to review a PR," "how to run a security audit." This repo solves that by:

- **Centralizing** skills so they're written once and used everywhere
- **Versioning** skills with semver tags so projects can pin to stable versions
- **Standardizing** the format so skills are predictable and composable
- **Growing** the library over time as new workflows are identified

## Onboarding a New Project

### Prerequisites

- Git with submodule support
- [Claude Code](https://claude.ai/claude-code) CLI, desktop app, or IDE extension
- SSH access to `github.com:asymmetric-effort` (for private repos)

### Step 1: Add the Submodule

From your project's root directory:

```bash
git submodule add -b release git@github.com:asymmetric-effort/skills.git .claude/skills
git commit -m "chore: add shared skills submodule"
git push
```

This clones the `release` branch (the published artifact, not the source tree) into `.claude/skills/`.

### Step 2: Verify the Structure

After adding the submodule, you should see:

```
your-project/
  .claude/
    skills/
      commit/
        SKILL.md
      push-changes/
        SKILL.md
      pentest/
        SKILL.md
      review-pr/
        SKILL.md
      ...26 skill directories...
      skills.json         # Metadata index of all skills
      VERSION             # Current version
```

Each skill is a directory containing a `SKILL.md` file. This is the format Claude Code expects for automatic discovery.

### Step 3: Verify Claude Code Discovers the Skills

Start or restart Claude Code in your project directory. Type `/` and you should see the shared skills in the autocomplete menu alongside any built-in skills. Try:

```
/push-changes
/commit
/pentest
```

If skills don't appear, see [Troubleshooting](#troubleshooting) below.

### Step 4: Initialize Submodule on Clone

When team members clone your project, they need to initialize the submodule:

```bash
git clone --recurse-submodules git@github.com:asymmetric-effort/your-project.git
```

Or, if already cloned without submodules:

```bash
git submodule init
git submodule update
```

### Step 5: Keep Skills Updated

To pull the latest skills:

```bash
cd .claude/skills
git pull origin release
cd ../..
git add .claude/skills
git commit -m "chore: update skills to latest"
```

Or invoke `/upgrade-skills` from within Claude Code to automate this.

## Architecture: Two Branches

This repo uses a two-branch publishing model:

| Branch | Purpose | Contents |
|--------|---------|----------|
| `main` | **Authoring** — where skills are written and organized | Nested tree: `<class>/<subclass>/<skill>/SKILL.md` |
| `release` | **Consumption** — what projects install as a submodule | Flat directories: `<skill-name>/SKILL.md` + `skills.json` index |

A CI pipeline (`publish-skills` job) automatically flattens the source tree and publishes to the `release` branch on every push to `main`. **Consumer projects must always reference the `release` branch**, never `main`.

### How Publishing Works

1. Author adds/edits a skill in the nested source tree on `main` (e.g., `security/auditing/audit-deps/SKILL.md`)
2. Push to `main` triggers CI
3. The `flatten-skills.mjs` script reads all `SKILL.md` files, injects metadata (`source_path`, `class`, `subclass`), and outputs them as `<name>/SKILL.md` directories
4. CI force-pushes the flattened output to the `release` branch
5. Consumer projects pull the `release` branch to get the update

### Published Skill Format

Each published `SKILL.md` on the `release` branch has additional frontmatter fields injected:

```yaml
---
name: audit-deps
description: Deep supply chain and dependency audit
category: security/auditing
tags: [security, dependencies, supply-chain]
source_path: security/auditing/audit-deps    # Where it lives in the source tree
class: security                               # Top-level class
subclass: auditing                            # Subclass within the class
---
```

A `skills.json` index file is also published listing all skills with their metadata.

## Skill Catalog

### Automation

| Skill | Invocation | Description |
|-------|------------|-------------|
| loop | `/loop` | Recurring prompt execution with fixed-interval and dynamic modes |
| monitor-issues | `/monitor-issues` | Triage GitHub issues filtered by trusted sources |
| monitor-upstream | `/monitor-upstream` | Track dependency releases and verify upstream fixes |
| resolve-issues | `/resolve-issues` | Automated issue resolution with TDD, worktrees, and PRs |
| schedule | `/schedule` | Cloud remote agent trigger CRUD via RemoteTrigger API |
| scheduling | `/scheduling` | Set up scheduled and recurring tasks using cron and timers |

### Data

| Skill | Invocation | Description |
|-------|------------|-------------|
| pdf | `/pdf` | PDF reading, analysis, and content extraction |

### Development

| Skill | Invocation | Description |
|-------|------------|-------------|
| commit | `/commit` | Git commit workflow with conventional messages |
| file-bug | `/file-bug` | Structured upstream bug reports with duplicate detection |
| gap-analysis | `/gap-analysis` | Compare two projects for feature compatibility gaps |
| project-plan | `/project-plan` | Consume markdown plan files and generate GitHub issues |
| review-pr | `/review-pr` | Pull request code review with structured feedback |

### DevOps

| Skill | Invocation | Description |
|-------|------------|-------------|
| blue-green-deploy | `/blue-green-deploy` | Staged deployment with PDV gates, promotion, and rollback |
| ci-status | `/ci-status` | CI/CD pipeline health check with failure classification |
| push-changes | `/push-changes` | Full commit-bump-tag-push cycle with CI monitoring |
| upgrade-skills | `/upgrade-skills` | Bump the skills submodule to a newer version |

### Jokes

| Skill | Invocation | Description |
|-------|------------|-------------|
| code-humor | `/code-humor` | Programming jokes and tech comedy |
| easter-eggs | `/easter-eggs` | Hidden features and surprise interactions |
| epitaphs | `/epitaphs` | Witty, darkly humorous tombstone inscriptions |
| one-liners | `/one-liners` | Quick, punchy single-line jokes |
| puns | `/puns` | Wordplay, double meanings, groan-worthy puns |
| storytelling | `/storytelling` | Humorous narratives and shaggy dog stories |

### Security

| Skill | Invocation | Description |
|-------|------------|-------------|
| audit-deps | `/audit-deps` | Deep supply chain and dependency audit |
| pentest | `/pentest` | White-box penetration test code review |

### Testing

| Skill | Invocation | Description |
|-------|------------|-------------|
| check-coverage | `/check-coverage` | Test coverage analysis with gap identification |
| pdv | `/pdv` | Playwright post-deployment verification |

## Troubleshooting

### Skills don't appear in Claude Code autocomplete

**Check the submodule is on the `release` branch:**
```bash
cd .claude/skills
git branch -a
# Should show: * (HEAD detached at ...) with origin/release
```

If it's on `main`, you have the source tree (nested `SKILL.md` files) instead of the published format (`<name>/SKILL.md` directories). Fix:
```bash
git submodule deinit -f .claude/skills
git rm -f .claude/skills
rm -rf .git/modules/.claude
git submodule add -b release git@github.com:asymmetric-effort/skills.git .claude/skills
```

**Check the directory structure is correct:**
```bash
ls .claude/skills/push-changes/
# Should show: SKILL.md
```

If you see flat `.md` files instead of directories, you have an old version. Update:
```bash
cd .claude/skills && git pull origin release && cd ../..
```

**Check Claude Code is running from the right directory:**
Claude Code discovers skills by walking up from the working directory. If you start Claude Code from a parent directory that doesn't contain `.claude/skills/`, the skills won't be found. Start Claude Code from your project root.

**Restart Claude Code:**
Skills are discovered on session start. If you added the submodule during an active session, restart Claude Code to trigger discovery.

### Submodule not initialized after clone

```bash
git submodule init
git submodule update
```

Or clone with `--recurse-submodules` next time.

### Permission denied on submodule clone

Ensure you have SSH access to the skills repo:
```bash
ssh -T git@github.com
```

If using HTTPS instead of SSH:
```bash
git submodule set-url .claude/skills https://github.com/asymmetric-effort/skills.git
git submodule update --remote
```

## Contributing

### Adding a New Skill

1. **Pick the right location.** Find the class and subclass that best fits. If none fits, create a new one.

2. **Create the skill directory and files:**
   ```bash
   mkdir -p <class>/<subclass>/<skill-name>
   cp SKILL_TEMPLATE.md <class>/<subclass>/<skill-name>/SKILL.md
   echo "# <skill-name>" > <class>/<subclass>/<skill-name>/README.md
   ```

3. **Write the skill.** Fill in all sections of `SKILL.md`. The Prompt section should be detailed enough that Claude can execute it without ambiguity.

4. **Update parent READMEs.** Add entries to the subclass and class `README.md` tables in alphabetical order.

5. **Verify no naming collisions:**
   ```bash
   node site/scripts/flatten-skills.mjs
   ```

6. **Test the skill.** Invoke it in a real project to verify it works.

7. **Commit, tag, and push:**
   ```bash
   git add .
   git commit -m "feat: add <skill-name> skill for <purpose>"
   git tag -a v0.0.N -m "v0.0.N"
   git push origin main --tags
   ```

CI will automatically flatten and publish the skill to the `release` branch. Consumer projects pull the update with `cd .claude/skills && git pull origin release`.

### Requesting a Skill

[Open an issue](https://github.com/asymmetric-effort/skills/issues/new) with the title format:

```
Create reusable skill: <name> (<short description>)
```

Issues from authorized users are automatically resolved by Claude.

## Skill File Format (Source)

Every skill on the `main` branch is a `SKILL.md` file with YAML frontmatter and three required sections:

```markdown
---
name: skill-name
description: One-line description of what this skill does
category: class-name
tags: [relevant, tags]
---

# Skill Name

## Purpose

What this skill accomplishes and when to use it.

## Prompt

Detailed instructions Claude follows when this skill is invoked.

## Examples

Sample invocations, inputs, outputs, or generated artifacts.
```

**The `name` field must be globally unique.** The flatten script enforces this and will fail on collisions.

## CI/CD Pipeline

Every push to `main` triggers:

1. **build-site** — Generate skill data, build the documentation site, run 12 pre-deployment Playwright tests
2. **deploy** — Publish the documentation site to GitHub Pages at [skills.asymmetric-effort.com](https://skills.asymmetric-effort.com)
3. **publish-skills** — Flatten the skill tree to `<name>/SKILL.md` directories and force-push to the `release` branch
4. **pdv** — Run 17 post-deployment verification tests against the live site

Additional CI:
- **CodeQL** — Weekly security scanning
- **Dependabot** — Automated dependency updates for npm packages and GitHub Actions

## Versioning

This repo uses semantic versioning with patch-only bumps:

- **v0.0.N** — each new skill or skill update increments the patch version
- Tags are annotated: `git tag -a v0.0.N -m "v0.0.N"`
- Consumer projects get updates by pulling the `release` branch
- Breaking changes (skill renames, deletions) will bump minor version with a deprecation notice

## License

Copyright Asymmetric Effort, LLC. All rights reserved.
