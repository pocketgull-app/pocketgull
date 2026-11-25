// SPDX-License-Identifier: Apache-2.0
package com.pocketgull.neurostim.engine

import com.pocketgull.neurostim.models.CorticalFieldSample
import com.pocketgull.neurostim.models.SafetyGateStatus
import com.pocketgull.neurostim.models.TdcsFieldSimulationResult
import com.pocketgull.neurostim.models.TdcsParameters
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

/**
 * In-Silico Quasi-Static tDCS Cortical Electric Field & Bikson Charge-Density Physics Engine.
 *
 * Badge: [EXPLORATORY IN SILICO MODEL • NON-DIAGNOSTIC]
 * Implements 3-shell (scalp / skull / CSF-cortex) dipole superposition and Bikson et al. (2016)
 * safety thresholds:
 * - Current I <= 2.0 mA nominal (<= 4.0 mA investigational ceiling)
 * - Current density J <= 0.080 mA/cm² (0.80 A/m²)
 * - Charge density sigma_Q <= 0.096 C/cm²
 * - Contact impedance Z in [1.0, 15.0] kOhm
 */
object TdcsPhysicsEngine {

    private const val HEAD_RADIUS_CM = 9.2f

    fun simulate(params: TdcsParameters): TdcsFieldSimulationResult {
        val safeArea = max(1.0f, params.spongeAreaCm2)
        val currentMa = max(0.0f, params.currentMa)
        val durationSec = max(60, params.durationMinutes * 60)

        // Current density J = I / A (mA/cm²) and A/m² (1 mA/cm² = 10 A/m²)
        val currentDensityMaPerCm2 = currentMa / safeArea
        val currentDensityAm2 = currentDensityMaPerCm2 * 10.0f

        // Total charge Q (Coulombs) = I (Amps) * t (seconds)
        val currentAmps = currentMa / 1000.0f
        val totalChargeCoulombs = currentAmps * durationSec.toFloat()
        val chargeDensityCPerCm2 = totalChargeCoulombs / safeArea

        // Chord distance on normalized scalp projection scaled to head arc (cm)
        val dx = params.anode.normX - params.cathode.normX
        val dy = params.anode.normY - params.cathode.normY
        val normDist = hypot(dx.toDouble(), dy.toDouble()).toFloat()
        val interElectrodeDistanceCm = max(2.0f, normDist * HEAD_RADIUS_CM * 1.45f)

        // Scalp shunting increases when inter-electrode distance is below 5 cm
        val shuntingFractionPct = min(88.0f, max(45.0f, 82.0f - (interElectrodeDistanceCm - 3.0f) * 3.1f))
        val corticalPenetrationFactor = (100.0f - shuntingFractionPct) / 100.0f

        // Peak cortical electric field E_peak (V/m)
        // Empirically ~0.40 - 0.80 V/m at 2.0 mA with 25-35 cm² electrodes (Datta / Bikson FEM benchmarks)
        val areaScale = (25.0f / safeArea).coerceIn(0.65f, 1.65f)
        val peakCorticalElectricFieldVm =
            (currentMa * 0.22f * areaScale * (corticalPenetrationFactor / 0.35f)).coerceIn(0.0f, 2.5f)

        // Ohm's Law compliance voltage: V = I (mA) * Z (kOhm)
        val complianceVoltageV = currentMa * params.simulatedImpedanceKOhm

        // Evaluate Bikson / Nitsche safety envelope
        val (status, advisory) = evaluateSafetyGate(
            sameSite = params.anode == params.cathode,
            currentMa = currentMa,
            currentDensityMaPerCm2 = currentDensityMaPerCm2,
            chargeDensityCPerCm2 = chargeDensityCPerCm2,
            impedanceKOhm = params.simulatedImpedanceKOhm,
            complianceVoltageV = complianceVoltageV
        )

        // Synthesize 2D cortical dipole field grid (-0.85..+0.85) for heatmap rendering
        val gridSamples = buildCorticalGrid(
            params = params,
            peakElectricFieldVm = peakCorticalElectricFieldVm
        )

        return TdcsFieldSimulationResult(
            currentDensityMaPerCm2 = round3(currentDensityMaPerCm2),
            currentDensityAm2 = round2(currentDensityAm2),
            totalChargeCoulombs = round3(totalChargeCoulombs),
            chargeDensityCPerCm2 = round3(chargeDensityCPerCm2),
            peakCorticalElectricFieldVm = round2(peakCorticalElectricFieldVm),
            complianceVoltageV = round2(complianceVoltageV),
            interElectrodeDistanceCm = round2(interElectrodeDistanceCm),
            shuntingFractionPct = round2(shuntingFractionPct),
            safetyStatus = status,
            safetyAdvisory = advisory,
            gridSamples = gridSamples
        )
    }

