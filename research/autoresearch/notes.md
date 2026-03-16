# Research Notes: karpathy--autoresearch

## Source

- **Repo:** [karpathy/autoresearch](https://github.com/karpathy/autoresearch)

## What it is

Autonomous AI research agent. Modifies train.py, runs 5-minute experiments, keeps or discards changes based on val_bpb, loops forever. Uses `program.md` as a "skill". Inspired the autorefine pattern.

## What to study

- `program.md` as skill/instruction pattern
- Autonomous experiment loop (modify, run, evaluate, keep/discard)
- Self-improving agent architecture
- Minimal scaffolding for autonomous research
