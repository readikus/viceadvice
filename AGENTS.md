# AGENTS.md

**Read [`PRODUCT.md`](PRODUCT.md) first.** It is the single source of truth for what Vice Advice is: the gameplay, character, tone, guardrails and decisions. If your change alters any of that, update PRODUCT.md in the same commit.

Then read [`docs/PLAN.md`](docs/PLAN.md) for how it's being built: the streams, who owns which files, and the rules for shared contracts in `src/game/`.

This repo is shared (Ian and Tom both push to `main`). Run `git fetch` before committing, integrate incoming commits first, and never force-push.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
