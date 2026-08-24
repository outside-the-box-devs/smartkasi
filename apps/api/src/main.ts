import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

/**
 * Prisma maps Postgres `bigint` to JS BigInt, and JSON.stringify throws on
 * BigInt — which means any response carrying a `_cents` field would 500 with
 * an unhelpful error. Every presenter converts explicitly with Number(), so
 * this is a safety net rather than the mechanism.
 *
 * Number is correct here: all monetary values are ZAR cents, so the ceiling is
 * about R90 trillion before Number.MAX_SAFE_INTEGER is a concern.
 */
(BigInt.prototype as unknown as { toJSON: () => number }).toJSON = function (
  this: bigint,
): number {
  return Number(this);
};

/**
 * An unhandled rejection must not take the whole API down.
 *
 * Node's default — print and exit — is usually right, but the rejections this
 * process actually sees come from Prisma retiring a transaction on a pooled
 * connection Supabase has already closed. That rejection is raised from a
 * timer, so there is nobody left to await it, and it is raised *after* the
 * request that triggered it has already failed and already been answered.
 * Exiting on top of that drops every other in-flight request in order to
 * report an error nobody is waiting for.
 *
 * Seen in the wild: a POS batch flush logged its per-sale failure correctly and
 * returned a 207, and the process then died on the rollback that followed.
 *
 * This is a net, not a licence. It logs at error level with the full stack so
 * these stay loud — if one shows up for any reason other than a dropped
 * connection, fix the cause rather than trusting this to absorb it.
 */
process.on('unhandledRejection', (reason: unknown) => {
  const detail =
    reason instanceof Error ? (reason.stack ?? reason.message) : String(reason);
  Logger.error(detail, 'UnhandledRejection');
});

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  const prefix = process.env.API_PREFIX ?? 'v1';

  app.setGlobalPrefix(prefix);
  app.enableCors({ origin: true, credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  // Serve the hand-written contract, not a generated one. openapi.yaml is the
  // source of truth; if this warns, the contract file moved.
  try {
    const specPath = join(process.cwd(), '..', '..', 'packages', 'contract', 'openapi.yaml');
    const spec = parseYaml(readFileSync(specPath, 'utf8')) as Record<string, unknown>;
    SwaggerModule.setup('docs', app, spec as never, { customSiteTitle: 'SmartKasi API' });
  } catch {
    Logger.warn('packages/contract/openapi.yaml not found — /docs disabled', 'Bootstrap');
  }

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  Logger.log(`SmartKasi API on http://localhost:${port}/${prefix}`, 'Bootstrap');
  Logger.log(`Contract docs on http://localhost:${port}/docs`, 'Bootstrap');
}

void bootstrap();
