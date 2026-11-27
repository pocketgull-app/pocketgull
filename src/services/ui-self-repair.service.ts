// SPDX-License-Identifier: Apache-2.0
import { Injectable, signal, computed, inject, PLATFORM_ID, NgZone, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  IUiAnomaly,
  IUiRepairPatch,
  IUiHealthMetrics
} from '../models/ui-self-repair.types';
import { PatientStateService } from './patient-state.service';
import { IBodyPartIssue, BODY_PART_NAMES } from './patient.types';

const PLACEHOLDER_VITAL_VALUES = new Set(['', '--', 'n/a', 'na', 'pending', 'unknown', 'unverified']);

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
  readonly stealthMode = signal<boolean>(false);

  // Dynamic Injected Style Element for Layout, Lens & Contrast Repairs
  private dynamicPatchStyleEl: HTMLStyleElement | null = null;
  private auditIntervalHandle: ReturnType<typeof setInterval> | null = null;
  private initialAuditTimeoutHandle: ReturnType<typeof setTimeout> | null = null;
  private visibilityChangeHandler: (() => void) | null = null;
  private boundErrorHandler: ((event: ErrorEvent) => void) | null = null;
  private boundRejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null;

  // Computed Metrics
  readonly healthMetrics = computed<IUiHealthMetrics>(() => {
    const all = this.anomalies();
    const active = all.filter((a) => !a.repairAction || !a.repairAction.applied);
    const criticalCount = active.filter((a) => a.severity === 'critical').length;
    const warnCount = active.filter((a) => a.severity === 'warning').length;
    const infoCount = active.filter((a) => a.severity === 'info').length;

    let score = 100 - (criticalCount * 25 + warnCount * 10 + infoCount * 2);
    if (score < 0) score = 0;

    const patches = this.activePatches().filter((p) => p.status === 'applied');
    const lensRepairs = all.filter((a) => a.category === 'lens-canvas-fault' && a.repairAction?.applied).length;
    const frameRepairs = all.filter((a) => a.category === 'analysis-frame-collapse' && a.repairAction?.applied).length;
    const patientStateRepairs = all.filter(
      (a) => (a.category === 'patient-state-corruption' || a.category === 'symptom-stream-fault') && a.repairAction?.applied
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
    if (this.initialAuditTimeoutHandle) {
      clearTimeout(this.initialAuditTimeoutHandle);
      this.initialAuditTimeoutHandle = null;
    }
    if (this.visibilityChangeHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }
    if (typeof window !== 'undefined') {
      if (this.boundErrorHandler) {
        window.removeEventListener('error', this.boundErrorHandler);
        this.boundErrorHandler = null;
      }
      if (this.boundRejectionHandler) {
        window.removeEventListener('unhandledrejection', this.boundRejectionHandler);
        this.boundRejectionHandler = null;
      }
    }
  }

  toggleHud(): void {
    this.isHudOpen.update((v) => !v);
  }

  toggleAutoRepair(): void {
    this.isAutoRepairEnabled.update((v) => !v);
  }

  toggleStealthMode(): void {
    this.stealthMode.update((v) => !v);
  }

  private generateSecureSuffix(): string {
    const bytes = new Uint8Array(4);
    if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
      globalThis.crypto.getRandomValues(bytes);
    } else {
      const now = Date.now();
      bytes[0] = now & 0xff;
      bytes[1] = (now >> 8) & 0xff;
      bytes[2] = (now >> 16) & 0xff;
      bytes[3] = (now >> 24) & 0xff;
    }
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }

  private initPatchContainer(): void {
    if (!this.isBrowser || typeof document === 'undefined') return;
    let el = document.getElementById('pocketgull-self-repair-styles') as HTMLStyleElement | null;
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

    this.ngZone.runOutsideAngular(() => {
      this.auditIntervalHandle = setInterval(() => {
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
          return;
        }
        this.scheduleIdleAudit();
      }, 30_000);

      this.visibilityChangeHandler = () => {
        if (document.visibilityState === 'visible') {
          this.scheduleIdleAudit();
        }
      };
      document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    });

    this.initialAuditTimeoutHandle = setTimeout(() => {
      this.scheduleIdleAudit();
    }, 2500);
  }

  scheduleIdleAudit(): void {
    if (!this.isBrowser) return;

    const run = () => {
      this.runFullAudit();
    };

    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void })
      .requestIdleCallback;
    if (typeof ric === 'function') {
      ric(() => run(), { timeout: 3000 });
    } else {
      setTimeout(run, 50);
    }
  }

  private hookGlobalErrorInterception(): void {
    if (!this.isBrowser || typeof window === 'undefined') return;

    this.boundErrorHandler = (event: ErrorEvent) => {
      this.recordAnomaly({
        category: 'runtime-exception',
        severity: 'critical',
        selector: event.filename || 'window.runtime',
        description: `Runtime Error Intercepted: ${event.message}`,
        evidence: {
          errorMessage: `${event.message} at line ${event.lineno}:${event.colno}`
        }
      });
    };

    this.boundRejectionHandler = (event: PromiseRejectionEvent) => {
      this.recordAnomaly({
        category: 'runtime-exception',
        severity: 'warning',
        selector: 'Promise.unhandledRejection',
        description: `Unhandled Async Rejection: ${String(event.reason)}`,
        evidence: {
          errorMessage: String(event.reason)
        }
      });
    };

    window.addEventListener('error', this.boundErrorHandler);
    window.addEventListener('unhandledrejection', this.boundRejectionHandler);
  }

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
   * 1. Patient State & Symptoms Auditor & Safe Sanitizer
   * Clinical Safety Invariant: NEVER fabricates reassuring healthy vitals (e.g. '72' / '98%')
   * and NEVER overwrites critical low/zero values (e.g. HR=0 asystole or SpO2=84% hypoxia).
   * Physically impossible strings (< 0, > physiological ceiling, or non-numeric garbage) are
   * quarantined explicitly to '--' (unverified).
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

          const sanitizedSymptoms = rawSymptoms.map((sym) => {
            if (typeof sym === 'string') {
              const trimmed = sym.trim();
              if (!trimmed) {
                issueNeedsFix = true;
                return 'Unspecified Symptom';
              }
              return trimmed;
            } else if (sym && typeof sym === 'object') {
              const name = sym.name?.trim();
              if (!name) issueNeedsFix = true;
              return {
                name: name || 'Unspecified Symptom',
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
              description: `Malformed symptom/pain metadata for issue '${issue.name || bodyPartId}'. Clamped pain bounds & sanitized symptom list.`,
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

    // B. Audit Vitals for Physically Impossible Corruption (NEVER fabricate healthy defaults!)
    const vitals = this.patientState.vitals();
    if (vitals) {
      let vitalsNeedRepair = false;
      const cleanVitals = { ...vitals };

      if (vitals.hr !== undefined && vitals.hr !== null) {
        const rawHr = String(vitals.hr).trim();
        if (!PLACEHOLDER_VITAL_VALUES.has(rawHr.toLowerCase())) {
          const hrNum = parseFloat(rawHr);
          // Preserve 0 bpm (potential emergency/asystole) and valid physiological range 0..300; quarantine only impossible values
          if (isNaN(hrNum) || hrNum < 0 || hrNum > 300) {
            cleanVitals.hr = '--';
            vitalsNeedRepair = true;
            this.recordAnomaly({
              category: 'patient-state-corruption',
              severity: 'warning',
              selector: 'PatientState.vitals.hr',
              description: `Physically impossible heart rate string '${vitals.hr}' quarantined to '--' (unverified; never fabricated).`,
              evidence: { corruptedKey: 'hr', corruptedValue: vitals.hr }
            });
          }
        }
      }

      if (vitals.spO2 !== undefined && vitals.spO2 !== null) {
        const rawSpo2 = String(vitals.spO2).trim();
        if (!PLACEHOLDER_VITAL_VALUES.has(rawSpo2.toLowerCase())) {
          const spo2Num = parseFloat(rawSpo2.replace('%', ''));
          // Preserve critical low SpO2 (0..100%) untouched; quarantine only impossible values (<0, >100, NaN)
          if (isNaN(spo2Num) || spo2Num < 0 || spo2Num > 100) {
            cleanVitals.spO2 = '--';
            vitalsNeedRepair = true;
            this.recordAnomaly({
              category: 'patient-state-corruption',
              severity: 'warning',
              selector: 'PatientState.vitals.spO2',
              description: `Physically impossible SpO2 string '${vitals.spO2}' quarantined to '--' (unverified; never fabricated).`,
              evidence: { corruptedKey: 'spO2', corruptedValue: vitals.spO2 }
            });
          }
        }
      }

      if (vitalsNeedRepair && this.isAutoRepairEnabled()) {
        this.patientState.vitals.set(cleanVitals);
        this.applyStateResetPatch(
          'state-repair-vitals',
          'PatientState.vitals',
          'Quarantined physically impossible vital strings to unverified ("--") without fabricating clinical data.'
        );
      }
    }
  }

  /**
   * Returns true only when an element and all its ancestors are actively rendered in layout.
   */
  private isElementVisibleInLayout(el: HTMLElement): boolean {
    if (!el.isConnected) return false;
    let cur: HTMLElement | null = el;
    while (cur && cur !== document.documentElement) {
      if (cur.hasAttribute('hidden') || cur.classList.contains('hidden')) return false;
      const st = window.getComputedStyle(cur);
      if (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0') {
        return false;
      }
      cur = cur.parentElement;
    }
    return true;
  }

  /**
   * 2. 3D Biophysical Lenses Diagnostic & Auto-Repair
   * Inspects ONLY explicit 3D lens host elements (never wildcarding sparkline/icon <canvas> elements
   * or hidden/off-tab DOM subtrees).
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
      'app-lens-physical-genomics'
    ];

    const elements = document.querySelectorAll<HTMLElement>(lensSelectors.join(','));

    elements.forEach((el, index) => {
      if (!this.isElementVisibleInLayout(el)) return;

      const clientH = el.clientHeight;
      const clientW = el.clientWidth;
      const tagName = el.tagName.toLowerCase();
      const innerCanvas = el.querySelector<HTMLCanvasElement>('canvas');
      const canvasContextLost = Boolean(innerCanvas && (innerCanvas.width === 0 || innerCanvas.height === 0));
      const isCollapsed = clientW > 0 && clientH < 40;

      if (isCollapsed || canvasContextLost) {
        const uniqueClass = this.ensureElementIdentifier(el, `pg-lens-repair-${index}`);
        const selector = `.${uniqueClass}`;
        const anomalyId = `lens-fault:${selector}`;

        this.recordAnomaly({
          id: anomalyId,
          category: 'lens-canvas-fault',
          severity: 'critical',
          selector,
          description: `3D Lens viewport collapsed or unrendered (${tagName}: ${Math.round(clientW)}x${Math.round(clientH)}px, contextLost: ${canvasContextLost})`,
          evidence: {
            clientWidth: clientW,
            clientHeight: clientH,
            canvasContext: canvasContextLost ? 'lost' : 'active'
          }
        });

        if (this.isAutoRepairEnabled()) {
          this.applyCssPatch(
            anomalyId,
            selector,
            `${selector} { min-height: 360px !important; width: 100% !important; display: block !important; position: relative !important; }`,
            'Restored visible 3D lens viewport geometry (min-height: 360px) and triggered resize.'
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
   * Skips hidden/collapsed panels; repairs ONLY visibly mounted frames trapping overflowing scroll.
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
      if (!this.isElementVisibleInLayout(el)) return;

      const scrollH = el.scrollHeight;
      const clientH = el.clientHeight;
      if (clientH === 0 || el.clientWidth === 0) return;

      const style = window.getComputedStyle(el);
      const isClippingWithoutScroll =
        (style.overflow === 'hidden' || style.overflowY === 'hidden') && scrollH > clientH + 32;

      if (isClippingWithoutScroll) {
        const uniqueClass = this.ensureElementIdentifier(el, `pg-frame-repair-${index}`);
        const selector = `.${uniqueClass}`;
        const anomalyId = `frame-fault:${selector}`;

        this.recordAnomaly({
          id: anomalyId,
          category: 'analysis-frame-collapse',
          severity: 'warning',
          selector,
          description: `Analysis Frame container clipping overflowing content (clientHeight: ${clientH}px, scrollHeight: ${scrollH}px, overflow: ${style.overflow})`,
          evidence: {
            clientHeight: clientH,
            scrollHeight: scrollH
          }
        });

        if (this.isAutoRepairEnabled()) {
          this.applyCssPatch(
            anomalyId,
            selector,
            `${selector} { overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; }`,
            'Unlocked vertical scrolling on visibly clipped analysis frame.'
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
    if (maxAllowedWidth === 0) return;

    const candidates = document.querySelectorAll<HTMLElement>(
      'main, section, article, table'
    );

    candidates.forEach((el, index) => {
      if (!this.isElementVisibleInLayout(el)) return;
      const rect = el.getBoundingClientRect();
      const scrollW = el.scrollWidth;
      const clientW = el.clientWidth;
      if (clientW === 0) return;

      const style = window.getComputedStyle(el);
      if (style.overflowX === 'auto' || style.overflowX === 'scroll') return;

      if (rect.right > maxAllowedWidth + 8) {
        const uniqueClass = this.ensureElementIdentifier(el, `pg-overflow-target-${index}`);
        const selector = `.${uniqueClass}`;
        const anomalyId = `overflow:${selector}`;

        this.recordAnomaly({
          id: anomalyId,
          category: 'layout-overflow',
          severity: 'warning',
          selector,
          description: `Element extends past viewport edge (scrollWidth: ${scrollW}px, clientWidth: ${clientW}px)`,
          evidence: {
            clientWidth: clientW,
            scrollWidth: scrollW
          }
        });

        if (this.isAutoRepairEnabled()) {
          this.applyCssPatch(
            anomalyId,
            selector,
            `${selector} { max-width: 100% !important; overflow-x: auto !important; box-sizing: border-box !important; }`,
            'Enforced max-width 100% containment and fluid horizontal scroll boundary.'
          );
        }
      }
    });
  }

  /**
   * 5. Legibility & Contrast Sentinel (Ancestor-Background-Aware)
   * Inspects the element's actual nearest opaque background instead of assuming body theme,
   * so dark text on light badges inside dark mode is NEVER painted white-on-white.
   */
  private auditA11yContrastAndLegibility(): void {
    const primaryMainNodes = Array.from(
      document.querySelectorAll<HTMLElement>('main p, main h1, main h2, main h3, main h4, main label')
    );
    const generalNodes = Array.from(
      document.querySelectorAll<HTMLElement>('p, h1, h2, h3, h4, label, button, a')
    );
    const seen = new Set<HTMLElement>();
    const sampled: HTMLElement[] = [];
    for (const el of [...primaryMainNodes, ...generalNodes]) {
      if (seen.has(el)) continue;
      seen.add(el);
      sampled.push(el);
      if (sampled.length >= 250) break;
    }

    sampled.forEach((el, index) => {
      if (!this.isElementVisibleInLayout(el)) return;
      const style = window.getComputedStyle(el);
      const fgRgb = this.parseRgb(style.color);
      const bgRgb = this.resolveEffectiveBackgroundRgb(el);
      if (!fgRgb || !bgRgb) return;

      const fgLum = this.relativeLuminance(fgRgb);
      const bgLum = this.relativeLuminance(bgRgb);
      const contrastRatio = (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05);

      // Only intervene on genuinely unreadable dark-on-dark (< 2.5:1) text
      if (bgLum < 0.12 && fgLum < 0.12 && contrastRatio < 2.5) {
        const uniqueClass = this.ensureElementIdentifier(el, `pg-contrast-target-${index}`);
        const selector = `.${uniqueClass}`;
        const anomalyId = `contrast:${selector}`;

        this.recordAnomaly({
          id: anomalyId,
          category: 'wcag-contrast',
          severity: 'warning',
          selector,
          description: `Low dark-on-dark contrast detected (ratio ${contrastRatio.toFixed(2)}:1, fg ${style.color})`,
          evidence: {
            computedColor: style.color,
            contrastRatio
          }
        });

        if (this.isAutoRepairEnabled()) {
          this.applyCssPatch(
            anomalyId,
            selector,
            `${selector} { color: #ede3d2 !important; }`,
            'Repaired dark-on-dark text color to warm bone cream (#ede3d2) for WCAG AAA contrast.'
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
      if (!this.isElementVisibleInLayout(el)) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      if (rect.width < 24 || rect.height < 24) {
        const uniqueClass = this.ensureElementIdentifier(el, `pg-target-size-${index}`);
        const selector = `.${uniqueClass}`;
        const anomalyId = `target-size:${selector}`;

        this.recordAnomaly({
          id: anomalyId,
          category: 'unresponsive-target',
          severity: 'info',
          selector,
          description: `Interactive touch target below minimum accessible dimensions (${Math.round(rect.width)}x${Math.round(rect.height)}px)`,
          evidence: {
            clientWidth: rect.width,
            clientHeight: rect.height
          }
        });

        if (this.isAutoRepairEnabled()) {
          this.applyCssPatch(
            anomalyId,
            selector,
            `${selector} { min-width: 32px !important; min-height: 32px !important; }`,
            'Expanded minimum touch dimensions to 32px for accessible interaction.'
          );
        }
      }
    });
  }

  /**
   * Applies an autonomous CSS patch deduplicated strictly by `(selector, appliedStyle)` so periodic
   * background audits never inflate activePatches or duplicate rules in <style>.
   */
  applyCssPatch(anomalyId: string, selector: string, cssRule: string, description: string): void {
    if (!this.dynamicPatchStyleEl) return;

    const existing = this.activePatches().find(
      (p) =>
        p.status === 'applied' &&
        (p.anomalyId === anomalyId || (p.selector === selector && p.appliedStyle === cssRule))
    );
    if (existing) return;

    try {
      this.dynamicPatchStyleEl.appendChild(document.createTextNode(`\n${cssRule}`));

      const patch: IUiRepairPatch = {
        id: `patch-${Date.now()}-${this.generateSecureSuffix()}`,
        anomalyId,
        timestamp: Date.now(),
        selector,
        patchType: 'css-inject',
        appliedStyle: cssRule,
        status: 'applied'
      };

      this.activePatches.update((list) => [...list, patch]);

      this.anomalies.update((list) =>
        list.map((a) =>
          a.id === anomalyId || a.selector === selector
            ? {
                ...a,
                repairAction: {
                  patchId: patch.id,
                  description,
                  applied: true
                }
              }
            : a
        )
      );
    } catch (err) {
      console.warn('[UiSelfRepairService] Failed to inject patch rule:', err);
    }
  }

  applyStateResetPatch(anomalyId: string, selector: string, description: string): void {
    const existing = this.activePatches().find(
      (p) => p.status === 'applied' && p.patchType === 'state-reset' && p.selector === selector
    );

    const patchId = existing?.id || `state-patch-${Date.now()}-${this.generateSecureSuffix()}`;
    if (!existing) {
      const patch: IUiRepairPatch = {
        id: patchId,
        anomalyId,
        timestamp: Date.now(),
        selector,
        patchType: 'state-reset',
        status: 'applied'
      };
      this.activePatches.update((list) => [...list, patch]);
    }

    this.anomalies.update((list) =>
      list.map((a) =>
        a.selector === selector || a.selector.startsWith(selector)
          ? {
              ...a,
              repairAction: {
                patchId,
                description,
                applied: true
              }
            }
          : a
      )
    );
  }

  /** Targeted repair for 3D biophysical lenses only. */
  repairBiophysicalLenses(): void {
    if (!this.isBrowser) return;
    this.auditBiophysicalLenses();
    this.lastAuditTimestamp.set(Date.now());
  }

  /** Targeted repair for analysis frames only. */
  repairAnalysisFrames(): void {
    if (!this.isBrowser) return;
    this.auditAnalysisFrames();
    this.lastAuditTimestamp.set(Date.now());
  }

  /** Backward-compatible combined repair for lenses and analysis frames. */
  repairAllLensesAndFrames(): void {
    this.repairBiophysicalLenses();
    this.repairAnalysisFrames();
  }

  /** Targeted repair for patient state and symptoms. */
  repairPatientStateAndSymptoms(): void {
    this.auditPatientStateAndSymptoms();
    this.lastAuditTimestamp.set(Date.now());
  }

  revertAllPatches(): void {
    if (this.dynamicPatchStyleEl) {
      this.dynamicPatchStyleEl.textContent = '';
    }
    this.activePatches.update((list) => list.map((p) => ({ ...p, status: 'reverted' })));
    this.anomalies.update((list) =>
      list.map((a) => ({
        ...a,
        repairAction: a.repairAction ? { ...a.repairAction, applied: false } : undefined
      }))
    );
  }

  clearAnomalies(): void {
    this.anomalies.set([]);
  }

  private recordAnomaly(anomaly: Omit<IUiAnomaly, 'id' | 'timestamp'> & { id?: string; timestamp?: number }): void {
    const fullAnomaly: IUiAnomaly = {
      id: anomaly.id || `anom-${Date.now()}-${this.generateSecureSuffix()}`,
      timestamp: anomaly.timestamp || Date.now(),
      category: anomaly.category,
      severity: anomaly.severity,
      selector: anomaly.selector,
      description: anomaly.description,
      evidence: anomaly.evidence,
      repairAction: anomaly.repairAction
    };

    const isDup = this.anomalies().some(
      (a) => a.selector === fullAnomaly.selector && a.category === fullAnomaly.category
    );

    if (!isDup) {
      this.anomalies.update((list) => [fullAnomaly, ...list.slice(0, 49)]);
    }
  }

  private ensureElementIdentifier(el: HTMLElement, prefix: string): string {
    for (let i = 0; i < el.classList.length; i++) {
      if (el.classList[i].startsWith(prefix)) {
        return el.classList[i];
      }
    }
    const generated = `${prefix}-${this.generateSecureSuffix()}`;
    el.classList.add(generated);
    return generated;
  }

  private parseRgb(colorStr: string): { r: number; g: number; b: number; a: number } | null {
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/);
    if (!match) return null;
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
      a: match[4] !== undefined ? parseFloat(match[4]) : 1
    };
  }

  private resolveEffectiveBackgroundRgb(el: HTMLElement): { r: number; g: number; b: number } | null {
    let cur: HTMLElement | null = el;
    while (cur) {
      const parsed = this.parseRgb(window.getComputedStyle(cur).backgroundColor);
      if (parsed && parsed.a > 0.1) {
        return { r: parsed.r, g: parsed.g, b: parsed.b };
      }
      cur = cur.parentElement;
    }
    return null;
  }

  private relativeLuminance(rgb: { r: number; g: number; b: number }): number {
    const lin = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
  }
}
