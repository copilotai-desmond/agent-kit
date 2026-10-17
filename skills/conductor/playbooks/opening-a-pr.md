### Opening a PR

**You own getting a change in front of reviewers in a state they can judge.** Other playbooks end here. This one is a reference, so read it as a set of rules and apply the ones your change touches.

**Branch.** Work from a branch off current trunk. Run `git fetch` first and branch from `origin/<trunk>`. A branch with unrelated dirty work gets a fresh worktree and the change applied there. isolate any delegate that writes, so two delegates never share a working tree (see [separate-before-sharing](../principles/separate-before-sharing.md)).

**Commits.** Make each commit landable and ordered so the history tells the story. Amend a fix into the commit it belongs to. Make a new commit when the fix is separable. A commit body adds what the subject does not say.

**Size.** Prefer several narrow PRs to one wide one. A stack is a base-branch chain. The root PR targets trunk and each child PR targets its parent's branch.

```
gh pr create --base <parent-branch> --title "<title>" --body-file <body.md>
gh pr edit <pr> --base <new-base>
```

Branch from trunk, not a parent, for work that is independent of the stack.

**Format.** The repo's own PR and commit format wins. Look for a PR template, a contributing guide and recent merged PRs before you write anything. With no format on record, use a Conventional Commits title, `type(scope): subject`, imperative, no trailing period, naming a real symbol when one carries the change.

**Body.** Write a one-minute briefing for a reader who has the diff. Use `##` headings in this order and drop any section with nothing to say.

- `## Why`: the problem and the approach, in one to three short sentences.
- `## What changed`: one to three bullets. Name both sides of a rename.
- `## Scope`: always. What it covers and what it deliberately leaves out.
- `## Tradeoffs`: only when there was a real choice a reviewer would otherwise ask about.
- `## Blast radius`: who or what it touches, and why that is safe or risky.
- `## Verification`: each check you ran and its outcome, quoted from the run.

After the sections, embed visuals that prove a claim. A screenshot of the changed screen and a recording of the flow beat a paragraph. Link long logs. Keep them out of the body.

**Review before ready.** spawn a fresh reviewer on the diff. It must not be the author. Give it the intent, the repo's standards and the diff, and fix what it proves. A PR that changes behaviour also gets a verifier that runs the change on the real surface and reports pass or fail with evidence. See [prove-it-works](../principles/prove-it-works.md). Report a PR ready only after both come back clean.

**Ready, not draft.** Open every PR ready for review. Omit `--draft`. If a PR opened as a draft, run `gh pr ready <pr>`. Run `gh pr view <pr> --json state,isDraft,baseRefName` before you state a PR's status.

**No babysit yet.** Opening a PR does not start [babysit](babysit.md). Post the URL and keep building. Finish the phase or the stack first, then babysit when the operator asks.

**Reply:** the PR as a full URL, what it changes for the people the work is for, how you know it works (what the reviewer and verifier each found, in plain words), and what is left, such as the next PR in the stack.
