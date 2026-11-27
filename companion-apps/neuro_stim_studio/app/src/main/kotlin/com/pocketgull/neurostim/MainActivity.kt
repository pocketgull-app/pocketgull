// SPDX-License-Identifier: Apache-2.0
package com.pocketgull.neurostim

import android.Manifest
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.os.Build
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.FilterChip
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Slider
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pocketgull.neurostim.engine.BleConnectionState
import com.pocketgull.neurostim.engine.BleTelemetryUiState
import com.pocketgull.neurostim.engine.BleTippssGattClient
import com.pocketgull.neurostim.engine.DiscoveredBleNode
import com.pocketgull.neurostim.engine.HeadphoneMeditationPreset
import com.pocketgull.neurostim.engine.NeuroEntrainmentSynthesizer
import com.pocketgull.neurostim.engine.TdcsPhysicsEngine
import com.pocketgull.neurostim.engine.TippssFhirExporter
import com.pocketgull.neurostim.engine.TmsProtocolEngine
import com.pocketgull.neurostim.models.CanonicalTdcsMontages
import com.pocketgull.neurostim.models.Eeg1020Site
import com.pocketgull.neurostim.models.SafetyContraindicationState
import com.pocketgull.neurostim.models.SafetyGateStatus
import com.pocketgull.neurostim.models.TdcsMontagePreset
import com.pocketgull.neurostim.models.TdcsParameters
import com.pocketgull.neurostim.models.TmsParameters
import com.pocketgull.neurostim.models.TmsProtocolType
import com.pocketgull.neurostim.ui.components.MayerWavePacerCard
import com.pocketgull.neurostim.ui.components.ScalpMontageCanvas
import com.pocketgull.neurostim.ui.components.TmsPulseOscilloscopeView
import com.pocketgull.neurostim.ui.theme.AnodeCoralRed
import com.pocketgull.neurostim.ui.theme.CaledonianEmerald
import com.pocketgull.neurostim.ui.theme.CathodeCobaltTeal
import com.pocketgull.neurostim.ui.theme.CautionGold
import com.pocketgull.neurostim.ui.theme.GorseAmberAccent
import com.pocketgull.neurostim.ui.theme.LockoutCrimson
import com.pocketgull.neurostim.ui.theme.MutedStone
import com.pocketgull.neurostim.ui.theme.NeuroStimStudioTheme
import com.pocketgull.neurostim.ui.theme.ObsidianCard
import com.pocketgull.neurostim.ui.theme.ObsidianSurface
import com.pocketgull.neurostim.ui.theme.SubtleBorder
import com.pocketgull.neurostim.ui.theme.WarmSepiaSecondary
import kotlinx.coroutines.delay
import java.util.Locale
import kotlin.math.roundToInt

/**
 * Unified 4-Slot Cognitive Scaffolding Card Descriptor.
 * Pairs each Sony MDR-V6 Hemi-Sync preset with its matching 10-20 tDCS montage and TMS protocol
 * so a single tremor-safe tap configures the entire app.
 */
data class CognitiveProtocolSlot(
    val slotNumber: Int,
    val shortTitle: String,
    val badge: String,
    val subtitle: String,
    val meditationPreset: HeadphoneMeditationPreset,
    val tdcsPreset: TdcsMontagePreset,
    val tmsProtocol: TmsProtocolType,
    val isTmsViewDefault: Boolean
)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            var scotopicMode by remember { mutableStateOf(false) }
            NeuroStimStudioTheme(scotopicMode = scotopicMode) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    NeuroStimStudioApp(
                        scotopicMode = scotopicMode,
                        onToggleScotopicMode = { scotopicMode = !scotopicMode }
                    )
                }
            }
        }
    }
}

