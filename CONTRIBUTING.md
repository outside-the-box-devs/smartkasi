# How we work

Short, and meant to be followed literally. `AGENTS.md` is the contract for the
database and its mirrors; this is the contract for everything around it.

There is no CI. Nothing runs on push and nothing blocks a merge, so every check
below is one a person has to remember to run. Every rule here exists because
something already went wrong without it.

---

## 1. Branch first, always

Never commit to `main`. Never commit to somebody else's feature branch.

```bash
git checkout main && git pull
git checkout -b <type>/<short-kebab-description>
```

`<type>` is `feat`, `fix`, `chore`, or `docs`, matching what is already in the
history (`feat/real-delivery`, `chore/supabase-local-migrations`). The
description is what changed, not the ticket number — `feat/role-claim-hook`,
not `feat/sk-01`.

## 2. Plan before you write, if it is not obvious

For anything larger than a typo: say what you are going to do and why, in the
issue, before writing code. Two of the largest defects on this project
(`#21`, `#22`) were not coding mistakes — they were things everybody believed
were true and nobody checked.

If the plan turns out to be wrong halfway through, say so and change it. A plan
is a way to be wrong cheaply, not a commitment.

## 3. Verify before you claim

**Run the thing.** "It should work" is not a status.

```bash
npm run check-types          # tsc across the workspace
npm run build                # api + web
npm run contract:lint        # the frozen OpenAPI contract

cd apps/api && npm run smoke:auth      # 36+ checks against a running API
cd apps/mobile/packages/smartkasi_shared && flutter analyze && flutter test
```

Two traps in that list:

- **`npm run smoke`, without `:auth`, proves much less than it looks like.** It
  self-signs HS256 tokens with the role hard-coded into them, so the whole class
  of role and auth bugs is invisible to it. It also skips every authenticated
  check when it cannot mint, and still prints a cheerful green summary. Use
  `smoke:auth`.
- **The smoke suite writes to the database it runs against.** It flushes a POS
  batch and places a real order. Demo projects only. To restore:
  `node scripts/sql.mjs -f ../../db/reset.sql && npm run db:users && npm run db:seed`.

## 4. Do not run `npm run lint` expecting a linter

The script is `eslint ... --fix`. It **rewrites your working tree** and still
exits non-zero. Running it casually produces ~60 files of formatting churn on
top of whatever you were actually doing.

To check without changing anything:

```bash
cd apps/api && npx eslint "src/**/*.ts"
```

Making the linter usable needs a standalone formatting commit plus five real
errors fixed — three unsafe enum comparisons, an unused `_dto` in the payments
stub, and unsafe `.user` access in the roles guard. Tracked in `#32`. Do not
mix that formatting into a feature branch.

## 5. Schema changes have a fixed procedure

`db/schema.sql` is the source of truth. The `supabase/` copies are mirrors and
must never be edited alone. The full procedure is `AGENTS.md` §3; the part
people forget:

- Edited `db/schema.sql`? Re-mirror to `supabase/migrations/…init….sql`.
- Edited `db/seed.sql`? **Re-mirror to `supabase/seed.sql` too.** This is the
  one that gets missed.
- Then update the recorded byte sizes and SHA256s in `AGENTS.md`, `CLAUDE.md`,
  `supabase/README.md` and `apps/api/README.md`, and run the `AGENTS.md` §6
  checklist. Those recorded values are the only drift detector there is.
- `db/schema.sql` cannot be re-run against a populated database (`create type`
  has no `IF NOT EXISTS`). Applying to remote means a small idempotent delta in
  `db/patches/`.

Nothing checks any of this. It is entirely on you.

## 6. The contract is frozen to additive changes

`packages/contract/openapi.yaml` is what three Flutter apps and the dashboard
are built against. Adding a path, an optional field, or an enum value is fine.
Changing or removing anything that exists is not — it silently breaks clients
that are not in this repository.

If you genuinely need a breaking change, it is a discussion first, not a pull
request first.

## 7. Some state is not in git

The repository cannot assert everything the running system depends on. When you
change one of these, **write it down in `AGENTS.md` §5** — that section exists
so the next person does not spend an afternoon on it:

- The custom access token hook, registered in
  Dashboard → Authentication → Hooks. Without it, roles silently fall back to
  `customer` and no file in this repo will tell you.
- Railway environment variables. They override the defaults in
  `configuration.ts` — changing a fee constant in code does nothing on its own.
- The Supabase project's auth settings and R2 credentials.

## 8. Commits and pull requests

One logical change per commit. Format:

```
<type>(<scope>): <what changed, imperative>

Why, and what it cost. What you verified, and how. What you deliberately
did not do.

Closes #NN
```

Look at `git log` before writing one — the existing messages are the standard,
and they explain reasoning rather than restating the diff.

Pull requests need: what changed, how you verified it, and what you knowingly
left undone. Say which of the commands in §3 you actually ran — with no CI,
that sentence is the only evidence anyone gets.

## 9. Report what is true

If a check fails, say so and paste it. If you skipped a step, say which. If
something works only under conditions, name them.

The most expensive problems on this project so far have all been the same
shape: documentation that confidently described something that was not
happening. A false green costs more than a red.
