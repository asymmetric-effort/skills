---
name: project-plan
description: Consume a plan file and generate GitHub issues for a repository
category: development
tags: [project-management, github, issues, planning, automation]
---

# Project Plan to GitHub Issues

## Purpose

Read a structured markdown plan file (e.g., GapAnalysis.md, PentestReport.md, a roadmap, or any markdown file with actionable items) and automatically create GitHub issues in a target repository. The default target repository is the current project's repository (derived from the git remote origin). This bridges the gap between analysis/planning artifacts and actionable tracked work.

## Prompt

You are converting a structured markdown plan into GitHub issues. Your goal is to extract every actionable item from the plan, organize them with proper labels and dependencies, and create them in the target repository using the `gh` CLI. Be thorough -- every actionable item in the plan should become a tracked issue.

### Step 1: Input Parsing

Gather the inputs needed to proceed:

1. **Plan file** -- Accept a path to a markdown plan file. Read the file in full.
2. **Target repository** -- Accept an optional target repository in `owner/repo` format. If not provided, derive it from the current project's git remote origin:
   ```bash
   gh repo view --json nameWithOwner -q '.nameWithOwner'
   ```
3. **Parse the markdown** to identify actionable items. Look for all of the following patterns:
   - **Table rows** -- Rows in tables that list tasks, gaps, findings, or action items (e.g., gap analysis tables, pentest findings, roadmap feature tables).
   - **Bulleted lists** -- Bullet points describing work items, TODOs, or recommendations.
   - **Numbered action items** -- Ordered lists of steps, remediation actions, or implementation tasks.
   - **Sections with effort estimates or priorities** -- Any section that assigns a size (XS/S/M/L/XL), priority (P0-P3, Critical/High/Medium/Low), or timeline to a piece of work.
   - **Headings that denote phases or milestones** -- Top-level groupings like "Phase 1", "Sprint 3", "Immediate", "Short-term".

### Step 2: Issue Extraction

Transform each actionable item into a GitHub issue:

