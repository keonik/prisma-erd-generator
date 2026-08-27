---
'prisma-erd-generator': patch
---

Stop warning about missing Chromium on Apple Silicon

Every generate on a darwin/arm64 machine that rendered an image printed a stack trace followed by:

> Prisma ERD Generator: Unable to find chromium path for you MacOS arm64 machine. Attempting to use the default at undefined.

Three things were wrong with it. The `undefined` was real: the fallback path was assigned to a variable the puppeteer config object had already captured, so it never took effect — and the value it tried to assign was `/usr/bin/chromium-browser`, a Linux path, on macOS. The stack trace came from `console.error` in a `catch` that handles an entirely normal condition. And the check itself dates from when puppeteer shipped no arm64 Chromium; current puppeteer downloads its own, so the common case today is not having a system `chromium` at all, which meant nearly every Apple Silicon user saw this on every run.

A system `chromium` on `PATH` is still preferred when present. Not having one is silent, and puppeteer uses the browser it manages. The ARM64 section of the README, which the message pointed at, has been updated to say the workaround is no longer needed.
