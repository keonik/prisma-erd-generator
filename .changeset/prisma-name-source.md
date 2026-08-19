---
'prisma-erd-generator': minor
---

Add `usePrismaNames` generator option to draw schema model/field names instead of `@@map` / `@map` database names (#128)

Also fixes `@@map`ed enums rendering a duplicate empty node: the relationship line referenced the enum's Prisma name while the enum block used its database name.
