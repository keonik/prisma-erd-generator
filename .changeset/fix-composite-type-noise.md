---
"prisma-erd-generator": patch
---

Fix composite types and remove stray debug output.

- Remove a leftover `console.log` that printed the resolved type object to the build console on every generate involving composite types (e.g. MongoDB embedded types).
- Fix composite-type relationship resolution: the lookup never actually compared anything (the comparison was stranded inside a comment), so it always resolved to the first composite type in the schema. It now matches the related type by name, so schemas with multiple composite types render their relationships correctly.
