### Feature

**You own the design and the verdict.**

New or changed behaviour, built from a named data shape.

1. Spawn explorers over the affected subsystem. They return pointers to the code, conventions and callers the change touches.
2. Name the data shape first, and the structure that holds it. Prefer a table over branching and a state machine over scattered booleans. Read [data-shape-first](../principles/data-shape-first.md). If the change crosses a function boundary, sketch 2 or 3 shapes, score each out of 7 and pick one. Show a diagram when the shape is a flow.
3. Write the throughput checkpoint as four todo items. A dimension that does not apply keeps its item as `n/a: <reason>`.
   - Blocking first steps. What must land before anything can fan out.
   - Independent workstreams. Disjoint files, services or layers can run in parallel. Shared writes serialize.
   - Shared mutable state. Split the target rather than serialize, unless a real invariant forces it. Read [separate-before-sharing](../principles/separate-before-sharing.md).
   - Smallest safe decomposition. If one owner is best, say why.
4. Delegate by evidence. One dependent chain stays with you. Spawn an implementer per independent workstream, each isolated, with files, the named data shape and acceptance in its brief. Spawn an editor for any exact mechanical edit, behind its gate.
5. Tests first where a harness exists. Build, check and commit one small unit at a time, per [sequence-verifiable-units](../principles/sequence-verifiable-units.md). A skipped test states its reason.
6. Spawn a reviewer on a different model family, since a contested design is where review pays most. Spawn a verifier to run the feature on the real surface. Inconclusive is not a pass.
7. Run [opening-a-pr](opening-a-pr.md).

**Reply:** what you built and what changes for its users, the data shape and why, the throughput checkpoint, the options you scored, and open decisions. Say how you verified.
