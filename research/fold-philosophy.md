> **Archived:** The canonical fold skills now live in the fold project at `/Users/janzheng/Desktop/Projects/__active/_apps/fold/skills/` and are distributed via `/Users/janzheng/Desktop/Projects/mcp-hub/skills/fold*/`. The skill drafts in this folder (Mar 15 2026) are superseded. This README is preserved for its philosophy writeup.

# fold

Like folding dough — iterative, each pass makes it stronger. You never fold once.

**fold** is what happens when mxit + playtest + autorefine work together in a project. Each skill is useful alone. Together they create a self-improving loop.

## The triangle

```
        discover
       (playtest)
        /      \
      /          \
   track ——— improve
  (mxit)    (autorefine)
```

**playtest** discovers what's wrong, what's weird, what's interesting. Bugs, loopholes, design flaws, surprising usage patterns, "huh" moments.

**mxit** tracks what needs doing. Findings become tasks. Tasks have statuses, owners, dependencies, history. Nothing gets lost between sessions.

**autorefine** makes things better. One change at a time, judged against a rubric (scored or vibes), kept or discarded. Improvement through iteration, not grand rewrites.

## Why 1+1+1 > 3

Each skill alone does one thing well:
- playtest alone → findings, but they might get lost
- mxit alone → tracking, but you have to know what to track
- autorefine alone → improvement, but you have to know what to improve

Together they close the fold:

1. **playtest** discovers → "huh, the permission system doesn't check nested resources"
2. **mxit** tracks → `- [ ] Permission gap on nested resources #found #playtest #security`
3. **autorefine** improves → iterates until the rubric says it's solid
4. **playtest** again → "the fix works, but there's a performance regression"
5. **mxit** tracks → `- [ ] O(n²) permission checks on deep nesting #found #playtest`
6. fold again

The project gets better. Not autonomously — humans are at the checkpoints — but the agent does the legwork. The human reviews, approves, steers.

## The ingredients

**Markdown as the medium.** Tasks, playtests, rubrics, results, findings — all `.md` files. Human-readable, version-controlled, editable by both agents and humans.

**Agent as the operator.** Reads the files, does the work, writes results back. Uses judgment, not assertions. Makes decisions, not just measurements.

**Human at the checkpoints.** Proposes rubrics (human approves). Emits findings (human reviews). Marks tasks done (human can override). The fold runs fast but the human controls direction.

**History as memory.** Every playtest run, every autorefine iteration, every mxit status change is tracked. The project accumulates knowledge. New agents read the history and pick up context.

## What fold is not

- Not a framework — no code to install, no dependencies, no runtime
- Not CI/CD — non-deterministic, judgment-based, runs on human schedule
- Not an agent framework — doesn't manage processes or infrastructure
- It's a **practice** — drop three skills into a project and a way of working emerges

## The first fold

We built mxit (task format + parser). Then playtest and autorefine as skills. Then we folded mxit:

- playtest:explore found 22 issues — a critical cascade bug, missing CLI commands, raw stack traces, no status reporting
- Fixed everything in two passes. 49 tests passing.
- The playtest itself produced feedback on the playtest skill ("duration annotations feel performative for agents")
- Used that to autorefine the playtest skill
- The autorefine of autorefine produced the comparative/vibes grading mode

Each tool improved the others. One afternoon, every part of the system got better.

## Open questions

- **Should fold be one repo?** Currently three skills in the hub. If they grow code (a fold runner, a playtest executor), they might want to live together.
- **How autonomous can it get?** Humans trigger each step now. Could an agent fold a project overnight? (Karpathy's autoresearch does — but with a numeric metric, not judgment.)
- **What's the minimal fold?** If you drop ONE skill into a project, it's probably mxit (the state layer). Two skills: mxit + playtest (discover and track). All three: the full fold.
- **Is `/fold` a skill?** A meta-skill that runs the triangle: playtest → emit mxit tasks → autorefine the weakest part → repeat. Or is fold just the name for using the three skills together?
