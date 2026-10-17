# Binding: Claude Code

The only file that names models and tools. Read it once per session. During setup, also read `claude-code-setup.md`.

## Tiers

| Tier | Model | Effort | Escalates to |
|---|---|---|---|
| frontier | `opus` | `high` | `fable`, only when the operator asks |
| strong-code | `sonnet` | `medium` | `opus`, effort `high` |
| mechanical | `haiku` | `low` | `sonnet`, effort `medium` |
| bulk-read | `haiku` | `low` | `sonnet`, effort `low` |

The orchestrator runs on the session model.

Claude Code has one model family. Spawn reviewers and verifiers fresh at their own tier.

## Verbs

| Verb | Mechanism | Fallback |
|---|---|---|
| spawn | `Agent` tool with `prompt` (the brief), `description`, `model`, `effort`, `subagent_type` | None. Always available |
| fork | `Agent` with `subagent_type: "fork"`. Inherits the conversation, system prompt, model and prompt cache | If fork is unavailable, spawn with a full brief |
| continue | `SendMessage` to the delegate's id | Spawn fresh with the consolidated scope |
| ask | `AskUserQuestion` with options | In `-p` mode the tool is absent. Ask in plain text, list the options, and stop |
| track | The session's todo or task tool | If none exists, keep the list in the reply and restate it when it changes |
| show | Mermaid in the reply for flows. For a mockup, write a throwaway HTML file and publish it with the `Artifact` tool. Screenshots by path | Without `Artifact`, give the file path |
| isolate | `Agent` with `isolation: "worktree"` | Tell the delegate to `git worktree add` its own path and stay inside it |

## Repo instruction files

Besides `AGENTS.md`, read `CLAUDE.md` and `.claude/skills/` in the repo.

## Spawning by role

Always pass `model` and `effort` from the tier table. A call without them runs on the session model, which defeats routing.

| Role | `subagent_type` | Tier |
|---|---|---|
| explorer | `Explore` | bulk-read |
| implementer | `general-purpose` | strong-code |
| editor | `general-purpose` | mechanical |
| reviewer | `general-purpose` | frontier |
| verifier | `general-purpose` | frontier |

`Explore` cannot write or edit files but can still run shell commands. Its brief says "do not edit or write anything". After it returns, run `git status` and treat any change as a failed gate.

Every delegate that writes while another writes gets `isolation: "worktree"`. Disjoint paths in one tree still share the git index.

Delegates run in the background and notify on completion. Do not poll. Start the independent ones in one message so they run together.

Briefs for mechanical and bulk-read delegates say "do not consult the advisor. If stuck, report BLOCKED."

## Pitfalls

- **The advisor tool.** Every delegate gets a built-in `advisor` tool that runs on `opus`. The delegate's own turns run on the requested model, but each advisor call spends frontier tokens. A UI may show the advisor model and make routing look broken when it is not. Observed on v2.1.302, 2026-10-17.
- **Silent override.** `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` makes every spawn ignore the requested `model` without a message. A per-spawn `model` beats plain `CLAUDE_CODE_SUBAGENT_MODEL`. Per the sub-agents docs, read 2026-10-17.
- **Fork locks the model.** A fork runs on the session model and takes no `model` or `effort`. It saves context, not cost.
- **Effort.** Per-spawn `effort` works on non-fork delegates. `CLAUDE_CODE_EFFORT_LEVEL` overrides it. Observed on v2.1.302, 2026-10-17.
- **Delegates cannot ask the operator.** `AskUserQuestion` is removed from every delegate. A brief must settle every decision, and a delegate that hits a question reports BLOCKED.
- **Fresh cache.** A non-fork delegate starts with an empty prompt cache and no conversation. The brief is all it has.
