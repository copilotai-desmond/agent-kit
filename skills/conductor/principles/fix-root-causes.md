# Fix root causes

**When:** Debugging a defect.

**Why:** A patch at the symptom hides the defect and lets it return somewhere else.

- Reproduce first. A defect you cannot trigger on demand is not yet understood.
- Trace backwards from the failure to the first point where state became wrong. Fix there.
- Ask why that point allowed the bad state. If the answer is a missing check, add it at the boundary where bad data enters.
- Do not wrap a failing call in a guard or a default to quiet it.
- Write the failing test before the fix. It must fail for the reason you named and pass after.
- Search for the same mistake elsewhere. Report siblings you found and whether you fixed them.
- If the real cause is out of scope, say so in the reply. Do not ship a symptom patch as if it were the fix.

**Example.** A crash on a null name is silenced with `?? ""`. The import that let a null through still runs, and the next consumer breaks. Reject the null at the import.
