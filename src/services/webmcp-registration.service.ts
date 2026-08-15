import { Injectable, inject, NgZone } from '@angular/core';
import { PatientStateService, BODY_PART_NAMES } from './patient-state.service';
import { IPatient } from './patient.types';
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
import { ClinicalGameTheoryService } from './clinical-game-theory.service';
import { JoyPlayfulFlourishingService } from './joy-playful-flourishing.service';
import { ClinicalTrialMatcherService } from './clinical-trial-matcher.service';
import { SmartOnFhirLaunchService } from './smart-on-fhir-launch.service';
import { WebgpuSpatialDigitalTwinService } from './webgpu-spatial-digital-twin.service';
import { InteractiveOnboardingTourService } from './interactive-onboarding-tour.service';
import { NavigationShellService } from './navigation-shell.service';
import { HelpfulListsService } from './helpful-lists.service';
import { MultilingualEquityService } from './multilingual-equity.service';
import { WhoCdcHealthEquityService } from './who-cdc-health-equity.service';
import { GreenComputingSustainabilityService } from './green-computing-sustainability.service';
import { CommunityEcoLocalizationService } from './community-eco-localization.service';
import { ZenSanctuaryService } from './zen-sanctuary.service';
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
  private gameTheoryService = inject(ClinicalGameTheoryService, { optional: true });
  private joyService = inject(JoyPlayfulFlourishingService, { optional: true });
  private trialMatcherService = inject(ClinicalTrialMatcherService, { optional: true });
  private smartLaunchService = inject(SmartOnFhirLaunchService, { optional: true });
  private digitalTwinService = inject(WebgpuSpatialDigitalTwinService, { optional: true });
  private tourService = inject(InteractiveOnboardingTourService, { optional: true });
  private navService = inject(NavigationShellService, { optional: true });
  private helpfulListsService = inject(HelpfulListsService, { optional: true });
  private multilingualService = inject(MultilingualEquityService, { optional: true });
  private equityService = inject(WhoCdcHealthEquityService, { optional: true });
  private greenService = inject(GreenComputingSustainabilityService, { optional: true });
  private communityEcoService = inject(CommunityEcoLocalizationService, { optional: true });
  private zenService = inject(ZenSanctuaryService, { optional: true });
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

    // 27. calculate_clinical_game_theory_adherence_incentives
    const gameTheoryCtrl = new AbortController();
    const gameTheoryTool = {
      name: 'calculate_clinical_game_theory_adherence_incentives',
      description: 'Calculates Stackelberg / Nash equilibrium for medication adherence rebate subsidies and avoided hospitalization savings.',
      inputSchema: {
        type: 'object',
        properties: {
          patientId: { type: 'string', description: 'Patient ID (e.g. p010)' },
          conditionName: { type: 'string', description: 'Condition name (e.g. Parkinson disease)' },
          annualCopayCostUsd: { type: 'number', description: 'Annual patient co-pay cost in USD' },
          estAnnualHospitalizationRiskUsd: { type: 'number', description: 'Estimated avoided inpatient hospitalization cost in USD' }
        },
        required: ['annualCopayCostUsd', 'estAnnualHospitalizationRiskUsd']
      },
      execute: async (params: any) => {
        const svc = this.gameTheoryService || new ClinicalGameTheoryService();
        const res = svc.calculateOptimalAdherenceIncentive({
          patientId: params.patientId || 'p010',
          conditionName: params.conditionName || 'Parkinson disease',
          annualCopayCostUsd: Number(params.annualCopayCostUsd || 480),
          estAnnualHospitalizationRiskUsd: Number(params.estAnnualHospitalizationRiskUsd || 12500)
        });
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      }
    };
    modelContext.registerTool(gameTheoryTool, { signal: gameTheoryCtrl.signal });
    this.mcpControllers.push({ name: gameTheoryTool.name, controller: gameTheoryCtrl });

    // 28. prescribe_joy_and_playful_flourishing
    const joyCtrl = new AbortController();
    const joyTool = {
      name: 'prescribe_joy_and_playful_flourishing',
      description: 'Prescribes micro-joy and micro-play activities (acoustic neuro-rhythm entrainment, botanical foraging, origami, storytelling, laughter yoga) and calculates PERMA+ playfulness scorecards.',
      inputSchema: {
        type: 'object',
        properties: {
          patientId: { type: 'string', description: 'Patient ID (e.g. p010)' }
        }
      },
      execute: async (params: any) => {
        const svc = this.joyService || new JoyPlayfulFlourishingService();
        const prescriptions = svc.dailyPrescriptions();
        const scorecard = svc.calculateJoyScorecard();
        return { content: [{ type: 'text', text: JSON.stringify({ prescriptions, scorecard }, null, 2) }] };
      }
    };
    modelContext.registerTool(joyTool, { signal: joyCtrl.signal });
    this.mcpControllers.push({ name: joyTool.name, controller: joyCtrl });

    // 29. match_clinical_trials_for_patient_conditions
    const trialCtrl = new AbortController();
    const trialTool = {
      name: 'match_clinical_trials_for_patient_conditions',
      description: 'Queries ClinicalTrials.gov API v2 for active recruiting clinical trials matching patient conditions, returning Phase I-IV studies and eligibility match scores.',
      inputSchema: {
        type: 'object',
        properties: {
          conditionName: { type: 'string', description: 'Condition name (e.g. Parkinson Disease, Alzheimer Disease, Glioblastoma)' },
          recruitingOnly: { type: 'boolean', description: 'Filter only actively recruiting trials' }
        },
        required: ['conditionName']
      },
      execute: async (params: any) => {
        const svc = this.trialMatcherService || new ClinicalTrialMatcherService();
        const matches = svc.searchClinicalTrials({
          conditionName: params.conditionName,
          recruitingOnly: params.recruitingOnly ?? true
        });
        return { content: [{ type: 'text', text: JSON.stringify(matches, null, 2) }] };
      }
    };
    modelContext.registerTool(trialTool, { signal: trialCtrl.signal });
    this.mcpControllers.push({ name: trialTool.name, controller: trialCtrl });

    // 30. initiate_smart_on_fhir_ehr_launch
    const smartLaunchCtrl = new AbortController();
    const smartLaunchTool = {
      name: 'initiate_smart_on_fhir_ehr_launch',
      description: 'Generates SMART-on-FHIR OAuth2 authorization launch URL with PKCE S256 challenge for embedded Epic, Cerner, and AthenaHealth EHR launches.',
      inputSchema: {
        type: 'object',
        properties: {
          vendor: { type: 'string', enum: ['EPIC', 'CERNER', 'ATHENAHEALTH', 'GENERIC_FHIR'], description: 'Target EHR vendor' },
          fhirBaseUrl: { type: 'string', description: 'FHIR R4 Server Base URL' },
          clientId: { type: 'string', description: 'SMART App Client ID' },
          launchToken: { type: 'string', description: 'EHR Launch Context Token' }
        },
        required: ['vendor']
      },
      execute: async (params: any) => {
        const svc = this.smartLaunchService || new SmartOnFhirLaunchService();
        const res = svc.buildAuthorizationUrl({
          vendor: params.vendor || 'EPIC',
          fhirBaseUrl: params.fhirBaseUrl,
          clientId: params.clientId || 'pocketgull-smart-client-v1',
          redirectUri: 'https://pocketgull.app/launch/callback',
          launchToken: params.launchToken
        });
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      }
    };
    modelContext.registerTool(smartLaunchTool, { signal: smartLaunchCtrl.signal });
    this.mcpControllers.push({ name: smartLaunchTool.name, controller: smartLaunchCtrl });

    // 31. calculate_medicare_irmaa_and_ssa44_appeals
    const medicareIrmaaCtrl = new AbortController();
    const medicareIrmaaTool = {
      name: 'calculate_medicare_irmaa_and_ssa44_appeals',
      description: 'Calculates 2026 Medicare IRMAA Part B/D income surcharges based on MAGI and determines eligibility for SSA-44 Life-Changing Event appeals.',
      inputSchema: {
        type: 'object',
        properties: {
          magiUsd: { type: 'number', description: 'Modified Adjusted Gross Income in USD' },
          filingStatus: { type: 'string', enum: ['single', 'joint', 'separate'], description: 'Tax filing status' },
          lifeChangingEvent: { type: 'string', enum: ['WORK_STOPPAGE', 'WORK_REDUCTION', 'MARRIAGE', 'DIVORCE_OR_ANNULMENT', 'INCOME_PROPERTY_LOSS'], description: 'SSA-44 Life-Changing Event' }
        },
        required: ['magiUsd']
      },
      execute: async (params: any) => {
        const svc = this.irmaaService || new IrmaaDecisionService();
        if (params.magiUsd !== undefined) svc.magi.set(Number(params.magiUsd));
        if (params.filingStatus) svc.filingStatus.set(params.filingStatus as any);
        if (params.lifeChangingEvent) svc.activeEvents.set([params.lifeChangingEvent as any]);
        const analysisResult = svc.analysis();
        return { content: [{ type: 'text', text: JSON.stringify(analysisResult, null, 2) }] };
      }
    };
    modelContext.registerTool(medicareIrmaaTool, { signal: medicareIrmaaCtrl.signal });
    this.mcpControllers.push({ name: medicareIrmaaTool.name, controller: medicareIrmaaCtrl });

    // 32. render_webgpu_3d_organ_digital_twin
    const twinCtrl = new AbortController();
    const twinTool = {
      name: 'render_webgpu_3d_organ_digital_twin',
      description: 'Calculates real-time WebGPU 3D organ digital twin mesh deformation, perfusion rates, and WGSL compute shader parameters.',
      inputSchema: {
        type: 'object',
        properties: {
          organ: { type: 'string', enum: ['HEART', 'LUNGS', 'LIVER', 'KIDNEYS', 'BRAIN'], description: 'Target organ' },
          heartRateBpm: { type: 'number', description: 'Heart rate in BPM' },
          spo2Percent: { type: 'number', description: 'Blood oxygen saturation percentage (70-100%)' }
        },
        required: ['organ']
      },
      execute: async (params: any) => {
        const svc = this.digitalTwinService || new WebgpuSpatialDigitalTwinService();
        svc.selectedOrgan.set(params.organ || 'HEART');
        if (params.heartRateBpm) svc.heartRate.set(Number(params.heartRateBpm));
        if (params.spo2Percent) svc.spo2Percent.set(Number(params.spo2Percent));
        const frame = svc.computeDigitalTwinFrame();
        return { content: [{ type: 'text', text: JSON.stringify(frame, null, 2) }] };
      }
    };
    modelContext.registerTool(twinTool, { signal: twinCtrl.signal });
    this.mcpControllers.push({ name: twinTool.name, controller: twinCtrl });

    // 33. guide_user_onboarding_walkthrough
    const tourCtrl = new AbortController();
    const tourTool = {
      name: 'guide_user_onboarding_walkthrough',
      description: 'Starts or advances interactive feature onboarding walkthrough tours tailored for PATIENT, CLINICIAN, or RESEARCHER personas.',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['START', 'NEXT', 'PREVIOUS', 'STOP'], description: 'Tour action' },
          persona: { type: 'string', enum: ['PATIENT', 'CLINICIAN', 'RESEARCHER', 'ALL'], description: 'Target user persona' }
        },
        required: ['action']
      },
      execute: async (params: any) => {
        const svc = this.tourService || new InteractiveOnboardingTourService();
        if (params.action === 'START') {
          svc.startTour(params.persona || 'PATIENT');
        } else if (params.action === 'NEXT') {
          svc.nextStep();
        } else if (params.action === 'PREVIOUS') {
          svc.previousStep();
        } else {
          svc.completeTour();
        }
        return { content: [{ type: 'text', text: JSON.stringify(svc.progress(), null, 2) }] };
      }
    };
    modelContext.registerTool(tourTool, { signal: tourCtrl.signal });
    this.mcpControllers.push({ name: tourTool.name, controller: tourCtrl });

    // 34. navigate_user_way_back_home
    const homeNavCtrl = new AbortController();
    const homeNavTool = {
      name: 'navigate_user_way_back_home',
      description: 'Resets user active shell navigation to primary clinical chart, closes all open modal overlays, and restores home view state.',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      },
      execute: async () => {
        const svc = this.navService || new NavigationShellService();
        svc.navigateWayBackHome();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: 'SUCCESS',
                activeTab: svc.activeTab(),
                message: 'Successfully navigated user way back home to clinical chart overview.'
              }, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(homeNavTool, { signal: homeNavCtrl.signal });
    this.mcpControllers.push({ name: homeNavTool.name, controller: homeNavCtrl });

    // 35. retrieve_helpful_community_and_clinical_lists
    const listsCtrl = new AbortController();
    const listsTool = {
      name: 'retrieve_helpful_community_and_clinical_lists',
      description: 'Retrieves curated quick-reference lists for 24/7 emergency hotlines (988, Poison, Vets), free 50-state statutory living wills, HEDIS quality benchmarks, and SSA-44 appeal checklists.',
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['EMERGENCY_HOTLINES', 'PATIENT_RIGHTS_LIVING_WILLS', 'CLINICAL_CHECKLISTS', 'MEDICARE_FINANCIAL_RESOURCES', 'ALL'],
            description: 'Target list category'
          }
        },
        required: []
      },
      execute: async (params: any) => {
        const svc = this.helpfulListsService || new HelpfulListsService();
        const category = params.category || 'ALL';
        const resultLists = category === 'ALL' 
          ? svc.curatedLists() 
          : svc.getListsByCategory(category);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                category,
                totalCount: resultLists.length,
                lists: resultLists
              }, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(listsTool, { signal: listsCtrl.signal });
    this.mcpControllers.push({ name: listsTool.name, controller: listsCtrl });

    // 36. translate_clinical_care_plan_multilingual
    const multiCtrl = new AbortController();
    const multiTool = {
      name: 'translate_clinical_care_plan_multilingual',
      description: 'Translates clinical care plans into plain-language multilingual summaries across 10 global languages (English, Spanish, Mandarin, Hindi, Arabic, Tagalog, French, Swahili, German, Japanese).',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Clinical recommendation text' },
          targetLanguageCode: {
            type: 'string',
            enum: ['en', 'es', 'zh', 'hi', 'ar', 'tl', 'fr', 'sw', 'de', 'ja'],
            description: 'Target language code'
          }
        },
        required: ['text']
      },
      execute: async (params: any) => {
        const svc = this.multilingualService || new MultilingualEquityService();
        const res = svc.translateClinicalCarePlan(params.text, params.targetLanguageCode || 'es');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(res, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(multiTool, { signal: multiCtrl.signal });
    this.mcpControllers.push({ name: multiTool.name, controller: multiCtrl });

    // 37. calculate_who_cdc_health_equity_index
    const equityCtrl = new AbortController();
    const equityTool = {
      name: 'calculate_who_cdc_health_equity_index',
      description: 'Evaluates WHO GPW 14 and CDC 2025-2030 Global Health Equity Index, SDOH PRAPARE risk vectors (housing, food, transport), and climate-health AQI vulnerability metrics.',
      inputSchema: {
        type: 'object',
        properties: {
          sdoh: {
            type: 'object',
            properties: {
              housingInsecurity: { type: 'boolean' },
              foodInsecurity: { type: 'boolean' },
              transportationBarrier: { type: 'boolean' },
              utilityInsecurity: { type: 'boolean' },
              digitalLiteracyBarrier: { type: 'boolean' }
            }
          },
          climate: {
            type: 'object',
            properties: {
              airQualityIndex: { type: 'number' },
              pm25MicrogramsM3: { type: 'number' },
              extremeHeatRiskDaysYear: { type: 'number' }
            }
          }
        },
        required: []
      },
      execute: async (params: any) => {
        const svc = this.equityService || new WhoCdcHealthEquityService();
        const res = svc.evaluateHealthEquity(params.sdoh, params.climate);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(res, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(equityTool, { signal: equityCtrl.signal });
    this.mcpControllers.push({ name: equityTool.name, controller: equityCtrl });

    // 38. recommend_sustainability_and_eco_health_actions
    const greenCtrl = new AbortController();
    const greenTool = {
      name: 'recommend_sustainability_and_eco_health_actions',
      description: 'Generates green computing, IEEE PES energy reduction, EAT-Lancet planetary health nutrition, active transit, and circular waste sustainability recommendations.',
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['COMPUTE_ENERGY', 'PLANETARY_DIET', 'ACTIVE_TRANSIT', 'CIRCULAR_WASTE_REDUCTION', 'JOYFUL_ECO_EXPERIENCE', 'ALL'],
            description: 'Target eco recommendation category'
          }
        },
        required: []
      },
      execute: async (params: any) => {
        const svc = this.greenService || new GreenComputingSustainabilityService();
        const category = params.category || 'ALL';
        const scorecard = svc.sustainabilityScorecard();
        const recs = category === 'ALL' ? scorecard.recommendations : svc.getRecommendationsByCategory(category);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                category,
                sustainabilityTier: scorecard.sustainabilityTier,
                totalCo2SavingsKgPerYear: scorecard.totalCo2SavingsKgPerYear,
                recommendations: recs
              }, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(greenTool, { signal: greenCtrl.signal });
    this.mcpControllers.push({ name: greenTool.name, controller: greenCtrl });

    // 39. localize_community_eco_health_hubs
    const communityEcoCtrl = new AbortController();
    const communityEcoTool = {
      name: 'localize_community_eco_health_hubs',
      description: 'Finds local farmers markets, community gardens, Shinrin-yoku forest bathing parks, greenways, and seed sharing libraries by geo-location.',
      inputSchema: {
        type: 'object',
        properties: {
          hubType: {
            type: 'string',
            enum: ['FARMERS_MARKET', 'COMMUNITY_GARDEN', 'FOREST_PARK', 'GREENWAY_BIKE_PATH', 'SEED_TOOL_LIBRARY', 'ALL'],
            description: 'Target eco hub type filter'
          }
        },
        required: []
      },
      execute: async (params: any) => {
        const svc = this.communityEcoService || new CommunityEcoLocalizationService();
        const hubType = params.hubType || 'ALL';
        const summary = svc.localizedEcoSummary();
        const hubs = hubType === 'ALL' ? summary.hubs : svc.getHubsByType(hubType);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                city: summary.city,
                region: summary.region,
                closestParkMiles: summary.closestParkMiles,
                closestMarketMiles: summary.closestMarketMiles,
                hubs
              }, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(communityEcoTool, { signal: communityEcoCtrl.signal });
    this.mcpControllers.push({ name: communityEcoTool.name, controller: communityEcoCtrl });

    // 40. export_complete_fhir_r4_health_sovereignty_bundle
    const fhirSovereigntyCtrl = new AbortController();
    const fhirSovereigntyTool = {
      name: 'export_complete_fhir_r4_health_sovereignty_bundle',
      description: 'Exports a complete HIPAA-compliant FHIR R4 Bundle containing patient demographic resources, observations, vitals, clinical assessments, and tri-paradigm care plans.',
      inputSchema: {
        type: 'object',
        properties: {
          format: {
            type: 'string',
            enum: ['JSON', 'COMPACT_JSON', 'SUMMARY'],
            description: 'Export bundle payload format'
          }
        },
        required: []
      },
      execute: async (params: any) => {
        const format = params?.format || 'JSON';
        const rawVitals = this.state.vitals ? this.state.vitals() : null;
        const patientData: Partial<IPatient> = {
          id: this.state.patientId ? this.state.patientId() : 'p001',
          name: this.state.patientName ? this.state.patientName() : 'Jane Doe',
          age: this.state.patientAge ? this.state.patientAge() : 42,
          vitals: {
            bp: rawVitals?.bp || '120/80',
            hr: String(rawVitals?.hr || '72'),
            temp: rawVitals?.temp || '98.6',
            spO2: String(rawVitals?.spO2 || '98'),
            weight: rawVitals?.weight || '70kg',
            height: rawVitals?.height || '175cm'
          }
        };

        const bundle = this.exportService.buildFhirR4Bundle
          ? this.exportService.buildFhirR4Bundle(patientData)
          : {
              resourceType: 'Bundle',
              type: 'collection',
              entry: [
                { resource: { resourceType: 'Patient', id: patientData.patientId, name: [{ text: patientData.name }] } }
              ]
            };

        const jsonText = format === 'COMPACT_JSON' ? JSON.stringify(bundle) : JSON.stringify(bundle, null, 2);

        return {
          content: [
            {
              type: 'text',
              text: jsonText
            }
          ]
        };
      }
    };
    modelContext.registerTool(fhirSovereigntyTool, { signal: fhirSovereigntyCtrl.signal });
    this.mcpControllers.push({ name: fhirSovereigntyTool.name, controller: fhirSovereigntyCtrl });

    // 40. Open Zen Sanctuary & Parasympathetic Breath Reset
    const zenSanctuaryCtrl = new AbortController();
    const zenSanctuaryTool = {
      name: 'open_zen_sanctuary',
      description: 'Activates the 1-click Zen Sanctuary Mode with 432Hz Tibetan singing bowl chime, 4-7-8 vagal breath pacer, and Kintsugi gold vein healing illumination.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false
      },
      execute: async () => {
        if (this.zenService) {
          this.ngZone.run(() => {
            this.zenService?.openSanctuary();
          });
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: 'ACTIVE',
                sound: '432Hz Tibetan Singing Bowl',
                breathPacer: '4-7-8 Vagal Entrainment',
                kintsugiIlluminated: true,
                message: 'Sanctuary mode activated. When the mind is quiet, the body begins to heal.'
              }, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(zenSanctuaryTool, { signal: zenSanctuaryCtrl.signal });
    this.mcpControllers.push({ name: zenSanctuaryTool.name, controller: zenSanctuaryCtrl });

    // 41. Get Healing Postcards from the Pier
    const healingPostcardsCtrl = new AbortController();
    const healingPostcardsTool = {
      name: 'get_healing_postcards',
      description: 'Retrieves quiet, anonymous peer encouragement postcards from the pier with recovery notes and community affirmations.',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Maximum number of postcards to retrieve' }
        },
        additionalProperties: false
      },
      execute: async (params: any) => {
        const limit = params?.limit || 10;
        const cards = this.zenService ? this.zenService.postcards().slice(0, limit) : [];
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                postcardsCount: cards.length,
                postcards: cards
              }, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(healingPostcardsTool, { signal: healingPostcardsCtrl.signal });
    this.mcpControllers.push({ name: healingPostcardsTool.name, controller: healingPostcardsCtrl });
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