1. **Title** -- Derive from the item's name, title, or summary. Keep under 70 characters. Be specific (not "Fix bug" but "Fix SQL injection in user search endpoint").
2. **Body** -- Build from the item's details:
   - Description of the work item
   - Remediation steps or implementation guidance (if present in the plan)
   - Effort estimate (if present)
   - Acceptance criteria (derive from the plan's expected outcome)
   - A traceability section at the bottom:
     ```
     ---
     **Source**: `GapAnalysis.md`, Section "P0 -- Critical", Row #3
     ```
3. **Labels** -- Extract from the plan's metadata:
   - **Severity/priority** -- Map to labels: `priority:critical`, `priority:high`, `priority:medium`, `priority:low`
   - **Effort size** -- Map T-shirt sizes to labels: `effort:xs`, `effort:small`, `effort:medium`, `effort:large`, `effort:xl`
   - **Category** -- Use the plan's category column if present (e.g., `type:missing-feature`, `type:bug`, `type:security`)
   - **Source document** -- Always include a label identifying the source file (e.g., `source:gap-analysis`, `source:pentest-report`, `source:roadmap`)
4. **Milestone** -- If the plan has phases, stages, or priority groups, map them to milestones.

### Step 3: Issue Organization

Structure the issues for clarity and traceability:

1. **Epic/parent issues** -- For each major section or phase in the plan, create a parent issue that serves as an epic. The body of the epic should contain a task list linking to its child issues:
   ```markdown
   ## Tasks

   - [ ] #12 -- SAML authentication
   - [ ] #13 -- Webhook retry with backoff
   - [ ] #14 -- Batch API endpoint
   ```
2. **Dependencies** -- Detect dependencies between items. Look for:
   - Explicit dependency references in the plan ("requires X first", "blocked by Y", "prerequisite: Z")
   - Ordering in a recommended priority list
   - Logical dependencies (e.g., "database schema migration" must precede "API endpoint for new table")
   Note dependencies in the issue body: `**Depends on**: #X`
3. **Consistent labeling** -- Every issue must have at minimum:
   - A `source:<document>` label
   - A `priority:<level>` label (if the plan provides priority information)

### Step 4: Pre-flight Validation

Before creating any issues, perform these checks:

1. **Summary table** -- Display a table showing:
   - Total number of issues to be created (broken down by epic vs. child)
   - Labels that will be created or applied
   - Target repository
   - Milestones to be created (if any)

   Example:
   ```
   === Pre-flight Summary ===
   Target repo:   asymmetric-effort/myproject
   Issues:        3 epics, 22 child issues (25 total)
   Labels:        8 to create, 3 already exist
   Milestones:    2 to create (Phase 1, Phase 2)

   Epics:
     - P0 Critical Gaps (7 child issues)
     - P1 High Priority Gaps (9 child issues)
     - P2/P3 Remaining Gaps (6 child issues)
   ```

2. **Repository access** -- Verify the target repo exists and is accessible:
   ```bash
   gh repo view owner/repo --json name -q '.name'
   ```
3. **Duplicate detection** -- Search for existing open issues with similar titles:
   ```bash
   gh issue list -R owner/repo --search "SAML authentication" --state open --json number,title
   ```
   Report any potential duplicates and ask whether to skip or create anyway.
4. **Confirmation** -- Prompt the user for explicit confirmation before proceeding with issue creation. Display the count of issues, labels, and milestones that will be created.

### Step 5: Issue Creation

Create the issues in the target repository:

1. **Labels first** -- Create any labels that do not already exist:
   ```bash
   gh label create "priority:critical" --color "B60205" --description "Critical priority" -R owner/repo
   gh label create "effort:large" --color "0E8A16" --description "Large effort (1-2 weeks)" -R owner/repo
   gh label create "source:gap-analysis" --color "1D76DB" --description "From gap analysis" -R owner/repo
   ```
   Use these color conventions:
   - Priority labels: red shades (`B60205` critical, `D93F0B` high, `FBCA04` medium, `0E8A16` low)
   - Effort labels: green shades
   - Source labels: blue shades
   - Type labels: purple shades

2. **Milestones** -- Create milestones if needed:
   ```bash
   gh api repos/owner/repo/milestones -f title="Phase 1" -f description="Critical gaps" -f state="open"
   ```

3. **Epic issues first** -- Create parent/epic issues before child issues so that child issues can reference the epic's number:
   ```bash
   gh issue create -R owner/repo \
     --title "Epic: P0 Critical Gaps" \
     --body "Tracking issue for all P0 critical gaps from the gap analysis.

   ## Tasks

   (will be updated with child issue links)

   ---
   **Source**: \`GapAnalysis.md\`, Section \"P0 -- Critical\"" \
     --label "priority:critical" \
     --label "source:gap-analysis"
   ```

4. **Child issues in dependency order** -- Create child issues, referencing parent epics and dependencies:
   ```bash
   gh issue create -R owner/repo \
     --title "Implement SAML 2.0 authentication" \
     --body "## Description

   Full SAML 2.0 SSO flow implementation. Currently not implemented in the target project.

   ## Details

   - **Source behavior**: Full SAML 2.0 SSO flow with IdP discovery, SP-initiated and IdP-initiated login
   - **Current status**: Not implemented
   - **Effort**: L (1-2 weeks)
   - **Risk**: Medium -- requires new dependency

   ## Acceptance Criteria

   - [ ] SAML 2.0 SSO flow works end-to-end
   - [ ] SP-initiated and IdP-initiated login supported
   - [ ] IdP discovery implemented

   **Epic**: #42
   **Depends on**: (none)

   ---
   **Source**: \`GapAnalysis.md\`, Section \"P0 -- Critical\", Row #1" \
     --label "priority:critical" \
     --label "effort:large" \
     --label "source:gap-analysis" \
     --label "type:missing-feature"
   ```

5. **Update epics** -- After all child issues are created, update each epic's body with the actual issue numbers in the task list:
   ```bash
   gh issue edit 42 -R owner/repo --body "Updated body with task list..."
   ```

6. **Output a summary table** of all created issues:
   ```
   === Created Issues ===
   | # | Title | Labels | Epic |
   |---|---|---|---|
   | 42 | Epic: P0 Critical Gaps | priority:critical, source:gap-analysis | -- |
   | 43 | Implement SAML 2.0 authentication | priority:critical, effort:large, source:gap-analysis | #42 |
   | 44 | Add webhook retry with backoff | priority:critical, effort:medium, source:gap-analysis | #42 |
   | ... | ... | ... | ... |
   ```

### Step 6: Output

Produce a final summary:

1. **Statistics**:
   ```
   === Final Summary ===
   Issues created:   25 (3 epics + 22 tasks)
   Labels created:   8
   Milestones created: 2
   Duplicates skipped: 1 ("Rate limit headers" -- matched existing issue #87)
   Target repo:      asymmetric-effort/myproject
   ```

2. **ProjectPlan.md** (optional) -- If requested, produce a `ProjectPlan.md` file that maps each created issue back to the source plan item:
   ```markdown
   # Project Plan

   Generated from `GapAnalysis.md` on YYYY-MM-DD.
   Target repository: asymmetric-effort/myproject

   ## Issue Mapping

   | Source Item | Issue | Priority | Effort | Status |
   |---|---|---|---|---|
   | P0 #1: SAML authentication | [#43](url) | Critical | L | Open |
   | P0 #2: Webhook retry | [#44](url) | Critical | M | Open |
   | ... | ... | ... | ... | ... |
   ```

## Examples

### Example Invocation

> Run project-plan on GapAnalysis.md targeting asymmetric-effort/myproject

### Example: Gap Analysis Row to GitHub Issue

**Source** (row from `GapAnalysis.md`):

| # | Gap | Category | Source Behavior | Target Status | Effort | Risk |
|---|---|---|---|---|---|---|
| 1 | SAML authentication | Missing Feature | Full SAML 2.0 SSO flow | Not implemented | L | Medium -- requires new dependency |

**Resulting GitHub Issue**:

- **Title**: `Implement SAML 2.0 authentication`
- **Labels**: `priority:critical`, `effort:large`, `type:missing-feature`, `source:gap-analysis`
- **Body**:
  ```
  ## Description

  Implement full SAML 2.0 SSO flow. This feature exists in the source project
  but is completely absent from the target.

  ## Source Behavior

  Full SAML 2.0 SSO flow with IdP discovery, SP-initiated and IdP-initiated
  login, metadata exchange, and assertion validation.

  ## Current Status

  Not implemented.

  ## Implementation Notes

  - Effort: L (1-2 weeks)
  - Risk: Medium -- requires new dependency (evaluate SAML libraries before committing)

  ## Acceptance Criteria

  - [ ] SAML 2.0 SSO flow works end-to-end
  - [ ] Both SP-initiated and IdP-initiated login supported
  - [ ] IdP metadata discovery implemented
  - [ ] Assertion validation with signature verification

  **Epic**: #42
  **Depends on**: (none)

  ---
  **Source**: `GapAnalysis.md`, Section "P0 -- Critical", Row #1
  ```

### Example Summary Output

```
=== Pre-flight Summary ===
Target repo:   asymmetric-effort/myproject
Issues:        4 epics, 33 child issues (37 total)
Labels:        11 to create, 2 already exist
Milestones:    0

Epics:
  - P0 Critical Gaps (8 child issues)
  - P1 High Priority Gaps (12 child issues)
  - P2 Medium Priority Gaps (11 child issues)
  - P3 Low Priority Gaps (6 child issues)

Proceed? [y/N]
```

### Example Epic Issue with Task List

- **Title**: `Epic: P0 Critical Gaps`
- **Labels**: `priority:critical`, `source:gap-analysis`
- **Body**:
  ```
  Tracking issue for all P0 (Critical) gaps identified in the gap analysis.

  These gaps block compatibility and must be resolved before any migration
  or release.

  ## Tasks

  - [ ] #43 -- Implement SAML 2.0 authentication (L)
  - [ ] #44 -- Add webhook retry with exponential backoff (M)
  - [ ] #45 -- Implement request signing verification (M)
  - [ ] #46 -- Add TLS certificate pinning (S)
  - [ ] #47 -- Fix session invalidation on password change (S)
  - [ ] #48 -- Implement account lockout after failed attempts (S)
  - [ ] #49 -- Add CSRF protection to state-changing endpoints (M)
  - [ ] #50 -- Implement audit logging for auth events (M)

  **Total effort**: 6-8 engineering-weeks

  ---
  **Source**: `GapAnalysis.md`, Section "P0 -- Critical"
  ```
