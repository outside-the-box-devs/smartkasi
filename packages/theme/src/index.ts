/**
 * @smartkasi/theme — single source of truth for web (Astryx) + Flutter
 * Web imports the Astryx theme built from tokens.json.
 * Flutter reads tokens.json directly (or the generated Dart file).
 * Do not duplicate colors elsewhere.
 */
export { default as tokens } from './tokens.json';
export { smartkasiTheme, smartkasiPalettes } from './smartkasiTheme';
