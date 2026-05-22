---
name: blue-green-deploy
description: Staged deployment with PDV gates, promotion, and automatic rollback
category: devops
tags: [deployment, blue-green, staging, pdv, rollback, github-pages, ci-cd]
---

# Blue-Green Deploy

## Purpose

Orchestrate a staged deployment pipeline where changes are deployed to a staging environment first, validated via post-deployment verification (PDV), then promoted to production with rollback capability. Encodes lessons learned from production incidents to prevent common failure modes including absolute hash URLs, unscoped selectors, and CDN propagation timing.

## Prompt

Execute a blue-green deployment with PDV gates. Follow these six phases in strict order. Never skip a phase. Never promote without passing PDV.

### Phase 0: Pre-flight Checks

1. **Verify clean working tree.** Run `git status`. If there are uncommitted changes, abort: "Commit all changes before deploying."

2. **Detect hosting platform.** Inspect the repo to determine the deployment target:
   - **GitHub Pages**: check for `gh-pages` branch, `.github/workflows` with `deploy-pages`, or `homepage` in `package.json`
   - **Netlify**: check for `netlify.toml`
   - **S3**: check for deployment scripts referencing `aws s3 sync`
   - **Vercel**: check for `vercel.json`
   - **Custom**: fall back to `.claude/blue-green.yml` config
   - Report which platform was detected and confirm with the user if ambiguous

3. **Detect build tool.** Scan `package.json` scripts and config files:
   - Vite (`vite.config.ts`), Rollup (`rollup.config.js`), Webpack (`webpack.config.js`), Next.js (`next.config.js`), or plain HTML
   - Identify the build command and output directory

4. **Detect PDV tests.** Search for Playwright test files matching these patterns in order:
   - `e2e-pdv/tests/pdv*.spec.ts`
   - `tests/e2e/pdv*.spec.ts`
   - `tests/pdv/*.spec.ts`
   - `e2e/pdv*.spec.ts`
   - Override via `.claude/blue-green.yml` if present

5. **Refuse to deploy without PDV tests.** If no PDV tests are found, abort: "No PDV tests found. Deployment without verification is not allowed."

6. **Validate PDV test quality.** Scan PDV test files for common pitfalls:
   - **Absolute hash URLs**: warn if tests contain `page.goto('/#` or `page.goto("/#` — these bypass the staging base path. Recommend changing to relative: `page.goto('./#/route')`
   - **Unscoped selectors**: warn if tests use broad selectors like `page.locator('.dialog')` without parent scoping — these can match wrong elements and cause false passes

### Phase 1: Build

1. Run the detected (or configured) build command
2. Verify the build output directory exists and contains `index.html`
3. Record the build output path and short git SHA for tagging

### Phase 2: Deploy to Staging

