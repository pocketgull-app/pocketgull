// SPDX-License-Identifier: Apache-2.0
package com.pocketgull.neurostim.models

/**
 * International 10-20 EEG Scalp System coordinates mapped to normalized 2D azimuthal head projection
 * where (0, 0) is Vertex (Cz), (0, -1) is Nasion (anterior), and (0, +1) is Inion (posterior).
 */
enum class Eeg1020Site(
    val code: String,
    val anatomicalName: String,
    val brodmannArea: String,
    val normX: Float,
    val normY: Float,
    val clinicalRole: String
) {
    FP1("Fp1", "Left Frontopolar / Supraorbital", "BA10", -0.28f, -0.78f, "Reference return / Left orbitofrontal pole"),
    FP2("Fp2", "Right Supraorbital (SO)", "BA10", 0.28f, -0.78f, "Canonical contralateral cathode return"),
    F3("F3", "Left Dorsolateral Prefrontal (L-DLPFC)", "BA9 / BA46", -0.38f, -0.42f, "Executive working memory & mood network"),
    FZ("Fz", "Midline Frontal / dACC", "BA8 / BA32", 0.0f, -0.45f, "Anterior cingulate & conflict monitoring"),
    F4("F4", "Right Dorsolateral Prefrontal (R-DLPFC)", "BA9 / BA46", 0.38f, -0.42f, "Hyper-vigilance down-regulation & inhibitory control"),
    C3("C3", "Left Primary Motor Cortex (M1)", "BA4", -0.46f, 0.0f, "Right-hand corticospinal motor excitability"),
    CZ("Cz", "Vertex / Supplementary Motor Area", "BA4 / BA6", 0.0f, 0.0f, "Lower-limb M1 & postural motor coordination"),
    C4("C4", "Right Primary Motor Cortex (M1)", "BA4", 0.46f, 0.0f, "Left-hand corticospinal motor excitability"),
    P3("P3", "Left Posterior Parietal Cortex", "BA7 / BA39", -0.38f, 0.42f, "Visuospatial integration & reading network"),
    PZ("Pz", "Midline Parietal / Precuneus", "BA7", 0.0f, 0.45f, "Default Mode Network (DMN) posterior hub"),
    P4("P4", "Right Posterior Parietal Cortex", "BA7 / BA39", 0.38f, 0.42f, "Spatial attention allocation"),
    OZ("Oz", "Primary Visual Cortex (V1)", "BA17", 0.0f, 0.78f, "Occipital visual cortex excitability"),
    INION("Iz", "Cerebellar / Inion Reference", "Cerebellum", 0.0f, 0.92f, "Cerebello-thalamo-cortical timing & ataxia pacing")
}

enum class CochraneEvidenceTier(val badge: String, val summary: String) {
    LEVEL_A("Level A • Definite Efficacy", "Supported by multiple Class I randomized controlled trials (Lefaucheur et al.)"),
    LEVEL_B("Level B • Probable Efficacy", "Supported by >=2 Class II RCTs or consistent meta-analytic effect sizes"),
    LEVEL_C("Level C • Exploratory Model", "Mechanistic / phase-II hypothesis requiring further replication")
}

enum class SafetyGateStatus(val label: String) {
    NOMINAL("NOMINAL • BIKSON / IFCN SAFE"),
    CAUTION("CAUTION • RESEARCH ENVELOPE UPPER BOUND"),
    LOCKOUT("LOCKOUT • EXCEEDS SAFE BIOPHYSICAL LIMIT")
}

data class TdcsMontagePreset(
    val id: String,
    val title: String,
    val subtitle: String,
    val anode: Eeg1020Site,
    val cathode: Eeg1020Site,
    val defaultCurrentMa: Float,
    val defaultAreaCm2: Float,
    val defaultDurationMin: Int,
    val evidenceTier: CochraneEvidenceTier,
    val nullHypothesisH0: String,
    val pValueVsSham: Double,
    val naturalFrequencyOutOf10000: String
)

