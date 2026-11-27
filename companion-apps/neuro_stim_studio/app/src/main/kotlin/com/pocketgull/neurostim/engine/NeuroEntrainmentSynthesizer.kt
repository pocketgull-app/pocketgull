// SPDX-License-Identifier: Apache-2.0
package com.pocketgull.neurostim.engine

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import kotlin.concurrent.thread
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

enum class HeadphoneMeditationPreset(
    val id: String,
    val title: String,
    val subtitle: String,
    val beatFrequencyHz: Float,
    val secondaryBeatHz: Float,
    val carrierFrequencyHz: Float,
    val startBridgeHz: Float,
    val isItbsGated: Boolean,
    val corticalTarget: String,
    val act1ArrivalPrompt: String,
    val act2EntrainmentPrompt: String,
    val act3IntegrationPrompt: String
) {
    FOCUS_10_MIND_AWAKE(
        id = "hemi_focus_10",
        title = "Hemi-Sync Focus 10 • Mind Awake / Body Asleep",
        subtitle = "Dual 5.0 Hz Theta + 1.5 Hz Delta body-rest & 10->5 Hz FFR glide",
        beatFrequencyHz = 5.0f,
        secondaryBeatHz = 1.5f,
        carrierFrequencyHz = 200.0f,
        startBridgeHz = 10.0f,
        isItbsGated = false,
        corticalTarget = "Bilateral Hemispheric Synchrony (Superior Olivary -> Thalamocortical)",
        act1ArrivalPrompt = "Act I • Resonant Tuning: Inhale for 4 seconds; on the 6-second exhale, imagine a warm 100 Hz hum vibrating through your chest and jaw as the 10 Hz bridge begins.",
        act2EntrainmentPrompt = "Act II • Focus 10: The carrier glides smoothly from 10 Hz Alpha down to 5 Hz Theta with a 1.5 Hz deep delta cushion. Your body rests completely asleep while your mind stays crystal awake.",
        act3IntegrationPrompt = "Act III • Return Count: Feel warm energy returning to your fingers and toes as the hemispheres remain balanced and calm."
    ),
    FOCUS_12_EXPANDED(
        id = "hemi_focus_12",
        title = "Hemi-Sync Focus 12 • Expanded Spatial Coherence",
        subtitle = "7.5 Hz Alpha-Theta border + 4.0 Hz Theta tri-octave stack",
        beatFrequencyHz = 4.0f,
        secondaryBeatHz = 7.5f,
        carrierFrequencyHz = 216.0f,
        startBridgeHz = 10.0f,
        isItbsGated = false,
        corticalTarget = "Frontoparietal & Default Mode Network (F3 / F4 / Pz) Coherence",
        act1ArrivalPrompt = "Act I • Settle into your Sony MDR-V6 earcups. Let the 1/f ocean-surf pink noise mask the outer room.",
        act2EntrainmentPrompt = "Act II • Focus 12: Notice the spacious 3D field as 4.0 Hz Theta and 7.5 Hz Schumann-band harmonics lock across left and right hemispheres.",
        act3IntegrationPrompt = "Act III • Anchor this wide, effortless perspective before gently opening your eyes."
    ),
    ITBS_THETA_GAMMA_PAC(
        id = "itbs_theta_5hz",
        title = "iTBS Theta-Gamma PAC • 5 Hz + 40 Hz Ripple",
        subtitle = "2s Theta swell / 8s valley with nested 40 Hz Gamma binding",
        beatFrequencyHz = 5.0f,
        secondaryBeatHz = 40.0f,
        carrierFrequencyHz = 216.0f,
        startBridgeHz = 8.5f,
        isItbsGated = true,
        corticalTarget = "Left DLPFC (F3) • Prefrontal Executive & Hippocampal PAC",
        act1ArrivalPrompt = "Act I • Settle into your Sony MDR-V6 earcups. Let your jaw and shoulders unclench as the 108 Hz sub-octave and 216 Hz carrier begin.",
        act2EntrainmentPrompt = "Act II • Notice the gentle 2-second 5 Hz theta crest carrying a subtle 40 Hz shimmer, followed by an 8-second spacious rest.",
        act3IntegrationPrompt = "Act III • Let go of effort. Rest in the quiet interval between waves before gently opening your eyes."
    ),
    ALPHA_SMR_STEADINESS(
        id = "alpha_smr_10hz",
        title = "Quiet Workshop • 10 Hz Alpha / 14 Hz SMR",
        subtitle = "Binaural 10 Hz + 14 Hz sensorimotor steadiness & tremor calm",
        beatFrequencyHz = 10.0f,
        secondaryBeatHz = 14.0f,
        carrierFrequencyHz = 200.0f,
        startBridgeHz = 12.0f,
        isItbsGated = false,
        corticalTarget = "Sensorimotor Strip (C3 / Cz / C4) & Cerebellar Pacing",
        act1ArrivalPrompt = "Act I • Rest your hands comfortably. Feel the weight of your forearms supported without effort.",
        act2EntrainmentPrompt = "Act II • Left and right MDR-V6 drivers weave a steady 10 Hz alpha and 14 Hz SMR cadence. Let your breathing follow the 10-second Mayer wave.",
        act3IntegrationPrompt = "Act III • Carry this unhurried, grounded motor cadence back into your day."
    )
}

