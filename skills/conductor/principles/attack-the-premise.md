# Attack the premise

**When:** Two fixes have failed on the same assumption.

**Why:** Repeating an approach on a false assumption burns time. The fix is rarely the problem. The belief behind it is.

- After the second failure, stop editing. Write down the assumption both fixes shared.
- Turn it into a claim you can check. Run a command, read the real input, print the actual value.
- Test the claim directly. Do not infer it from the code or from what a delegate reported.
- If the claim is false, discard both fixes and restart from what you observed.
- If the claim holds, name the next assumption down and test that one.
- Never send a third attempt to a delegate or a higher tier with the same premise. Escalation changes who tries, not what is believed.

**Example.** Two patches for a missing field in a response both assumed the server sends it. Capturing one raw response showed the field was dropped by a proxy. Neither patch touched that.
