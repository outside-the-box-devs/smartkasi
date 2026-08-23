import 'dart:async';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'api.dart';
import 'apps/customer_app.dart';
import 'apps/delivery_app.dart';
import 'apps/shop_owner_app.dart';
import 'config.dart';
import 'controllers.dart';
import 'theme.dart';

Future<void> runSmartKasiMobileApp(SmartKasiAppKind kind) async {
  WidgetsFlutterBinding.ensureInitialized();

  final config = SmartKasiConfig.fromEnvironment(kind);
  final prefs = await SharedPreferences.getInstance();

  if (config.hasSupabase) {
    await Supabase.initialize(
      url: config.supabaseUrl,
      publishableKey: config.supabaseAnonKey,
    );
  }

  runApp(SmartKasiApp(config: config, prefs: prefs));
}

class SmartKasiApp extends StatefulWidget {
  const SmartKasiApp({required this.config, required this.prefs, super.key});

  final SmartKasiConfig config;
  final SharedPreferences prefs;

  @override
  State<SmartKasiApp> createState() => _SmartKasiAppState();
}

class _SmartKasiAppState extends State<SmartKasiApp> {
  late final ThemeController _theme;
  late final AuthController _auth;
  late final SmartKasiApi _api;
  late final SmartKasiDependencies _dependencies;

  @override
  void initState() {
    super.initState();
    _theme = ThemeController(widget.prefs)..addListener(_onControllerChanged);
    _auth = AuthController(config: widget.config)
      ..addListener(_onControllerChanged);
    _api = SmartKasiApi(
      config: widget.config,
      accessTokenProvider: _auth.accessToken,
      refreshToken: _auth.refreshToken,
    );
    _auth.attachApi(_api);
    _dependencies = SmartKasiDependencies(
      config: widget.config,
      api: _api,
      auth: _auth,
      theme: _theme,
      cart: CartController(),
      posCart: PosCartController(),
      offlineSales: OfflineSaleQueue(widget.prefs),
    );
    unawaited(_auth.restore());
  }

  void _onControllerChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _theme.removeListener(_onControllerChanged);
    _auth.removeListener(_onControllerChanged);
    _theme.dispose();
    _auth.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SmartKasiScope(
      dependencies: _dependencies,
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: widget.config.kind.title,
        theme: smartKasiTheme(Brightness.light),
        darkTheme: smartKasiTheme(Brightness.dark),
        themeMode: _theme.mode,
        home: switch (widget.config.kind) {
          SmartKasiAppKind.customer => const CustomerApplication(),
          SmartKasiAppKind.delivery => const DeliveryApplication(),
          SmartKasiAppKind.shopOwner => const ShopOwnerApplication(),
        },
      ),
    );
  }
}
