part of '../shop_owner_app.dart';

class _InventoryEditSheet extends StatefulWidget {
  const _InventoryEditSheet({required this.shopId, required this.item});

  final String shopId;
  final InventoryItem item;

  @override
  State<_InventoryEditSheet> createState() => _InventoryEditSheetState();
}

class _InventoryEditSheetState extends State<_InventoryEditSheet> {
  late final TextEditingController _price = TextEditingController(
    text: (widget.item.priceCents / 100).toStringAsFixed(2),
  );
  late final TextEditingController _stock = TextEditingController(
    text: '${widget.item.stockQty}',
  );
  late final TextEditingController _threshold = TextEditingController(
    text: '${widget.item.lowStockThreshold}',
  );
  late bool _available = widget.item.isAvailable;
  Object? _error;
  bool _busy = false;

  @override
  void dispose() {
    _price.dispose();
    _stock.dispose();
    _threshold.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await SmartKasiScope.of(
        context,
      ).api.updateInventory(widget.shopId, widget.item.id, {
        'price_cents':
            ((double.tryParse(_price.text.replaceAll(',', '.')) ?? 0) * 100)
                .round(),
        'stock_qty': int.tryParse(_stock.text) ?? widget.item.stockQty,
        'low_stock_threshold':
            int.tryParse(_threshold.text) ?? widget.item.lowStockThreshold,
        'is_available': _available,
        'client_updated_at': DateTime.now().toUtc().toIso8601String(),
      });
      if (mounted) Navigator.of(context).pop(true);
    } catch (error) {
      setState(() => _error = error);
    } finally {
      setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            widget.item.product.name,
            style: Theme.of(
              context,
            ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _price,
            decoration: const InputDecoration(labelText: 'Price (R)'),
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _stock,
            decoration: const InputDecoration(labelText: 'Stock quantity'),
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _threshold,
            decoration: const InputDecoration(labelText: 'Low-stock threshold'),
            keyboardType: TextInputType.number,
          ),
          SwitchListTile(
            value: _available,
            onChanged: (value) => setState(() => _available = value),
            title: const Text('Available for sale'),
          ),
          if (_error != null) ErrorPanel(error: _error!),
          FilledButton.icon(
            onPressed: _busy ? null : _save,
            icon: const Icon(Icons.save),
            label: const Text('Save'),
          ),
        ],
      ),
    );
  }
}
