part of '../shop_owner_app.dart';

class _InventoryAddSheet extends StatefulWidget {
  const _InventoryAddSheet({required this.shopId});

  final String shopId;

  @override
  State<_InventoryAddSheet> createState() => _InventoryAddSheetState();
}

class _InventoryAddSheetState extends State<_InventoryAddSheet> {
  final _barcode = TextEditingController();
  final _name = TextEditingController();
  final _price = TextEditingController();
  final _stock = TextEditingController(text: '0');
  Object? _error;
  bool _busy = false;
  Product? _product;

  @override
  void dispose() {
    _barcode.dispose();
    _name.dispose();
    _price.dispose();
    _stock.dispose();
    super.dispose();
  }

  Future<void> _lookup() async {
    setState(() {
      _busy = true;
      _error = null;
      _product = null;
    });
    try {
      final lookup = await SmartKasiScope.of(
        context,
      ).api.barcodeLookup(_barcode.text.trim());
      setState(() {
        _product = lookup.product;
        _name.text = lookup.product.name;
      });
    } catch (error) {
      setState(() => _error = error);
    } finally {
      setState(() => _busy = false);
    }
  }

  Future<void> _save() async {
    final api = SmartKasiScope.of(context).api;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final product =
          _product ??
          await api.createProduct({
            'barcode': _barcode.text.trim().isEmpty
                ? null
                : _barcode.text.trim(),
            'name': _name.text.trim(),
          });
      await api.addInventory(widget.shopId, {
        'product_id': product.id,
        'price_cents':
            ((double.tryParse(_price.text.replaceAll(',', '.')) ?? 0) * 100)
                .round(),
        'stock_qty': int.tryParse(_stock.text) ?? 0,
        'low_stock_threshold': 5,
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
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Add inventory item',
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _barcode,
                    decoration: const InputDecoration(labelText: 'Barcode'),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filledTonal(
                  onPressed: _busy ? null : _lookup,
                  icon: const Icon(Icons.search),
                  tooltip: 'Lookup',
                ),
              ],
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _name,
              decoration: const InputDecoration(labelText: 'Product name'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _price,
              decoration: const InputDecoration(labelText: 'Selling price (R)'),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _stock,
              decoration: const InputDecoration(labelText: 'Opening stock'),
              keyboardType: TextInputType.number,
            ),
            if (_error != null) ErrorPanel(error: _error!),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: _busy ? null : _save,
              icon: const Icon(Icons.add),
              label: const Text('Add item'),
            ),
          ],
        ),
      ),
    );
  }
}
