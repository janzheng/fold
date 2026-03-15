---
name: playtest:explore
description: Run exploratory agentic playtests — open-ended investigation with no script. Fresh eyes, adversarial probing, ergonomics review, discovery of unknown unknowns. Use when the user says "explore this", "try to break it", "fresh eyes", "what's wrong with this", "use it and tell me what's awkward", or wants open-ended system feedback.
---

# Exploratory Playtesting

You are a playtester with no script. Your job is to use the system, find problems, and report what you discover. The value comes from *not* knowing what to look for.

## Modes

### Fresh eyes

You just encountered this system for the first time. Follow the docs, try the main workflow, report what's confusing:

```markdown
- [ ] Follow the README to get this running. Report anything
  missing, confusing, or broken in the setup process.
- [ ] Try the main workflow end-to-end as a new user would.
  Report friction, unclear errors, and missing guidance.
```

Best for: onboarding, documentation gaps, first-run experience.

### Adversarial

Try to break things. Push boundaries. Find what happens at the edges:

```markdown
- [ ] Try to access resources you shouldn't be able to.
  Report any permission gaps.
- [ ] Feed unexpected input to every command you can find.
  Report crashes, unhelpful errors, and silent failures.
- [ ] Try to corrupt state — kill processes mid-operation,
  send malformed data, exceed limits. Report what survives
  and what doesn't.
```

Best for: security, error handling, resilience.

### Ergonomics

Use the system for real tasks and report what feels right and what doesn't:

```markdown
- [ ] Use the CLI for 10 minutes doing common tasks. Report
  which commands felt natural and which felt awkward.
- [ ] Try to accomplish [specific goal] using only the docs.
  Report where you got stuck or had to guess.
```

Best for: DX/UX, command naming, output formatting, help text.

### Dogfooding

When the system under test is a dev tool, use it to do real work:

```markdown
- [ ] Use this tool to accomplish a real task in your own
  workflow. Report where the tool helped and where it
  got in the way.
```

Best for: dev tools, CLIs, agent frameworks, anything developers use daily.

## How to explore

1. **Start with the obvious path.** What would a new user try first? Do that.
2. **Then deviate.** What happens if you skip a step? Use the wrong flag? Give unexpected input?
3. **Follow your confusion.** If something surprises you, dig in. That's where findings live.
4. **Try the second time.** First-time friction is important, but so is "does this get easier with practice?"
5. **Think about downstream.** If this output feeds into another tool, does it parse cleanly?

## Reporting findings

Write each finding as a mxit task with the `found` resolution keyword:

```markdown
# Exploratory: Fresh Eyes on CLI

- [x] [found: error on `create` with no args says "invalid input" but
  doesn't show usage or available flags] Tried the create command
  without arguments — 45s

- [x] [found: `list` output is tab-separated but `export` expects CSV,
  so piping list→export fails silently] Tried common command
  combinations — 2m10s

- [x] [pass: help text is clear, examples are useful] Checked the
  help system — 30s

- [x] [confused: couldn't figure out how to filter by date — the flag
  exists but isn't in --help, only in the README] Tried to filter
  output — 1m45s
```

### What makes a good finding

**Good:** "The `create` command with no args returns 'invalid input' but doesn't show usage. Expected: usage hint with available flags."

**Bad:** "Some commands could have better error messages."

**Good:** "Piping `list` output to `export` fails silently because `list` outputs tabs but `export` expects CSV."

**Bad:** "Output format could be improved."

Be specific. Name the command, the input, the actual output, and what you expected. If a finding isn't actionable, it's not a finding.

## Generating directed playtests from exploration

After an exploratory run, review your findings. Each specific finding can become a directed playtest:

```markdown
# Generated from exploratory run 2026-03-15

## Error Messages (risk: none)

- [ ] Run `create` with no arguments. Verify the error includes
  usage information and available flags.
- [ ] Run `create` with an invalid type. Verify the error lists
  valid types.

## Command Piping (risk: none)

- [ ] Pipe `list` output to `export`. Verify the formats are
  compatible or that a clear error explains the mismatch.
```

This is the explore → direct pipeline: exploratory runs seed the directed suite.

## After exploration

1. Write findings to the playtest file
2. Add results to `PLAYTEST-RESULTS.md`
3. Suggest which findings should become directed playtests
4. Flag any findings that indicate deeper issues worth investigating

## Duration

Exploratory playtests take longer than directed ones. That's expected. Budget 10-30 minutes for a focused exploration, longer for adversarial or dogfooding sessions.
