# Binding: Claude Code, setup

Read only during `/conductor setup`.

## Setup data

- The user-level instruction file is `~/.claude/CLAUDE.md`. Create it if missing.
- The skill is discoverable from any repo when `SKILL.md` exists at `~/.claude/skills/conductor/` or `~/.agents/skills/conductor/`.
- Install every file in `claude-code-agents/` to `~/.claude/agents/`. A file that already matches stays. A file that differs is replaced. Leave every other file in that folder alone. A new session is needed before the harness sees a newly installed agent.

## Doctor

Spawn each role agent once with no `model` or `effort`, so each runs on its own defaults. Add one `conductor-editor` probe with `model: sonnet` and `effort: medium` to prove escalation overrides the defaults. Spawn them all in one message. If a role agent is not found yet because it was just installed, say a new session is needed and run the doctor there. Use this brief.

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

| Role agent | Tier | Requested | Ran | Effort | Match | Advisor calls |
|---|---|---|---|---|---|---|
