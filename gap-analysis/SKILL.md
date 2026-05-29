---
name: gap-analysis
description: Compare two software projects and produce a GapAnalysis.md detailing what is needed for 100% feature compatibility and parity
category: development
tags: [analysis, comparison, feature-parity, migration, compatibility]
source_path: development/gap-analysis
class: development
subclass: gap-analysis
---

# Gap Analysis

## Purpose

Compare two software projects -- a **source/reference** project and a **target** project -- to identify every gap in features, APIs, configuration, documentation, testing, and architecture. Produce a structured `GapAnalysis.md` file that serves as a complete roadmap to achieve 100% feature compatibility (same behavior) and 100% feature parity (same feature set).

## Prompt

You are performing a gap analysis between two software projects. The **source** project is the reference (the one whose features the target must match). The **target** project is the one being evaluated for gaps.

### Step 1: Inventory Both Projects

Scan each project thoroughly and build a feature inventory:

1. **Code** -- Walk the source tree. Identify modules, packages, classes, and public functions. Note major subsystems and their responsibilities.
2. **APIs** -- Catalog every public API surface: REST endpoints, GraphQL schemas, gRPC services, CLI commands, SDK methods, exported library functions. Record method signatures, parameters, and return types.
3. **Configuration** -- List every config file format, environment variable, feature flag, and runtime option. Note defaults and valid ranges.
4. **Documentation** -- Identify user-facing docs, API references, tutorials, changelogs, and inline doc coverage.
5. **Tests** -- Catalog test suites (unit, integration, e2e, performance, fuzz). Note coverage metrics if available.
6. **Architecture** -- Document high-level architecture: data flow, storage backends, external dependencies, plugin/extension points, concurrency model.

### Step 2: Categorize Gaps

Compare the inventories and classify every gap into one of these categories:

| Category | Definition |
|---|---|
| **Missing Feature** | Exists in source, completely absent from target |
| **Partial Implementation** | Present in target but incomplete -- missing options, edge cases, or modes |
| **Behavioral Difference** | Both projects have the feature but it behaves differently under the same inputs |
| **API Surface Difference** | Different method names, signatures, parameter sets, or return types for equivalent functionality |
| **Configuration Gap** | Config option, env var, or flag exists in source but not in target |
| **Documentation Gap** | Feature is implemented in target but undocumented or under-documented |
| **Test Coverage Gap** | Feature exists in target but lacks equivalent test coverage compared to source |

### Step 3: Assess Effort and Complexity

For each gap, estimate the effort to close it using T-shirt sizing:

| Size | Meaning |
|---|---|
| **XS** | Trivial -- a few lines of code, config, or docs. Under 1 hour. |
| **S** | Small -- a single focused task. Half a day to one day. |
| **M** | Medium -- meaningful implementation work. 2-4 days. |
| **L** | Large -- significant feature work spanning multiple files/subsystems. 1-2 weeks. |
| **XL** | Extra large -- major architectural effort or new subsystem. 2+ weeks. |

Note any gaps that carry **technical risk** (uncertainty about feasibility, dependency on upstream changes, or architectural conflicts).

### Step 4: Prioritize

Assign each gap a priority level:

| Priority | Criteria |
|---|---|
| **P0 -- Critical** | Blocks compatibility. Users will hit this immediately. Must fix before any migration or release. |
| **P1 -- High** | Required for feature parity. Core functionality that users expect. |
| **P2 -- Medium** | Important for completeness. Missing options, edge cases, or secondary workflows. |
| **P3 -- Low** | Nice-to-have. Cosmetic differences, extra docs, or marginal features with workarounds. |

### Step 5: Write the GapAnalysis.md

Produce a file named `GapAnalysis.md` in the target project root with the structure shown in the Examples section below. The file must be:

- **Actionable** -- every gap should be clear enough to become a work item.
- **Quantified** -- include counts (e.g., "37 gaps identified: 8 P0, 12 P1, 11 P2, 6 P3").
- **Honest** -- do not minimize gaps or inflate the target's completeness.
- **Scoped** -- distinguish between compatibility (same behavior) and parity (same feature set). A project can be compatible without full parity if it covers the same core contracts.

