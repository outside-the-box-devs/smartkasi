import 'package:dio/dio.dart';

import 'config.dart';
import 'models.dart';

typedef AccessTokenProvider = Future<String?> Function();
typedef TokenRefresh = Future<void> Function();

class SmartKasiApi {
  SmartKasiApi({
    required SmartKasiConfig config,
    required AccessTokenProvider accessTokenProvider,
    required TokenRefresh refreshToken,
  }) : _accessTokenProvider = accessTokenProvider,
       _refreshToken = refreshToken,
       _dio = Dio(
         BaseOptions(
           baseUrl: config.apiBaseUrl.replaceFirst(RegExp(r'/$'), ''),
           connectTimeout: const Duration(seconds: 15),
           receiveTimeout: const Duration(seconds: 25),
           sendTimeout: const Duration(seconds: 25),
           responseType: ResponseType.json,
           headers: const {'Accept': 'application/json'},
           validateStatus: (status) => status != null && status < 500,
         ),
       ),
       _config = config;

  final Dio _dio;
  final SmartKasiConfig _config;
  final AccessTokenProvider _accessTokenProvider;
  final TokenRefresh _refreshToken;

  Future<JsonMap> _send(
    String method,
    String path, {
    Object? body,
    Map<String, Object?> query = const {},
    bool auth = false,
    bool retried = false,
  }) async {
    final headers = <String, Object?>{};
    final token = await _accessTokenProvider();
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    if (auth && token == null && _config.hasMockBearer) {
      headers['Authorization'] = 'Bearer ${_config.mockBearerToken}';
    }

    final cleanQuery = Map<String, Object?>.from(query)
      ..removeWhere((_, value) => value == null || value == '');

    final response = await _dio.request<Object?>(
      path,
      data: body,
      queryParameters: cleanQuery,
      options: Options(method: method, headers: headers),
    );

    final data = response.data is Map
        ? Map<String, dynamic>.from(response.data! as Map)
        : <String, dynamic>{};

    if (response.statusCode != null &&
        response.statusCode! >= 200 &&
        response.statusCode! < 300) {
      return data;
    }

    final error = asMap(data['error']);
    final apiError = ApiException(
      code: text(error['code'], 'HTTP_${response.statusCode}'),
      message: text(error['message'], 'Request failed'),
      statusCode: response.statusCode,
      requestId: optionalText(error['request_id']),
      details: error['details'] is List
          ? List<Object?>.from(error['details'] as List)
          : const [],
    );

    // Supabase owns refresh. The API contract says retry once on TOKEN_EXPIRED.
    if (auth && !retried && apiError.code == 'TOKEN_EXPIRED') {
      await _refreshToken();
      return _send(
        method,
        path,
        body: body,
        query: query,
        auth: auth,
        retried: true,
      );
    }

    throw apiError;
  }

  Future<JsonMap> getJson(
    String path, {
    Map<String, Object?> query = const {},
    bool auth = false,
  }) => _send('GET', path, query: query, auth: auth);

  Future<JsonMap> postJson(
    String path, {
    Object? body,
    Map<String, Object?> query = const {},
    bool auth = false,
  }) => _send('POST', path, body: body, query: query, auth: auth);

  Future<JsonMap> patchJson(String path, {Object? body, bool auth = false}) =>
      _send('PATCH', path, body: body, auth: auth);

  Future<Profile> getMe() async =>
      Profile.fromJson(await getJson('/me', auth: true));

  Future<Profile> updateMe(Map<String, Object?> body) async =>
      Profile.fromJson(await patchJson('/me', body: body, auth: true));

  Future<List<Shop>> listShops({
    String? q,
    double? lat,
    double? lng,
    int radiusM = 2500,
    bool? acceptsOrders,
    bool? openNow,
  }) async {
    final page = Page.fromJson(
      await getJson(
        '/shops',
        query: {
          'q': q,
          'lat': lat,
          'lng': lng,
          'radius_m': radiusM,
          'accepts_orders': acceptsOrders,
          'open_now': openNow,
          'per_page': 50,
        },
      ),
      Shop.fromJson,
    );
    return page.data;
  }

  Future<Shop> getShop(String shopId) async =>
      Shop.fromJson(await getJson('/shops/$shopId'));

