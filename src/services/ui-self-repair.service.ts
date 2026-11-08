// SPDX-License-Identifier: Apache-2.0
import { Injectable, signal, computed, inject, PLATFORM_ID, NgZone, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { 
  IUiAnomaly, 
  IUiRepairPatch, 
  IUiHealthMetrics, 
  AnomalyCategory, 
  AnomalySeverity 
} from '../models/ui-self-repair.types';
import { PatientStateService } from './patient-state.service';
import { IBodyPartIssue, IPatientSymptom, BODY_PART_NAMES } from './patient.types';

@Injectable({
  providedIn: 'root'
})
export class UiSelfRepairService implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly ngZone = inject(NgZone);
  private readonly patientState = inject(PatientStateService, { optional: true });

  // Core Reactive Signals
  readonly isAutoRepairEnabled = signal<boolean>(true);
  readonly isAuditing = signal<boolean>(false);
  readonly anomalies = signal<IUiAnomaly[]>([]);
  readonly activePatches = signal<IUiRepairPatch[]>([]);
  readonly lastAuditTimestamp = signal<number>(Date.now());
  readonly isHudOpen = signal<boolean>(false);
  readonly stealthMode = signal<boolean>(true); // When true, pill is only visible if health < 100 or repair count > 0

  // Dynamic Injected Style Element for Layout, Lens & Contrast Repairs
  private dynamicPatchStyleEl: HTMLStyleElement | null = null;
  private auditIntervalHandle: any = null;
  private visibilityChangeHandler: (() => void) | null = null;

  // Computed Metrics
  readonly healthMetrics = computed<IUiHealthMetrics>(() => {
    const all = this.anomalies();
    const active = all.filter(a => !a.repairAction || !a.repairAction.applied);
    const criticalCount = active.filter(a => a.severity === 'critical').length;
    const warnCount = active.filter(a => a.severity === 'warning').length;
    const infoCount = active.filter(a => a.severity === 'info').length;

    let score = 100 - (criticalCount * 25 + warnCount * 10 + infoCount * 2);
    if (score < 0) score = 0;

    const patches = this.activePatches().filter(p => p.status === 'applied');
    const lensRepairs = all.filter(a => a.category === 'lens-canvas-fault' && a.repairAction?.applied).length;
    const frameRepairs = all.filter(a => a.category === 'analysis-frame-collapse' && a.repairAction?.applied).length;
    const patientStateRepairs = all.filter(
      a => (a.category === 'patient-state-corruption' || a.category === 'symptom-stream-fault') && a.repairAction?.applied
    ).length;

    return {
      healthScore: score,
      totalAnomaliesDetected: all.length,
      activeAnomalies: active.length,
      autoRepairsExecuted: patches.length,
      lensRepairsExecuted: lensRepairs,
      frameRepairsExecuted: frameRepairs,
      patientStateRepairsExecuted: patientStateRepairs,
      lastAuditTimestamp: this.lastAuditTimestamp(),
      isAutoRepairEnabled: this.isAutoRepairEnabled()
    };
  });

  constructor() {
    if (this.isBrowser) {
      this.initPatchContainer();
      this.hookGlobalErrorInterception();
      this.initBackgroundAuditScheduler();
    }
  }

  ngOnDestroy(): void {
    if (this.auditIntervalHandle) {
      clearInterval(this.auditIntervalHandle);
      this.auditIntervalHandle = null;
    }
    if (this.visibilityChangeHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
    }
  }

  toggleHud(): void {
    this.isHudOpen.update(v => !v);
  }

  toggleAutoRepair(): void {
    this.isAutoRepairEnabled.update(v => !v);
  }

  toggleStealthMode(): void {
    this.stealthMode.update(v => !v);
  }

  private initPatchContainer(): void {
    if (!this.isBrowser) return;
    let el = document.getElementById('pocketgull-self-repair-styles') as HTMLStyleElement;
    if (!el) {
      el = document.createElement('style');
      el.id = 'pocketgull-self-repair-styles';
      el.setAttribute('type', 'text/css');
      document.head.appendChild(el);
    }
    this.dynamicPatchStyleEl = el;
  }

  private initBackgroundAuditScheduler(): void {
    if (!this.isBrowser) return;

    // Autonomous background audit: runs every 20s outside Angular, throttled by requestIdleCallback
    this.ngZone.runOutsideAngular(() => {
      this.auditIntervalHandle = setInterval(() => {
        // Pause audits if tab is hidden to save CPU/GPU cycles
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
          return;
        }
        this.scheduleIdleAudit();
      }, 20000);

      this.visibilityChangeHandler = () => {
        if (document.visibilityState === 'visible') {
          this.scheduleIdleAudit();
        }
      };
      document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    });

    // Run initial idle audit after initial DOM load
    setTimeout(() => {
      this.scheduleIdleAudit();
    }, 2000);
  }

  /**
   * Schedules an audit inside requestIdleCallback when available, falling back to setTimeout.
   */
  scheduleIdleAudit(): void {
    if (!this.isBrowser) return;

    const run = () => {
      this.runFullAudit();
    };

    if (typeof (window as any).requestIdleCallback === 'function') {
      (window as any).requestIdleCallback(() => run(), { timeout: 3000 });
    } else {
      setTimeout(run, 50);
    }
  }

  private hookGlobalErrorInterception(): void {
    if (!this.isBrowser) return;

    window.addEventListener('error', (event: ErrorEvent) => {
      this.recordAnomaly({
        category: 'runtime-exception',
        severity: 'critical',
        selector: event.filename || 'window.runtime',
        description: `Runtime Error Intercepted: ${event.message}`,
        evidence: {
          errorMessage: `${event.message} at line ${event.lineno}:${event.colno}`
        }
      });
    });

    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      this.recordAnomaly({
        category: 'runtime-exception',
        severity: 'warning',
        selector: 'Promise.unhandledRejection',
        description: `Unhandled Async Rejection: ${String(event.reason)}`,
        evidence: {
          errorMessage: String(event.reason)
        }
      });
    });
  }

  /**
   * Performs an autonomous multi-tier audit across active DOM, lenses, frames, and patient symptom streams.
   */
  runFullAudit(): void {
    if (!this.isBrowser || this.isAuditing()) return;

    this.isAuditing.set(true);

    try {
      this.auditPatientStateAndSymptoms();
      this.auditBiophysicalLenses();
      this.auditAnalysisFrames();
      this.auditHorizontalOverflows();
      this.auditA11yContrastAndLegibility();
      this.auditInteractiveTargets();
      this.lastAuditTimestamp.set(Date.now());
    } finally {
      this.isAuditing.set(false);
    }
  }

  /**
   * 1. Patient State & Symptoms Auditor & Auto-Healer
   */
  auditPatientStateAndSymptoms(): void {
    if (!this.patientState) return;

    // A. Audit Issues and Symptoms dictionary
    const issues = this.patientState.issues();
    if (issues && typeof issues === 'object') {
      let issuesNeedRepair = false;
      const repairedIssues: Record<string, IBodyPartIssue[]> = {};

      for (const [bodyPartId, issueList] of Object.entries(issues)) {
        if (!Array.isArray(issueList)) {
          issuesNeedRepair = true;
          this.recordAnomaly({
            category: 'patient-state-corruption',
            severity: 'critical',
            selector: `PatientState.issues['${bodyPartId}']`,
            description: `Corrupted issue list for body part '${bodyPartId}'. Expected array, got ${typeof issueList}.`,
            evidence: {
              corruptedKey: bodyPartId,
              corruptedValue: issueList
            }
          });
          continue;
        }

        const sanitizedList: IBodyPartIssue[] = [];

        issueList.forEach((issue, idx) => {
          let issueNeedsFix = false;
          let pain = typeof issue.painLevel === 'number' ? issue.painLevel : parseInt(String(issue.painLevel), 10);
          
          if (isNaN(pain) || pain < 1 || pain > 10) {
            pain = isNaN(pain) ? 5 : Math.max(1, Math.min(10, Math.round(pain)));
            issueNeedsFix = true;
          }

          let rawSymptoms = issue.symptoms;
          if (!Array.isArray(rawSymptoms)) {
            rawSymptoms = [];
            issueNeedsFix = true;
          }

          const sanitizedSymptoms = rawSymptoms.map(sym => {
            if (typeof sym === 'string') {
              const trimmed = sym.trim();
              return trimmed ? trimmed : 'Unspecified Symptom';
            } else if (sym && typeof sym === 'object') {
              return {
                name: sym.name || 'Unspecified Symptom',
                type: sym.type || 'symptom',
                verified: sym.verified !== false,
                timeline: sym.timeline || 'Present'
              };
            }
            issueNeedsFix = true;
            return 'Unspecified Symptom';
          });

          if (issueNeedsFix) {
            issuesNeedRepair = true;
            this.recordAnomaly({
              category: 'symptom-stream-fault',
              severity: 'warning',
              selector: `PatientState.issues['${bodyPartId}'][${idx}]`,
              description: `Malformed symptom/pain metadata for issue '${issue.name || bodyPartId}'. Auto-healing pain bounds & symptom contracts.`,
              evidence: {
                corruptedKey: `${bodyPartId}[${idx}]`,
                corruptedValue: { originalPain: issue.painLevel, rawSymptoms: issue.symptoms }
              }
            });
          }

          sanitizedList.push({
            id: issue.id || bodyPartId,
            noteId: issue.noteId || `note-${Date.now()}-${idx}`,
            name: issue.name || BODY_PART_NAMES[bodyPartId] || bodyPartId,
            painLevel: pain,
            description: issue.description || 'Clinical observation documented.',
            symptoms: sanitizedSymptoms,
            recommendation: issue.recommendation || '',
            tcmPattern: issue.tcmPattern,
            ayurvedicImbalance: issue.ayurvedicImbalance
          });
        });

        repairedIssues[bodyPartId] = sanitizedList;
      }

      if (issuesNeedRepair && this.isAutoRepairEnabled()) {
        this.patientState.issues.set(repairedIssues);
        this.applyStateResetPatch(
          'state-repair-issues',
          'PatientState.issues',
          'Sanitized malformed patient issues and normalized symptom stream contracts.'
        );
      }
    }

    // B. Audit Vitals Physiological Bounds
    const vitals = this.patientState.vitals();
    if (vitals) {
      let vitalsNeedRepair = false;
      const cleanVitals = { ...vitals };

      if (vitals.hr) {
        const hrNum = parseFloat(String(vitals.hr));
        if (isNaN(hrNum) || hrNum <= 0 || hrNum > 300) {
          cleanVitals.hr = '72';
          vitalsNeedRepair = true;
          this.recordAnomaly({
            category: 'patient-state-corruption',
            severity: 'warning',
            selector: 'PatientState.vitals.hr',
            description: `Physiologically invalid heart rate detected: '${vitals.hr}'. Restored to baseline 72 bpm.`,
            evidence: { corruptedKey: 'hr', corruptedValue: vitals.hr }
          });
        }
      }

      if (vitals.spO2) {
        const spo2Num = parseFloat(String(vitals.spO2).replace('%', ''));
        if (isNaN(spo2Num) || spo2Num <= 0 || spo2Num > 100) {
          cleanVitals.spO2 = '98%';
          vitalsNeedRepair = true;
          this.recordAnomaly({
            category: 'patient-state-corruption',
            severity: 'warning',
            selector: 'PatientState.vitals.spO2',
            description: `Physiologically invalid SpO2 detected: '${vitals.spO2}'. Restored to baseline 98%.`,
            evidence: { corruptedKey: 'spO2', corruptedValue: vitals.spO2 }
          });
        }
      }

      if (vitalsNeedRepair && this.isAutoRepairEnabled()) {
        this.patientState.vitals.set(cleanVitals);
        this.applyStateResetPatch(
          'state-repair-vitals',
          'PatientState.vitals',
          'Sanitized corrupted vital bounds back into valid physiological ranges.'
        );
      }
    }
  }

  /**
   * 2. 3D Biophysical Lenses Diagnostic & Auto-Repair
   */
  private auditBiophysicalLenses(): void {
    const lensSelectors = [
      'app-cardiac-electrophysiology-3d-lens',
      'app-cardiac-webgpu-lens',
      'app-alveolar-capillary-3d-lens',
      'app-hepatic-sinusoid-3d-lens',
      'app-glomerular-filtration-3d-lens',
      'app-pancreatic-islet-3d-lens',
      'app-cyp3a4-heme-3d-lens',
      'app-bioprinting-scaffold-3d-lens',
      'app-glymphatic-brain-3d-lens',
      'app-nutrigenomics-3d-lens',
      'app-knee-hologram-hud',
      'app-lens-biomolecular-physics',
      'app-lens-physical-genomics',
      'canvas'
    ];

    const elements = document.querySelectorAll<HTMLElement>(lensSelectors.join(','));

    elements.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      const clientH = el.clientHeight;
      const clientW = el.clientWidth;
      const tagName = el.tagName.toLowerCase();

      const isCollapsed = clientH < 40 && !el.classList.contains('hidden');
      const isZeroDimension = clientW === 0 || clientH === 0;

      let canvasContextLost = false;
      if (tagName === 'canvas') {
        const canvas = el as HTMLCanvasElement;
        if (canvas.width === 0 || canvas.height === 0) {
          canvasContextLost = true;
        }
      }

      if (isCollapsed || isZeroDimension || canvasContextLost) {
        const uniqueClass = this.ensureElementIdentifier(el, `pg-lens-repair-${index}`);
        const selector = `.${uniqueClass}`;

        const anomaly: IUiAnomaly = {
          id: `lens-fault-${Date.now()}-${index}`,
          timestamp: Date.now(),
          category: 'lens-canvas-fault',
          severity: 'critical',
          selector,
          description: `3D Lens / Canvas collapsed or unrendered (${tagName}: ${Math.round(clientW)}x${Math.round(clientH)}px, contextLost: ${canvasContextLost})`,
          evidence: {
            clientWidth: clientW,
            clientHeight: clientH,
            canvasContext: canvasContextLost ? 'lost' : 'active'
          }
        };

        this.recordAnomaly(anomaly);

        if (this.isAutoRepairEnabled()) {
          this.applyCssPatch(
            anomaly.id,
            selector,
            `${selector} { min-height: 420px !important; width: 100% !important; display: block !important; position: relative !important; } ${selector} canvas { min-height: 420px !important; width: 100% !important; display: block !important; }`,
            'Restored 3D lens viewport geometry (min-height: 420px) and triggered render pipeline recalculation.'
          );

          this.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
              window.dispatchEvent(new Event('resize'));
            }, 50);
          });
        }
      }
    });
  }

  /**
   * 3. Analysis Frames & Research Panel Diagnostic & Auto-Repair
   */
  private auditAnalysisFrames(): void {
    const frameSelectors = [
      'app-analysis-container',
      'app-research-frame',
      'app-analysis-report',
      'app-differential-diagnosis-radar',
      'app-soap-note-generator',
      'app-counterfactual-simulator',
      'app-cohort-triage-matrix'
    ];

    const frames = document.querySelectorAll<HTMLElement>(frameSelectors.join(','));

    frames.forEach((el, index) => {
      const scrollH = el.scrollHeight;
      const clientH = el.clientHeight;
      const rect = el.getBoundingClientRect();

      const isTrapped = (clientH < 60 && scrollH > 150) || (rect.height < 60 && !el.classList.contains('hidden'));
      const style = window.getComputedStyle(el);
      const isClippingWithoutScroll = (style.overflow === 'hidden' || style.overflowY === 'hidden') && scrollH > clientH + 20;

      if (isTrapped || isClippingWithoutScroll) {
        const uniqueClass = this.ensureElementIdentifier(el, `pg-frame-repair-${index}`);
        const selector = `.${uniqueClass}`;

        const anomaly: IUiAnomaly = {
          id: `frame-fault-${Date.now()}-${index}`,
          timestamp: Date.now(),
          category: 'analysis-frame-collapse',
          severity: 'warning',
          selector,
          description: `Analysis Frame container clipping or trapped scroll (clientHeight: ${clientH}px, scrollHeight: ${scrollH}px, overflow: ${style.overflow})`,
          evidence: {
            clientHeight: clientH,
            scrollHeight: scrollH
          }
        };

        this.recordAnomaly(anomaly);

        if (this.isAutoRepairEnabled()) {
          this.applyCssPatch(
            anomaly.id,
            selector,
            `${selector} { min-height: 280px !important; max-height: 100% !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; }`,
            'Repaired analysis frame viewport constraints and unlocked fluid internal vertical scrolling.'
          );
        }
      }
    });
  }

  /**
   * 4. Layout Overflow Audit & Auto-Repair
   */
  private auditHorizontalOverflows(): void {
    const docWidth = document.documentElement.clientWidth;
    const bodyWidth = document.body.clientWidth;
    const maxAllowedWidth = Math.max(docWidth, bodyWidth);

    const candidates = document.querySelectorAll<HTMLElement>(
      'main, section, article, div.container, div[class*="content"], div[class*="wrapper"], table, pre, code'
    );

    candidates.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      const scrollW = el.scrollWidth;
      const clientW = el.clientWidth;

      if (rect.right > maxAllowedWidth + 5 || (scrollW > clientW + 8 && clientW > 0 && el.tagName !== 'PRE' && el.tagName !== 'CODE')) {
        const uniqueClass = this.ensureElementIdentifier(el, `pg-overflow-target-${index}`);
        const selector = `.${uniqueClass}`;

        const anomaly: IUiAnomaly = {
          id: `overflow-${Date.now()}-${index}`,
          timestamp: Date.now(),
          category: 'layout-overflow',
          severity: 'warning',
          selector,
          description: `Element causes horizontal layout blowout (scrollWidth: ${scrollW}px, clientWidth: ${clientW}px)`,
          evidence: {
            clientWidth: clientW,
            scrollWidth: scrollW
          }
        };

        this.recordAnomaly(anomaly);

        if (this.isAutoRepairEnabled()) {
          this.applyCssPatch(
            anomaly.id,
            selector,
            `${selector} { max-width: 100% !important; overflow-x: auto !important; box-sizing: border-box !important; }`,
            'Enforced max-width 100% containment and fluid horizontal scroll boundary.'
          );
        }
      }
    });
  }

  /**
   * 5. Legibility & Contrast Sentinel
   */
  private auditA11yContrastAndLegibility(): void {
    const textNodes = document.querySelectorAll<HTMLElement>('p, span, h1, h2, h3, h4, label, button, a');
    const sampled = Array.from(textNodes).slice(0, 100);

    sampled.forEach((el, index) => {
      const style = window.getComputedStyle(el);
      const color = style.color;
      const fontSize = parseFloat(style.fontSize) || 16;
      
      if (style.opacity === '0' || style.visibility === 'hidden') return;

      const rgb = this.parseRgb(color);
      if (!rgb) return;

      const lum = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
      
      const isDarkTheme = document.body.classList.contains('dark') || 
                          window.getComputedStyle(document.body).backgroundColor.includes('rgb(9') ||
                          window.getComputedStyle(document.body).backgroundColor.includes('rgb(0');

      if (isDarkTheme && lum < 0.15 && fontSize < 24) {
        const uniqueClass = this.ensureElementIdentifier(el, `pg-contrast-target-${index}`);
        const selector = `.${uniqueClass}`;

        const anomaly: IUiAnomaly = {
          id: `contrast-${Date.now()}-${index}`,
          timestamp: Date.now(),
          category: 'wcag-contrast',
          severity: 'warning',
          selector,
          description: `Low text contrast detected on dark canvas (Luminance: ${lum.toFixed(2)}, Color: ${color})`,
          evidence: {
            computedColor: color,
            contrastRatio: lum
          }
        };

        this.recordAnomaly(anomaly);

        if (this.isAutoRepairEnabled()) {
          this.applyCssPatch(
            anomaly.id,
            selector,
            `${selector} { color: #f4f4f5 !important; }`,
            'Repaired text color to high-contrast bone cream (#f4f4f5) for WCAG AAA compliance.'
          );
        }
      }
    });
  }

  /**
   * 6. Interactive Target Touch & Click Accessibility
   */
  private auditInteractiveTargets(): void {
    const interactives = document.querySelectorAll<HTMLElement>('button, a[href], [role="button"]');
    
    interactives.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      if (rect.width < 24 || rect.height < 24) {
        const uniqueClass = this.ensureElementIdentifier(el, `pg-target-size-${index}`);
        const selector = `.${uniqueClass}`;

        const anomaly: IUiAnomaly = {
          id: `target-size-${Date.now()}-${index}`,
          timestamp: Date.now(),
          category: 'unresponsive-target',
          severity: 'info',
          selector,
          description: `Interactive touch target is below minimum accessible dimensions (${Math.round(rect.width)}x${Math.round(rect.height)}px)`,
          evidence: {
            clientWidth: rect.width
          }
        };

        this.recordAnomaly(anomaly);

        if (this.isAutoRepairEnabled()) {
          this.applyCssPatch(
            anomaly.id,
            selector,
            `${selector} { min-width: 32px !important; min-height: 32px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; }`,
            'Expanded touch padding to ensure reliable motor-accessible interaction.'
          );
        }
      }
    });
  }

  /**
   * Applies an autonomous CSS patch and updates the live style container.
   */
  applyCssPatch(anomalyId: string, selector: string, cssRule: string, description: string): void {
    if (!this.dynamicPatchStyleEl) return;

    const existing = this.activePatches().find(p => p.anomalyId === anomalyId);
    if (existing && existing.status === 'applied') return;

    try {
      this.dynamicPatchStyleEl.appendChild(document.createTextNode(`\n${cssRule}`));

      const patch: IUiRepairPatch = {
        id: `patch-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        anomalyId,
        timestamp: Date.now(),
        selector,
        patchType: 'css-inject',
        appliedStyle: cssRule,
        status: 'applied'
      };

      this.activePatches.update(list => [...list, patch]);

      this.anomalies.update(list => 
        list.map(a => a.id === anomalyId ? {
          ...a,
          repairAction: {
            patchId: patch.id,
            description,
            applied: true
          }
        } : a)
      );
    } catch (err) {
      console.warn('[UiSelfRepairService] Failed to inject patch rule:', err);
    }
  }

  /**
   * Applies a state-reset patch for repaired patient state or symptoms.
   */
  applyStateResetPatch(anomalyId: string, selector: string, description: string): void {
    const patch: IUiRepairPatch = {
      id: `state-patch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      anomalyId,
      timestamp: Date.now(),
      selector,
      patchType: 'state-reset',
      status: 'applied'
    };

    this.activePatches.update(list => [...list, patch]);

    this.anomalies.update(list =>
      list.map(a => (a.selector === selector || a.selector.startsWith(selector)) ? {
        ...a,
        repairAction: {
          patchId: patch.id,
          description,
          applied: true
        }
      } : a)
    );
  }

  /**
   * Manually trigger targeted repair for all lenses and analysis frames.
   */
  repairAllLensesAndFrames(): void {
    this.auditBiophysicalLenses();
    this.auditAnalysisFrames();
  }

  /**
   * Manually trigger targeted repair for patient state and symptoms.
   */
  repairPatientStateAndSymptoms(): void {
    this.auditPatientStateAndSymptoms();
  }

  /**
   * Reverts all applied patches and flushes dynamic styles.
   */
  revertAllPatches(): void {
    if (this.dynamicPatchStyleEl) {
      this.dynamicPatchStyleEl.textContent = '';
    }
    this.activePatches.update(list => list.map(p => ({ ...p, status: 'reverted' })));
    this.anomalies.update(list => list.map(a => ({
      ...a,
      repairAction: a.repairAction ? { ...a.repairAction, applied: false } : undefined
    })));
  }

  /**
   * Clears anomaly log history.
   */
  clearAnomalies(): void {
    this.anomalies.set([]);
  }

  private recordAnomaly(anomaly: Omit<IUiAnomaly, 'id' | 'timestamp'> & { id?: string; timestamp?: number }): void {
    const fullAnomaly: IUiAnomaly = {
      id: anomaly.id || `anom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: anomaly.timestamp || Date.now(),
      category: anomaly.category,
      severity: anomaly.severity,
      selector: anomaly.selector,
      description: anomaly.description,
      evidence: anomaly.evidence,
      repairAction: anomaly.repairAction
    };

    const isDup = this.anomalies().some(
      a => a.selector === fullAnomaly.selector && a.category === fullAnomaly.category
    );

    if (!isDup) {
      this.anomalies.update(list => [fullAnomaly, ...list.slice(0, 49)]);
    }
  }

  private ensureElementIdentifier(el: HTMLElement, prefix: string): string {
    for (let i = 0; i < el.classList.length; i++) {
      if (el.classList[i].startsWith(prefix)) {
        return el.classList[i];
      }
    }
    const generated = `${prefix}-${Math.random().toString(36).substring(2, 6)}`;
    el.classList.add(generated);
    return generated;
  }

  private parseRgb(colorStr: string): { r: number; g: number; b: number } | null {
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return null;
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10)
    };
  }
}