**GitHub Pages implementation:**
1. Checkout the `gh-pages` branch (create if it doesn't exist)
2. Copy build output to `/staging/` subdirectory, preserving the existing production root
3. Commit: `deploy: staging build <short-sha> (<timestamp>)`
4. Push the `gh-pages` branch
5. Wait for CDN propagation — poll the staging URL for a 200 response with expected content. Timeout after 120 seconds. Warn but continue if timeout exceeded (CDN may be slow).

**Other platforms:**
- Netlify: `netlify deploy` (preview, not `--prod`)
- S3: `aws s3 sync <output> s3://<bucket>/staging/`
- Vercel: use preview deployments

### Phase 3: Staging PDV (Hard Gate)

1. **Construct staging URL:**
   - GitHub Pages: `https://<owner>.github.io/<repo>/staging/` or custom domain + `/staging/`
   - Use override from `.claude/blue-green.yml` if set

2. **Run PDV tests:** `BASE_URL=<staging-url> npx playwright test <pdv-files>`

3. **Gate decision:**
   - All pass → proceed to Phase 4
   - Any fail → **STOP.** Report failures with screenshots and logs. Do NOT promote. The deployment ends here.

### Phase 4: Promote to Production

**GitHub Pages:**
1. On the `gh-pages` branch:
   - Backup current production: copy `/` root to `/_rollback/` (exclude `/staging/` and `/_rollback/`)
   - Copy `/staging/*` to `/` root, overwriting production files
   - Commit: `deploy: promote staging to production <short-sha> (<timestamp>)`
2. Push `gh-pages` branch
3. Wait for CDN propagation (same polling as Phase 2)

### Phase 5: Production PDV

1. Construct production URL (from repo Pages settings, CNAME file, or config)
2. Run the same PDV tests: `BASE_URL=<production-url> npx playwright test <pdv-files>`
3. **Gate decision:**
   - All pass → deployment complete. Report success with phase-by-phase summary.
   - Any fail → proceed to Phase 6 (rollback)

### Phase 6: Rollback (Conditional)

Only executes if production PDV fails and rollback is enabled (default: enabled).

1. On `gh-pages` branch: copy `/_rollback/*` to `/` root, remove `/_rollback/`
2. Commit: `deploy: rollback production to pre-promotion state (<timestamp>)`
3. Push and wait for CDN propagation
4. Re-run production PDV to verify rollback succeeded
5. Report: clearly state what failed, that production is restored, and what manual action is needed

**If rollback itself fails: ALERT LOUDLY.** Production is in an unknown state and requires manual intervention.

### Error Handling Table

| Scenario | Action |
|----------|--------|
| Build fails | Stop immediately, report build error |
| Staging deploy push rejected | Stop, report git/push error |
| CDN propagation timeout | Warn but continue to PDV |
| Staging PDV fails | Stop, report with screenshots, do NOT promote |
| Promotion push fails | Stop, report error (staging is safe) |
| Production PDV fails | Auto-rollback if enabled, report failures |
| Rollback fails | Alert loudly — manual intervention needed |
| No PDV tests found | Refuse to deploy |
| Absolute hash URLs in tests | Warn before running |

### Configuration

Read optional config from `.claude/blue-green.yml`:

```yaml
platform: github-pages
build:
  command: "npm run build"
  output_dir: "dist"
staging:
  path: "/staging/"
  url: ""
production:
  url: ""
  cname: ""
pdv:
  test_files: "e2e-pdv/tests/pdv*.spec.ts"
  playwright_config: "playwright.config.ts"
  timeout: 120
  browsers: ["chromium"]
rollback:
  enabled: true
  backup_path: "/_rollback/"
```

All fields are optional — auto-detect everything possible.

### Deployment Summary Report

After completion (success or failure), output a structured report:

```
## Deployment Report — <repo> (<timestamp>)

| Phase | Status | Duration |
|-------|--------|----------|
| Pre-flight | PASS | 2s |
| Build | PASS | 12s |
| Staging Deploy | PASS | 45s |
| Staging PDV | PASS (17/17 tests) | 28s |
| Promote | PASS | 38s |
| Production PDV | PASS (17/17 tests) | 31s |

Result: SUCCESS
Production URL: https://skills.asymmetric-effort.com
```

### Integration with Other Skills

- Run `/push-changes` before `/blue-green-deploy` to ensure code is committed and CI is green
- `/pdv` owns PDV test authoring guidance; this skill invokes the tests
- `/ci-status` can verify CI pipeline status before starting deployment

## Examples

### Basic GitHub Pages deployment

```
> /blue-green-deploy

Pre-flight: GitHub Pages detected, Vite build, 17 PDV tests found
Building... done (dist/, 12s)
Deploying to staging... pushed to gh-pages:/staging/
Waiting for CDN... confirmed after 35s
Running staging PDV... 17/17 passed
Promoting to production... backup created, staging copied to root
Waiting for CDN... confirmed after 40s
Running production PDV... 17/17 passed

Deployment complete. Production is live.
```

### Staging PDV failure (deployment blocked)

```
> /blue-green-deploy

Pre-flight: GitHub Pages detected, Vite build, 17 PDV tests found
Building... done (dist/, 11s)
Deploying to staging... pushed to gh-pages:/staging/
Waiting for CDN... confirmed after 30s
Running staging PDV... 15/17 passed, 2 FAILED

DEPLOYMENT BLOCKED — staging PDV failed.

Failed tests:
  1. "navigation links work" — expected .nav-link to be visible, got 0 matches
     Screenshot: test-results/nav-links-1.png
  2. "footer shows version" — expected "v0.0.18", got "v0.0.17"

Production was NOT modified. Fix the failures and re-deploy.
```

### Production PDV failure with rollback

```
> /blue-green-deploy

...phases 0-4 passed...
Running production PDV... 16/17 passed, 1 FAILED

ROLLING BACK — production PDV failed.

Restoring previous production from backup...
Rollback deployed, waiting for CDN... confirmed after 42s
Rollback PDV... 17/17 passed

Production restored to pre-deployment state.
Investigate: "hero section renders" failed on production but passed on staging.
Likely cause: CDN serving cached assets from previous version.
```