  Future<Shop> createShop(Map<String, Object?> body) async =>
      Shop.fromJson(await postJson('/shops', body: body, auth: true));

  Future<Shop> updateShop(String shopId, Map<String, Object?> body) async =>
      Shop.fromJson(await patchJson('/shops/$shopId', body: body, auth: true));

  Future<Shop> submitLicence(String shopId, Map<String, Object?> body) async =>
      Shop.fromJson(
        await postJson('/shops/$shopId/licence', body: body, auth: true),
      );

  Future<List<Product>> listProducts({String? q}) async {
    final page = Page.fromJson(
      await getJson('/products', query: {'q': q, 'per_page': 50}),
      Product.fromJson,
    );
    return page.data;
  }

  Future<Product> createProduct(Map<String, Object?> body) async =>
      Product.fromJson(await postJson('/products', body: body, auth: true));

  Future<BarcodeLookupResult> barcodeLookup(
    String barcode, {
    String? shopId,
  }) async => BarcodeLookupResult.fromJson(
    await getJson('/products/barcode/$barcode', query: {'shop_id': shopId}),
  );

  Future<List<ProductSearchResult>> searchProducts({
    required String q,
    required double lat,
    required double lng,
    int radiusM = 2500,
    String sort = 'price',
  }) async {
    final page = Page.fromJson(
      await getJson(
        '/search/products',
        query: {
          'q': q,
          'lat': lat,
          'lng': lng,
          'radius_m': radiusM,
          'sort': sort,
          'in_stock_only': true,
          'per_page': 30,
        },
      ),
      ProductSearchResult.fromJson,
    );
    return page.data;
  }

  Future<List<InventoryItem>> inventory(
    String shopId, {
    String? q,
    bool lowStock = false,
    bool auth = false,
  }) async {
    final page = Page.fromJson(
      await getJson(
        '/shops/$shopId/inventory',
        query: {'q': q, 'low_stock': lowStock ? true : null, 'per_page': 100},
        auth: auth,
      ),
      InventoryItem.fromJson,
    );
    return page.data;
  }

  Future<List<InventoryItem>> lowStock(String shopId) async {
    final data = await getJson(
      '/shops/$shopId/inventory/low-stock',
      auth: true,
    );
    return asMapList(data['data']).map(InventoryItem.fromJson).toList();
  }

  Future<InventoryItem> addInventory(
    String shopId,
    Map<String, Object?> body,
  ) async => InventoryItem.fromJson(
    await postJson('/shops/$shopId/inventory', body: body, auth: true),
  );

  Future<InventoryItem> updateInventory(
    String shopId,
    String shopProductId,
    Map<String, Object?> body,
  ) async => InventoryItem.fromJson(
    await patchJson(
      '/shops/$shopId/inventory/$shopProductId',
      body: body,
      auth: true,
    ),
  );

  Future<JsonMap> bulkUpsertInventory(
    String shopId,
    List<Map<String, Object?>> items,
  ) => postJson(
    '/shops/$shopId/inventory/bulk-upsert',
    body: {'items': items},
    auth: true,
  );

  Future<JsonMap> createSale(String shopId, Map<String, Object?> sale) =>
      postJson('/shops/$shopId/sales', body: sale, auth: true);

  Future<JsonMap> batchSales(String shopId, List<Map<String, Object?>> sales) =>
      postJson(
        '/shops/$shopId/sales/batch',
        body: {'sales': sales},
        auth: true,
      );

  Future<DailyReport> dailyReport(String shopId, {String? date}) async =>
      DailyReport.fromJson(
        await getJson(
          '/shops/$shopId/reports/daily',
          query: {'date': date},
          auth: true,
        ),
      );

  Future<List<ShopOrderLeg>> shopOrders(String shopId, {String? status}) async {
    final page = Page.fromJson(
      await getJson(
        '/shops/$shopId/orders',
        query: {'status': status, 'per_page': 50},
        auth: true,
      ),
      ShopOrderLeg.fromJson,
    );
    return page.data;
  }

