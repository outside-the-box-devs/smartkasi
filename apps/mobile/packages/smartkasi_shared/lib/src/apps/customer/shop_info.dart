part of '../customer_app.dart';

class _ShopInfoTab extends StatelessWidget {
  const _ShopInfoTab({
    required this.fallbackShop,
    required this.future,
    required this.onRefresh,
  });

  final Shop fallbackShop;
  final Future<Shop>? future;
  final RefreshCallback onRefresh;

  @override
  Widget build(BuildContext context) {
    final shopFuture = future;
    if (shopFuture == null) {
      return const ResponsiveList(children: [_ShopDetailSkeleton()]);
    }
    return RefreshIndicator(
      onRefresh: onRefresh,
      child: FutureBuilder<Shop>(
        future: shopFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const ResponsiveList(children: [_ShopDetailSkeleton()]);
          }
          if (snapshot.hasError) {
            return ResponsiveList(
              children: [ErrorPanel(error: snapshot.error!)],
            );
          }
          return _ShopInfoContent(shop: snapshot.data ?? fallbackShop);
        },
      ),
    );
  }
}

class _ShopInfoContent extends StatelessWidget {
  const _ShopInfoContent({required this.shop});

  final Shop shop;

  @override
  Widget build(BuildContext context) {
    final deps = SmartKasiScope.of(context);
    final meters =
        shop.distanceM ??
        _distanceBetweenMeters(
          deps.config.defaultLat,
          deps.config.defaultLng,
          shop.lat,
          shop.lng,
        );
    return ResponsiveList(
      padding: const EdgeInsets.fromLTRB(16, 2, 16, 18),
      children: [
        _ShopMapPreview(
          shop: shop,
          customerLat: deps.config.defaultLat,
          customerLng: deps.config.defaultLng,
          distanceM: meters,
        ),
        KasiCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                shop.name,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 8),
              Text(shop.addressLine),
              const SizedBox(height: 12),
              MetricStrip(
                children: [
                  StatTile(
                    label: 'distance',
                    value: distanceLabel(meters),
                    icon: Icons.near_me_outlined,
                  ),
                  StatTile(
                    label: 'catalog',
                    value: '${shop.productCount ?? 0}',
                    icon: Icons.shopping_bag_outlined,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _InfoRow(
                icon: Icons.delivery_dining,
                label: 'Delivery',
                value: shop.acceptsDelivery ? 'Available' : 'Collection only',
              ),
              _InfoRow(
                icon: Icons.schedule,
                label: 'Trading',
                value: shop.isOpenNow ? 'Open now' : 'Closed now',
              ),
              if (shop.phone != null && shop.phone!.isNotEmpty)
                _InfoRow(
                  icon: Icons.call_outlined,
                  label: 'Phone',
                  value: shop.phone!,
                ),
              if (shop.licenceStatus != null && shop.licenceStatus!.isNotEmpty)
                _InfoRow(
                  icon: Icons.verified_user_outlined,
                  label: 'Licence',
                  value: shop.licenceStatus!,
                ),
              _InfoRow(
                icon: Icons.place_outlined,
                label: 'Area',
                value: [
                  if (shop.township != null && shop.township!.isNotEmpty)
                    shop.township,
                  if (shop.city != null && shop.city!.isNotEmpty) shop.city,
                ].whereType<String>().join(' - '),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ShopMapPreview extends StatelessWidget {
  const _ShopMapPreview({
    required this.shop,
    required this.customerLat,
    required this.customerLng,
    required this.distanceM,
  });

  final Shop shop;
  final double customerLat;
  final double customerLng;
  final int distanceM;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;
    return KasiCard(
      padding: EdgeInsets.zero,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: SizedBox(
          height: 230,
          child: Stack(
            children: [
              Positioned.fill(
                child: CustomPaint(
                  painter: _MiniMapPainter(
                    isDark: isDark,
                    accent: scheme.primary,
                    secondary: scheme.secondary,
                  ),
                ),
              ),
              Positioned(
                left: 18,
                bottom: 18,
                child: _MapPinLabel(
                  icon: Icons.person_pin_circle_outlined,
                  label: 'You',
                  color: scheme.secondary,
                ),
              ),
              Positioned(
                right: 18,
                top: 18,
                child: _MapPinLabel(
                  icon: Icons.storefront,
                  label: shop.name,
                  color: scheme.primary,
                ),
              ),
              Positioned(
                left: 16,
                right: 16,
                bottom: 82,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: (isDark ? Colors.black : Colors.white).withValues(
                      alpha: 0.86,
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Icon(Icons.route_outlined, color: scheme.primary),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            '${distanceLabel(distanceM)} away from your area',
                            style: theme.textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              Positioned(
                right: 14,
                bottom: 12,
                child: Text(
                  '${shop.lat.toStringAsFixed(4)}, ${shop.lng.toStringAsFixed(4)}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: isDark
                        ? const Color(0xFFAEB6BF)
                        : const Color(0xFF4B5563),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MapPinLabel extends StatelessWidget {
  const _MapPinLabel({
    required this.icon,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF111820) : Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isDark ? const Color(0xFF26313A) : const Color(0xFFE5E7EB),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(width: 6),
            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 132),
              child: Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MiniMapPainter extends CustomPainter {
  const _MiniMapPainter({
    required this.isDark,
    required this.accent,
    required this.secondary,
  });

  final bool isDark;
  final Color accent;
  final Color secondary;

  @override
  void paint(Canvas canvas, Size size) {
    final background = Paint()
      ..color = isDark ? const Color(0xFF101418) : const Color(0xFFF7F7FA);
    canvas.drawRect(Offset.zero & size, background);

    final roadPaint = Paint()
      ..color = isDark ? const Color(0xFF202932) : const Color(0xFFE5E7EB)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;
    for (var i = 0; i < 5; i++) {
      final y = size.height * (0.18 + i * 0.18);
      canvas.drawLine(Offset(0, y), Offset(size.width, y - 32), roadPaint);
    }
    for (var i = 0; i < 4; i++) {
      final x = size.width * (0.18 + i * 0.22);
      canvas.drawLine(Offset(x, 0), Offset(x + 44, size.height), roadPaint);
    }

    final route = Paint()
      ..color = accent
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    final start = Offset(size.width * 0.22, size.height * 0.74);
    final mid = Offset(size.width * 0.47, size.height * 0.50);
    final end = Offset(size.width * 0.77, size.height * 0.30);
    final path = Path()
      ..moveTo(start.dx, start.dy)
      ..quadraticBezierTo(mid.dx, mid.dy, end.dx, end.dy);
    canvas.drawPath(path, route);

    canvas.drawCircle(start, 10, Paint()..color = secondary);
    canvas.drawCircle(end, 12, Paint()..color = accent);
    canvas.drawCircle(start, 4, Paint()..color = Colors.white);
    canvas.drawCircle(end, 5, Paint()..color = Colors.white);
  }

  @override
  bool shouldRepaint(_MiniMapPainter oldDelegate) =>
      isDark != oldDelegate.isDark ||
      accent != oldDelegate.accent ||
      secondary != oldDelegate.secondary;
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    if (value.isEmpty) return const SizedBox.shrink();
    final textTheme = Theme.of(context).textTheme;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: textTheme.bodySmall),
                const SizedBox(height: 1),
                Text(
                  value,
                  style: textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ShopDetailSkeleton extends StatelessWidget {
  const _ShopDetailSkeleton();

  @override
  Widget build(BuildContext context) {
    return const KasiCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SkeletonBox(width: 220, height: 24),
          SizedBox(height: 10),
          _SkeletonBox(width: double.infinity, height: 16),
          SizedBox(height: 16),
          MetricStrip(
            children: [
              StatTile(
                label: 'distance',
                value: '...',
                icon: Icons.near_me_outlined,
              ),
              StatTile(
                label: 'catalog',
                value: '...',
                icon: Icons.shopping_bag_outlined,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
