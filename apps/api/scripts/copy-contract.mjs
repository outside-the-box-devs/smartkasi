/**
 * Copy the OpenAPI contract into the build output.
 *
 * `main.ts` serves `/docs` from `packages/contract/openapi.yaml`, which lives
 * outside this app. That is fine locally, where the whole monorepo is on disk,
 * and wrong everywhere else: `apps/api` does not depend on
 * `@smartkasi/contract`, so a workspace-pruning builder (railpack does this)
 * drops `packages/` from the runtime image, and setting a deploy Root Directory
 * of `apps/api` does the same. Either way the read throws, the catch in
 * `main.ts` swallows it, and `/docs` 404s on a healthy API.
 *
 * Copying it next to the compiled entrypoint makes the spec part of the app's
 * own artifact, so `/docs` no longer depends on the build context or the
 * working directory.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, '..', '..', '..', 'packages', 'contract', 'openapi.yaml');
const destination = join(here, '..', 'dist', 'openapi.yaml');

if (!existsSync(source)) {
  console.warn(`[copy-contract] ${source} not found — /docs will be disabled`);
  process.exit(0);
}

mkdirSync(dirname(destination), { recursive: true });
copyFileSync(source, destination);
console.log(`[copy-contract] openapi.yaml -> ${destination}`);
