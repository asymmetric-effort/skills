---
name: gh-auth
description: Authenticate the GitHub CLI (gh) using device/OIDC flow for interactive sessions or token for CI
category: devops/ci-cd
tags: [github, authentication, gh-cli, oidc, device-flow, ci-cd]
source_path: devops/ci-cd/gh-auth
class: devops
subclass: ci-cd
---

# GitHub CLI Authentication

## Purpose

Authenticate the GitHub CLI (`gh`) so Claude Code can interact with GitHub APIs — creating issues, managing PRs, checking CI status, creating releases, and more. Supports both interactive sessions (device/OIDC flow) and non-interactive environments (token-based).

## Prompt

Authenticate the GitHub CLI. Follow these steps:

### 1. Check if Already Authenticated

Run `gh auth status` to check the current authentication state.

- If authenticated, report the account, active scopes, and protocol. Done.
- If not authenticated, proceed to step 2.

### 2. Check if gh is Installed

Run `which gh` or `gh --version`.

- If not installed, install it:
  - **Ubuntu/Debian**: `sudo apt-get install -y gh` (if the GitHub CLI apt repo is configured), or:
    ```bash
    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
    sudo apt-get update && sudo apt-get install -y gh
    ```
  - **macOS**: `brew install gh`
  - **Other**: see https://github.com/cli/cli#installation

### 3. Choose Authentication Method

#### Option A: Device/OIDC Flow (Interactive Sessions)

Use this when running in an interactive terminal, container, or SSH session where a browser is available to the user (even if not on the same machine).

```bash
gh auth login -h github.com -p https -w
```

This will:
1. Display a one-time code (e.g., `38DF-91E3`)
2. Display a URL: `https://github.com/login/device`
3. Wait for the user to open the URL in their browser and enter the code

**Tell the user:**
- Open https://github.com/login/device in your browser
- Enter the code: `<CODE>`
- Authorize the CLI

The command blocks until the user completes authorization, then confirms success.

**If running in a container or headless environment**, the user opens the URL on their local machine — the device flow works cross-device.

#### Option B: Token-Based (CI/CD and Automation)

Use this when no interactive browser session is available.

**Using GH_TOKEN environment variable:**
```bash
export GH_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
gh auth status  # Verifies the token works
```

**Using gh auth login with token:**
```bash
echo "$GITHUB_TOKEN" | gh auth login --with-token
```

**In GitHub Actions**, `gh` is pre-authenticated via `GITHUB_TOKEN`:
```yaml
steps:
  - uses: actions/checkout@v4
  - name: Use gh CLI
    run: gh issue list
    env:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 4. Verify Authentication

After authentication, verify:

```bash
gh auth status
```

Expected output:
```
github.com
  ✓ Logged in to github.com account <username>
  - Active account: true
  - Git operations protocol: https
  - Token scopes: 'gist', 'read:org', 'repo'
```

### 5. Required Scopes

Different operations require different token scopes:

| Operation | Required Scope |
|-----------|---------------|
| Read repos, issues, PRs | `repo` |
| Create/close issues | `repo` |
| Create/merge PRs | `repo` |
| Create releases | `repo` |
| Push to repos | `repo` |
| Read org membership | `read:org` |
| Create gists | `gist` |
| Manage workflows | `workflow` |

The device flow grants `repo`, `read:org`, and `gist` by default. For CI tokens, ensure the required scopes are configured.

### 6. Troubleshooting

| Problem | Solution |
|---------|----------|
| `gh: command not found` | Install gh (see step 2) |
| `authentication required` | Run `gh auth login` |
| `HTTP 403` | Token lacks required scopes — re-authenticate with broader scopes |
| `HTTP 404` on private repo | Token needs `repo` scope |
| Device flow hangs | User hasn't completed browser authorization — check the URL and code |
| Token expired | Re-run `gh auth login` |
| Wrong account | Run `gh auth logout` then `gh auth login` |

## Examples

### Interactive authentication in a container

```
> /gh-auth

Checking gh auth status...
  ✗ Not authenticated

Starting device flow...
  gh auth login -h github.com -p https -w

  Open https://github.com/login/device in your browser
  Enter code: 38DF-91E3

  ✓ Logged in as sam-caldwell
  ✓ Scopes: gist, read:org, repo
```

### CI authentication (already available)

```
> /gh-auth

Checking gh auth status...
  ✓ Logged in to github.com account github-actions[bot]
  ✓ Token scopes: contents:write, pages:write
  
Already authenticated. No action needed.
```

### Re-authenticate with different account

```
> /gh-auth --force

Logging out current session...
Starting device flow...

  Open https://github.com/login/device in your browser
  Enter code: A1B2-C3D4

  ✓ Logged in as new-account
```
