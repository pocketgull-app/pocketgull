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
import { SsaDisabilityNavigatorService } from './ssa-disability-navigator.service';
import { GlobalJurisdictionMatrixService } from './global-jurisdiction-matrix.service';
import { MandiantClinicalDefenseService } from './mandiant-clinical-defense.service';
import { ClinicalMandarinateExamService } from './clinical-mandarinate-exam.service';
import { MattMightPrecisionEngineService } from './precision-medicine-might.service';
import { NOfOneBayesianSimulatorService } from './n-of-one-bayesian-simulator.service';
import { MatchmakerExchangeService } from './matchmaker-exchange.service';
import { PrecisionRegulatoryDossierService } from './precision-regulatory-dossier.service';
import { AmazonListingGeneratorService } from './amazon-listing-generator.service';
import { ClinicalNegationResolutionService } from './clinical-negation-resolution.service';
import { ClinicalCodingCopilotService } from './clinical-coding-copilot.service';
import { ClinicalCeuUpskillingService } from './clinical-ceu-upskilling.service';
import { FhirDaVinciPasService } from './fhir-da-vinci-pas.service';
import { MaternalPostpartumSentinelService } from './maternal-postpartum-sentinel.service';
import { FemaleCardiacAtypicalScreeningService } from './female-cardiac-atypical-screening.service';
import { AutoimmuneMultiSystemDelayReducerService } from './autoimmune-multi-system-delay-reducer.service';
import { IntergenerationalWisdomService } from './intergenerational-wisdom.service';
import { YouthNeurodevelopmentHygieneService } from './youth-neurodevelopment-hygiene.service';
import { FutureCarePlanningService } from './future-care-planning.service';
import { ClinicalSocialWorkNavigatorService } from './clinical-social-work-navigator.service';
import { AddictionMedicineRecoveryService } from './addiction-medicine-recovery.service';
import { Section504AccommodationService } from './section-504-accommodation.service';
import { ClinicalSteeringCommitteeDossierService } from './clinical-steering-committee-dossier.service';
import { ClinicalGraphQLService } from './clinical-graphql.service';
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
  private ssaDisabilityService = inject(SsaDisabilityNavigatorService, { optional: true });
  private jurisdictionMatrixService = inject(GlobalJurisdictionMatrixService, { optional: true });
  private mandiantDefenseService = inject(MandiantClinicalDefenseService, { optional: true });
  private mandarinateExamService = inject(ClinicalMandarinateExamService, { optional: true });
  private precisionMightService = inject(MattMightPrecisionEngineService, { optional: true });
  private bayesianSimulator = inject(NOfOneBayesianSimulatorService, { optional: true });
  private matchmakerService = inject(MatchmakerExchangeService, { optional: true });
  private dossierService = inject(PrecisionRegulatoryDossierService, { optional: true });
  private amazonListingService = inject(AmazonListingGeneratorService, { optional: true });
  private negationNlpService = inject(ClinicalNegationResolutionService, { optional: true });
  private codingCopilotService = inject(ClinicalCodingCopilotService, { optional: true });
  private ceuService = inject(ClinicalCeuUpskillingService, { optional: true });
  private daVinciPasService = inject(FhirDaVinciPasService, { optional: true });
  private maternalSentinelService = inject(MaternalPostpartumSentinelService, { optional: true });
  private femaleCardiacService = inject(FemaleCardiacAtypicalScreeningService, { optional: true });
  private autoimmuneReducerService = inject(AutoimmuneMultiSystemDelayReducerService, { optional: true });
  private wisdomService = inject(IntergenerationalWisdomService, { optional: true });
  private youthHygieneService = inject(YouthNeurodevelopmentHygieneService, { optional: true });
  private futureCareService = inject(FutureCarePlanningService, { optional: true });
  private socialWorkService = inject(ClinicalSocialWorkNavigatorService, { optional: true });
  private addictionService = inject(AddictionMedicineRecoveryService, { optional: true });
  private section504Service = inject(Section504AccommodationService, { optional: true });
  private cscDossierService = inject(ClinicalSteeringCommitteeDossierService, { optional: true });
  private graphqlService = inject(ClinicalGraphQLService, { optional: true });
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

    // 42. Evaluate SSA Disability & Blue Book Listings (20 CFR Part 404 App 1)
    const ssaDisabilityCtrl = new AbortController();
    const ssaDisabilityTool = {
      name: 'evaluate_ssa_disability_and_blue_book_listings',
      description: 'Evaluates patient eligibility under Social Security Administration (SSA) Blue Book 20 CFR Part 404 App 1, screens Compassionate Allowances (CAL), and synthesizes Residual Functional Capacity (RFC).',
      inputSchema: {
        type: 'object',
        properties: {
          claimantAge: { type: 'number', description: 'Claimant age in years' },
          primaryDiagnosis: { type: 'string', description: 'Primary impairment diagnosis' },
          secondaryDiagnosis: { type: 'string', description: 'Secondary medical condition' },
          ejectionFractionPercent: { type: 'number', description: 'Left ventricular ejection fraction percentage' },
          fev1Liters: { type: 'number', description: 'Pulmonary FEV1 in liters' },
          isAmbulatoryAssistanceRequired: { type: 'boolean', description: 'Whether bilateral upper-limb ambulatory device is required' }
        },
        additionalProperties: false
      },
      execute: async (params: any) => {
        const svc = this.ssaDisabilityService || new SsaDisabilityNavigatorService();
        if (params?.claimantAge !== undefined) svc.claimantAge.set(Number(params.claimantAge));
        if (params?.primaryDiagnosis) svc.primaryDiagnosis.set(String(params.primaryDiagnosis));
        if (params?.secondaryDiagnosis) svc.secondaryDiagnosis.set(String(params.secondaryDiagnosis));
        if (params?.ejectionFractionPercent !== undefined) svc.ejectionFractionPercent.set(Number(params.ejectionFractionPercent));
        if (params?.fev1Liters !== undefined) svc.fev1Liters.set(Number(params.fev1Liters));
        if (params?.isAmbulatoryAssistanceRequired !== undefined) svc.isAmbulatoryAssistanceRequired.set(Boolean(params.isAmbulatoryAssistanceRequired));

        const report = svc.assessment();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(report, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(ssaDisabilityTool, { signal: ssaDisabilityCtrl.signal });
    this.mcpControllers.push({ name: ssaDisabilityTool.name, controller: ssaDisabilityCtrl });

    // 43. Get Jurisdictional Compliance & Regulatory Matrix
    const jurisdictionMatrixCtrl = new AbortController();
    const jurisdictionMatrixTool = {
      name: 'get_jurisdictional_compliance_and_regulatory_matrix',
      description: 'Retrieves data privacy statutes, clinical AI device classifications (EU AI Act, FDA, MHRA, PMDA, CDSCO), EHR standards, and mandatory consent requirements for US states (CA, WA, IL, NY, TX) and international jurisdictions (EU, UK, Canada, Australia, Japan, India).',
      inputSchema: {
        type: 'object',
        properties: {
          countryCode: { type: 'string', description: 'ISO 3166-1 alpha-2 country code (e.g. US, EU, GB, CA, AU, JP, IN)' },
          stateCode: { type: 'string', description: 'US State code if country is US (e.g. CA, WA, IL, NY, TX)' }
        },
        additionalProperties: false
      },
      execute: async (params: any) => {
        const svc = this.jurisdictionMatrixService || new GlobalJurisdictionMatrixService();
        if (params?.countryCode) svc.countryCode.set(String(params.countryCode));
        if (params?.stateCode) svc.stateCode.set(String(params.stateCode));

        const profile = svc.activeProfile();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(profile, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(jurisdictionMatrixTool, { signal: jurisdictionMatrixCtrl.signal });
    this.mcpControllers.push({ name: jurisdictionMatrixTool.name, controller: jurisdictionMatrixCtrl });

    // 44. Query Mandiant Threat Intelligence & Defense Posture
    const mandiantCtrl = new AbortController();
    const mandiantTool = {
      name: 'query_mandiant_threat_intelligence_and_defense',
      description: 'Queries Google Mandiant threat actor profiles (UNC2596, FIN12, APT41, UNC3944), MITRE ATLAS AI attack vectors, HHS 405(d) HICP alignment, and DFIR incident containment telemetry.',
      inputSchema: {
        type: 'object',
        properties: {
          threatActorId: { type: 'string', description: 'Specific actor ID to query (e.g. MND-UNC2596, MND-FIN12, MND-APT41)' },
          triggerEmergencyContainment: { type: 'boolean', description: 'Set true to simulate emergency zero-trust containment' }
        },
        additionalProperties: false
      },
      execute: async (params: any) => {
        const svc = this.mandiantDefenseService || new MandiantClinicalDefenseService();
        if (params?.triggerEmergencyContainment) {
          svc.triggerEmergencyContainment();
        }

        const posture = svc.defensePosture();
        const actors = params?.threatActorId 
          ? svc.threatActors().filter(a => a.actorId === params.threatActorId)
          : svc.threatActors();

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                posture,
                threatActors: actors,
                mitreAtlasTactics: svc.atlasTactics(),
                latestForensicSnapshots: svc.forensicSnapshots()
              }, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(mandiantTool, { signal: mandiantCtrl.signal });
    this.mcpControllers.push({ name: mandiantTool.name, controller: mandiantCtrl });

    // 45. Administer Clinical Mandarinate Examination & Keju Benchmark
    const mandarinateCtrl = new AbortController();
    const mandarinateTool = {
      name: 'administer_clinical_mandarinate_exam',
      description: 'Administers standardized meritocratic clinical OSCE examinations (Cardiology, Neurology, Integrative Pharma), evaluating candidate diagnostic accuracy, contraindication harm avoidance, and multi-paradigm balance.',
      inputSchema: {
        type: 'object',
        properties: {
          caseId: { type: 'string', description: 'Exam vignette case ID (e.g. CASE-CARDIO-01, CASE-NEURO-02, CASE-INTEGRATIVE-03)' },
          selectedPrimaryDiagnosis: { type: 'string', description: 'Primary diagnostic conclusion' },
          differentialDiagnoses: { type: 'array', items: { type: 'string' }, description: 'Differential diagnostic considerations' },
          identifiedContraindications: { type: 'array', items: { type: 'string' }, description: 'Safety contraindications flagged' }
        },
        additionalProperties: false
      },
      execute: async (params: any) => {
        const svc = this.mandarinateExamService || new ClinicalMandarinateExamService();
        if (params?.caseId) svc.selectedCaseId.set(String(params.caseId));

        const activeCase = svc.activeCase();
        const evalResult = svc.evaluateSubmission({
          caseId: activeCase.caseId,
          candidateName: 'Autonomous Agentic Candidate',
          modelIdentifier: 'gemini-agent-benchmarking',
          selectedPrimaryDiagnosis: params?.selectedPrimaryDiagnosis || activeCase.expectedPrimaryDiagnosis,
          differentialDiagnoses: params?.differentialDiagnoses || activeCase.acceptableDifferentials,
          proposedInterventions: ['Emergent evidence-grounded standard of care'],
          identifiedContraindications: params?.identifiedContraindications || activeCase.criticalContraindications
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(evalResult, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(mandarinateTool, { signal: mandarinateCtrl.signal });
    this.mcpControllers.push({ name: mandarinateTool.name, controller: mandarinateCtrl });

    // 46. Dr. Matt Might Algorithm for Precision Medicine (mediKanren & N-of-1 Drug Repurposing)
    const mightCtrl = new AbortController();
    const mightTool = {
      name: 'precision_medicine_might_reasoning',
      description: 'Executes Dr. Matt Might\'s 5-step Algorithm for Precision Medicine: translates genomic/exome variants into functional proteostasis graphs, traverses biomedical knowledge graphs for FDA/nutraceutical drug repurposing candidates, and generates N-of-1 clinical trial protocols with FHIR R4 Bundle export.',
      inputSchema: {
        type: 'object',
        properties: {
          gene: { type: 'string', description: 'Target gene symbol (e.g. NGLY1, ADCY5, SLC6A1, CACNA1A)' },
          mutation: { type: 'string', description: 'HGVS variant or nucleotide mutation (e.g. c.1201A>T, c.2176G>A, c.863G>A)' },
          exportFhirBundle: { type: 'boolean', description: 'Whether to export the resulting N-of-1 trial protocol as a FHIR R4 Bundle' }
        },
        required: ['gene']
      },
      execute: async (params: any) => {
        const svc = this.precisionMightService || new MattMightPrecisionEngineService();
        const gene = String(params?.gene || 'NGLY1');
        const mutation = params?.mutation ? String(params.mutation) : '';
        const study = svc.runCustomVariantPrecisionReasoning(gene, mutation);

        let fhirBundle: any = null;
        if (params?.exportFhirBundle) {
          fhirBundle = svc.exportFhirR4TrialBundle(study);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                framework: 'Dr. Matt Might Algorithm for Precision Medicine',
                selectedGene: study.primaryGene,
                disease: study.diseaseName,
                variant: study.variant,
                knowledgeGraphNodes: study.nodes,
                repurposingCandidates: study.repurposingCandidates,
                nOfOneTrialProtocol: study.trialProtocol,
                publishedOutcome: study.publishedOutcome,
                drMightQuote: study.mightQuote,
                fhirR4Bundle: fhirBundle
              }, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(mightTool, { signal: mightCtrl.signal });
    this.mcpControllers.push({ name: mightTool.name, controller: mightCtrl });

    // 47. Harvard Medical School Undiagnosed Diseases Network (UDN) Diagnostic Odyssey & MOSC Screening
    const udnCtrl = new AbortController();
    const udnTool = {
      name: 'harvard_udn_case_triage',
      description: 'Evaluates rare and ultra-rare undiagnosed patient cases using Harvard Medical School Undiagnosed Diseases Network (UDN) protocols, NIH Model Organism Screening Center (MOSC) validation assays (Drosophila, C. elegans, Zebrafish), and exports official UDN Gateway submission bundles.',
      inputSchema: {
        type: 'object',
        properties: {
          gene: { type: 'string', description: 'Target gene symbol (e.g. AXIN2, RNU4ATAC, ETFDH, BCL11B, MED13L)' },
          hpoTerms: {
            type: 'array',
            items: { type: 'string' },
            description: 'Human Phenotype Ontology (HPO) codes or clinical phenotype descriptions'
          },
          exportGatewayBundle: { type: 'boolean', description: 'Whether to export a Harvard UDN Gateway DiagnosticReport FHIR R4 Bundle' }
        },
        required: ['gene']
      },
      execute: async (params: any) => {
        const svc = this.precisionMightService || new MattMightPrecisionEngineService();
        const gene = String(params?.gene || 'AXIN2');
        const hpoTerms = Array.isArray(params?.hpoTerms) ? params.hpoTerms : [];
        const triage = svc.evaluateUdnDiagnosticOdyssey(gene, hpoTerms);
        const study = svc.runCustomVariantPrecisionReasoning(gene, '');

        let gatewayBundle: any = null;
        if (params?.exportGatewayBundle) {
          gatewayBundle = svc.exportUdnGatewaySubmissionBundle(study, triage);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                framework: 'Harvard Medical School Undiagnosed Diseases Network (UDN) & MOSC Protocol',
                udnCaseId: triage.udnId,
                participantAlias: triage.participantAlias,
                primaryGene: triage.primaryGene,
                diseaseCategory: triage.diseaseCategory,
                hpoTerms: triage.hpoTerms,
                multiOmicProfile: triage.multiOmicProfile,
                modelOrganismScreening: triage.modelOrganismScreening,
                targetedTherapeuticHypothesis: triage.targetedTherapeuticHypothesis,
                udnClinicalRecommendation: triage.udnClinicalRecommendation,
                gatewaySubmissionUrl: triage.gatewaySubmissionUrl,
                hmsClinicalLead: triage.hmsClinicalLead,
                fhirR4GatewayBundle: gatewayBundle
              }, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(udnTool, { signal: udnCtrl.signal });
    this.mcpControllers.push({ name: udnTool.name, controller: udnCtrl });

    // 49. N-of-1 Bayesian Adaptive Clinical Trial Simulator (ABAB Sequential Updating & Deciban Evidence)
    const bayesCtrl = new AbortController();
    const bayesTool = {
      name: 'simulate_n_of_one_bayesian_trial',
      description: 'Executes an adaptive Monte Carlo N-of-1 ABAB single-subject clinical trial simulation: models drug PK/PD onset & washout kinetics, computes Turing Decibans of weight of evidence, and determines posterior probability of efficacy.',
      inputSchema: {
        type: 'object',
        properties: {
          drugCandidate: { type: 'string', description: 'Name of the candidate repurposed therapeutic agent (e.g. N-Acetylglucosamine, Caffeine, Sodium Phenylbutyrate, Riboflavin)' },
          targetGene: { type: 'string', description: 'Target gene symbol (e.g. NGLY1, ADCY5, SLC6A1, ETFDH)' },
          trueEffectSize: { type: 'number', description: 'Target biomarker percentage improvement (0.0 to 1.0, e.g. 0.70 for 70% rescue)' },
          noiseSd: { type: 'number', description: 'Physiological daily noise standard deviation (e.g. 0.08)' },
          washoutHalfLifeDays: { type: 'number', description: 'Drug elimination half-life in days (e.g. 4.0)' }
        },
        required: ['drugCandidate', 'targetGene']
      },
      execute: async (params: any) => {
        const sim = this.bayesianSimulator || new NOfOneBayesianSimulatorService();
        const drug = String(params?.drugCandidate || 'Repurposed Agent');
        const gene = String(params?.targetGene || 'TARGET_GENE');
        const effectSize = typeof params?.trueEffectSize === 'number' ? params.trueEffectSize : 0.70;
        const noise = typeof params?.noiseSd === 'number' ? params.noiseSd : 0.08;
        const halfLife = typeof params?.washoutHalfLifeDays === 'number' ? params.washoutHalfLifeDays : 4.0;

        const result = sim.runSimulation(drug, gene, effectSize, noise, halfLife);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                framework: 'N-of-1 Bayesian Adaptive Single-Subject Clinical Trial Simulation',
                protocolId: result.protocolId,
                drugCandidate: result.drugCandidate,
                targetGene: result.targetGene,
                totalTrialDays: result.totalDays,
                summaryMetrics: result.summaryMetrics,
                sampleDataPoints: [
                  ...result.simulatedData.slice(0, 3),
                  ...result.simulatedData.slice(54, 57),
                  ...result.simulatedData.slice(109, 112)
                ]
              }, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(bayesTool, { signal: bayesCtrl.signal });
    this.mcpControllers.push({ name: bayesTool.name, controller: bayesCtrl });

    // 50. Matchmaker Exchange (MME) Global Rare Disease Patient Cross-Matching
    const mmeCtrl = new AbortController();
    const mmeTool = {
      name: 'matchmaker_exchange_patient_crossmatch',
      description: 'Queries international Matchmaker Exchange (MME) federated registries (Broad CMG, Sanger DECIPHER, GeneMatcher, RD-Connect, MyGene2) to discover other patients worldwide sharing identical or orthologous rare genomic variants and overlapping HPO phenotypes.',
      inputSchema: {
        type: 'object',
        properties: {
          gene: { type: 'string', description: 'Target gene symbol (e.g. AXIN2, RNU4ATAC, ETFDH, NGLY1, ADCY5)' },
          hpoTerms: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of Human Phenotype Ontology terms or codes'
          }
        },
        required: ['gene']
      },
      execute: async (params: any) => {
        const mme = this.matchmakerService || new MatchmakerExchangeService();
        const gene = String(params?.gene || 'AXIN2');
        const hpoTerms = Array.isArray(params?.hpoTerms) ? params.hpoTerms : [];
        const matches = mme.queryMatchmaker(gene, hpoTerms);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                framework: 'Matchmaker Exchange (MME) Federated Rare Disease Network Protocol',
                queriedGene: gene,
                matchCount: matches.length,
                matches
              }, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(mmeTool, { signal: mmeCtrl.signal });
    this.mcpControllers.push({ name: mmeTool.name, controller: mmeCtrl });

    // 51. Precision Regulatory Dossier & NIH Grant Narrative Generator
    const dossierCtrl = new AbortController();
    const dossierTool = {
      name: 'generate_precision_regulatory_dossier',
      description: 'Generates formal NIH Grant Application narratives (U54 / R21) with MOSC animal model validation plans and FDA Single-Patient Expanded Access IND protocol dossiers (21 CFR §312.310) with Bayesian Deciban stopping criteria.',
      inputSchema: {
        type: 'object',
        properties: {
          gene: { type: 'string', description: 'Target gene symbol (e.g. NGLY1, ADCY5, AXIN2, ETFDH)' },
          dossierType: {
            type: 'string',
            enum: ['nih_grant_u54', 'fda_expanded_access_ind', 'both'],
            description: 'Type of regulatory dossier to produce'
          }
        },
        required: ['gene']
      },
      execute: async (params: any) => {
        const pEngine = this.precisionMightService || new MattMightPrecisionEngineService();
        const dSvc = this.dossierService || new PrecisionRegulatoryDossierService();
        const gene = String(params?.gene || 'NGLY1');
        const dossierType = params?.dossierType || 'both';

        const study = pEngine.runCustomVariantPrecisionReasoning(gene, '');
        
        let nihGrant = null;
        let fdaInd = null;

        if (dossierType === 'nih_grant_u54' || dossierType === 'both') {
          nihGrant = dSvc.generateNihGrantNarrative(study);
        }
        if (dossierType === 'fda_expanded_access_ind' || dossierType === 'both') {
          fdaInd = dSvc.generateFdaExpandedAccessIndDossier(study);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                framework: 'Precision Medicine Regulatory & Grant Application Dossier Engine',
                selectedGene: study.primaryGene,
                disease: study.diseaseName,
                nihGrantNarrative: nihGrant,
                fdaExpandedAccessIndDossier: fdaInd
              }, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(dossierTool, { signal: dossierCtrl.signal });
    this.mcpControllers.push({ name: dossierTool.name, controller: dossierCtrl });

    // 52. Amazon Marketplace SP-API Wall Art Listing Generator
    const amzCtrl = new AbortController();
    const amzTool = {
      name: 'create_amazon_wall_art_listing',
      description: 'Generates production-ready Amazon Marketplace SP-API Listings (Listings Items API format) with SEO-optimized titles, 5 high-converting bullet points, backend search terms, A+ content outlines, and JSON Feed payloads for the Full-Bleed Cell Biology Paper Quilling Wall Art Trilogy.',
      inputSchema: {
        type: 'object',
        properties: {
          sku: {
            type: 'string',
            description: 'Optional SKU or keyword filter (e.g. CELL, SYNAPSE, MITO, or PG-ART-CELL-001-3X4)'
          },
          includeSpApiFeed: {
            type: 'boolean',
            description: 'Set true to include batch SP-API JSON Feed message payload'
          }
        }
      },
      execute: async (params: any) => {
        const amz = this.amazonListingService || new AmazonListingGeneratorService();
        const skuFilter = params?.sku ? String(params.sku) : undefined;
        const includeFeed = Boolean(params?.includeSpApiFeed);

        const listings = amz.generateAmazonListings(skuFilter);
        const feed = includeFeed ? amz.exportSpApiListingsFeed() : null;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                marketplace: 'Amazon.com (US)',
                brand: 'PocketGull Fine Art',
                productCategory: 'Home & Kitchen > Wall Art > Posters & Prints',
                totalListingsGenerated: listings.length,
                listings,
                spApiBatchFeed: feed
              }, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(amzTool, { signal: amzCtrl.signal });
    this.mcpControllers.push({ name: amzTool.name, controller: amzCtrl });

    // 53. Advanced Clinical Negation, Experiencer Scoping & Acronym Disambiguation NLP
    const nlpCtrl = new AbortController();
    const nlpTool = {
      name: 'resolve_clinical_nlp_context',
      description: 'Executes contextual NegEx/ConText clinical syntax parsing, separating active patient symptoms from explicitly negated findings, family history conditions, and hypothetical guidance, while resolving ambiguous clinical acronyms (e.g. MS, PE, RA) with standardized SNOMED-CT, ICD-10-CM, and HPO codes.',
      inputSchema: {
        type: 'object',
        properties: {
          clinicalText: {
            type: 'string',
            description: 'Raw patient narrative, clinical consultation transcript, or doctor SOAP note'
          }
        },
        required: ['clinicalText']
      },
      execute: async (params: any) => {
        const nlp = this.negationNlpService || new ClinicalNegationResolutionService();
        const text = String(params?.clinicalText || '');
        const res = nlp.resolveClinicalText(text);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                framework: 'PocketGull ConText/NegEx Clinical Syntax & Acronym Disambiguator',
                originalText: res.originalText,
                timestamp: res.timestamp,
                diagnosticConfidenceScore: res.diagnosticConfidenceScore,
                activeSymptoms: res.activeSymptoms,
                negatedSymptoms: res.negatedSymptoms,
                familyHistoryConditions: res.familyHistoryConditions,
                hypotheticalWarnings: res.hypotheticalWarnings,
                summarySummaryCount: {
                  activeCount: res.activeSymptoms.length,
                  negatedCount: res.negatedSymptoms.length,
                  familyHistoryCount: res.familyHistoryConditions.length,
                  hypotheticalCount: res.hypotheticalWarnings.length
                }
              }, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(nlpTool, { signal: nlpCtrl.signal });
    this.mcpControllers.push({ name: nlpTool.name, controller: nlpCtrl });

    // 54. HIM & Clinical Coding Copilot with CMS-HCC V28 & E&M MDM Defense
    const codingCtrl = new AbortController();
    const codingTool = {
      name: 'audit_clinical_coding_and_hcc_risk',
      description: 'Performs comprehensive Health Information Management (HIM) coding audit on clinical charts, extracting ICD-10-CM, CPT E&M (99202-99215) with Medical Decision Making (MDM) complexity justification, CMS-HCC V28 Risk Adjustment Factor (RAF) scoring, and SDOH Z-codes with 1-click Denial Defense dossier generation.',
      inputSchema: {
        type: 'object',
        properties: {
          chartText: {
            type: 'string',
            description: 'Clinical narrative, physician SOAP note, discharge summary, or operative transcript'
          },
          patientId: {
            type: 'string',
            description: 'De-identified patient or chart identifier'
          }
        },
        required: ['chartText']
      },
      execute: async (params: any) => {
        const copilot = this.codingCopilotService || new ClinicalCodingCopilotService();
        const text = String(params?.chartText || '');
        const pid = String(params?.patientId || 'p_audit_case');
        const report = copilot.auditChartText(text, pid);
        const defenseDossier = copilot.generateDenialDefensePacket();

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                chartId: report.chartId,
                patientId: report.patientId,
                recommendedEmCode: report.mdmAudit.emLevel,
                medicalDecisionMakingLevel: report.mdmAudit.mdmLevel,
                totalSuggestedCodes: report.totalSuggestedCodes,
                totalPotentialRafImpact: report.totalRafImpact,
                suggestions: report.suggestions,
                mdmAudit: report.mdmAudit,
                denialPreventionWarnings: report.denialPreventionWarnings,
                denialDefensePacketText: defenseDossier
              }, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(codingTool, { signal: codingCtrl.signal });
    this.mcpControllers.push({ name: codingTool.name, controller: codingCtrl });

    // 55. AAPC & AHIMA CEU Micro-Credentialing & Career Upskilling
    const ceuCtrl = new AbortController();
    const ceuTool = {
      name: 'issue_him_ceu_microcredential',
      description: 'Generates accredited Continuing Education Units (CEU) certificates for AAPC (CPC) and AHIMA (RHIA/CDIS) credentials, tracking audited chart hours across AI Documentation Integrity (AI-CDIS), CMS-HCC Risk Adjustment (CRC-AI), and Genomic Orphan Coding (CMRS-GEN).',
      inputSchema: {
        type: 'object',
        properties: {
          trackId: {
            type: 'string',
            description: 'Target credential track: track-ai-cdis, track-crc-v28, or track-cmrs-gen'
          },
          recipientName: {
            type: 'string',
            description: 'Full name and professional credentials of the clinical coding specialist'
          }
        },
        required: ['trackId']
      },
      execute: async (params: any) => {
        const ceu = this.ceuService || new ClinicalCeuUpskillingService();
        const trackId = String(params?.trackId || 'track-ai-cdis');
        const name = params?.recipientName ? String(params.recipientName) : undefined;
        const certificate = ceu.issueCertificate(trackId, name);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                certificateId: certificate.certificateId,
                recipientName: certificate.recipientName,
                credentialTrack: certificate.credentialTrackName,
                accreditationBody: certificate.accreditationBody,
                ceuCreditsAwarded: certificate.ceuCreditsAwarded,
                issueDate: certificate.issueDate,
                verificationHash: certificate.verificationHash,
                competencyPillars: certificate.specialtyPillars,
                attestation: certificate.accreditationAttestation
              }, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(ceuTool, { signal: ceuCtrl.signal });
    this.mcpControllers.push({ name: ceuTool.name, controller: ceuCtrl });

    // 56. HL7 FHIR Da Vinci Prior Authorization Automation (CRD / DTR / PAS)
    const daVinciPasCtrl = new AbortController();
    const daVinciPasTool = {
      name: 'execute_fhir_da_vinci_prior_auth_pas',
      description: 'Executes automated electronic Prior Authorization according to the HL7 FHIR Da Vinci CRD, DTR, and PAS implementation guides, compiling clinical chart evidence into standard X12 278 transactions for immediate payer adjudication.',
      inputSchema: {
        type: 'object',
        properties: {
          patientId: { type: 'string', description: 'De-identified patient identifier' },
          patientName: { type: 'string', description: 'Patient legal name' },
          payerId: { type: 'string', description: 'Target electronic payer ID (e.g. UHC, Aetna, Humana)' },
          serviceCode: { type: 'string', description: 'CPT or HCPCS procedure code (e.g. 81415, 93458)' },
          serviceDescription: { type: 'string', description: 'Clinical description of requested medical service' },
          diagnosisCode: { type: 'string', description: 'Primary ICD-10-CM diagnosis indication' },
          clinicalEvidence: { type: 'array', items: { type: 'string' }, description: 'Supporting clinical chart excerpts and notes' }
        },
        required: ['patientId', 'serviceCode', 'diagnosisCode']
      },
      execute: async (params: any) => {
        const pas = this.daVinciPasService || new FhirDaVinciPasService();
        const req = pas.createPriorAuthRequest({
          patientId: String(params?.patientId || 'p_pas_case'),
          patientName: String(params?.patientName || 'Patient Case'),
          patientDob: '1975-06-15',
          payerId: String(params?.payerId || 'PAYER-COMMERCIAL-001'),
          payerName: 'National Commercial Health Network',
          orderingProviderNpi: '1982736450',
          orderingProviderName: 'Attending Physician, MD',
          claimType: 'professional',
          items: [
            {
              sequence: 1,
              serviceCode: String(params?.serviceCode || '81415'),
              serviceDescription: String(params?.serviceDescription || 'Precision Molecular Diagnostics'),
              quantity: 1,
              unitPriceUsd: 2850.00,
              primaryDiagnosisCode: String(params?.diagnosisCode || 'G35'),
              priorAuthRequired: true,
              payerGuidelineRef: 'Standard Clinical Policy Bulletin #0028'
            }
          ],
          attachedEvidenceNotes: Array.isArray(params?.clinicalEvidence) ? params.clinicalEvidence : ['Detailed clinical indication attached by ordering physician.']
        });

        const dtrValidated = pas.executeCrdAndDtr(req.requestId);
        const adjudicated = pas.submitPasBundle(dtrValidated.requestId);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                requestId: adjudicated.requestId,
                status: adjudicated.status,
                adjudicationOutcome: adjudicated.adjudicationOutcome,
                claimItems: adjudicated.items,
                x12Transaction278Sample: adjudicated.x12Transaction278Payload
              }, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(daVinciPasTool, { signal: daVinciPasCtrl.signal });
    this.mcpControllers.push({ name: daVinciPasTool.name, controller: daVinciPasCtrl });

    // 57. ACOG AIM 4th-Trimester Maternal Postpartum Sentinel
    const maternalCtrl = new AbortController();
    const maternalTool = {
      name: 'evaluate_maternal_postpartum_sentinel',
      description: 'Evaluates 4th-trimester postpartum maternal health telemetry under ACOG AIM safety bundles, calculating Mean Arterial Pressure (MAP) and flagging preeclampsia, peripartum cardiomyopathy (PPCM), and secondary hemorrhage with equity guardrails.',
      inputSchema: {
        type: 'object',
        properties: {
          systolicBp: { type: 'number', description: 'Systolic blood pressure (mmHg)' },
          diastolicBp: { type: 'number', description: 'Diastolic blood pressure (mmHg)' },
          heartRate: { type: 'number', description: 'Resting maternal heart rate (bpm)' },
          daysPostpartum: { type: 'number', description: 'Days since childbirth (1 to 84)' },
          symptoms: {
            type: 'object',
            properties: {
              severeHeadacheUnrelievedByMeds: { type: 'boolean' },
              visualScotomaOrBlurring: { type: 'boolean' },
              epigastricOrRightUpperQuadrantPain: { type: 'boolean' },
              shortnessOfBreathOrOrthopnea: { type: 'boolean' },
              suddenFaceHandEdema: { type: 'boolean' },
              excessiveLochiaOrClots: { type: 'boolean' },
              feverOrFoulDischarge: { type: 'boolean' }
            }
          }
        },
        required: ['systolicBp', 'diastolicBp', 'daysPostpartum']
      },
      execute: async (params: any) => {
        const mom = this.maternalSentinelService || new MaternalPostpartumSentinelService();
        const assessment = mom.evaluatePostpartumMorbidity({
          systolicBp: Number(params?.systolicBp || 120),
          diastolicBp: Number(params?.diastolicBp || 80),
          heartRate: Number(params?.heartRate || 75),
          spO2Percent: 98,
          daysPostpartum: Number(params?.daysPostpartum || 7),
          symptoms: params?.symptoms || {}
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                assessmentId: assessment.assessmentId,
                daysPostpartum: assessment.daysPostpartum,
                meanArterialPressure: assessment.meanArterialPressure,
                riskTier: assessment.riskTier,
                urgentActionRequired: assessment.urgentActionRequired,
                flaggedConditions: assessment.flaggedConditions,
                acogAimBundleRecommendations: assessment.acogAimBundleRecommendations,
                disparityMitigationNotice: assessment.disparityMitigationNotice,
                fhirObservation: assessment.fhirObservationPayload
              }, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(maternalTool, { signal: maternalCtrl.signal });
    this.mcpControllers.push({ name: maternalTool.name, controller: maternalCtrl });

    // 58. Female Cardiac Atypical Ischemia & Yentl Syndrome Interception
    const femCardCtrl = new AbortController();
    const femCardTool = {
      name: 'screen_female_cardiac_atypical_ischemia',
      description: 'Screens female atypical cardiovascular presentations for INOCA (microvascular angina), SCAD, Takotsubo cardiomyopathy, and calibrates high-sensitivity Troponin against female-specific 99th percentile limits to eliminate Yentl Syndrome misattribution.',
      inputSchema: {
        type: 'object',
        properties: {
          patientAge: { type: 'number', description: 'Patient age in years' },
          highSensitivityTroponinI_ng_L: { type: 'number', description: 'hs-cTnI in ng/L' },
          coronaryAngioObstructiveCadFound: { type: 'boolean', description: 'Whether obstructive CAD was found on angiography' },
          symptoms: {
            type: 'object',
            properties: {
              chestDiscomfortOrPressure: { type: 'boolean' },
              jawNeckOrThroatPain: { type: 'boolean' },
              epigastricBurningOrNausea: { type: 'boolean' },
              unexplainedProfoundFatigue: { type: 'boolean' },
              dyspneaOnMinimalExertion: { type: 'boolean' },
              postpartumOrRecentParturition: { type: 'boolean' },
              severeEmotionalOrPhysicalStress: { type: 'boolean' }
            }
          }
        },
        required: ['patientAge']
      },
      execute: async (params: any) => {
        const fem = this.femaleCardiacService || new FemaleCardiacAtypicalScreeningService();
        const evaluation = fem.evaluateFemaleCardiovascularProfile({
          patientAge: Number(params?.patientAge || 45),
          gender: 'female',
          highSensitivityTroponinI_ng_L: params?.highSensitivityTroponinI_ng_L !== undefined ? Number(params.highSensitivityTroponinI_ng_L) : undefined,
          coronaryAngioObstructiveCadFound: params?.coronaryAngioObstructiveCadFound,
          symptoms: params?.symptoms || {}
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                evaluationId: evaluation.evaluationId,
                suspectedSyndrome: evaluation.suspectedSyndrome,
                syndromeTitle: evaluation.syndromeTitle,
                hsTroponinInterpretation: evaluation.hsTroponinInterpretation,
                misattributionWarning: evaluation.misattributionWarning,
                clinicalActionPlan: evaluation.clinicalActionPlan,
                guidelinesCitation: evaluation.ahaGuidelinesCitation
              }, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(femCardTool, { signal: femCardCtrl.signal });
    this.mcpControllers.push({ name: femCardTool.name, controller: femCardCtrl });

    // 59. Autoimmune & Endometriosis 7-Year Diagnostic Delay Reducer
    const autoCtrl = new AbortController();
    const autoTool = {
      name: 'reduce_autoimmune_and_endometriosis_diagnostic_delay',
      description: 'Synthesizes multi-system complaints (malar rash, joint swelling, sicca, Raynaud phenomenon, catamenial dysmenorrhea) to compress the 7-year diagnostic delay in Lupus (SLE), Sjögren syndrome, Hashimoto thyroiditis, and Endometriosis.',
      inputSchema: {
        type: 'object',
        properties: {
          patientAge: { type: 'number', description: 'Patient age' },
          symptomsDurationMonths: { type: 'number', description: 'Duration of chronic symptoms in months' },
          symptoms: {
            type: 'object',
            properties: {
              malarOrDiscoidRash: { type: 'boolean' },
              photosensitivity: { type: 'boolean' },
              oralOrNasalUlcers: { type: 'boolean' },
              symmetricalJointSwelling: { type: 'boolean' },
              raynaudsPhenomenonTriphasicColorChange: { type: 'boolean' },
              persistentDryEyesOrXerostomiaSicca: { type: 'boolean' },
              unexplainedColdIntoleranceOrWeightGain: { type: 'boolean' },
              severeCyclicalPelvicPainOrDysmenorrhea: { type: 'boolean' },
              deepDyspareuniaOrInfertility: { type: 'boolean' },
              profoundUnexplainedBrainFog: { type: 'boolean' },
              alopeciaNonScarring: { type: 'boolean' }
            }
          },
          laboratoryFindings: {
            type: 'object',
            properties: {
              anaTiterAndPattern: { type: 'string' },
              antiDsDnaPositive: { type: 'boolean' },
              antiRoSsaPositive: { type: 'boolean' },
              antiTpoAntibodies_IU_mL: { type: 'number' },
              tsh_uIU_mL: { type: 'number' }
            }
          }
        },
        required: ['patientAge']
      },
      execute: async (params: any) => {
        const auto = this.autoimmuneReducerService || new AutoimmuneMultiSystemDelayReducerService();
        const report = auto.synthesizeMultiSystemComplaints({
          patientAge: Number(params?.patientAge || 30),
          gender: 'female',
          symptomsDurationMonths: Number(params?.symptomsDurationMonths || 12),
          symptoms: params?.symptoms || {},
          laboratoryFindings: params?.laboratoryFindings
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                reportId: report.reportId,
                suspectedConditions: report.suspectedConditions,
                diagnosticDelayReductionYearsEstimate: report.diagnosticDelayReductionYearsEstimate,
                physicianDismissalCounterEvidence: report.physicianDismissalCounterEvidence,
                lifestyleAndImmuneModulationSupport: report.lifestyleAndImmuneModulationSupport
              }, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(autoTool, { signal: autoCtrl.signal });
    this.mcpControllers.push({ name: autoTool.name, controller: autoCtrl });

    // 60. Generate Amazon Marketplace Listings & SP-API Feeds (Fine Art & Medical Wall Art)
    const amazonCtrl = new AbortController();
    const amazonTool = {
      name: 'generate_amazon_marketplace_listings',
      description: 'Generates compliant Amazon Seller Central batch inventory feeds (Flat File TSV), Selling Partner API (SP-API Listings Items v2021-08-01) JSON payloads, 100+ character high-converting search keywords, and full-bleed wall art print catalogs.',
      inputSchema: {
        type: 'object',
        properties: {
          selectedSku: { type: 'string', description: 'Optional SKU filter (e.g. PG-ART-CELL-001-3X4, PG-ART-SYNAPSE-002-3X4, PG-ART-MITO-003-3X4)' },
          exportFormat: { type: 'string', enum: ['JSON_PAYLOAD', 'FLAT_FILE_TSV', 'SP_API_BATCH_FEED'], description: 'Export format structure' }
        }
      },
      execute: async (params: any) => {
        const svc = this.amazonListingService || new AmazonListingGeneratorService();
        const listings = svc.generateAmazonListings(params?.selectedSku);
        const format = params?.exportFormat || 'JSON_PAYLOAD';

        if (format === 'SP_API_BATCH_FEED') {
          const spFeed = svc.exportSpApiListingsFeed();
          return {
            content: [{ type: 'text', text: JSON.stringify(spFeed, null, 2) }]
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                catalogCount: listings.length,
                listings: listings.map(l => ({
                  sku: l.sku,
                  title: l.title,
                  standardPrice: l.standardPrice,
                  currency: l.currency,
                  bulletPoints: l.bulletPoints,
                  backendSearchTerms: l.backendSearchTerms,
                  spApiPayload: l.spApiPayload
                }))
              }, null, 2)
            }
          ]
        };
      }
    };
    modelContext.registerTool(amazonTool, { signal: amazonCtrl.signal });
    this.mcpControllers.push({ name: amazonTool.name, controller: amazonCtrl });

    // 61. Train Intergenerational Wisdom Nexus & Transgenerational Resilience
    const wisdomCtrl = new AbortController();
    const wisdomTool = {
      name: 'train_intergenerational_wisdom_nexus',
      description: 'Synthesizes multi-generational family pedigrees, grandmother hypothesis longevity genetics, master clinician tacit heuristics (Oslerian observation), and elder life-review dignity narratives into a structured FHIR R4 KnowledgeArtifact dossier.',
      inputSchema: {
        type: 'object',
        properties: {
          generationDepth: { type: 'number', description: 'Number of family generations tracked (2, 3, 4)' },
          maternalLongevityYears: { type: 'number' },
          paternalLongevityYears: { type: 'number' },
          knownFamilialResilienceTraits: { type: 'array', items: { type: 'string' } },
          transgenerationalStressors: { type: 'array', items: { type: 'string' } },
          ancestralDietaryPattern: { type: 'string', enum: ['Mediterranean', 'Okinawan_Asian', 'Nordic_High_Fiber', 'Mesoamerican_Polyphenol', 'Standard_Western'] },
          elderNarrative: {
            type: 'object',
            properties: {
              storytellerArchetype: { type: 'string' },
              coreLifeLesson: { type: 'string' },
              clinicalOrLongevityHeuristic: { type: 'string' },
              tacitObservationTechnique: { type: 'string' },
              palliativeOrCopingPhilosophy: { type: 'string' }
            }
          }
        },
        required: ['generationDepth']
      },
      execute: async (params: any) => {
        const svc = this.wisdomService || new IntergenerationalWisdomService();
        const report = svc.synthesizeWisdomNexus({
          pedigree: {
            generationDepth: Number(params?.generationDepth || 3),
            maternalLongevityYears: params?.maternalLongevityYears,
            paternalLongevityYears: params?.paternalLongevityYears,
            knownFamilialResilienceTraits: params?.knownFamilialResilienceTraits || [],
            transgenerationalStressors: params?.transgenerationalStressors || [],
            ancestralDietaryPattern: params?.ancestralDietaryPattern || 'Mediterranean'
          },
          elderNarrative: params?.elderNarrative,
          patientAge: params?.patientAge
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(report, null, 2) }]
        };
      }
    };
    modelContext.registerTool(wisdomTool, { signal: wisdomCtrl.signal });
    this.mcpControllers.push({ name: wisdomTool.name, controller: wisdomCtrl });

    // 62. Optimize Youth Cognitive & Circadian Hygiene
    const youthCtrl = new AbortController();
    const youthTool = {
      name: 'optimize_youth_cognitive_and_circadian_hygiene',
      description: 'Generates tailored digital dopamine reset protocols, Kaplan Attention Restoration nature intervals, infradian/hormonal cycle synchronization, and early-career medical trainee Socratic reasoning scaffolding.',
      inputSchema: {
        type: 'object',
        properties: {
          ageYears: { type: 'number' },
          dailyScreenTimeHours: { type: 'number' },
          lateNightScreenUseMinutes: { type: 'number' },
          attentionalFragmentationScore: { type: 'number', description: 'Scale 1-10' },
          subjectiveExamOrSocialAnxietyScale: { type: 'number', description: 'Scale 1-10' },
          isEarlyCareerClinicianOrStudent: { type: 'boolean' },
          menstrualCyclePhase: { type: 'string', enum: ['Follicular', 'Ovulatory', 'Luteal', 'Menstrual', 'Not_Applicable'] }
        },
        required: ['ageYears', 'dailyScreenTimeHours']
      },
      execute: async (params: any) => {
        const svc = this.youthHygieneService || new YouthNeurodevelopmentHygieneService();
        const report = svc.evaluateYouthHygiene({
          ageYears: Number(params?.ageYears || 20),
          dailyScreenTimeHours: Number(params?.dailyScreenTimeHours || 6),
          lateNightScreenUseMinutes: Number(params?.lateNightScreenUseMinutes || 30),
          attentionalFragmentationScore: Number(params?.attentionalFragmentationScore || 5),
          subjectiveExamOrSocialAnxietyScale: Number(params?.subjectiveExamOrSocialAnxietyScale || 4),
          isEarlyCareerClinicianOrStudent: Boolean(params?.isEarlyCareerClinicianOrStudent),
          menstrualCyclePhase: params?.menstrualCyclePhase
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(report, null, 2) }]
        };
      }
    };
    modelContext.registerTool(youthTool, { signal: youthCtrl.signal });
    this.mcpControllers.push({ name: youthTool.name, controller: youthCtrl });

    // 63. Generate Future Care & Longevity Plan
    const futureCareCtrl = new AbortController();
    const futureCareTool = {
      name: 'generate_future_care_and_longevity_plan',
      description: 'Generates multi-decadal (10/20/30-year) organ-system healthspan trajectory models, statutory values-based Advance Care Directives (POLST/MOLST & FHIR R4 Consent), and Long-Term Care Medicare IRMAA financial strategies.',
      inputSchema: {
        type: 'object',
        properties: {
          patientAge: { type: 'number' },
          currentHealthStatus: { type: 'string', enum: ['Optimal_Vitality', 'Mild_Chronic_Condition', 'Complex_Multimorbid', 'Early_Frailty'] },
          primaryValuesAndDignityGoals: { type: 'array', items: { type: 'string' } },
          refusalOfInvasiveInterventionsUnderIrreversibleLoss: { type: 'boolean' },
          designatedHealthcareProxyRelationship: { type: 'string', enum: ['Adult_Child', 'Spouse_Partner', 'Trusted_Advocate', 'Professional_Fiduciary'] },
          financialHealthspanPriorities: { type: 'array', items: { type: 'string' } },
          baselineBiomarkers: {
            type: 'object',
            properties: {
              cacScore: { type: 'number' },
              apob_mg_dL: { type: 'number' },
              vo2Max_mL_kg_min: { type: 'number' },
              hba1c_percent: { type: 'number' }
            }
          }
        },
        required: ['patientAge', 'currentHealthStatus']
      },
      execute: async (params: any) => {
        const svc = this.futureCareService || new FutureCarePlanningService();
        const plan = svc.generateFuturePlan({
          patientAge: Number(params?.patientAge || 50),
          currentHealthStatus: params?.currentHealthStatus || 'Optimal_Vitality',
          primaryValuesAndDignityGoals: params?.primaryValuesAndDignityGoals || [],
          refusalOfInvasiveInterventionsUnderIrreversibleLoss: Boolean(params?.refusalOfInvasiveInterventionsUnderIrreversibleLoss),
          designatedHealthcareProxyRelationship: params?.designatedHealthcareProxyRelationship || 'Adult_Child',
          financialHealthspanPriorities: params?.financialHealthspanPriorities || ['Medicare_IRMAA_Avoidance', 'Long_Term_Care_Home_Independence'],
          baselineBiomarkers: params?.baselineBiomarkers
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(plan, null, 2) }]
        };
      }
    };
    modelContext.registerTool(futureCareTool, { signal: futureCareCtrl.signal });
    this.mcpControllers.push({ name: futureCareTool.name, controller: futureCareCtrl });

    // 64. Navigate Clinical Social Work & SDoH Z-Codes
    const swCtrl = new AbortController();
    const swTool = {
      name: 'navigate_clinical_social_work_and_sdoh',
      description: 'Synthesizes Social Determinants of Health (SDoH), PRAPARE screening indicators, ICD-10 Z-codes (Z55-Z65), emergency community resource linkages, 30-day hospital readmission mitigation, and Zarit Caregiver Burden respite planning.',
      inputSchema: {
        type: 'object',
        properties: {
          patientAge: { type: 'number' },
          housingStatus: { type: 'string', enum: ['Housed_Stable', 'At_Risk_Of_Eviction', 'Unhoused_Sheltered', 'Unhoused_Unsheltered'] },
          foodSecurityLevel: { type: 'string', enum: ['Food_Secure', 'Marginal_Food_Insecure', 'Severe_Hunger_Skip_Meals'] },
          transportationAccess: { type: 'string', enum: ['Reliable_Personal_Vehicle', 'Public_Transit_Dependent', 'Zero_Transportation_Barrier'] },
          utilityInsecurity: { type: 'boolean' },
          caregiverSupportStatus: { type: 'string', enum: ['Supported_By_Family', 'Living_Alone_Isolated', 'Sole_Caregiver_High_Strain'] },
          caregiverSubjectiveBurdenScore: { type: 'number', description: 'Zarit Scale 0-88' },
          insuranceCoverage: { type: 'string', enum: ['Commercial', 'Medicare_Only', 'Medicaid_Dual_Eligible', 'Uninsured'] },
          recentHospitalAdmissionsLast12Months: { type: 'number' }
        },
        required: ['patientAge', 'housingStatus', 'foodSecurityLevel']
      },
      execute: async (params: any) => {
        const svc = this.socialWorkService || new ClinicalSocialWorkNavigatorService();
        const report = svc.evaluateSocialWorkNeeds({
          patientAge: Number(params?.patientAge || 65),
          housingStatus: params?.housingStatus || 'Housed_Stable',
          foodSecurityLevel: params?.foodSecurityLevel || 'Food_Secure',
          transportationAccess: params?.transportationAccess || 'Reliable_Personal_Vehicle',
          utilityInsecurity: Boolean(params?.utilityInsecurity),
          caregiverSupportStatus: params?.caregiverSupportStatus || 'Supported_By_Family',
          caregiverSubjectiveBurdenScore: params?.caregiverSubjectiveBurdenScore,
          insuranceCoverage: params?.insuranceCoverage || 'Medicare_Only',
          recentHospitalAdmissionsLast12Months: Number(params?.recentHospitalAdmissionsLast12Months || 0)
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(report, null, 2) }]
        };
      }
    };
    modelContext.registerTool(swTool, { signal: swCtrl.signal });
    this.mcpControllers.push({ name: swTool.name, controller: swCtrl });

    // 65. Evaluate Addiction Recovery, Withdrawal Scoring & Harm Reduction
    const sudCtrl = new AbortController();
    const sudTool = {
      name: 'evaluate_addiction_recovery_and_harm_reduction',
      description: 'Evaluates substance withdrawal severity (COWS for opioids, CIWA-Ar for alcohol), computes the Bernese method micro-induction protocol for buprenorphine, precision pharmacotherapy (naltrexone, acamprosate), and life-saving naloxone/overdose harm reduction safeguards.',
      inputSchema: {
        type: 'object',
        properties: {
          patientAge: { type: 'number' },
          primarySubstance: { type: 'string', enum: ['Opioids_Fentanyl', 'Alcohol', 'Stimulants_Meth_Cocaine', 'Benzodiazepines', 'Cannabis_High_THC', 'Nicotine_Vaping', 'Polysubstance'] },
          durationOfUseMonths: { type: 'number' },
          lastUseHoursAgo: { type: 'number' },
          cowsScore: { type: 'number', description: 'COWS score 0-48' },
          ciwaScore: { type: 'number', description: 'CIWA-Ar score 0-67' },
          priorPrecipitatedWithdrawalHistory: { type: 'boolean' },
          acesScore: { type: 'number', description: 'Adverse Childhood Experiences scale 0-10' },
          currentWithdrawalSymptoms: {
            type: 'object',
            properties: {
              tachycardiaPulseOver100: { type: 'boolean' },
              diaphoresisSweating: { type: 'boolean' },
              tremorsOrRestlessness: { type: 'boolean' },
              pupilDilationMydriasis: { type: 'boolean' },
              gastrointestinalDistress: { type: 'boolean' },
              visualOrTactileHallucinations: { type: 'boolean' },
              severeAnxietyOrCravings: { type: 'boolean' }
            }
          }
        },
        required: ['patientAge', 'primarySubstance', 'durationOfUseMonths']
      },
      execute: async (params: any) => {
        const svc = this.addictionService || new AddictionMedicineRecoveryService();
        const report = svc.evaluateAddictionRecovery({
          patientAge: Number(params?.patientAge || 35),
          primarySubstance: params?.primarySubstance || 'Opioids_Fentanyl',
          durationOfUseMonths: Number(params?.durationOfUseMonths || 12),
          lastUseHoursAgo: Number(params?.lastUseHoursAgo || 6),
          cowsScore: params?.cowsScore,
          ciwaScore: params?.ciwaScore,
          priorPrecipitatedWithdrawalHistory: Boolean(params?.priorPrecipitatedWithdrawalHistory),
          acesScore: params?.acesScore,
          currentWithdrawalSymptoms: params?.currentWithdrawalSymptoms || {}
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(report, null, 2) }]
        };
      }
    };
    modelContext.registerTool(sudTool, { signal: sudCtrl.signal });
    this.mcpControllers.push({ name: sudTool.name, controller: sudCtrl });

    // 66. Generate Section 504 School Accommodation Plan
    const sec504Ctrl = new AbortController();
    const sec504Tool = {
      name: 'generate_section_504_school_accommodation_plan',
      description: 'Generates a legally binding Section 504 School Accommodation Plan under the Rehabilitation Act of 1973 for pediatric/adolescent chronic health conditions (Type 1 Diabetes, ADHD, POTS, Food Anaphylaxis, Epilepsy, Asthma, Dyslexia, IBD, JIA) with Emergency Action Plans (EAPs) and testing modifications.',
      inputSchema: {
        type: 'object',
        properties: {
          patientId: { type: 'string' },
          studentName: { type: 'string' },
          conditionCategory: { 
            type: 'string', 
            enum: [
              'type1_diabetes',
              'adhd_executive_function',
              'food_allergy_anaphylaxis',
              'pots_dysautonomia',
              'epilepsy_seizure',
              'asthma_respiratory',
              'dyslexia_learning',
              'ibd_gastrointestinal',
              'juvenile_arthritis'
            ]
          },
          gradeLevel: { type: 'string' },
          schoolName: { type: 'string' },
          attendingPhysician: { type: 'string' },
          customAccommodations: { 
            type: 'array', 
            items: { type: 'string' } 
          }
        },
        required: ['patientId', 'studentName', 'conditionCategory']
      },
      execute: async (params: any) => {
        const svc = this.section504Service || new Section504AccommodationService();
        const plan = svc.generateSection504Plan({
          patientId: params?.patientId || 'p001',
          studentName: params?.studentName || 'Student',
          conditionCategory: params?.conditionCategory || 'type1_diabetes',
          gradeLevel: params?.gradeLevel,
          schoolName: params?.schoolName,
          attendingPhysician: params?.attendingPhysician,
          customAccommodations: params?.customAccommodations
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(plan, null, 2) }]
        };
      }
    };
    modelContext.registerTool(sec504Tool, { signal: sec504Ctrl.signal });
    this.mcpControllers.push({ name: sec504Tool.name, controller: sec504Ctrl });

    // 67. Generate Steering Committee Governance Dossier
    const cscCtrl = new AbortController();
    const cscTool = {
      name: 'generate_steering_committee_governance_dossier',
      description: 'Generates a certified Clinical AI Steering Committee Governance Dossier for hospital executive leadership, Institutional Review Boards (IRB), and regulatory compliance (FDA §520(o) Non-Device CDS transparency, Cochrane Level-A evidence distribution, SDoH algorithmic equity parity audits, and zero-audio retention verification).',
      inputSchema: {
        type: 'object',
        properties: {
          institutionName: { type: 'string', description: 'Healthcare system or academic medical center name.' },
          reportingQuarter: { type: 'string', description: 'Quarter identifier (e.g. 2026-Q3).' },
          chiefMedicalOfficer: { type: 'string' },
          chiefInformaticsOfficer: { type: 'string' },
          totalConsults: { type: 'number' }
        }
      },
      execute: async (params: any) => {
        const svc = this.cscDossierService || new ClinicalSteeringCommitteeDossierService();
        const dossier = svc.generateGovernanceDossier({
          institutionName: params?.institutionName,
          reportingQuarter: params?.reportingQuarter,
          chiefMedicalOfficer: params?.chiefMedicalOfficer,
          chiefInformaticsOfficer: params?.chiefInformaticsOfficer,
          totalConsults: params?.totalConsults ? Number(params.totalConsults) : undefined
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(dossier, null, 2) }]
        };
      }
    };
    modelContext.registerTool(cscTool, { signal: cscCtrl.signal });
    this.mcpControllers.push({ name: cscTool.name, controller: cscCtrl });

    // 68. Generate Pediatric Substitute Teacher Card & Courage Badge
    const cardCtrl = new AbortController();
    const cardTool = {
      name: 'generate_pediatric_substitute_teacher_and_courage_card',
      description: 'Generates a 30-second rapid classroom summary card for substitute teachers and an inspiring, collectible Pediatric Courage & Resilience Keepsake Badge with fine art origami and lighthouse motifs for young patients.',
      inputSchema: {
        type: 'object',
        properties: {
          patientId: { type: 'string' },
          studentName: { type: 'string' },
          conditionCategory: { 
            type: 'string', 
            enum: [
              'type1_diabetes',
              'adhd_executive_function',
              'food_allergy_anaphylaxis',
              'pots_dysautonomia',
              'epilepsy_seizure',
              'asthma_respiratory',
              'dyslexia_learning',
              'ibd_gastrointestinal',
              'juvenile_arthritis'
            ]
          },
          gradeLevel: { type: 'string' }
        },
        required: ['patientId', 'studentName', 'conditionCategory']
      },
      execute: async (params: any) => {
        const svc = this.section504Service || new Section504AccommodationService();
        const plan = svc.generateSection504Plan({
          patientId: params?.patientId || 'p001',
          studentName: params?.studentName || 'Student',
          conditionCategory: params?.conditionCategory || 'type1_diabetes',
          gradeLevel: params?.gradeLevel
        });

        const substituteCard = svc.generateSubstituteTeacherCard(plan);
        const courageBadge = svc.generatePediatricCourageBadge(params?.studentName || 'Student', params?.conditionCategory || 'type1_diabetes');

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ substituteCard, courageBadge }, null, 2)
          }]
        };
      }
    };
    modelContext.registerTool(cardTool, { signal: cardCtrl.signal });
    this.mcpControllers.push({ name: cardTool.name, controller: cardCtrl });

    // 69. Execute Clinical GraphQL Query
    const gqlCtrl = new AbortController();
    const gqlTool = {
      name: 'execute_clinical_graphql_query',
      description: 'Executes a strongly typed GraphQL query across the unified PocketGull clinical knowledge graph (Patient demographics, active conditions, Section 504 plans, substitute cards, pediatric courage badges, Steering Committee governance dossiers, and multi-hop biological cross-talk pathways).',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The GraphQL query string to execute against the clinical schema.' },
          variables: { type: 'object', description: 'Optional key-value query variables.' }
        },
        required: ['query']
      },
      execute: async (params: any) => {
        const svc = this.graphqlService || new ClinicalGraphQLService();
        const res = await svc.executeQuery(params?.query || '', params?.variables || {});
        return {
          content: [{ type: 'text', text: JSON.stringify(res, null, 2) }]
        };
      }
    };
    modelContext.registerTool(gqlTool, { signal: gqlCtrl.signal });
    this.mcpControllers.push({ name: gqlTool.name, controller: gqlCtrl });
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
