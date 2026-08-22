part of '../delivery_app.dart';

class _CourierAccountScreen extends StatelessWidget {
  const _CourierAccountScreen();

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
              const SectionHeader(title: 'Safety model'),
              const SizedBox(height: 8),
              const Text(
                'Customer screens never get route geometry or live courier coordinates. Courier screens may show pickup and drop-off addresses.',
              ),
              const SizedBox(height: 8),
              Text('API: ${deps.config.apiBaseUrl}'),
            ],
          ),
        ),
      ],
    );
  }
}
