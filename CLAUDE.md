# Skills Repository — Project Instructions

## What This Repo Is

This is a centralized library of reusable Claude Code skills for the Asymmetric Effort organization. Skills are authored as Markdown files in a nested source tree (`main` branch) and published as flat consumable files (`release` branch) via CI.

## Two-Branch Architecture

- **`main`** — source of truth. Skills live at `<class>/<subclass>/<skill>/SKILL.md`. This is where authoring, reviewing, and organizing happens.
- **`release`** — published artifact. CI flattens all skills to `<name>.md` files and publishes them here. Consumer projects add this branch as a git submodule at `.claude/skills/`.

**Consumer projects should never reference `main` directly.** Always use:
```bash
git submodule add -b release git@github.com:asymmetric-effort/skills.git .claude/skills
```

## Repository Structure

```
<class>/                        # Top-level skill class (e.g., security, development)
  <subclass>/                   # Skill subclass (e.g., auditing, debugging)
    <skill-name>/               # Individual skill directory
      SKILL.md                  # The skill definition (frontmatter + prompt)
      README.md                 # One-line description
    README.md                   # Subclass README with skill table
  README.md                     # Class README with subclass table
site/                           # Documentation website source
  scripts/
    generate-data.mjs           # Build-time: SKILL.md → skills-data.json
    flatten-skills.mjs          # Build-time: nested tree → flat dist/
SKILL_TEMPLATE.md               # Template for new skills
```

## Skill File Format

Every `SKILL.md` must have:

1. **YAML frontmatter** with `name`, `description`, `category`, and `tags`
2. **Purpose** section — what the skill does and when to use it
3. **Prompt** section — detailed instructions Claude follows when the skill is invoked
4. **Examples** section — sample inputs, outputs, or invocations

**The `name` field must be unique across all skills.** The flatten script will fail on collisions.

## How to Add a Skill

1. Identify the correct class and subclass directory
2. Create a new directory for the skill if it doesn't exist
3. Copy `SKILL_TEMPLATE.md` into the directory as `SKILL.md`
4. Fill in all sections with substantive, actionable content
5. Add a `README.md` with a one-line description
6. Update the parent subclass and class `README.md` tables to include the new entry (alphabetical order)
7. Run `node site/scripts/flatten-skills.mjs` to verify no naming collisions
8. Commit, tag with the next semver patch version, and push

CI will automatically:
- Build and test the documentation site
- Flatten skills and publish to the `release` branch
- Deploy the documentation site to skills.asymmetric-effort.com

## Versioning

- Every skill addition or modification gets a new semver patch tag (v0.0.N)
- Tags must be annotated: `git tag -a v0.0.N -m "v0.0.N"`
- Always push tags: `git push origin main --tags`
- Consumer projects get updates by pulling the `release` branch of their submodule

## Commit Messages

Use conventional commits:
- `feat: add <skill-name> skill for <purpose>` — new skill
- `fix: correct <skill-name> prompt for <issue>` — skill fix
- `docs: update <class> README` — documentation only
- `chore: bump version to <tag>` — version bumps

## Rules

- Never delete a skill without deprecation notice in a prior version
- Never modify a skill's `name` field without updating all references
- Skill names must be globally unique (the flatten script enforces this)
- Keep class and subclass README tables in alphabetical order
- Every directory must have a `README.md` so git tracks it
- Skills must be self-contained — no cross-skill dependencies in prompt text
- Test a skill by invoking it in a real project before merging

## GitHub Issues

- New skill requests are filed as GitHub issues
- Issues from `sam-caldwell`, `dependabot`, or `dependabot[bot]` are automatically resolved
- Issue title format: `Create reusable skill: <name> (<description>)`
- Close issues via commit message: `Closes #N`

## CI/CD Pipeline

On every push to `main`:
1. `build-site` — generate data, build docs site, run pre-deployment tests
2. `deploy` — publish docs site to GitHub Pages
3. `publish-skills` — flatten skills tree → push to `release` branch
4. `pdv` — post-deployment verification against live site