@Composable
fun NeuroStimStudioApp(
    scotopicMode: Boolean,
    onToggleScotopicMode: () -> Unit
) {
    val context = LocalContext.current
    val synthesizer = remember { NeuroEntrainmentSynthesizer() }
    val bleClient = remember { BleTippssGattClient(context) }
    val bleUiState by bleClient.uiState.collectAsState()

    var ttsEngine by remember { mutableStateOf<TextToSpeech?>(null) }

    DisposableEffect(context) {
        var instance: TextToSpeech? = null
        instance = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                instance?.language = Locale.US
                instance?.setSpeechRate(0.88f)
                instance?.setPitch(0.92f)
                ttsEngine = instance
            }
        }
        onDispose {
            synthesizer.stop()
            bleClient.disconnect()
            try {
                instance?.stop()
                instance?.shutdown()
            } catch (_: Throwable) {
            }
        }
    }

    val blePermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { grants ->
        val allGranted = grants.values.all { it }
        if (allGranted) {
            bleClient.startBleScan()
        } else {
            Toast.makeText(
                context,
                "Bluetooth Scan/Connect permissions are required for live hardware discovery.",
                Toast.LENGTH_SHORT
            ).show()
        }
    }

    // Progressive Disclosure: Default to "4-Slot Sanctuary Mode" (low cognitive load, large targets).
    // "Advanced Physics & BLE Lab" is tucked behind a single toggle.
    var showAdvancedLab by remember { mutableStateOf(false) }
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("1. tDCS Studio", "2. TMS / iTBS", "3. Meditate & Pace", "4. TIPPSS & BLE")

    val fourSlots = remember {
        listOf(
            CognitiveProtocolSlot(
                slotNumber = 1,
                shortTitle = "1. Focus 10 • Mind Awake",
                badge = "5 Hz + 1.5 Hz • F3/Fp2",
                subtitle = "Body asleep, mind awake (Left DLPFC)",
                meditationPreset = HeadphoneMeditationPreset.FOCUS_10_MIND_AWAKE,
                tdcsPreset = CanonicalTdcsMontages.ALL[0],
                tmsProtocol = TmsProtocolType.ITBS_STANFORD,
                isTmsViewDefault = false
            ),
            CognitiveProtocolSlot(
                slotNumber = 2,
                shortTitle = "2. Focus 12 • Spatial Calm",
                badge = "4 Hz + 7.5 Hz • F3/F4",
                subtitle = "Bifrontal hemispheric balance",
                meditationPreset = HeadphoneMeditationPreset.FOCUS_12_EXPANDED,
                tdcsPreset = CanonicalTdcsMontages.ALL[1],
                tmsProtocol = TmsProtocolType.LF_1HZ_INHIBITORY,
                isTmsViewDefault = false
            ),
            CognitiveProtocolSlot(
                slotNumber = 3,
                shortTitle = "3. iTBS Theta-Gamma",
                badge = "50 Hz @ 5 Hz • 600p",
                subtitle = "3-min Stanford theta-burst clarity",
                meditationPreset = HeadphoneMeditationPreset.ITBS_THETA_GAMMA_PAC,
                tdcsPreset = CanonicalTdcsMontages.ALL[0],
                tmsProtocol = TmsProtocolType.ITBS_STANFORD,
                isTmsViewDefault = true
            ),
            CognitiveProtocolSlot(
                slotNumber = 4,
                shortTitle = "4. SMR Motor Steadiness",
                badge = "10 Hz + 14 Hz • Iz/Fp2",
                subtitle = "Cerebellar ataxia & tremor pacing",
                meditationPreset = HeadphoneMeditationPreset.ALPHA_SMR_STEADINESS,
                tdcsPreset = CanonicalTdcsMontages.ALL[3],
                tmsProtocol = TmsProtocolType.HF_10HZ_EXCITATORY,
                isTmsViewDefault = false
            )
        )
    }
    var activeSlotIndex by remember { mutableIntStateOf(0) }

    // tDCS State
    var selectedMontagePreset by remember { mutableStateOf(CanonicalTdcsMontages.ALL.first()) }
    var tdcsAnode by remember { mutableStateOf(Eeg1020Site.F3) }
    var tdcsCathode by remember { mutableStateOf(Eeg1020Site.FP2) }
    var tdcsCurrentMa by remember { mutableFloatStateOf(2.0f) }
    var tdcsAreaCm2 by remember { mutableFloatStateOf(25.0f) }
    var tdcsDurationMin by remember { mutableIntStateOf(20) }
    var tdcsImpedanceKOhm by remember { mutableFloatStateOf(4.8f) }
    var syncBleImpedanceToTdcs by remember { mutableStateOf(true) }

    LaunchedEffect(bleUiState.liveImpedanceKOhm, bleUiState.connectionState, syncBleImpedanceToTdcs) {
        val activeLink = bleUiState.connectionState == BleConnectionState.CONNECTED_LIVE ||
            bleUiState.connectionState == BleConnectionState.VIRTUAL_PHANTOM_LOOPBACK
        if (activeLink && syncBleImpedanceToTdcs) {
            tdcsImpedanceKOhm = bleUiState.liveImpedanceKOhm
        }
    }

    val tdcsParams = TdcsParameters(
        anode = tdcsAnode,
        cathode = tdcsCathode,
        currentMa = tdcsCurrentMa,
        spongeAreaCm2 = tdcsAreaCm2,
        durationMinutes = tdcsDurationMin,
        simulatedImpedanceKOhm = tdcsImpedanceKOhm
    )
    val tdcsResult = remember(tdcsParams) { TdcsPhysicsEngine.simulate(tdcsParams) }

    // TMS State
    var tmsProtocol by remember { mutableStateOf(TmsProtocolType.ITBS_STANFORD) }
    var tmsTargetSite by remember { mutableStateOf(Eeg1020Site.F3) }
    var tmsRmtPct by remember { mutableIntStateOf(90) }
    var tmsCoilAngleDeg by remember { mutableIntStateOf(45) }
    var tmsScdMm by remember { mutableFloatStateOf(15.0f) }

    val tmsParams = TmsParameters(
        protocol = tmsProtocol,
        targetSite = tmsTargetSite,
        restingMotorThresholdPct = tmsRmtPct,
        coilAngleDegrees = tmsCoilAngleDeg,
        scalpToCortexDistanceMm = tmsScdMm,
        totalTrains = tmsProtocol.defaultTrains
    )
    val tmsResult = remember(tmsParams) { TmsProtocolEngine.simulate(tmsParams) }

    // Safety Contraindications, Sony MDR-V6 Hemi-Sync Meditation & Session Timer
    var contraindications by remember { mutableStateOf(SafetyContraindicationState()) }
    var reducedMotion by remember { mutableStateOf(false) }
    var selectedMeditationPreset by remember {
        mutableStateOf(HeadphoneMeditationPreset.FOCUS_10_MIND_AWAKE)
    }
    var isPlayingMeditationAudio by remember { mutableStateOf(false) }
    var headphoneVolume by remember { mutableFloatStateOf(0.65f) }
    var pinkNoiseSurfLevel by remember { mutableFloatStateOf(0.28f) }
    var ffrGlideEnabled by remember { mutableStateOf(true) }
    var breathSwellEnabled by remember { mutableStateOf(true) }
    var mdrV6CalibrationEnabled by remember { mutableStateOf(true) }
    var voiceCoachEnabled by remember { mutableStateOf(true) }
    var isSessionRunning by remember { mutableStateOf(false) }
    var sessionElapsedSec by remember { mutableIntStateOf(0) }

    val speakPrompt: (String) -> Unit = { text ->
        ttsEngine?.speak(
            text.replace("•", ","),
            TextToSpeech.QUEUE_FLUSH,
            null,
            "neurostim_meditation_cue"
        )
    }

    LaunchedEffect(isSessionRunning, contraindications) {
        if (!contraindications.isAllCleared()) {
            isSessionRunning = false
        }
        while (isSessionRunning) {
            delay(1000L)
            sessionElapsedSec += 1
        }
    }

    Scaffold(
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(ObsidianSurface)
                    .padding(horizontal = 14.dp, vertical = 10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "PocketGull • NeuroStim Studio",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = if (showAdvancedLab) {
                                "[ADVANCED LAB MODE • IN-SILICO & BLE]"
                            } else {
                                "4-SLOT SANCTUARY • SONY MDR-V6 HEMI-SYNC"
                            },
                            fontSize = 10.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = GorseAmberAccent
                        )
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        OutlinedButton(onClick = onToggleScotopicMode) {
                            Text(
                                text = if (scotopicMode) "670nm ON" else "670nm Red",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                        OutlinedButton(onClick = { showAdvancedLab = !showAdvancedLab }) {
                            Text(
                                text = if (showAdvancedLab) "Calm View" else "Lab Mode",
                                fontSize = 11.sp,
                                color = GorseAmberAccent
                            )
                        }
                    }
                }

                if (showAdvancedLab) {
                    Spacer(modifier = Modifier.height(8.dp))
                    TabRow(
                        selectedTabIndex = selectedTab,
                        containerColor = ObsidianCard,
                        contentColor = MaterialTheme.colorScheme.primary
                    ) {
                        tabs.forEachIndexed { idx, title ->
                            Tab(
                                selected = selectedTab == idx,
                                onClick = { selectedTab = idx },
                                text = {
                                    Text(
                                        text = title,
                                        fontSize = 11.sp,
                                        fontWeight = if (selectedTab == idx) FontWeight.Bold else FontWeight.Normal
                                    )
                                }
                            )
                        }
                    }
                }
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            if (!showAdvancedLab) {
                SanctuaryFourSlotView(
                    slots = fourSlots,
                    activeSlotIndex = activeSlotIndex,
                    onSelectSlot = { idx ->
                        activeSlotIndex = idx
                        val slot = fourSlots[idx]
                        selectedMeditationPreset = slot.meditationPreset
                        selectedMontagePreset = slot.tdcsPreset
                        tdcsAnode = slot.tdcsPreset.anode
                        tdcsCathode = slot.tdcsPreset.cathode
                        tdcsCurrentMa = slot.tdcsPreset.defaultCurrentMa
                        tdcsAreaCm2 = slot.tdcsPreset.defaultAreaCm2
                        tmsProtocol = slot.tmsProtocol
                        tmsTargetSite = slot.tmsProtocol.defaultSite
                        if (isPlayingMeditationAudio) {
                            synthesizer.startPreset(slot.meditationPreset)
                        }
                    },
                    isPlayingAudio = isPlayingMeditationAudio,
                    onTogglePlayAudio = {
                        if (isPlayingMeditationAudio) {
                            isPlayingMeditationAudio = false
                            synthesizer.stop()
                        } else {
                            isPlayingMeditationAudio = true
                            synthesizer.setVolume(headphoneVolume)
                            synthesizer.setPinkNoiseSurfLevel(pinkNoiseSurfLevel)
                            synthesizer.setFfrGlide(ffrGlideEnabled)
                            synthesizer.setBreathSwell(breathSwellEnabled)
                            synthesizer.setMdrV6Calibration(mdrV6CalibrationEnabled)
                            synthesizer.startPreset(selectedMeditationPreset)
                        }
                    },
                    headphoneVolume = headphoneVolume,
                    onAdjustVolume = { delta ->
                        val nextVol = (headphoneVolume + delta).coerceIn(0.15f, 1.0f)
                        headphoneVolume = nextVol
                        synthesizer.setVolume(nextVol)
                    },
                    voiceCoachEnabled = voiceCoachEnabled,
                    onSpeakCurrentAct = { prompt -> speakPrompt(prompt) },
                    tdcsParams = tdcsParams,
                    tdcsResult = tdcsResult,
                    tmsParams = tmsParams,
                    onOpenAdvancedLab = { showAdvancedLab = true }
                )
            } else {
                when (selectedTab) {
                    0 -> TdcsStudioTab(
                        selectedPreset = selectedMontagePreset,
                        onSelectPreset = { preset ->
                            selectedMontagePreset = preset
                            tdcsAnode = preset.anode
                            tdcsCathode = preset.cathode
                            tdcsCurrentMa = preset.defaultCurrentMa
                            tdcsAreaCm2 = preset.defaultAreaCm2
                            tdcsDurationMin = preset.defaultDurationMin
                        },
                        params = tdcsParams,
                        result = tdcsResult,
                        onAnodeChange = { tdcsAnode = it },
                        onCathodeChange = { tdcsCathode = it },
                        onCurrentChange = { tdcsCurrentMa = it },
                        onAreaChange = { tdcsAreaCm2 = it },
                        onImpedanceChange = { tdcsImpedanceKOhm = it }
                    )

                    1 -> TmsLabTab(
                        params = tmsParams,
                        result = tmsResult,
                        anodeReference = tdcsAnode,
                        cathodeReference = tdcsCathode,
                        onSelectProtocol = { proto ->
                            tmsProtocol = proto
                            tmsTargetSite = proto.defaultSite
                            tmsRmtPct = proto.defaultRmtPct
                        },
                        onSelectTargetSite = { tmsTargetSite = it },
                        onRmtChange = { tmsRmtPct = it },
                        onAngleChange = { tmsCoilAngleDeg = it },
                        onScdChange = { tmsScdMm = it }
                    )

                    2 -> SafetyAndPacingTab(
                        contraindications = contraindications,
                        onUpdateContraindications = { contraindications = it },
                        isSessionRunning = isSessionRunning,
                        sessionElapsedSec = sessionElapsedSec,
                        rampSeconds = tdcsParams.rampSeconds,
                        targetDurationSec = tdcsParams.durationMinutes * 60,
                        onToggleSession = {
                            if (contraindications.isAllCleared()) {
                                isSessionRunning = !isSessionRunning
                            }
                        },
                        onResetSession = {
                            isSessionRunning = false
                            sessionElapsedSec = 0
                        },
                        reducedMotion = reducedMotion,
                        onToggleReducedMotion = { reducedMotion = it },
                        selectedPreset = selectedMeditationPreset,
                        isPlayingAudio = isPlayingMeditationAudio,
                        masterVolume = headphoneVolume,
                        pinkNoiseSurfLevel = pinkNoiseSurfLevel,
                        ffrGlideEnabled = ffrGlideEnabled,
                        breathSwellEnabled = breathSwellEnabled,
                        mdrV6CalibrationEnabled = mdrV6CalibrationEnabled,
                        voiceCoachEnabled = voiceCoachEnabled,
                        onSelectPreset = { preset ->
                            selectedMeditationPreset = preset
                            if (isPlayingMeditationAudio) {
                                synthesizer.startPreset(preset)
                            }
                        },
                        onTogglePlayAudio = {
                            if (isPlayingMeditationAudio) {
                                isPlayingMeditationAudio = false
                                synthesizer.stop()
                            } else {
                                isPlayingMeditationAudio = true
                                synthesizer.setVolume(headphoneVolume)
                                synthesizer.setPinkNoiseSurfLevel(pinkNoiseSurfLevel)
                                synthesizer.setFfrGlide(ffrGlideEnabled)
                                synthesizer.setBreathSwell(breathSwellEnabled)
                                synthesizer.setMdrV6Calibration(mdrV6CalibrationEnabled)
                                synthesizer.startPreset(selectedMeditationPreset)
                            }
                        },
                        onVolumeChange = { vol ->
                            headphoneVolume = vol
                            synthesizer.setVolume(vol)
                        },
                        onPinkNoiseSurfChange = { surf ->
                            pinkNoiseSurfLevel = surf
                            synthesizer.setPinkNoiseSurfLevel(surf)
                        },
                        onToggleFfrGlide = { enabled ->
                            ffrGlideEnabled = enabled
                            synthesizer.setFfrGlide(enabled)
                        },
                        onToggleBreathSwell = { enabled ->
                            breathSwellEnabled = enabled
                            synthesizer.setBreathSwell(enabled)
                        },
                        onToggleMdrV6Calibration = { enabled ->
                            mdrV6CalibrationEnabled = enabled
                            synthesizer.setMdrV6Calibration(enabled)
                        },
                        onToggleVoiceCoach = { voiceCoachEnabled = it },
                        onSpeakPrompt = speakPrompt
                    )

                    3 -> TippssAndFhirTab(
                        tdcsParams = tdcsParams,
                        tdcsResult = tdcsResult,
                        tmsParams = tmsParams,
                        tmsResult = tmsResult,
                        contraindications = contraindications,
                        bleUiState = bleUiState,
                        syncBleImpedanceToTdcs = syncBleImpedanceToTdcs,
                        onToggleSyncImpedance = { syncBleImpedanceToTdcs = it },
                        onStartBleScan = {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                                blePermissionLauncher.launch(
                                    arrayOf(
                                        Manifest.permission.BLUETOOTH_SCAN,
                                        Manifest.permission.BLUETOOTH_CONNECT
                                    )
                                )
                            } else {
                                bleClient.startBleScan()
                            }
                        },
                        onStartVirtualPhantom = { bleClient.startVirtualPhantomLoopback() },
                        onDisconnectBle = { bleClient.disconnect() },
                        onConnectNode = { node -> bleClient.connectToNode(node) },
                        onCopyFhir = { json ->
                            val clipboard =
                                context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            clipboard.setPrimaryClip(ClipData.newPlainText("FHIR_R4_NeuroStim", json))
                            Toast.makeText(
                                context,
                                "HL7 FHIR R4 Bundle + SHA-256 Digest copied",
                                Toast.LENGTH_SHORT
                            ).show()
                        }
                    )
                }
            }
        }
    }
}

