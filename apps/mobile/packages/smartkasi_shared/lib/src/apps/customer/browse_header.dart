part of '../customer_app.dart';

class _BrowseHeaderDelegate extends SliverPersistentHeaderDelegate {
  const _BrowseHeaderDelegate({
    required this.controller,
    required this.onSubmitted,
    required this.onClear,
    required this.onToggleTheme,
  });

  final TextEditingController controller;
  final ValueChanged<String> onSubmitted;
  final VoidCallback onClear;
  final VoidCallback onToggleTheme;

  @override
  double get minExtent => 64;

  @override
  double get maxExtent => 150;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    final progress = (shrinkOffset / (maxExtent - minExtent)).clamp(0.0, 1.0);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final muted = isDark ? const Color(0xFF9BA3AF) : const Color(0xFF6B7280);
    final ink = isDark ? Colors.white : const Color(0xFF111827);
    final searchTop = 86 - (78 * progress);
    final locationOpacity = (1 - (progress * 1.6)).clamp(0.0, 1.0);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
        border: Border(
          bottom: BorderSide(
            color: overlapsContent
                ? (isDark ? const Color(0xFF202327) : const Color(0xFFE5E7EB))
                : Colors.transparent,
          ),
        ),
      ),
      child: Stack(
        fit: StackFit.expand,
        children: [
          Positioned(
            left: 16,
            right: 16,
            top: 10 - (22 * progress),
            child: IgnorePointer(
              ignoring: locationOpacity < 0.2,
              child: Opacity(
                opacity: locationOpacity,
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Delivery to',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: muted,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              Flexible(
                                child: Text(
                                  'Soweto, 2.5 km radius',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: theme.textTheme.titleMedium?.copyWith(
                                    color: ink,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 4),
                              Icon(
                                CupertinoIcons.chevron_down,
                                color: muted,
                                size: 15,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    _HeaderIconButton(
                      tooltip: 'Toggle theme',
                      icon: CupertinoIcons.moon,
                      onPressed: onToggleTheme,
                    ),
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            left: 16,
            right: 16,
            top: searchTop,
            child: _BrowseSearchField(
              controller: controller,
              onSubmitted: onSubmitted,
              onClear: onClear,
            ),
          ),
        ],
      ),
    );
  }

  @override
  bool shouldRebuild(covariant _BrowseHeaderDelegate oldDelegate) {
    return controller != oldDelegate.controller ||
        onSubmitted != oldDelegate.onSubmitted ||
        onClear != oldDelegate.onClear ||
        onToggleTheme != oldDelegate.onToggleTheme;
  }
}

class _BrowseSearchField extends StatelessWidget {
  const _BrowseSearchField({
    required this.controller,
    required this.onSubmitted,
    required this.onClear,
  });

  final TextEditingController controller;
  final ValueChanged<String> onSubmitted;
  final VoidCallback onClear;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final fill = isDark ? const Color(0xFF151719) : const Color(0xFFF1F2F4);
    final muted = isDark ? const Color(0xFF9BA3AF) : const Color(0xFF6B7280);
    final hasQuery = controller.text.trim().isNotEmpty;
    return Container(
      height: 48,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: fill,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isDark ? const Color(0xFF24282D) : const Color(0xFFE5E7EB),
        ),
      ),
      child: Row(
        children: [
          Icon(CupertinoIcons.search, color: muted, size: 19),
          const SizedBox(width: 8),
          Expanded(
            child: TextField(
              controller: controller,
              textInputAction: TextInputAction.search,
              onSubmitted: onSubmitted,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w400,
              ),
              decoration: const InputDecoration(
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                filled: false,
                hintText: 'Search SmartKasi',
                contentPadding: EdgeInsets.zero,
              ),
            ),
          ),
          if (hasQuery)
            IconButton(
              tooltip: 'Clear search',
              onPressed: onClear,
              iconSize: 18,
              icon: const Icon(CupertinoIcons.clear),
            ),
        ],
      ),
    );
  }
}

class _HeaderIconButton extends StatelessWidget {
  const _HeaderIconButton({
    required this.tooltip,
    required this.icon,
    required this.onPressed,
  });

