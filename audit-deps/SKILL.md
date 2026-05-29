---
name: audit-deps
description: Deep supply chain audit with transitive dependency mapping, risk assessment, and license compatibility checks
category: security/auditing
tags: [security, dependencies, supply-chain, audit, licenses, risk-assessment]
source_path: security/auditing/audit-deps
class: security
subclass: auditing
---

# Audit Deps

## Purpose

Perform a deep supply chain audit of the project's dependency tree. Map all transitive dependencies, enforce zero-runtime-dependency invariants, assess supply chain risk per package, check license compatibility, and produce a structured audit report.

## Prompt

Perform a comprehensive dependency supply chain audit for the current project. Follow these guidelines:

1. **Map the full transitive dependency tree.** Resolve and list every direct and transitive dependency, including their versions. Use package manager tools (e.g., `npm ls --all`) to build the complete tree.
2. **Enforce the zero-runtime-dependency invariant.** If the project is expected to have zero runtime dependencies, verify this. Flag any runtime dependency that exists in the tree and classify it as a violation.
3. **Assess supply chain risk per package.** For each dependency, evaluate the following risk factors:
   - **Maintainer**: Number of maintainers, bus factor, account age.
   - **Popularity**: Download counts, GitHub stars, dependent package count.
   - **Activity**: Last publish date, commit frequency, open issue count.
   - **Scope**: Whether the package is scoped/namespaced or unscoped.
   - **Size**: Install size, number of files.
   - **Scripts**: Presence of install/postinstall scripts that execute arbitrary code.
4. **Check license compatibility across the full tree.** Identify the license of every dependency and verify compatibility with the project's own license. Flag any copyleft licenses (GPL, AGPL) in projects using permissive licenses (MIT, Apache-2.0). Flag any packages with no license or unknown licenses.
5. **Produce a structured audit report.** The report must include:
   - Total dependency count (direct vs transitive).
   - Flagged packages with risk reasons (high maintainer risk, install scripts, low activity, etc.).
   - License compatibility issues with specific package names and license types.
   - A summary verdict: pass (no issues), warn (minor issues), or fail (blocking issues found).
6. **Prioritize findings.** Order flagged items by severity: license violations first, then install scripts, then maintainer risk, then staleness.

## Examples

- "Audit deps" — runs the full supply chain audit and produces a report.
- "Check if we have any GPL dependencies" — focuses the audit on license compatibility.
- "Are there any dependencies with install scripts?" — targets the install script risk factor specifically.
