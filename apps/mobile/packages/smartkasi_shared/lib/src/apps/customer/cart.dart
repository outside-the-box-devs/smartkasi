part of '../customer_app.dart';

class _CustomerCartScreen extends StatefulWidget {
  const _CustomerCartScreen();

  @override
  State<_CustomerCartScreen> createState() => _CustomerCartScreenState();
}

class _CustomerCartScreenState extends State<_CustomerCartScreen> {
  String _fulfilmentType = 'delivery';
  Quote? _quote;
  Object? _error;
  bool _busy = false;
  final _address = TextEditingController(text: '77 Mooki St, Orlando East');
  final _notes = TextEditingController(text: 'Blue gate, next to the tuckshop');

  @override
  void dispose() {
    _address.dispose();
    _notes.dispose();
    super.dispose();
  }

  Future<void> _quoteBasket() async {
    final deps = SmartKasiScope.of(context);
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final quote = await deps.api.quote(
        fulfilmentType: _fulfilmentType,
        lines: deps.cart.lines,
        dropoffLat: _fulfilmentType == 'delivery'
            ? deps.config.defaultLat
            : null,
        dropoffLng: _fulfilmentType == 'delivery'
            ? deps.config.defaultLng
            : null,
      );
      setState(() => _quote = quote);
    } catch (error) {
      setState(() => _error = error);
    } finally {
      setState(() => _busy = false);
    }
  }

  Future<void> _placeOrder() async {
    final deps = SmartKasiScope.of(context);
    final quote = _quote;
    if (quote == null) return;
    setState(() => _busy = true);
    try {
      final order = await deps.api.placeOrder(
        quoteId: quote.quoteId,
        dropoffAddress: _fulfilmentType == 'delivery' ? _address.text : null,
        dropoffNotes: _fulfilmentType == 'delivery' ? _notes.text : null,
      );
      deps.cart.clear();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Order ${order.orderNumber} placed')),
      );
      setState(() => _quote = null);
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
      animation: deps.cart,
      builder: (context, _) {
        final lines = deps.cart.lines;
        if (lines.isEmpty) {
          return const ResponsiveList(
            children: [
              EmptyState(
                icon: Icons.shopping_basket_outlined,
                title: 'Your basket is empty',
                message:
                    'Add products from price comparison to build a multi-shop order.',
              ),
            ],
          );
        }

        return ResponsiveList(
          children: [
            KasiHeroPanel(
              title: 'Your basket',
              subtitle:
                  'One checkout can include products from multiple nearby shops.',
              icon: Icons.shopping_basket,
              chips: [
                KasiPill(
                  label: '${deps.cart.count} items',
                  icon: Icons.shopping_basket,
                ),
                KasiPill(
                  label: _fulfilmentType,
                  icon: _fulfilmentType == 'delivery'
                      ? Icons.delivery_dining
                      : Icons.shopping_bag,
                  color: Theme.of(context).colorScheme.secondary,
                ),
              ],
            ),
            if (!deps.auth.isSignedIn) const AuthPanel(),
            KasiCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SegmentedButton<String>(
                    segments: const [
                      ButtonSegment(
                        value: 'delivery',
                        icon: Icon(Icons.delivery_dining),
                        label: Text('Delivery'),
                      ),
                      ButtonSegment(
                        value: 'collection',
                        icon: Icon(Icons.shopping_bag),
                        label: Text('Collect'),
                      ),
                    ],
                    selected: {_fulfilmentType},
                    onSelectionChanged: (value) => setState(() {
                      _fulfilmentType = value.first;
                      _quote = null;
                    }),
                  ),
                  const SizedBox(height: 12),
                  for (final line in lines)
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text(line.product.name),
                      subtitle: Text(
                        '${line.offer.shopName} - ${zar(line.offer.priceCents)} each',
                      ),
                      trailing: _QtyStepper(
                        qty: line.qty,
                        onChanged: (qty) {
                          deps.cart.setQty(line, qty);
                          setState(() => _quote = null);
                        },
                      ),
                    ),
                  const Divider(),
                  _MoneyRow(
                    label: 'Basket subtotal',
                    amount: deps.cart.subtotalCents,
                  ),
                ],
              ),
            ),
            if (_fulfilmentType == 'delivery')
              KasiCard(
                child: Column(
                  children: [
                    TextField(
                      controller: _address,
                      decoration: const InputDecoration(
                        labelText: 'Drop-off address',
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _notes,
                      decoration: const InputDecoration(
                        labelText: 'Drop-off notes',
                      ),
                    ),
                  ],
                ),
              ),
            if (_error != null) ErrorPanel(error: _error!),
            FilledButton.icon(
              onPressed: _busy || !deps.auth.isSignedIn ? null : _quoteBasket,
              icon: const Icon(Icons.price_check),
              label: Text(_busy ? 'Working...' : 'Get final quote'),
            ),
            if (_quote != null)
              _QuoteCard(
                quote: _quote!,
                onPlaceOrder: _busy ? null : _placeOrder,
              ),
          ],
        );
      },
    );
  }
}

class _QuoteCard extends StatelessWidget {
  const _QuoteCard({required this.quote, required this.onPlaceOrder});

  final Quote quote;
  final VoidCallback? onPlaceOrder;

  @override
  Widget build(BuildContext context) {
    return KasiCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SectionHeader(title: 'Final quote'),
          const SizedBox(height: 8),
          for (final leg in quote.legs)
            _MoneyRow(label: leg.shopName, amount: leg.subtotalCents),
          for (final fee in quote.feeBreakdown)
            _MoneyRow(label: fee.label, amount: fee.amountCents),
          const Divider(),
          _MoneyRow(label: 'Total', amount: quote.totalCents, strong: true),
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: onPlaceOrder,
            icon: const Icon(Icons.check_circle),
            label: const Text('Place order'),
          ),
        ],
      ),
    );
  }
}
