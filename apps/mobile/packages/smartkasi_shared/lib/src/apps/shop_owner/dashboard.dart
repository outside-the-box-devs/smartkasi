part of '../shop_owner_app.dart';

class _DashboardScreen extends StatefulWidget {
  const _DashboardScreen({required this.shop});

  final Shop shop;

  @override
  State<_DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<_DashboardScreen> {
  late Future<_DashboardData> _future;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _future = _DashboardData.load(
      SmartKasiScope.of(context).api,
      widget.shop.id,
    );
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async {
        setState(
          () => _future = _DashboardData.load(
            SmartKasiScope.of(context).api,
            widget.shop.id,
          ),
        );
        await _future;
      },
      child: ResponsiveList(
        children: [
          KasiHeroPanel(
            title: widget.shop.name,
            subtitle: widget.shop.addressLine,
            icon: Icons.storefront,
            trailing: StatusChip(widget.shop.licenceStatus ?? widget.shop.mode),
            chips: [
              KasiPill(
                label: widget.shop.acceptsOrders ? 'Online orders' : 'POS only',
                icon: widget.shop.acceptsOrders
                    ? Icons.shopping_bag
                    : Icons.point_of_sale,
              ),
              KasiPill(
                label: widget.shop.isOpenNow ? 'Open now' : 'Closed',
                icon: widget.shop.isOpenNow
                    ? Icons.lock_open
                    : Icons.lock_outline,
                color: widget.shop.isOpenNow
                    ? Theme.of(context).colorScheme.secondary
                    : Theme.of(context).colorScheme.error,
              ),
            ],
          ),
          FutureSection<_DashboardData>(
            future: _future,
            builder: (context, data) => Column(
              children: [
                MetricStrip(
                  children: [
                    StatTile(
                      label: 'net today',
                      value: zar(data.report.netCents),
                      icon: Icons.payments,
                    ),
                    StatTile(
                      label: 'sales',
                      value: '${data.report.saleCount}',
                      icon: Icons.point_of_sale,
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                MetricStrip(
                  children: [
                    StatTile(
                      label: 'low stock',
                      value: '${data.lowStock.length}',
                      icon: Icons.warning_amber,
                      color: Theme.of(context).colorScheme.error,
                    ),
                    StatTile(
                      label: 'orders',
                      value: '${data.orders.length}',
                      icon: Icons.receipt_long,
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                if (data.lowStock.isNotEmpty)
                  KasiCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SectionHeader(title: 'Low stock'),
                        for (final item in data.lowStock.take(5))
                          ListTile(
                            contentPadding: EdgeInsets.zero,
                            title: Text(item.product.name),
                            subtitle: Text(
                              'Stock ${item.stockQty}, threshold ${item.lowStockThreshold}',
                            ),
                            trailing: Text(zar(item.priceCents)),
                          ),
                      ],
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

class _DashboardData {
  const _DashboardData({
    required this.report,
    required this.lowStock,
    required this.orders,
  });

  static Future<_DashboardData> load(SmartKasiApi api, String shopId) async {
    final report = await api.dailyReport(shopId);
    final low = await api.lowStock(shopId);
    final orders = await api.shopOrders(shopId, status: 'pending');
    return _DashboardData(report: report, lowStock: low, orders: orders);
  }

  final DailyReport report;
  final List<InventoryItem> lowStock;
  final List<ShopOrderLeg> orders;
}
