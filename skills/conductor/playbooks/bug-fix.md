### Bug fix

**You own the diagnosis and the proof.**

Every shipped line traces to runtime evidence. A change that "might help" is a hypothesis, not a fix, and it does not ship. When evidence refutes a hypothesis, revert what it motivated.

1. Reproduce it yourself on the real surface the user hits, whether that is the running app, the CLI or the endpoint. Do this before anything else. Ask the operator only when you can name why that surface is unreachable, and only after driving it as far as it goes. If it will not fire, tighten the conditions or instrument until it does.
2. Find the cause by elimination. List candidate causes, then take the check that rules out the most, get runtime evidence, and repeat. Spawn explorers to read the affected code and its history, and have them return pointers. Add logging when state is unclear. Confirm the surviving mechanism by observation. Read [fix-root-causes](../principles/fix-root-causes.md), and when two fixes have failed on one assumption read [attack-the-premise](../principles/attack-the-premise.md).
3. Where a test harness exists, write the failing test first and commit it alone. Skip it only with a stated reason, such as a test that needs infrastructure the repo lacks.
4. Plan the smallest fix the evidence justifies. If it crosses a function boundary, sketch 2 or 3 shapes, score each out of 7 and take the best. A single dependent chain stays with you. Spawn an implementer only for independent slices.
5. Commit the fix on top of the failing test. The test now passes.
6. Spawn a verifier, never the author, to rerun the original reproduction on the same surface. Inconclusive or a different surface is not a pass. Unit tests show branch behaviour, not that the bug is gone.
7. Run [opening-a-pr](opening-a-pr.md).

**Reply:** what was broken in plain words, the root cause, the fix, and how you know it is fixed. Paste the failing-then-passing reproduction output verbatim.