object CanonicalTdcsMontages {
    val ALL: List<TdcsMontagePreset> = listOf(
        TdcsMontagePreset(
            id = "ldlpfc_so",
            title = "Left DLPFC Anodal (F3+ / Fp2-)",
            subtitle = "Prefrontal executive working memory & mood regulation",
            anode = Eeg1020Site.F3,
            cathode = Eeg1020Site.FP2,
            defaultCurrentMa = 2.0f,
            defaultAreaCm2 = 25.0f,
            defaultDurationMin = 20,
            evidenceTier = CochraneEvidenceTier.LEVEL_A,
            nullHypothesisH0 = "H0: Anodal 2.0 mA at F3 produces zero difference in prefrontal network excitability vs. 30s ramp sham.",
            pValueVsSham = 0.004,
            naturalFrequencyOutOf10000 = "3,420 per 10,000 achieve >=50% response vs. 1,890 per 10,000 under sham (NNT ≈ 7)"
        ),
        TdcsMontagePreset(
            id = "bifrontal_dlpfc",
            title = "Bifrontal DLPFC (F3+ / F4-)",
            subtitle = "Interhemispheric prefrontal balance (Left excitation / Right inhibition)",
            anode = Eeg1020Site.F3,
            cathode = Eeg1020Site.F4,
            defaultCurrentMa = 2.0f,
            defaultAreaCm2 = 25.0f,
            defaultDurationMin = 20,
            evidenceTier = CochraneEvidenceTier.LEVEL_B,
            nullHypothesisH0 = "H0: Bilateral F3/F4 dipole equals sham on working-memory n-back latency.",
            pValueVsSham = 0.012,
            naturalFrequencyOutOf10000 = "3,150 per 10,000 show executive latency reduction vs. 1,950 per 10,000 sham"
        ),
        TdcsMontagePreset(
            id = "m1_so_motor",
            title = "Primary Motor M1-SO (C3+ / Fp2-)",
            subtitle = "Corticospinal motor learning & descending pain modulation",
            anode = Eeg1020Site.C3,
            cathode = Eeg1020Site.FP2,
            defaultCurrentMa = 1.5f,
            defaultAreaCm2 = 35.0f,
            defaultDurationMin = 20,
            evidenceTier = CochraneEvidenceTier.LEVEL_A,
            nullHypothesisH0 = "H0: Anodal C3 stimulation does not alter MEP amplitude compared to sham baseline.",
            pValueVsSham = 0.002,
            naturalFrequencyOutOf10000 = "3,680 per 10,000 show >=25% MEP facilitation vs. 1,720 per 10,000 sham"
        ),
        TdcsMontagePreset(
            id = "cerebellar_ataxia",
            title = "Cerebello-Prefrontal Pacing (Iz+ / Fp2-)",
            subtitle = "Purkinje-dentate-thalamic motor timing & tremor scaffolding",
            anode = Eeg1020Site.INION,
            cathode = Eeg1020Site.FP2,
            defaultCurrentMa = 2.0f,
            defaultAreaCm2 = 35.0f,
            defaultDurationMin = 20,
            evidenceTier = CochraneEvidenceTier.LEVEL_B,
            nullHypothesisH0 = "H0: Cerebellar anodal current yields zero change in SARA gait/kinetic tremor scores vs. sham.",
            pValueVsSham = 0.018,
            naturalFrequencyOutOf10000 = "2,980 per 10,000 show measurable kinetic coordination gain vs. 1,640 per 10,000 sham"
        )
    )
}

data class TdcsParameters(
    val anode: Eeg1020Site = Eeg1020Site.F3,
    val cathode: Eeg1020Site = Eeg1020Site.FP2,
    val currentMa: Float = 2.0f,
    val spongeAreaCm2: Float = 25.0f,
    val durationMinutes: Int = 20,
    val rampSeconds: Int = 30,
    val simulatedImpedanceKOhm: Float = 4.8f
)

