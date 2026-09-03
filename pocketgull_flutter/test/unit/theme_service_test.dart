import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:pocketgull_flutter/services/theme_service.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  test('ThemeNotifier initialized with default state and modifies values', () async {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    // Default configuration checking
    expect(container.read(themeProvider).currentTheme, AppTheme.light);
    expect(container.read(themeProvider).resolvedBrightness, Brightness.light);

    // Apply change
    container.read(themeProvider.notifier).setTheme(AppTheme.dark);

    expect(container.read(themeProvider).currentTheme, AppTheme.dark);
    expect(container.read(themeProvider).resolvedBrightness, Brightness.dark);

    // Apply Washi theme (Ocular astigmatism high-contrast ergonomics)
    container.read(themeProvider.notifier).setTheme(AppTheme.washi);
    final washiState = container.read(themeProvider);
    expect(washiState.currentTheme, AppTheme.washi);
    expect(washiState.isWashi, isTrue);
    expect(washiState.resolvedBrightness, Brightness.light);
    expect(washiState.themeData.scaffoldBackgroundColor, const Color(0xFFFAF8F0));
    expect(washiState.themeData.colorScheme.onSurface, const Color(0xFF18181B));
  });
}
