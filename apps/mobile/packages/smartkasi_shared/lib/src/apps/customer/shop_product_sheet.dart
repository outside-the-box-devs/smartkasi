part of '../customer_app.dart';

void _showShopProductSheet(BuildContext context, _ShopProductLine line) {
  final deps = SmartKasiScope.of(context);
  final comparison = _loadProductComparison(deps, line.product);
  showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    backgroundColor: Theme.of(context).scaffoldBackgroundColor,
    builder: (context) => _ShopProductSheet(line: line, comparison: comparison),
  );
}

Future<ProductSearchResult?> _loadProductComparison(
  SmartKasiDependencies deps,
  Product product,
) async {
  final results = await deps.api.searchProducts(
    q: product.name,
    lat: deps.config.defaultLat,
    lng: deps.config.defaultLng,
    radiusM: 5000,
  );
  for (final result in results) {
    if (result.product.id == product.id) return result;
  }
  final normalized = product.name.toLowerCase();
  for (final result in results) {
    if (result.product.name.toLowerCase() == normalized) return result;
  }
  return results.firstOrNull;
}

int _distanceBetweenMeters(
  double startLat,
  double startLng,
  double endLat,
  double endLng,
) {
  const earthRadiusM = 6371000;
  final dLat = _degreesToRadians(endLat - startLat);
  final dLng = _degreesToRadians(endLng - startLng);
  final a =
      math.sin(dLat / 2) * math.sin(dLat / 2) +
      math.cos(_degreesToRadians(startLat)) *
          math.cos(_degreesToRadians(endLat)) *
          math.sin(dLng / 2) *
          math.sin(dLng / 2);
  final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
  return (earthRadiusM * c).round();
}

double _degreesToRadians(double degrees) => degrees * math.pi / 180;

class _ShopProductSheet extends StatelessWidget {
  const _ShopProductSheet({required this.line, required this.comparison});

  final _ShopProductLine line;
  final Future<ProductSearchResult?> comparison;

  @override
  Widget build(BuildContext context) {
    final product = line.product;
    final offer = line.offer;
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.82,
      minChildSize: 0.45,
      maxChildSize: 0.94,
      builder: (context, scrollController) {
        return ListView(
          controller: scrollController,
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
          children: [
            _ProductImage(product: product, height: 190),
            const SizedBox(height: 16),
            Text(
              product.name,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w500,
                height: 1.05,
              ),
            ),
            if (product.displayUnit.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(product.displayUnit),
            ],
            const SizedBox(height: 14),
            MetricStrip(
              children: [
                StatTile(
                  label: 'price here',
                  value: zar(offer.priceCents),
                  icon: Icons.payments_outlined,
                ),
                StatTile(
                  label: 'stock',
                  value: '${offer.stockQty}',
                  icon: Icons.inventory_2_outlined,
                ),
              ],
            ),
            const SizedBox(height: 12),
            _ShopProductCartControl(line: line),
            const SizedBox(height: 16),
            KasiCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SectionHeader(title: 'Product info'),
                  const SizedBox(height: 8),
                  _InfoRow(
                    icon: Icons.storefront_outlined,
                    label: 'Shop',
                    value: offer.shopName,
                  ),
                  if (product.category != null)
                    _InfoRow(
                      icon: Icons.category_outlined,
                      label: 'Category',
                      value: product.category!.name,
                    ),
                  if (product.barcode != null && product.barcode!.isNotEmpty)
                    _InfoRow(
                      icon: Icons.qr_code_2,
                      label: 'Barcode',
                      value: product.barcode!,
                    ),
                  _InfoRow(
                    icon: Icons.verified_outlined,
                    label: 'Catalogue',
                    value: product.isVerified ? 'Verified' : 'Community listed',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            _ProductComparisonPanel(
              future: comparison,
              currentShopId: offer.shopId,
            ),
          ],
        );
      },
    );
  }
}

class _ProductComparisonPanel extends StatelessWidget {
  const _ProductComparisonPanel({
    required this.future,
    required this.currentShopId,
  });

  final Future<ProductSearchResult?> future;
  final String currentShopId;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<ProductSearchResult?>(
      future: future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const KasiCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _SkeletonBox(width: 150, height: 20),
                SizedBox(height: 12),
                _SkeletonBox(width: double.infinity, height: 16),
                SizedBox(height: 8),
                _SkeletonBox(width: 220, height: 16),
              ],
            ),
          );
        }
        if (snapshot.hasError) return ErrorPanel(error: snapshot.error!);
        final result = snapshot.data;
        if (result == null) {
          return const KasiCard(
            child: Text(
              'No nearby price comparison found for this product yet.',
            ),
          );
        }
        return KasiCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SectionHeader(title: 'Nearby prices'),
              const SizedBox(height: 8),
              MetricStrip(
                children: [
                  StatTile(
                    label: 'average',
                    value: zar(result.priceStats.avgPriceCents),
                    icon: Icons.query_stats,
                  ),
                  StatTile(
                    label: 'shops',
                    value: '${result.priceStats.offerCount}',
                    icon: Icons.store_mall_directory_outlined,
                  ),
                ],
              ),
              const SizedBox(height: 10),
              for (final offer in result.offers.take(4))
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  dense: true,
                  leading: Icon(
                    offer.shopId == currentShopId
                        ? Icons.check_circle
                        : Icons.storefront_outlined,
                  ),
                  title: Text(
                    offer.shopName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  subtitle: Text(distanceLabel(offer.distanceM)),
                  trailing: Text(
                    zar(offer.priceCents),
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}