/**
 * Sony MDR-V6 Reference Studio Monitor Hemi-Sync & Neuromodulation Synthesizer.
 *
 * Electroacoustic Target: Sony MDR-V6 (40mm CCAW Samarium-Cobalt driver, 63 Ohm,
 * 5 Hz - 30,000 Hz frequency response, 106 dB/mW sensitivity).
 *
 * Implements 4 Hemi-Sync Architectural Pillars:
 * 1. Tri-Octave Phase-Locked Carrier Stack (Sub-Fundamental 100/108 Hz + Oster Peak 200/216 Hz
 *    + Fifth Harmonic 300/324 Hz carrying secondary beat df_2)
 * 2. Frequency Following Response (FFR) Progressive Glide (glides from Alpha bridge down to
 *    target Theta/Delta frequency over 90 seconds)
 * 3. Paul Kellet 1/f Pink Noise ("Ocean Surf") Bed modulated by the 0.1 Hz Mayer respiratory wave
 *    to prevent auditory cortex habituation
 * 4. Sony MDR-V6 Sub-Bass Cushion (+3.5 dB 54-108 Hz sub-octave & 106 dB/mW gain staging)
 */
class NeuroEntrainmentSynthesizer {

    companion object {
        /**
         * Computes instantaneous Frequency Following Response (FFR) beat frequency (Hz)
         * as it glides smoothly from [startBridgeHz] to [targetBeatHz] over [rampDurationSec].
         */
        fun computeFfrBeatHz(
            startBridgeHz: Float,
            targetBeatHz: Float,
            elapsedSeconds: Double,
            rampDurationSec: Double = 90.0,
            ffrGlideEnabled: Boolean = true
        ): Float {
            if (!ffrGlideEnabled || rampDurationSec <= 0.0 || elapsedSeconds >= rampDurationSec) {
                return targetBeatHz
            }
            val progress = (elapsedSeconds / rampDurationSec).coerceIn(0.0, 1.0)
            // Smooth cosine interpolation for imperceptible frequency following
            val smoothWeight = 0.5 * (1.0 - cos(PI * progress))
            return (startBridgeHz + (targetBeatHz - startBridgeHz) * smoothWeight.toFloat())
        }
    }

    @Volatile
    private var isPlaying: Boolean = false

    @Volatile
    private var masterVolume: Float = 0.65f

    @Volatile
    private var breathSwellEnabled: Boolean = true

    @Volatile
    private var mdrV6CalibrationEnabled: Boolean = true

    @Volatile
    private var pinkNoiseSurfLevel: Float = 0.28f

    @Volatile
    private var ffrGlideEnabled: Boolean = true

    private var workerThread: Thread? = null

    fun setVolume(volume: Float) {
        masterVolume = volume.coerceIn(0.05f, 1.0f)
    }

    fun setBreathSwell(enabled: Boolean) {
        breathSwellEnabled = enabled
    }

    fun setMdrV6Calibration(enabled: Boolean) {
        mdrV6CalibrationEnabled = enabled
    }

    fun setPinkNoiseSurfLevel(level: Float) {
        pinkNoiseSurfLevel = level.coerceIn(0.0f, 0.80f)
    }

    fun setFfrGlide(enabled: Boolean) {
        ffrGlideEnabled = enabled
    }

