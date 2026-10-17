# Encode lessons in structure

**When:** Writing the same rule a second time.

**Why:** A rule that lives in prose depends on someone reading it. A rule built into the structure holds without anyone remembering.

- Notice the repeat. The second time you write a rule into a brief, reply or comment is the signal to stop.
- Prefer enforcement over reminders. A type, a lint rule, a test or a script cannot be skipped.
- If a mechanical check is not possible, put the rule where it is read first. Put it in the playbook step, the brief template or the repo's rules.
- Make the right path the easy path. Provide a shared function or default so the wrong path takes extra effort.
- Fix the shape that let the mistake happen, not only the instance.
- Keep one copy of each rule. Link to it elsewhere.
- Record why the rule exists in one line, so a later edit does not remove it.

**Example.** Three briefs in a row remind a delegate to limit edits to named files. Make the gate a diff check on those files. The reminder is now unnecessary.
