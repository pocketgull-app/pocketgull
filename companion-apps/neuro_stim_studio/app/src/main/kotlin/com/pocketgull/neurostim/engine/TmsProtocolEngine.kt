// SPDX-License-Identifier: Apache-2.0
package com.pocketgull.neurostim.engine

import com.pocketgull.neurostim.models.SafetyGateStatus
import com.pocketgull.neurostim.models.TmsParameters
import com.pocketgull.neurostim.models.TmsProtocolType
import com.pocketgull.neurostim.models.TmsSimulationResult
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.exp
import kotlin.math.max
import kotlin.math.roundToInt
import kotlin.math.sin

/**
 * In-Silico Transcranial Magnetic Stimulation (rTMS / iTBS) Faraday-Maxwell Engine.
 *
 * Badge: [EXPLORATORY IN SILICO MODEL • NON-DIAGNOSTIC]
 * Computes Figure-of-8 coil peak magnetic flux B_peak (Tesla), rate of change dB/dt (kT/s),
 * Stokes scalp-to-cortex distance attenuation, induced cortical electric field E_induced (V/m),
 * and Rossi et al. (2009 / 2021) IFCN safety limits.
 */
object TmsProtocolEngine {

    // Typical 70mm Figure-of-8 coil produces ~1.35 Tesla at 100% resting motor threshold (rMT)
    private const val TESLA_AT_100_RMT = 1.35f
    private const val STANDARD_SCD_MM = 15.0f
    private const val BIPHASIC_PULSE_WIDTH_USEC = 280.0f

    fun simulate(params: TmsParameters): TmsSimulationResult {
        val rmtFraction = (params.restingMotorThresholdPct.coerceIn(40, 160)) / 100.0f
        val scdMm = params.scalpToCortexDistanceMm.coerceIn(8.0f, 30.0f)
        val trains = max(1, params.totalTrains)

        // Stokes linear/exponential depth correction: each mm beyond 15mm attenuates cortical field by ~2.8%
        val depthAttenuation = exp(-0.028 * (scdMm - STANDARD_SCD_MM).toDouble()).toFloat()

        // Orientation efficiency: 45° to parasagittal plane maximizes trans-sulcal pyramidal depolarization
        val angleDeviationRad = abs(params.coilAngleDegrees - 45) * (PI.toFloat() / 180.0f)
        val orientationEfficiency = (0.72f + 0.28f * cos(angleDeviationRad)).coerceIn(0.65f, 1.0f)

        val peakMagneticFluxTesla = TESLA_AT_100_RMT * rmtFraction

        // Peak dB/dt (kT/s) for a sinusoidal biphasic pulse of 280 us period: dB/dt_max = (2 * pi / T) * B_peak
        val periodSec = BIPHASIC_PULSE_WIDTH_USEC * 1e-6f
        val dBdtKiloTeslaPerSec = ((2.0f * PI.toFloat() * peakMagneticFluxTesla) / periodSec) / 1000.0f

        // At 100% rMT and 15mm SCD, induced cortical E-field at M1/DLPFC gyral crown is ~100 V/m
        val inducedCorticalElectricFieldVm =
            100.0f * rmtFraction * depthAttenuation * orientationEfficiency

        // Figure-of-8 half-value focal area (cm²) widens with depth and intensity
        val focalHalfValueAreaCm2 = (11.5f * (scdMm / STANDARD_SCD_MM) * (0.85f + 0.15f * rmtFraction))
        val effectivePenetrationDepthMm = (scdMm + 6.5f * rmtFraction).coerceIn(10.0f, 34.0f)

        // Compute total pulse count and session duration from protocol timing
        val pulsesPerTrain = when (params.protocol) {
            TmsProtocolType.ITBS_STANFORD ->
                (params.protocol.burstFrequencyHz!! * params.protocol.trainDurationSec * params.protocol.pulsesPerBurst).roundToInt()
            TmsProtocolType.CTBS_INHIBITORY ->
                (params.protocol.burstFrequencyHz!! * params.protocol.trainDurationSec * params.protocol.pulsesPerBurst).roundToInt()
            TmsProtocolType.HF_10HZ_EXCITATORY,
            TmsProtocolType.LF_1HZ_INHIBITORY ->
                (params.protocol.pulseFrequencyHz * params.protocol.trainDurationSec).roundToInt()
        }
        val totalPulses = pulsesPerTrain * trains

        val cycleSec = params.protocol.trainDurationSec + params.protocol.interTrainIntervalSec
        val totalDurationSeconds = max(
            1,
            (trains * cycleSec - params.protocol.interTrainIntervalSec).roundToInt()
        )
        val dutyCyclePct = if (cycleSec > 0.0f) {
            (params.protocol.trainDurationSec / cycleSec) * 100.0f
        } else {
            100.0f
        }

        val (status, advisory) = evaluateRossiSafety(
            protocol = params.protocol,
            rmtPct = params.restingMotorThresholdPct,
            trains = trains,
            totalPulses = totalPulses
        )

        val waveform = synthesizePulseTrainPreview(params.protocol, rmtFraction)

        return TmsSimulationResult(
            peakMagneticFluxTesla = round2(peakMagneticFluxTesla),
            dBdtKiloTeslaPerSec = round1(dBdtKiloTeslaPerSec),
            inducedCorticalElectricFieldVm = round1(inducedCorticalElectricFieldVm),
            focalHalfValueAreaCm2 = round1(focalHalfValueAreaCm2),
            effectivePenetrationDepthMm = round1(effectivePenetrationDepthMm),
            totalPulses = totalPulses,
            totalDurationSeconds = totalDurationSeconds,
            dutyCyclePct = round1(dutyCyclePct),
            ifcnRossiSafetyStatus = status,
            ifcnRossiAdvisory = advisory,
            pulseWaveformSamples = waveform
        )
    }

