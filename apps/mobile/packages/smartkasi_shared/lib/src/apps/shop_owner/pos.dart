part of '../shop_owner_app.dart';

class _PosScreen extends StatefulWidget {
  const _PosScreen({required this.shop});

  final Shop shop;

  @override
  State<_PosScreen> createState() => _PosScreenState();
}

class _PosScreenState extends State<_PosScreen> {
  final _barcode = TextEditingController(text: '6001068000456');
  final _tendered = TextEditingController();
  Object? _error;
  bool _busy = false;

  @override
  void dispose() {
    _barcode.dispose();
    _tendered.dispose();
    super.dispose();
  }

  Future<void> _scanCamera() async {
    final value = await Navigator.of(
      context,
    ).push<String>(MaterialPageRoute(builder: (_) => const ScannerPage()));
    if (value != null) {
      _barcode.text = value;
      await _lookup();
    }
  }

  Future<void> _lookup() async {
    final deps = SmartKasiScope.of(context);
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final lookup = await deps.api.barcodeLookup(
        _barcode.text.trim(),
        shopId: widget.shop.id,
      );
      deps.posCart.add(lookup);
    } catch (error) {
      setState(() => _error = error);
    } finally {
      setState(() => _busy = false);
    }
  }

  Future<void> _completeSale() async {
    final deps = SmartKasiScope.of(context);
    final amount =
        ((double.tryParse(_tendered.text.replaceAll(',', '.')) ?? 0) * 100)
            .round();
    final sale = deps.offlineSales.buildSale(
      lines: deps.posCart.lines,
      amountTenderedCents: amount,
    );
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await deps.api.createSale(widget.shop.id, sale);
      deps.posCart.clear();
      _tendered.clear();
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Sale recorded')));
    } catch (_) {
      // Offline-first POS: if the network is down, persist the idempotent sale
      // and flush it later through /sales/batch.
      await deps.offlineSales.queue(widget.shop.id, sale);
      deps.posCart.clear();
      _tendered.clear();
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Sale queued offline')));
    } finally {
      setState(() => _busy = false);
    }
  }

  /// Push what is queued, then pull what changed.
  ///
  /// The pull follows the flush rather than standing alone because a flush is
  /// exactly what invalidates the local stock counts — the sales that just
  /// landed are the reason the numbers moved. Pulling first would cache the
  /// figures this till is about to make stale.
  Future<void> _sync() async {
    final deps = SmartKasiScope.of(context);
    final queued = deps.offlineSales.read(widget.shop.id).length;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      if (queued > 0) {
        await deps.offlineSales.flush(widget.shop.id, deps.api);
      }
      await deps.catalogue.pull(widget.shop.id, deps.api);
      if (!mounted) return;
      // Ask the controller, not the return value: a pull that was skipped
      // because one was already in flight comes back null and is not a failure.
      final failed = deps.catalogue.lastError != null;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            failed
                ? 'No signal — the till is running on its cached catalogue'
                : queued > 0
                ? 'Offline sales synced, catalogue up to date'
                : 'Catalogue up to date',
          ),
        ),
      );
    } catch (error) {
      setState(() => _error = error);
    } finally {
      setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final deps = SmartKasiScope.of(context);
    return AnimatedBuilder(
      animation: Listenable.merge([
        deps.posCart,
        deps.offlineSales,
        deps.catalogue,
      ]),
      builder: (context, _) {
        final subtotal = deps.posCart.subtotalCents;
        final tendered =
            ((double.tryParse(_tendered.text.replaceAll(',', '.')) ?? 0) * 100)
                .round();
        final queued = deps.offlineSales.read(widget.shop.id).length;
        return ResponsiveList(
          children: [
            KasiHeroPanel(
              title: 'Counter sale',
              subtitle:
                  'Scan items, calculate cash change, and queue sales safely when the network drops.',
              icon: Icons.point_of_sale,
              chips: [
                KasiPill(
                  label: '$queued offline',
                  icon: Icons.cloud_queue,
                  color: queued == 0
                      ? Theme.of(context).colorScheme.secondary
                      : Theme.of(context).colorScheme.primary,
                ),
                KasiPill(
                  label: '${deps.posCart.lines.length} items',
                  icon: Icons.shopping_basket,
                ),
              ],
            ),
            KasiCard(
              padding: const EdgeInsets.all(12),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _barcode,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            labelText: 'Barcode',
                          ),
                          onSubmitted: (_) => _lookup(),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton.filledTonal(
                        tooltip: 'Scan with camera',
                        onPressed: _scanCamera,
                        icon: const Icon(Icons.qr_code_scanner),
                      ),
                      const SizedBox(width: 8),
                      IconButton.filled(
                        tooltip: 'Add barcode',
                        onPressed: _busy ? null : _lookup,
                        icon: const Icon(Icons.add),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            if (_error != null) ErrorPanel(error: _error!),
            KasiCard(
              child: Column(
                children: [
                  SectionHeader(
                    title: 'Current sale',
                    trailing: Text(
                      zar(subtotal),
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  if (deps.posCart.isEmpty)
                    const Padding(
                      padding: EdgeInsets.all(16),
                      child: Text('Scan or enter a barcode to start a sale.'),
                    )
                  else
                    for (final line in deps.posCart.lines)
                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(line.product.name),
                        subtitle: Text(zar(line.unitPriceCents)),
                        trailing: _SmallQty(
                          qty: line.qty,
                          onChanged: (qty) => deps.posCart.setQty(line, qty),
                        ),
                      ),
                  const Divider(),
                  _MoneyRow(label: 'Subtotal', amount: subtotal, strong: true),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _tendered,
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    decoration: const InputDecoration(
                      labelText: 'Cash tendered (R)',
                    ),
                    onChanged: (_) => setState(() {}),
                  ),
                  const SizedBox(height: 8),
                  _MoneyRow(
                    label: 'Change',
                    amount: (tendered - subtotal).clamp(0, 1 << 31),
                    strong: true,
                  ),
                  const SizedBox(height: 12),
                  FilledButton.icon(
                    onPressed:
                        deps.posCart.isEmpty || _busy || tendered < subtotal
                        ? null
                        : _completeSale,
                    icon: const Icon(Icons.check_circle),
                    label: const Text('Complete sale'),
                  ),
                ],
              ),
            ),
            KasiCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(child: Text('$queued queued offline sale(s)')),
                      OutlinedButton.icon(
                        onPressed: _busy ? null : _sync,
                        icon: const Icon(Icons.cloud_upload),
                        label: const Text('Sync'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    deps.catalogue.label(widget.shop.id),
                    style: Theme.of(context).textTheme.bodySmall,
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
