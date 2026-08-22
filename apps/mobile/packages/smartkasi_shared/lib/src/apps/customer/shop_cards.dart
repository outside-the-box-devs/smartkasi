part of '../customer_app.dart';

class _ShopCard extends StatelessWidget {
  const _ShopCard({required this.shop, required this.onTap});

  final Shop shop;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = Theme.of(context).colorScheme;
    return SizedBox(
      width: 196,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: KasiCard(
          padding: const EdgeInsets.all(13),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  _ShopLogo(shop: shop),
                  const Spacer(),
                  StatusChip(
                    shop.isOpenNow ? 'open' : 'closed',
                    color: shop.isOpenNow ? scheme.secondary : scheme.error,
                  ),
                ],
              ),
              const Spacer(),
              Text(
                shop.name,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                '${distanceLabel(shop.distanceM)} away',
                style: theme.textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w500,
                  color: scheme.secondary,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                shop.addressLine,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ShopLogo extends StatelessWidget {
  const _ShopLogo({required this.shop});

  final Shop shop;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;
    final logoUrl = shop.logoUrl;
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: SizedBox(
        width: 36,
        height: 36,
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF151719) : const Color(0xFFF1F2F4),
            border: Border.all(
              color: isDark ? const Color(0xFF24282D) : const Color(0xFFE5E7EB),
            ),
          ),
          child: logoUrl == null || logoUrl.isEmpty
              ? Center(
                  child: Text(
                    shop.name.isEmpty ? 'S' : shop.name[0].toUpperCase(),
                    style: theme.textTheme.titleSmall?.copyWith(
                      color: scheme.primary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                )
              : Image.network(
                  logoUrl,
                  fit: BoxFit.cover,
                  errorBuilder: (_, _, _) => Center(
                    child: Text(
                      shop.name.isEmpty ? 'S' : shop.name[0].toUpperCase(),
                      style: theme.textTheme.titleSmall?.copyWith(
                        color: scheme.primary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ),
        ),
      ),
    );
  }
}
