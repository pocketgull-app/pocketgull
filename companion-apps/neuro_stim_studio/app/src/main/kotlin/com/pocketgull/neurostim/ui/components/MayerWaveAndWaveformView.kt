// SPDX-License-Identifier: Apache-2.0
package com.pocketgull.neurostim.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Slider
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pocketgull.neurostim.engine.HeadphoneMeditationPreset
import com.pocketgull.neurostim.engine.NeuroEntrainmentSynthesizer
import com.pocketgull.neurostim.ui.theme.CaledonianEmerald
import com.pocketgull.neurostim.ui.theme.CathodeCobaltTeal
import com.pocketgull.neurostim.ui.theme.GorseAmberAccent
import com.pocketgull.neurostim.ui.theme.MutedStone
import com.pocketgull.neurostim.ui.theme.ObsidianCard
import com.pocketgull.neurostim.ui.theme.ObsidianSurface
import com.pocketgull.neurostim.ui.theme.SubtleBorder
import com.pocketgull.neurostim.ui.theme.WarmSepiaSecondary
import kotlinx.coroutines.delay
import kotlin.math.roundToInt

/**
 * Renders the biphasic dB/dt magnetic pulse train oscilloscope waveform for rTMS / iTBS.
 */
@Composable
fun TmsPulseOscilloscopeView(
    samples: List<Float>,
    protocolLabel: String,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(ObsidianCard, RoundedCornerShape(12.dp))
            .border(1.dp, SubtleBorder, RoundedCornerShape(12.dp))
            .padding(12.dp)
    ) {
        Text(
            text = "Biphasic dB/dt Pulse Train Oscilloscope • $protocolLabel",
            color = WarmSepiaSecondary,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold
        )
        Spacer(modifier = Modifier.height(6.dp))
        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .height(84.dp)
        ) {
            val midY = size.height / 2f
            drawLine(
                color = SubtleBorder,
                start = Offset(0f, midY),
                end = Offset(size.width, midY),
                strokeWidth = 1.5f
            )
            if (samples.size >= 2) {
                val path = Path()
                val stepX = size.width / (samples.size - 1).toFloat()
                samples.forEachIndexed { idx, v ->
                    val x = idx * stepX
                    val y = midY - (v.coerceIn(-1f, 1f) * (size.height * 0.42f))
                    if (idx == 0) path.moveTo(x, y) else path.lineTo(x, y)
                }
                drawPath(
                    path = path,
                    color = GorseAmberAccent,
                    style = Stroke(width = 3f)
                )
            }
        }
    }
}

/**
 * Hemi-Sync + Headspace-Style Sony MDR-V6 Reference Stereo Headphone Meditation Studio
 * + 0.1 Hz Mayer Wave Respiratory Pacer (WCAG 2.2 §2.3.3).
 */
