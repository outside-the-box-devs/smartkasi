part of '../shop_owner_app.dart';

class _InventoryScreen extends StatefulWidget {
  const _InventoryScreen({required this.shop});

  final Shop shop;

  @override
  State<_InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<_InventoryScreen> {
  final _search = TextEditingController();
  bool _lowOnly = false;
  late Future<List<InventoryItem>> _future;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _load();
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  void _load() {
    _future = SmartKasiScope.of(
      context,
    ).api.inventory(widget.shop.id, q: _search.text, lowStock: _lowOnly);
  }

  Future<void> _edit(InventoryItem item) async {
    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (_) => _InventoryEditSheet(shopId: widget.shop.id, item: item),
    );
    if (saved == true) setState(_load);
  }

  Future<void> _add() async {
    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (_) => _InventoryAddSheet(shopId: widget.shop.id),
    );
    if (saved == true) setState(_load);
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
            title: 'Stock room',
            subtitle:
                'Keep shelves visible online, catch low stock early, and update prices by product.',
            icon: Icons.inventory_2,
            chips: [
              KasiPill(
                label: _lowOnly ? 'Low stock only' : 'All stock',
                icon: Icons.warning_amber,
                selected: _lowOnly,
                color: _lowOnly
                    ? Theme.of(context).colorScheme.error
                    : Theme.of(context).colorScheme.secondary,
                onTap: () => setState(() {
                  _lowOnly = !_lowOnly;
                  _load();
                }),
              ),
            ],
          ),
          KasiCard(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _search,
                    decoration: const InputDecoration(
                      prefixIcon: Icon(Icons.search),
                      labelText: 'Search inventory',
                    ),
                    onSubmitted: (_) => setState(_load),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filledTonal(
                  tooltip: 'Low stock only',
                  onPressed: () => setState(() {
                    _lowOnly = !_lowOnly;
                    _load();
                  }),
                  icon: Icon(
                    _lowOnly ? Icons.warning : Icons.warning_amber_outlined,
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  tooltip: 'Add item',
                  onPressed: _add,
                  icon: const Icon(Icons.add),
                ),
              ],
            ),
          ),
          FutureSection<List<InventoryItem>>(
            future: _future,
            builder: (context, items) {
              if (items.isEmpty) {
                return const EmptyState(
                  icon: Icons.inventory_2_outlined,
                  title: 'No stock lines',
                  message: 'Add products by barcode or product search.',
                );
              }
              return Column(
                children: [
                  for (final item in items) ...[
                    KasiCard(
                      child: ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(item.product.name),
                        subtitle: Text(
                          '${item.stockQty} in stock - threshold ${item.lowStockThreshold}',
                        ),
                        leading: Icon(
                          item.isLowStock
                              ? Icons.warning_amber
                              : Icons.inventory_2,
                        ),
                        trailing: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              zar(item.priceCents),
                              style: const TextStyle(
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            Text(item.isAvailable ? 'available' : 'hidden'),
                          ],
                        ),
                        onTap: () => _edit(item),
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
