// SmartKasi Modern Light — Flutter FLAT theme (no Material)
// Single source: packages/theme/src/tokens.json — teal #0F766E, modern light #FFFFFF
// Flat = no elevation, no Material shadows, crisp borders, solid fills.
import 'package:flutter/material.dart';

class SmartkasiTheme {
  // Core — from tokens.json (modern light-first)
  static const teal = Color(0xFF0F766E);
  static const tealDark = Color(0xFF14B8A6);
  static const bgLight = Color(0xFFFFFFFF); // white
  static const surfaceLight = Color(0xFFFFFFFF);
  static const surfaceDark = Color(0xFF1E293B);
  static const textPrimary = Color(0xFF0F172A);
  static const textSecondary = Color(0xFF64748B);
  static const border = Color(0xFFE2E8F0);
  static const borderEmph = Color(0xFFCBD5E1);

  // Flat light — no useMaterial3, flat widgets
  static ThemeData light = ThemeData(
    useMaterial3: false,
    scaffoldBackgroundColor: bgLight,
    canvasColor: bgLight,
    primaryColor: teal,
    fontFamily: 'Outfit',
    colorScheme: const ColorScheme.light(
      primary: teal,
      secondary: teal,
      surface: surfaceLight,
      background: bgLight,
      error: Color(0xFFEF4444),
      onPrimary: Colors.white,
      onSurface: textPrimary,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: surfaceLight,
      foregroundColor: textPrimary,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(color: textPrimary, fontSize: 18, fontWeight: FontWeight.w600, fontFamily: 'Outfit'),
    ),
    cardTheme: CardThemeData(
      color: surfaceLight,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: border, width: 1),
      ),
      margin: EdgeInsets.zero,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ButtonStyle(
        backgroundColor: const WidgetStatePropertyAll(teal),
        foregroundColor: const WidgetStatePropertyAll(Colors.white),
        elevation: const WidgetStatePropertyAll(0),
        shape: WidgetStatePropertyAll(RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
        padding: const WidgetStatePropertyAll(EdgeInsets.symmetric(horizontal: 16, vertical: 12)),
        textStyle: const WidgetStatePropertyAll(TextStyle(fontWeight: FontWeight.w600, fontFamily: 'Outfit')),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: ButtonStyle(
        foregroundColor: const WidgetStatePropertyAll(teal),
        side: const WidgetStatePropertyAll(BorderSide(color: teal, width: 1.5)),
        elevation: const WidgetStatePropertyAll(0),
        shape: WidgetStatePropertyAll(RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
      ),
    ),
    textButtonTheme: const TextButtonThemeData(
      style: ButtonStyle(foregroundColor: WidgetStatePropertyAll(teal), elevation: WidgetStatePropertyAll(0)),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: border)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: border)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: teal, width: 1.5)),
      labelStyle: const TextStyle(color: textSecondary),
      hintStyle: const TextStyle(color: Color(0xFFCBD5E1)),
    ),
    chipTheme: ChipThemeData(
      backgroundColor: teal.withOpacity(0.1),
      labelStyle: const TextStyle(color: teal, fontWeight: FontWeight.w500),
      side: BorderSide.none,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
      elevation: 0,
      pressElevation: 0,
    ),
    dividerTheme: const DividerThemeData(color: border, thickness: 1, space: 1),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: surfaceLight,
      selectedItemColor: teal,
      unselectedItemColor: textSecondary,
      elevation: 0,
      type: BottomNavigationBarType.fixed,
    ),
    textTheme: const TextTheme(
      displayLarge: TextStyle(color: textPrimary, fontFamily: 'Outfit', fontWeight: FontWeight.w700),
      titleLarge: TextStyle(color: textPrimary, fontFamily: 'Outfit', fontWeight: FontWeight.w600),
      bodyLarge: TextStyle(color: textPrimary, fontFamily: 'Outfit'),
      bodyMedium: TextStyle(color: textPrimary, fontFamily: 'Outfit'),
      labelLarge: TextStyle(color: Colors.white, fontFamily: 'Outfit', fontWeight: FontWeight.w600),
    ),
  );

  static ThemeData dark = ThemeData(
    useMaterial3: false,
    scaffoldBackgroundColor: const Color(0xFF0F172A),
    primaryColor: tealDark,
    fontFamily: 'Outfit',
    colorScheme: const ColorScheme.dark(primary: tealDark, surface: surfaceDark, background: Color(0xFF0F172A)),
    cardTheme: CardThemeData(
      color: surfaceDark,
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Color(0xFF334155))),
    ),
  );

  // Service-fee tint — flat, no gradient
  static Color feeTint(int shopCount, int distanceKm) {
    final intensity = (shopCount * 0.2 + distanceKm * 0.05).clamp(0.0, 1.0);
    return Color.lerp(teal.withOpacity(0.08), teal, intensity)!;
  }

  // Flat helpers — no shadows, solid borders
  static BoxDecoration flatCard = BoxDecoration(
    color: surfaceLight,
    borderRadius: BorderRadius.circular(12),
    border: Border.all(color: border, width: 1),
  );

  static BoxDecoration flatCardPressed = BoxDecoration(
    color: const Color(0xFFF1F5F9),
    borderRadius: BorderRadius.circular(12),
    border: Border.all(color: borderEmph, width: 1),
  );
}
