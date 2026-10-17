### Investigation

**You own the answer.**

The request is read-only. It ends in a cited explanation or a recommendation, never a code change.

1. **Restate the question.** Put it in one line. Separate "how does it work" from "why is it this way" from "which should we pick", because each needs different evidence.
2. **Fan out the reading.** When the subsystem is too large to read in one pass, spawn explorers over disjoint slices. Each returns pointers (`path:line` with a quote), never conclusions. Resolve every pointer yourself before you rely on it. Read [guard-the-context-window](../principles/guard-the-context-window.md) before fanning out.
3. **Read the history.** For "why", read blame, commit messages, linked tracker items and decision records, and cite what you read. Where history is silent, say "I'm inferring".
4. **Run it.** Settle facts by running something when you can. A claim you could have observed and did not is a guess.
5. **Score the options.** For a choice between options, score them as SKILL.md "Choices get options" says. Push back if the premise is wrong.
6. **Write no code.** Open no PR. If the answer leads to a change, stop and hand back to the operator, who picks bug-fix or feature.

**Reply:** the evidence as citations and how you know each claim, plus a diagram when the answer is a flow or a structure, in the order and form of SKILL.md "Writing the reply".
