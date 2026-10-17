# Prove it works

**When:** Before you say a piece of work is done.

**Why:** Passing checks prove the checks pass. Only the real artifact proves the change works.

- Name the artifact its users will use. That may be a running app, a built package, a command's output or a rendered page.
- Run that artifact and watch the changed behaviour happen. A unit test, a typecheck or a green build is a proxy.
- Check the failure path as well as the success path. Show the error case behaving.
- Give the verifier the run to do. Do not accept a delegate's "done" as evidence.
- Quote what you ran and what you saw in the reply. Say plainly what you could not run and why.
- If proof needs something you cannot reach, report the gap. Never claim the result you expect.

**Example.** A fix to a CLI flag passes its tests. Run the built binary with the flag, with a bad value, and with none. Report all three outputs.
