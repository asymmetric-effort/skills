---
name: loop
description: Schedule recurring or self-paced prompt execution within a session with fixed-interval and dynamic modes
category: automation
tags: [scheduling, loop, recurring, cron, automation, monitoring]
---

# Loop

## Purpose

Schedule recurring prompt execution within a Claude Code session. Supports fixed-interval mode (run every N minutes), dynamic/self-paced mode (intelligent delay selection based on cache and context), and event-driven wake-ups. Executes the prompt immediately on first invocation, then repeats on schedule.

## Prompt

You are setting up a recurring prompt loop. Follow this workflow:

### Step 1: Parse Input

Parse the user's input to extract the interval and prompt:

1. **Leading interval:** `/loop 5m /ci-status` — run `/ci-status` every 5 minutes
2. **Trailing clause:** `/loop /ci-status every 30m` — same, different syntax
3. **No interval:** `/loop /ci-status` — use dynamic/self-paced mode
4. **Interval formats:**
   - `Ns` — seconds (e.g., `30s`)
   - `Nm` — minutes (e.g., `5m`, default unit if bare number)
   - `Nh` — hours (e.g., `1h`)
   - `Nd` — days (e.g., `1d`)
5. **Default interval** if none specified: 10 minutes.

### Step 2: Select Execution Mode

#### Fixed-Interval Mode (interval specified)

- Execute the prompt at the exact specified interval.
- Use `setTimeout` / cron-based scheduling within the session.
- Track execution count and last execution time.

#### Dynamic/Self-Paced Mode (no interval)

- Execute the prompt, then determine the next delay based on:
  - **Cache-aware delay:** If results are cached (sub-5min TTL), use shorter delays (30s-2m).
  - **Slow-changing data:** If results rarely change, use longer delays (10m-30m).
  - **Event-driven:** If waiting for a specific condition (CI completion, file change), poll at 30s intervals until the condition is met, then extend to longer intervals.
- Announce the selected delay: "Next run in 5m (dynamic: results unchanged)."

#### Cloud Schedule Upgrade

- If the interval is >= 60 minutes or the user asks for daily/weekly execution, offer to upgrade to a cloud-based schedule (via `/schedule`):
  ```
  This loop runs daily. Want to set it up as a cloud schedule instead?
  Cloud schedules survive session closure and run on Anthropic's infrastructure.
  ```
- If accepted, hand off to `/schedule` with the equivalent cron expression.

### Step 3: Execute Loop

1. **Run immediately** on first invocation — don't wait for the first interval.
2. **Log each execution:**
   ```
   [Loop #1 @ 14:30:00] Running: /ci-status
   [Loop #1 @ 14:30:05] Complete. Next run in 5m (14:35:00)
   ```
3. **Handle errors gracefully:**
   - If the prompt execution fails, log the error and continue the loop.
   - Do not stop the loop on transient errors.
   - After 3 consecutive failures, warn the user and ask whether to continue.
4. **Support cancellation:**
   - The user can stop the loop by saying "stop loop" or "cancel loop."
   - Report loop summary on cancellation: total runs, successes, failures.

### Step 4: Arm Monitors (Event-Driven)

For event-driven wake-ups, arm monitors for:

- **CI completion** — poll `gh run list` for status changes.
- **File changes** — watch for file modifications via `inotifywait` or polling.
- **Issue updates** — poll `gh issue list` for new or changed issues.
- **Deployment events** — watch for new deployments or status changes.

When the monitored event fires, execute the prompt immediately regardless of the scheduled interval.

### Rules

- Always execute the prompt on first invocation (no initial delay).
- Never run more than one instance of the same loop simultaneously.
- Log every execution with timestamp and run number.
- Offer cloud schedule upgrade for long intervals (>= 60 min).
- Handle errors without stopping the loop.

## Examples

**Run CI status check every 5 minutes:**
```
/loop 5m /ci-status
```

**Monitor issues every hour:**
```
/loop 1h /monitor-issues
```

**Dynamic mode (auto-select interval):**
```
/loop /ci-status
> Dynamic mode: polling every 30s until CI completes, then every 10m.
```

**With trailing interval syntax:**
```
/loop /check-coverage every 30m
```

**Cancel a running loop:**
```
> stop loop
Loop stopped. Summary: 12 runs, 11 success, 1 failure over 55 minutes.
```
