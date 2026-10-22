# session-activity

A Claude Code pane beside the chat that shows what the session is doing. `/activity` opens or closes it.

- **Todo list.** The mod adds a `todos` tool the model writes its plan to. The pane draws its title, progress, current branch health and each item. Agents spawned while an item is in progress sit under that item.
- **Agents.** Each subagent with its model, effort, elapsed time, tool calls and tokens. A row also shows:
  - the `STATUS` verdict its final report ends with
  - a warning when it ran on another model or effort than its agent definition asks for
  - a warning when an agent whose definition forbids editing finished with new changes in the working tree
  - an escalation line when the same description was spawned again after an earlier run ended
- **Servers and scripts.** Background commands with ports, CPU and memory, stop buttons and orphan cleanup.
- **Spend.** Subagent tokens summed per model.

The status line carries the todo progress and the running counts.

## Install

```
/plugin marketplace add wedgey/agent-kit
/plugin install session-activity@agent-kit
```

## Develop

```
claude plugin test plugins/session-activity
claude plugin validate plugins/session-activity
```
