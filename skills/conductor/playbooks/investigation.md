### Investigation

**You own the answer.**

The request is read-only. It ends in a cited explanation or a recommendation, never a code change.

1. Restate the question in one line. Separate "how does it work" from "why is it this way" from "which should we pick", because each needs different evidence.
2. For a subsystem too large to read in one pass, spawn explorers over disjoint slices. Each returns pointers (`path:line` with a quote), never conclusions. Resolve every pointer yourself before you rely on it.
3. For "why", read history (blame, commit messages, linked tracker items, decision records) and cite what you read. Where history is silent, say "I'm inferring".
4. Settle facts by running something when you can. A claim you could have observed and did not is a guess.
5. For a choice between options, build a table scoring each option on the criteria that matter out of 7, give an overall /7 that is your judgment rather than an average, and recommend one. Push back if the premise is wrong.
6. Write no code and open no PR. If the answer leads to a change, stop and hand back to the operator, who picks bug-fix or feature.

**Reply:** the answer first, then the evidence as citations, how you know each claim, and the options table with a recommendation when a decision was asked for. Show a diagram when the answer is a flow or a structure. Read [guard-the-context-window](../principles/guard-the-context-window.md) before fanning out.
