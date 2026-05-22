# Skills Repository

A centralized collection of Claude Code skills, organized by category.

## Structure

Each category is a directory containing skill files. Skills are Markdown files
with frontmatter metadata and a prompt body that Claude Code can execute.

```
skills/
├── automation/     # Workflow automation, scripting, scheduled tasks
├── data/           # Data processing, analysis, transformation
├── development/    # Coding, debugging, refactoring, architecture
├── devops/         # CI/CD, containers, infrastructure, deployment
├── documentation/  # Writing docs, READMEs, changelogs, ADRs
├── jokes/          # Fun, humor, easter eggs
├── security/       # Auditing, hardening, vulnerability analysis
├── testing/        # Test creation, coverage, fuzzing, benchmarks
└── SKILL_TEMPLATE.md
```

## Skill File Format

Each skill is a `.md` file following the template in `SKILL_TEMPLATE.md`:

```markdown
---
name: skill-name
description: One-line description of what the skill does
category: development
tags: [go, refactor]
---

# Skill Name

## Purpose
What this skill accomplishes.

## Prompt
The prompt or instructions Claude should follow.
```

## Adding a New Skill

1. Pick the appropriate category directory.
2. Copy `SKILL_TEMPLATE.md` into the category directory with a descriptive filename.
3. Fill in the frontmatter and prompt body.
4. Commit and push.

## Categories

| Category        | Description                                      |
|-----------------|--------------------------------------------------|
| `automation`    | Workflow automation, scripting, scheduled tasks   |
| `data`          | Data processing, analysis, transformation         |
| `development`   | Coding, debugging, refactoring, architecture      |
| `devops`        | CI/CD, containers, infrastructure, deployment     |
| `documentation` | Writing docs, READMEs, changelogs, ADRs           |
| `jokes`         | Fun, humor, easter eggs                           |
| `security`      | Auditing, hardening, vulnerability analysis       |
| `testing`       | Test creation, coverage, fuzzing, benchmarks      |

To add a new category, create the directory and add it to this table.
