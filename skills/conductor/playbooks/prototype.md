### Prototype

**You own the decision, not the code.**

The prototype is a throwaway instrument. The real build follows the feature playbook. Speed beats polish here, and no tests or abstractions are wanted. The rigor goes into choosing well, cheaply.

1. **State the decision.** Name what the prototype exists to settle, such as a layout, an interaction, a density, or for an empirical question a behaviour or timing. No decision means no prototype, so use the feature playbook.
2. **Settle by observation.** Prefer a run to asking the operator. Ask only for a preference no run can answer.
3. **Build the variants.** Work in an isolated scratch directory away from production source. For a visual question use the lightest stack that renders it. For a behaviour or timing question use the smallest script that exercises it. Spawn implementers to build variants in parallel, each isolated. Propose variants nobody asked for.
4. **Put them behind one switcher.** Label each variant so they compare side by side.
5. **Observe each variant.** For visuals, show a screenshot of each and drive the interaction. For behaviour or timing, log, print or time the thing you are deciding. The observation is the test.
6. **Recommend one.** Score the variants as SKILL.md "Choices get options" says. Hand the chosen direction to the feature playbook for the real build. Do not open a PR for scratch code.

**Reply:** the evidence for each variant (screenshots or observed output), the scratch path, and a plain statement that the prototype is throwaway, in the order and form of SKILL.md "Writing the reply".
