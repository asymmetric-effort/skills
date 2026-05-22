# Skills Repository — Project Instructions

## What This Repo Is

This is a centralized library of reusable Claude Code skills for the Asymmetric Effort organization. Skills are Markdown files containing structured prompts that Claude Code can execute. Every project in the org consumes this repo as a git submodule at `.claude/skills/`.

## Repository Structure

```
<class>/                        # Top-level skill class (e.g., security, development)
  <subclass>/                   # Skill subclass (e.g., auditing, debugging)
    <skill-name>/               # Individual skill directory
      SKILL.md                  # The skill definition (frontmatter + prompt)
      README.md                 # One-line description
    README.md                   # Subclass README with skill table
  README.md                     # Class README with subclass table
SKILL_TEMPLATE.md               # Template for new skills
```

## Skill File Format

Every `SKILL.md` must have:

1. **YAML frontmatter** with `name`, `description`, `category`, and `tags`
2. **Purpose** section — what the skill does and when to use it
3. **Prompt** section — detailed instructions Claude follows when the skill is invoked
4. **Examples** section — sample inputs, outputs, or invocations

## How to Add a Skill

1. Identify the correct class and subclass directory
2. Create a new directory for the skill if it doesn't exist
3. Copy `SKILL_TEMPLATE.md` into the directory as `SKILL.md`
4. Fill in all sections with substantive, actionable content
5. Add a `README.md` with a one-line description
6. Update the parent subclass and class `README.md` tables to include the new entry (alphabetical order)
7. Commit, tag with the next semver patch version, and push

## Versioning

- Every skill addition or modification gets a new semver patch tag (v0.0.N)
- Tags must be annotated: `git tag -a v0.0.N -m "v0.0.N"`
- Always push tags: `git push origin main --tags`
- Consumer projects pin to specific tags via their submodule pointer

## Commit Messages

Use conventional commits:
- `feat: add <skill-name> skill for <purpose>` — new skill
- `fix: correct <skill-name> prompt for <issue>` — skill fix
- `docs: update <class> README` — documentation only
- `chore: bump version to <tag>` — version bumps

## Rules

- Never delete a skill without deprecation notice in a prior version
- Never modify a skill's `name` field without updating all references
- Keep class and subclass README tables in alphabetical order
- Every directory must have a `README.md` so git tracks it
- Skills must be self-contained — no cross-skill dependencies in prompt text
- Test a skill by invoking it in a real project before merging

## GitHub Issues

- New skill requests are filed as GitHub issues
- Issues from `sam-caldwell`, `dependabot`, or `dependabot[bot]` are automatically resolved
- Issue title format: `Create reusable skill: <name> (<description>)`
- Close issues via commit message: `Closes #N`
