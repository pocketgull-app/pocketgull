package com.pocketgull.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import java.util.Calendar

// 📜 Washi Rice Paper Color Scheme
val WashiLightColorScheme = lightColorScheme(
    primary = Color(0xFF0D9488),       // Celadon Bamboo Teal
    onPrimary = Color.White,
    secondary = Color(0xFFD97706),     // Persimmon Amber
    onSecondary = Color.White,
    tertiary = Color(0xFF0284C7),      // Medical Indigo
    background = Color(0xFFFAF8F2),    // Unbleached Mulberry Washi
    surface = Color(0xFFF5F2E9),
    surfaceVariant = Color(0xFFEFEAE1),
    onBackground = Color(0xFF292524),  // Sumi Charcoal Ink
    onSurface = Color(0xFF292524),
    onSurfaceVariant = Color(0xFF78716C),
    outline = Color(0xFFE7E2D6)
)

// 👁️ Obsidian Ophthalmic Color Scheme (WCAG AAA)
val ObsidianDarkColorScheme = darkColorScheme(
    primary = Color(0xFF38BDF8),       // Surgical Clinical Cyan
    onPrimary = Color.Black,
    secondary = Color(0xFF10B981),     // Telemetry Emerald
    onSecondary = Color.Black,
    tertiary = Color(0xFFFBBF24),      // Amber Gold
    background = Color(0xFF09090B),    // Deep Obsidian Void
    surface = Color(0xFF0E0E14),
    surfaceVariant = Color(0xFF14141D),
    onBackground = Color(0xFFF8FAFC),  // Luminous Stark White
    onSurface = Color(0xFFF8FAFC),
    onSurfaceVariant = Color(0xFF94A3B8),
    outline = Color(0xFF1E1E28)
)

/**
 * PocketGull Circadian Composable Theme.
 * Automatically aligns with circadian photopic daylight (07:00 - 18:00) and scotopic nightfall (18:00 - 07:00),
 * or respects system dark mode / manual override.
 */
@Composable
fun PocketGullTheme(
    circadianAuto: Boolean = true,
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val isNightfall = if (circadianAuto) {
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        hour < 7 || hour >= 18
    } else {
        darkTheme
    }

    val colorScheme = if (isNightfall) ObsidianDarkColorScheme else WashiLightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