/**
 * Project Ataxia 4-Slot Sanctuary View:
 * Enforces the 4-item working memory ceiling and replaces fine-motor sliders with
 * 4 large tremor-safe preset cards + 1 giant Start/Stop button.
 */
@Composable
private fun SanctuaryFourSlotView(
    slots: List<CognitiveProtocolSlot>,
    activeSlotIndex: Int,
    onSelectSlot: (Int) -> Unit,
    isPlayingAudio: Boolean,
    onTogglePlayAudio: () -> Unit,
    headphoneVolume: Float,
    onAdjustVolume: (Float) -> Unit,
    voiceCoachEnabled: Boolean,
    onSpeakCurrentAct: (String) -> Unit,
    tdcsParams: TdcsParameters,
    tdcsResult: com.pocketgull.neurostim.models.TdcsFieldSimulationResult,
    tmsParams: TmsParameters,
    onOpenAdvancedLab: () -> Unit
) {
    val activeSlot = slots[activeSlotIndex]
    var elapsedMs by remember { mutableLongStateOf(0L) }
    var meditationSec by remember { mutableIntStateOf(0) }
    var lastSpokenAct by remember { mutableIntStateOf(0) }

    LaunchedEffect(Unit) {
        val start = System.currentTimeMillis()
        while (true) {
            elapsedMs = (System.currentTimeMillis() - start) % 10_000L
            delay(100L)
        }
    }

    LaunchedEffect(isPlayingAudio, activeSlotIndex) {
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
                    1 -> activeSlot.meditationPreset.act1ArrivalPrompt
                    2 -> activeSlot.meditationPreset.act2EntrainmentPrompt
                    else -> activeSlot.meditationPreset.act3IntegrationPrompt
                }
                onSpeakCurrentAct(prompt)
            }
            delay(1000L)
            meditationSec += 1
        }
    }

    val cycleSeconds = elapsedMs / 1000f
    val isInhale = cycleSeconds < 4.0f
    val breathProgress = if (isInhale) {
        (cycleSeconds / 4.0f).coerceIn(0f, 1f)
    } else {
        (1.0f - ((cycleSeconds - 4.0f) / 6.0f)).coerceIn(0f, 1f)
    }

    val activePrompt = when {
        meditationSec < 45 -> activeSlot.meditationPreset.act1ArrivalPrompt
        meditationSec < 180 -> activeSlot.meditationPreset.act2EntrainmentPrompt
        else -> activeSlot.meditationPreset.act3IntegrationPrompt
    }

    // SLOT 1: Unified 0.1 Hz Breath & Guided Meditation Prompt Banner
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(ObsidianCard, RoundedCornerShape(14.dp))
            .border(1.5.dp, if (isPlayingAudio) CaledonianEmerald else GorseAmberAccent, RoundedCornerShape(14.dp))
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = if (isInhale) {
                    "INHALE (4s) • ${"%.1f".format(cycleSeconds)}s"
                } else {
                    "EXHALE (6s) • ${"%.1f".format(cycleSeconds)}s"
                },
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = if (isInhale) CathodeCobaltTeal else CaledonianEmerald
            )
            Text(
                text = if (isPlayingAudio) {
                    "SONY MDR-V6 LIVE • ${meditationSec / 60}:${"%02d".format(meditationSec % 60)}"
                } else {
                    "SONY MDR-V6 READY (63Ω)"
                },
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = GorseAmberAccent
            )
        }
        Spacer(modifier = Modifier.height(8.dp))
        LinearProgressIndicator(
            progress = { breathProgress },
            modifier = Modifier
                .fillMaxWidth()
                .height(12.dp),
            color = if (isInhale) CathodeCobaltTeal else CaledonianEmerald,
            trackColor = SubtleBorder
        )
        Spacer(modifier = Modifier.height(10.dp))
        Text(
            text = activePrompt,
            fontSize = 14.sp,
            lineHeight = 20.sp,
            color = MaterialTheme.colorScheme.onSurface
        )
    }

    // SLOT 2: 4 Large Tremor-Safe One-Tap Protocol Cards (2x2 Grid, zero sliders)
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(
            text = "Choose 1 of 4 Guided Protocols (Auto-Sets Audio + Cortical Map):",
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            color = WarmSepiaSecondary
        )
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            ProtocolSlotCard(
                slot = slots[0],
                selected = activeSlotIndex == 0,
                onClick = { onSelectSlot(0) },
                modifier = Modifier.weight(1f)
            )
            ProtocolSlotCard(
                slot = slots[1],
                selected = activeSlotIndex == 1,
                onClick = { onSelectSlot(1) },
                modifier = Modifier.weight(1f)
            )
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            ProtocolSlotCard(
                slot = slots[2],
                selected = activeSlotIndex == 2,
                onClick = { onSelectSlot(2) },
                modifier = Modifier.weight(1f)
            )
            ProtocolSlotCard(
                slot = slots[3],
                selected = activeSlotIndex == 3,
                onClick = { onSelectSlot(3) },
                modifier = Modifier.weight(1f)
            )
        }
    }

    // SLOT 3: Giant Tremor-Safe Primary Action Button + Stepper Volume Buttons
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(ObsidianCard, RoundedCornerShape(14.dp))
            .border(1.dp, SubtleBorder, RoundedCornerShape(14.dp))
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Button(
            onClick = onTogglePlayAudio,
            modifier = Modifier
                .fillMaxWidth()
                .height(62.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = if (isPlayingAudio) CaledonianEmerald else GorseAmberAccent
            )
        ) {
            Text(
                text = if (isPlayingAudio) {
                    "STOP SONY MDR-V6 SESSION"
                } else {
                    "START ${activeSlot.shortTitle.uppercase()}"
                },
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedButton(
                onClick = { onAdjustVolume(-0.10f) },
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp)
            ) {
                Text("Vol -10%", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface)
            }
            Text(
                text = "Vol ${(headphoneVolume * 100).roundToInt()}%",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = WarmSepiaSecondary
            )
            OutlinedButton(
                onClick = { onAdjustVolume(0.10f) },
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp)
            ) {
                Text("Vol +10%", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface)
            }
            OutlinedButton(
                onClick = { onSpeakCurrentAct(activePrompt) },
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp)
            ) {
                Text("Speak Cue", fontSize = 12.sp, color = GorseAmberAccent)
            }
        }
    }

    // SLOT 4: Visual 10-20 Cortical Map + Single Expand Button for Advanced Lab
    ScalpMontageCanvas(
        isTmsMode = activeSlot.isTmsViewDefault,
        anodeSite = tdcsParams.anode,
        cathodeSite = tdcsParams.cathode,
        tmsTargetSite = tmsParams.targetSite,
        tmsCoilAngleDeg = tmsParams.coilAngleDegrees,
        fieldSamples = tdcsResult.gridSamples
    )

    OutlinedButton(
        onClick = onOpenAdvancedLab,
        modifier = Modifier
            .fillMaxWidth()
            .height(48.dp)
    ) {
        Text(
            text = "Open Advanced Physics, BLE GATT & FHIR R4 Lab ->",
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            color = WarmSepiaSecondary
        )
    }
}

