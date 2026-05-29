---
name: loop
description: Execute prompts or commands on a recurring interval with support for fixed, dynamic, and event-driven scheduling
category: automation/scheduling
tags: [scheduling, recurring, interval, cron, monitoring, automation]
source_path: automation/scheduling/loop
class: automation
subclass: scheduling
---

# Loop

## Purpose

Run a prompt or slash command on a recurring interval — supporting fixed-interval (cron-style), dynamic/self-paced modes with cache-aware delays, and event-driven wake-ups via monitors. Designed for polling, periodic checks, and recurring automation within a session.

## Prompt

Set up a recurring prompt execution loop. Follow these guidelines:

1. **Parse the interval and prompt.** Accept interval formats: `Ns` (seconds), `Nm` (minutes), `Nh` (hours), `Nd` (days). Default to 10 minutes if no interval is specified. The remainder of the input after the interval is the prompt to execute each iteration.
2. **Execute immediately, then repeat.** Run the prompt once right away on the first invocation, then schedule subsequent executions at the configured interval. Do not wait for the first interval to elapse before the initial run.
3. **Support fixed-interval (cron) mode.** In the default mode, execute at exact intervals regardless of how long the previous execution took. If an execution runs longer than the interval, start the next one immediately after completion.
4. **Support dynamic/self-paced mode.** When enabled, measure the execution time and adjust the delay to account for it, preventing drift. Add cache-aware delays when interacting with APIs or data sources that have known refresh intervals.
5. **Offer cloud scheduling for long intervals.** When the interval is 60 minutes or longer, suggest offloading to a cloud-scheduled remote agent via the schedule skill. Local loops are better for short intervals; cloud triggers are better for long-lived recurring tasks.
6. **Arm monitors for event-driven wake-ups.** Support attaching monitors that can trigger early execution when specific events occur (e.g., file changes, webhook arrivals, CI status updates). Monitors run alongside the interval timer and either can trigger the next execution.
7. **Provide clear status output.** On each iteration, display: iteration number, timestamp, elapsed time since last run, and the result of the prompt execution. On errors, log the failure and continue to the next iteration.
8. **Support graceful termination.** Allow the loop to be stopped cleanly. On termination, display a summary: total iterations run, total elapsed time, success/failure counts.
9. **Handle errors without stopping.** If a single iteration fails, log the error and continue with the next scheduled execution. Do not let one failure break the entire loop.

## Examples

**Run a status check every 5 minutes:**
```
/loop 5m check the deployment status of staging
```

**Run every 30 seconds:**
```
/loop 30s gh run list --limit 1 -R acme/app
```

**Default interval (10 minutes):**
```
/loop check for new issues labeled "urgent"
```

**Long interval triggers cloud suggestion:**
```
/loop 2h generate a summary of today's merged PRs
# -> Suggests: "Interval is >=60m. Consider using /schedule for a cloud-based trigger."
```
