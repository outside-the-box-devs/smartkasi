part of '../delivery_app.dart';

Color _modeColor(BuildContext context, String mode) => switch (mode) {
  'foot' => Theme.of(context).colorScheme.secondary,
  'bicycle' => Theme.of(context).colorScheme.primary,
  'vehicle' => Colors.blue,
  _ => Theme.of(context).colorScheme.primary,
};
