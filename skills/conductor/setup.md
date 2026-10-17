# Setup

What `/conductor setup` does. Follow these steps and nothing else.

Writing the operator's instruction file is reversible and is the whole purpose of setup. Proceed without asking. Show the diff in the reply.

1. **Detect the harness.** Find your own harness. Read `bindings/<harness>.md`. With no binding, stop and say conductor has no binding for this harness, so nothing was written.
2. **Write the pointer.** The binding names the user-level instruction file. Build the block below. Then edit the file.
   - Block present between the markers, replace it.
   - Block absent, append it after a blank line.
   - File missing, create it with the block.
   - Touch nothing outside the markers.
   - If the block already matches, change nothing and say so.
3. **Install tier agents.** Only if the binding lists them. Install any that are missing or differ. Skip ones that are already correct. If the binding lists none, say so.
4. **Run the doctor.** Run the binding's doctor recipe. Keep its table.
5. **Reply.** Lead with whether routing works. Then list what was written, what was already correct, and the doctor table. Include the diff of the instruction file. Name every mismatch the doctor found and its likely cause.

## The pointer

Write exactly this block.

```
<!-- conductor:start -->
Conductor governs how you work in every repo.
At the start of any coding task, load the conductor skill and follow its matched playbook.
The repo's own rules win where they conflict.
`/conductor` forces it on. `/conductor setup` re-runs setup.
<!-- conductor:end -->
```

Re-running setup on a correct machine changes no file.
