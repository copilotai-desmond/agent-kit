# Queue heavy checks

**When:** Running tests, builds, typechecks or e2e, or spawning delegates that do.

**Why:** Every repo and session on the box shares its cores and memory. A heavy check that skips the queue slows everyone, and a session parked on a full queue does nothing.

- Run heavy checks through the box queue, as `node <queue> run --queue=<tests|e2e> -- bash -c '<command>'`, where `<queue>` is `tools/queue.mjs` in this skill's folder, and **background** them. Use the repo's own wrapper if it has one. Where the session approves commands without asking, the harness's package queues a heavy command in place. Elsewhere it refuses an unqueued one and names the queued form to run.
- Wait for the completion notice. Never sleep-poll.
- A foreground heavy command on a full queue is refused, with the holders named. Rerun it in the background.
- A second run of the same command from the same folder is refused while the first runs or waits. Wait for the first one's notice instead.
- A second slot starts only when the box has `CONDUCTOR_QUEUE_MIN_FREE_MB` of memory free, 4096 by default. Slot 0 always starts.
- Leave out `--slots`. The hook and the queue both read the slot count from `CONDUCTOR_QUEUE_SLOTS_<QUEUE>` for the box.
- Never queue a watch mode. It never exits, so it would hold its slot forever.
- Never wrap a queued command in another lock. Holding one while waiting for the other deadlocks the sessions waiting on both.
- Before you spawn delegates that verify, count the queue's slots. They are `CONDUCTOR_QUEUE_SLOTS_<QUEUE>`, or 1 when it is unset. `queue.mjs status` shows nothing on a fresh box. Run no more of them at once than that.
- `queue.mjs status` shows each run's place, CPU and memory. `queue.mjs stop <queue> <slot>` and `queue.mjs move <waiter> top|up|down` are the operator's. Stop or move another session's run only when the operator asks.

The package's shell hook is the one place this is decided. It also denies a wait loop. A repo with its own queue marks itself managed, as the binding's setup file says, and the hook then only checks for wait loops.

**A repo names its own heavy commands** in `.conductor/queue.json` at its top folder, the one that holds `.git`. The hook reads it on each Bash call, so an edit applies at once. Nothing in this skill changes.

```json
{
  "heavy": { "tests": ["pnpm verify", "pnpm checks"], "e2e": ["pnpm e2e:video"] },
  "light": ["pnpm build:docs"]
}
```

- `heavy` maps a queue name to the commands that go in it. `light` lists commands that never queue, even when a built-in rule would queue them.
- An entry matches by whole words from the start of the command, after the hook drops env assignments and wrappers such as `timeout`, `nice` and `time`. So `pnpm verify` matches `timeout 1800 pnpm verify --all`, and it does not match `pnpm verify:risky`.
- Within one file, `light` wins. A command no entry names keeps the built-in rules. Help flags and watch modes never queue, whatever the file says.
- `CONDUCTOR_QUEUE_CONFIG` names a box-wide file with the same shape. The repo's file wins over it.
- A file that is not valid JSON or has the wrong shape is skipped with one warning, and the built-in rules apply. It never blocks a command.

**Example.** Three verifiers want the e2e suite and the queue has one slot. Spawn one, background its run, and spawn the next when its notice arrives.
