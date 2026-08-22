part of '../customer_app.dart';

class _ShopDetailTabs extends StatelessWidget {
  const _ShopDetailTabs();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1C1C1E) : const Color(0xFFEDEDF2),
          borderRadius: BorderRadius.circular(8),
        ),
        child: TabBar(
          dividerColor: Colors.transparent,
          indicatorSize: TabBarIndicatorSize.tab,
          indicator: BoxDecoration(
            color: scheme.primary,
            borderRadius: BorderRadius.circular(8),
          ),
          labelColor: scheme.onPrimary,
          unselectedLabelColor: isDark
              ? const Color(0xFFAEB6BF)
              : const Color(0xFF4B5563),
          labelStyle: theme.textTheme.labelLarge?.copyWith(
            fontWeight: FontWeight.w500,
          ),
          tabs: const [
            Tab(icon: Icon(Icons.shopping_bag_outlined), text: 'Products'),
            Tab(icon: Icon(Icons.info_outline), text: 'Info'),
          ],
        ),
      ),
    );
  }
}

class _ShopProductsTab extends StatelessWidget {
  const _ShopProductsTab({required this.future, required this.onRefresh});

  final Future<List<_ShopProductLine>>? future;
  final RefreshCallback onRefresh;

  @override
  Widget build(BuildContext context) {
    final inventoryFuture = future;
    if (inventoryFuture == null) return const _ShopProductGridSkeleton();
    return FutureBuilder<List<_ShopProductLine>>(
      future: inventoryFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const _ShopProductGridSkeleton();
        }
        if (snapshot.hasError) {
          return RefreshIndicator(
            onRefresh: onRefresh,
            child: ResponsiveList(
              children: [ErrorPanel(error: snapshot.error!)],
            ),
          );
        }
        final items = snapshot.data ?? const <_ShopProductLine>[];
        if (items.isEmpty) {
          return RefreshIndicator(
            onRefresh: onRefresh,
            child: const ResponsiveList(
              children: [
                EmptyState(
                  icon: Icons.inventory_2_outlined,
                  title: 'No products yet',
                  message: 'This shop has not published inventory.',
                ),
              ],
            ),
          );
        }
        return RefreshIndicator(
          onRefresh: onRefresh,
          child: LayoutBuilder(
            builder: (context, constraints) {
              final maxWidth = constraints.maxWidth > 720
                  ? 720.0
                  : constraints.maxWidth;
              return Align(
                alignment: Alignment.topCenter,
                child: SizedBox(
                  width: maxWidth,
                  child: GridView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 2, 16, 18),
                    physics: const AlwaysScrollableScrollPhysics(),
                    itemCount: items.length,
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          mainAxisSpacing: 12,
                          crossAxisSpacing: 12,
                          mainAxisExtent: 286,
                        ),
                    itemBuilder: (context, index) =>
                        _ShopProductGridCard(line: items[index]),
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }
}

class _ShopProductGridCard extends StatelessWidget {
  const _ShopProductGridCard({required this.line});

  final _ShopProductLine line;

  @override
  Widget build(BuildContext context) {
    final product = line.product;
    final offer = line.offer;
    final textTheme = Theme.of(context).textTheme;
    return GestureDetector(
      onTap: () => _showShopProductSheet(context, line),
      child: KasiCard(
        padding: const EdgeInsets.all(10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _ProductImage(product: product, height: 110),
            const SizedBox(height: 10),
            Text(
              product.name,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w500,
                height: 1.12,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              product.displayUnit.isEmpty
                  ? product.category?.name ?? 'Pantry item'
                  : product.displayUnit,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: textTheme.bodySmall,
            ),
            const Spacer(),
            Row(
              children: [
                Expanded(
                  child: Text(
                    zar(offer.priceCents),
                    style: textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                StatusChip('${offer.stockQty} left'),
              ],
            ),
            const SizedBox(height: 10),
            _ShopProductCartControl(line: line),
          ],
        ),
      ),
    );
  }
}

class _ShopProductCartControl extends StatelessWidget {
  const _ShopProductCartControl({required this.line});

  final _ShopProductLine line;

  @override
  Widget build(BuildContext context) {
    final deps = SmartKasiScope.of(context);
    return AnimatedBuilder(
      animation: deps.cart,
      builder: (context, _) {
        final cartLine = deps.cart.lineFor(line.product, line.offer);
        final canAdd = line.offer.acceptsOrders && line.offer.stockQty > 0;
        if (cartLine != null) {
          return _InlineCartStepper(
            qty: cartLine.qty,
            maxQty: line.offer.stockQty,
            onChanged: (qty) => deps.cart.setQty(cartLine, qty),
          );
        }
        return SizedBox(
          height: 38,
          width: double.infinity,
          child: FilledButton.icon(
            onPressed: canAdd
                ? () => deps.cart.add(line.product, line.offer)
                : null,
            icon: const Icon(Icons.add),
            label: Text(canAdd ? 'Add' : 'Unavailable'),
          ),
        );
      },
    );
  }
}

class _InlineCartStepper extends StatelessWidget {
  const _InlineCartStepper({
    required this.qty,
    required this.maxQty,
    required this.onChanged,
  });

  final int qty;
  final int maxQty;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return SizedBox(
      height: 38,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: scheme.primary.withValues(alpha: 0.13),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: scheme.primary.withValues(alpha: 0.3)),
        ),
        child: Row(
          children: [
            Expanded(
              child: IconButton(
                tooltip: 'Decrease',
                visualDensity: VisualDensity.compact,
                onPressed: () => onChanged(qty - 1),
                icon: const Icon(Icons.remove),
              ),
            ),
            SizedBox(
              width: 34,
              child: Text(
                '$qty',
                textAlign: TextAlign.center,
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
            ),
            Expanded(
              child: IconButton(
                tooltip: 'Increase',
                visualDensity: VisualDensity.compact,
                onPressed: qty >= maxQty ? null : () => onChanged(qty + 1),
                icon: const Icon(Icons.add),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProductImage extends StatelessWidget {
  const _ProductImage({required this.product, required this.height});

  final Product product;
  final double height;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final imageUrl = product.imageUrl;
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: SizedBox(
        height: height,
        width: double.infinity,
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF2C2C2E) : const Color(0xFFF2F2F7),
          ),
          child: imageUrl == null || imageUrl.isEmpty
              ? Icon(CupertinoIcons.cart, color: scheme.primary, size: 36)
              : Image.network(
                  imageUrl,
                  fit: BoxFit.cover,
                  errorBuilder: (_, _, _) => Icon(
                    CupertinoIcons.cart,
                    color: scheme.primary,
                    size: 36,
                  ),
                  loadingBuilder: (context, child, progress) {
                    if (progress == null) return child;
                    return const Center(
                      child: SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    );
                  },
                ),
        ),
      ),
    );
  }
}

class _ShopProductGridSkeleton extends StatelessWidget {
  const _ShopProductGridSkeleton();

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final maxWidth = constraints.maxWidth > 720
            ? 720.0
            : constraints.maxWidth;
        return Align(
          alignment: Alignment.topCenter,
          child: SizedBox(
            width: maxWidth,
            child: GridView.builder(
              padding: const EdgeInsets.fromLTRB(16, 2, 16, 18),
              physics: const AlwaysScrollableScrollPhysics(),
              itemCount: 6,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                mainAxisExtent: 286,
              ),
              itemBuilder: (context, index) => const KasiCard(
                padding: EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _SkeletonBox(width: double.infinity, height: 110),
                    SizedBox(height: 12),
                    _SkeletonBox(width: double.infinity, height: 16),
                    SizedBox(height: 7),
                    _SkeletonBox(width: 90, height: 13),
                    Spacer(),
                    _SkeletonBox(width: 74, height: 20),
                    SizedBox(height: 10),
                    _SkeletonBox(width: double.infinity, height: 38),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
