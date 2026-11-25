// SPDX-License-Identifier: Apache-2.0
package com.pocketgull.neurostim

import com.pocketgull.neurostim.engine.BleTippssGattClient
import com.pocketgull.neurostim.engine.HeadphoneMeditationPreset
import com.pocketgull.neurostim.engine.TdcsPhysicsEngine
import com.pocketgull.neurostim.engine.TippssFhirExporter
import com.pocketgull.neurostim.engine.TmsProtocolEngine
import com.pocketgull.neurostim.models.Eeg1020Site
import com.pocketgull.neurostim.models.SafetyContraindicationState
import com.pocketgull.neurostim.models.SafetyGateStatus
import com.pocketgull.neurostim.models.TdcsParameters
import com.pocketgull.neurostim.models.TmsParameters
import com.pocketgull.neurostim.models.TmsProtocolType
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class NeuroStimEngineTest {

    @Test
    fun tdcsNominalLeftDlpfcMontageComputesBiksonEnvelope() {
        val params = TdcsParameters(
            anode = Eeg1020Site.F3,
            cathode = Eeg1020Site.FP2,
            currentMa = 2.0f,
            spongeAreaCm2 = 25.0f,
            durationMinutes = 20,
            simulatedImpedanceKOhm = 4.8f
        )
        val result = TdcsPhysicsEngine.simulate(params)

        assertEquals(0.08f, result.currentDensityMaPerCm2, 0.001f)
        assertEquals(0.80f, result.currentDensityAm2, 0.01f)
        assertEquals(2.40f, result.totalChargeCoulombs, 0.01f)
        assertEquals(SafetyGateStatus.NOMINAL, result.safetyStatus)
        assertTrue(result.peakCorticalElectricFieldVm in 0.25f..1.20f)
        assertTrue(result.gridSamples.isNotEmpty())
    }

    @Test
    fun tdcsSameElectrodeSiteOrHighImpedanceTriggersLockout() {
        val shortCircuit = TdcsPhysicsEngine.simulate(
            TdcsParameters(anode = Eeg1020Site.F3, cathode = Eeg1020Site.F3)
        )
        assertEquals(SafetyGateStatus.LOCKOUT, shortCircuit.safetyStatus)

        val highImpedance = TdcsPhysicsEngine.simulate(
            TdcsParameters(
                anode = Eeg1020Site.F3,
                cathode = Eeg1020Site.FP2,
                simulatedImpedanceKOhm = 16.5f
            )
        )
        assertEquals(SafetyGateStatus.LOCKOUT, highImpedance.safetyStatus)
    }

    @Test
    fun tmsItbsStanfordProtocolComputes600PulsesAndFaradayInduction() {
        val params = TmsParameters(
            protocol = TmsProtocolType.ITBS_STANFORD,
            targetSite = Eeg1020Site.F3,
            restingMotorThresholdPct = 90,
            coilAngleDegrees = 45,
            scalpToCortexDistanceMm = 15.0f,
            totalTrains = 20
        )
        val result = TmsProtocolEngine.simulate(params)

        assertEquals(600, result.totalPulses)
        assertEquals(SafetyGateStatus.NOMINAL, result.ifcnRossiSafetyStatus)
        assertTrue(result.peakMagneticFluxTesla > 1.0f)
        assertTrue(result.inducedCorticalElectricFieldVm in 75.0f..110.0f)
        assertEquals(64, result.pulseWaveformSamples.size)
    }

    @Test
    fun tmsExcessiveIntensityAbove130RmtTriggersIfcnRossiLockout() {
        val result = TmsProtocolEngine.simulate(
            TmsParameters(
                protocol = TmsProtocolType.HF_10HZ_EXCITATORY,
                restingMotorThresholdPct = 138
            )
        )
        assertEquals(SafetyGateStatus.LOCKOUT, result.ifcnRossiSafetyStatus)
    }

    @Test
    fun tippssExporterGeneratesNist53BitCsprngAndValidFhirR4Bundle() {
        repeat(32) {
            val u = TippssFhirExporter.nextUniform53Bit()
            assertTrue(u >= 0.0 && u < 1.0)
        }

        val tdcsParams = TdcsParameters()
        val tdcsResult = TdcsPhysicsEngine.simulate(tdcsParams)
        val tmsParams = TmsParameters()
        val tmsResult = TmsProtocolEngine.simulate(tmsParams)
        val safety = SafetyContraindicationState()

        val snapshot = TippssFhirExporter.buildTippssSnapshot(
            tdcsParams = tdcsParams,
            tdcsResult = tdcsResult,
            tmsParams = tmsParams,
            tmsResult = tmsResult,
            contraindications = safety
        )
        assertEquals(64, snapshot.sha256IntegrityDigest.length)
        assertTrue(snapshot.rssWithinBounds)
        assertTrue(snapshot.sqiWithinBounds)

        val json = TippssFhirExporter.exportFhirR4BundleJson(
            tdcsParams = tdcsParams,
            tdcsResult = tdcsResult,
            tmsParams = tmsParams,
            tmsResult = tmsResult,
            contraindications = safety,
            timestampIso = "2026-11-17T16:20:00Z"
        )
        assertTrue(json.contains("\"resourceType\": \"Bundle\""))
        assertTrue(json.contains("[EXPLORATORY IN SILICO MODEL • NON-DIAGNOSTIC]"))
        assertTrue(json.contains("1285732003"))
        assertTrue(json.contains("439958008"))

        val lockedOut = safety.copy(noIntracranialMetalOrClips = false)
        assertFalse(lockedOut.isAllCleared())
        assertEquals(1, lockedOut.activeLockoutReasons().size)
    }

    @Test
    fun bleTelemetryParserAndHeadphoneMeditationPresetsValidate() {
        val kvParsed = BleTippssGattClient.parseTelemetryPayload("Z=5.12kOhm,SQI=98.4%,TAR=1.46")
        assertNotNull(kvParsed)
        assertEquals(5.12f, kvParsed!!.impedanceKOhm, 0.01f)
        assertEquals(98.4f, kvParsed.sqiPct, 0.1f)
        assertEquals(1.46f, kvParsed.thetaAlphaRatio, 0.01f)

        val csvParsed = BleTippssGattClient.parseTelemetryPayload("4.75,95.0,1.31")
        assertNotNull(csvParsed)
        assertEquals(4.75f, csvParsed!!.impedanceKOhm, 0.01f)

        assertEquals(
            "IEEE P2933 TIPPSS Phantom",
            BleTippssGattClient.classifyDeviceProfile("PocketGull-Phantom-Rig")
        )
        assertEquals(4, HeadphoneMeditationPreset.entries.size)
        assertTrue(HeadphoneMeditationPreset.ITBS_THETA_GAMMA_PAC.isItbsGated)

        val ffrStart = com.pocketgull.neurostim.engine.NeuroEntrainmentSynthesizer.computeFfrBeatHz(
            startBridgeHz = 10.0f,
            targetBeatHz = 5.0f,
            elapsedSeconds = 0.0,
            rampDurationSec = 90.0,
            ffrGlideEnabled = true
        )
        val ffrMid = com.pocketgull.neurostim.engine.NeuroEntrainmentSynthesizer.computeFfrBeatHz(
            startBridgeHz = 10.0f,
            targetBeatHz = 5.0f,
            elapsedSeconds = 45.0,
            rampDurationSec = 90.0,
            ffrGlideEnabled = true
        )
        val ffrEnd = com.pocketgull.neurostim.engine.NeuroEntrainmentSynthesizer.computeFfrBeatHz(
            startBridgeHz = 10.0f,
            targetBeatHz = 5.0f,
            elapsedSeconds = 95.0,
            rampDurationSec = 90.0,
            ffrGlideEnabled = true
        )
        assertEquals(10.0f, ffrStart, 0.01f)
        assertEquals(7.5f, ffrMid, 0.05f)
        assertEquals(5.0f, ffrEnd, 0.01f)
    }
}
