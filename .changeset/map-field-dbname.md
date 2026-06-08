---
"prisma-erd-generator": patch
---

Fix field-level `@map` being applied to the wrong field.

- A field whose name is a suffix of another field that has `@map` (e.g. `id` next to `user_id`) could be renamed to the other field's mapped column name, because the mapped value was recovered by substring-matching the raw schema text.
- The mapped name is now read directly from the DMMF (`field.dbName`), the same way the model-level `@@map` is read from `model.dbName`, which removes the substring-collision class of bugs.
