enum SmartKasiAppKind {
  customer,
  delivery,
  shopOwner;

  String get title => switch (this) {
    SmartKasiAppKind.customer => 'SmartKasi',
    SmartKasiAppKind.delivery => 'SmartKasi Courier',
    SmartKasiAppKind.shopOwner => 'SmartKasi Owner',
  };

  String get roleLabel => switch (this) {
    SmartKasiAppKind.customer => 'customer',
    SmartKasiAppKind.delivery => 'courier',
    SmartKasiAppKind.shopOwner => 'shop owner',
  };

  String get demoEmail => switch (this) {
    SmartKasiAppKind.customer => 'customer@smartkasi.test',
    SmartKasiAppKind.delivery => 'courier@smartkasi.test',
    SmartKasiAppKind.shopOwner => 'thoko@smartkasi.test',
  };
}

class SmartKasiConfig {
  const SmartKasiConfig({
    required this.kind,
    required this.apiBaseUrl,
    required this.supabaseUrl,
    required this.supabaseAnonKey,
    required this.defaultLat,
    required this.defaultLng,
  });

  factory SmartKasiConfig.fromEnvironment(SmartKasiAppKind kind) {
    const apiBaseUrl = String.fromEnvironment(
      'SMARTKASI_API_BASE_URL',
      defaultValue: 'https://api-production-5594.up.railway.app/v1',
    );
    const supabaseUrl = String.fromEnvironment(
      'SUPABASE_URL',
      defaultValue: 'https://wndilblmkkdyzpffmwap.supabase.co',
    );
    const bundledPublishableKey =
        'sb_publishable_l25JMN-9lfGmKwdkJSqUvg_EwJG-wep';
    const supabasePublishableKey = String.fromEnvironment(
      'SUPABASE_PUBLISHABLE_KEY',
    );
    const legacySupabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');
    final supabaseAnonKey = supabasePublishableKey.trim().isNotEmpty
        ? supabasePublishableKey
        : legacySupabaseAnonKey.trim().isNotEmpty
        ? legacySupabaseAnonKey
        : bundledPublishableKey;
    final defaultLat =
        double.tryParse(
          const String.fromEnvironment('SMARTKASI_DEFAULT_LAT'),
        ) ??
        -26.2380;
    final defaultLng =
        double.tryParse(
          const String.fromEnvironment('SMARTKASI_DEFAULT_LNG'),
        ) ??
        27.9083;

    return SmartKasiConfig(
      kind: kind,
      apiBaseUrl: apiBaseUrl,
      supabaseUrl: supabaseUrl,
      supabaseAnonKey: supabaseAnonKey,
      defaultLat: defaultLat,
      defaultLng: defaultLng,
    );
  }

  final SmartKasiAppKind kind;
  final String apiBaseUrl;
  final String supabaseUrl;
  final String supabaseAnonKey;
  final double defaultLat;
  final double defaultLng;

  bool get hasSupabase =>
      supabaseUrl.trim().isNotEmpty && supabaseAnonKey.trim().isNotEmpty;
}