@Composable
fun MayerWavePacerCard(
    reducedMotion: Boolean,
    onToggleReducedMotion: (Boolean) -> Unit,
    selectedPreset: HeadphoneMeditationPreset,
    isPlayingAudio: Boolean,
    masterVolume: Float,
    pinkNoiseSurfLevel: Float,
    ffrGlideEnabled: Boolean,
    breathSwellEnabled: Boolean,
    mdrV6CalibrationEnabled: Boolean,
    voiceCoachEnabled: Boolean,
    onSelectPreset: (HeadphoneMeditationPreset) -> Unit,
    onTogglePlayAudio: () -> Unit,
    onVolumeChange: (Float) -> Unit,
    onPinkNoiseSurfChange: (Float) -> Unit,
    onToggleFfrGlide: (Boolean) -> Unit,
    onToggleBreathSwell: (Boolean) -> Unit,
    onToggleMdrV6Calibration: (Boolean) -> Unit,
    onToggleVoiceCoach: (Boolean) -> Unit,
    onSpeakPrompt: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var elapsedMs by remember { mutableLongStateOf(0L) }
    var meditationSec by remember { mutableIntStateOf(0) }
    var lastSpokenAct by remember { mutableIntStateOf(0) }

    LaunchedEffect(reducedMotion) {
        if (!reducedMotion) {
            val start = System.currentTimeMillis()
            while (true) {
                elapsedMs = (System.currentTimeMillis() - start) % 10_000L
                delay(100L)
            }
        }
    }

    LaunchedEffect(isPlayingAudio, selectedPreset, voiceCoachEnabled) {
        if (!isPlayingAudio) {
            meditationSec = 0
            lastSpokenAct = 0
            return@LaunchedEffect
        }
        while (isPlayingAudio) {
            val currentAct = when {
                meditationSec < 45 -> 1
                meditationSec < 180 -> 2
                else -> 3
            }
            if (voiceCoachEnabled && currentAct != lastSpokenAct) {
                lastSpokenAct = currentAct
                val prompt = when (currentAct) {
                    1 -> selectedPreset.act1ArrivalPrompt
                    2 -> selectedPreset.act2EntrainmentPrompt
                    else -> selectedPreset.act3IntegrationPrompt
                }
                onSpeakPrompt(prompt)
            }
            delay(1000L)
            meditationSec += 1
        }
    }

    val cycleSeconds = (elapsedMs / 1000f)
    val isInhale = cycleSeconds < 4.0f
    val phaseProgress = if (reducedMotion) {
        0.5f
    } else if (isInhale) {
        (cycleSeconds / 4.0f).coerceIn(0f, 1f)
    } else {
        (1.0f - ((cycleSeconds - 4.0f) / 6.0f)).coerceIn(0f, 1f)
    }

    val activeActPrompt = when {
        meditationSec < 45 -> selectedPreset.act1ArrivalPrompt
        meditationSec < 180 -> selectedPreset.act2EntrainmentPrompt
        else -> selectedPreset.act3IntegrationPrompt
    }

    val instantaneousBeatHz = NeuroEntrainmentSynthesizer.computeFfrBeatHz(
        startBridgeHz = selectedPreset.startBridgeHz,
        targetBeatHz = selectedPreset.beatFrequencyHz,
        elapsedSeconds = meditationSec.toDouble(),
        rampDurationSec = 90.0,
        ffrGlideEnabled = ffrGlideEnabled
    )

    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(ObsidianCard, RoundedCornerShape(12.dp))
            .border(1.dp, SubtleBorder, RoundedCornerShape(12.dp))
            .padding(14.dp)
    ) {
        // 1. 0.1 Hz Mayer Wave Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "0.1 Hz Mayer Wave Breath Pacer (WCAG 2.2 §2.3.3)",
                    color = MaterialTheme.colorScheme.onSurface,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = if (reducedMotion) {
                        "Reduced-Motion Static Hold Active (4.0s Inhale / 6.0s Exhale)"
                    } else if (isInhale) {
                        "INHALE (4.0s Vagal Up-Stroke) • ${"%.1f".format(cycleSeconds)}s"
                    } else {
                        "EXHALE (6.0s Resonant Hum / Downshift) • ${"%.1f".format(cycleSeconds)}s"
                    },
                    color = if (isInhale) CathodeCobaltTeal else CaledonianEmerald,
                    fontSize = 12.sp
                )
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Static", color = MutedStone, fontSize = 11.sp, modifier = Modifier.padding(end = 6.dp))
                Switch(checked = reducedMotion, onCheckedChange = onToggleReducedMotion)
            }
        }

        Spacer(modifier = Modifier.height(8.dp))
        LinearProgressIndicator(
            progress = { phaseProgress },
            modifier = Modifier
                .fillMaxWidth()
                .height(10.dp),
            color = if (isInhale) CathodeCobaltTeal else CaledonianEmerald,
            trackColor = SubtleBorder
        )

        Spacer(modifier = Modifier.height(14.dp))

        // 2. Sony MDR-V6 Hemi-Sync Tri-Octave Studio Header
        Text(
            text = "Sony MDR-V6 • Hemi-Sync Tri-Octave Studio",
            color = MaterialTheme.colorScheme.onSurface,
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "40mm Samarium-Cobalt • 63Ω • Tri-Carrier Stack (100/200/300 Hz) + 1/f Pink Surf:",
            color = GorseAmberAccent,
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold
        )
        Spacer(modifier = Modifier.height(8.dp))

        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            HeadphoneMeditationPreset.entries.forEach { preset ->
                val isSelected = preset == selectedPreset
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            if (isSelected) Color(0xFF2B2028) else ObsidianSurface,
                            RoundedCornerShape(10.dp)
                        )
                        .border(
                            1.dp,
                            if (isSelected) GorseAmberAccent else SubtleBorder,
                            RoundedCornerShape(10.dp)
                        )
                        .clickable { onSelectPreset(preset) }
                        .padding(10.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = preset.title,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Δf1:${preset.beatFrequencyHz} / Δf2:${preset.secondaryBeatHz} Hz",
                                fontSize = 10.sp,
                                color = GorseAmberAccent,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                        Text(
                            text = "${preset.subtitle} • ${preset.corticalTarget}",
                            fontSize = 11.sp,
                            color = WarmSepiaSecondary
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // 3. Active Three-Acts Guided Meditation & Live FFR Beat Readout Card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(ObsidianSurface, RoundedCornerShape(10.dp))
                .border(1.dp, GorseAmberAccent.copy(alpha = 0.6f), RoundedCornerShape(10.dp))
                .padding(12.dp)
        ) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = if (isPlayingAudio) {
                            "HEMI-SYNC ACTIVE • ${meditationSec / 60}:${"%02d".format(meditationSec % 60)}"
                        } else {
                            "THREE-ACTS HEMI-SYNC GUIDE • READY"
                        },
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isPlayingAudio) CaledonianEmerald else GorseAmberAccent
                    )
                    Text(
                        text = "FFR Carrier: ${"%.2f".format(instantaneousBeatHz)} Hz + ${selectedPreset.secondaryBeatHz} Hz",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = CathodeCobaltTeal
                    )
                }
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = activeActPrompt,
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurface,
                    lineHeight = 18.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // 4. Play / Stop & MDR-V6 Hemi-Sync Mixer Controls
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Button(
                onClick = onTogglePlayAudio,
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isPlayingAudio) CaledonianEmerald else GorseAmberAccent
                )
            ) {
                Text(
                    text = if (isPlayingAudio) "Stop Hemi-Sync Session" else "Begin Hemi-Sync (MDR-V6)",
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp
                )
            }
            OutlinedButton(
                onClick = { onSpeakPrompt(activeActPrompt) }
            ) {
                Text("Speak Cue", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface)
            }
        }

        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "MDR-V6 Master Output (63Ω / 106 dB/mW): ${(masterVolume * 100).roundToInt()}%",
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurface
        )
        Slider(
            value = masterVolume,
            onValueChange = onVolumeChange,
            valueRange = 0.10f..1.0f
        )

        Text(
            text = "1/f Pink Noise \"Ocean Surf\" Masking Bed: ${(pinkNoiseSurfLevel * 100).roundToInt()}%",
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurface
        )
        Slider(
            value = pinkNoiseSurfLevel,
            onValueChange = onPinkNoiseSurfChange,
            valueRange = 0.0f..0.80f
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "FFR 90s Progressive Bridge Glide (${selectedPreset.startBridgeHz} -> ${selectedPreset.beatFrequencyHz} Hz)",
                fontSize = 12.sp,
                color = WarmSepiaSecondary
            )
            Switch(checked = ffrGlideEnabled, onCheckedChange = onToggleFfrGlide)
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Sony MDR-V6 Voicing (+3.5 dB 54–108 Hz Sub-Bass Cushion)",
                fontSize = 12.sp,
                color = WarmSepiaSecondary
            )
            Switch(checked = mdrV6CalibrationEnabled, onCheckedChange = onToggleMdrV6Calibration)
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "0.1 Hz Breath Volume Swell",
                fontSize = 12.sp,
                color = WarmSepiaSecondary
            )
            Switch(checked = breathSwellEnabled, onCheckedChange = onToggleBreathSwell)
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Eyes-Closed Voice Coach (Spoken Act Cues)",
                fontSize = 12.sp,
                color = WarmSepiaSecondary
            )
            Switch(checked = voiceCoachEnabled, onCheckedChange = onToggleVoiceCoach)
        }
    }
}
