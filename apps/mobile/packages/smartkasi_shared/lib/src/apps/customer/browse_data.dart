part of '../customer_app.dart';

const _browseDiscoveryTerms = [
  'bread',
  'milk',
  'maize',
  'rice',
  'sugar',
  'oil',
  'soap',
  'eggs',
  'chips',
  'joko',
  'coca',
  'pilchards',
];

Future<List<ProductSearchResult>> _loadNearbyBrowseItems({
  required SmartKasiApi api,
  required SmartKasiConfig config,
}) async {
  final random = math.Random(DateTime.now().millisecondsSinceEpoch);
  final terms = [..._browseDiscoveryTerms]..shuffle(random);
  final responses = await Future.wait<List<ProductSearchResult>>(
    terms.take(8).map((term) async {
      try {
        final results = await api.searchProducts(
          q: term,
          lat: config.defaultLat,
          lng: config.defaultLng,
          radiusM: 3500,
        );
        return _normalizeProductResults(results);
      } catch (_) {
        return <ProductSearchResult>[];
      }
    }),
  );

  final byProductId = <String, ProductSearchResult>{};
  for (final result in responses.expand((results) => results)) {
    if (result.offers.isEmpty) continue;
    byProductId.putIfAbsent(result.product.id, () => result);
  }

  final shuffled = byProductId.values.toList()..shuffle(random);
  final selected = <ProductSearchResult>[];
  final selectedIds = <String>{};
  final primaryShopIds = <String>{};

  for (final result in shuffled) {
    final primaryShopId = result.offers.first.shopId;
    if (primaryShopIds.add(primaryShopId)) {
      selected.add(result);
      selectedIds.add(result.product.id);
    }
    if (selected.length >= 12) return selected;
  }

  for (final result in shuffled) {
    if (selectedIds.add(result.product.id)) selected.add(result);
    if (selected.length >= 12) return selected;
  }

  return selected;
}

List<ProductSearchResult> _normalizeProductResults(
  List<ProductSearchResult> results,
) {
  final normalized = <ProductSearchResult>[];
  for (final result in results) {
    final offers = _rankedStockedOffers(result);
    if (offers.isEmpty) continue;
    normalized.add(
      ProductSearchResult(
        product: result.product,
        priceStats: result.priceStats,
        offers: offers,
      ),
    );
  }
  return normalized;
}

List<ProductOffer> _rankedStockedOffers(ProductSearchResult result) {
  final offers =
      result.offers
          .where((offer) => offer.acceptsOrders && offer.stockQty > 0)
          .toList()
        ..sort((a, b) {
          final distance = (a.distanceM ?? 1 << 30).compareTo(
            b.distanceM ?? 1 << 30,
          );
          if (distance != 0) return distance;
          return a.priceCents.compareTo(b.priceCents);
        });
  return offers;
}

List<Shop> _applyShopControls(
  List<Shop> shops,
  _ShopSortOption sort,
  _ShopFilterOption filter,
) {
  final filtered = shops.where((shop) {
    return switch (filter) {
      _ShopFilterOption.all => true,
      _ShopFilterOption.openNow => shop.isOpenNow,
      _ShopFilterOption.delivers => shop.acceptsDelivery,
    };
  }).toList();

  filtered.sort((a, b) {
    return switch (sort) {
      _ShopSortOption.nearest => _compareNullableDistance(
        a.distanceM,
        b.distanceM,
      ),
      _ShopSortOption.openFirst => _compareBoolFirst(a.isOpenNow, b.isOpenNow),
      _ShopSortOption.name => a.name.toLowerCase().compareTo(
        b.name.toLowerCase(),
      ),
    };
  });

  if (sort == _ShopSortOption.openFirst) {
    filtered.sort((a, b) {
      final open = _compareBoolFirst(a.isOpenNow, b.isOpenNow);
      if (open != 0) return open;
      return _compareNullableDistance(a.distanceM, b.distanceM);
    });
  }

  return filtered;
}

List<ProductSearchResult> _applyItemControls(
  List<ProductSearchResult> results,
  _ItemSortOption sort,
  _ItemFilterOption filter,
) {
  final filtered = results.where((result) {
    return switch (filter) {
      _ItemFilterOption.all => true,
      _ItemFilterOption.verified => result.product.isVerified,
      _ItemFilterOption.multiOffer => result.offers.length > 1,
    };
  }).toList();

  filtered.sort((a, b) {
    return switch (sort) {
      _ItemSortOption.recommended => _compareItemRecommended(a, b),
      _ItemSortOption.priceLow => _lowestOfferPrice(
        a,
      ).compareTo(_lowestOfferPrice(b)),
      _ItemSortOption.nearest => _compareNullableDistance(
        _nearestOfferDistance(a),
        _nearestOfferDistance(b),
      ),
      _ItemSortOption.name => a.product.name.toLowerCase().compareTo(
        b.product.name.toLowerCase(),
      ),
    };
  });

  return filtered;
}

int _compareItemRecommended(ProductSearchResult a, ProductSearchResult b) {
  final distance = _compareNullableDistance(
    _nearestOfferDistance(a),
    _nearestOfferDistance(b),
  );
  if (distance != 0) return distance;
  return _lowestOfferPrice(a).compareTo(_lowestOfferPrice(b));
}

int _compareNullableDistance(int? a, int? b) =>
    (a ?? 1 << 30).compareTo(b ?? 1 << 30);

int _compareBoolFirst(bool a, bool b) {
  if (a == b) return 0;
  return a ? -1 : 1;
}

int _lowestOfferPrice(ProductSearchResult result) {
  if (result.offers.isEmpty) return 1 << 30;
  return result.offers.map((offer) => offer.priceCents).reduce(math.min);
}

int? _nearestOfferDistance(ProductSearchResult result) {
  final distances = result.offers
      .map((offer) => offer.distanceM)
      .whereType<int>()
      .toList();
  if (distances.isEmpty) return null;
  return distances.reduce(math.min);
}

int _totalOfferStock(ProductSearchResult result) =>
    result.offers.fold(0, (total, offer) => total + offer.stockQty);
