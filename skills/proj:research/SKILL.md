---
name: proj:research
description: "Collect links, articles, and repos with research notes."
---

# research — Capture & Explore


## Lookup Cues

Former frontmatter detail, kept here so global lookup stays compact:

> Capture and organize research — tweets, blog posts, ideas, deep dives, and GitHub repos — into either a centralized collection under __resources/collections/ or a project-local research/ folder. Use when the user shares a link, says "research this", "pull this repo", "save this tweet", "add to research", "add to <collection>", "save to signals", "save to stock-market", "save to bioinformatics", "look into this", "think through this", or wants to capture external references for later discussion.

Capture tweets, blog posts, ideas, and GitHub repos. Default to the current project's research folder. Use centralized collections when the user names one or is working inside one.

## Where does this go? (decide FIRST)

The destination determines the format. Pick one:

1. **User names a collection explicitly** — "add to signals", "save to stock-market", "/proj:research into bioinformatics":
   → `__resources/collections/<name>/inbox/<topic>/` (or `items/<topic>/` for repos).
   **Read `__resources/collections/<name>/CLAUDE.md` first** for collection-specific rules (topics, tags, templates). That overrides anything here.

2. **User is inside a folder with its own CLAUDE.md** (e.g. currently working inside a collection or inside `__resources/github-repos/`):
   → Write there. Follow that folder's CLAUDE.md.

3. **User is inside an identifiable project**:
   → Use its existing research convention (including `skills-research/` here), or create `research/` when capturing the first item.

4. **Project root is genuinely unclear** — ask where the capture belongs. Do not ask merely because `research/` does not exist yet.

## The two models

### Centralized collection (explicit destination — `__resources/collections/<name>/`)

```
<collection>/
├── README.md           — scope + pointer
├── CLAUDE.md           — collection-specific rules (READ FIRST)
├── inbox/<topic>/      — fresh captures, pre-triage
├── items/<topic>/      — triaged, kept
│   └── <repo>/
│       ├── <repo>/     — cloned source
│       └── notes.md
├── searches/           — sweep logs
├── requests.md         — cross-machine fetch queue
└── _workshop/          — original synthesis, landscape docs
```

Fresh captures: `inbox/<topic>/YYYY-MM-DD-<slug>.md`.
Triaged promotions (on "triage <collection>"): `items/<topic>/<slug>.md` (or `items/<topic>/<name>/<name>/ + notes.md` for repos).

### Project-local (default — `<project>/research/`)

```
research/
├── README.md           — annotated index
├── <kebab-slug>.md     — flat note (tweet/article)
├── <repo>/
│   ├── <repo>/         — cloned source
│   └── notes.md        — alongside
└── _workshop/          — original synthesis
```

Flat. No inbox stage. README.md is the annotated index. Used by:
- `__active/_apps/fold/research/`
- `__active/_apps/tigerflare/research/`
- `__active/_apps/denoclaw/research/`
- `__resources/github-repos/` (grandfathered — flat collector at scale)
- `mcp-hub/skills-research/`

## Three kinds of research

### 1. Notes — capturing external material

Tweets, blog posts, articles, talks. You read something, capture it.

**Name by the idea, not the source.** Good: `social-relevancy-not-seo.md`. Bad: `mvanhorn-tweet-march-16.md`.

- **Centralized path:** `<collection>/inbox/<topic>/YYYY-MM-DD-<slug>.md`
- **Project-local path:** `<project>/research/<slug>.md`

Both use the same format:

````markdown
---
description: <one-liner — powers tf_ls/tf_tree when synced>
date: YYYY-MM-DD             # capture date — when you're saving this, not source publish date
published: YYYY-MM-DD        # optional — source publish date when known (paper, dated post)
---

# <title>

## Tags: <tag1>, <tag2>, <tag3>

- **Source:** [link]
- **Author:** Name (@handle) — if applicable
- **Date captured:** YYYY-MM-DD

## TL;DR

<2-3 sentences — what it is, why it matters>

## Key takeaways

<bullets — what's interesting, what to steal, what's relevant>

## Discussion

### YYYY-MM-DD — First read

<initial reactions, connections to other research>

---

<source url="https://...">
[full text verbatim — preserve in case the link rots]
</source>
````

