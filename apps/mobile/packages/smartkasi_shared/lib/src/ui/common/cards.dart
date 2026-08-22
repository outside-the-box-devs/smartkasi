part of '../common.dart';

class KasiCard extends StatelessWidget {
  const KasiCard({
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.color,
    this.borderColor,
    super.key,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final Color? color;
  final Color? borderColor;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: color ?? (isDark ? const Color(0xFF1C1C1E) : Colors.white),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color:
              borderColor ??
              (isDark ? const Color(0xFF2C2C2E) : const Color(0xFFE5E5EA)),
        ),
      ),
      child: Padding(padding: padding, child: child),
    );
  }
}

class SectionHeader extends StatelessWidget {
  const SectionHeader({required this.title, this.trailing, super.key});

  final String title;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w500,
              height: 1.1,
            ),
          ),
        ),
        ?trailing,
      ],
    );
  }
}

class StatTile extends StatelessWidget {
  const StatTile({
    required this.label,
    required this.value,
    required this.icon,
    this.color,
    super.key,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF111820) : const Color(0xFFF3F4F6),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isDark ? const Color(0xFF26313A) : const Color(0xFFE5E7EB),
        ),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: (color ?? scheme.primary).withValues(alpha: 0.12),
            foregroundColor: color ?? scheme.primary,
            child: Icon(icon, size: 19),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: Theme.of(
                    context,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 2),
                Text(label, style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class StatusChip extends StatelessWidget {
  const StatusChip(this.label, {this.color, super.key});

  final String label;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final base = color ?? scheme.secondary;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: base.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label.replaceAll('_', ' '),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(
          color: base,
          fontSize: 12,
          fontWeight: FontWeight.w500,
          height: 1.1,
        ),
      ),
    );
  }
}

class KasiHeroPanel extends StatelessWidget {
  const KasiHeroPanel({
    required this.title,
    required this.subtitle,
    required this.icon,
    this.trailing,
    this.chips = const [],
    super.key,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final Widget? trailing;
  final List<Widget> chips;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;
    final foreground = isDark ? Colors.white : const Color(0xFF111827);
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF121A20) : const Color(0xFFFFF7ED),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isDark ? const Color(0xFF2A343D) : const Color(0xFFFED7AA),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1A1F24) : Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: isDark
                    ? const Color(0xFF2A343D)
                    : const Color(0xFFE5E7EB),
              ),
            ),
            child: Icon(icon, color: scheme.primary, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: theme.textTheme.titleLarge?.copyWith(
                    color: foreground,
                    fontWeight: FontWeight.w500,
                    height: 1.08,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  subtitle,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: isDark
                        ? const Color(0xFFBBC4CE)
                        : const Color(0xFF4B5563),
                    fontWeight: FontWeight.w500,
                  ),
                ),
                if (chips.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Wrap(spacing: 8, runSpacing: 8, children: chips),
                ],
              ],
            ),
          ),
          if (trailing != null) ...[const SizedBox(width: 10), trailing!],
        ],
      ),
    );
  }
}

class KasiPill extends StatelessWidget {
  const KasiPill({
    required this.label,
    this.icon,
    this.color,
    this.selected = false,
    this.onTap,
    super.key,
  });

  final String label;
  final IconData? icon;
  final Color? color;
  final bool selected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final base = color ?? scheme.primary;
    final isDark = theme.brightness == Brightness.dark;
    final background = selected
        ? base
        : base.withValues(alpha: isDark ? 0.18 : 0.10);
    final foreground = selected
        ? (base.computeLuminance() > 0.45
              ? const Color(0xFF1F2937)
              : Colors.white)
        : base;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
        decoration: BoxDecoration(
          color: background,
          borderRadius: BorderRadius.circular(8),
          border: selected
              ? Border.all(color: base)
              : Border.all(color: base.withValues(alpha: 0.16)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 15, color: foreground),
              const SizedBox(width: 6),
            ],
            Text(
              label,
              style: TextStyle(
                color: foreground,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
