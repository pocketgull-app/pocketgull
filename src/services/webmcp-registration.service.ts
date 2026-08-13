import { Injectable, inject, NgZone } from '@angular/core';
import { PatientStateService, BODY_PART_NAMES } from './patient-state.service';
import { ClinicalIntelligenceService } from './clinical-intelligence.service';
import { ExportService } from './export.service';
import { TeledentistryService } from './teledentistry.service';
import { GcpHealthcareApiService } from './fhir/gcp-healthcare-api.service';
import { SkepticalEpistemologyService } from './skeptical-epistemology.service';
import { ClinicalMoERouterService } from './clinical-moe-router.service';
import { IrmaaDecisionService } from './irmaa-decision.service';
import { MedicareBillingBestPracticesService } from './medicare-billing-best-practices.service';
import { HedisStarRatingService } from './hedis-star-rating.service';
import { FhirPriorAuthService } from './fhir-prior-auth.service';
import { SnomedIcdCrosswalkService } from './snomed-icd-crosswalk.service';
import { WebgpuBioSignalService } from './webgpu-bio-signal.service';
import { initializeWebMCPPolyfill } from '@mcp-b/webmcp-polyfill';

@Injectable({
  providedIn: 'root'
})
export class WebMcpRegistrationService {
  private state = inject(PatientStateService);
  private clinicalIntelligence = inject(ClinicalIntelligenceService);
  private exportService = inject(ExportService);
  private teledentistryService = inject(TeledentistryService);
  private gcpHealthcareService = inject(GcpHealthcareApiService);
  private skepticalService = inject(SkepticalEpistemologyService);
  private moeRouter = inject(ClinicalMoERouterService);
  private irmaaService = inject(IrmaaDecisionService, { optional: true });
  private medicareBillingService = inject(MedicareBillingBestPracticesService, { optional: true });
  private hedisService = inject(HedisStarRatingService, { optional: true });
  private priorAuthService = inject(FhirPriorAuthService, { optional: true });
  private snomedCrosswalkService = inject(SnomedIcdCrosswalkService, { optional: true });
  private bioSignalService = inject(WebgpuBioSignalService, { optional: true });
  private ngZone = inject(NgZone);

  private mcpControllers: { name: string; controller: AbortController }[] = [];

  /**
   * Initializes WebMCP polyfill and registers agentic tools on the browser modelContext.
   */
  public registerTools(callbacks: {
    onNavigateToBodyPart?: (partId: string) => void;
    onAddBookmark?: (bookmark: any) => void;
  }): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const mContextInit = (document as any).modelContext || (navigator as any).modelContext;
    if (!mContextInit) {
      initializeWebMCPPolyfill();
    }

    const modelContext = (document as any).modelContext || (navigator as any).modelContext;
    if (!modelContext) return;

    // 1. generate_medical_summary
    const sumCtrl = new AbortController();
    const sumTool = {
      name: 'generate_medical_summary',
      description: 'Generates a medical summary for the current patient based on the provided clinical notes and current patient data.',
      inputSchema: { type: 'object', properties: {} },
      execute: async () => {
        try {
          const patientDataStr = this.state.getAllDataForPrompt();
          const report = await this.clinicalIntelligence.generateComprehensiveReport(patientDataStr);
          return { content: [{ type: 'text', text: JSON.stringify(report) }] };
        } catch (e: any) {
          return { content: [{ type: 'text', text: `Failed to generate summary: ${e.message}` }], isError: true };
        }
      }
    };
    modelContext.registerTool(sumTool, { signal: sumCtrl.signal });
    this.mcpControllers.push({ name: sumTool.name, controller: sumCtrl });

