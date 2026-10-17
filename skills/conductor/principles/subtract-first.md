# Subtract first

**When:** Scoping a change, or tempted to add a layer, option, flag or abstraction.

**Why:** Every line added is read, tested and maintained by someone. The cheapest code is the code that does not exist.

- Ask what can be deleted before asking what to add. Dead branches, unused options and duplicate paths go first.
- Make the smallest change that solves the stated problem. A smaller diff beats a tidier one.
- Put a decision in one place and pass its result along as a plain flag. Never repeat the same choice in several files.
- Add a layer only when two real callers need it today. A caller you expect next quarter does not count.
- Write for the next reader. Fewer concepts, fewer files to open, names that say what the thing does.
- If a brief to a delegate needs a new abstraction, the design is not done. Settle it yourself before you spawn.

**Example.** A bug needs error handling in three call sites. Adding a wrapper is the reflex. Check first whether two of the three can be deleted, or whether the failing call can be made safe to repeat at its source.
