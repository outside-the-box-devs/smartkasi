part of '../customer_app.dart';

class _DishBuilderScreen extends StatefulWidget {
  const _DishBuilderScreen();

  @override
  State<_DishBuilderScreen> createState() => _DishBuilderScreenState();
}

class _DishBuilderScreenState extends State<_DishBuilderScreen> {
  final _dish = TextEditingController(text: 'pap and chakalaka');
  int _servings = 4;
  DishBasket? _basket;
  Object? _error;
  bool _busy = false;

  @override
  void dispose() {
    _dish.dispose();
    super.dispose();
  }

  Future<void> _ask() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final basket = await SmartKasiScope.of(
        context,
      ).api.dishIngredients(_dish.text, servings: _servings);
      setState(() => _basket = basket);
    } catch (error) {
      setState(() => _error = error);
    } finally {
      setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AuthGate(
      child: ResponsiveList(
        children: [
          KasiHeroPanel(
            title: 'Meal planner',
            subtitle:
                'Ask for a dish and SmartKasi builds an ingredient basket from nearby shops.',
            icon: Icons.auto_awesome,
            chips: [
              KasiPill(
                label: '$_servings servings',
                icon: Icons.restaurant,
                color: Theme.of(context).colorScheme.secondary,
              ),
            ],
          ),
          KasiCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextField(
                  controller: _dish,
                  decoration: const InputDecoration(labelText: 'Dish'),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    const Text('Servings'),
                    Expanded(
                      child: Slider(
                        min: 1,
                        max: 10,
                        divisions: 9,
                        value: _servings.toDouble(),
                        label: '$_servings',
                        onChanged: (value) =>
                            setState(() => _servings = value.round()),
                      ),
                    ),
                    Text('$_servings'),
                  ],
                ),
                FilledButton.icon(
                  onPressed: _busy ? null : _ask,
                  icon: const Icon(Icons.auto_awesome),
                  label: const Text('Build basket'),
                ),
              ],
            ),
          ),
          if (_error != null) ErrorPanel(error: _error!),
          if (_basket != null)
            KasiCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${_basket!.dish} for ${_basket!.servings}',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text('Estimated total ${zar(_basket!.estimatedTotalCents)}'),
                  const Divider(),
                  for (final item in _basket!.ingredients)
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text(item.name),
                      subtitle: Text(item.quantity),
                      trailing: item.bestOffer == null
                          ? null
                          : Text(
                              zar(item.bestOffer!.priceCents),
                              style: const TextStyle(
                                fontWeight: FontWeight.w500,
                              ),
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
