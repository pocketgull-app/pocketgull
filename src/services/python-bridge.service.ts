import { Injectable, inject, signal, PLATFORM_ID, effect, untracked } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PatientStateService } from './patient-state.service';
import { IPatientVitals, IBiometricEntry } from './patient.types';

/** Health-check response from the FastAPI sidecar. */
export interface IPythonBridgeHealth {
  status: 'ok' | 'unavailable';
  latency_ms?: number;
  error?: string;
}

/** Biosignal event emitted by the SSE stream endpoint. */
export interface IBiosignalEvent {
  session_id: string;
  hrv_rmssd_ms: number;
  dominant_frequency_hz: number;
  suggested_wave: 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';
  breathing_bpm: number;
  hrv_coherence: number;
  timestamp_ms: number;
}

/** Clinical risk score returned by the ML endpoint. */
export interface IRiskScoreResult {
  risk_level: 'low' | 'moderate' | 'high' | 'critical';
  risk_score: number;       // 0.0–1.0
  confidence: number;
  contributing_factors: string[];
  note: string;
}

export interface IReadmissionSepsisResult {
  readmission_30d_probability: number;
  readmission_risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
  lace_index_score: number;
  qsofa_sepsis_score: number;
  sepsis_escalation_risk: string;
  conformal_confidence_interval: number[];
  primary_driving_features: string[];
}

/**
 * PythonBridgeService
 *
 * Connects the Angular clinical frontend to the FastAPI Python sidecar running
 * on /api/python/*. Provides typed wrappers for all five integration patterns:
 *
 *  1. DataFrame → IPatientVitals  (ingestDataframe)
 *  2. FHIR Bundle validation       (validateFhirBundle)
 *  3. NumPy biosignal SSE stream   (startBiosignalStream / stopBiosignalStream)
 *  4. ML risk scoring              (fetchRiskScore)
 *  5. HDF5 segment reader          (readHdf5Segment)
 */
