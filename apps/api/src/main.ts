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
    SwaggerModule.setup('docs', app, spec as never, {
      customSiteTitle: 'SmartKasi API',
      swaggerOptions: {
        // Keep the pasted token across page reloads. Without this every refresh
        // silently drops it and the next Try-it-out returns 401, which reads
        // like a broken endpoint rather than a cleared header.
        persistAuthorization: true,
        // Collapse the operation list; 40-odd endpoints expanded is unreadable.
        docExpansion: 'list',
        filter: true,
        displayRequestDuration: true,
      },
    });
  } catch {
    Logger.warn('packages/contract/openapi.yaml not found — /docs disabled', 'Bootstrap');
  }

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  Logger.log(`SmartKasi API on http://localhost:${port}/${prefix}`, 'Bootstrap');
  Logger.log(`Contract docs on http://localhost:${port}/docs`, 'Bootstrap');
}

void bootstrap();