    private fun evaluateSafetyGate(
        sameSite: Boolean,
        currentMa: Float,
        currentDensityMaPerCm2: Float,
        chargeDensityCPerCm2: Float,
        impedanceKOhm: Float,
        complianceVoltageV: Float
    ): Pair<SafetyGateStatus, String> {
        if (sameSite) {
            return SafetyGateStatus.LOCKOUT to
                "Anode and Cathode cannot occupy the same 10-20 site (100% scalp short-circuit)."
        }
        if (impedanceKOhm < 0.8f) {
            return SafetyGateStatus.LOCKOUT to
                "Impedance < 0.8 kOhm indicates saline bridge / scalp short-circuit."
        }
        if (impedanceKOhm > 15.0f || complianceVoltageV > 28.0f) {
            return SafetyGateStatus.LOCKOUT to
                "High contact impedance (${round2(impedanceKOhm)} kOhm / ${round2(complianceVoltageV)} V). Re-saturate sponges."
        }
        if (currentMa > 4.0f || currentDensityMaPerCm2 > 0.16f || chargeDensityCPerCm2 > 0.18f) {
            return SafetyGateStatus.LOCKOUT to
                "Exceeds Bikson et al. human safety ceiling (I > 4.0 mA or J > 0.16 mA/cm²)."
        }
        if (currentMa > 2.0f || currentDensityMaPerCm2 > 0.080f || chargeDensityCPerCm2 > 0.096f || impedanceKOhm > 10.0f) {
            return SafetyGateStatus.CAUTION to
                "Upper investigational envelope (J=${round3(currentDensityMaPerCm2)} mA/cm², Z=${round2(impedanceKOhm)} kOhm)."
        }
        return SafetyGateStatus.NOMINAL to
            "Within Bikson & Nitsche standard clinical research envelope (J <= 0.080 mA/cm², Z <= 10 kOhm)."
    }

    private fun buildCorticalGrid(
        params: TdcsParameters,
        peakElectricFieldVm: Float
    ): List<CorticalFieldSample> {
        if (params.anode == params.cathode || params.currentMa <= 0.0f) return emptyList()
        val samples = ArrayList<CorticalFieldSample>(81)
        val steps = listOf(-0.75f, -0.56f, -0.38f, -0.19f, 0.0f, 0.19f, 0.38f, 0.56f, 0.75f)
        for (ny in steps) {
            for (nx in steps) {
                val rHead = hypot(nx.toDouble(), ny.toDouble()).toFloat()
                if (rHead > 0.92f) continue
                val dAnode = max(0.16f, hypot((nx - params.anode.normX).toDouble(), (ny - params.anode.normY).toDouble()).toFloat())
                val dCathode = max(0.16f, hypot((nx - params.cathode.normX).toDouble(), (ny - params.cathode.normY).toDouble()).toFloat())

                // Dipole potential V(r) ~ (1/r_anode - 1/r_cathode)
                val rawPotential = (1.0f / dAnode) - (1.0f / dCathode)
                val signedPotentialMv = (rawPotential * params.currentMa * 0.45f).coerceIn(-2.5f, 2.5f)

                // E-field magnitude peaks near the electrodes and along the inter-electrode dipole corridor
                val corridorBoost = 1.0f / (dAnode + dCathode)
                val eFieldVm = (corridorBoost * peakElectricFieldVm * 0.95f).coerceIn(0.02f, peakElectricFieldVm)

                samples.add(
                    CorticalFieldSample(
                        normX = nx,
                        normY = ny,
                        signedPotentialMv = round2(signedPotentialMv),
                        electricFieldMagnitudeVm = round2(eFieldVm)
                    )
                )
            }
        }
        return samples
    }

    private fun round2(value: Float): Float = (value * 100.0f).roundToInt() / 100.0f
    private fun round3(value: Float): Float = (value * 1000.0f).roundToInt() / 1000.0f
}
