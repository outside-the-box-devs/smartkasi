part of '../common.dart';

class ScannerPage extends StatefulWidget {
  const ScannerPage({super.key});

  @override
  State<ScannerPage> createState() => _ScannerPageState();
}

class _ScannerPageState extends State<ScannerPage> {
  bool _didReturn = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Scan barcode')),
      body: MobileScanner(
        onDetect: (capture) {
          if (_didReturn) return;
          final value = capture.barcodes
              .map((barcode) => barcode.rawValue)
              .whereType<String>()
              .firstOrNull;
          if (value == null || value.isEmpty) return;
          _didReturn = true;
          Navigator.of(context).pop(value);
        },
      ),
    );
  }
}

extension FirstOrNull<T> on Iterable<T> {
  T? get firstOrNull {
    final iterator = this.iterator;
    return iterator.moveNext() ? iterator.current : null;
  }
}

class ThemeModeTile extends StatelessWidget {
  const ThemeModeTile({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = SmartKasiScope.of(context).theme;
    return KasiCard(
      child: Row(
        children: [
          const Icon(Icons.contrast),
          const SizedBox(width: 12),
          const Expanded(child: Text('Theme')),
          SegmentedButton<ThemeMode>(
            segments: const [
              ButtonSegment(
                value: ThemeMode.system,
                icon: Icon(Icons.phone_android),
                label: Text('Auto'),
              ),
              ButtonSegment(
                value: ThemeMode.light,
                icon: Icon(Icons.light_mode),
                label: Text('Light'),
              ),
              ButtonSegment(
                value: ThemeMode.dark,
                icon: Icon(Icons.dark_mode),
                label: Text('Dark'),
              ),
            ],
            selected: {theme.mode},
            onSelectionChanged: (value) => theme.setMode(value.first),
          ),
        ],
      ),
    );
  }
}
