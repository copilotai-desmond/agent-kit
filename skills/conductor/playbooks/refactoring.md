### Refactoring

**You own the contract. Structure changes, behaviour does not.**

If cleanup exposes a missing feature or a real bug, split it out. Ship the structural change first against the pinned contract.

1. Pin behaviour before moving any structure. Spawn explorers to map the callers and what the code does today. Then write a characterization test, a snapshot or an equivalence harness that captures it. Typecheck and lint are not a pin. With no coverage, the pin comes first.
2. Name the target shape and the structure the code is missing. Boring code stays when its shape is already clear. If the target crosses a function boundary, sketch 2 or 3 shapes and score each out of 7. Read [data-shape-first](../principles/data-shape-first.md).
3. Subtract before you add, per [subtract-first](../principles/subtract-first.md). Delete dead code, one-caller wrappers and redundant checks. Commit the subtraction alone.
4. Move in small steps, each keeping the pin green and each its own commit. Migrate every caller and delete the old path in the same change. No shims, no parallel old and new paths. Keep a single dependent chain with you. Spawn an editor for mechanical renames, gated by the build, then check strings and prose for missed names.
5. Prove behaviour is unchanged on the real artifact. For a large reshape, diff old output against new, or replay a recorded baseline.
6. Judge reader load. If the diff does not make the code easier to read somewhere, revert it. A cleanup that "might help" is reverted.
7. Spawn a reviewer, then a verifier, neither the author.
8. Run [opening-a-pr](opening-a-pr.md).

**Reply:** the structure that changed, the pin you held it against, the proof behaviour is unchanged, what got easier to read, and what you reverted. No new behaviour.
