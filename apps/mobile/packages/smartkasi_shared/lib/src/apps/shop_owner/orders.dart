part of '../shop_owner_app.dart';

class _ShopOrdersScreen extends StatefulWidget {
  const _ShopOrdersScreen({required this.shop});

  final Shop shop;

  @override
  State<_ShopOrdersScreen> createState() => _ShopOrdersScreenState();
}

class _ShopOrdersScreenState extends State<_ShopOrdersScreen> {
  String _status = 'pending';
  late Future<List<ShopOrderLeg>> _future;
  Object? _error;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _load();
  }

  void _load() {
    _future = SmartKasiScope.of(
      context,
    ).api.shopOrders(widget.shop.id, status: _status == 'all' ? null : _status);
  }

  Future<void> _action(Future<void> Function(SmartKasiApi api) command) async {
    try {
      await command(SmartKasiScope.of(context).api);
      setState(_load);
    } catch (error) {
      setState(() => _error = error);
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async {
        setState(_load);
        await _future;
      },
      child: ResponsiveList(
        children: [
          KasiHeroPanel(
            title: 'Incoming orders',
            subtitle:
                'Accept legs, reject unavailable items, and mark packed orders ready for courier pickup.',
            icon: Icons.receipt_long,
            chips: [
              KasiPill(
                label: _status.replaceAll('_', ' '),
                icon: Icons.tune,
                selected: true,
              ),
            ],
          ),
          KasiCard(
            padding: const EdgeInsets.all(10),
            child: SegmentedButton<String>(
              segments: const [
                ButtonSegment(
                  value: 'pending',
                  label: Text('Pending'),
                  icon: Icon(Icons.hourglass_top),
                ),
                ButtonSegment(
                  value: 'accepted',
                  label: Text('Accepted'),
                  icon: Icon(Icons.check),
                ),
                ButtonSegment(
                  value: 'ready',
                  label: Text('Ready'),
                  icon: Icon(Icons.inventory),
                ),
                ButtonSegment(
                  value: 'all',
                  label: Text('All'),
                  icon: Icon(Icons.all_inclusive),
                ),
              ],
              selected: {_status},
              onSelectionChanged: (value) => setState(() {
                _status = value.first;
                _load();
              }),
            ),
          ),
          if (_error != null) ErrorPanel(error: _error!),
          FutureSection<List<ShopOrderLeg>>(
            future: _future,
            builder: (context, orders) {
              if (orders.isEmpty) {
                return const EmptyState(
                  icon: Icons.receipt_long_outlined,
                  title: 'No shop orders',
                  message: 'Incoming customer order legs appear here.',
                );
              }
              return Column(
                children: [
                  for (final order in orders) ...[
                    KasiCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  order.orderNumber,
                                  style: Theme.of(context).textTheme.titleMedium
                                      ?.copyWith(fontWeight: FontWeight.w500),
                                ),
                              ),
                              StatusChip(order.status),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '${order.customerFirstName} - ${zar(order.subtotalCents)}',
                          ),
                          const Divider(),
                          for (final item in order.items)
                            Text('${item.qty} x ${item.productName}'),
                          const SizedBox(height: 10),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              FilledButton.icon(
                                onPressed: order.status == 'pending'
                                    ? () => _action(
                                        (api) => api
                                            .acceptLeg(
                                              order.orderId,
                                              widget.shop.id,
                                            )
                                            .then((_) {}),
                                      )
                                    : null,
                                icon: const Icon(Icons.check),
                                label: const Text('Accept'),
                              ),
                              OutlinedButton.icon(
                                onPressed: order.status == 'pending'
                                    ? () => _action(
                                        (api) => api
                                            .rejectLeg(
                                              order.orderId,
                                              widget.shop.id,
                                              reason: 'out_of_stock',
                                            )
                                            .then((_) {}),
                                      )
                                    : null,
                                icon: const Icon(Icons.close),
                                label: const Text('Reject'),
                              ),
                              OutlinedButton.icon(
                                onPressed: order.status == 'accepted'
                                    ? () => _action(
                                        (api) => api
                                            .readyLeg(
                                              order.orderId,
                                              widget.shop.id,
                                            )
                                            .then((_) {}),
                                      )
                                    : null,
                                icon: const Icon(Icons.inventory_2),
                                label: const Text('Ready'),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),
                  ],
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}
