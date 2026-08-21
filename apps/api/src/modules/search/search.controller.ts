import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { SearchProductsQuery } from './dto';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Public()
  @Get('products')
  products(@Query() query: SearchProductsQuery) {
    return this.service.products(query);
  }
}
