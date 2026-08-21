import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

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

    const adapter = new PrismaPg({ connectionString });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({ adapter });
  }
}
