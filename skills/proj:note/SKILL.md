---
name: proj:note
description: "Save one lasting finding in a project note, not a dated work journal."
---

# note


## Lookup Cues

Former frontmatter detail, kept here so global lookup stays compact:

> Write a single retrospective finding to `.notes/<slug>.md` in the current project. One thing per file. Atemporal — what's true, not what happened today. Declarative voice, no audience cues. Use when the user says "note this", "write a note", "/proj:note", "make a note", "synthesize this finding", "write down what we just figured out" — and the finding is *atemporally true*, not work-in-progress context (that's the journal). Distinct from `.journal/` (dated lab notes for *what happened and why*) and `.brief/` (handoff design doc for an executor). Notes are for the *finding itself*, decoupled from when it was learned and who will read it next.

**Crystallized finding, not a writeup.** A note is one thing the project now knows that it didn't before — captured tightly enough that future-you (or any agent) can grep for it and pick it up cold. No date in the filename, no audience in the prose, no hooks, no transitions, no setup. The finding *is* the artifact.

If you find yourself writing "in this note", "we'll cover", "first... then...", or any sentence whose job is to orient a reader — stop. You've drifted into post mode. Notes don't have readers; they have grep hits.

Sister formats (when to pick which):

- **`.journal/YYYY-MM-DD-<slug>.md`** — chronological lab notes. *"What happened today and why."* Dated. In-context-of-work.
- **`.brief/<slug>.md`** — executor handoff. *"Here's enough context to do X."* Has a target reader. Imperative.
- **`.notes/<slug>.md`** — crystallized finding. *"X is true."* Addressed by topic, not date. No reader.
- **`research/<slug>.md`** — capture of an *external* thing (tweet, article, repo). The note may reference these; it isn't one.

## Where it lives

`.notes/` at the **current project root** — same level as `.journal/` and `.brief/` if they exist, or alongside `README.md` / `CLAUDE.md` / `package.json` / `deno.json`. One project, one notes folder.

If the current directory has no obvious project root, **ASK** before creating `.notes/`. Better to confirm scope than seed notes in the wrong place.

Do NOT create cross-project notes folders. No `~/.notes/`, no `__resources/.notes/`. The closest cross-project shape is auto-memory or `__resources/collections/<name>/` — different system.

## Threshold

**Notes capture facts about how the system or world works — atemporal, declarative, written for future grep hits.** Most observations worth keeping belong in `.journal/` — the journal is durable too, and dated context is usually what future-you actually wants. Reach for a note when the finding is *atemporally true* (a fact about the system, not a fact about a moment of work) and *worth grepping for across sessions* (not just relevant to in-flight work).

If the value of capturing depends on when it was captured ("we decided X today", "what we tried first") — that's a journal entry. If the value would evaporate when the current task ships — that's a journal entry. Notes are for the truth that remains true after the work is gone.

A useful test before writing: *imagine someone joining the project in six months who greps for the slug. Does this note give them a truth they need? Or does it give them work-in-progress context that the journal would serve better?*

## When to write a note

- A user-visible mechanism, invariant, or constraint of the system that's non-obvious and would otherwise have to be re-derived (e.g. "CDP coordinate clicks pass through iframes at the compositor level").
- A trap discovered the hard way that will bite again (e.g. "the dropdown only commits on Escape, not blur"). The wrong-looking-right path captured for everyone after.
- A synthesis across multiple sources or journal entries that crystallizes into one durable claim.
- A called-out observation lifted from the running journal because it shouldn't be buried — the journal entry stays as record, the note states the truth.
- The user explicitly asks (`/proj:note`, "note this", "save this as a note") — push back gently if it's clearly journal-shaped (work-in-progress reasoning, dated context).

## When NOT to write a note — go to `.journal/` instead

