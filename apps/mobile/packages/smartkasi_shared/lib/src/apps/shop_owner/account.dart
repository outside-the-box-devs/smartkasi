part of '../shop_owner_app.dart';

class _OwnerAccountScreen extends StatefulWidget {
  const _OwnerAccountScreen({required this.shop, required this.onShopChanged});

  final Shop? shop;
  final ValueChanged<Shop> onShopChanged;

  @override
  State<_OwnerAccountScreen> createState() => _OwnerAccountScreenState();
}

class _OwnerAccountScreenState extends State<_OwnerAccountScreen> {
  final _licenceNo = TextEditingController();
  final _licenceUrl = TextEditingController();
  Object? _error;
  bool _busy = false;

  @override
  void dispose() {
    _licenceNo.dispose();
    _licenceUrl.dispose();
    super.dispose();
  }

  Future<void> _submitLicence() async {
    final shop = widget.shop;
    if (shop == null) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final updated = await SmartKasiScope.of(context).api
          .submitLicence(shop.id, {
            'trading_licence_no': _licenceNo.text.trim(),
            'licence_doc_url': _licenceUrl.text.trim(),
          });
      widget.onShopChanged(updated);
    } catch (error) {
      setState(() => _error = error);
    } finally {
      setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ResponsiveList(
      children: [
        const ConfigBanner(),
        const AuthPanel(),
        const ThemeModeTile(),
        if (widget.shop != null)
          KasiCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionHeader(title: 'Trading licence'),
                const SizedBox(height: 8),
                Text(
                  'Current status: ${widget.shop!.licenceStatus ?? widget.shop!.mode}',
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: _licenceNo,
                  decoration: const InputDecoration(
                    labelText: 'Trading licence number',
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: _licenceUrl,
                  decoration: const InputDecoration(
                    labelText: 'Licence document URL',
                  ),
                ),
                if (_error != null) ErrorPanel(error: _error!),
                const SizedBox(height: 12),
                FilledButton.icon(
                  onPressed: _busy ? null : _submitLicence,
                  icon: const Icon(Icons.verified_user),
                  label: const Text('Submit licence'),
                ),
              ],
            ),
          )
        else
          const EmptyState(
            icon: Icons.add_business,
            title: 'Shop onboarding',
            message:
                'Use the backend seed owners for the demo, or create shops through POST /shops when onboarding opens.',
          ),
      ],
    );
  }
}

class _SmallQty extends StatelessWidget {
  const _SmallQty({required this.qty, required this.onChanged});

  final int qty;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 116,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          IconButton(
            onPressed: () => onChanged(qty - 1),
            icon: const Icon(Icons.remove_circle_outline),
          ),
          SizedBox(width: 24, child: Text('$qty', textAlign: TextAlign.center)),
          IconButton(
            onPressed: () => onChanged(qty + 1),
            icon: const Icon(Icons.add_circle_outline),
          ),
        ],
      ),
    );
  }
}
