# Conductor references no other skill, not even catalog siblings

Every playbook step is written inline. Conductor never routes to another skill, whether that skill is installed separately or sits beside it in this catalog. This holds even where a better skill exists (tdd, grilling, code review). It keeps conductor installable alone in any harness and behaving the same everywhere. The cost is accepted duplication. A sibling that overlaps a playbook is the sibling's concern, not conductor's.