## Examples

The generated `GapAnalysis.md` should follow this structure:

```markdown
# Gap Analysis: [Source Project] vs [Target Project]

**Date**: YYYY-MM-DD
**Source version**: X.Y.Z (or commit SHA)
**Target version**: X.Y.Z (or commit SHA)

## Executive Summary

Brief overview of findings. State the total number of gaps by priority and category.
Highlight the most critical gaps and the overall effort estimate to reach full parity.

Example: "37 gaps identified (8 P0, 12 P1, 11 P2, 6 P3). Estimated total effort:
14-20 engineering-weeks. The target project covers ~72% of the source feature set.
Critical gaps center on [streaming support, auth providers, and webhook handling]."

## Feature Inventory

### Source Project Features

| # | Feature / Module | Description | API Surface | Test Coverage |
|---|---|---|---|---|
| 1 | Authentication | OAuth2, API keys, SAML | 6 endpoints | 94% |
| 2 | Webhook Engine | Event dispatch, retry logic, signing | 4 endpoints | 87% |
| ... | ... | ... | ... | ... |

### Target Project Features

| # | Feature / Module | Description | API Surface | Test Coverage |
|---|---|---|---|---|
| 1 | Authentication | OAuth2, API keys | 4 endpoints | 78% |
| 2 | Webhook Engine | Event dispatch (no retry) | 2 endpoints | 45% |
| ... | ... | ... | ... | ... |

## Gap Details

### P0 -- Critical

| # | Gap | Category | Source Behavior | Target Status | Effort | Risk |
|---|---|---|---|---|---|---|
| 1 | SAML authentication | Missing Feature | Full SAML 2.0 SSO flow | Not implemented | L | Medium -- requires new dependency |
| 2 | Webhook retry with backoff | Partial Implementation | Exponential backoff, 5 retries, dead-letter queue | Fires once, no retry | M | Low |

### P1 -- High

| # | Gap | Category | Source Behavior | Target Status | Effort | Risk |
|---|---|---|---|---|---|---|
| 3 | Batch API endpoint | Missing Feature | POST /batch accepts up to 100 operations | Not implemented | M | Low |
| ... | ... | ... | ... | ... | ... | ... |

### P2 -- Medium

| # | Gap | Category | Source Behavior | Target Status | Effort | Risk |
|---|---|---|---|---|---|---|
| 5 | Rate limit headers | API Surface Difference | Returns X-RateLimit-* headers | No rate limit headers | S | Low |
| ... | ... | ... | ... | ... | ... | ... |

### P3 -- Low

| # | Gap | Category | Source Behavior | Target Status | Effort | Risk |
|---|---|---|---|---|---|---|
| 8 | CLI color output | Behavioral Difference | Colored output with --no-color flag | Always plain text | XS | None |
| ... | ... | ... | ... | ... | ... | ... |

## Effort Summary

| Priority | Count | Effort Range |
|---|---|---|
| P0 -- Critical | 8 | 6-8 weeks |
| P1 -- High | 12 | 5-7 weeks |
| P2 -- Medium | 11 | 2-3 weeks |
| P3 -- Low | 6 | 1-2 weeks |
| **Total** | **37** | **14-20 weeks** |

## Recommended Priority Order

Numbered list of gaps in the order they should be addressed, accounting for
dependencies, risk, and impact. Group related gaps that should be tackled
together.

1. **SAML authentication** (P0, L) -- Unblocks enterprise customers. No dependencies.
2. **Webhook retry with backoff** (P0, M) -- Prerequisite for reliable event delivery.
3. **Batch API endpoint** (P1, M) -- High-value, self-contained.
4. ...

## Risk Assessment

| Risk | Affected Gaps | Mitigation |
|---|---|---|
| New SAML dependency may conflict with existing auth stack | #1 | Spike: evaluate 2 SAML libraries before committing |
| Batch endpoint may require schema changes | #3 | Design doc review before implementation |
| ... | ... | ... |
```
