part of '../customer_app.dart';

class _CustomerAccountScreen extends StatelessWidget {
  const _CustomerAccountScreen();

  @override
  Widget build(BuildContext context) {
    final deps = SmartKasiScope.of(context);
    return ResponsiveList(
      children: [
        const ConfigBanner(),
        const AuthPanel(),
        const ThemeModeTile(),
        KasiCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SectionHeader(title: 'Runtime'),
              const SizedBox(height: 8),
              Text('API: ${deps.config.apiBaseUrl}'),
              Text(
                'Supabase: ${deps.config.hasSupabase ? 'configured' : 'missing auth key'}',
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _QtyStepper extends StatelessWidget {
  const _QtyStepper({required this.qty, required this.onChanged});

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
            tooltip: 'Decrease',
            onPressed: () => onChanged(qty - 1),
            icon: const Icon(Icons.remove_circle_outline),
          ),
          SizedBox(width: 24, child: Text('$qty', textAlign: TextAlign.center)),
          IconButton(
            tooltip: 'Increase',
            onPressed: () => onChanged(qty + 1),
            icon: const Icon(Icons.add_circle_outline),
          ),
        ],
      ),
    );
  }
}

class _MoneyRow extends StatelessWidget {
  const _MoneyRow({
    required this.label,
    required this.amount,
    this.strong = false,
  });

  final String label;
  final int amount;
  final bool strong;

  @override
  Widget build(BuildContext context) {
    final style = strong
        ? Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w500)
        : Theme.of(context).textTheme.bodyMedium;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          Expanded(child: Text(label, style: style)),
          Text(zar(amount), style: style),
        ],
      ),
    );
  }
}

List<Widget> _withSpacing(List<Widget> children) {
  final spaced = <Widget>[];
  for (var i = 0; i < children.length; i++) {
    spaced.add(children[i]);
    if (i < children.length - 1) spaced.add(const SizedBox(height: 10));
  }
  return spaced;
}