**Why frontmatter + `## Tags:`:**
- `description:` in frontmatter powers TigerFlare's `tf_ls`/`tf_tree` when synced, and makes files scannable in listings.
- `## Tags:` line enables cross-cutting discovery: `grep -r "Tags:.*phage" __resources/`. Only works if everyone uses the same line.

**Fetching tweets/pages:** use the Jina proxy with curl (WebFetch tool summarizes; we need verbatim):

```bash
curl -s -H "Accept: text/markdown" "https://r.jina.ai/https://x.com/user/status/123"
```

Jina fetches the original tweet only, not replies. For long sources (papers, articles), use a folder instead:

```
<slug>/
├── notes.md      — TL;DR, takeaways, discussion
└── source.md     — full archived text
```

**File vs folder — decide by what comes with it:**

- Single short text capture (tweet, blog quote, short article) → flat `<slug>.md`
- Has a PDF, cloned repo, images, or any non-text asset → `<slug>/` folder so everything stays together

**PDFs → run `liteparse` for a markdown twin.** Drop the original PDF in the folder, then run liteparse over it to produce a clean `<name>.md` alongside. Synthesis reads the markdown; the PDF stays as the durable artifact:

```
<slug>/
├── notes.md      — your write-up + tags + discussion
├── paper.pdf     — original (durable)
└── paper.md      — liteparse output (read this for synthesis, grep, citation)
```

Same pattern for any binary capture: keep the original, generate a text twin next to it. Skip liteparse only if the source is already clean markdown.

### 2. Repos — studying code

GitHub projects cloned for reference.

```bash
# Check size first — ~100MB cap; ask user if larger
gh api repos/<org>/<repo> --jq '.size'

# Clone, strip .git
cd /tmp && git clone --depth 1 <repo-url> tmp-clone
rm -rf tmp-clone/.git
```

Place at the right path per model:

- **Centralized:** `<collection>/items/<topic>/<repo-name>/<repo-name>/` + `notes.md` at `<collection>/items/<topic>/<repo-name>/notes.md`
- **Project-local:** `<project>/research/<repo-name>/<repo-name>/` + `<project>/research/<repo-name>/notes.md`

```bash
mkdir -p <destination>/<repo-name>/<repo-name>
cp -r tmp-clone/* tmp-clone/.[!.]* <destination>/<repo-name>/<repo-name>/
rm -rf /tmp/tmp-clone
```

`notes.md` alongside the clone:

````markdown
---
description: <one-liner about the repo>
date: YYYY-MM-DD             # date cloned
---

# Research Notes: <repo name>

## Tags: <tag1>, <tag2>

