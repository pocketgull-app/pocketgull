// SPDX-License-Identifier: Apache-2.0
package com.pocketgull.neurostim.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val StandardDarkScheme = darkColorScheme(
    primary = GorseAmberAccent,
    secondary = CathodeCobaltTeal,
    tertiary = CaledonianEmerald,
    background = PeatObsidian,
    surface = ObsidianSurface,
    onPrimary = PeatObsidian,
    onSecondary = PeatObsidian,
    onBackground = BoneCreamPrimary,
    onSurface = BoneCreamPrimary
)

private val ScotopicNightScheme = darkColorScheme(
    primary = ScotopicRedPrimary,
    secondary = ScotopicAmberSecondary,
    tertiary = ScotopicAmberSecondary,
    background = PeatObsidian,
    surface = ObsidianSurface,
    onPrimary = PeatObsidian,
    onSecondary = PeatObsidian,
    onBackground = ScotopicRedPrimary,
    onSurface = ScotopicRedPrimary
)

@Composable
fun NeuroStimStudioTheme(
    scotopicMode: Boolean = false,
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if (scotopicMode) ScotopicNightScheme else StandardDarkScheme,
        content = content
    )
}
