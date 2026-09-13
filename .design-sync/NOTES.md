# design-sync notes — SmartKasi

Repo-specific gotchas for future syncs. Read this before re-running.

## What is being synced, and why it isn't this repo's own code

SmartKasi has **no design system of its own**. `packages/theme` is tokens only
(`tokens.json` + generated `smartkasi.css`/`.ts`/`.dart`), there is no Storybook,
and `apps/web/src/components` holds app screens, not a library. The synced DS is
the third-party **`@astryxdesign/core` 0.4.6** (MIT, Meta Open Source) that
`apps/web` is built on, themed with `@smartkasi/theme`. That pairing is the point:
designs then map 1:1 onto code that compiles in `apps/web`.

## Build facts

- **No `npm ci` was run.** The installed tree already matched the lockfile
  (`npm ls` clean: Astryx 0.4.6, React 19.2.8 deduped at root). Re-check with
  `npm ls @astryxdesign/core react` before deciding to skip it again.
- **The build needs a bigger heap.** ts-morph OOMs at the default ~4GB parsing
  Astryx's 561 `.d.ts` files. Always run:
  `node --max-old-space-size=12288 .ds-sync/package-build.mjs ...`
- `--node-modules ./node_modules` (repo root) — React is hoisted there, and
  `@astryxdesign/core` has no nested `node_modules`.
- No `--entry` needed; the package resolves from root `node_modules`.
- **playwright 1.58.0**, not the repo's 1.62.1. The machine's cached chromium is
  build **1208**, which 1.58.0 pins; 1.62.1 pins 1234 and fails with
  `Executable doesn't exist`. Installed into `.ds-sync/` only — the repo's own
  pin is untouched. Re-verify with
  `node -e "..."` against `node_modules/playwright-core/browsers.json` if the
  cache changes.

## Config traps hit (already fixed in config.json — don't re-discover)

- **`tokensGlob` does nothing without `tokensPkg`.** `copyTokens()` in
  `lib/css.mjs` returns early when `tokensPkg` is unset, so a standalone path
  is silently ignored — `tokens/` came out empty and every card rendered in
  Astryx defaults with no warning. Fixed with
  `tokensPkg: "@smartkasi/theme"` (workspace symlink in `node_modules`) +
  `tokensGlob: "src/*.css"`. `tokensGlob` must be a **string**, not an array.
- **Scope.** The `.d.ts` surface exposes 107 components, not the 158 the CLI
  catalogues nor the 73 scoped — sub-exports (`VStack`, `Heading`, `TableBody`,
  `MobileNavToggle`) appear that the catalogue doesn't list. 111 exclusions in
  `componentSrcMap` narrow it to the **81** synced. Excluded components are
  still inside `_ds_bundle.js` (it is built from the package entry) — they just
  have no card, `.d.ts`, or `.prompt.md`.
- **Docs are generated, not shipped.** Astryx ships no per-component markdown;
  `docs.mjs` redirects to the CLI. `.design-sync/.cache/gen-docs.mjs` pulls
  structured detail from `@astryxdesign/cli/api` (`component(name)`) and writes
  `.design-sync/docs/<Name>.md` with a `category:` frontmatter taken from
  Astryx's own `category` field. Re-run it after an Astryx upgrade.
  26 compound sub-parts come back with no category and are reassigned to their
  family's group by `.design-sync/.cache/fix-cats.mjs`.

## Brand fonts

`tokens.json` names **Outfit** (body + heading) and **JetBrains Mono** (code),
but `apps/web` gets them from `next/font/google`, which only exists at Next build
time — nothing shipped an `@font-face`. Validate did **not** flag this
(`[FONT_MISSING]` stayed silent because each stack has a system fallback), so it
would have shipped silently wrong. Fixed by adding `packages/theme/src/fonts.css`
(a remote Google Fonts `@import`), picked up via `tokensGlob: "src/*.css"`.
Confirmed rendering in the Text preview. **User approved the remote-@import
approach** over vendoring woff2 files.

## Component API traps (these belong in conventions.md too)

- **`StatusDot`'s `label` is aria-only** — it renders no visible text. A bare
  dot is colour-only meaning. Always pair it with an adjacent `<Text>`.
  (`apps/web/src/app/dashboard/orders/page.tsx` does this correctly; the first
  draft of the Table preview did not.)
