part of '../customer_app.dart';

class _ShopStrip extends StatelessWidget {
  const _ShopStrip({
    required this.future,
    required this.sort,
    required this.filter,
    required this.onOpenShop,
  });

  final Future<List<Shop>>? future;
  final _ShopSortOption sort;
  final _ShopFilterOption filter;
  final ValueChanged<Shop> onOpenShop;

  @override
  Widget build(BuildContext context) {
    final shopFuture = future;
    if (shopFuture == null) return const _ShopSkeletonStrip();
    return FutureBuilder<List<Shop>>(
      future: shopFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const _ShopSkeletonStrip();
        }
        if (snapshot.hasError) return ErrorPanel(error: snapshot.error!);
        final allShops = snapshot.data ?? const <Shop>[];
        final shops = _applyShopControls(allShops, sort, filter);
        if (shops.isEmpty) {
          return EmptyState(
            icon: Icons.storefront_outlined,
            title: allShops.isEmpty ? 'No shops nearby' : 'No matching shops',
            message: allShops.isEmpty
                ? 'Try refreshing or increasing the service radius later.'
                : 'Try another shop filter.',
          );
        }
        return SizedBox(
          height: 136,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: shops.length,
            separatorBuilder: (_, _) => const SizedBox(width: 10),
            itemBuilder: (context, index) => _ShopCard(
              shop: shops[index],
              onTap: () => onOpenShop(shops[index]),
            ),
          ),
        );
      },
    );
  }
}

class _ProductResultsList extends StatelessWidget {
  const _ProductResultsList({
    required this.future,
    required this.query,
    required this.sort,
    required this.filter,
  });

  final Future<List<ProductSearchResult>>? future;
  final String query;
  final _ItemSortOption sort;
  final _ItemFilterOption filter;

  @override
  Widget build(BuildContext context) {
    final trimmed = query.trim();
    final productFuture = future;
    if (productFuture == null) return const _ProductSkeletonList();
    return FutureBuilder<List<ProductSearchResult>>(
      future: productFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const _ProductSkeletonList();
        }
        if (snapshot.hasError) return ErrorPanel(error: snapshot.error!);
        final allResults = snapshot.data ?? const <ProductSearchResult>[];
        final results = _applyItemControls(allResults, sort, filter);
        if (results.isEmpty) {
          return EmptyState(
            icon: Icons.search_off,
            title: allResults.isNotEmpty
                ? 'No matching items'
                : trimmed.length >= 3
                ? 'No products found'
                : 'No items nearby',
            message: allResults.isNotEmpty
                ? 'Try another item filter.'
                : trimmed.length >= 3
                ? 'No stocked products matched "$trimmed".'
                : 'Nearby shops have not published stocked items yet.',
          );
        }
        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: results.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            mainAxisExtent: 286,
          ),
          itemBuilder: (context, index) =>
              _ProductResultCard(result: results[index]),
        );
      },
    );
  }
}

class _ShopSkeletonStrip extends StatelessWidget {
  const _ShopSkeletonStrip();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 136,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: 3,
        separatorBuilder: (_, _) => const SizedBox(width: 10),
        itemBuilder: (_, _) => const SizedBox(
          width: 196,
          child: KasiCard(
            padding: EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _SkeletonBox(width: 38, height: 38),
                Spacer(),
                _SkeletonBox(width: 150, height: 18),
                SizedBox(height: 10),
                _SkeletonBox(width: 76, height: 14),
                SizedBox(height: 8),
                _SkeletonBox(width: 120, height: 14),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ProductSkeletonList extends StatelessWidget {
  const _ProductSkeletonList();

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: 4,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        mainAxisExtent: 286,
      ),
      itemBuilder: (_, _) => const KasiCard(
        padding: EdgeInsets.all(10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _SkeletonBox(width: double.infinity, height: 110),
            SizedBox(height: 12),
            _SkeletonBox(width: double.infinity, height: 16),
            SizedBox(height: 8),
            _SkeletonBox(width: 86, height: 13),
            Spacer(),
            Row(
              children: [
                _SkeletonBox(width: 70, height: 18),
                Spacer(),
                _SkeletonBox(width: 36, height: 36),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SkeletonBox extends StatelessWidget {
  const _SkeletonBox({required this.width, required this.height});

  final double width;
  final double height;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF2C2C2E) : const Color(0xFFE5E5EA),
        borderRadius: BorderRadius.circular(8),
      ),
    );
  }
}
