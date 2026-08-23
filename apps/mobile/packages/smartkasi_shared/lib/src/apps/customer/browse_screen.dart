part of '../customer_app.dart';

class _CustomerBrowseScreen extends StatefulWidget {
  const _CustomerBrowseScreen();

  @override
  State<_CustomerBrowseScreen> createState() => _CustomerBrowseScreenState();
}

enum _ShopSortOption { nearest, openFirst, name }

enum _ShopFilterOption { all, openNow, delivers }

enum _ItemSortOption { recommended, priceLow, nearest, name }

enum _ItemFilterOption { all, verified, multiOffer }

class _CustomerBrowseScreenState extends State<_CustomerBrowseScreen> {
  final _search = TextEditingController();
  Future<List<Shop>>? _shops;
  Future<List<ProductSearchResult>>? _results;
  Timer? _searchDebounce;
  bool _didLoadInitialData = false;
  String? _lastProductQuery;
  _ShopSortOption _shopSort = _ShopSortOption.nearest;
  _ShopFilterOption _shopFilter = _ShopFilterOption.all;
  _ItemSortOption _itemSort = _ItemSortOption.recommended;
  _ItemFilterOption _itemFilter = _ItemFilterOption.all;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_didLoadInitialData) return;
    _didLoadInitialData = true;
    _search.addListener(_onSearchChanged);
    _loadShops();
    _loadProducts(notify: false);
  }

  @override
  void dispose() {
    _searchDebounce?.cancel();
    _search.removeListener(_onSearchChanged);
    _search.dispose();
    super.dispose();
  }

  Future<List<Shop>> _shopRequest() {
    final deps = SmartKasiScope.of(context);
    return deps.api.listShops(
      lat: deps.config.defaultLat,
      lng: deps.config.defaultLng,
      acceptsOrders: true,
    );
  }

  Future<List<ProductSearchResult>> _productRequest(String query) {
    final deps = SmartKasiScope.of(context);
    return deps.api
        .searchProducts(
          q: query,
          lat: deps.config.defaultLat,
          lng: deps.config.defaultLng,
        )
        .then(_normalizeProductResults);
  }

  Future<List<ProductSearchResult>> _nearbyItemsRequest() {
    final deps = SmartKasiScope.of(context);
    return _loadNearbyBrowseItems(api: deps.api, config: deps.config);
  }

  void _loadShops() {
    _shops = _shopRequest();
  }

  void _loadProducts({bool notify = true, bool force = false}) {
    final query = _search.text.trim();

    void update() {
      if (query.length < 3) {
        if (!force && _results != null && _lastProductQuery == null) return;
        _results = null;
        _lastProductQuery = null;
        _results = _nearbyItemsRequest();
        return;
      }
      if (!force && _results != null && _lastProductQuery == query) return;
      _lastProductQuery = query;
      _results = _productRequest(query);
    }

    if (notify) {
      setState(update);
    } else {
      update();
    }
  }

  void _onSearchChanged() {
    final query = _search.text.trim();
    _searchDebounce?.cancel();
    setState(() {
      if (query.length < 3) {
        if (_lastProductQuery != null || _results == null) {
          _results = _nearbyItemsRequest();
          _lastProductQuery = null;
        }
      } else if (query != _lastProductQuery) {
        _results = null;
      }
    });
    if (query.length < 3) return;
    _searchDebounce = Timer(const Duration(milliseconds: 750), () {
      if (!mounted) return;
      _loadProducts();
    });
  }

  void _submitSearch() {
    _searchDebounce?.cancel();
    _loadProducts(force: true);
  }

  void _clearSearch() {
    _searchDebounce?.cancel();
    _search.clear();
  }

  Future<void> _refresh() async {
    final query = _search.text.trim();
    final shops = _shopRequest();
    Future<List<ProductSearchResult>>? results;
    setState(() {
      _shops = shops;
      if (query.length >= 3) {
        _lastProductQuery = query;
        results = _productRequest(query);
        _results = results;
      } else {
        _lastProductQuery = null;
        results = _nearbyItemsRequest();
        _results = results;
      }
    });
    await Future.wait([shops, if (results != null) results!]);
  }

  @override
  Widget build(BuildContext context) {
    final deps = SmartKasiScope.of(context);
    final showingSearchResults = _search.text.trim().length >= 3;
    return NestedScrollView(
      headerSliverBuilder: (context, innerBoxIsScrolled) => [
        SliverPersistentHeader(
          pinned: true,
          delegate: _BrowseHeaderDelegate(
            controller: _search,
            onSubmitted: (_) => _submitSearch(),
            onClear: _clearSearch,
            onToggleTheme: deps.theme.toggle,
          ),
        ),
      ],
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: ResponsiveList(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 18),
          children: [
            SectionHeader(
              title: 'Shops nearby',
              trailing: _BrowseControls(
                sortTooltip: 'Sort shops',
                filterTooltip: 'Filter shops',
                sortValue: _shopSort,
                filterValue: _shopFilter,
                sortOptions: const [
                  _MenuOption(
                    value: _ShopSortOption.nearest,
                    label: 'Nearest',
                    icon: CupertinoIcons.location,
                  ),
                  _MenuOption(
                    value: _ShopSortOption.openFirst,
                    label: 'Open first',
                    icon: CupertinoIcons.clock,
                  ),
                  _MenuOption(
                    value: _ShopSortOption.name,
                    label: 'Name',
                    icon: CupertinoIcons.textformat,
                  ),
                ],
                filterOptions: const [
                  _MenuOption(
                    value: _ShopFilterOption.all,
                    label: 'All shops',
                    icon: CupertinoIcons.square_grid_2x2,
                  ),
                  _MenuOption(
                    value: _ShopFilterOption.openNow,
                    label: 'Open now',
                    icon: CupertinoIcons.clock,
                  ),
                  _MenuOption(
                    value: _ShopFilterOption.delivers,
                    label: 'Delivers',
                    icon: CupertinoIcons.car_detailed,
                  ),
                ],
                onSortChanged: (value) => setState(() => _shopSort = value),
                onFilterChanged: (value) => setState(() => _shopFilter = value),
                isFilterActive: _shopFilter != _ShopFilterOption.all,
                isSortActive: _shopSort != _ShopSortOption.nearest,
              ),
            ),
            _ShopStrip(
              future: _shops,
              sort: _shopSort,
              filter: _shopFilter,
              onOpenShop: _openShop,
            ),
            const _BrowseSectionBreak(),
            SectionHeader(
              title: showingSearchResults ? 'Compare prices' : 'Items nearby',
              trailing: _BrowseControls(
                sortTooltip: 'Sort items',
                filterTooltip: 'Filter items',
                sortValue: _itemSort,
                filterValue: _itemFilter,
                sortOptions: const [
                  _MenuOption(
                    value: _ItemSortOption.recommended,
                    label: 'Recommended',
                    icon: CupertinoIcons.sparkles,
                  ),
                  _MenuOption(
                    value: _ItemSortOption.priceLow,
                    label: 'Lowest price',
                    icon: CupertinoIcons.money_dollar,
                  ),
                  _MenuOption(
                    value: _ItemSortOption.nearest,
                    label: 'Nearest',
                    icon: CupertinoIcons.location,
                  ),
                  _MenuOption(
                    value: _ItemSortOption.name,
                    label: 'Name',
                    icon: CupertinoIcons.textformat,
                  ),
                ],
                filterOptions: const [
                  _MenuOption(
                    value: _ItemFilterOption.all,
                    label: 'All items',
                    icon: CupertinoIcons.square_grid_2x2,
                  ),
                  _MenuOption(
                    value: _ItemFilterOption.verified,
                    label: 'Verified',
                    icon: CupertinoIcons.checkmark_seal,
                  ),
                  _MenuOption(
                    value: _ItemFilterOption.multiOffer,
                    label: 'Multiple offers',
                    icon: CupertinoIcons.square_stack_3d_up,
                  ),
                ],
                onSortChanged: (value) => setState(() => _itemSort = value),
                onFilterChanged: (value) => setState(() => _itemFilter = value),
                isFilterActive: _itemFilter != _ItemFilterOption.all,
                isSortActive: _itemSort != _ItemSortOption.recommended,
              ),
            ),
            _ProductResultsList(
              future: _results,
              query: _search.text,
              sort: _itemSort,
              filter: _itemFilter,
            ),
          ],
        ),
      ),
    );
  }

  void _openShop(Shop shop) {
    Navigator.of(
      context,
    ).push(MaterialPageRoute(builder: (_) => _ShopDetailPage(shop: shop)));
  }
}
