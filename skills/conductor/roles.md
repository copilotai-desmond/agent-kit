# Roles

Playbooks name roles. This table gives each role its tier. Your binding gives each tier a model.

| Role | Tier | Does | Gate that proves it |
|---|---|---|---|
| orchestrator | session model | Runs the playbook, writes briefs, owns verdicts | None. It is you |
| explorer | bulk-read | Reads files, logs, docs and history. Returns pointers, never conclusions | Every pointer resolves and every quote exists |
| implementer | strong-code | Writes code from a brief that leaves design choices open. Failing test first where the repo has a test harness | Tests and typecheck, then a reviewer |
| editor | mechanical | Applies a brief with nothing left to decide, or runs a command and reports the result | Lint, typecheck, tests, or a diff limited to the named files |
| reviewer | frontier | Reads a diff against the intent and the repo's standards, without running it | None. Judgment |
| verifier | frontier | Runs the change on the real artifact and reports pass or fail with evidence | None. Judgment |

## Tiers

- **frontier**: judgment no command can check. Design, review, verdicts.
- **strong-code**: code across function boundaries from a loose brief.
- **mechanical**: work the brief fully specifies.
- **bulk-read**: reading and condensing.

A role may run on mechanical or bulk-read only behind its gate, and the orchestrator reruns that gate before accepting the result. If a task has no gate, give it to a role on strong-code or above.

## Escalation

Each gate failure moves the same brief one tier up, with the failure pasted in. bulk-read and mechanical go up as the binding lists. strong-code goes to frontier. A failure at frontier, or a second failure on the same premise, comes back to you. Never rerun at the same tier.

## Diversity

A reviewer or verifier never wrote the code it judges, and is never forked. It runs on a different model family from the code's author when the binding offers one. With one family, a fresh delegate at the role's own tier is independent enough.

## The brief

A delegate cannot see this conversation. The brief is all it knows. Write it so a stranger could do the work.

```
GOAL        one sentence: the outcome
SCOPE       paths it may write, paths it may not, its isolated worktree if any
CONTEXT     file pointers and decisions it needs. Paste upstream results in full
ACCEPTANCE  checkable criteria, one per line
GATE        the exact command that proves it, and known traps
REPORT      the shape below
```

Size the brief to the work. A one-command job gets a paragraph that still names goal, scope, gate and report. Omit REPORT when your binding's role agent already carries the report shape. A brief that costs more than the work means do the work yourself.

## The report

Every delegate returns this and nothing else. Raw dumps stay out of your context.

```
STATUS     PASS | ISSUES | BLOCKED
DID        what it changed or read, as paths and commits
EVIDENCE   the gate's command and its result, quoted
FINDINGS   pointers (path:line) with one line each
OPEN       what it could not settle, and why
```

A verifier's STATUS carries its verdict instead: PASS, PASS+NOTES, FAIL or BLOCKED.

A delegate that can prove a problem reports ISSUES and lists every problem it can prove, not only the first.

## Follow-ups

New work goes to a fresh delegate with consolidated scope: the original brief, every later instruction, and the prior report. **continue** a running delegate only when the work needs state that lives in it, such as uncommitted changes or a running server.

## Measuring routing (opt-in)

When the operator asks to measure routing, record one row per delegation: role, tier, model, rough tokens, gate result (passed, escalated, failed). The log's place and exact format are not settled yet. Until they are, keep the rows as a table in a file outside the repo's tree and give its path in the reply.
