---
name: schedule
description: Create and manage cloud-scheduled remote agents via the RemoteTrigger API
category: automation/scheduling
tags: [scheduling, remote-agents, cron, cloud, triggers, mcp]
---

# Schedule

## Purpose

Manage the full CRUD lifecycle of cloud-scheduled remote agents using the RemoteTrigger API. Configure scheduled triggers with git repos, tools, MCP connectors, model selection, and self-contained prompts that execute on cron schedules.

## Prompt

Create, update, list, or manage scheduled remote agents. Follow these guidelines:

1. **Support full CRUD operations.** Handle create, read (list/get), update, and delete for scheduled triggers. Use the RemoteTrigger API for all operations.
2. **Convert user time to UTC cron.** When the user specifies a time in their local timezone (e.g., "every weekday at 9am EST"), convert it to a UTC-based cron expression. Always confirm the converted schedule with the user before creating the trigger.
3. **Craft self-contained prompts.** The scheduled agent runs without conversation context, so the prompt must be entirely self-contained. Include all necessary instructions, repo paths, tool references, and expected output format within the prompt itself.
4. **Configure git repositories.** Attach the relevant git repo to the trigger so the remote agent has access to the codebase. Specify the correct branch and any required setup steps.
5. **Configure tools and MCP connectors.** Enable the appropriate tools and MCP (Model Context Protocol) connectors the remote agent will need. Validate that requested MCP connectors are available and properly configured before creating the trigger.
6. **Support model selection.** Allow the user to specify which Claude model the remote agent should use. Default to the most capable available model if not specified.
7. **Validate before creating.** Before creating a trigger, validate: cron expression syntax, git repo accessibility, MCP connector availability, and prompt completeness. Surface any issues before committing.
8. **Display schedules clearly.** When listing triggers, show: trigger name/ID, cron schedule (in both UTC and user's local time), associated repo, last run status, and next scheduled execution.
9. **Handle updates carefully.** When updating a trigger, show the diff between old and new configuration. Confirm changes with the user before applying, especially for schedule or prompt changes.

## Examples

**Create a daily trigger:**
```
/schedule create "daily-pr-summary" every day at 9am ET
  repo: acme/app
  prompt: "List all PRs merged yesterday, summarize changes, post to #engineering Slack channel"
  tools: slack, github
```

**List all scheduled triggers:**
```
/schedule list
```

**Update a trigger's schedule:**
```
/schedule update daily-pr-summary --cron "0 14 * * 1-5"
```

**Delete a trigger:**
```
/schedule delete daily-pr-summary
```

**Cron conversion example:**
```
User: "Run every weekday at 9am Eastern"
UTC cron: 0 13 * * 1-5  (or 0 14 * * 1-5 during EST)
# Confirm with user before creating
```
