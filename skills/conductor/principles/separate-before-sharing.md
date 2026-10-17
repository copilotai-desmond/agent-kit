# Separate before sharing

**When:** Parallel delegates might write the same file, branch or state.

**Why:** Concurrent writes to one target cause races that are intermittent and costly to debug. A rule in a brief is not a lock.

- List what each delegate will write before you spawn any. If two lists overlap, fix that first.
- Split the target so the writes no longer overlap. Give each delegate its own file, directory or key and join the results afterwards.
- Isolate each writer in its own branch and worktree or sandbox. One writer per file, branch and worktree.
- Name the allowed paths in each brief's scope. Make the gate a diff limited to those paths.
- Merge at a single point that you own. Resolve conflicts there, not in the delegates.
- Share a target only when one shared write is a real requirement. Then run its writers one after another.
- Readers may share freely. Only writes need separating.

**Example.** Three delegates each add an entry to one registry file. Have each write its own entry file, then generate the registry from them in one step.