data class CorticalFieldSample(
    val normX: Float,
    val normY: Float,
    val signedPotentialMv: Float,
    val electricFieldMagnitudeVm: Float
)

data class TdcsFieldSimulationResult(
    val currentDensityMaPerCm2: Float,
    val currentDensityAm2: Float,
    val totalChargeCoulombs: Float,
    val chargeDensityCPerCm2: Float,
    val peakCorticalElectricFieldVm: Float,
    val complianceVoltageV: Float,
    val interElectrodeDistanceCm: Float,
    val shuntingFractionPct: Float,
    val safetyStatus: SafetyGateStatus,
    val safetyAdvisory: String,
    val gridSamples: List<CorticalFieldSample>
)

enum class TmsProtocolType(
    val id: String,
    val title: String,
    val subtitle: String,
    val pulseFrequencyHz: Float,
    val burstFrequencyHz: Float?,
    val pulsesPerBurst: Int,
    val trainDurationSec: Float,
    val interTrainIntervalSec: Float,
    val defaultTrains: Int,
    val defaultRmtPct: Int,
    val defaultSite: Eeg1020Site,
    val synapticEffect: String,
    val evidenceTier: CochraneEvidenceTier,
    val nullHypothesisH0: String,
    val pValueVsSham: Double,
    val naturalFrequencyOutOf10000: String
) {
    ITBS_STANFORD(
        id = "itbs_50_5",
        title = "iTBS • Intermittent Theta-Burst (50 Hz @ 5 Hz)",
        subtitle = "3-min LTP-like excitatory protocol (600 pulses, 2s ON / 8s OFF)",
        pulseFrequencyHz = 50.0f,
        burstFrequencyHz = 5.0f,
        pulsesPerBurst = 3,
        trainDurationSec = 2.0f,
        interTrainIntervalSec = 8.0f,
        defaultTrains = 20,
        defaultRmtPct = 90,
        defaultSite = Eeg1020Site.F3,
        synapticEffect = "Excitatory (NMDA-dependent LTP-like cortical potentiation)",
        evidenceTier = CochraneEvidenceTier.LEVEL_A,
        nullHypothesisH0 = "H0: 600-pulse iTBS at Left DLPFC is non-inferior/equivalent to sham coil discharge.",
        pValueVsSham = 0.0008,
        naturalFrequencyOutOf10000 = "4,750 per 10,000 achieve clinical response vs. 2,100 per 10,000 sham (Blumberger / Cole et al.)"
    ),
    CTBS_INHIBITORY(
        id = "ctbs_50_5",
        title = "cTBS • Continuous Theta-Burst (40s Uninterrupted)",
        subtitle = "40-sec LTD-like inhibitory down-regulation (600 pulses @ 80% rMT)",
        pulseFrequencyHz = 50.0f,
        burstFrequencyHz = 5.0f,
        pulsesPerBurst = 3,
        trainDurationSec = 40.0f,
        interTrainIntervalSec = 0.0f,
        defaultTrains = 1,
        defaultRmtPct = 80,
        defaultSite = Eeg1020Site.F4,
        synapticEffect = "Inhibitory (LTD-like suppression of hyperactive cortical node)",
        evidenceTier = CochraneEvidenceTier.LEVEL_B,
        nullHypothesisH0 = "H0: Continuous 40s theta burst at Right DLPFC produces zero MEP/excitability suppression.",
        pValueVsSham = 0.009,
        naturalFrequencyOutOf10000 = "3,380 per 10,000 exhibit target down-regulation vs. 1,790 per 10,000 sham"
    ),
    HF_10HZ_EXCITATORY(
        id = "hf_10hz",
        title = "Standard 10 Hz High-Frequency rTMS",
        subtitle = "4s ON / 26s OFF (3,000 pulses @ 120% rMT over 37.5 min)",
        pulseFrequencyHz = 10.0f,
        burstFrequencyHz = null,
        pulsesPerBurst = 1,
        trainDurationSec = 4.0f,
        interTrainIntervalSec = 26.0f,
        defaultTrains = 75,
        defaultRmtPct = 120,
        defaultSite = Eeg1020Site.F3,
        synapticEffect = "Excitatory (Classic high-frequency depolarizing train)",
        evidenceTier = CochraneEvidenceTier.LEVEL_A,
        nullHypothesisH0 = "H0: 10 Hz rTMS at 120% rMT over F3 equals sham on Hamilton/MADRS trajectory.",
        pValueVsSham = 0.001,
        naturalFrequencyOutOf10000 = "3,850 per 10,000 achieve clinical response vs. 1,920 per 10,000 sham"
    ),
    LF_1HZ_INHIBITORY(
        id = "lf_1hz",
        title = "Low-Frequency 1 Hz Inhibitory rTMS",
        subtitle = "Continuous 1 Hz train at Right DLPFC (1,200 pulses @ 110% rMT)",
        pulseFrequencyHz = 1.0f,
        burstFrequencyHz = null,
        pulsesPerBurst = 1,
        trainDurationSec = 1200.0f,
        interTrainIntervalSec = 0.0f,
        defaultTrains = 1,
        defaultRmtPct = 110,
        defaultSite = Eeg1020Site.F4,
        synapticEffect = "Inhibitory (Low-frequency long-term depression of R-DLPFC)",
        evidenceTier = CochraneEvidenceTier.LEVEL_A,
        nullHypothesisH0 = "H0: 1 Hz rTMS at F4 shows zero difference from sham acoustic click coil.",
        pValueVsSham = 0.005,
        naturalFrequencyOutOf10000 = "3,510 per 10,000 respond vs. 1,880 per 10,000 under sham"
    )
}

