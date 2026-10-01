---
name: proj:journal
description: "Write dated lab notes on decisions, reasoning, and surprises."
---

# journal


## Lookup Cues

Former frontmatter detail, kept here so global lookup stays compact:

> Write a dated journal entry to `.journal/` in the current project — a lab notebook of decisions, reasoning, and observations. NOT for publishing. Records *why* we did something, what we considered and rejected, what surprised us, what both you and the user thought going in. Internal voice, not audience voice. Use when the user says "journal this", "add to journal", "/proj:journal", "write a journal entry", "lab notes", "log this decision", "record this", "capture this thought", "save this thought", or after substantive cross-cutting work worth a durable note (refresh sweeps, multi-source synthesis, "huh, all three of these did the same thing this week" observations). Distinct from briefs (`.brief/<slug>.md`, designed for handoff to an executor) — journal is record-keeping written for future-you, not for an audience.

**Lab notebook, not blog draft.** The `.journal/` system records *what happened and why* — what we noticed, what surprised us, what was kept in and what was kept out, what both you and the user were thinking. Written for future-you trying to reconstruct context months later, not for an audience.

If a future-you eventually mines an old entry to draft a public post, fine — that's downstream and incidental. **Write the entry as private record-keeping first.** The frame is "I'm leaving a trail for myself," not "I'm drafting copy." If you find yourself polishing the prose, smoothing transitions, or writing intros that "set up the topic," stop — you've drifted into blog mode.

Sister formats:

- **`.brief/<slug>.md`** — concentrated design doc handed to an agent or teammate. Has Status / Sources / Recommendation / Implementation Sketch.
- **`.journal/YYYY-MM-DD-<slug>.md`** — lab-notebook entries. Dated record of decisions, reasoning, and observations. Internal-facing.
- **`research/<slug>.md`** or `notes.md` — capture of an external thing (tweet, article, repo). The journal references these; it isn't one.

## Where it lives

`.journal/` at the **current project root** — same level as `.brief/` if one exists, or alongside the project's `README.md` / `CLAUDE.md` / `package.json` / `deno.json`. One project, one journal.

**Do not create shared cross-project journals.** No top-level `~/.journal/`, no `__resources/.journal/`. Each project's journal is local to that project — agents get confused otherwise.

If the current directory has no obvious project root, **ASK** before creating `.journal/`. Better to confirm scope than seed a journal in the wrong place.

## When to write a journal entry

