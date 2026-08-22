part of '../customer_app.dart';

class _ShopDetailPage extends StatefulWidget {
  const _ShopDetailPage({required this.shop});

  final Shop shop;

  @override
  State<_ShopDetailPage> createState() => _ShopDetailPageState();
}

class _ShopDetailPageState extends State<_ShopDetailPage> {
  Future<Shop>? _shopFuture;
  Future<List<_ShopProductLine>>? _inventoryFuture;
  bool _didLoad = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_didLoad) return;
    _didLoad = true;
    _load();
  }

  void _load() {
    final deps = SmartKasiScope.of(context);
    final api = deps.api;
    _shopFuture = api.getShop(widget.shop.id);
    _inventoryFuture = _loadShopProducts(
      api: api,
      config: deps.config,
      shop: widget.shop,
      auth: deps.auth.isSignedIn,
    );
  }

  Future<void> _refresh() async {
    final deps = SmartKasiScope.of(context);
    final api = deps.api;
    final shop = api.getShop(widget.shop.id);
    final inventory = _loadShopProducts(
      api: api,
      config: deps.config,
      shop: widget.shop,
      auth: deps.auth.isSignedIn,
    );
    setState(() {
      _shopFuture = shop;
      _inventoryFuture = inventory;
    });
    await Future.wait([shop, inventory]);
  }

  @override
  Widget build(BuildContext context) {
    final titleStyle = Theme.of(
      context,
    ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w500);
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        body: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(6, 6, 16, 8),
                child: Row(
                  children: [
                    IconButton(
                      tooltip: 'Back',
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.arrow_back_ios_new),
                    ),
                    Expanded(
                      child: Text(
                        widget.shop.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: titleStyle,
                      ),
                    ),
                    StatusChip(widget.shop.isOpenNow ? 'open' : 'closed'),
                  ],
                ),
              ),
              const _ShopDetailTabs(),
              Expanded(
                child: TabBarView(
                  children: [
                    _ShopProductsTab(
                      future: _inventoryFuture,
                      onRefresh: _refresh,
                    ),
                    _ShopInfoTab(
                      fallbackShop: widget.shop,
                      future: _shopFuture,
                      onRefresh: _refresh,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ShopProductLine {
  const _ShopProductLine({required this.product, required this.offer});

  factory _ShopProductLine.fromInventory(InventoryItem item, Shop shop) =>
      _ShopProductLine(
        product: item.product,
        offer: ProductOffer(
          shopId: shop.id,
          shopName: shop.name,
          priceCents: item.priceCents,
          stockQty: item.stockQty,
          acceptsOrders:
              shop.acceptsOrders && item.isAvailable && item.stockQty > 0,
          distanceM: shop.distanceM,
        ),
      );

  final Product product;
  final ProductOffer offer;
}

Future<List<_ShopProductLine>> _loadShopProducts({
  required SmartKasiApi api,
  required SmartKasiConfig config,
  required Shop shop,
  required bool auth,
}) async {
  try {
    final items = await api.inventory(shop.id, auth: auth);
    return items
        .map((item) => _ShopProductLine.fromInventory(item, shop))
        .toList();
  } on ApiException catch (error) {
    if (error.code != 'UNAUTHENTICATED') rethrow;
  }

  const discoveryTerms = [
    'maize',
    'soap',
    'sunlight',
    'chakalaka',
    'coca',
    'milk',
    'bread',
    'pilchards',
    'joko',
    'chips',
    'sugar',
    'oil',
  ];
  final responses = await Future.wait(
    discoveryTerms.map(
      (term) => api.searchProducts(
        q: term,
        lat: config.defaultLat,
        lng: config.defaultLng,
      ),
    ),
  );
  final byProductId = <String, _ShopProductLine>{};
  for (final result in responses.expand((result) => result)) {
    for (final offer in result.offers.where(
      (offer) => offer.shopId == shop.id,
    )) {
      byProductId[result.product.id] = _ShopProductLine(
        product: result.product,
        offer: offer,
      );
    }
  }
  final lines = byProductId.values.toList()
    ..sort((a, b) => a.product.name.compareTo(b.product.name));
  return lines;
}