    fun startPreset(preset: HeadphoneMeditationPreset) {
        start(
            beatFrequencyHz = preset.beatFrequencyHz,
            secondaryBeatHz = preset.secondaryBeatHz,
            startBridgeHz = preset.startBridgeHz,
            carrierHz = preset.carrierFrequencyHz,
            isItbsGated = preset.isItbsGated
        )
    }

    fun start(
        beatFrequencyHz: Float = 5.0f,
        secondaryBeatHz: Float = 1.5f,
        startBridgeHz: Float = 10.0f,
        carrierHz: Float = 200.0f,
        isItbsGated: Boolean = false
    ) {
        stop()
        isPlaying = true
        workerThread = thread(start = true, name = "SonyMdrV6HemiSyncAudio") {
            val sampleRate = 44100
            val minBuffer = AudioTrack.getMinBufferSize(
                sampleRate,
                AudioFormat.CHANNEL_OUT_STEREO,
                AudioFormat.ENCODING_PCM_16BIT
            ).coerceAtLeast(4096)

            val track = try {
                AudioTrack.Builder()
                    .setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_MEDIA)
                            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                            .build()
                    )
                    .setAudioFormat(
                        AudioFormat.Builder()
                            .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                            .setSampleRate(sampleRate)
                            .setChannelMask(AudioFormat.CHANNEL_OUT_STEREO)
                            .build()
                    )
                    .setBufferSizeInBytes(minBuffer)
                    .setTransferMode(AudioTrack.MODE_STREAM)
                    .build()
            } catch (_: Throwable) {
                isPlaying = false
                return@thread
            }

