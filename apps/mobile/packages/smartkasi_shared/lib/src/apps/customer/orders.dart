part of '../customer_app.dart';

class _CustomerOrdersScreen extends StatefulWidget {
  const _CustomerOrdersScreen();

  @override
  State<_CustomerOrdersScreen> createState() => _CustomerOrdersScreenState();
}

class _CustomerOrdersScreenState extends State<_CustomerOrdersScreen> {
  Future<List<Order>>? _future;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final auth = SmartKasiScope.of(context).auth;
    if (auth.isSignedIn) _future ??= SmartKasiScope.of(context).api.orders();
  }

  @override
  Widget build(BuildContext context) {
    final deps = SmartKasiScope.of(context);
    return AuthGate(
      child: RefreshIndicator(
        onRefresh: () async {
          setState(() => _future = deps.api.orders());
          await _future;
        },
        child: ResponsiveList(
          children: [
            const KasiHeroPanel(
              title: 'Orders',
              subtitle:
                  'Track order status without exposing courier routes or live location.',
              icon: Icons.receipt_long,
              chips: [
                KasiPill(label: 'Safe tracking', icon: Icons.visibility_off),
              ],
            ),
            FutureSection<List<Order>>(
              future: _future ?? deps.api.orders(),
              builder: (context, orders) {
                if (orders.isEmpty) {
                  return const EmptyState(
                    icon: Icons.receipt_long_outlined,
                    title: 'No orders yet',
                    message: 'Placed orders will appear here.',
                  );
                }
                return Column(
                  children: _withSpacing([
                    for (final order in orders) _OrderCard(order: order),
                  ]),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _OrderCard extends StatefulWidget {
  const _OrderCard({required this.order});

  final Order order;

  @override
  State<_OrderCard> createState() => _OrderCardState();
}

class _OrderCardState extends State<_OrderCard> {
  CustomerDelivery? _delivery;
  Object? _error;

  Future<void> _track() async {
    final api = SmartKasiScope.of(context).api;
    try {
      final delivery = widget.order.delivery?.id == null
          ? await api.requestDelivery(widget.order.id)
          : await api.trackDelivery(widget.order.delivery!.id);
      setState(() => _delivery = delivery);
    } catch (error) {
      setState(() => _error = error);
    }
  }

  @override
  Widget build(BuildContext context) {
    return KasiCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  widget.order.orderNumber,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              StatusChip(widget.order.status),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${widget.order.legs.length} shop leg(s) - ${zar(widget.order.totalCents)}',
          ),
          const SizedBox(height: 8),
          for (final leg in widget.order.legs)
            Text('${leg.shopName}: ${leg.status.replaceAll('_', ' ')}'),
          if (_delivery != null) ...[
            const Divider(),
            StatusChip('ETA ${_delivery!.etaBand ?? 'pending'}'),
            const SizedBox(height: 6),
            Text(
              _delivery!.courierName == null
                  ? 'Courier assignment pending'
                  : '${_delivery!.courierName} is handling delivery.',
            ),
            const SizedBox(height: 4),
            const Text('Live route is hidden for courier safety.'),
          ],
          if (_error != null) ErrorPanel(error: _error!),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: _track,
            icon: const Icon(Icons.delivery_dining),
            label: const Text('Track safely'),
          ),
        ],
      ),
    );
  }
}
