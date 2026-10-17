# Binding: Claude Code, setup

Read only during `/conductor setup`.

## Setup data

- The user-level instruction file is `~/.claude/CLAUDE.md`. Create it if missing.
- The skill is discoverable from any repo when `SKILL.md` exists at `~/.claude/skills/conductor/` or `~/.agents/skills/conductor/`.
- Tier agents are not needed. Per-spawn `model` and `effort` work, so setup installs none.

## Doctor

Spawn one tiny delegate per tier with that tier's `model` and `effort`, using `general-purpose`. Add one `Explore` probe on the bulk-read tier, since explorers spawn as `Explore`. Spawn them all in one message. Use this brief.

```
Do not edit anything. Do not consult the advisor. Reply with only the exact model name or ID stated in your system prompt.
```

The reply is a claim. Confirm each probe from its files under `~/.claude/projects/<slug>/<session>/subagents/`. The slug is the workspace path with every character that is not a letter or digit replaced by `-`.

- `agent-<id>.meta.json` records the requested `model` and `effort`.
- In `agent-<id>.jsonl`, each assistant line's `message.model` is the model that ran, and its `effort` field is the effort used.
- Count `advisor` tool calls in the `.jsonl`. They are frontier spend.

A model that ran but differs from the request is a silent fallback. An alias that comes back as a full ID of the same family and tier is a match. For a mismatch, check these in order and name the likely cause.

1. `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` or `CLAUDE_CODE_EFFORT_LEVEL` is set. Read only these with `printenv <name>`. Never print other environment values.
2. A managed or admin setting pins models.
3. The requested model is not available on the account.

Output this table.

| Tier | Probe | Requested | Ran | Effort | Match | Advisor calls |
|---|---|---|---|---|---|---|