- **Repo:** [org/repo](https://github.com/org/repo)
- **Date cloned:** YYYY-MM-DD
- **Stars / Language / License:** if notable

## What it is

<1-2 sentences>

## What to study

<bullets — what's interesting for our purposes>

## Key observations

<architecture, design decisions, patterns to steal or avoid>

## Discussion

### YYYY-MM-DD — First read

<notes, reactions, connections>
````

### 3. Deep dives — your own thinking (→ `_workshop/`)

Not from external material. Your own exploration: design questions, pattern comparisons, architecture insights.

**Both models:** `_workshop/<kebab-slug>.md`

````markdown
---
description: <one-liner>
date: YYYY-MM-DD             # date this deep dive was started
---

# <title>

*Deep dive — exploring an idea, not capturing external material.*

## The idea

<what you're exploring and why>

## How it might work

<prose, pseudocode, diagrams, pros/cons>

## Open questions

<what you don't know yet>

## Discussion

### YYYY-MM-DD — First pass

<thinking>
````

The agent's job in a deep dive: push thinking deeper, surface implications, trace tradeoffs, connect to other ideas. If the direction is ambiguous — if it's unclear why the user wants to explore this or what "deeper" means here — **ASK**. A few good questions up front prevent a shallow deep dive.

**When to create one:**
- A note or conversation surfaced an idea worth its own space
- Thinking through a design decision
- You keep coming back to the same question — give it a file
- Pattern or gap noticed across multiple cloned repos
- Architectural insight about the project

## Triage (centralized collections only)

Collections have an inbox → items flow. Project-local research/ doesn't.

When the user says "triage <collection>" or "clean inbox":
1. Walk `<collection>/inbox/` entries.
2. For each: keep (promote to `items/<topic>/<slug>.md`) or discard (delete).
3. Surface edge cases.

Project-local research/ has no triage — if it's there, it's kept. If it needs to go away, the user deletes it manually.

## Cross-referencing

Use markdown links: `See [harness-is-the-product.md](harness-is-the-product.md) for context.`

Cross-model links: `See [__resources/collections/signals/items/bio-science/...](../../collections/signals/items/bio-science/...)` works within the Projects tree.

## Discussions are the valuable part

Every format has a `## Discussion` section. Always append dated entries — never rewrite. New agents and future sessions read the discussions to pick up where you left off.

## Rules

- **Notes: kebab-case.md** — name by the idea, not the source
- **Repos: use the repo name as folder** — prefix with org only on collision
- **Cloned code is read-only** — never modify it
- **Always strip .git** — no submodules, no history
- **Check repo size before cloning** — ask if over ~100MB
- **PDFs get a markdown twin** — `liteparse <name>.pdf` → `<name>.md` alongside the original
- **Frontmatter required** — every file has `description:` and `date: YYYY-MM-DD` (capture/clone/start date) in YAML frontmatter. Add `published:` to notes when the source has a publish date (paper, dated post). Frontmatter is the machine-readable source of truth (powers `tf_recent`, age-based triage); body display fields like `**Date captured:**` are secondary.
- **Tags line required on notes.md** — `## Tags: tag1, tag2` for grep-discovery
- **Source refs at the bottom** — `<source>URL — what</source>` block
- **Append to discussions, don't rewrite** — chronological record
- **Full source captures** — tweets verbatim, article excerpts. Links rot.
- **Default to inbox for collections** — promote to items on triage, not on capture
- **Read the destination's CLAUDE.md first** — when writing into a collection, its CLAUDE.md overrides the skill

## When to use

- User shares a link + names a collection → **note** in that collection's inbox
- User shares a link, no collection named → **note** in project's research/, or ASK
- User says "look into this repo" → **repo** (cloned + notes.md, in the right location)
- User says "think through this" or "I keep wondering" → **deep dive** (`_workshop/`)
- User says "save this tweet", "save this signal" → **note** in right location
- User says "add to <collection>" → route to collection
- User says "triage <collection>" → triage flow (inbox → items)
- Pattern discovered across repos → **deep dive** in `_workshop/`

## README.md / index maintenance

**Project-local `research/`:** every folder should have a `README.md` indexing items. Update after every capture.

**Centralized collections:** the collection's `README.md` is scope + pointer. You don't need to index every item (the inbox/items/<topic>/ structure + grep is enough), but keep it current with what topics exist and any landscape docs.

Format (bullet points, grouped by category):

```markdown
# Research

### Official / Canonical

- **[anthropics-skills](https://github.com/anthropics/skills)** — 17 official skills. Canonical structure.

### Biomedical

- **[ClawBio](https://github.com/ClawBio/ClawBio)** — 24 bioinformatics skills.
```

Include scale/count when notable ("240+ skills", "56 finance skills", "145 papers").

**When to update:**
- After cloning a repo → add to index
- After capturing a note (project-local) → add to index
- After writing a deep dive → add to index

## Related

- **Collections umbrella:** `__resources/collections/CLAUDE.md` — conventions for all collectors
- **Collections meta-design:** `~/Desktop/Projects/_workshop/meta-research-system/` — the shape discussion (moved here from tf://; local so it's easy to read + work from)
- **Grandfathered flat collector:** `__resources/github-repos/` — 200+ repos, flat model with its own CLAUDE.md
- **Four patterns:** A (collector), B (experiment framework), C1 (frozen deep-dive), C2 (live research), D (app-internal notes). See `_workshop/meta-research-system/README.md`.

## Subskills

- **`/research:collections`** — collection-scoped capture + triage (narrower than base; assumes target is `__resources/collections/<name>/`). Use when the user names a collection or says "triage <collection>".
- **`/research:signalkit`** — interview-based scaffolder for standing up a new signalkit-style deterministic feeder. Produces a `__active/_apps/<name>/` that writes digest picks into a collection's `inbox/<topic>/`.

Base `/proj:research` (this skill) remains the catch-all for ad-hoc captures, deep dives, and project-local `research/` folders.
