import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { BarcodeLookupQuery, CreateProductDto, ListProductsQuery } from './dto';
import { CatalogService } from './catalog.service';

@Controller('products')
export class CatalogController {
  constructor(private readonly service: CatalogService) {}

  @Public()
  @Get()
  list(@Query() query: ListProductsQuery) {
    return this.service.list(query);
  }

  @Post()
  async create(
    @Body() dto: CreateProductDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { created, product } = await this.service.create(dto);
    res.status(created ? 201 : 200);
    return product;
  }

  @Public()
  @Get('barcode/:barcode')
  byBarcode(
    @Param('barcode') barcode: string,
    @Query() query: BarcodeLookupQuery,
  ) {
    return this.service.byBarcode(barcode, query.shop_id);
  }

  @Public()
  @Get(':productId')
  get(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.service.get(productId);
  }
}
