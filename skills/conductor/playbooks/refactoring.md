### Refactoring

**You own the contract. Structure changes, behaviour does not.**

If cleanup exposes a missing feature or a real bug, split it out. Ship the structural change first against the pinned contract.

1. **Pin behaviour.** Do this before moving any structure. When the code is too large to read in one pass, spawn explorers to map the callers and what it does today. Then write a characterization test, a snapshot or an equivalence harness that captures it. Typecheck and lint are not a pin. With no coverage, the pin comes first.
2. **Name the target shape.** Name the structure the code is missing. Boring code stays when its shape is already clear. If the target crosses a function boundary, sketch 2 or 3 shapes and score them as SKILL.md "Choices get options" says. Read [data-shape-first](../principles/data-shape-first.md).
3. **Subtract first.** Follow [subtract-first](../principles/subtract-first.md). Delete dead code, one-caller wrappers and redundant checks. Commit the subtraction alone.
4. **Move in small steps.** Each step keeps the pin green and is its own commit. Migrate every caller and delete the old path in the same change. No shims, no parallel old and new paths. Keep a single dependent chain with you. Spawn an editor for mechanical renames, gated by the build, then check strings and prose for missed names.
5. **Prove nothing changed.** Check behaviour on the real artifact. For a large reshape, diff old output against new, or replay a recorded baseline.
6. **Judge reader load.** If the diff does not make the code easier to read somewhere, revert it. A cleanup that "might help" is reverted.
7. **Check the proof.** Spawn a verifier, never the author, to rerun the equivalence proof from step 5 independently.
8. **Open the PR.** Run [opening-a-pr](opening-a-pr.md). The verifier from step 7 counts there while the head is unchanged.

**Reply:** the structure that changed, the pin you held it against, the proof behaviour is unchanged, what got easier to read, and what you reverted, in the order and form of SKILL.md "Writing the reply". No new behaviour.
