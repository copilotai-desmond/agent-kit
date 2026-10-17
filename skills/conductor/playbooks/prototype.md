### Prototype

**You own the decision, not the code.**

The prototype is a throwaway instrument. The real build follows the feature playbook. Speed beats polish here, and no tests or abstractions are wanted. The rigor goes into choosing well, cheaply.

1. State the decision the prototype exists to make, such as a layout, an interaction, a density, or for an empirical question a behaviour or timing. No decision means no prototype, so use the feature playbook.
2. Settle by observation rather than by asking the operator. Ask only for a preference no run can answer.
3. Build in an isolated scratch directory away from production source. For a visual question use the lightest stack that renders it. For a behaviour or timing question use the smallest script that exercises it. Spawn implementers to build variants in parallel, each isolated. Propose variants nobody asked for.
4. Put all variants behind one switcher, each labelled, so they compare side by side.
5. Observe each variant. For visuals, show a screenshot of each and drive the interaction. For behaviour or timing, log, print or time the thing you are deciding. The observation is the test.
6. Recommend one, with the options scored out of 7 and the tradeoffs. Hand the chosen direction to the feature playbook for the real build. Do not open a PR for scratch code.

**Reply:** the recommendation first, then the variants, the evidence for each (screenshots or observed output), the tradeoffs, and the scratch path. Say plainly that the prototype is throwaway.