  final String tooltip;
  final IconData icon;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return SizedBox(
      width: 42,
      height: 42,
      child: IconButton(
        tooltip: tooltip,
        onPressed: onPressed,
        style: IconButton.styleFrom(
          backgroundColor: isDark
              ? const Color(0xFF151719)
              : const Color(0xFFF1F2F4),
          foregroundColor: isDark
              ? const Color(0xFFE5E5EA)
              : const Color(0xFF374151),
          iconSize: 19,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        icon: Icon(icon),
      ),
    );
  }
}

class _BrowseSectionBreak extends StatelessWidget {
  const _BrowseSectionBreak();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14),
      child: Divider(
        height: 1,
        thickness: 1,
        color: isDark ? const Color(0xFF202327) : const Color(0xFFE5E7EB),
      ),
    );
  }
}

class _MenuOption<T> {
  const _MenuOption({
    required this.value,
    required this.label,
    required this.icon,
  });

  final T value;
  final String label;
  final IconData icon;
}

class _BrowseControls<S, F> extends StatelessWidget {
  const _BrowseControls({
    required this.sortTooltip,
    required this.filterTooltip,
    required this.sortValue,
    required this.filterValue,
    required this.sortOptions,
    required this.filterOptions,
    required this.onSortChanged,
    required this.onFilterChanged,
    required this.isSortActive,
    required this.isFilterActive,
  });

  final String sortTooltip;
  final String filterTooltip;
  final S sortValue;
  final F filterValue;
  final List<_MenuOption<S>> sortOptions;
  final List<_MenuOption<F>> filterOptions;
  final ValueChanged<S> onSortChanged;
  final ValueChanged<F> onFilterChanged;
  final bool isSortActive;
  final bool isFilterActive;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _BrowseMenuButton<S>(
          tooltip: sortTooltip,
          icon: CupertinoIcons.arrow_up_arrow_down,
          value: sortValue,
          options: sortOptions,
          active: isSortActive,
          onSelected: onSortChanged,
        ),
        const SizedBox(width: 4),
        _BrowseMenuButton<F>(
          tooltip: filterTooltip,
          icon: CupertinoIcons.slider_horizontal_3,
          value: filterValue,
          options: filterOptions,
          active: isFilterActive,
          onSelected: onFilterChanged,
        ),
      ],
    );
  }
}

class _BrowseMenuButton<T> extends StatelessWidget {
  const _BrowseMenuButton({
    required this.tooltip,
    required this.icon,
    required this.value,
    required this.options,
    required this.active,
    required this.onSelected,
  });

  final String tooltip;
  final IconData icon;
  final T value;
  final List<_MenuOption<T>> options;
  final bool active;
  final ValueChanged<T> onSelected;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;
    return PopupMenuButton<T>(
      tooltip: tooltip,
      onSelected: onSelected,
      position: PopupMenuPosition.under,
      padding: EdgeInsets.zero,
      color: isDark ? const Color(0xFF1C1C1E) : Colors.white,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      constraints: const BoxConstraints(minWidth: 190),
      itemBuilder: (context) => [
        for (final option in options)
          PopupMenuItem<T>(
            value: option.value,
            child: Row(
              children: [
                Icon(
                  option.icon,
                  size: 17,
                  color: option.value == value ? scheme.primary : null,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    option.label,
                    style: TextStyle(
                      fontWeight: option.value == value
                          ? FontWeight.w500
                          : FontWeight.w400,
                    ),
                  ),
                ),
                if (option.value == value)
                  Icon(
                    CupertinoIcons.check_mark,
                    size: 16,
                    color: scheme.primary,
                  ),
              ],
            ),
          ),
      ],
      child: Container(
        width: 34,
        height: 34,
        decoration: BoxDecoration(
          color: active
              ? scheme.primary.withValues(alpha: 0.12)
              : (isDark ? const Color(0xFF151719) : const Color(0xFFF1F2F4)),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: active
                ? scheme.primary.withValues(alpha: 0.35)
                : (isDark ? const Color(0xFF24282D) : const Color(0xFFE5E7EB)),
          ),
        ),
        child: Icon(icon, size: 17, color: active ? scheme.primary : null),
      ),
    );
  }
}
