---
status: superseded by ADR 0006
---

# Harnesses without per-spawn model choice get tier agents and a doctor

Some harnesses set a delegate's model only in an agent definition file, and several fall back to the parent's model without saying so. In those harnesses the binding ships one tier agent per tier, and the doctor confirms which model each one actually runs. Degrading to the session model was rejected because delegation would then save context but no cost, and nothing would report it.
