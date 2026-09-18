/**
 * Copy the OpenAPI contract into the build output.
 *
 * `main.ts` serves `/docs` from `packages/contract/openapi.yaml`, which lives
 * outside this app. That is fine locally, where the whole monorepo is on disk,
 * and wrong in a deploy: `apps/api` does not depend on `@smartkasi/contract`,
 * so a workspace-pruning builder drops `packages/` from the runtime image, and
 * a Railway Root Directory of `apps/api` excludes it from the build context
 * outright. Either way the read throws, the fallback in `main.ts` finds
 * nothing, and `/docs` 404s on a healthy API.
 *
 * Copying the spec next to the compiled entrypoint makes it part of this app's
 * own artifact, so `/docs` stops depending on the working directory.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, '..', '..', '..', 'packages', 'contract', 'openapi.yaml');
const destination = join(here, '..', 'dist', 'openapi.yaml');

// Fail the build rather than ship an API with /docs quietly missing. The
// contract is committed, so the only way it is absent is a build context that
// excludes packages/. This was a warning once, and the result was two green
// builds that deployed an API with no documentation.
if (!existsSync(source)) {
  console.error(`[copy-contract] ${source} not found.`);
  console.error('  packages/contract/ is not in this build context.');
  console.error('  On Railway, clear the service Root Directory so the build');
  console.error('  runs from the repository root.');
  process.exit(1);
}

mkdirSync(dirname(destination), { recursive: true });
copyFileSync(source, destination);
console.log(`[copy-contract] openapi.yaml -> ${destination}`);