@Composable
private fun ProtocolSlotCard(
    slot: CognitiveProtocolSlot,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .height(94.dp)
            .background(
                if (selected) Color(0xFF2B2028) else ObsidianCard,
                RoundedCornerShape(12.dp)
            )
            .border(
                width = if (selected) 2.dp else 1.dp,
                color = if (selected) GorseAmberAccent else SubtleBorder,
                shape = RoundedCornerShape(12.dp)
            )
            .clickable { onClick() }
            .padding(10.dp)
    ) {
        Column(verticalArrangement = Arrangement.SpaceBetween) {
            Text(
                text = slot.shortTitle,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = slot.badge,
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                color = GorseAmberAccent
            )
            Text(
                text = slot.subtitle,
                fontSize = 10.sp,
                color = WarmSepiaSecondary,
                maxLines = 2
            )
        }
    }
}

@Composable
private fun TdcsStudioTab(
    selectedPreset: TdcsMontagePreset,
    onSelectPreset: (TdcsMontagePreset) -> Unit,
    params: TdcsParameters,
    result: com.pocketgull.neurostim.models.TdcsFieldSimulationResult,
    onAnodeChange: (Eeg1020Site) -> Unit,
    onCathodeChange: (Eeg1020Site) -> Unit,
    onCurrentChange: (Float) -> Unit,
    onAreaChange: (Float) -> Unit,
    onImpedanceChange: (Float) -> Unit
) {
    SafetyBanner(status = result.safetyStatus, advisory = result.safetyAdvisory)

    ScalpMontageCanvas(
        isTmsMode = false,
        anodeSite = params.anode,
        cathodeSite = params.cathode,
        tmsTargetSite = params.anode,
        tmsCoilAngleDeg = 45,
        fieldSamples = result.gridSamples
    )

    // Canonical Clinical Montage Presets
    SectionCard(title = "Canonical 10-20 Montage Presets") {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            CanonicalTdcsMontages.ALL.forEach { preset ->
                val isSelected = preset.id == selectedPreset.id
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
                                text = preset.evidenceTier.badge,
                                fontSize = 10.sp,
                                color = GorseAmberAccent,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                        Text(
                            text = preset.subtitle,
                            fontSize = 11.sp,
                            color = WarmSepiaSecondary
                        )
                    }
                }
            }
        }
    }

    // Electrode Site Pickers & Parametric Controls
    SectionCard(title = "Dipole Montage & Constant-Current Parameters") {
        Text(
            text = "Anode (+) Excitation Site: ${params.anode.code} (${params.anode.anatomicalName})",
            color = AnodeCoralRed,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold
        )
        SiteSelectorRow(selectedSite = params.anode, onSelectSite = onAnodeChange)

        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Cathode (-) Return Site: ${params.cathode.code} (${params.cathode.anatomicalName})",
            color = CathodeCobaltTeal,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold
        )
        SiteSelectorRow(selectedSite = params.cathode, onSelectSite = onCathodeChange)

        Spacer(modifier = Modifier.height(10.dp))
        Text(
            text = "Direct Current Intensity: ${"%.2f".format(params.currentMa)} mA (Bikson Nominal <= 2.0 mA)",
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurface
        )
        Slider(
            value = params.currentMa,
            onValueChange = { onCurrentChange((it * 20f).roundToInt() / 20f) },
            valueRange = 0.5f..3.0f
        )

        Text(
            text = "Saline Sponge Electrode Area: ${params.spongeAreaCm2.roundToInt()} cm²",
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurface
        )
        Slider(
            value = params.spongeAreaCm2,
            onValueChange = { onAreaChange(it.roundToInt().toFloat()) },
            valueRange = 9.0f..35.0f
        )

        Text(
            text = "Simulated Contact Impedance: ${"%.1f".format(params.simulatedImpedanceKOhm)} kOhm",
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurface
        )
        Slider(
            value = params.simulatedImpedanceKOhm,
            onValueChange = { onImpedanceChange((it * 10f).roundToInt() / 10f) },
            valueRange = 0.5f..18.0f
        )
    }

    // Biophysical Telemetry Readout Grid (4-Slot Layout)
    SectionCard(title = "In-Silico Cortical Field & Charge Telemetry") {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            MetricTile(
                label = "Current Density J",
                value = "${result.currentDensityMaPerCm2} mA/cm²",
                sub = "${result.currentDensityAm2} A/m²",
                modifier = Modifier.weight(1f)
            )
            MetricTile(
                label = "Peak Cortical E",
                value = "${result.peakCorticalElectricFieldVm} V/m",
                sub = "Shunt ${result.shuntingFractionPct}%",
                modifier = Modifier.weight(1f)
            )
        }
        Spacer(modifier = Modifier.height(8.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            MetricTile(
                label = "Total Charge Q",
                value = "${result.totalChargeCoulombs} C",
                sub = "σQ = ${result.chargeDensityCPerCm2} C/cm²",
                modifier = Modifier.weight(1f)
            )
            MetricTile(
                label = "Compliance V",
                value = "${result.complianceVoltageV} V",
                sub = "Arc ${result.interElectrodeDistanceCm} cm",
                modifier = Modifier.weight(1f)
            )
        }
    }

    // Popperian Epistemology & Natural Frequency Card
    SectionCard(title = "Popperian Falsifiability (H0) & Natural Frequencies") {
        Text(
            text = selectedPreset.nullHypothesisH0,
            fontSize = 12.sp,
            color = WarmSepiaSecondary
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "p-value vs. Sham: p = ${selectedPreset.pValueVsSham} • ${selectedPreset.evidenceTier.badge}",
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = CaledonianEmerald
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "Gigerenzer Natural Frequency: ${selectedPreset.naturalFrequencyOutOf10000}",
            fontSize = 11.sp,
            color = MutedStone
        )
    }
}

