---
name: schedule
description: Manage cloud-based remote agent triggers that run on cron schedules in Anthropic's infrastructure
category: automation
tags: [scheduling, remote-agents, cron, triggers, cloud, automation]
---

# Schedule

## Purpose

Create, update, list, and run cloud-based remote agent triggers via the Anthropic RemoteTrigger API. These scheduled agents run on cron schedules in Anthropic's infrastructure, surviving session closure. They operate with zero prior context, making self-contained prompts essential.

## Prompt

You are managing remote agent triggers (scheduled Claude Code agents). Follow this workflow:

### Step 1: Determine the Action

Parse the user's request to determine which CRUD operation to perform:

1. **Create** — "schedule a daily code review" or `/schedule <description>`
2. **Update** — "update the nightly audit schedule" or `/schedule update <id>`
3. **List** — "show my schedules" or `/schedule list`
4. **Run now** — "run the audit schedule now" or `/schedule run <id>`
5. **Delete** — "remove the daily review" or `/schedule delete <id>`

### Step 2: Create a New Trigger

When creating a new scheduled agent:

#### 2a. Convert Time Expression to Cron

- Parse user-friendly expressions into UTC cron expressions:
  - "every day at 9am EST" → `0 14 * * *` (9 AM EST = 14:00 UTC)
  - "every Monday at 8am PST" → `0 16 * * 1`
  - "every 6 hours" → `0 */6 * * *`
  - "twice daily" → `0 6,18 * * *`
- **Always confirm the UTC conversion** with the user before creating:
  ```
  Schedule: daily at 9:00 AM EST (14:00 UTC)
  Cron expression: 0 14 * * *
  Correct? [y/n]
  ```

#### 2b. Craft the Prompt

Remote agents have **zero prior context** — they don't know what happened in previous sessions. The prompt must be entirely self-contained:

- **Include the repository URL** — the agent needs to know where to find the code.
- **Include specific file paths** — don't say "the config file," say `/path/to/config.yml`.
- **Include the expected output** — describe what success looks like.
- **Include error handling** — what to do if something fails.
- **Avoid references** to "the current branch" or "the last commit" — the agent starts fresh.

Bad prompt: "Check if the tests still pass."
Good prompt: "Clone asymmetric-effort/specifyjs, checkout main, run `bun test`, and report any failures as a GitHub issue on asymmetric-effort/specifyjs with the label 'ci-failure'."

#### 2c. Select Model

- Default: `claude-sonnet-4-6` (fast, cost-effective for routine tasks).
- Use `claude-opus-4-6` for complex analysis requiring deep reasoning.
- Confirm model selection with the user.

#### 2d. Configure MCP Connections

- Identify which MCP connectors the agent needs (GitHub, Slack, Jira, etc.).
- Validate that the required connectors are available in the user's account.
- Attach connectors to the trigger configuration.

#### 2e. Select Environment

- Choose the execution environment (default or custom).
- Ensure the environment has the required tools and access.

#### 2f. Create the Trigger

Use the RemoteTrigger API to create the trigger with:
- Schedule (cron expression)
- Prompt (self-contained)
- Model
- MCP connections
- Environment
- Git repository source (if applicable)
- Allowed tools

### Step 3: List Triggers

Display all active triggers with:
```
## Active Schedules

| ID | Name | Schedule | Model | Last Run | Status |
|----|------|----------|-------|----------|--------|
| abc123 | Daily audit | 0 14 * * * (9am EST) | sonnet | 2h ago | success |
| def456 | Weekly review | 0 16 * * 1 (8am PST Mon) | opus | 5d ago | success |
```

### Step 4: Update a Trigger

- Fetch the existing trigger configuration.
- Apply the requested changes (schedule, prompt, model, connections).
- Confirm changes with the user before applying.
- Update via the API.

### Step 5: Run Now

- Trigger an immediate execution of the scheduled agent.
- Report the run ID and provide a way to check the result.

### Rules

- Always confirm UTC timezone conversions with the user.
- Always craft self-contained prompts (zero prior context).
- Always validate MCP connector availability before creating triggers.
- Never hardcode session-specific context into scheduled prompts.
- Default to `claude-sonnet-4-6` unless the task requires deeper reasoning.

## Examples

**Create a daily code audit schedule:**
```
/schedule Run a dependency audit on asymmetric-effort/specifyjs every day at 9am EST
```
Output:
```
Schedule: daily at 9:00 AM EST (14:00 UTC)
Cron: 0 14 * * *
Model: claude-sonnet-4-6
Prompt: "Clone asymmetric-effort/specifyjs, run `npm audit`, and post
  results to #security-alerts on Slack if any high/critical vulnerabilities
  are found."
MCP: GitHub, Slack
Create this schedule? [y/n]
```

**List all schedules:**
```
/schedule list
```

**Run a schedule immediately:**
```
/schedule run abc123
```

**Update schedule timing:**
```
/schedule update abc123 --cron "0 */6 * * *"
> Updated: now runs every 6 hours (UTC: 0:00, 6:00, 12:00, 18:00)
```