            try {
                track.play()
                val chunkFrames = 1024
                val pcmBuffer = ShortArray(chunkFrames * 2)
                var sampleIndex = 0L

                val targetBeat1 = beatFrequencyHz.coerceIn(1.0f, 50.0f)
                val targetBeat2 = secondaryBeatHz.coerceIn(0.5f, 50.0f)
                val subCarrierHz = carrierHz * 0.5f // 100 - 108 Hz sub-octave binaural pair
                val fifthCarrierHz = carrierHz * 1.498f // 300 - 324 Hz fifth harmonic binaural pair

                // Continuous phase accumulators so FFR frequency glide has zero phase clicks
                var phasePrimaryL = 0.0
                var phasePrimaryR = 0.0
                var phaseSubL = 0.0
                var phaseSubR = 0.0
                var phaseFifthL = 0.0
                var phaseFifthR = 0.0
                val twoPiOverSr = (2.0 * PI) / sampleRate.toDouble()

                // Paul Kellet 1/f Pink Noise filter state (Left & Right decorrelated stereo surf)
                var b0L = 0.0; var b1L = 0.0; var b2L = 0.0
                var b0R = 0.0; var b1R = 0.0; var b2R = 0.0
                // Seed fast 64-bit PRNG from NIST SP 800-90A CSPRNG
                var rngState = (TippssFhirExporter.nextUniform53Bit() * Long.MAX_VALUE).toLong() or 1L

                while (isPlaying) {
                    val vol = masterVolume.toDouble()
                    val useBreathSwell = breathSwellEnabled
                    val useMdrV6 = mdrV6CalibrationEnabled
                    val surfGain = (pinkNoiseSurfLevel.toDouble() * 0.055)
                    val useGlide = ffrGlideEnabled

                    val subOctaveGain = if (useMdrV6) 0.125 else 0.080
                    val fifthGain = if (useMdrV6) 0.052 else 0.065
                    val sensitivityTrim = if (useMdrV6) 0.88 else 1.0

                    for (i in 0 until chunkFrames) {
                        val t = sampleIndex.toDouble() / sampleRate.toDouble()
                        val fadeIn = (t / 2.5).coerceIn(0.0, 1.0)

                        // Instantaneous FFR beat frequency (glides from startBridgeHz -> targetBeat1)
                        val currentBeat1 = computeFfrBeatHz(
                            startBridgeHz = startBridgeHz,
                            targetBeatHz = targetBeat1,
                            elapsedSeconds = t,
                            rampDurationSec = 90.0,
                            ffrGlideEnabled = useGlide
                        ).toDouble()

                        // Advance continuous phase accumulators for all 3 Hemi-Sync carrier pairs
                        phasePrimaryL += (carrierHz - currentBeat1 * 0.5) * twoPiOverSr
                        phasePrimaryR += (carrierHz + currentBeat1 * 0.5) * twoPiOverSr

                        // Sub-octave carries the deep body-rest secondary beat (e.g. 1.5 Hz Delta in Focus 10)
                        val subBeat = minOf(currentBeat1, targetBeat2.toDouble())
                        phaseSubL += (subCarrierHz - subBeat * 0.5) * twoPiOverSr
                        phaseSubR += (subCarrierHz + subBeat * 0.5) * twoPiOverSr

                        // Fifth harmonic carries the secondary cross-frequency beat
                        phaseFifthL += (fifthCarrierHz - targetBeat2 * 0.5) * twoPiOverSr
                        phaseFifthR += (fifthCarrierHz + targetBeat2 * 0.5) * twoPiOverSr

                        // 0.1 Hz Mayer Wave (10s respiratory cycle: 4s inhale swell, 6s exhale settle)
                        val mayerPhase = t % 10.0
                        val breathEnvelope = if (!useBreathSwell) {
                            0.85
                        } else if (mayerPhase < 4.0) {
                            0.58 + 0.42 * sin((mayerPhase / 4.0) * (PI / 2.0))
                        } else {
                            0.58 + 0.42 * cos(((mayerPhase - 4.0) / 6.0) * (PI / 2.0))
                        }

                        val burstGate = if (!isItbsGated) {
                            1.0
                        } else if (mayerPhase < 2.2) {
                            0.35 + 0.65 * sin((mayerPhase / 2.2) * PI)
                        } else {
                            0.35
                        }

                        // Decorrelated stereo 1/f Pink Noise ("Ocean Surf") using Xorshift64* + Kellet filter
                        rngState = rngState xor (rngState ushr 12)
                        rngState = rngState xor (rngState shl 25)
                        rngState = rngState xor (rngState ushr 27)
                        val whiteL = ((rngState * 2685821657736338717L) shr 40).toDouble() / (1L shl 23).toDouble()

                        rngState = rngState xor (rngState ushr 12)
                        rngState = rngState xor (rngState shl 25)
                        rngState = rngState xor (rngState ushr 27)
                        val whiteR = ((rngState * 2685821657736338717L) shr 40).toDouble() / (1L shl 23).toDouble()

                        b0L = 0.99765 * b0L + whiteL * 0.0990460
                        b1L = 0.96300 * b1L + whiteL * 0.2965164
                        b2L = 0.57000 * b2L + whiteL * 1.0526913
                        val pinkL = (b0L + b1L + b2L + whiteL * 0.1848) * 0.18 * surfGain

                        b0R = 0.99765 * b0R + whiteR * 0.0990460
                        b1R = 0.96300 * b1R + whiteR * 0.2965164
                        b2R = 0.57000 * b2R + whiteR * 1.0526913
                        val pinkR = (b0R + b1R + b2R + whiteR * 0.1848) * 0.18 * surfGain

                        val isochronicEnv = 0.72 - 0.28 * cos(2.0 * PI * currentBeat1 * t) * burstGate

                        val leftRaw =
                            (sin(phasePrimaryL) * 0.16 * isochronicEnv +
                                sin(phaseSubL) * subOctaveGain +
                                sin(phaseFifthL) * fifthGain +
                                pinkL) *
                                breathEnvelope * fadeIn * vol * sensitivityTrim

                        val rightRaw =
                            (sin(phasePrimaryR) * 0.16 * isochronicEnv +
                                sin(phaseSubR) * subOctaveGain +
                                sin(phaseFifthR) * fifthGain +
                                pinkR) *
                                breathEnvelope * fadeIn * vol * sensitivityTrim

                        pcmBuffer[i * 2] =
                            (leftRaw.coerceIn(-0.95, 0.95) * Short.MAX_VALUE).toInt().toShort()
                        pcmBuffer[i * 2 + 1] =
                            (rightRaw.coerceIn(-0.95, 0.95) * Short.MAX_VALUE).toInt().toShort()
                        sampleIndex++
                    }
                    track.write(pcmBuffer, 0, pcmBuffer.size)
                }
            } catch (_: Throwable) {
                // Ignore playback interruption on shutdown
            } finally {
                try {
                    track.stop()
                    track.release()
                } catch (_: Throwable) {
                }
            }
        }
    }

    fun stop() {
        isPlaying = false
        workerThread?.let {
            try {
                it.join(250)
            } catch (_: InterruptedException) {
            }
        }
        workerThread = null
    }
}
