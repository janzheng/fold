---
name: playtest:run
description: Execute directed agentic playtests — read the playtest file, operate the system as a user would, make judgment calls, mark results, track duration. Use when the user says "run playtest", "run the smoke test", "execute playtest", or points you at a playtest .md file to execute.
---

# Execute Directed Playtests

You are a playtester. Read the playtest file, execute each task by operating the real system, judge whether the result is correct, and mark outcomes.

## How to run

1. **Read the playtest file.** Understand each task's goal and what "done" looks like.
2. **Check the risk tier.** Start with `none`/`low` risk tasks. If those fail, stop — don't escalate to higher tiers.
3. **Execute each task** by running real commands against the real system. You are not writing test code — you are *using* the system.
4. **Judge the result.** Did it work? Was it confusing? Did it take too long? Was the output clear?
5. **Mark the outcome** using resolution brackets and duration.

## Executing a task

For each `- [ ]` task:

1. Read the task description carefully
2. Figure out *how* to accomplish it (the task says what, you decide how)
3. Run the commands, navigate the UI, call the API — whatever the task requires
4. Observe the output. Does it match expectations?
5. Update the task with the result

### Marking results

```markdown
# Before
- [ ] Create a user and verify the welcome email is sent

# After — pass
- [x] [pass: user created, email arrived in 4s] Create a user and verify the welcome email is sent — 31s

# After — fail
- [x] [fail: user created but no email sent, no error logged] Create a user and verify the welcome email is sent — 28s

# After — confused
- [x] [confused: couldn't find the signup page, had to grep the codebase] Create a user and verify the welcome email is sent — 3m12s

# After — blocked
- [ ] [blocked: staging server is down] Create a user and verify the welcome email is sent
```

Note: `fail` and `confused` tasks still get `[x]` — the task was *executed*, it just didn't pass. Only `blocked` stays `[ ]` because it couldn't be attempted.

### Resolution keywords

| Keyword | When to use |
|---------|-------------|
| `pass` | System behaved correctly |
| `fail` | System misbehaved — a bug or incorrect behavior |
| `confused` | You got stuck on UX/DX, not a code bug — the system works but is hard to use |
| `blocked` | Can't attempt — dependency missing, server down, permissions issue |
| `found` | Discovered something unexpected not in the task description |

### Duration

Time each task. Append after `—`:
- Seconds: `— 11s`
- Minutes: `— 2m30s`
- With cost: `— 31s, $0.12`

Duration spikes are signals. If a task normally takes 10s and suddenly takes 2 minutes, you were struggling with something — report what.

## Judgment calls

You are not asserting `a === b`. You are judging:

- **Does this output look right?** Not "does it match a regex" but "would a user understand this?"
- **Is this error message helpful?** Not "does it exist" but "could someone debug from this?"
- **Was this confusing?** Not "did it fail" but "did I have to think too hard about how to do this?"
- **Is anything missing?** Not "does the test pass" but "is there something that should be here but isn't?"

Report your judgment honestly. "This worked but the error message is useless" is a valid finding even when the task passes.

## Multi-step tasks

Some tasks have multiple verification points. Execute them as one coherent operation:

```markdown
- [ ] Create a project, add 3 tasks, mark one complete. Verify the
  list shows 2 pending and 1 done. Then delete the project and
  verify it's gone from the list.
```

Don't split this into micro-steps. Execute the full flow, report the outcome.

## When to stop

- **Blocked by earlier failure:** If a tier-0 smoke test fails, don't run tier-1 tasks that depend on the same system.
- **System is down:** Mark remaining tasks `[blocked]` and report.
- **Cascading failure:** If 3+ consecutive tasks fail for the same root cause, note the pattern and skip remaining tasks in that group.

## After the run

1. Update the playtest file with all results
2. Add an entry to `PLAYTEST-RESULTS.md`:
   ```markdown
   | 2026-03-15 | smoke | Pass | 4/4 tasks, 8-38s each |
   ```
3. If any task got `fail` or `found`, suggest whether a new directed playtest should cover that area

## What you are NOT doing

- You are not writing test code
- You are not mocking anything
- You are not checking assertions
- You are operating the real system and reporting what happened, like a human QA tester would
