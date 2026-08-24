import 'package:flutter_test/flutter_test.dart';
import 'package:smartkasi_shared/smartkasi_shared.dart';

void main() {
  test('formats cents as South African rand', () {
    expect(zar(1850), 'R18.50');
  });

  test('keeps customer delivery shape route-free', () {
    final delivery = CustomerDelivery.fromJson({
      'id': 'dd000000-0000-4000-8000-000000000001',
      'order_id': '88888888-8888-4888-8888-888888888888',
      'status': 'en_route_dropoff',
      'mode': 'bicycle',
      'eta_band': '10-20min',
      'courier': {'display_name': 'Thabo M.', 'rating_avg': 4.8},
    });

    expect(delivery.etaBand, '10-20min');
    expect(delivery.courierName, 'Thabo M.');
  });

  test('a courier pickup carries the shop it belongs to', () {
    // collectJob sends this id back as shop_id. Losing it here is how a
    // multi-shop run ends up ticking off the wrong spaza.
    final pickup = CourierPickup.fromJson({
      'sequence': 1,
      'shop_id': '7b0e1c2a-1111-4a3b-9c11-aaaaaaaaaaaa',
      'shop_name': "Mama Thoko's Tuckshop",
      'address_line': '1423 Vilakazi St',
      'collected': false,
      'item_count': 3,
    });

    expect(pickup.shopId, '7b0e1c2a-1111-4a3b-9c11-aaaaaaaaaaaa');
    expect(pickup.collected, isFalse);
  });
}