data class TmsParameters(
    val protocol: TmsProtocolType = TmsProtocolType.ITBS_STANFORD,
    val targetSite: Eeg1020Site = Eeg1020Site.F3,
    val restingMotorThresholdPct: Int = 90,
    val coilAngleDegrees: Int = 45,
    val scalpToCortexDistanceMm: Float = 15.0f,
    val totalTrains: Int = 20
)

data class TmsSimulationResult(
    val peakMagneticFluxTesla: Float,
    val dBdtKiloTeslaPerSec: Float,
    val inducedCorticalElectricFieldVm: Float,
    val focalHalfValueAreaCm2: Float,
    val effectivePenetrationDepthMm: Float,
    val totalPulses: Int,
    val totalDurationSeconds: Int,
    val dutyCyclePct: Float,
    val ifcnRossiSafetyStatus: SafetyGateStatus,
    val ifcnRossiAdvisory: String,
    val pulseWaveformSamples: List<Float>
)

data class SafetyContraindicationState(
    val noIntracranialMetalOrClips: Boolean = true,
    val noCardiacPacemakerOrIcd: Boolean = true,
    val noEpilepsyOrSeizureHistory: Boolean = true,
    val intactScalpSkinAndImpedanceOk: Boolean = true
) {
    /**
     * "Tell, Don't Ask" domain encapsulation: verifies all 4 mandatory clinical safety gates.
     */
    fun isAllCleared(): Boolean =
        noIntracranialMetalOrClips &&
            noCardiacPacemakerOrIcd &&
            noEpilepsyOrSeizureHistory &&
            intactScalpSkinAndImpedanceOk

    fun activeLockoutReasons(): List<String> = buildList {
        if (!noIntracranialMetalOrClips) add("Intracranial ferromagnetic metal / aneurysm clip contraindication")
        if (!noCardiacPacemakerOrIcd) add("Implanted cardiac pacemaker / ICD / neurostimulator contraindication")
        if (!noEpilepsyOrSeizureHistory) add("Unprovoked seizure / epilepsy threshold contraindication")
        if (!intactScalpSkinAndImpedanceOk) add("Scalp lesion or electrode contact impedance fault")
    }
}
