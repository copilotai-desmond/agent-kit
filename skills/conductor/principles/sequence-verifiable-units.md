# Sequence verifiable units

**When:** Work has several steps, or touches more than one place.

**Why:** A big change checked once at the end hides which step broke it. Small units that each end in a check fail where they happen.

- Cut the work into units that each change one thing and can be checked alone.
- Give every unit a gate before you start it. A test, a typecheck, a diff limit or an exit code.
- Order units so each builds on a checked one. Put the riskiest or least certain unit first.
- Finish and check a unit before starting the next. Never stack unchecked work.
- Commit at each passing unit so a failure rolls back one step.
- When a unit fails its gate, fix that unit. Do not carry the failure forward.
- Delegate a unit only if it has a gate that proves it and a scope another delegate does not write. See [separate-before-sharing](separate-before-sharing.md).

**Example.** A rename across forty files becomes three units. Split the callers into three groups of about fifteen files. Each unit renames the definition and one group, and the typecheck must pass before the next. The last unit deletes the old name, so one PR ends with no old name left.