  Future<ShopOrderLeg> acceptLeg(
    String orderId,
    String shopId, {
    List<Map<String, Object?>> fulfilled = const [],
  }) async => ShopOrderLeg.fromJson(
    await postJson(
      '/orders/$orderId/legs/$shopId/accept',
      body: fulfilled.isEmpty ? <String, Object?>{} : {'fulfilled': fulfilled},
      auth: true,
    ),
  );

  Future<ShopOrderLeg> rejectLeg(
    String orderId,
    String shopId, {
    String reason = 'out_of_stock',
    String? note,
  }) async {
    final body = <String, Object?>{'reason': reason};
    if (note != null) body['note'] = note;
    return ShopOrderLeg.fromJson(
      await postJson(
        '/orders/$orderId/legs/$shopId/reject',
        body: body,
        auth: true,
      ),
    );
  }

  Future<ShopOrderLeg> readyLeg(String orderId, String shopId) async =>
      ShopOrderLeg.fromJson(
        await postJson('/orders/$orderId/legs/$shopId/ready', auth: true),
      );

  Future<Quote> quote({
    required String fulfilmentType,
    required List<CartLine> lines,
    double? dropoffLat,
    double? dropoffLng,
  }) async {
    final body = <String, Object?>{
      'fulfilment_type': fulfilmentType,
      'items': [
        for (final line in lines)
          {
            'shop_id': line.offer.shopId,
            'product_id': line.product.id,
            'qty': line.qty,
          },
      ],
    };
    if (dropoffLat != null) body['dropoff_lat'] = dropoffLat;
    if (dropoffLng != null) body['dropoff_lng'] = dropoffLng;

    return Quote.fromJson(
      await postJson('/orders/quote', body: body, auth: true),
    );
  }

  Future<Order> placeOrder({
    required String quoteId,
    String? dropoffAddress,
    String? dropoffNotes,
    String? customerPhone,
  }) async {
    final body = <String, Object?>{'quote_id': quoteId};
    if (dropoffAddress != null && dropoffAddress.isNotEmpty) {
      body['dropoff_address'] = dropoffAddress;
    }
    if (dropoffNotes != null && dropoffNotes.isNotEmpty) {
      body['dropoff_notes'] = dropoffNotes;
    }
    if (customerPhone != null && customerPhone.isNotEmpty) {
      body['customer_phone'] = customerPhone;
    }

    return Order.fromJson(await postJson('/orders', body: body, auth: true));
  }

  Future<List<Order>> orders({String? status}) async {
    final page = Page.fromJson(
      await getJson(
        '/orders',
        query: {'status': status, 'per_page': 30},
        auth: true,
      ),
      Order.fromJson,
    );
    return page.data;
  }

  Future<Order> order(String orderId) async =>
      Order.fromJson(await getJson('/orders/$orderId', auth: true));

  Future<CustomerDelivery> requestDelivery(String orderId) async =>
      CustomerDelivery.fromJson(
        await postJson(
          '/orders/$orderId/delivery',
          body: <String, Object?>{},
          auth: true,
        ),
      );

  Future<CustomerDelivery> trackDelivery(String deliveryId) async =>
      CustomerDelivery.fromJson(
        await getJson('/deliveries/$deliveryId', auth: true),
      );

  Future<List<CourierJob>> courierJobs() async {
    final data = await getJson('/courier/jobs', auth: true);
    return asMapList(data['data']).map(CourierJob.fromJson).toList();
  }

  Future<CourierDelivery> acceptJob(String deliveryId) async =>
      CourierDelivery.fromJson(
        await postJson('/courier/jobs/$deliveryId/accept', auth: true),
      );

  Future<CourierDelivery> collectJob(String deliveryId) async =>
      CourierDelivery.fromJson(
        await postJson(
          '/courier/jobs/$deliveryId/collect',
          body: <String, Object?>{},
          auth: true,
        ),
      );

  Future<CourierDelivery> deliverJob(String deliveryId) async =>
      CourierDelivery.fromJson(
        await postJson(
          '/courier/jobs/$deliveryId/deliver',
          body: <String, Object?>{},
          auth: true,
        ),
      );

  Future<DishBasket> dishIngredients(String dish, {int servings = 4}) async =>
      DishBasket.fromJson(
        await postJson(
          '/ai/dish-ingredients',
          body: {'dish': dish, 'servings': servings},
          auth: true,
        ),
      );
}
