import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { ShopsModule } from '../shops/shops.module';

@Module({
  imports: [ShopsModule],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
