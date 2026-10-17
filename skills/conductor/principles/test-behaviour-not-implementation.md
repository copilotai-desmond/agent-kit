# Test behaviour, not implementation

**When:** Writing a test, or deciding whether to keep one.

**Why:** A test tied to internals breaks on every refactor and passes on real bugs. It protects the code, not the behaviour.

- Test through the public interface. Give inputs, assert outputs and visible effects.
- Name each test for the behaviour it protects, in the domain's words.
- Never assert on private calls, call counts or internal structure when an outcome can be asserted instead.
- Fake only what you do not control, such as the network, the clock or a paid service. Keep your own code real.
- A test that must change when you refactor with no behaviour change is wrong. Rewrite it or delete it.
- A test that cannot fail is noise. Delete it.

**Example.** A test asserts that `save` calls `serialize` twice. Replace it with a test that saves, loads and compares the result.