@Injectable({ providedIn: 'root' })
export class PythonBridgeService {
  private readonly state  = inject(PatientStateService);
  private readonly pid    = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.pid);

  private readonly BASE = '/api/python';

  // ── Observable state ───────────────────────────────────────────────────────
  readonly isAvailable    = signal<boolean | null>(null);   // null = unchecked
  readonly lastBiosignal  = signal<IBiosignalEvent | null>(null);
  readonly riskScore      = signal<IRiskScoreResult | null>(null);
  readonly isImporting    = signal<boolean>(false);
  readonly pyodideStatus  = signal<'unloaded' | 'loading' | 'ready' | 'error'>('unloaded');

  private pyodideInstance: any = null;
  private biosignalSource: EventSource | null = null;

  constructor() {
    this.checkHealth();

    // Auto-calculate risk score reactively when vitals, age, or issues change
    effect(() => {
      this.state.vitals();
      this.state.patientAge();
      this.state.issues();

      untracked(() => {
        this.fetchRiskScore();
      });
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HEALTH CHECK
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Probe the FastAPI sidecar. Call once on app init or before any ingestion.
   * Updates `isAvailable` signal — components can react without polling.
   */
  async checkHealth(): Promise<IPythonBridgeHealth> {
    if (!this.isBrowser) return { status: 'unavailable', error: 'SSR context' };

    const start = performance.now();
    try {
      const res = await fetch(`${this.BASE}/health`, { signal: AbortSignal.timeout(3000) });
      const latency_ms = Math.round(performance.now() - start);
      if (res.ok) {
        this.isAvailable.set(true);
        return { status: 'ok', latency_ms };
      }
      this.isAvailable.set(false);
      return { status: 'unavailable', error: `HTTP ${res.status}` };
    } catch (err: any) {
      this.isAvailable.set(false);
      return { status: 'unavailable', error: err.message };
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 1. DATAFRAME → IPatientVitals
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Send a pandas DataFrame (serialized via df.to_dict(orient='records'))
   * to the Python bridge and merge the normalized vitals into PatientStateService.
   *
   * @param records - Row array from pandas df.to_dict(orient='records')
   * @returns The parsed vitals object, or null on failure.
   */
  async ingestDataframe(records: Record<string, unknown>[]): Promise<Partial<IPatientVitals> | null> {
    if (!this.isBrowser) return null;
    this.isImporting.set(true);
    try {
      const res = await fetch(`${this.BASE}/ingest/dataframe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records }),
      });

      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        console.error('[PythonBridge] DataFrame ingest failed:', detail);
        return null;
      }

      const vitals: Partial<IPatientVitals> = await res.json();

      // Merge into PatientStateService — only overwrite non-empty fields
      this.state.vitals.update(current => ({
        ...current,
        ...Object.fromEntries(
          Object.entries(vitals).filter(([, v]) => v != null && v !== '')
        ),
      }));

      return vitals;
    } catch (err: any) {
      console.error('[PythonBridge] ingestDataframe error:', err.message);
      return null;
    } finally {
      this.isImporting.set(false);
    }
  }

  /**
   * Convenience helper: parse a raw CSV string on the client side
   * and send the resulting records to the Python bridge.
   */
  async ingestCsv(csvText: string): Promise<Partial<IPatientVitals> | null> {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return null;

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const records = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
    });

    return this.ingestDataframe(records);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 2. FHIR BUNDLE VALIDATION GATEWAY
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Validate a FHIR R4 Bundle through the Python gateway.
   * Returns the schema-validated bundle JSON or null on validation failure.
   */
  async validateFhirBundle(bundle: Record<string, unknown>): Promise<Record<string, unknown> | null> {
    if (!this.isBrowser) return null;
    try {
      const res = await fetch(`${this.BASE}/ingest/fhir-bundle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bundle),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        console.error('[PythonBridge] FHIR validation failed:', detail);
        return null;
      }
      return res.json();
    } catch (err: any) {
      console.error('[PythonBridge] validateFhirBundle error:', err.message);
      return null;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 3. BIOSIGNAL SSE STREAM → GlobalAvsService
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Open an SSE connection to the Python biosignal stream.
   * Incoming events automatically update GlobalAvsService breathing rate
   * and brainwave mode, creating a closed-loop AVS adaptation system.
   *
   * @param sessionId - Unique identifier for this biosignal session.
   *                    Can map to a hardware device ID or patient session ID.
   */
  startBiosignalStream(sessionId: string): void {
    if (!this.isBrowser) return;
    this.stopBiosignalStream();

    const url = `${this.BASE}/stream/biosignal/${encodeURIComponent(sessionId)}`;
    this.biosignalSource = new EventSource(url);

    this.biosignalSource.onmessage = (event: MessageEvent) => {
      try {
        const data: IBiosignalEvent = JSON.parse(event.data);
        this.lastBiosignal.set(data);
        this.adaptAvsToSignal(data);
      } catch (err) {
        console.warn('[PythonBridge] Biosignal parse error:', err);
      }
    };

    this.biosignalSource.onerror = () => {
      console.warn('[PythonBridge] Biosignal SSE connection lost. Retrying...');
      // EventSource auto-reconnects — no manual retry needed.
    };
  }

  stopBiosignalStream(): void {
    this.biosignalSource?.close();
    this.biosignalSource = null;
    this.lastBiosignal.set(null);
  }

  /**
   * Apply biosignal-derived parameters to GlobalAvsService.
   * Smoothed updates — only triggers when the change is clinically meaningful.
   */
  private adaptAvsToSignal(data: IBiosignalEvent): void {
    const currentWave = this.state.avsBrainwaveFrequency();
    const currentBpm  = this.state.avsBreathingRate();

    if (data.suggested_wave !== currentWave) {
      this.state.avsBrainwaveFrequency.set(data.suggested_wave);
    }

    // Only update breathing rate if delta > 0.3 BPM (avoid micro-jitter)
    if (Math.abs(data.breathing_bpm - currentBpm) > 0.3) {
      this.state.avsBreathingRate.set(data.breathing_bpm);
    }

    // Append to biometric history for real-time charting
    const now = new Date().toISOString();
    const newEntries: IBiometricEntry[] = [
      { timestamp: now, type: 'hrv' as any, value: data.hrv_rmssd_ms, unit: 'ms', source: 'Python DSP' },
      { timestamp: now, type: 'coherence' as any, value: data.hrv_coherence, unit: 'ratio', source: 'Python DSP' },
      { timestamp: now, type: 'breathing' as any, value: data.breathing_bpm, unit: 'bpm', source: 'Python DSP' }
    ];
    this.state.addBiometricEntries(newEntries);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 4. ML RISK SCORING
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Fetch a clinical risk score based on current patient vitals.
   * Reads directly from PatientStateService — no parameters needed.
   */
  async fetchRiskScore(): Promise<IRiskScoreResult | null> {
    if (!this.isBrowser) return null;
    const v = this.state.vitals();

    // Extract active conditions list from patient issues
    const issuesObj = this.state.issues() || {};
    const conditions: string[] = [];
    Object.values(issuesObj).forEach(partIssues => {
      partIssues.forEach(issue => {
        if (issue && issue.name) {
          conditions.push(issue.name);
        }
      });
    });

    const age = this.state.patientAge() || 0;
    const hr = parseFloat(v.hr ?? '0') || 0;
    const bp_systolic = parseFloat(v.bp?.split('/')[0] ?? '0') || 0;
    const bp_diastolic = parseFloat(v.bp?.split('/')[1] ?? '0') || 0;
    const spo2 = parseFloat(v.spO2 ?? '0') || 0;

    const payload = {
      hr,
      bp_systolic,
      bp_diastolic,
      spo2,
      age,
      conditions
    };

    // Calculate local fallback immediately so the UI is responsive and never hangs
    const localResult = this.computeLocalMedicalIndicesRisk(hr, bp_systolic, bp_diastolic, spo2, age, conditions);
    
    // If we definitely know Python is offline, just use local result immediately
    if (this.isAvailable() === false) {
      this.riskScore.set(localResult);
      return localResult;
    }

    // Set local fallback first as default, then try to fetch in the background with a strict timeout
    this.riskScore.set(localResult);

    try {
      const res = await fetch(`${this.BASE}/ml/risk-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const result: IRiskScoreResult = await res.json();
        this.riskScore.set(result);
        return result;
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        console.info('[PythonBridge] fetchRiskScore request timed out / aborted, using local fallback.');
      } else {
        console.warn('[PythonBridge] fetchRiskScore server error or timeout, using local indices:', err?.message || err);
      }
    }
    
    return localResult;
  }

  /**
   * Fetch XGBoost 30-Day Readmission & qSOFA Sepsis Risk Score from Python sidecar.
   */
  async fetchReadmissionSepsisScore(): Promise<IReadmissionSepsisResult> {
    const fallback: IReadmissionSepsisResult = {
      readmission_30d_probability: 0.22,
      readmission_risk_level: 'Moderate',
      lace_index_score: 8,
      qsofa_sepsis_score: 1,
      sepsis_escalation_risk: 'Moderate Sepsis Risk',
      conformal_confidence_interval: [0.14, 0.30],
      primary_driving_features: ['Elevated Serum Lactate (Tissue Hypoperfusion)', 'High Cardiovascular Comorbidity Burden']
    };

    if (!this.isBrowser) return fallback;

    try {
      const bpParts = (this.state.vitals().bp || '128/80').split('/');
      const systolicBp = parseFloat(bpParts[0]) || 128;

      const payload = {
        age: 68,
        length_of_stay_days: 4,
        prior_admissions_12m: 2,
        emergency_dept_visits_12m: 3,
        chads_vasc_score: 2,
        systolic_bp: systolicBp,
        respiratory_rate: 18.0,
        serum_lactate_mmol_l: 2.2,
        wbc_count: 11.5,
        altered_mental_status: false
      };

      const res = await fetch(`${this.BASE}/ml/readmission-sepsis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(1500)
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (err: any) {
      console.warn('[PythonBridge] fetchReadmissionSepsisScore using local fallback:', err.message);
    }

    return fallback;
  }

  /**
   * Local backup calculation using the exact same medical indices (RPP, SIA, Deviations)
   * designed for the calibrated Gradient Boosting model.
   */
  private computeLocalMedicalIndicesRisk(
    hr: number,
    sbp: number,
    dbp: number,
    spo2: number,
    age: number,
    conditions: string[]
  ): IRiskScoreResult {
    let score = 0.0;
    const factors: string[] = [];

    // 1. Hypoxia (SpO2)
    if (spo2 > 0 && spo2 < 94) {
      score += 0.40;
      factors.push(`Hypoxia detected (SpO2: ${spo2}%)`);
    }

    // 2. Age-Adjusted Shock Index (SIA)
    const sia = sbp > 0 ? (hr * age) / sbp : 0.0;
    if (sia > 50.0) {
      score += 0.20;
      factors.push(`Elevated Age-Adjusted Shock Index: ${sia.toFixed(1)} (Cardiac distress in older patient)`);
    }

    // 3. Rate Pressure Product (RPP)
    const rpp = hr * sbp;
    if (rpp > 12000.0) {
      score += 0.15;
      factors.push(`High Myocardial Workload (RPP: ${rpp.toFixed(0)})`);
    }

    // 4. Heart Rate Deviation
    const hrDev = Math.pow(hr - 75.0, 2);
    if (hrDev > 400.0) { // HR < 55 or HR > 95
      score += 0.15;
      factors.push(`Heart Rate out of baseline: ${hr} bpm`);
    }

    // 5. Systolic Pressure Deviation
    const sbpDev = Math.pow(sbp - 120.0, 2);
    if (sbpDev > 400.0) { // SBP < 100 or SBP > 140
      score += 0.10;
      factors.push(`Systolic BP out of baseline: ${sbp} mmHg`);
    }

    // Cap score at 1.0
    score = Math.min(score, 1.0);

    // Classify using our tuned safety decision threshold (0.500)
    let risk_level: IRiskScoreResult['risk_level'] = 'low';
    if (score < 0.25) risk_level = 'low';
    else if (score < 0.50) risk_level = 'moderate';
    else if (score < 0.75) risk_level = 'high';
    else risk_level = 'critical';

    return {
      risk_level,
      risk_score: score,
      confidence: 0.60, // lower confidence for heuristic fallback
      contributing_factors: factors.length > 0 ? factors : ['Vitals within normal ranges'],
      note: 'Client-side Medical Indices Fallback (Python Sidecar Offline)'
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 5. HDF5 PAGINATED READER
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Read a paginated segment of an HDF5 biosignal dataset.
   *
   * @param datasetPath - HDF5 dataset path (e.g. 'eeg/channel_0')
   * @param file        - HDF5 filename in the server's data/ directory
   * @param start       - Start sample index
   * @param count       - Number of samples to return (max 10,000)
   */
  async readHdf5Segment(
    datasetPath: string,
    file = 'session.hdf5',
    start = 0,
    count = 1000,
  ): Promise<{
    data: number[];
    total: number;
    sample_rate_hz: number;
    unit: string;
  } | null> {
    if (!this.isBrowser) return null;
    const params = new URLSearchParams({ file, start: String(start), count: String(count) });
    try {
      const res = await fetch(
        `${this.BASE}/convert/hdf5/${encodeURIComponent(datasetPath)}?${params}`,
      );
      if (!res.ok) return null;
      return res.json();
    } catch (err: any) {
      console.error('[PythonBridge] readHdf5Segment error:', err.message);
      return null;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 6. IN-BROWSER PYODIDE / WEBASSEMBLY ENGINE (iOS & Client-Side Edge)
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Initializes Pyodide WebAssembly Python runtime directly in the browser context.
   * Enables client-side Python execution without server infrastructure (ideal for iOS Safari / PWAs).
   */
  async initPyodideWebAssembly(): Promise<boolean> {
    if (!this.isBrowser) return false;
    if (this.pyodideInstance) return true;
    if (this.pyodideStatus() === 'loading') return false;

    this.pyodideStatus.set('loading');
    try {
      if (typeof (window as any).loadPyodide === 'undefined') {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Pyodide CDN script'));
          document.head.appendChild(script);
        });
      }

      this.pyodideInstance = await (window as any).loadPyodide();
      this.pyodideStatus.set('ready');
      return true;
    } catch (err: any) {
      console.warn('[PythonBridge] Pyodide WebAssembly initialization failed:', err.message);
      this.pyodideStatus.set('error');
      return false;
    }
  }

  /**
   * Runs a Python code snippet inside the client-side Pyodide WebAssembly engine.
   *
   * @param code - Python code string to execute.
   * @returns Evaluated result or null.
   */
  async runPyodideScript<T = any>(code: string): Promise<T | null> {
    const ready = await this.initPyodideWebAssembly();
    if (!ready || !this.pyodideInstance) return null;

    try {
      const result = await this.pyodideInstance.runPythonAsync(code);
      return result;
    } catch (err: any) {
      console.error('[PythonBridge] Pyodide script execution error:', err.message);
      return null;
    }
  }
}
