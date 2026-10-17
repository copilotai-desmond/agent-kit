### Bug fix

**You own the diagnosis and the proof.**

Every shipped line traces to runtime evidence. A change that "might help" is a hypothesis, not a fix, and it does not ship. When evidence refutes a hypothesis, revert what it motivated.

1. **Reproduce it.** Do this yourself, on the real surface the user hits, whether that is the running app, the CLI or the endpoint. Do it before anything else. Ask the operator only when you can name why that surface is unreachable, and only after driving it as far as it goes. If it will not fire, tighten the conditions or instrument until it does.
2. **Find the cause.** Work by elimination. List candidate causes, then take the check that rules out the most, get runtime evidence, and repeat. When the affected code is too large to read in one pass, spawn explorers over it and its history and have them return pointers. Add logging when state is unclear. Confirm the surviving mechanism by observation. Read [fix-root-causes](../principles/fix-root-causes.md), and when two fixes have failed on one assumption read [attack-the-premise](../principles/attack-the-premise.md).
3. **Write the failing test.** Where a test harness exists, write it first. Run it and keep its failing output for the reply. Commit the test with the fix. Skip it only with a stated reason, such as a test that needs infrastructure the repo lacks.
4. **Plan the smallest fix.** Plan the smallest fix the evidence justifies. If it crosses a function boundary, sketch 2 or 3 shapes and score them as SKILL.md "Choices get options" says. A single dependent chain stays with you. Spawn an implementer only for independent slices.
5. **Commit the fix.** Commit it together with the test. The test now passes.
6. **Rerun the original repro.** Spawn a verifier, never the author, to rerun the original reproduction on the same surface. Inconclusive or a different surface is not a pass. Unit tests show branch behaviour, not that the bug is gone.
7. **Open the PR.** Run [opening-a-pr](opening-a-pr.md). The verifier from step 6 counts there while the head is unchanged.

**Reply:** what was broken in plain words, the root cause, the fix, and the failing-then-passing reproduction output pasted verbatim, in the order and form of SKILL.md "Writing the reply".
