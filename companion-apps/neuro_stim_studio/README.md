# PocketGull NeuroStim Studio (`com.pocketgull.neurostim`)

**Badge:** `[EXPLORATORY IN SILICO MODEL • NON-DIAGNOSTIC]`

A standalone Kotlin + Jetpack Compose companion studio for **Transcranial Direct-Current Stimulation (tDCS)** and **Transcranial Magnetic Stimulation (rTMS / iTBS)** in-silico biophysical modeling, 10–20 EEG montage planning, IEEE P2933™ TIPPSS telemetry, and safe sensory entrainment pacing.

## Architecture & 4-Slot Working Memory Layout
1. **1. tDCS Studio (`TdcsPhysicsEngine`)**:
   - Interactive International 10–20 EEG scalp topography canvas with 2D cortical dipole $E$-field contour heatmap (`Fp1`, `Fp2`, `F3`, `Fz`, `F4`, `C3`, `Cz`, `C4`, `P3`, `Pz`, `P4`, `Oz`, `Iz`).
   - Canonical clinical montages (`Left DLPFC F3+/Fp2-`, `Bifrontal F3+/F4-`, `M1 Motor C3+/Fp2-`, `Cerebello-Prefrontal Iz+/Fp2-`) with Cochrane Evidence Tiers (`Level A/B`), Popperian $H_0$ falsifiability statements, and Gigerenzer natural frequencies out of 10,000.
   - Real-time Bikson & Nitsche biophysical safety envelope verification ($J = I/A \le 0.080\text{ mA/cm}^2$, $\sigma_Q \le 0.096\text{ C/cm}^2$, impedance $Z \in [0.8, 15.0]\text{ k}\Omega$).
2. **2. TMS / iTBS Lab (`TmsProtocolEngine`)**:
   - Figure-of-8 induction coil orientation canvas ($45^\circ$ parasagittal optimal vector) and biphasic $\frac{dB}{dt}$ pulse train oscilloscope.
   - Models **iTBS** ($50\text{ Hz}$ bursts at $5\text{ Hz}$, 600 pulses), **cTBS** ($40\text{ s}$ inhibitory), **10 Hz High-Frequency rTMS**, and **1 Hz Low-Frequency rTMS** with Stokes scalp-to-cortex distance attenuation and IFCN Rossi et al. (2021) safety lockouts.
3. **3. Safety & Pace (`MayerWaveAndWaveformView` + `NeuroEntrainmentSynthesizer`)**:
   - Mandatory 4-Gate Contraindication Pre-Flight Checklist (intracranial metal/clips, cardiac pacemaker/ICD, seizure history, scalp/impedance integrity).
   - 0.1 Hz Mayer Wave respiratory pacer ($4.0\text{ s}$ inhale / $6.0\text{ s}$ exhale) with WCAG 2.2 §2.3.3 reduced-motion static hold.
   - Safe non-invasive hardware acoustic proxy playing PCM stereo isochronic/binaural tones at $5\text{ Hz}$ (Theta-Burst), $10\text{ Hz}$ (Alpha/rTMS), or $40\text{ Hz}$ (Gamma).
4. **4. TIPPSS & FHIR (`TippssFhirExporter`)**:
   - IEEE P2933™ TIPPSS 6-pillar telemetry, NIST SP 800-90A 53-bit CSPRNG, FDA 21 CFR Part 11 SHA-256 integrity digest, and one-tap HL7 FHIR R4 `Bundle` (`Procedure` + `DeviceMetric`) JSON export.
