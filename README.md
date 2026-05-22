# Skills

A centralized, versioned library of reusable [Claude Code](https://claude.ai/claude-code) skills for the Asymmetric Effort organization.

## What Are Skills?

Skills are structured Markdown files that teach Claude Code how to perform specific tasks. Each skill contains a prompt with detailed instructions, guidelines, and examples that Claude follows when the skill is invoked. Think of them as reusable playbooks — instead of re-explaining a workflow every session, you invoke a skill and Claude executes it consistently.

## Why a Shared Repository?

Without a shared skills repo, every project reinvents the same prompts: "how to commit," "how to review a PR," "how to run a security audit." This repo solves that by:

- **Centralizing** skills so they're written once and used everywhere
- **Versioning** skills with semver tags so projects can pin to stable versions
- **Standardizing** the format so skills are predictable and composable
- **Growing** the library over time as new workflows are identified

## Quick Start

### Adding Skills to Your Project

Add this repo as a git submodule in your project:

```bash
git submodule add git@github.com:asymmetric-effort/skills.git .claude/skills
git commit -m "chore: add shared skills submodule"
```

To pin to a specific version:

```bash
cd .claude/skills
git fetch --tags
git checkout v0.0.15
cd ../..
git add .claude/skills
git commit -m "chore: pin skills to v0.0.15"
```

To upgrade later:

```bash
cd .claude/skills
git fetch --tags
git checkout v0.0.20    # or whatever the latest tag is
cd ../..
git add .claude/skills
git commit -m "chore: bump skills to v0.0.20"
```

### Using a Skill

Once the submodule is in place, invoke skills by referencing them in your Claude Code session:

```
/skill-name
```

Claude reads the corresponding `SKILL.md` and follows the instructions within it.

## Repository Structure

```
skills/
├── CLAUDE.md               # Project instructions for Claude
├── README.md               # This file
├── SKILL_TEMPLATE.md       # Template for creating new skills
│
├── automation/             # Workflow automation, scripting, scheduled tasks
│   ├── integrations/       # Third-party service and API integrations
│   │   └── monitor-upstream/   # Track external dependency releases and issues
│   ├── scheduling/         # Cron jobs, timers, recurring tasks
│   │   ├── loop/           # Recurring prompt execution within sessions
│   │   └── schedule/       # Cloud remote agent trigger management
│   └── workflows/          # Multi-step process orchestration
│       ├── monitor-issues/ # Triage and action GitHub issues from trusted sources
│       └── resolve-issues/ # Automated issue resolution with TDD and worktrees
│
├── data/                   # Data processing, analysis, transformation
│   └── processing/         # Parsing, cleaning, normalization
│       └── pdf/            # PDF reading, analysis, and content extraction
│
├── development/            # Coding, debugging, refactoring, architecture
│   ├── commit/             # Automated git commit with conventional messages
│   ├── debugging/          # Root cause analysis, logging, tracing
│   │   └── file-bug/       # Structured upstream bug reports
│   ├── gap-analysis/       # Compare two projects for feature compatibility gaps
│   ├── project-plan/       # Consume plan files and generate GitHub issues
│   └── review-pr/          # Automated pull request code review
│
├── devops/                 # CI/CD, containers, infrastructure, deployment
│   ├── ci-cd/              # Pipeline configuration, build automation
│   │   └── ci-status/      # CI/CD pipeline health check and diagnostics
│   └── deployment/         # Release strategies, rollbacks
│       └── push-changes/   # Commit-bump-tag-push cycle
│
├── documentation/          # Writing docs, READMEs, changelogs, ADRs
│   ├── adrs/               # Architecture Decision Records
│   ├── api-docs/           # API reference and usage documentation
│   ├── changelogs/         # Release notes and changelog generation
│   ├── readmes/            # Project and package README creation
│   ├── runbooks/           # Operational procedures and playbooks
│   └── tutorials/          # Step-by-step guides and walkthroughs
│
├── jokes/                  # Fun, humor, easter eggs
│   ├── code-humor/         # Programming jokes and tech comedy
│   ├── easter-eggs/        # Hidden features and surprise interactions
│   ├── epitaphs/           # Witty, darkly humorous tombstone inscriptions
│   ├── one-liners/         # Quick single-line jokes
│   ├── puns/               # Wordplay and groan-worthy puns
│   └── storytelling/       # Humorous narratives and scenarios
│
├── security/               # Auditing, hardening, vulnerability analysis
│   ├── auditing/           # Code and infrastructure security audits
│   │   └── audit-deps/     # Deep supply chain and dependency audit
│   ├── cryptography/       # Encryption, hashing, key management
│   ├── hardening/          # System and application hardening
│   ├── incident-response/  # Triage, forensics, remediation
│   ├── pentest/            # White-box penetration test code review
│   ├── secure-coding/      # Defensive coding patterns
│   └── vulnerability-analysis/  # CVE analysis, dependency scanning
│
└── testing/                # Test creation, coverage, fuzzing, benchmarks
    ├── benchmarks/         # Performance testing and profiling
    ├── e2e/                # End-to-end and acceptance testing
    │   └── pdv/            # Playwright post-deployment verification
    ├── fuzzing/            # Fuzz testing and property-based testing
    ├── integration/        # Integration and contract testing
    ├── test-strategy/      # Coverage planning, test pyramid
    │   └── check-coverage/ # Test coverage analysis and gap identification
    └── unit/               # Unit test creation and mocking patterns
```

## Skill Catalog

### Automation

| Skill | Path | Description |
|-------|------|-------------|
| loop | `automation/scheduling/loop/` | Recurring prompt execution with fixed-interval and dynamic modes |
| monitor-issues | `automation/workflows/monitor-issues/` | Triage GitHub issues filtered by trusted sources |
| monitor-upstream | `automation/integrations/monitor-upstream/` | Track dependency releases and verify upstream fixes |
| resolve-issues | `automation/workflows/resolve-issues/` | Automated issue resolution with TDD, worktrees, and PRs |
| schedule | `automation/scheduling/schedule/` | Cloud remote agent trigger CRUD via RemoteTrigger API |

### Data

| Skill | Path | Description |
|-------|------|-------------|
| pdf | `data/processing/pdf/` | PDF reading, analysis, and content extraction |

### Development

| Skill | Path | Description |
|-------|------|-------------|
| commit | `development/commit/` | Git commit workflow with conventional messages |
| file-bug | `development/debugging/file-bug/` | Structured upstream bug reports with duplicate detection |
| gap-analysis | `development/gap-analysis/` | Compare two projects for feature compatibility gaps |
| project-plan | `development/project-plan/` | Consume markdown plan files and generate GitHub issues |
| review-pr | `development/review-pr/` | Pull request code review with structured feedback |

### DevOps

| Skill | Path | Description |
|-------|------|-------------|
| ci-status | `devops/ci-cd/ci-status/` | CI/CD pipeline health check with failure classification |
| push-changes | `devops/deployment/push-changes/` | Full commit-bump-tag-push cycle with CI monitoring |

### Jokes

| Skill | Path | Description |
|-------|------|-------------|
| code-humor | `jokes/code-humor/` | Programming jokes and tech comedy |
| easter-eggs | `jokes/easter-eggs/` | Hidden features and surprise interactions |
| epitaphs | `jokes/epitaphs/` | Witty, darkly humorous tombstone inscriptions |
| one-liners | `jokes/one-liners/` | Quick, punchy single-line jokes |
| puns | `jokes/puns/` | Wordplay, double meanings, groan-worthy puns |
| storytelling | `jokes/storytelling/` | Humorous narratives and shaggy dog stories |

### Security

| Skill | Path | Description |
|-------|------|-------------|
| audit-deps | `security/auditing/audit-deps/` | Deep supply chain and dependency audit |
| pentest | `security/pentest/` | White-box penetration test code review |

### Testing

| Skill | Path | Description |
|-------|------|-------------|
| check-coverage | `testing/test-strategy/check-coverage/` | Test coverage analysis with gap identification |
| pdv | `testing/e2e/pdv/` | Playwright post-deployment verification |

## Skill File Format

Every skill is a Markdown file (`SKILL.md`) with YAML frontmatter and three required sections:

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
This is the core of the skill — it should be specific, actionable,
and structured with numbered steps or guidelines.

## Examples

Sample invocations, inputs, outputs, or generated artifacts.
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique skill identifier (kebab-case) |
| `description` | Yes | One-line summary used for discovery |
| `category` | Yes | Parent class (e.g., `security`, `development`) |
| `tags` | Yes | Array of searchable tags |

## Contributing

### Adding a New Skill

1. **Pick the right location.** Find the class and subclass that best fits your skill. If no subclass fits, create a new one.

2. **Create the skill directory and files:**
   ```bash
   mkdir -p <class>/<subclass>/<skill-name>
   cp SKILL_TEMPLATE.md <class>/<subclass>/<skill-name>/SKILL.md
   echo "# <skill-name>" > <class>/<subclass>/<skill-name>/README.md
   ```

3. **Write the skill.** Fill in all sections of `SKILL.md` with substantive content. The Prompt section should be detailed enough that Claude can execute the skill without ambiguity.

4. **Update parent READMEs.** Add entries to the subclass and class `README.md` tables in alphabetical order.

5. **Test the skill.** Invoke it in a real project to verify it produces the expected behavior.

6. **Commit, tag, and push:**
   ```bash
   git add .
   git commit -m "feat: add <skill-name> skill for <purpose>"
   git tag -a v0.0.N -m "v0.0.N"
   git push origin main --tags
   ```

### Adding a New Class or Subclass

1. Create the directory
2. Add a `README.md` with a description and (for classes) a subclass table
3. Update this README's structure tree and catalog tables
4. Follow the same commit/tag/push workflow

### Requesting a Skill

[Open an issue](https://github.com/asymmetric-effort/skills/issues/new) with the title format:

```
Create reusable skill: <name> (<short description>)
```

Include:
- **Summary** — what the skill should do
- **Scope** — detailed requirements and workflow steps
- **Acceptance criteria** — checklist of what "done" looks like

Issues from authorized users are automatically resolved by Claude.

## Versioning

This repo uses semantic versioning with patch-only bumps:

- **v0.0.N** — each new skill or skill update increments the patch version
- Tags are annotated: `git tag -a v0.0.N -m "v0.0.N"`
- Consumer projects pin to tags via their git submodule pointer
- Breaking changes (skill renames, deletions) will bump minor version with a deprecation notice

Current version: **v0.0.15**

## License

Copyright Asymmetric Effort, LLC. All rights reserved.