- After a non-obvious decision — record what was kept in, what was rejected, and *why* we made the call we did
- When you want to capture what both you and the user were thinking *before* something changed (context that's invisible from the diff alone)
- After cross-cutting work that surfaces a pattern (multi-source refresh sweeps, "noticed across N things")
- When the user explicitly asks (`/proj:journal`, "journal this", "log this decision", "lab notes")
- When synthesis the user reacted positively to is worth making durable
- A breadcrumb for future-you about the *reasoning* behind a state, not just the state itself

## When NOT to write one

- Routine task completion (just update `TASKS.md`)
- Single-source notes (those go in `research/<slug>.md` or `notes.md`)
- Long structured arguments aimed at an executor (that's a brief — write to `.brief/`)
- Restating what's already in landscape docs or READMEs
- **Anything you'd actually want to publish.** That's a draft, not a journal entry. Drafts go elsewhere.

## What a good entry captures

The frame is *"I want to be able to reconstruct what we were thinking."* So:

- **What we did** — short, factual.
- **Why** — what made it the right call *at the time*. Constraints, what the user said, the alternative we almost picked.
- **What we kept out** — paths considered and rejected, and the reason. The most useful part for future-you, because the diff already shows what's in.
- **What surprised us** — observations that didn't fit our prior model.
- **Open questions / followups** — what we don't know yet, what we punted on.

You're writing for a future agent (or future-you) reading this and asking "wait, why did we do this?" — answer that question. If an entry doesn't help someone reconstruct the reasoning, it's not pulling its weight.

## Format

Filename: `.journal/YYYY-MM-DD-<kebab-slug>.md`. Date-prefix sorts chronologically. Slug is short, identifies the topic. Multiple entries on the same day get a suffix: `2026-04-28-agent-stack.md`, `2026-04-28-evening-thoughts.md`.

```markdown
---
date: YYYY-MM-DD
tags: <comma-separated, lowercase, kebab-case>
type: observation | synthesis | learning | followup | decision
sources: <repo-names, files, or topic-tags this came from>
---

# <Title — sentence-case, descriptive, NOT a hook or headline>

<TL;DR — 1-2 sentences. What happened, in plain terms.>

## <Section header>

<short prose, tables, or lists>

## <Section header>

<...>

---

<source>Optional context: what triggered this entry, where the long-form lives if it exists.</source>
```

Aim for one screen-scroll. If it grows past ~300 lines, it's probably a brief — move it to `.brief/<slug>.md`.

## Conventions

- **Internal voice, not audience voice.** Write the way you'd write in a notebook: terse, dated, unpolished. No intros that "set up the topic for the reader" — there is no reader except future-you.
- **Titles are descriptive, not hooks.** `2026-04-28-pi-stack-refresh-and-queue-closeout.md` is a title. `Why I stopped using X and you should too` is a blog post — wrong shape.
- **Record decisions explicitly** with `type: decision`. The format is the same; the type just makes them grep-able later when you ask "when did we decide X?"
- **No trailing summaries.** Don't end with "in conclusion" — last section is the last point.
- **Tag aggressively** for grep-ability. Reuse existing tags from prior entries when applicable; invent new ones when needed.
- **Lead with the punchline.** TL;DR up front, evidence below.
- **Date-prefix is canonical.** Don't rely on file mtime; `YYYY-MM-DD` in the filename is the date of record.
- **Cross-link freely** — reference notes, landscape docs, briefs, prior journal entries by relative path.
- **Retract, never delete.** When an entry's thinking turns out wrong, mark it retracted in place with a correction pointer — never delete or silently rewrite. See [Retractions, not deletions](#retractions-not-deletions). Deletion erases the lesson and you'll repeat the wrong reasoning.

## Retractions, not deletions

When an entry's thinking turns out to be wrong — a decision was reversed, an observation was based on a wrong premise, an "it works this way" claim was disproven — **mark the entry as retracted in place. Do not delete it. Do not silently rewrite the wrong claim.**

Why: deletion erases the lesson. Without a visible record of the wrong reasoning and *why* it was wrong, future-you arrives at the same wrong conclusion again — there's no evidence the path was already explored and rejected. The retraction *is* the documentation. Same shape as a paper retraction in a journal: the wrong paper stays in the record, marked retracted, with the reason — the field learns from the failure.

**How to retract:**

1. Add a retraction block at the top of the entry, immediately under the H1 title and before the TL;DR:

   ```markdown
   > **Retracted YYYY-MM-DD:** <one-sentence reason — what we now know>.
   > See [`YYYY-MM-DD-<correction-slug>.md`](YYYY-MM-DD-<correction-slug>.md) for the corrected thinking.
   ```

2. If only *part* of the entry is wrong, leave the top retraction block off and instead inline a marker right next to the wrong claim:

   ```markdown
   > **Retraction (YYYY-MM-DD):** <what's wrong with the paragraph above>. Corrected in [`...`](...).
   ```

3. Update the frontmatter `tags` to include `retracted` so it's grep-able.
4. **Do NOT** edit the wrong text away. The wrong reasoning is the artifact — touching it (beyond the markers above) destroys the audit trail.
5. If the correction lives in a new entry, link both ways — old entry → new entry via the retraction block; new entry → old entry via a "Supersedes" line in its TL;DR or a `supersedes:` frontmatter field.

**When to retract vs. just write a new entry:** if the new thinking simply *evolves* prior thinking (same direction, more nuance), no retraction is needed — write a fresh entry that links back. Retract only when the prior entry was *wrong* in a way that would mislead future-you if read at face value.

This rule applies equally to `.brief/<slug>.md` — retract in place, don't rewrite history. Does NOT apply to ephemeral state (TASKS.md, scratch notes), which can be deleted freely.

## Index

If entries pile up (>10), maintain `.journal/README.md` as a chronological index. One line per entry: `- YYYY-MM-DD — [title](filename.md) — one-line hook`. Don't write the index until there's enough to justify it; offer to start one when crossing the threshold.

Mark retracted entries in the index too: `- YYYY-MM-DD — [title](file.md) — one-line hook **[retracted — see <new-entry>]**`. Don't remove the line.

## How to invoke

Slash command: `/proj:journal [optional context]`. With no argument, write about whatever the recent conversation has been about. With an argument, focus the entry on that topic.
