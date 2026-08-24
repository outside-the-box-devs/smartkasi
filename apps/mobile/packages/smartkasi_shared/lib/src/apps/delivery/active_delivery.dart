part of '../delivery_app.dart';

class _ActiveDeliveryScreen extends StatefulWidget {
  const _ActiveDeliveryScreen({
    required this.delivery,
    required this.onChanged,
  });

  final CourierDelivery? delivery;
  final ValueChanged<CourierDelivery?> onChanged;

  @override
  State<_ActiveDeliveryScreen> createState() => _ActiveDeliveryScreenState();
}

class _ActiveDeliveryScreenState extends State<_ActiveDeliveryScreen> {
  bool _busy = false;
  Object? _error;

  Future<void> _collect({String? shopId}) async {
    final delivery = widget.delivery;
    if (delivery == null) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      widget.onChanged(
        await SmartKasiScope.of(
          context,
        ).api.collectJob(delivery.id, shopId: shopId),
      );
    } catch (error) {
      setState(() => _error = error);
    } finally {
      setState(() => _busy = false);
    }
  }

  Future<void> _deliver() async {
    final delivery = widget.delivery;
    if (delivery == null) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final completed = await SmartKasiScope.of(
        context,
      ).api.deliverJob(delivery.id);
      widget.onChanged(null);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${completed.orderNumber} delivered')),
      );
    } catch (error) {
      setState(() => _error = error);
    } finally {
      setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AuthGate(
      child: widget.delivery == null
          ? const ResponsiveList(
              children: [
                EmptyState(
                  icon: Icons.local_shipping_outlined,
                  title: 'No active delivery',
                  message:
                      'Accept a job from the jobs tab to start a pickup run.',
                ),
              ],
            )
          : ResponsiveList(
              children: [
                _DeliverySummary(delivery: widget.delivery!),
                if (_error != null) ErrorPanel(error: _error!),
                KasiCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SectionHeader(title: 'Pickup checklist'),
                      const SizedBox(height: 8),
                      for (final pickup in widget.delivery!.pickups)
                        CheckboxListTile(
                          contentPadding: EdgeInsets.zero,
                          value: pickup.collected,
                          // A collected stop cannot be un-collected, and a
                          // multi-shop run is ticked off one shop at a time.
                          onChanged: pickup.collected || _busy
                              ? null
                              : (_) => _collect(shopId: pickup.shopId),
                          title: Text('${pickup.sequence}. ${pickup.shopName}'),
                          subtitle: Text(
                            '${pickup.itemCount} item(s) - ${pickup.addressLine}',
                          ),
                        ),
                      const Divider(),
                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: const Icon(Icons.flag),
                        title: Text(widget.delivery!.dropoffAddress),
                        subtitle: Text(
                          [
                            if (widget.delivery!.dropoffNotes != null)
                              widget.delivery!.dropoffNotes!,
                            if (widget.delivery!.customerFirstName != null)
                              'Customer: ${widget.delivery!.customerFirstName}',
                          ].join('\n'),
                        ),
                      ),
                    ],
                  ),
                ),
                if (widget.delivery!.pickups.any((p) => !p.collected))
                  FilledButton.icon(
                    onPressed: _busy ? null : () => _collect(),
                    icon: const Icon(Icons.inventory_2),
                    label: Text(
                      widget.delivery!.pickups.length > 1
                          ? 'Confirm next pickup'
                          : 'Confirm pickup',
                    ),
                  )
                else
                  FilledButton.icon(
                    onPressed: _busy ? null : _deliver,
                    icon: const Icon(Icons.done_all),
                    label: const Text('Confirm handover'),
                  ),
              ],
            ),
    );
  }
}

class _DeliverySummary extends StatelessWidget {
  const _DeliverySummary({required this.delivery});

  final CourierDelivery delivery;

  @override
  Widget build(BuildContext context) {
    return KasiHeroPanel(
      title: delivery.orderNumber,
      subtitle:
          '${delivery.pickups.length} pickup(s) before handover. Route details stay courier-only.',
      icon: Icons.local_shipping,
      trailing: StatusChip(delivery.status),
      chips: [
        KasiPill(label: zar(delivery.payoutCents), icon: Icons.payments),
        KasiPill(
          label: 'Cash ${zar(delivery.cashToCollectCents)}',
          icon: Icons.money,
          color: Theme.of(context).colorScheme.secondary,
        ),
        KasiPill(
          label: delivery.mode,
          icon: Icons.route,
          color: _modeColor(context, delivery.mode),
        ),
      ],
    );
  }
}
