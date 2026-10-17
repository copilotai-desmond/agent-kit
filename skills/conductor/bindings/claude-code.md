# Binding: Claude Code

The only file that names models and tools. Read it once per session.

## Tiers

| Tier | Model | Effort | Escalates to |
|---|---|---|---|
| frontier | `opus` | `high` | `fable`, only when the operator asks |
| strong-code | `sonnet` | `medium` | `opus`, effort `high` |
| mechanical | `haiku` | `low` | `sonnet`, effort `medium` |
| bulk-read | `haiku` | `low` | `sonnet`, effort `low` |

The orchestrator runs on the session model. Never pass `model` for yourself and never switch it.

Claude Code has one model family. For a reviewer or verifier, spawn a fresh delegate on a different tier from the code's author. Do not fork it.

## Verbs

| Verb | Mechanism | Fallback |
|---|---|---|
| spawn | `Agent` tool with `prompt` (the brief), `description`, `model`, `effort`, `subagent_type` | None. Always available |
| fork | `Agent` with `subagent_type: "fork"`. Inherits the conversation, system prompt, model and prompt cache | If fork is unavailable, spawn with a full brief |
| ask | `AskUserQuestion` with options | In `-p` mode the tool is absent. Ask in plain text, list the options, and stop |
| track | The session's todo or task tool | If none exists, keep the list in the reply and restate it when it changes |
| show | Mermaid in the reply for flows. For a mockup, write a throwaway HTML file and publish it with the `Artifact` tool. Screenshots by path | Without `Artifact`, give the file path |
| isolate | `Agent` with `isolation: "worktree"` | Tell the delegate to `git worktree add` its own path and stay inside it |

## Spawning by role

Always pass `model` and `effort` from the tier table. A call without them runs on the session model, which defeats routing.

| Role | `subagent_type` | Tier |
|---|---|---|
| explorer | `Explore` | bulk-read |
| implementer | `general-purpose` | strong-code |
| editor | `general-purpose` | mechanical |
| reviewer | `general-purpose` | frontier |
| verifier | `general-purpose` | frontier |

`Explore` has Write and Edit denied but can still run shell commands. Its brief says "do not edit or write anything". After it returns, run `git status` and treat any change as a failed gate.

Parallel writers get `isolation: "worktree"`, or disjoint paths named in each brief.

Delegates run in the background and notify on completion. Do not poll. Start the independent ones in one message so they run together.

## Pitfalls

- **Silent override.** Since v2.1.251 a per-spawn `model` beats `CLAUDE_CODE_SUBAGENT_MODEL`. Older versions let the variable win. With `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` (v2.1.257 and later), every spawn runs on one model and the requested `model` is ignored without a message. The doctor catches both.
- **Fork locks the model.** A fork runs on the session model and takes no `model` or `effort`. It saves context, not cost.
- **Effort needs a recent version.** Per-spawn `effort` needs v2.1.292 or later. On an older version it is ignored. `CLAUDE_CODE_EFFORT_LEVEL` overrides it on any version. The reply cannot show effort, so read it from `agent-<id>.meta.json` and check `claude --version`.
- **Delegates cannot ask the operator.** `AskUserQuestion` is removed from every subagent. A brief must settle every decision, and a delegate that hits a question reports BLOCKED.
- **Explore ignores the variable.** `CLAUDE_CODE_SUBAGENT_MODEL` alone does not change `Explore`. The per-spawn `model` still applies.
- **The advisor tool.** Every delegate is given a built-in `advisor` tool that runs on `opus`. The delegate's own turns run on the requested model, but each advisor call spends frontier tokens. A UI may show the advisor model and make routing look broken when it is not. Briefs for mechanical and bulk-read delegates say "do not consult the advisor; if stuck, report BLOCKED". Escalation then goes through the one-tier-up rule.
- **Fresh cache.** A non-fork delegate starts with an empty prompt cache and no conversation. The brief is all it has.

## Setup data

- User-level instruction file is `~/.claude/CLAUDE.md`. Create it if missing.
- Tier agents are not needed. Per-spawn `model` and `effort` work, so setup installs none.

## Doctor

For each tier in the table, spawn one tiny delegate with that tier's `model` and `effort`. Use `general-purpose` and this brief.

```
Reply with only the exact model name or ID stated in your system prompt.
```

Compare each reply with the requested model. A reply naming a different model is a silent fallback. Report the tier, the requested model, the reported model, and the likely cause. Check these in order.

1. `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` set, or `CLAUDE_CODE_SUBAGENT_MODEL` set on a Claude Code older than v2.1.251.
2. A managed or admin setting that pins models.
3. The requested model is not available on the account.

Do not trust the UI or the reply alone. Confirm from the delegate's transcript at `~/.claude/projects/<slug>/<session>/subagents/agent-<id>.jsonl`. Its `requestedModel` and `message.model` fields show the model that ran. `agent-<id>.meta.json` beside it records the requested model and effort, so it also settles effort. Count the `advisor` tool calls in each transcript and report them per tier as frontier spend. The opt-in routing measurement counts them the same way.

Read the variables with `printenv`. Never print other environment values.

Output a table.

| Tier | Requested | Reported | Match | Advisor calls |
|---|---|---|---|---|

An alias may come back as a full ID. Count that as a match when the ID is the alias's family and tier.

## Transcripts

Session transcripts live under `~/.claude/projects/<workspace-slug>/`. The slug is the workspace path with `/` replaced by `-`. A future session pickup reads the newest files there.
