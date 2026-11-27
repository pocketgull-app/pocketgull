// SPDX-License-Identifier: Apache-2.0
package com.pocketgull.neurostim.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.unit.dp
import com.pocketgull.neurostim.models.CorticalFieldSample
import com.pocketgull.neurostim.models.Eeg1020Site
import com.pocketgull.neurostim.ui.theme.AnodeCoralRed
import com.pocketgull.neurostim.ui.theme.CathodeCobaltTeal
import com.pocketgull.neurostim.ui.theme.GorseAmberAccent
import com.pocketgull.neurostim.ui.theme.ObsidianCard
import com.pocketgull.neurostim.ui.theme.SubtleBorder
import kotlin.math.min

/**
 * Interactive 10-20 International EEG Scalp Topography Canvas.
 * Supports both:
 * 1. tDCS Dipole Montage & Cortical Electric Field Heatmap (Anode -> Cathode)
 * 2. TMS Figure-of-8 Induction Coil Orientation & Focal Induced Field Vector
 */
@Composable
fun ScalpMontageCanvas(
    isTmsMode: Boolean,
    anodeSite: Eeg1020Site,
    cathodeSite: Eeg1020Site,
    tmsTargetSite: Eeg1020Site,
    tmsCoilAngleDeg: Int,
    fieldSamples: List<CorticalFieldSample>,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(270.dp)
            .background(ObsidianCard, RoundedCornerShape(14.dp))
            .border(1.dp, SubtleBorder, RoundedCornerShape(14.dp))
            .padding(8.dp)
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val cx = size.width / 2f
            val cy = size.height / 2f
            val headRadius = min(size.width, size.height) * 0.41f

            // Nasion (anterior nose pointer at top)
            val nasionPath = Path().apply {
                moveTo(cx, cy - headRadius - 16f)
                lineTo(cx - 14f, cy - headRadius + 4f)
                lineTo(cx + 14f, cy - headRadius + 4f)
                close()
            }
            drawPath(nasionPath, color = Color(0xFF473A42))

            // Left & Right Auricular Ears
            drawOval(
                color = Color(0xFF332830),
                topLeft = Offset(cx - headRadius - 12f, cy - 24f),
                size = Size(16f, 48f),
                style = Stroke(width = 3f)
            )
            drawOval(
                color = Color(0xFF332830),
                topLeft = Offset(cx + headRadius - 4f, cy - 24f),
                size = Size(16f, 48f),
                style = Stroke(width = 3f)
            )

            // Outer Cranial Perimeter & 10-20 Inner Ring
            drawCircle(
                color = Color(0xFF120D11),
                radius = headRadius,
                center = Offset(cx, cy)
            )
            drawCircle(
                color = Color(0xFF52434C),
                radius = headRadius,
                center = Offset(cx, cy),
                style = Stroke(width = 3f)
            )
            drawCircle(
                color = Color(0xFF2D232A),
                radius = headRadius * 0.72f,
                center = Offset(cx, cy),
                style = Stroke(width = 1.5f)
            )

            // Longitudinal Fissure (Midline) & Central Sulcus Crosshairs
            drawLine(
                color = Color(0xFF2D232A),
                start = Offset(cx, cy - headRadius),
                end = Offset(cx, cy + headRadius),
                strokeWidth = 1.5f
            )
            drawLine(
                color = Color(0xFF2D232A),
                start = Offset(cx - headRadius, cy),
                end = Offset(cx + headRadius, cy),
                strokeWidth = 1.5f
            )

            if (!isTmsMode) {
                // Render tDCS Cortical Dipole Heatmap
                for (sample in fieldSamples) {
                    val sx = cx + sample.normX * headRadius
                    val sy = cy + sample.normY * headRadius
                    val alpha = (sample.electricFieldMagnitudeVm * 0.42f).coerceIn(0.06f, 0.42f)
                    val tone = if (sample.signedPotentialMv >= 0f) {
                        AnodeCoralRed.copy(alpha = alpha)
                    } else {
                        CathodeCobaltTeal.copy(alpha = alpha)
                    }
                    drawCircle(
                        color = tone,
                        radius = headRadius * 0.14f,
                        center = Offset(sx, sy)
                    )
                }

                // Current-flow dipole vector line from Anode (+) to Cathode (-)
                val ax = cx + anodeSite.normX * headRadius
                val ay = cy + anodeSite.normY * headRadius
                val kx = cx + cathodeSite.normX * headRadius
                val ky = cy + cathodeSite.normY * headRadius
                drawLine(
                    color = GorseAmberAccent.copy(alpha = 0.75f),
                    start = Offset(ax, ay),
                    end = Offset(kx, ky),
                    strokeWidth = 4f,
                    cap = StrokeCap.Round
                )
            } else {
                // Render TMS Figure-of-8 Double-Loop Coil & Induced Cortical E-field Focus
                val tx = cx + tmsTargetSite.normX * headRadius
                val ty = cy + tmsTargetSite.normY * headRadius

                // Focal induced field glow
                drawCircle(
                    color = GorseAmberAccent.copy(alpha = 0.22f),
                    radius = headRadius * 0.34f,
                    center = Offset(tx, ty)
                )
                drawCircle(
                    color = AnodeCoralRed.copy(alpha = 0.32f),
                    radius = headRadius * 0.18f,
                    center = Offset(tx, ty)
                )

                // Rotate Figure-of-8 wings by coilAngleDeg around target site
                rotate(degrees = tmsCoilAngleDeg.toFloat(), pivot = Offset(tx, ty)) {
                    val wingRadius = headRadius * 0.19f
                    drawCircle(
                        color = GorseAmberAccent,
                        radius = wingRadius,
                        center = Offset(tx - wingRadius * 0.92f, ty),
                        style = Stroke(width = 4f)
                    )
                    drawCircle(
                        color = GorseAmberAccent,
                        radius = wingRadius,
                        center = Offset(tx + wingRadius * 0.92f, ty),
                        style = Stroke(width = 4f)
                    )
                    // Induced cortical current vector arrow
                    drawLine(
                        color = Color(0xFFEDE3D2),
                        start = Offset(tx, ty + wingRadius * 0.9f),
                        end = Offset(tx, ty - wingRadius * 0.9f),
                        strokeWidth = 3.5f,
                        cap = StrokeCap.Round
                    )
                }
            }

            // Render all 10-20 EEG Electrode Sites
            val labelPaint = android.graphics.Paint().apply {
                isAntiAlias = true
                textAlign = android.graphics.Paint.Align.CENTER
                textSize = 24f
                typeface = android.graphics.Typeface.DEFAULT_BOLD
            }

            for (site in Eeg1020Site.entries) {
                val x = cx + site.normX * headRadius
                val y = cy + site.normY * headRadius

                val isAnode = !isTmsMode && site == anodeSite
                val isCathode = !isTmsMode && site == cathodeSite
                val isTmsTarget = isTmsMode && site == tmsTargetSite

                val nodeRadius = when {
                    isAnode || isCathode || isTmsTarget -> 22f
                    else -> 13f
                }
                val fillColor = when {
                    isAnode -> AnodeCoralRed
                    isCathode -> CathodeCobaltTeal
                    isTmsTarget -> GorseAmberAccent
                    else -> Color(0xFF281F25)
                }
                val strokeColor = when {
                    isAnode || isCathode || isTmsTarget -> Color(0xFFEDE3D2)
                    else -> Color(0xFF6E5D68)
                }

                drawCircle(
                    color = fillColor,
                    radius = nodeRadius,
                    center = Offset(x, y)
                )
                drawCircle(
                    color = strokeColor,
                    radius = nodeRadius,
                    center = Offset(x, y),
                    style = Stroke(width = 2.2f)
                )

                labelPaint.color = if (isTmsTarget) {
                    android.graphics.Color.parseColor("#0D090B")
                } else {
                    android.graphics.Color.parseColor("#EDE3D2")
                }
                labelPaint.textSize = if (isAnode || isCathode || isTmsTarget) 22f else 17f
                drawContext.canvas.nativeCanvas.drawText(
                    site.code,
                    x,
                    y + 7f,
                    labelPaint
                )
            }
        }
    }
}
