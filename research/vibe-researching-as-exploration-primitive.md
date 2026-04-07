# Vibe Researching as an Exploration Primitive

*Deep dive — exploring how "vibe researching" changes the cost structure of exploration, and what that means for fold, autorefine, research, and docs.*

Sparked by: [vibe-researching-llm-assisted-exploration](../vibe-researching-llm-assisted-exploration.md)

## The core insight

The interesting thing about vibe researching isn't "use AI for research." It's that **exploration becomes cheap enough to do speculatively.**

Traditional exploration has high upfront cost: read papers, plan experiments, write code, analyze results. So you filter aggressively before starting. Most ideas die in the "is this worth my time?" phase. You optimize for not wasting effort, which means you optimize for safety, which means you miss the weird stuff.

Vibe researching inverts this. Exploration cost drops to "describe the question, wait 2 minutes, read a summary." So instead of filtering 10 ideas down to 1 and pursuing it carefully, you explore all 10 shallowly and pursue the 2-3 that show signal. **Volume of exploration replaces quality of upfront filtering.**

This is the same shift that happened with:
- Unit tests (cheap to run → run them all, don't guess which ones matter)
- A/B testing (cheap to deploy variants → test everything, don't debate in meetings)
- Prototyping (cheap to build throwaway UI → build 3 versions, don't design the perfect one)

The pattern: when something gets cheap, you stop planning it carefully and start doing it speculatively.

## What this means for what we're building

### 1. The missing phase in fold: pre-autorefine exploration

Fold currently has three facets:
- **Playtest** (discover) — find bugs and loopholes
- **Mxit** (track) — manage tasks
- **Autorefine** (improve) — iterate toward quality

But autorefine has a cold-start problem: **it needs a rubric.** You need to know what "better" means before you can iterate toward it. And sometimes you don't know yet. You have a vague sense that something should exist, but you can't articulate what good looks like.

Vibe researching is the **pre-autorefine exploration phase**:

```
[vibe] → [signal] → [autorefine] → [done]

vibe:       generate 3-5 variants, no rubric, just "is any of this interesting?"
signal:     human spots something — "that one, go deeper"
autorefine: now you have a rubric (the interesting thing), iterate toward it
```

This suggests fold might actually have four facets, not three:
- **Vibe** (explore) — cheap speculative exploration to find signal
- **Playtest** (discover) — structured testing against what exists
- **Mxit** (track) — task management
- **Autorefine** (improve) — converge on quality

Or maybe vibe is just the first move in autorefine — the negotiation phase where you figure out the rubric. Either way, there's a gap right now between "I have a vague idea" and "I have a rubric to iterate against."

### 2. Research skill with a "vibe mode"

Currently `/research` is capture-oriented. You find something external, you note it. But it could also *explore*:

**Current flow:**
```
user finds tweet → /research captures it → note in research/
```

**Vibe flow:**
```
user has a question → /research explores it → subagents investigate → draft synthesis → user reads → "go deeper on X" or "nah" → iterate
```

Example: "I wonder if there's a common pattern across skill repos for how they handle cross-project state." Instead of manually reading 5 repos, Claude spins up subagents to explore each one, synthesizes findings, drops a draft note. You read it, direct the next round.

This isn't a new skill — it's a mode within the existing research skill. Something like:

```
/research explore "how do large skill collections handle versioning?"
```

Which would:
1. Search the research corpus (cloned repos, notes)
2. Optionally web search for external perspectives
3. Generate a synthesis note in `_workshop/vibes/`
4. Mark it as `exploring` — explicitly unverified, fast exploration
5. Wait for human direction

### 3. Multi-agent exploration bursts

The most powerful version of vibe researching: **parallel divergent exploration.**

You have a question. You launch 3-5 subagents with slightly different framings:

```
Agent 1: "What are the technical constraints of X?"
Agent 2: "What are examples of X done well in the wild?"
Agent 3: "What are the failure modes of X?"
Agent 4: "What would X look like if we pushed it to the extreme?"
Agent 5: "What's the simplest possible version of X?"
```

Each explores independently. You read 5 perspectives and pick the most interesting threads. This isn't consensus-seeking (that's the Hegelian dialectic skill pattern) — it's **divergence-maximizing**. You want different angles, not agreement.

This maps to subagent patterns we already use, but makes the intent explicit: we're not parallelizing for speed, we're parallelizing for *coverage of idea space.*

### 4. Docs-as-exploration

Most docs workflows assume you know the thing and need to write it down. But some of the best documentation emerges from exploration:

> "I think there's an important concept here about how skills compose across projects, but I can't articulate it yet"

Vibe researching for docs:
1. Claude drafts 3 explanations from different angles
2. You read them — one framing clicks, the others don't
3. That framing becomes the seed for real documentation
4. Autorefine polishes it into final form

This is different from autorefine. Autorefine polishes a known shape. Vibe researching **finds the shape.** The distinction matters because they need different rubrics:
- Vibe phase rubric: "Does this make me see the idea more clearly?" (subjective, human-judged)
- Autorefine rubric: "Is this clear, correct, complete?" (measurable, automatable)

### 5. Workshop integration: vibes/ as a formalized space

The `_workshop/` folder is already the right home for exploratory thinking. But we could formalize the vibe pattern:

```
research/_workshop/
├── vibes/                              # Explicitly unverified explorations
│   ├── skill-versioning-patterns.md    # status: exploring
│   ├── cross-project-state.md          # status: signal-found → promoted
│   └── memory-as-context-db.md         # status: abandoned
├── agent-adapter-patterns.md           # Graduated deep dives
└── superpowers-patterns-to-steal.md
```

Each vibe has a lifecycle:
- **`exploring`** — AI-generated, human hasn't verified, may be wrong
- **`signal-found`** — Human spotted something interesting, worth pursuing
- **`promoted`** — Graduated to a real deep dive or fed into autorefine
- **`abandoned`** — Explored, nothing interesting, kept for reference

The key: vibes are **cheap and disposable.** Most should be abandoned. If you're promoting more than 30% of vibes, you're not exploring widely enough.

## Going deeper: where vibe fits in the existing system

### The autorefine cold-start problem is real and specific

Reading the actual autorefine skill, Phase 1 ("Agree on What Better Means") is already doing something vibe-adjacent. The interrogation asks: "What does better feel like to you?" and "How would you know if it got worse?" These are vibes questions. But the skill assumes the user *can* answer them — it just needs to extract the answer.

The gap is when the user genuinely can't answer. Not because they're being vague, but because the shape of the thing doesn't exist yet. You can't describe "better" for something that hasn't been attempted.

Example: "I want a skill that helps agents coordinate across projects." What does "better" mean here? You don't know yet. You haven't seen a single version. You need to see 3 bad attempts before you understand what you actually want. That's the vibe phase — it produces the *input* to autorefine's interrogation.

So the answer to "fourth facet vs. autorefine initialization" is: **it's a Phase 0 for autorefine.** Not a separate fold facet. Here's why:

- Fold's triangle (discover → track → improve) is about an *existing* artifact. You playtest something that exists, track what's wrong, improve it.
- Vibe is about *pre-existence* — you're exploring whether something should exist at all, and what shape it should take.
- Once a vibe produces signal and you commit to building the thing, you're back in fold territory.

So the lifecycle is:

```
[vibe] → "ah, THAT's what I want" → [build v1] → [fold: discover → track → improve] → [done]
         ↑                                                    ↓
         └──── fold discovers the whole approach is wrong ─────┘
```

That feedback loop matters. Sometimes fold discovers that the thing you vibed into existence was the wrong thing entirely. You go back to vibe, explore again, find a different shape. This isn't failure — it's the system working.

### Phase 0 for autorefine: what it would actually look like

Adding to the autorefine skill, before Phase 1:

```
## Phase 0: Find the Shape (optional — skip if you already know what "better" means)

Use when: the user can't describe what they want, or the artifact doesn't exist yet.

1. Ask: "What's the vague idea? Don't worry about being precise."
2. Generate 3 variants — different framings, structures, or approaches
   - Not polished. Rough. The point is to show options, not quality.
   - Each variant should be DIFFERENT, not three versions of the same thing.
3. Show all 3 to the user. Ask: "Which of these is closest to what you're imagining?
   Or is there something in variant A and something in variant C?"
4. User picks a direction (or says "none of these, try again with...")
5. Generate 1-2 more variants in that direction, slightly more refined
6. When the user says "yes, like that" — you now have enough to write a rubric.
   Proceed to Phase 1.

Rules:
- Max 3 rounds of variants. If nothing clicks after 3 rounds, the idea
  needs more thinking. Suggest a deep dive in _workshop/ instead.
- Variants should be FAST and CHEAP. Don't spend 10 minutes crafting each one.
  Rough is the point.
- The user is choosing a DIRECTION, not a final product. They're saying
  "the shape is like this" not "ship this."
```

This is concretely useful. The skill already has the loop machinery — it just needs the "I don't know what I want yet" on-ramp.

### Multi-agent divergent exploration: the framing taxonomy

The power of exploration bursts depends entirely on the framings. Bad framings = 5 versions of the same mediocre answer. The trick is systematic divergence.

Here's a taxonomy of framing angles that maximize coverage:

**The Five Lenses** (general-purpose, works for most questions):

| Lens | Question framing | What it finds |
|------|-----------------|---------------|
| **Constraints** | "What are the hard limits and tradeoffs of X?" | Technical boundaries, things you can't do, physics of the problem |
| **Exemplars** | "Who has done X well? What can we learn?" | Proven patterns, stolen ideas, evidence that X works |
| **Failure modes** | "How does X go wrong? What are the anti-patterns?" | Risks, things to avoid, cautionary tales |
| **Extremes** | "What if we took X to its logical extreme?" | Reveals assumptions, surfaces hidden complexity, finds the interesting edge |
| **Minimum** | "What's the simplest possible version of X?" | Essence of the idea stripped of accidentals, the MVP, the "is this even a thing?" test |

You don't always need all five. Three is usually enough. Pick the ones that feel most uncertain for your question.

**Specialized lenses** (for specific domains):

- **User lens**: "What does X feel like from the user's perspective?" (UX, docs, APIs)
- **Adversarial lens**: "How would someone abuse or break X?" (security, robustness)
- **Historical lens**: "How has X evolved? Why did it end up this way?" (legacy systems, conventions)
- **Economic lens**: "What does X cost, and who pays?" (infrastructure, maintenance burden)
- **Temporal lens**: "How does X behave at 10x scale? In 2 years?" (architecture, data model)

The key insight: **you're not looking for the right answer. You're looking for the right question.** The exploration burst works when one of the framings surfaces a question you hadn't thought to ask.

### How `/research explore` would actually work

Sketching the flow for a vibe mode in the research skill:

```
/research explore "how should skills handle cross-project state?"
```

**Step 1: Decompose.** Turn the question into 3 framing angles (auto-selected from the taxonomy, or let the user pick):
- Constraints: "What are the technical limits of cross-project state in MCP?"
- Exemplars: "Which skill repos in research/ handle cross-project state, and how?"
- Minimum: "What's the simplest possible cross-project state mechanism?"

**Step 2: Parallel explore.** Launch 3 subagents, one per framing. Each agent:
- Searches the research corpus (cloned repos, notes, workshop)
- Optionally web searches for external perspectives
- Writes a 200-400 word synthesis (rough, fast, not polished)
- Returns findings to the main agent

**Step 3: Synthesize.** Main agent reads all 3, writes a combined note:
```markdown
# Vibe: Cross-Project State in Skills

*Status: exploring*
*Generated: 2026-03-16*
*Question: "how should skills handle cross-project state?"*

## Findings

### Constraints angle
[summary from agent 1]

### Exemplar angle
[summary from agent 2]

### Minimum viable angle
[summary from agent 3]

## Emerging signal
[What's interesting across the three angles? Contradictions? Surprises?]

## Next questions
[What should we explore next if this is interesting?]
```

**Step 4: Human checkpoint.** Present the synthesis. User says:
- "Go deeper on the exemplar angle" → another exploration burst, narrower
- "The minimum viable version is interesting, let's build that" → graduate to a real task
- "Nah, not interesting" → mark as abandoned, move on

**Step 5: Lifecycle update.** If signal found, update status. If promoted, move to `_workshop/` as a full deep dive or create a task.

The whole thing should take < 3 minutes. If it takes longer, it's too heavy for a vibe. The point is to be cheap enough that you don't hesitate to run it.

### Docs-as-exploration: the "three angles" pattern

This deserves its own section because it's immediately useful independent of everything else.

When you need to explain something but don't know how to frame it, generate three explanations from different angles and pick the one that clicks:

```
Angle 1: Mechanical — "here's how it works, step by step"
Angle 2: Analogical — "it's like X but for Y"
Angle 3: Motivational — "here's the problem it solves, here's why you care"
```

Most concepts have a natural "home angle" — the framing that makes them click. But you often don't know which one until you see all three. The mechanical explanation might be precise but opaque. The analogy might be vivid but misleading. The motivation might resonate but lack detail.

This maps directly to Diataxis:
- Mechanical → reference/how-to
- Analogical → explanation
- Motivational → tutorial

So vibe researching for docs isn't just "find the right words" — it's "find the right Diataxis type for this concept." Sometimes you think you need a how-to guide but the concept actually needs an explanation first. Generating three angles reveals which type the content wants to be.

### The economics of vibes: why 30% promotion rate matters

If you're promoting more than 30% of vibes, one of two things is happening:
1. You're only exploring ideas you're already pretty sure about → you're not exploring widely enough
2. Your quality threshold is too low → promoted vibes aren't actually good enough to build on

Both are bad. The value of cheap exploration is that you can afford to fail. If you're not failing, you're not reaching far enough.

Conversely, if you're promoting less than 10%, either:
1. The explorations are too rough to evaluate (quality floor problem)
2. You're asking the wrong questions
3. The framing angles aren't diverse enough

The sweet spot: **explore 10 things, 2-3 show signal, 1-2 become real work.** That means ~70% of your exploration time is "wasted" — but it's not waste, it's the cost of discovering the 20% that matters. Same economics as brainstorming, A/B testing, venture investing.

## Open questions

- **Quality floor for vibes** — How rough is too rough? If the AI-generated exploration is mostly noise, reading 5 of them is worse than thinking for 5 minutes yourself. There's a minimum coherence threshold. Hypothesis: 200-400 words per angle, structured with headers, is the floor. Below that it's too vague to evaluate.
- **When to vibe vs. when to plan** — Not everything benefits from speculative exploration. Bug fixes, clear feature specs, known patterns — just do them. Vibe researching is for "I don't know what I don't know" situations. Rule of thumb: if you can write a rubric in 2 minutes, skip vibes and go straight to autorefine.
- **Vibe pollution** — If vibes accumulate without cleanup, the workshop becomes noise. Need aggressive abandonment and periodic culling. Maybe: vibes auto-expire after 2 weeks if not promoted. If you haven't revisited it, it wasn't interesting.
- **Agent quality vs. human thinking** — Sometimes 5 minutes of your own thinking beats 3 AI-generated explorations. The AI is better at breadth (surveying a corpus, finding examples) than depth (genuine insight). Use vibes for breadth, human thinking for depth. They complement, not substitute.
- **Recursive vibes** — Can you vibe about vibing? At some point meta-exploration becomes navel-gazing. Limit: one level of recursion. Vibe about a concrete question, not about the process of vibing.

## Concrete next steps

1. **Try Phase 0 manually** — Next time you or the user hits "I don't know what I want," generate 3 variants before writing a rubric. See if it helps autorefine start faster.
2. **Try `/research explore` manually** — Pick a real question, run 3 subagents with different framings from the taxonomy, see if the output is useful. Good test question: "how should skills handle versioning across hub updates?"
3. **Three-angle docs test** — Next time a doc needs writing, generate mechanical/analogical/motivational versions. See which one clicks and whether it reveals the right Diataxis type.
4. **If any of these work** — Formalize: add Phase 0 to autorefine skill, add explore mode to research skill, document the framing taxonomy as a reference.
5. **If they don't work** — Write up why in the discussion section. The failure mode is itself useful research.
