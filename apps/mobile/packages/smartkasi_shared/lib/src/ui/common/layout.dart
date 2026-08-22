part of '../common.dart';

class AppPage extends StatelessWidget {
  const AppPage({
    required this.title,
    required this.child,
    this.subtitle,
    this.leadingIcon,
    this.showHeader = true,
    this.actions = const [],
    this.bottomNavigationBar,
    super.key,
  });

  final String title;
  final Widget child;
  final String? subtitle;
  final IconData? leadingIcon;
  final bool showHeader;
  final List<Widget> actions;
  final Widget? bottomNavigationBar;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;
    return Scaffold(
      bottomNavigationBar: bottomNavigationBar,
      body: SafeArea(
        child: Column(
          children: [
            if (showHeader)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 10, 10, 8),
                child: Row(
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: isDark
                            ? const Color(0xFF15181B)
                            : const Color(0xFFF1F2F4),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isDark
                              ? const Color(0xFF252B31)
                              : const Color(0xFFE4E6EA),
                        ),
                      ),
                      child: Icon(
                        leadingIcon ?? Icons.storefront,
                        color: scheme.primary,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w500,
                              height: 1.05,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            subtitle ?? 'Fast local commerce',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: isDark
                                  ? const Color(0xFF9CA8B4)
                                  : const Color(0xFF5F6B73),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                    ...actions.map(
                      (action) => Padding(
                        padding: const EdgeInsets.only(left: 2),
                        child: action,
                      ),
                    ),
                  ],
                ),
              ),
            Expanded(child: child),
          ],
        ),
      ),
    );
  }
}

class ResponsiveList extends StatelessWidget {
  const ResponsiveList({required this.children, this.padding, super.key});

  final List<Widget> children;
  final EdgeInsetsGeometry? padding;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final maxWidth = constraints.maxWidth > 720
            ? 720.0
            : constraints.maxWidth;
        return ListView(
          padding: padding ?? const EdgeInsets.fromLTRB(16, 8, 16, 18),
          children: [
            Align(
              alignment: Alignment.topCenter,
              child: SizedBox(
                width: maxWidth,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: _withGaps(children),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

List<Widget> _withGaps(List<Widget> children) {
  final result = <Widget>[];
  for (var i = 0; i < children.length; i++) {
    result.add(children[i]);
    if (i != children.length - 1) result.add(const SizedBox(height: 12));
  }
  return result;
}
