import { Module } from '@nestjs/common';
import { FlyersController } from './flyers.controller';
import { FlyersService } from './flyers.service';
import { ShopsModule } from '../shops/shops.module';

@Module({ imports: [ShopsModule], controllers: [FlyersController], providers: [FlyersService] })
export class FlyersModule {}