- "Log what we did today" / "write up the session" / "record this decision" → **journal**, not note.
- "Capture the debug session" / "summarize the chase" → **journal** (the *story* belongs there; lift the underlying truth to a note if there is one).
- "We tried X and it didn't work, so we went with Y" → **journal** (it's the reasoning of a moment).
- A finding that's only meaningful in the context of in-flight work → **journal** until the work ships and you can tell what stuck.
- Implementation specifics already legible from the diff or commit message → don't capture either way.

Other reasons to skip the note (regardless of journal/not):

- The finding is already covered in landscape docs, READMEs, or an existing note (update the existing one — see [Updating notes](#updating-notes)).
- It's instructions for someone to do something — that's a brief or a docs:howto.
- It's a single external source captured verbatim — that's `research/<slug>.md`.
- It's a behavior rule for cross-conversation Claude — that's auto-memory.
- It's still in flux. Notes capture things now believed true; if it's still being figured out, stay in the journal until it crystallizes.

## What a good note looks like

The frame is **one thing, declared, with the why next to it.** A reader who greps for the topic and lands here should be able to leave with the truth in under 30 seconds.

Structure to aim for:

- **Title is the finding, not a hook.** `cdp-clicks-pass-through-iframes.md` is a finding. `Why we love coordinate clicks` is a post.
- **TL;DR is one declarative sentence.** What's true. Not what happened.
- **Evidence next to it.** The mechanism, the constraint, or the source — whatever makes the finding credible without being long.
- **Implication, when it helps.** What this changes about how we work or what to expect. Often the most useful part for the reader who landed here cold.
- **The trap, if there is one.** What looks like the right approach but isn't, and why.
- **Cross-links.** Where this connects to other notes, journal entries, briefs, or external sources.

Length target: one screen. If it grows past ~150 lines, you're either packing multiple findings (split into separate notes) or drifting into brief territory (move to `.brief/`).

## Format

Filename: `.notes/<kebab-slug>.md`. **No date prefix in the filename** — the slug names the finding. Multiple notes about the same area get separate files, not date suffixes; each note is one thing.

The date lives in frontmatter, not the filename. That keeps the slug stable as the address and lets triage tools answer "when did we figure this out" / "which notes are stale" without renaming files.

```markdown
---
date: YYYY-MM-DD                       # when the finding was first written
updated: YYYY-MM-DD                    # optional — only when the note has been meaningfully revised
description: <one declarative sentence — used by the index>
type: observation | finding | claim | lesson | invariant   # what role the note plays
tags: <comma-separated, lowercase, kebab-case — for grep>
sources:                               # optional — links to evidence
  - .journal/YYYY-MM-DD-<slug>.md
  - research/<slug>.md
---

# <Finding — declarative sentence-case title, not a hook>

<TL;DR — one or two declarative sentences. What's true.>

## Evidence

<the mechanism, constraint, or sources that make this credible — short>

## Implication

<what this changes about how we work or what to expect — optional, often the most useful part>

## Trap

<the wrong-looking-right path, if there is one — optional>

## See also

<relative links to journal entries, briefs, research notes, external sources>
```

Sections beyond TL;DR are optional. A one-line note (title + TL;DR) is fine. Don't pad to fill the template.

**Frontmatter is metadata, not voice.** `date:` says when the finding crystallized — it does NOT license `today we found...` in the prose. The body still reads as a present-tense truth; the frontmatter is for grep, triage, and the index. Same split blogs use: post date in frontmatter, but body prose doesn't keep saying "today."

## Voice — the discipline that makes this work

Notes are easy to drift into posts. The discipline is to write so it's *uncomfortable* to read aloud as a presentation.

**Banned moves:**

- **No second-person framing.** Kill `you can`, `you'll see`, `you should`, `you might`. The reader isn't there.
- **No first-person plural setups.** Kill `we'll explore`, `let's look at`, `in this note`. The note isn't a tour.
- **No narrative sequencers.** Kill `first...`, `then...`, `next...`, `finally`. A note is a finding, not a journey.
- **No hooks.** Kill `ever wondered`, `it turns out`, `surprisingly`. State the finding.
- **No conclusions.** No `in summary`, `in conclusion`, `to wrap up`. The last line is the last point.
- **No today-framing.** Kill `today we found`, `recently I noticed`, `during the X work`. That's a journal entry — write one of those, then lift the finding here.
- **No hedging that hides the claim.** `It seems like X might sometimes Y` → `X Y when Z`. If you don't know enough to be declarative, the note isn't ready.

**Preferred moves:**

- **Declarative present tense for the truth.** "Coordinate clicks pass through iframes." Not "we found that coordinate clicks pass through iframes."
- **Subject first.** The thing being claimed leads the sentence. (Same rule as fuma-nama.)
- **Prefer the bash incantation over prose.** If the finding is "this command does X," show the command.
- **Cite, don't narrate.** Link to the journal entry or research note that produced the finding instead of retelling it.

## Updating notes

Notes are *living*. If a finding gains nuance, refines, or gets new evidence — **edit the existing note in place** and bump `updated:` in the frontmatter. Don't create a new note that supersedes it; the slug is the address of the finding, and notes that supersede each other are confusing.

If a note turns out **wrong** — not refined, but actually wrong — retract it the same way as journal entries:

```markdown
> **Retracted YYYY-MM-DD:** <one-sentence reason — what we now know>.
> See [`<correction-slug>.md`](<correction-slug>.md) for the corrected finding.
```

Add `retracted` to `tags`. Don't delete the wrong text — the wrong reasoning is the artifact. Same logic as the journal retraction rule.

If the note becomes obsolete (the system it described no longer exists) — keep it, add `obsolete` to `tags`, and add a one-line note at the top: `> **Obsolete YYYY-MM-DD:** <what replaced it / why it no longer applies>.`

## Index

If notes pile up (>10), maintain `.notes/README.md` as a topical index — grouped by tag or area, not chronologically. One line per note: `- [<title>](file.md) — one-line hook`. Don't write the index until there's enough to justify it.

Mark retracted/obsolete notes in the index: `- [<title>](file.md) — one-line hook **[retracted]**`. Don't remove the line.

## How to invoke

Slash command: `/proj:note [optional slug or topic]`.

- **First, check the [Threshold](#threshold).** If the conversation produced only journal-shaped findings (work-in-progress context, today's debug story, a decision tied to the current task), say so and propose `/proj:journal` instead. The note skill is for atemporal truths, not in-flight reasoning.
- With no argument: scan whatever the recent conversation has crystallized. If an atemporal finding is present, write it. If multiple findings emerged, ASK which one. If only journal-shaped findings emerged, propose `/proj:journal`.
- With an argument: focus the note on that finding. If the named finding is journal-shaped (dated, in-context-of-work), push back before writing.
- If a note with the same slug already exists, ASK before overwriting; offer to update in place instead.