@Composable
private fun TmsLabTab(
    params: TmsParameters,
    result: com.pocketgull.neurostim.models.TmsSimulationResult,
    anodeReference: Eeg1020Site,
    cathodeReference: Eeg1020Site,
    onSelectProtocol: (TmsProtocolType) -> Unit,
    onSelectTargetSite: (Eeg1020Site) -> Unit,
    onRmtChange: (Int) -> Unit,
    onAngleChange: (Int) -> Unit,
    onScdChange: (Float) -> Unit
) {
    SafetyBanner(status = result.ifcnRossiSafetyStatus, advisory = result.ifcnRossiAdvisory)

    ScalpMontageCanvas(
        isTmsMode = true,
        anodeSite = anodeReference,
        cathodeSite = cathodeReference,
        tmsTargetSite = params.targetSite,
        tmsCoilAngleDeg = params.coilAngleDegrees,
        fieldSamples = emptyList()
    )

    TmsPulseOscilloscopeView(
        samples = result.pulseWaveformSamples,
        protocolLabel = params.protocol.title
    )

    SectionCard(title = "rTMS / Theta-Burst (iTBS / cTBS) Protocol Selector") {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            TmsProtocolType.entries.forEach { proto ->
                val isSelected = proto == params.protocol
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
                        .clickable { onSelectProtocol(proto) }
                        .padding(10.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = proto.title,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = proto.evidenceTier.badge,
                                fontSize = 10.sp,
                                color = GorseAmberAccent
                            )
                        }
                        Text(
                            text = "${proto.subtitle} • ${proto.synapticEffect}",
                            fontSize = 11.sp,
                            color = WarmSepiaSecondary
                        )
                    }
                }
            }
        }
    }

    SectionCard(title = "Figure-of-8 Coil Targeting & Stokes Depth Calibration") {
        Text(
            text = "Cortical Target Node: ${params.targetSite.code} (${params.targetSite.anatomicalName})",
            color = GorseAmberAccent,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold
        )
        SiteSelectorRow(selectedSite = params.targetSite, onSelectSite = onSelectTargetSite)

        Spacer(modifier = Modifier.height(10.dp))
        Text(
            text = "Intensity (% Resting Motor Threshold): ${params.restingMotorThresholdPct}% rMT",
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurface
        )
        Slider(
            value = params.restingMotorThresholdPct.toFloat(),
            onValueChange = { onRmtChange(it.roundToInt()) },
            valueRange = 60f..140f
        )

        Text(
            text = "Coil Orientation Angle: ${params.coilAngleDegrees}° (45° Parasagittal Optimal)",
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurface
        )
        Slider(
            value = params.coilAngleDegrees.toFloat(),
            onValueChange = { onAngleChange(it.roundToInt()) },
            valueRange = 0f..90f
        )

        Text(
            text = "Scalp-to-Cortex Distance (Stokes SCD): ${"%.1f".format(params.scalpToCortexDistanceMm)} mm",
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurface
        )
        Slider(
            value = params.scalpToCortexDistanceMm,
            onValueChange = { onScdChange((it * 2f).roundToInt() / 2f) },
            valueRange = 10f..25f
        )
    }

    SectionCard(title = "Faraday-Maxwell Induction Telemetry") {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            MetricTile(
                label = "Peak Flux B",
                value = "${result.peakMagneticFluxTesla} T",
                sub = "dB/dt = ${result.dBdtKiloTeslaPerSec} kT/s",
                modifier = Modifier.weight(1f)
            )
            MetricTile(
                label = "Induced Cortical E",
                value = "${result.inducedCorticalElectricFieldVm} V/m",
                sub = "Depth ${result.effectivePenetrationDepthMm} mm",
                modifier = Modifier.weight(1f)
            )
        }
        Spacer(modifier = Modifier.height(8.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            MetricTile(
                label = "Total Pulse Count",
                value = "${result.totalPulses} pulses",
                sub = "Duration ${result.totalDurationSeconds}s",
                modifier = Modifier.weight(1f)
            )
            MetricTile(
                label = "Focal Area (HVA)",
                value = "${result.focalHalfValueAreaCm2} cm²",
                sub = "Duty ${result.dutyCyclePct}%",
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
private fun SafetyAndPacingTab(
    contraindications: SafetyContraindicationState,
    onUpdateContraindications: (SafetyContraindicationState) -> Unit,
    isSessionRunning: Boolean,
    sessionElapsedSec: Int,
    rampSeconds: Int,
    targetDurationSec: Int,
    onToggleSession: () -> Unit,
    onResetSession: () -> Unit,
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
    onSpeakPrompt: (String) -> Unit
) {
    val allCleared = contraindications.isAllCleared()
    SafetyBanner(
        status = if (allCleared) SafetyGateStatus.NOMINAL else SafetyGateStatus.LOCKOUT,
        advisory = if (allCleared) {
            "All 4 mandatory clinical contraindication gates verified."
        } else {
            contraindications.activeLockoutReasons().joinToString(" • ")
        }
    )

    MayerWavePacerCard(
        reducedMotion = reducedMotion,
        onToggleReducedMotion = onToggleReducedMotion,
        selectedPreset = selectedPreset,
        isPlayingAudio = isPlayingAudio,
        masterVolume = masterVolume,
        pinkNoiseSurfLevel = pinkNoiseSurfLevel,
        ffrGlideEnabled = ffrGlideEnabled,
        breathSwellEnabled = breathSwellEnabled,
        mdrV6CalibrationEnabled = mdrV6CalibrationEnabled,
        voiceCoachEnabled = voiceCoachEnabled,
        onSelectPreset = onSelectPreset,
        onTogglePlayAudio = onTogglePlayAudio,
        onVolumeChange = onVolumeChange,
        onPinkNoiseSurfChange = onPinkNoiseSurfChange,
        onToggleFfrGlide = onToggleFfrGlide,
        onToggleBreathSwell = onToggleBreathSwell,
        onToggleMdrV6Calibration = onToggleMdrV6Calibration,
        onToggleVoiceCoach = onToggleVoiceCoach,
        onSpeakPrompt = onSpeakPrompt
    )

    SectionCard(title = "Mandatory Pre-Flight Contraindication Screening (4 Gates)") {
        CheckItem(
            checked = contraindications.noIntracranialMetalOrClips,
            label = "1. No intracranial ferromagnetic metal, cochlear implant, or aneurysm clips",
            onCheckedChange = {
                onUpdateContraindications(contraindications.copy(noIntracranialMetalOrClips = it))
            }
        )
        CheckItem(
            checked = contraindications.noCardiacPacemakerOrIcd,
            label = "2. No implanted cardiac pacemaker, ICD, or cervical vagus/deep-brain stimulator",
            onCheckedChange = {
                onUpdateContraindications(contraindications.copy(noCardiacPacemakerOrIcd = it))
            }
        )
        CheckItem(
            checked = contraindications.noEpilepsyOrSeizureHistory,
            label = "3. No history of unprovoked seizures, epilepsy, or acute skull defect/craniotomy",
            onCheckedChange = {
                onUpdateContraindications(contraindications.copy(noEpilepsyOrSeizureHistory = it))
            }
        )
        CheckItem(
            checked = contraindications.intactScalpSkinAndImpedanceOk,
            label = "4. Intact scalp skin at 10-20 sites and saline sponge contact impedance < 15 kOhm",
            onCheckedChange = {
                onUpdateContraindications(contraindications.copy(intactScalpSkinAndImpedanceOk = it))
            }
        )
    }

    SectionCard(title = "Protocol Ramp & Session Timer (30s Ramp Envelope)") {
        val phaseLabel = when {
            !isSessionRunning && sessionElapsedSec == 0 -> "STANDBY • READY FOR IN-SILICO / PROTOCOL TIMER"
            sessionElapsedSec < rampSeconds -> "RAMP-UP PHASE (${sessionElapsedSec}s / ${rampSeconds}s)"
            sessionElapsedSec < targetDurationSec - rampSeconds -> "STEADY-STATE PHASE (${sessionElapsedSec}s / ${targetDurationSec}s)"
            sessionElapsedSec < targetDurationSec -> "RAMP-DOWN PHASE (${sessionElapsedSec}s / ${targetDurationSec}s)"
            else -> "SESSION COMPLETE (${targetDurationSec}s)"
        }
        Text(
            text = phaseLabel,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            color = if (allCleared) CaledonianEmerald else LockoutCrimson
        )
        Spacer(modifier = Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Button(
                onClick = onToggleSession,
                enabled = allCleared,
                colors = ButtonDefaults.buttonColors(containerColor = GorseAmberAccent)
            ) {
                Text(
                    text = if (isSessionRunning) "Pause Protocol Timer" else "Start Protocol Timer",
                    fontWeight = FontWeight.Bold
                )
            }
            OutlinedButton(onClick = onResetSession) {
                Text("Reset Timer", color = MaterialTheme.colorScheme.onSurface)
            }
        }
    }
}

@Composable
private fun TippssAndFhirTab(
    tdcsParams: TdcsParameters,
    tdcsResult: com.pocketgull.neurostim.models.TdcsFieldSimulationResult,
    tmsParams: TmsParameters,
    tmsResult: com.pocketgull.neurostim.models.TmsSimulationResult,
    contraindications: SafetyContraindicationState,
    bleUiState: BleTelemetryUiState,
    syncBleImpedanceToTdcs: Boolean,
    onToggleSyncImpedance: (Boolean) -> Unit,
    onStartBleScan: () -> Unit,
    onStartVirtualPhantom: () -> Unit,
    onDisconnectBle: () -> Unit,
    onConnectNode: (DiscoveredBleNode) -> Unit,
    onCopyFhir: (String) -> Unit
) {
    val snapshot = remember(
        tdcsParams,
        tdcsResult,
        tmsParams,
        tmsResult,
        contraindications,
        bleUiState.liveRssiDbm,
        bleUiState.liveSqiPct
    ) {
        TippssFhirExporter.buildTippssSnapshot(
            tdcsParams = tdcsParams,
            tdcsResult = tdcsResult,
            tmsParams = tmsParams,
            tmsResult = tmsResult,
            contraindications = contraindications,
            simulatedBleRssiDbm = bleUiState.liveRssiDbm,
            signalQualityIndexPct = bleUiState.liveSqiPct
        )
    }
    val fhirJson = remember(
        tdcsParams,
        tdcsResult,
        tmsParams,
        tmsResult,
        contraindications,
        bleUiState.liveRssiDbm,
        bleUiState.liveSqiPct
    ) {
        TippssFhirExporter.exportFhirR4BundleJson(
            tdcsParams = tdcsParams,
            tdcsResult = tdcsResult,
            tmsParams = tmsParams,
            tmsResult = tmsResult,
            contraindications = contraindications,
            timestampIso = "2026-11-17T16:35:00Z"
        )
    }

    // Live BLE GATT Scanner & Benchtop Phantom Bridge Card
    SectionCard(title = "BLE GATT Hardware Bridge (OpenBCI / Muse / Arduino Phantom)") {
        Text(
            text = "Link State: ${bleUiState.connectionState.badge} (${bleUiState.connectedDeviceName})",
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = when (bleUiState.connectionState) {
                BleConnectionState.CONNECTED_LIVE,
                BleConnectionState.VIRTUAL_PHANTOM_LOOPBACK -> CaledonianEmerald
                BleConnectionState.SCANNING,
                BleConnectionState.CONNECTING -> GorseAmberAccent
                BleConnectionState.DISCONNECTED -> WarmSepiaSecondary
            }
        )
        Text(
            text = bleUiState.statusMessage,
            fontSize = 11.sp,
            color = MutedStone
        )
        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = onStartBleScan,
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(containerColor = GorseAmberAccent)
            ) {
                Text("Scan BLE", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
            OutlinedButton(
                onClick = onStartVirtualPhantom,
                modifier = Modifier.weight(1f)
            ) {
                Text("10kΩ Phantom", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface)
            }
            OutlinedButton(
                onClick = onDisconnectBle,
                modifier = Modifier.weight(1f)
            ) {
                Text("Stop", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface)
            }
        }

        Spacer(modifier = Modifier.height(8.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            MetricTile(
                label = "BLE RSSI",
                value = "${bleUiState.liveRssiDbm} dBm",
                sub = if (bleUiState.liveRssiDbm >= -85) "Gate >= -85 OK" else "Weak Link",
                modifier = Modifier.weight(1f)
            )
            MetricTile(
                label = "Phantom Load Z",
                value = "${bleUiState.liveImpedanceKOhm} kΩ",
                sub = "SQI ${bleUiState.liveSqiPct}%",
                modifier = Modifier.weight(1f)
            )
        }
        Spacer(modifier = Modifier.height(6.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            MetricTile(
                label = "EEG θ/α Ratio",
                value = "${bleUiState.liveThetaAlphaRatio}",
                sub = "Packets: ${bleUiState.packetsReceived}",
                modifier = Modifier.weight(1f)
            )
            MetricTile(
                label = "Last GATT Frame",
                value = bleUiState.lastPayloadPreview.take(16),
                sub = "UUID 0x2934 / NUS",
                modifier = Modifier.weight(1f)
            )
        }

        CheckItem(
            checked = syncBleImpedanceToTdcs,
            label = "Sync live BLE / Phantom impedance (Z) directly into tDCS Physics Engine",
            onCheckedChange = onToggleSyncImpedance
        )

        if (bleUiState.discoveredNodes.isNotEmpty()) {
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Discovered BLE Peripherals (${bleUiState.discoveredNodes.size}):",
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = WarmSepiaSecondary
            )
            Spacer(modifier = Modifier.height(4.dp))
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                bleUiState.discoveredNodes.take(6).forEach { node ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(ObsidianSurface, RoundedCornerShape(8.dp))
                            .border(1.dp, SubtleBorder, RoundedCornerShape(8.dp))
                            .padding(8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "${node.name} (${node.rssiDbm} dBm)",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "${node.profileBadge} • ${node.address}",
                                fontSize = 10.sp,
                                color = MutedStone
                            )
                        }
                        OutlinedButton(onClick = { onConnectNode(node) }) {
                            Text("Pair", fontSize = 11.sp, color = GorseAmberAccent)
                        }
                    }
                }
            }
        }
    }

    SectionCard(title = "IEEE P2933™ TIPPSS 6-Pillar Clinical Trust & NIST SP 800-90A") {
        Text(
            text = "1. Hardware Root of Trust: VERIFIED • 2. Patient Binding: DE-IDENTIFIED SAFE HARBOR",
            fontSize = 12.sp,
            color = CaledonianEmerald,
            fontWeight = FontWeight.SemiBold
        )
        Text(
            text = "3. Micro-Consent & Safety Gates: ${if (snapshot.microConsentGranted) "GRANTED (4/4)" else "LOCKED OUT"}",
            fontSize = 12.sp,
            color = if (snapshot.microConsentGranted) CaledonianEmerald else LockoutCrimson
        )
        Text(
            text = "4. Live BLE RSSI: ${snapshot.simulatedBleRssiDbm} dBm (Gate >= -85 dBm) • 5. SQI: ${snapshot.signalQualityIndexPct}%",
            fontSize = 12.sp,
            color = WarmSepiaSecondary
        )
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = "6. FDA 21 CFR Part 11 SHA-256 Digest:",
            fontSize = 11.sp,
            color = MutedStone
        )
        Text(
            text = snapshot.sha256IntegrityDigest,
            fontSize = 11.sp,
            fontFamily = FontFamily.Monospace,
            color = GorseAmberAccent
        )
    }

    SectionCard(title = "HL7 FHIR R4 Bundle Export (Procedure + DeviceMetric)") {
        Button(
            onClick = { onCopyFhir(fhirJson) },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = GorseAmberAccent)
        ) {
            Text("Copy HL7 FHIR R4 Bundle JSON to Clipboard", fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.height(8.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF0A0709), RoundedCornerShape(8.dp))
                .border(1.dp, SubtleBorder, RoundedCornerShape(8.dp))
                .padding(10.dp)
        ) {
            Text(
                text = fhirJson,
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace,
                color = WarmSepiaSecondary
            )
        }
    }
}