    // 2. translate_clinical_text
    const transCtrl = new AbortController();
    const transTool = {
      name: 'translate_clinical_text',
      description: 'Translates a clinical text to a specific reading level (e.g. simplified, child, dyslexia).',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'The clinical text to translate.' },
          targetLevel: { type: 'string', enum: ['simplified', 'child', 'dyslexia'], description: 'The target reading level.' }
        },
        required: ['text', 'targetLevel']
      },
      execute: async (params: any) => {
        try {
          if (!['simplified', 'child', 'dyslexia'].includes(params.targetLevel)) {
            throw new Error("Invalid targetLevel. Must be one of: 'simplified', 'child', 'dyslexia'.");
          }
          const translation = await this.clinicalIntelligence.translateReadingLevel(params.text, params.targetLevel);
          return { content: [{ type: 'text', text: translation }] };
        } catch (e: any) {
          return { content: [{ type: 'text', text: `Failed to translate text: ${e.message}` }], isError: true };
        }
      }
    };
    modelContext.registerTool(transTool, { signal: transCtrl.signal });
    this.mcpControllers.push({ name: transTool.name, controller: transCtrl });

    // 3. get_current_patient_data
    const pdataCtrl = new AbortController();
    const pdataTool = {
      name: 'get_current_patient_data',
      description: 'Retrieves the current patient data context being viewed in the application.',
      inputSchema: { type: 'object', properties: {} },
      execute: async () => {
        const patientData = this.state.getCurrentState();
        return { content: [{ type: 'text', text: JSON.stringify(patientData, null, 2) }] };
      }
    };
    modelContext.registerTool(pdataTool, { signal: pdataCtrl.signal });
    this.mcpControllers.push({ name: pdataTool.name, controller: pdataCtrl });

    // 4. navigate_to_body_part
    const navCtrl = new AbortController();
    const navTool = {
      name: 'navigate_to_body_part',
      description: 'Navigates the UI to focus on a specific body part and opens the analysis tab.',
      inputSchema: {
        type: 'object',
        properties: {
          partId: { type: 'string', description: 'The ID of the body part to navigate to (e.g., "head", "right_knee").' }
        },
        required: ['partId']
      },
      execute: async (params: any) => {
        try {
          if (BODY_PART_NAMES[params.partId]) {
            this.ngZone.run(() => {
              this.state.selectPart(params.partId);
              if (callbacks.onNavigateToBodyPart) {
                callbacks.onNavigateToBodyPart(params.partId);
              }
            });
            return { content: [{ type: 'text', text: `Successfully navigated to ${BODY_PART_NAMES[params.partId]}` }] };
          } else {
            throw new Error(`Invalid body part ID: ${params.partId}`);
          }
        } catch (e: any) {
          return { content: [{ type: 'text', text: `Failed to navigate: ${e.message}` }], isError: true };
        }
      }
    };
    modelContext.registerTool(navTool, { signal: navCtrl.signal });
    this.mcpControllers.push({ name: navTool.name, controller: navCtrl });

    // 5. inject_clinical_note
    const injectCtrl = new AbortController();
    const injectTool = {
      name: 'inject_clinical_note',
      description: 'Injects structured clinical data (a note) for a specific body part.',
      inputSchema: {
        type: 'object',
        properties: {
          partId: { type: 'string', description: 'The ID of the body part (e.g., "right_knee").' },
          painLevel: { type: 'number', description: 'Pain level from 0 to 10.' },
          description: { type: 'string', description: 'Clinical observations or description of the issue.' },
          recommendation: { type: 'string', description: 'Recommended treatments or next steps.' }
        },
        required: ['partId', 'painLevel', 'description']
      },
      execute: async (params: any) => {
        try {
          const partName = BODY_PART_NAMES[params.partId] || 'Selection';
          const newNoteId = `note_${Date.now()}`;
          const newNote = {
            id: params.partId,
            noteId: newNoteId,
            name: partName.toUpperCase(),
            painLevel: params.painLevel,
            description: params.description,
            symptoms: [],
            recommendation: params.recommendation || ''
          };
          this.ngZone.run(() => {
            this.state.updateIssue(params.partId, newNote);
            this.state.selectPart(params.partId);
            this.state.selectNote(newNoteId);
          });
          return { content: [{ type: 'text', text: `Successfully injected clinical note for ${partName}` }] };
        } catch (e: any) {
          return { content: [{ type: 'text', text: `Failed to inject note: ${e.message}` }], isError: true };
        }
      }
    };
    modelContext.registerTool(injectTool, { signal: injectCtrl.signal });
    this.mcpControllers.push({ name: injectTool.name, controller: injectCtrl });

    // 6. load_research_url
    const loadUrlCtrl = new AbortController();
    const loadUrlTool = {
      name: 'load_research_url',
      description: 'Loads a external web URL or research document in the embedded research frame viewer.',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'The URL to load.' }
        },
        required: ['url']
      },
      execute: async (params: any) => {
        try {
          this.ngZone.run(() => {
            this.state.requestResearchUrl(params.url);
            this.state.toggleResearchFrame(true);
          });
          return { content: [{ type: 'text', text: `Loaded URL: ${params.url}` }] };
        } catch (e: any) {
          return { content: [{ type: 'text', text: `Failed to load URL: ${e.message}` }], isError: true };
        }
      }
    };
    modelContext.registerTool(loadUrlTool, { signal: loadUrlCtrl.signal });
    this.mcpControllers.push({ name: loadUrlTool.name, controller: loadUrlCtrl });

    // 7. add_research_bookmark
    const bmkCtrl = new AbortController();
    const bmkTool = {
      name: 'add_research_bookmark',
      description: "Pre-stages a relevant literature link in the patient's bookmarks.",
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'The title of the bookmark.' },
          url: { type: 'string', description: 'The URL of the bookmark.' },
          authors: { type: 'string', description: 'The authors of the literature.' },
          doi: { type: 'string', description: 'The DOI of the literature.' },
          isPeerReviewed: { type: 'boolean', description: 'Whether the literature is peer-reviewed.' },
          cited: { type: 'boolean', description: 'Whether to include in summary references.' }
        },
        required: ['title', 'url']
      },
      execute: async (params: any) => {
        try {
          this.ngZone.run(() => {
            if (callbacks.onAddBookmark) {
              callbacks.onAddBookmark(params);
            }
          });
          return { content: [{ type: 'text', text: `Added bookmark: ${params.title}` }] };
        } catch (e: any) {
          return { content: [{ type: 'text', text: `Failed to add bookmark: ${e.message}` }], isError: true };
        }
      }
    };
    modelContext.registerTool(bmkTool, { signal: bmkCtrl.signal });
    this.mcpControllers.push({ name: bmkTool.name, controller: bmkCtrl });

    // 8. export_patient_csv_telemetry
    const csvCtrl = new AbortController();
    const csvTool = {
      name: 'export_patient_csv_telemetry',
      description: 'Exports the active patient vital signs, biometric sensors, clinical assessment scores (PHQ-9, GAD-7, Y-BOCS, KSS), and telemetry metrics as an RFC 4180 CSV file.',
      inputSchema: {
        type: 'object',
        properties: {
          downloadFile: { type: 'boolean', description: 'Whether to trigger a client-side browser file download.' }
        }
      },
      execute: async (params: any) => {
        try {
          const patientData = this.state.getCurrentState();
          if (params?.downloadFile) {
            this.ngZone.run(() => {
              this.exportService.exportCsvReport(patientData);
            });
          }
          const csvText = (this.exportService as any).csvStrategy.generatePatientCsv(patientData);
          return { content: [{ type: 'text', text: csvText }] };
        } catch (e: any) {
          return { content: [{ type: 'text', text: `Failed to export CSV telemetry: ${e.message}` }], isError: true };
        }
      }
    };
    modelContext.registerTool(csvTool, { signal: csvCtrl.signal });
    this.mcpControllers.push({ name: csvTool.name, controller: csvCtrl });

    // 9. export_patient_hl7v2_message
    const hl7Ctrl = new AbortController();
    const hl7Tool = {
      name: 'export_patient_hl7v2_message',
      description: 'Exports an HL7 v2.5.1 ER7 (pipe-delimited) ORU^R01 observation message containing patient clinical observations, vitals, and LOINC codes for legacy hospital EHR systems.',
      inputSchema: {
        type: 'object',
        properties: {
          downloadFile: { type: 'boolean', description: 'Whether to trigger a client-side browser file download.' }
        }
      },
      execute: async (params: any) => {
        try {
          const patientData = this.state.getCurrentState();
          if (params?.downloadFile) {
            this.ngZone.run(() => {
              this.exportService.exportHl7v2Report(patientData);
            });
          }
          const hl7Text = (this.exportService as any).hl7v2Strategy.generateHl7v2Message(patientData);
          return { content: [{ type: 'text', text: hl7Text }] };
        } catch (e: any) {
          return { content: [{ type: 'text', text: `Failed to export HL7 v2.5.1 message: ${e.message}` }], isError: true };
        }
      }
    };
    modelContext.registerTool(hl7Tool, { signal: hl7Ctrl.signal });
    this.mcpControllers.push({ name: hl7Tool.name, controller: hl7Ctrl });

    // 10. purge_transient_patient_state
    const purgeCtrl = new AbortController();
    const purgeTool = {
      name: 'purge_transient_patient_state',
      description: 'Purges all active patient state, transient in-memory signals, and local storage caches to enforce strict anti-surveillance privacy hygiene.',
      inputSchema: { type: 'object', properties: {} },
      execute: async () => {
        try {
          let res: { timestamp: string; purgedItemsCount: number } = { timestamp: '', purgedItemsCount: 0 };
          this.ngZone.run(() => {
            res = this.state.purgeTransientPatientState();
          });
          return { content: [{ type: 'text', text: `Successfully purged ${res.purgedItemsCount} transient items at ${res.timestamp}` }] };
        } catch (e: any) {
          return { content: [{ type: 'text', text: `Failed to purge transient patient state: ${e.message}` }], isError: true };
        }
      }
    };
    modelContext.registerTool(purgeTool, { signal: purgeCtrl.signal });
    this.mcpControllers.push({ name: purgeTool.name, controller: purgeCtrl });

    // 11. toggle_ephemeral_privacy_mode
    const privacyCtrl = new AbortController();
    const privacyTool = {
      name: 'toggle_ephemeral_privacy_mode',
      description: 'Toggles strict local edge privacy mode (enabling/disabling external network telemetry egress).',
      inputSchema: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean', description: 'Whether to enable strict local edge privacy mode.' }
        }
      },
      execute: async (params: any) => {
        try {
          let nextState = true;
          this.ngZone.run(() => {
            nextState = this.state.toggleEphemeralPrivacyMode(params?.enabled);
          });
          return { content: [{ type: 'text', text: `Ephemeral Privacy Mode set to: ${nextState ? 'ENABLED (Strict Edge Isolation)' : 'DISABLED'}` }] };
        } catch (e: any) {
          return { content: [{ type: 'text', text: `Failed to toggle privacy mode: ${e.message}` }], isError: true };
        }
      }
    };
    modelContext.registerTool(privacyTool, { signal: privacyCtrl.signal });
    this.mcpControllers.push({ name: privacyTool.name, controller: privacyCtrl });

    // 12. get_teledentistry_systemic_telemetry
    const dentCtrl = new AbortController();
    const dentTool = {
      name: 'get_teledentistry_systemic_telemetry',
      description: 'Retrieves 32-tooth FDI odontogram findings, Tooth Wear Index (TWI Grades 0-4), periodontal probing depth (PPD >= 4mm), bleeding on probing (BOP), and Systemic Inflammatory Burden Index (SIBI 0-100) cross-talk to cardiovascular risk & HbA1c trajectory.',
      inputSchema: { type: 'object', properties: {} },
      execute: async () => {
        try {
          const telemetry = {
            sibiScore: this.teledentistryService.sibiScore(),
            cvRiskMultiplier: this.teledentistryService.cvRiskMultiplier(),
            predictedHbA1cElevation: this.teledentistryService.predictedHbA1cElevation(),
            deepPocketsCount: this.teledentistryService.deepPocketsCount(),
            bleedingPercentage: this.teledentistryService.bleedingPercentage(),
            hsCRP: this.teledentistryService.hsCRP(),
            teeth: this.teledentistryService.teeth()
          };
          return { content: [{ type: 'text', text: JSON.stringify(telemetry, null, 2) }] };
        } catch (e: any) {
          return { content: [{ type: 'text', text: `Failed to fetch teledentistry telemetry: ${e.message}` }], isError: true };
        }
      }
    };
    modelContext.registerTool(dentTool, { signal: dentCtrl.signal });
    this.mcpControllers.push({ name: dentTool.name, controller: dentCtrl });

    // 13. update_tooth_periodontal_status
    const updateToothCtrl = new AbortController();
    const updateToothTool = {
      name: 'update_tooth_periodontal_status',
      description: 'Updates periodontal probing depth (mm), Bleeding on Probing (BOP), surface caries, or Smith & Knight Tooth Wear Index (TWI Grade 0-4) for a specific FDI tooth number (11-48).',
      inputSchema: {
        type: 'object',
        properties: {
          fdiNumber: { type: 'number', description: 'The FDI tooth number (e.g. 16 for Maxillary Right 1st Molar).' },
          probingDepthMm: { type: 'number', description: 'Periodontal probing depth in millimeters.' },
          hasBleedingOnProbing: { type: 'boolean', description: 'Whether bleeding on probing is present.' },
          twiGrade: { type: 'number', description: 'Smith & Knight Tooth Wear Index grade (0 to 4).' }
        },
        required: ['fdiNumber']
      },
      execute: async (params: any) => {
        try {
          const fdi = Number(params.fdiNumber);
          if (!fdi || fdi < 11 || fdi > 48) {
            throw new Error(`Invalid FDI tooth number: ${params.fdiNumber}`);
          }
          this.ngZone.run(() => {
            if (typeof params.probingDepthMm === 'number') {
              this.teledentistryService.setProbingDepth(fdi, params.probingDepthMm);
            }
            if (typeof params.hasBleedingOnProbing === 'boolean') {
              const currentTooth = this.teledentistryService.teeth().find(t => t.fdiNumber === fdi);
              if (currentTooth && currentTooth.hasBleedingOnProbing !== params.hasBleedingOnProbing) {
                this.teledentistryService.toggleBOP(fdi);
              }
            }
            if (typeof params.twiGrade === 'number' && params.twiGrade >= 0 && params.twiGrade <= 4) {
              this.teledentistryService.setTWIGrade(fdi, params.twiGrade as any);
            }
          });
          return { content: [{ type: 'text', text: `Successfully updated FDI Tooth ${fdi} periodontal status. Recalculated SIBI score: ${this.teledentistryService.sibiScore()}` }] };
        } catch (e: any) {
          return { content: [{ type: 'text', text: `Failed to update tooth status: ${e.message}` }], isError: true };
        }
      }
    };
    modelContext.registerTool(updateToothTool, { signal: updateToothCtrl.signal });
    this.mcpControllers.push({ name: updateToothTool.name, controller: updateToothCtrl });

    // 14. export_patient_care_plan_fhir_r4
    const fhirExportCtrl = new AbortController();
    const fhirExportTool = {
      name: 'export_patient_care_plan_fhir_r4',
      description: 'Exports the active patient care plan as a de-identified HIPAA §164.514 compliant FHIR R4 Bundle JSON payload.',
      inputSchema: { type: 'object', properties: {} },
      execute: async () => {
        try {
          const rawBundle = this.exportService.exportFHIR();
          const deidentifiedBundle = this.gcpHealthcareService.deidentifyFhirPayload(rawBundle);
          return { content: [{ type: 'text', text: JSON.stringify(deidentifiedBundle, null, 2) }] };
        } catch (e: any) {
          return { content: [{ type: 'text', text: `Failed to export FHIR R4 care plan: ${e.message}` }], isError: true };
        }
      }
    };
    modelContext.registerTool(fhirExportTool, { signal: fhirExportCtrl.signal });
    this.mcpControllers.push({ name: fhirExportTool.name, controller: fhirExportCtrl });

    // 15. trigger_hybrid_fhir_dual_sync
    const fhirSyncCtrl = new AbortController();
    const fhirSyncTool = {
      name: 'trigger_hybrid_fhir_dual_sync',
      description: 'Triggers hybrid dual-synchronization of de-identified FHIR R4 care plans across Google Cloud Healthcare API & AWS HealthLake.',
      inputSchema: { type: 'object', properties: {} },
      execute: async () => {
        try {
          const rawBundle = this.exportService.exportFHIR();
          const syncResult = await this.gcpHealthcareService.syncHybridFhirBundle(rawBundle, { deidentify: true });
          return { content: [{ type: 'text', text: JSON.stringify(syncResult, null, 2) }] };
        } catch (e: any) {
          return { content: [{ type: 'text', text: `Failed to execute hybrid FHIR sync: ${e.message}` }], isError: true };
        }
      }
    };
    modelContext.registerTool(fhirSyncTool, { signal: fhirSyncCtrl.signal });
    this.mcpControllers.push({ name: fhirSyncTool.name, controller: fhirSyncCtrl });

    // 16. calculate_skeptical_falsifiability_score
    const skepCtrl = new AbortController();
    const skepTool = {
      name: 'calculate_skeptical_falsifiability_score',
      description: 'Evaluates Popperian p-value null-hypothesis testing (H0), Cochrane Risk of Bias 2.0 (RoB 2) rating, and FDA 21 CFR §520(o) CDS compliance report for clinical recommendations.',
      inputSchema: {
        type: 'object',
        properties: {
          lensName: { type: 'string', description: 'The clinical lens scope (e.g. "Summary Overview", "PhysioNet / RSNA 2026").' },
          sampleSize: { type: 'number', description: 'Sample size N for null hypothesis evaluation.' }
        }
      },
      execute: async (params: any) => {
        try {
          const report = this.skepticalService.evaluateCdsCompliance(params?.lensName || 'Summary Overview');
          return { content: [{ type: 'text', text: JSON.stringify(report, null, 2) }] };
        } catch (e: any) {
          return { content: [{ type: 'text', text: `Failed to calculate skeptical score: ${e.message}` }], isError: true };
        }
      }
    };
    modelContext.registerTool(skepTool, { signal: skepCtrl.signal });
    this.mcpControllers.push({ name: skepTool.name, controller: skepCtrl });

    // 17. set_gemini_thinking_reasoning_budget
    const thinkCtrl = new AbortController();
    const thinkTool = {
      name: 'set_gemini_thinking_reasoning_budget',
      description: 'Dynamically configures Gemini 2.5 Thinking model reasoning token budgets (1024 summary, 4096 protocol, 8192 high acuity SIBI/RSNA).',
      inputSchema: {
        type: 'object',
        properties: {
          thinkingBudget: { type: 'number', description: 'The reasoning token budget (e.g. 1024, 4096, 8192).' },
          enabled: { type: 'boolean', description: 'Whether reasoning thinking process is enabled.' }
        },
        required: ['thinkingBudget']
      },
      execute: async (params: any) => {
        try {
          this.ngZone.run(() => {
            this.moeRouter.setCustomThinkingBudget(params.enabled === false ? 0 : params.thinkingBudget);
          });
          const currentConfig = this.moeRouter.currentThinkingConfig();
          return { content: [{ type: 'text', text: `Gemini 2.5 Thinking model budget updated: ${JSON.stringify(currentConfig)}` }] };
        } catch (e: any) {
          return { content: [{ type: 'text', text: `Failed to update thinking budget: ${e.message}` }], isError: true };
        }
      }
    };
    modelContext.registerTool(thinkTool, { signal: thinkCtrl.signal });
    this.mcpControllers.push({ name: thinkTool.name, controller: thinkCtrl });

    // 16. analyze_systemic_inflammatory_burden
    const sibiCtrl = new AbortController();
    const sibiTool = {
      name: 'analyze_systemic_inflammatory_burden',
      description: 'Calculates the Systemic Inflammatory Burden Index (SIBI) cross-talk score from CRP, Periodontal Probing Depth (PPD), and blood pressure.',
      inputSchema: {
        type: 'object',
        properties: {
          hsCrp: { type: 'number', description: 'Serum hs-CRP level in mg/L.' },
          ppd: { type: 'number', description: 'Max Periodontal Probing Depth in mm.' },
          sbp: { type: 'number', description: 'Systolic Blood Pressure in mmHg.' }
        },
        required: ['hsCrp', 'ppd', 'sbp']
      },
      execute: async (params: any) => {
        try {
          const score = Number((params.hsCrp * 0.35 + params.ppd * 0.75 + Math.max(0, params.sbp - 120) * 0.04).toFixed(2));
          const tier = score > 8.0 ? 'HIGH_INFLAMMATORY_BURDEN' : score > 4.0 ? 'MODERATE_BURDEN' : 'LOW_BURDEN';
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ sibiScore: score, burdenTier: tier, cvRiskMultiplier: Number((1 + score * 0.08).toFixed(2)) })
            }]
          };
        } catch (e: any) {
          return { content: [{ type: 'text', text: `Failed to compute SIBI: ${e.message}` }], isError: true };
        }
      }
    };
    modelContext.registerTool(sibiTool, { signal: sibiCtrl.signal });
    this.mcpControllers.push({ name: sibiTool.name, controller: sibiCtrl });

    // 17. assess_cochrane_risk_of_bias
    const robCtrl = new AbortController();
    const robTool = {
      name: 'assess_cochrane_risk_of_bias',
      description: 'Evaluates literature evidence citations for Cochrane RoB 2 study design biases across randomization and missing outcome data.',
      inputSchema: {
        type: 'object',
        properties: {
          studyTitle: { type: 'string', description: 'The title of the clinical trial or literature citation.' },
          randomization: { type: 'string', enum: ['LOW', 'SOME_CONCERNS', 'HIGH'], description: 'Randomization bias assessment.' },
          missingData: { type: 'string', enum: ['LOW', 'SOME_CONCERNS', 'HIGH'], description: 'Missing outcome data bias assessment.' }
        },
        required: ['studyTitle', 'randomization', 'missingData']
      },
      execute: async (params: any) => {
        try {
          const overall = (params.randomization === 'HIGH' || params.missingData === 'HIGH') ? 'HIGH_RISK_OF_BIAS'
            : (params.randomization === 'SOME_CONCERNS' || params.missingData === 'SOME_CONCERNS') ? 'SOME_CONCERNS' : 'LOW_RISK_OF_BIAS';
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ studyTitle: params.studyTitle, overallRiskOfBias: overall, evidenceTier: overall === 'LOW_RISK_OF_BIAS' ? 'Level A (High Quality RCT)' : 'Level C (Exploratory/Observational)' })
            }]
          };
        } catch (e: any) {
          return { content: [{ type: 'text', text: `Failed to assess Cochrane RoB 2: ${e.message}` }], isError: true };
        }
      }
    };
    modelContext.registerTool(robTool, { signal: robCtrl.signal });
    this.mcpControllers.push({ name: robTool.name, controller: robCtrl });

    // 18. query_biophysical_substrate_params
    const subCtrl = new AbortController();
    const subTool = {
      name: 'query_biophysical_substrate_params',
      description: 'Returns 3D anatomical WebGL PBR surface and biophysical tissue parameters.',
      inputSchema: {
        type: 'object',
        properties: {
          tissueType: { type: 'string', enum: ['bone', 'skin', 'vascular', 'dental'], description: 'Anatomical tissue type.' }
        },
        required: ['tissueType']
      },
      execute: async (params: any) => {
        const substrateMap: Record<string, any> = {
          bone: { roughness: 0.65, metalness: 0.05, microgravityResorptionRate: '1.5% / month', tensileStrengthMpa: 130 },
          skin: { roughness: 0.40, metalness: 0.0, sssStrength: 0.85, hydrationSensitivity: 'High' },
          vascular: { roughness: 0.20, metalness: 0.1, elasticityModulusKpa: 450, shearStressLimitPa: 15 },
          dental: { roughness: 0.15, metalness: 0.0, enamelHardnessVickers: 350, twiGradeMax: 4 }
        };
        const data = substrateMap[params.tissueType] || substrateMap['bone'];
        return { content: [{ type: 'text', text: JSON.stringify({ tissueType: params.tissueType, substrate: data }) }] };
      }
    };
    modelContext.registerTool(subTool, { signal: subCtrl.signal });
    this.mcpControllers.push({ name: subTool.name, controller: subCtrl });

    // 21. evaluate_irmaa_medicare_surcharge_and_ssa44_appeal
    const irmaaCtrl = new AbortController();
    const irmaaTool = {
      name: 'evaluate_irmaa_medicare_surcharge_and_ssa44_appeal',
      description: 'Calculates Medicare Part B and Part D IRMAA monthly surcharges, tax cliff buffer distance, and Social Security Form SSA-44 Life-Changing Event appeal eligibility.',
      inputSchema: {
        type: 'object',
        properties: {
          magi: { type: 'number', description: 'Modified Adjusted Gross Income (from 2 years prior or current estimate)' },
          filingStatus: { type: 'string', enum: ['single', 'joint', 'separate'], description: 'Tax Filing Status' },
          lifeChangingEvents: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Qualifying events: WORK_STOPPAGE, WORK_REDUCTION, DEATH_OF_SPOUSE, MARRIAGE, DIVORCE_OR_ANNULMENT, INCOME_PROPERTY_LOSS, PENSION_PORTFOLIO_LOSS, EMPLOYER_SETTLEMENT' 
          }
        },
        required: ['magi']
      },
      execute: async (params: any) => {
        const magi = Number(params.magi) || 125000;
        const status = params.filingStatus || 'single';
        const events = Array.isArray(params.lifeChangingEvents) ? params.lifeChangingEvents : [];
        const svc = this.irmaaService || new IrmaaDecisionService();
        const res = svc.evaluateIrmaa(magi, status, events);
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      }
    };
    modelContext.registerTool(irmaaTool, { signal: irmaaCtrl.signal });
    this.mcpControllers.push({ name: irmaaTool.name, controller: irmaaCtrl });

    // 22. evaluate_medicare_billing_and_gfe_eligibility
    const billingCtrl = new AbortController();
    const billingTool = {
      name: 'evaluate_medicare_billing_and_gfe_eligibility',
      description: 'Evaluates Inflation Reduction Act $2,000 Part D prescription cap, MPPP monthly smoothing, RPM/CCM CPT compliance (CPT 99454/99457), No Surprises Act Good Faith Estimates, and IRS Section 501(r) Charity Care FPL eligibility.',
      inputSchema: {
        type: 'object',
        properties: {
          annualRxCost: { type: 'number', description: 'Annual out-of-pocket prescription medication cost' },
          daysDeviceTransmitted: { type: 'number', description: 'Days of RPM physiological telemetry readings in 30-day period (16+ required)' },
          clinicalMinutesLogged: { type: 'number', description: 'Minutes of clinical staff management time in month (20+ required)' },
          annualIncome: { type: 'number', description: 'Patient household annual income in USD' },
          householdSize: { type: 'number', description: 'Household size (default 1)' }
        },
        required: ['annualRxCost', 'annualIncome']
      },
      execute: async (params: any) => {
        const annualRxCost = Number(params.annualRxCost) || 0;
        const daysDeviceTransmitted = Number(params.daysDeviceTransmitted) || 0;
        const clinicalMinutesLogged = Number(params.clinicalMinutesLogged) || 0;
        const annualIncome = Number(params.annualIncome) || 30000;
        const householdSize = Number(params.householdSize) || 1;

        const svc = this.medicareBillingService || new MedicareBillingBestPracticesService();
        const res = svc.assessMedicareBilling({
          annualRxCost,
          daysDeviceTransmitted,
          clinicalMinutesLogged,
          annualIncome,
          householdSize
        });
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      }
    };
    modelContext.registerTool(billingTool, { signal: billingCtrl.signal });
    this.mcpControllers.push({ name: billingTool.name, controller: billingCtrl });

    // 23. evaluate_hedis_quality_measures_and_care_gaps
    const hedisCtrl = new AbortController();
    const hedisTool = {
      name: 'evaluate_hedis_quality_measures_and_care_gaps',
      description: 'Evaluates HEDIS quality measures (CBP, HBD, MAD, MAH, MAS, COL, EED), CMS 1-5 Star Ratings, triple-weighted medication adherence PDC percentages, and CMS Quality Bonus Payment (QBP) eligibility.',
      inputSchema: {
        type: 'object',
        properties: {
          systolicBp: { type: 'number', description: 'Systolic blood pressure in mmHg' },
          diastolicBp: { type: 'number', description: 'Diastolic blood pressure in mmHg' },
          hbA1c: { type: 'number', description: 'Hemoglobin A1c percentage (e.g. 7.2)' },
          diabetesRefillDays: { type: 'number', description: 'Diabetes medication refill days in year' },
          hypertensionRefillDays: { type: 'number', description: 'Hypertension/RAS medication refill days in year' },
          statinRefillDays: { type: 'number', description: 'Statin medication refill days in year' },
          hasColorectalScreening: { type: 'boolean', description: 'Whether colorectal screening is up to date' },
          hasDiabeticEyeExam: { type: 'boolean', description: 'Whether diabetic retinal exam is complete' }
        }
      },
      execute: async (params: any) => {
        const svc = this.hedisService || new HedisStarRatingService();
        const res = svc.generateOverallSummary('P-101', {
          systolicBp: params.systolicBp !== undefined ? Number(params.systolicBp) : 128,
          diastolicBp: params.diastolicBp !== undefined ? Number(params.diastolicBp) : 82,
          hbA1c: params.hbA1c !== undefined ? Number(params.hbA1c) : 7.2,
          diabetesRefillDays: params.diabetesRefillDays !== undefined ? Number(params.diabetesRefillDays) : 310,
          hypertensionRefillDays: params.hypertensionRefillDays !== undefined ? Number(params.hypertensionRefillDays) : 310,
          statinRefillDays: params.statinRefillDays !== undefined ? Number(params.statinRefillDays) : 300,
          hasColorectalScreening: params.hasColorectalScreening !== false,
          hasDiabeticEyeExam: params.hasDiabeticEyeExam !== false,
          hasDiabetes: true,
          hasHypertension: true
        });
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      }
    };
    modelContext.registerTool(hedisTool, { signal: hedisCtrl.signal });
    this.mcpControllers.push({ name: hedisTool.name, controller: hedisCtrl });

    // 24. submit_fhir_davinci_prior_authorization_claim
    const pasCtrl = new AbortController();
    const pasTool = {
      name: 'submit_fhir_davinci_prior_authorization_claim',
      description: 'Submits HL7 FHIR Da Vinci PAS (Prior Authorization Support) IG claim under CMS-0057-F mandate for real-time sub-second medical necessity prior-authorization approval.',
      inputSchema: {
        type: 'object',
        properties: {
          patientId: { type: 'string', description: 'Patient Identifier (e.g. p010)' },
          payerId: { type: 'string', description: 'Payer Identifier (default PAYER-MEDICARE-001)' },
          cptCode: { type: 'string', description: 'CPT Procedure Code (e.g. 70553 Brain MRI, 78607 DaTscan, 74177 Abdominal CT)' },
          icd10DiagnosisCodes: { type: 'array', items: { type: 'string' }, description: 'ICD-10 Diagnosis Codes (e.g. G30.9, G20, C25.0)' },
          clinicalDocumentationText: { type: 'string', description: 'Supporting clinical note text' }
        },
        required: ['cptCode', 'icd10DiagnosisCodes']
      },
      execute: async (params: any) => {
        const svc = this.priorAuthService || new FhirPriorAuthService();
        const claim = svc.createPasClaimRequest({
          patientId: params.patientId || 'p010',
          payerId: params.payerId || 'PAYER-MEDICARE-001',
          providerNpi: '1992837465',
          items: [{
            sequence: 1,
            cptCode: params.cptCode,
            description: `Procedure CPT ${params.cptCode}`,
            unitPriceUsd: 1200,
            icd10DiagnosisCodes: Array.isArray(params.icd10DiagnosisCodes) ? params.icd10DiagnosisCodes : ['G30.9']
          }],
          clinicalDocumentationText: params.clinicalDocumentationText || 'Patient presents with MMSE 19/30 cognitive memory loss and 3Hz resting tremor.'
        });
        const res = svc.evaluatePriorAuthClaim(claim);
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      }
    };
    modelContext.registerTool(pasTool, { signal: pasCtrl.signal });
    this.mcpControllers.push({ name: pasTool.name, controller: pasCtrl });

    // 25. crosswalk_snomed_ct_to_icd10_and_cpt
    const snomedCtrl = new AbortController();
    const snomedTool = {
      name: 'crosswalk_snomed_ct_to_icd10_and_cpt',
      description: 'Cross-walks point-of-care SNOMED CT clinical terms (USCDI v4 mandate) to ICD-10-CM diagnosis codes, CPT procedure codes, LOINC lab identifiers, and RxNorm CUIs.',
      inputSchema: {
        type: 'object',
        properties: {
          snomedCode: { type: 'string', description: 'SNOMED CT Concept Code (e.g. 26929004 Alzheimer, 49049000 Parkinson, 372130007 Pancreatic Cancer, 38341003 Hypertension, 73211009 Diabetes)' }
        },
        required: ['snomedCode']
      },
      execute: async (params: any) => {
        const svc = this.snomedCrosswalkService || new SnomedIcdCrosswalkService();
        const res = svc.crosswalkSnomedToIcd10(String(params.snomedCode || '26929004'));
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      }
    };
    modelContext.registerTool(snomedTool, { signal: snomedCtrl.signal });
    this.mcpControllers.push({ name: snomedTool.name, controller: snomedCtrl });

    // 26. analyze_webgpu_bio_signal_tremor_and_rppg
    const bioSignalCtrl = new AbortController();
    const bioSignalTool = {
      name: 'analyze_webgpu_bio_signal_tremor_and_rppg',
      description: 'Executes 100% client-side WebGPU zero-egress tremor frequency spectrum analysis (3-6 Hz Parkinsonian vs 6-12 Hz Essential tremor) and rPPG Heart Rate Variability (HRV / RMSSD).',
      inputSchema: {
        type: 'object',
        properties: {
          displacementsMm: { type: 'array', items: { type: 'number' }, description: 'Spatial displacement array in millimeters (30 fps sample rate)' },
          luminescenceSignal: { type: 'array', items: { type: 'number' }, description: 'Skin luminescence intensity array for rPPG heart rate extraction' }
        }
      },
      execute: async (params: any) => {
        const svc = this.bioSignalService || new WebgpuBioSignalService();
        const displacements = Array.isArray(params.displacementsMm) && params.displacementsMm.length > 0
          ? params.displacementsMm
          : [0, 2.5, -2.5, 2.5, -2.5, 2.5, -2.5, 0];
        const res = svc.analyzeBioSignalTelemetry(displacements, params.luminescenceSignal);
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      }
    };
    modelContext.registerTool(bioSignalTool, { signal: bioSignalCtrl.signal });
    this.mcpControllers.push({ name: bioSignalTool.name, controller: bioSignalCtrl });
  }

  /**
   * Aborts and unregisters all registered WebMCP tool controllers.
   */
  public unregisterTools(): void {
    for (const ctrl of this.mcpControllers) {
      ctrl.controller.abort();
    }
    this.mcpControllers = [];
  }
}
