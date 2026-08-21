import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import configuration from './config/configuration';
import { PrismaModule } from './prisma.module';
import { SupabaseAuthGuard } from './common/guards/supabase-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

import { HealthModule } from './modules/health/health.module';
import { MeModule } from './modules/me/me.module';
import { ShopsModule } from './modules/shops/shops.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { SearchModule } from './modules/search/search.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SyncModule } from './modules/sync/sync.module';
import { SalesModule } from './modules/sales/sales.module';
import { OrdersModule } from './modules/orders/orders.module';
import { FlyersModule } from './modules/flyers/flyers.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { StubsModule } from './modules/stubs/stubs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      // Explicit, and in precedence order. `.env.local` is what Supabase's
      // dashboard snippets tell you to create; `.env` is the convention here.
      // Supporting both means neither is a trap.
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    HealthModule,
    MeModule,
    ShopsModule,
    CatalogModule,
    SearchModule,
    InventoryModule,
    SyncModule,
    SalesModule,
    OrdersModule,
    FlyersModule,
    UploadsModule,
    StubsModule,
  ],
  providers: [
    // Auth is ON by default. Opt out per-route with @Public().
    { provide: APP_GUARD, useClass: SupabaseAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
