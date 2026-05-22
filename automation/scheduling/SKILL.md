---
name: scheduling
description: Set up scheduled and recurring tasks using cron, systemd timers, and cloud schedulers
category: automation
tags: [scheduling, cron, timers, automation, recurring-tasks]
---

# Scheduling

## Purpose

Provide guidance on setting up scheduled and recurring tasks — cron jobs, systemd timers, periodic automation, and cloud-based schedulers. Help users choose the right scheduling tool, write correct schedule expressions, and follow best practices for reliable unattended execution.

## Prompt

Help the user set up scheduled or recurring tasks. Follow these guidelines:

1. **Clarify the schedule first.** Before writing anything, confirm what needs to run, how often, and what environment it runs in (bare Linux, container, cloud platform).
2. **Cron syntax fundamentals.** When using cron, explain the five-field format clearly:
   - `minute (0-59) hour (0-23) day-of-month (1-31) month (1-12) day-of-week (0-7)`
   - Use mnemonics: "minute, hour, dom, month, dow"
   - Mention shorthand: `@hourly`, `@daily`, `@weekly`, `@monthly`, `@reboot`
   - Warn about common pitfalls: `*/5` means every 5 units, `5` means at exactly 5
3. **Choose the right tool for the job:**
   - **crontab:** Simple recurring commands on a single machine. Best for straightforward periodic tasks.
   - **systemd timers:** When you need dependency ordering, logging integration with journald, or calendar-based expressions like `OnCalendar=Mon..Fri 09:00`.
   - **Cloud schedulers (AWS EventBridge, GCP Cloud Scheduler, Azure Logic Apps):** For triggering lambdas, cloud functions, or HTTP endpoints. Use these when the workload is serverless or distributed.
   - **Task queues (Celery Beat, Sidekiq, Bull):** When the scheduled work is part of an application and needs retry logic, queue management, or result tracking.
4. **Best practices — always apply these:**
   - **Idempotency.** Scheduled tasks will occasionally run twice (overlapping runs, retries, clock adjustments). Design every job so running it twice produces the same result as running it once.
   - **Locking.** Use `flock` or equivalent to prevent overlapping executions: `flock -n /tmp/myjob.lock /path/to/script.sh`
   - **Logging.** Never discard output silently. At minimum redirect to a log file: `>> /var/log/myjob.log 2>&1`. Better: use structured logging.
   - **Error handling.** Set `set -euo pipefail` in bash scripts. Configure email or alerting for failures. Check exit codes.
   - **Environment.** Cron runs with a minimal environment. Always use absolute paths for commands and files. Set `PATH` explicitly if needed.
   - **Timeouts.** Wrap long-running jobs with `timeout` to prevent hung processes: `timeout 3600 /path/to/script.sh`
5. **Testing.** Always test a scheduled task by running it manually first. For cron, simulate the minimal environment with `env -i /bin/bash --noprofile --norc -c 'your-command'`.
6. **Monitoring.** Suggest dead-man's-switch services (Healthchecks.io, Cronitor, PagerDuty) for critical jobs — the job pings a URL on success, and you get alerted if the ping stops arriving.

## Examples

**Basic crontab entry — run a backup every day at 2:30 AM:**
```
30 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1
```

**Every 15 minutes, with file locking to prevent overlap:**
```
*/15 * * * * flock -n /tmp/sync.lock /usr/local/bin/sync-data.sh >> /var/log/sync.log 2>&1
```

**Weekdays only at 9 AM:**
```
0 9 * * 1-5 /usr/local/bin/morning-report.sh
```

**systemd timer unit (run daily cleanup):**
```ini
# /etc/systemd/system/cleanup.timer
[Unit]
Description=Run daily cleanup

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

```ini
# /etc/systemd/system/cleanup.service
[Unit]
Description=Cleanup task

[Service]
Type=oneshot
ExecStart=/usr/local/bin/cleanup.sh
```

**AWS EventBridge rule (invoke a Lambda every hour):**
```json
{
  "ScheduleExpression": "rate(1 hour)",
  "Targets": [{ "Arn": "arn:aws:lambda:us-east-1:123456789:function:my-function" }]
}
```

**Common cron schedule cheat sheet:**
```
*/5 * * * *     Every 5 minutes
0 * * * *       Every hour, on the hour
0 0 * * *       Midnight daily
0 0 * * 0       Midnight every Sunday
0 0 1 * *       Midnight on the 1st of each month
@reboot         Once at startup
```
