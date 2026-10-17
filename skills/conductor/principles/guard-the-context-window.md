# Guard the context window

**When:** A large read, a long output, or work that fans out.

**Why:** A full context degrades reasoning and drops earlier decisions. Raw dumps in your thread cost more than the answer they carry.

Explorer pointers and the report shape are in roles.md. This adds the rest.

- Read the specific lines a pointer names. Do not reopen the whole file.
- Cap command output at the source. Filter, count or tail before it reaches you.
- Split fan-out into bounded pieces, each with its own scope.
- Keep decisions and verdicts in the thread. Keep logs and listings out of it.
- Write long results to a file and cite the path.

**Example.** Finding every caller of a function across a large repo goes to an explorer. It returns twenty `path:line` pointers. You read the five that matter.
