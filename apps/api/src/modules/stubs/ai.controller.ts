import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

class DishRequestDto {
  @IsString() dish: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) servings = 4;
  @IsOptional() @Type(() => Number) lat?: number;
  @IsOptional() @Type(() => Number) lng?: number;
  @IsOptional() @Type(() => Number) radius_m = 2000;
}

/**
 * STUB — returns a fixed pap-and-chakalaka basket regardless of input.
 *
 * The SHAPE is final and worth building against: an ingredient list, each
 * mapped to a catalog product with its cheapest nearby offer, so the response
 * drops straight into POST /orders/quote. Only the values are fake.
 */
@Controller('ai')
export class AiStubController {
  @Post('dish-ingredients')
  @HttpCode(200)
  dish(@Body() dto: DishRequestDto) {
    return {
      dish: dto.dish,
      servings: dto.servings,
      estimated_total_cents: 14750,
      ingredients: [
        {
          name: 'Maize meal',
          quantity: '1kg',
          matched_product: {
            id: '3f0a9d10-aaaa-4c11-9999-111111111111',
            name: 'Iwisa Super Maize Meal',
            unit_size: '5kg',
          },
          best_offer: {
            shop_id: '7b0e1c2a-1111-4a3b-9c11-aaaaaaaaaaaa',
            shop_name: "Mama Thoko's Tuckshop",
            distance_m: 480,
            price_cents: 8500,
          },
        },
        {
          name: 'Chakalaka (tinned)',
          quantity: '2 tins',
          matched_product: {
            id: '3f0a9d10-dddd-4c11-9999-444444444444',
            name: 'Koo Chakalaka Mild',
            unit_size: '410g',
          },
          best_offer: {
            shop_id: '7b0e1c2a-2222-4a3b-9c11-bbbbbbbbbbbb',
            shop_name: 'Bra Sipho Spaza',
            distance_m: 620,
            price_cents: 2199,
          },
        },
      ],
      _stub: true,
    };
  }
}
