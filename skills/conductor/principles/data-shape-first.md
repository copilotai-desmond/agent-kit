# Data shape first

**When:** Before writing logic for a feature, a fix with branching, or a rewrite.

**Why:** Logic follows the shape of the data. A wrong shape forces special cases into every function that touches it.

- Name the data first. List the entities, what identifies each, and which fields can change together.
- Choose the structure that makes illegal states impossible to build. A tagged union beats a record of optional fields.
- Use the domain's own words for names. If the operator calls it a release, the type is a release.
- When the code fights the shape, redesign the shape. Ask what you would build if nothing existed yet, then compare it to the patch.
- Write the shape down before you spawn an implementer. Put it in the brief as the context it must not change.
- Let the shape drive the tests. If a state cannot be built, it needs no test.

**Example.** A feature adds `isDraft` and `isArchived` booleans. Together they allow four states and only three are real. One `state` field with three cases removes the fourth and every check that guarded it.