@Composable
private fun SiteSelectorRow(
    selectedSite: Eeg1020Site,
    onSelectSite: (Eeg1020Site) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Eeg1020Site.entries.forEach { site ->
            FilterChip(
                selected = site == selectedSite,
                onClick = { onSelectSite(site) },
                label = { Text(site.code, fontSize = 11.sp) }
            )
        }
    }
}

@Composable
private fun SafetyBanner(status: SafetyGateStatus, advisory: String) {
    val borderColor = when (status) {
        SafetyGateStatus.NOMINAL -> CaledonianEmerald
        SafetyGateStatus.CAUTION -> CautionGold
        SafetyGateStatus.LOCKOUT -> LockoutCrimson
    }
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(ObsidianCard, RoundedCornerShape(10.dp))
            .border(1.5.dp, borderColor, RoundedCornerShape(10.dp))
            .padding(12.dp)
    ) {
        Text(
            text = status.label,
            color = borderColor,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = advisory,
            color = MaterialTheme.colorScheme.onSurface,
            fontSize = 11.sp
        )
    }
}

@Composable
private fun SectionCard(
    title: String,
    content: @Composable () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(ObsidianCard, RoundedCornerShape(12.dp))
            .border(1.dp, SubtleBorder, RoundedCornerShape(12.dp))
            .padding(14.dp)
    ) {
        Text(
            text = title,
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
        )
        Spacer(modifier = Modifier.height(8.dp))
        content()
    }
}

@Composable
private fun MetricTile(
    label: String,
    value: String,
    sub: String,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .background(ObsidianSurface, RoundedCornerShape(8.dp))
            .border(1.dp, SubtleBorder, RoundedCornerShape(8.dp))
            .padding(10.dp)
    ) {
        Text(text = label, fontSize = 11.sp, color = MutedStone)
        Text(
            text = value,
            fontSize = 15.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace,
            color = MaterialTheme.colorScheme.onSurface
        )
        Text(text = sub, fontSize = 10.sp, color = WarmSepiaSecondary)
    }
}

@Composable
private fun CheckItem(
    checked: Boolean,
    label: String,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onCheckedChange(!checked) }
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Checkbox(checked = checked, onCheckedChange = onCheckedChange)
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = label,
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurface
        )
    }
}