    private fun evaluateRossiSafety(
        protocol: TmsProtocolType,
        rmtPct: Int,
        trains: Int,
        totalPulses: Int
    ): Pair<SafetyGateStatus, String> {
        if (rmtPct > 130) {
            return SafetyGateStatus.LOCKOUT to
                "Exceeds IFCN Rossi et al. (2021) intensity ceiling (>130% rMT increases cortical seizure risk)."
        }
        if (protocol == TmsProtocolType.ITBS_STANFORD && rmtPct > 120) {
            return SafetyGateStatus.LOCKOUT to
                "iTBS intensity >120% rMT exceeds Stanford SAINT / FDA-cleared theta-burst envelope."
        }
        if (protocol == TmsProtocolType.CTBS_INHIBITORY && rmtPct > 100) {
            return SafetyGateStatus.LOCKOUT to
                "Continuous TBS (40s uninterrupted) above 100% rMT exceeds IFCN safe train table."
        }
        if (rmtPct > 120 || totalPulses > 3600 || (protocol == TmsProtocolType.ITBS_STANFORD && trains > 30)) {
            return SafetyGateStatus.CAUTION to
                "High-dose rTMS/iTBS regime (${rmtPct}% rMT, $totalPulses pulses). Verify motor threshold and hearing protection."
        }
        return SafetyGateStatus.NOMINAL to
            "Compliant with IFCN Rossi et al. (2021) consensus guidelines ($rmtPct% rMT, $totalPulses pulses)."
    }

    /**
     * Generates 64 normalized oscilloscope samples (-1.0..+1.0) representing the characteristic
     * biphasic dB/dt waveform & burst structure for UI rendering.
     */
    private fun synthesizePulseTrainPreview(
        protocol: TmsProtocolType,
        rmtFraction: Float
    ): List<Float> {
        val count = 64
        val amp = rmtFraction.coerceIn(0.4f, 1.3f) / 1.3f
        return List(count) { idx ->
            val t = idx.toFloat() / count.toFloat()
            when (protocol) {
                TmsProtocolType.ITBS_STANFORD -> {
                    // 3-pulse 50 Hz burst clusters every 200ms with 2s ON / 8s OFF envelope
                    val burstSlot = idx % 16
                    if (burstSlot in listOf(1, 3, 5)) amp else if (burstSlot in listOf(2, 4, 6)) -amp * 0.85f else 0.0f
                }
                TmsProtocolType.CTBS_INHIBITORY -> {
                    val burstSlot = idx % 10
                    if (burstSlot in listOf(1, 3, 5)) amp * 0.85f else if (burstSlot in listOf(2, 4, 6)) -amp * 0.75f else 0.0f
                }
                TmsProtocolType.HF_10HZ_EXCITATORY -> {
                    val slot = idx % 6
                    when (slot) {
                        1 -> amp
                        2 -> -amp * 0.9f
                        else -> sin(t * 2.0f * PI.toFloat()) * 0.04f
                    }
                }
                TmsProtocolType.LF_1HZ_INHIBITORY -> {
                    val slot = idx % 16
                    when (slot) {
                        2 -> amp * 0.9f
                        3 -> -amp * 0.85f
                        else -> 0.0f
                    }
                }
            }
        }
    }

    private fun round1(value: Float): Float = (value * 10.0f).roundToInt() / 10.0f
    private fun round2(value: Float): Float = (value * 100.0f).roundToInt() / 100.0f
}
