import 'package:flutter/material.dart';

const smartKasiOrange = Color(0xFFB7793D);
const smartKasiGreen = Color(0xFF0F766E);
const smartKasiInk = Color(0xFF1F2937);
const smartKasiBlue = Color(0xFF2563EB);
const _smartKasiFontFamily = 'Manrope';

ThemeData smartKasiTheme(Brightness brightness) {
  final isDark = brightness == Brightness.dark;
  final scheme = ColorScheme.fromSeed(
    seedColor: smartKasiOrange,
    brightness: brightness,
    primary: smartKasiOrange,
    secondary: smartKasiGreen,
  );
  final baseTextTheme =
      Typography.material2021(
        platform: TargetPlatform.iOS,
        colorScheme: scheme,
      ).black.apply(
        fontFamily: _smartKasiFontFamily,
        bodyColor: isDark ? const Color(0xFFE8EDF2) : smartKasiInk,
        displayColor: isDark ? Colors.white : smartKasiInk,
      );
  final textTheme = _thinTextTheme(baseTextTheme);

  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    colorScheme: scheme,
    fontFamily: _smartKasiFontFamily,
    scaffoldBackgroundColor: isDark
        ? const Color(0xFF090A0B)
        : const Color(0xFFFAFAFA),
    dividerColor: isDark ? const Color(0xFF2C2C2E) : const Color(0xFFE5E5EA),
    splashFactory: InkSparkle.splashFactory,
    iconTheme: IconThemeData(
      size: 21,
      color: isDark ? const Color(0xFFD9DEE5) : const Color(0xFF374151),
    ),
    textTheme: textTheme,
    appBarTheme: AppBarTheme(
      centerTitle: false,
      elevation: 0,
      backgroundColor: isDark
          ? const Color(0xFF090A0B)
          : const Color(0xFFFAFAFA),
      foregroundColor: isDark ? Colors.white : smartKasiInk,
      surfaceTintColor: Colors.transparent,
    ),
    iconButtonTheme: IconButtonThemeData(
      style: IconButton.styleFrom(
        foregroundColor: isDark ? const Color(0xFFD9DEE5) : smartKasiInk,
        iconSize: 21,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    ),
    cardTheme: CardThemeData(
      elevation: 0,
      margin: EdgeInsets.zero,
      color: isDark ? const Color(0xFF171C20) : Colors.white,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(
          color: isDark ? const Color(0xFF26313A) : const Color(0xFFE5E7EB),
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: isDark ? const Color(0xFF1C1C1E) : const Color(0xFFFFFFFF),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(
          color: isDark ? const Color(0xFF26313A) : const Color(0xFFD1D5DB),
        ),
      ),
    ),
    searchBarTheme: SearchBarThemeData(
      elevation: const WidgetStatePropertyAll(0),
      backgroundColor: WidgetStatePropertyAll(
        isDark ? const Color(0xFF1C1C1E) : const Color(0xFFEDEDF2),
      ),
      surfaceTintColor: const WidgetStatePropertyAll(Colors.transparent),
      shape: WidgetStatePropertyAll(
        RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
      padding: const WidgetStatePropertyAll(
        EdgeInsets.symmetric(horizontal: 12),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        elevation: 0,
        backgroundColor: isDark ? Colors.white : smartKasiInk,
        foregroundColor: isDark ? smartKasiInk : Colors.white,
        minimumSize: const Size(44, 48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: isDark ? Colors.white : smartKasiInk,
        foregroundColor: isDark ? smartKasiInk : Colors.white,
        minimumSize: const Size(44, 48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(44, 48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    ),
    chipTheme: ChipThemeData(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
    ),
    navigationBarTheme: NavigationBarThemeData(
      elevation: 0,
      height: 68,
      backgroundColor: isDark ? const Color(0xFF0C0C0D) : Colors.white,
      surfaceTintColor: Colors.transparent,
      indicatorColor: Colors.transparent,
      indicatorShape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      iconTheme: WidgetStateProperty.resolveWith(
        (states) => IconThemeData(
          color: states.contains(WidgetState.selected)
              ? (isDark ? Colors.white : smartKasiInk)
              : (isDark ? const Color(0xFF8E8E93) : const Color(0xFF6B7280)),
          size: 22,
        ),
      ),
      labelTextStyle: WidgetStateProperty.resolveWith(
        (states) => TextStyle(
          fontSize: 11,
          fontWeight: states.contains(WidgetState.selected)
              ? FontWeight.w500
              : FontWeight.w500,
        ),
      ),
    ),
  );
}

TextTheme _thinTextTheme(TextTheme textTheme) {
  return textTheme.copyWith(
    displayLarge: textTheme.displayLarge?.copyWith(fontWeight: FontWeight.w500),
    displayMedium: textTheme.displayMedium?.copyWith(
      fontWeight: FontWeight.w500,
    ),
    displaySmall: textTheme.displaySmall?.copyWith(fontWeight: FontWeight.w500),
    headlineLarge: textTheme.headlineLarge?.copyWith(
      fontWeight: FontWeight.w500,
    ),
    headlineMedium: textTheme.headlineMedium?.copyWith(
      fontWeight: FontWeight.w500,
    ),
    headlineSmall: textTheme.headlineSmall?.copyWith(
      fontWeight: FontWeight.w500,
    ),
    titleLarge: textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w500),
    titleMedium: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w500),
    titleSmall: textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w500),
    bodyLarge: textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w400),
    bodyMedium: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w400),
    bodySmall: textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w400),
    labelLarge: textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w500),
    labelMedium: textTheme.labelMedium?.copyWith(fontWeight: FontWeight.w500),
    labelSmall: textTheme.labelSmall?.copyWith(fontWeight: FontWeight.w500),
  );
}