- **`Text` has no `variant` prop** — it is `type`. Headings are a separate
  `Heading` component with `level`.
- **`Table` column widths** are `proportional(n)` / `pixel(n)` helpers imported
  from `@astryxdesign/core/Table`, never plain numbers.

## Known render warns (triaged as legitimate)

- Review-sheet cells render with large vertical whitespace below short content.
  This is the capture harness giving each cell a tall viewport, not a preview
  defect — judge card presentation from `.review.html` / contact sheets instead.

## Re-sync risks

- **Astryx version bump** invalidates the generated docs and may change the
  `.d.ts` export surface, which would silently widen or narrow the 81-component
  scope. Re-run the docs generator and diff `emitted.txt` against
  `.design-sync/.cache/keep.txt`.
- **`packages/theme/src/fonts.css` is load-bearing** for brand typography and is
  a file this sync added. If someone deletes it as unused, every design silently
  falls back to Segoe UI.
- **Remote fonts** mean previews depend on fonts.googleapis.com at render time.
- Root `package.json` has a **duplicate `packageManager` key**
  (`npm@10.9.4` at line 4, `npm@11.19.0` at line 34) — esbuild warns on every
  build. Harmless to the sync, worth fixing in the repo.

## Remaining work (45 of 81 components) — resume here

This run stopped partway to save tokens/time. State is fully saved — a future
`/design-sync` run resumes without redoing the 35 already pushed.

**35 live** at https://claude.ai/design/p/962b827a-29e0-45e4-bcfa-4d331ff3dac5:
Badge, Text, Table, Center, Divider, Grid, GridSpan, HStack, Stack, VStack,
StackItem, Banner, BottomSheet, BottomSheetSwitcher, Card, ClickableCard,
Collapsible, CollapsibleGroup, EmptyState, FileInput, Heading, Icon, Kbd,
NumberInput, ProgressBar, SegmentedControl, SegmentedControlItem,
SelectableCard, Skeleton, Spinner, StatusDot, TextArea, TextInput, Timestamp,
Toast, Token.

**33 have a draft `.design-sync/previews/<Name>.tsx` already, ungraded** —
written by three Sonnet subagents that were killed mid-run (user asked to stop
for token budget, not because anything was broken). Do NOT assume these are
good OR bad — nobody has read a screenshot of them. Re-run per §4.1-4.3: rebuild
+ capture + actually look at the sheet before grading:
`Button, CommandPalette, CommandPaletteEmpty, CommandPaletteFooter,
CommandPaletteGroup, CommandPaletteInput, CommandPaletteItem,
CommandPaletteList, IconButton, Layout, LayoutContent, LayoutFooter,
LayoutHeader, LayoutPanel, MobileNav, MobileNavToggle, NavIcon, Pagination,
Section, Selector, SelectorOption, SideNav, SideNavCollapseButton,
SideNavHeading, SideNavItem, SideNavSection, Tab, TabList, TabMenu,
TableHeaderCell, Toolbar, Typeahead, TypeaheadItem`

**12 have no preview file at all yet** — nobody started these:
`AppShell, Item, List, ListItem, MetadataList, MetadataListItem, TableBody,
TableCell, TableFooter, TableHeader, TableRow, Theme`

Known needs flagged before the stop (nobody applied these — check when resuming):
- `AppShell` is wide → will likely need `cfg.overrides.AppShell: {"cardMode":"column"}`.
- Table sub-parts (`TableBody/Cell/Footer/Header/HeaderCell/Row`) compose via
  Table's **children mode** (see `.design-sync/docs/Table.md` anatomy), not
  data-driven mode — that's the only way they render meaningfully.
- Command palette family and `BottomSheet`/`MobileNav` are overlays — likely
  need a controlled open-state prop forced on, plus
  `{"cardMode":"single","viewport":"WxH"}`. Not yet verified against the actual
  `.d.ts` — check each doc before assuming the prop name.
- `Toast` may only have an imperative trigger API rather than a plain render —
  check `.design-sync/docs/Toast.md` before assuming a JSX composition works.

**To resume:** re-run `/design-sync` (or invoke the skill again) — it will read
this file and `.design-sync/config.json` (already pinned to this project),
find the 33 drafts + 12 untouched components, and pick up from here. All
config traps (tokens, fonts, heap size, playwright version, scope exclusions)
are already fixed and documented above — don't rediscover them.
