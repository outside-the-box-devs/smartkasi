part of '../shop_owner_app.dart';

class _ShopContextGate extends StatelessWidget {
  const _ShopContextGate({
    required this.shop,
    required this.shopFuture,
    required this.childBuilder,
  });

  final Shop? shop;
  final Future<Shop?>? shopFuture;
  final Widget Function(Shop shop) childBuilder;

  @override
  Widget build(BuildContext context) {
    return AuthGate(
      child: shop != null
          ? childBuilder(shop!)
          : FutureSection<Shop?>(
              future: shopFuture ?? Future<Shop?>.value(null),
              builder: (context, loaded) {
                if (loaded != null) return childBuilder(loaded);
                return const ResponsiveList(
                  children: [
                    EmptyState(
                      icon: Icons.add_business,
                      title: 'No shop linked',
                      message: 'Create or link a shop from the account tab.',
                    ),
                  ],
                );
              },
            ),
    );
  }
}
