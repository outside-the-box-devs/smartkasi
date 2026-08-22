part of '../customer_app.dart';

class _ProductResultCard extends StatelessWidget {
  const _ProductResultCard({required this.result});

  final ProductSearchResult result;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final best = result.offers.firstOrNull;
    if (best == null) return const SizedBox.shrink();
    final pricePrefix = result.offers.length > 1 ? 'from ' : '';
    final offerLabel = result.offers.length > 1
        ? '${result.offers.length} offers'
        : '${_totalOfferStock(result)} left';
    final actionLabel = result.offers.length == 1 ? 'Add' : 'Choose';
    return GestureDetector(
      onTap: () => _showBrowseProductSheet(context, result),
      child: KasiCard(
        padding: const EdgeInsets.all(10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _ProductImage(product: result.product, height: 110),
            const SizedBox(height: 10),
            Text(
              result.product.name,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w500,
                height: 1.12,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              result.product.displayUnit.isEmpty
                  ? result.product.category?.name ?? 'Nearby item'
                  : result.product.displayUnit,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.bodySmall,
            ),
            const Spacer(),
            Row(
              children: [
                Expanded(
                  child: Text(
                    '$pricePrefix${zar(_lowestOfferPrice(result))}',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                StatusChip(offerLabel),
              ],
            ),
            const SizedBox(height: 10),
            SizedBox(
              height: 38,
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: () => _showBrowseProductSheet(context, result),
                icon: const Icon(CupertinoIcons.cart),
                label: Text(actionLabel),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

void _showBrowseProductSheet(BuildContext context, ProductSearchResult result) {
  showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    backgroundColor: Theme.of(context).scaffoldBackgroundColor,
    builder: (context) => _BrowseProductSheet(result: result),
  );
}

class _BrowseProductSheet extends StatelessWidget {
  const _BrowseProductSheet({required this.result});

  final ProductSearchResult result;

  @override
  Widget build(BuildContext context) {
    final product = result.product;
    final offers = result.offers;
    final textTheme = Theme.of(context).textTheme;
    final lowestPrice = _lowestOfferPrice(result);
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
              style: textTheme.headlineSmall?.copyWith(
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
                  label: offers.length > 1 ? 'from' : 'price',
                  value: zar(lowestPrice),
                  icon: Icons.payments_outlined,
                ),
                StatTile(
                  label: 'offers',
                  value: '${offers.length}',
                  icon: Icons.storefront_outlined,
                ),
              ],
            ),
            const SizedBox(height: 16),
            const SectionHeader(title: 'Choose shop'),
            const SizedBox(height: 10),
            for (final offer in offers) ...[
              _BrowseOfferCard(
                product: product,
                offer: offer,
                isBestPrice: offer.priceCents == lowestPrice,
              ),
              const SizedBox(height: 10),
            ],
            KasiCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SectionHeader(title: 'Product info'),
                  const SizedBox(height: 8),
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
          ],
        );
      },
    );
  }
}

class _BrowseOfferCard extends StatelessWidget {
  const _BrowseOfferCard({
    required this.product,
    required this.offer,
    required this.isBestPrice,
  });

  final Product product;
  final ProductOffer offer;
  final bool isBestPrice;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final line = _ShopProductLine(product: product, offer: offer);
    return KasiCard(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: scheme.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              Icons.storefront_outlined,
              color: scheme.primary,
              size: 19,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        offer.shopName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    if (isBestPrice) ...[
                      const SizedBox(width: 8),
                      StatusChip('best price'),
                    ],
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  '${distanceLabel(offer.distanceM)} - ${offer.stockQty} left',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodySmall,
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                zar(offer.priceCents),
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 7),
              _BrowseItemCartControl(line: line),
            ],
          ),
        ],
      ),
    );
  }
}

class _BrowseItemCartControl extends StatelessWidget {
  const _BrowseItemCartControl({required this.line});

  final _ShopProductLine line;

  @override
  Widget build(BuildContext context) {
    final deps = SmartKasiScope.of(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return AnimatedBuilder(
      animation: deps.cart,
      builder: (context, _) {
        final cartLine = deps.cart.lineFor(line.product, line.offer);
        if (cartLine != null) {
          return SizedBox(
            width: 78,
            height: 36,
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: isDark
                    ? const Color(0xFF151719)
                    : const Color(0xFFF1F2F4),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: isDark
                      ? const Color(0xFF24282D)
                      : const Color(0xFFE5E7EB),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: IconButton(
                      tooltip: 'Decrease',
                      visualDensity: VisualDensity.compact,
                      iconSize: 16,
                      onPressed: () =>
                          deps.cart.setQty(cartLine, cartLine.qty - 1),
                      icon: const Icon(Icons.remove),
                    ),
                  ),
                  Text(
                    '${cartLine.qty}',
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                  Expanded(
                    child: IconButton(
                      tooltip: 'Increase',
                      visualDensity: VisualDensity.compact,
                      iconSize: 16,
                      onPressed: cartLine.qty >= line.offer.stockQty
                          ? null
                          : () => deps.cart.setQty(cartLine, cartLine.qty + 1),
                      icon: const Icon(Icons.add),
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        return SizedBox(
          height: 36,
          child: FilledButton.icon(
            style: FilledButton.styleFrom(
              minimumSize: const Size(86, 36),
              padding: const EdgeInsets.symmetric(horizontal: 12),
            ),
            onPressed: line.offer.acceptsOrders && line.offer.stockQty > 0
                ? () => deps.cart.add(line.product, line.offer)
                : null,
            icon: const Icon(CupertinoIcons.cart, size: 16),
            label: const Text('Add'),
          ),
        );
      },
    );
  }
}
