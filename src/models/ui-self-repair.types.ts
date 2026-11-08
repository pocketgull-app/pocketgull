// SPDX-License-Identifier: Apache-2.0
/**
 * Self-Analyzing and Self-Repairing UI Diagnostic Engine for PocketGull.
 *
 * Capabilities:
 * 1. Runtime DOM Layout & Overflow Auditor (detects clipping, horizontal blowouts, zero-dimension containers)
 * 2. WCAG Contrast & Legibility Sentinel (evaluates computed styles against AAA/AA thresholds)
 * 3. 3D WebGPU/Three.js Biophysical Lens Diagnostic & Auto-Recovery (detects collapsed canvas, lost context, corrupted matrix bounds)
 * 4. Analysis Frame & Research Panel Sanitizer (repairs iframe/sandbox isolation faults, truncated cards, stuck states)
 * 5. Patient State & Symptom Stream Auditor (detects corrupted issue dictionaries, invalid vitals strings, orphaned body parts, missing symptom severities, out-of-range physiological bounds)
 * 6. Unhandled Runtime Error Interception & State Reset (catches DOM exception spikes, broken signal bindings)
 * 7. Zero-Flicker Autonomous Patch Injection (applies targeted CSS/layout/canvas/state repairs)
 * 8. Full Telemetry & Forensic Audit Trail with Rollback capability
 */

export type AnomalySeverity = 'info' | 'warning' | 'critical';

export type AnomalyCategory = 
  | 'layout-overflow'
  | 'wcag-contrast'
  | 'unresponsive-target'
  | 'lens-canvas-fault'
  | 'analysis-frame-collapse'
  | 'patient-state-corruption'
  | 'symptom-stream-fault'
  | 'broken-signal-state'
  | 'runtime-exception';

export interface IUiAnomaly {
  id: string;
  timestamp: number;
  category: AnomalyCategory;
  severity: AnomalySeverity;
  selector: string;
  description: string;
  evidence: {
    clientWidth?: number;
    clientHeight?: number;
    scrollWidth?: number;
    scrollHeight?: number;
    contrastRatio?: number;
    computedColor?: string;
    computedBg?: string;
    canvasContext?: string;
    corruptedKey?: string;
    corruptedValue?: any;
    errorMessage?: string;
  };
  repairAction?: {
    patchId: string;
    description: string;
    applied: boolean;
  };
}

export interface IUiRepairPatch {
  id: string;
  anomalyId: string;
  timestamp: number;
  selector: string;
  patchType: 'css-inject' | 'attr-inject' | 'canvas-reinit' | 'state-reset';
  appliedStyle?: string;
  rollbackCallback?: () => void;
  status: 'applied' | 'reverted' | 'failed';
}

export interface IUiHealthMetrics {
  healthScore: number; // 0 - 100
  totalAnomaliesDetected: number;
  activeAnomalies: number;
  autoRepairsExecuted: number;
  lensRepairsExecuted: number;
  frameRepairsExecuted: number;
  patientStateRepairsExecuted: number;
  lastAuditTimestamp: number;
  isAutoRepairEnabled: boolean;
}
