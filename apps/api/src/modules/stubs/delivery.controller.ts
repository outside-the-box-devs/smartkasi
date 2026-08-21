import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';

const STUB_DELIVERY_ID = 'dd000000-0000-4000-8000-000000000001';

/** STUB — see stubs.module.ts. */
@Controller()
export class DeliveryStubController {
  @Post('orders/:orderId/delivery')
  @HttpCode(202)
  request(@Param('orderId') orderId: string, @Body() _body: unknown) {
    return {
      id: STUB_DELIVERY_ID,
      order_id: orderId,
      status: 'unassigned',
      mode: null,
      eta_band: null,
      courier: null,
      updated_at: new Date().toISOString(),
      _stub: true,
    };
  }

  /**
   * Customer view. Note what is absent: coordinates, route, courier phone.
   * That absence is the design. Do not "improve" this when it becomes real.
   */
  @Get('deliveries/:deliveryId')
  track(@Param('deliveryId') deliveryId: string) {
    return {
      id: deliveryId,
      order_id: '88888888-8888-4888-8888-888888888888',
      status: 'en_route_dropoff',
      mode: 'bicycle',
      eta_band: '10-20min',
      courier: { display_name: 'Thabo M.', mode: 'bicycle', rating_avg: 4.8 },
      updated_at: new Date().toISOString(),
      _stub: true,
    };
  }

  @Get('courier/jobs')
  jobs() {
    const expires = new Date(Date.now() + 5 * 60_000).toISOString();
    return {
      data: [
        {
          delivery_id: STUB_DELIVERY_ID,
          order_number: 'SK-8F3K2P',
          pickup_count: 2,
          total_distance_m: 2100,
          payout_cents: 1500,
          mode: 'bicycle',
          expires_at: expires,
        },
        {
          delivery_id: 'dd000000-0000-4000-8000-000000000002',
          order_number: 'SK-9G4L3Q',
          pickup_count: 1,
          total_distance_m: 850,
          payout_cents: 900,
          mode: 'foot',
          expires_at: expires,
        },
      ],
      _stub: true,
    };
  }

  @Post('courier/jobs/:deliveryId/accept')
  @HttpCode(200)
  accept(@Param('deliveryId') deliveryId: string) {
    return this.courierView(deliveryId, 'assigned');
  }

  @Post('courier/jobs/:deliveryId/collect')
  @HttpCode(200)
  collect(@Param('deliveryId') deliveryId: string, @Body() _body: unknown) {
    return this.courierView(deliveryId, 'collected');
  }

  @Post('courier/jobs/:deliveryId/deliver')
  @HttpCode(200)
  deliver(@Param('deliveryId') deliveryId: string, @Body() _body: unknown) {
    return this.courierView(deliveryId, 'delivered');
  }

  /** Courier-side view. This one DOES carry addresses — never serve it to a customer. */
  private courierView(deliveryId: string, status: string) {
    return {
      id: deliveryId,
      order_id: '88888888-8888-4888-8888-888888888888',
      order_number: 'SK-8F3K2P',
      status,
      mode: 'bicycle',
      payout_cents: 1500,
      cash_to_collect_cents: 19250,
      pickups: [
        {
          sequence: 1,
          shop_id: '7b0e1c2a-1111-4a3b-9c11-aaaaaaaaaaaa',
          shop_name: "Mama Thoko's Tuckshop",
          address_line: '1423 Vilakazi St',
          lat: -26.238,
          lng: 27.9083,
          phone: '+27821234567',
          collected: status !== 'assigned',
          item_count: 3,
        },
      ],
      dropoff: {
        address_line: '77 Mooki St, Orlando East',
        notes: 'Blue gate, next to the tuckshop',
        lat: -26.2461,
        lng: 27.9212,
        customer_first_name: 'Lerato',
        customer_phone: '+27821234571',
      },
      updated_at: new Date().toISOString(),
      _stub: true,
    };
  }
}
