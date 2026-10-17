# Model names live only in bindings

Playbooks name roles, a role table maps each role to a tier, and only a binding names a model or a tool. Adding a harness or provider is one new binding, with no playbook edits, and retuning a role is one line. The alternative, role lines that name one vendor's model slugs directly, stops working the moment you leave that harness.
