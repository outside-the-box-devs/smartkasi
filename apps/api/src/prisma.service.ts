import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const logger = new Logger('PrismaPool');

@Injectable()
export class PrismaService extends PrismaClient {
  /**
   * ConfigService is injected rather than reading process.env directly, and
   * that is load-bearing: it forces Nest to resolve ConfigModule (which loads
   * the .env file) BEFORE this constructor runs. Reading process.env here
   * instead races the dotenv load and fails with "DATABASE_URL is not defined"
   * even when the file is sitting right there.
   */
  constructor(config: ConfigService) {
    const connectionString =
      config.get<string>('databaseUrl') || process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        'DATABASE_URL is not defined. Create apps/api/.env (copy .env.example) ' +
          'and set DATABASE_URL, or export it in your shell.',
      );
    }

    const adapter = new PrismaPg(
      {
        connectionString,
        // Supabase's transaction pooler sits behind a NAT that silently reaps
        // quiet sockets. Without TCP keepalives a pooled client looks perfectly
        // healthy right up until the first query on it fails with "Connection
        // terminated unexpectedly" — which is exactly how this API died once
        // mid-batch.
        keepAlive: true,
        keepAliveInitialDelayMillis: 10_000,
        // Retire our own idle clients well inside the pooler's cutoff rather
        // than waiting to be told the hard way.
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 10_000,
        max: 10,
      },
      {
        // The adapter already attaches a listener for errors raised by an IDLE
        // pooled client and then forwards them here. Leave this unset and they
        // are debug-only, which is how a dropped connection stays invisible
        // until it takes a request down with it.
        onPoolError: (err) =>
          logger.warn(`pooled client dropped: ${err.message}`),
      },
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({ adapter });
  }
}
