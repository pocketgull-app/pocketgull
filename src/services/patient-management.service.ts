import {
  Injectable,
  inject,
  signal,
  effect,
  WritableSignal,
  computed,
  untracked,
  OnDestroy,
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom, Subject, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { PatientStateService } from "./patient-state.service";
import { StorageService } from "./storage.service";
import {
  ClinicalIntelligenceService,
  AnalysisLens,
} from "./clinical-intelligence.service";
import { NetworkStateService } from './network-state.service';
import {
  IBookmark,
  HistoryEntry,
  IPatient,
  IPatientState,
  IBodyPartIssue,
  IDiagnosticScan
} from "./patient.types";
import * as CryptoJS from 'crypto-js';
import { MOCK_PATIENTS } from "../mock-patients";
import { dataConnect } from '../lib/firebase';
import { listPatients, getPatientWithCarePlan, createPatient } from '../lib/dataconnect/esm/index.esm.js';

const ENCRYPTION_KEY = 'pocket-gull-clinical-vault-key-poc';

// Re-export for use in other components
export type { IBodyPartIssue, HistoryEntry, IPatient };

import { ThemeService } from './theme.service';

@Injectable({
  providedIn: "root",
})
export class PatientManagementService implements OnDestroy {
  private patientState = inject(PatientStateService);
  private geminiService = inject(ClinicalIntelligenceService);
  private network = inject(NetworkStateService);
  private http = inject(HttpClient);
  public storage = inject(StorageService);
  private themeService = inject(ThemeService);
  private autoSave$ = new Subject<void>();
  private autoSaveSub?: Subscription;

  private generatePersonalizedNutritionReport(p: IPatient): { nutrition: string; precisionNutrients: string } {
    const conds = (p.preexistingConditions || []).map(c => c.toLowerCase());
    const name = p.name || 'Patient';
    const bp = p.vitals?.bp || '120/80';
    const sys = parseInt(bp.split('/')[0], 10) || 120;

    let dietaryPattern = '';
    let functionalFoods = '';
    let avoidFoods = '';
    let chronoWindow = '';
    let orthomolecularProtocol = '';

    if (conds.some(c => c.includes('diabetes') || c.includes('metabolic') || c.includes('obesity') || c.includes('hypertension'))) {
      dietaryPattern = `### Precision Cardiometabolic & Low-Glycemic Anti-Inflammatory Pattern\nPrimary focus for ${name}: Low Glycemic Load (<20 GI), high-fiber monounsaturated fat emphasis to improve insulin receptor sensitivity, reduce hepatic steatosis, and stabilize vascular endothelial nitric oxide.`;
      functionalFoods = `- **Cold-Pressed EVOO & Avocado**: 2 tbsp daily to deliver Oleic Acid and endogenous Glutathione support.\n- **Wild Alaskan Sockeye Salmon**: 3x/week for SPM (Specialized Pro-Resolving Mediators) EPA/DHA resolution.\n- **Steamed Bok Choy & Broccoli Sprouts**: Sulforaphane Nrf2 phase II liver detoxification.`;
      avoidFoods = `- **Refined Carbohydrates & High-Fructose Corn Syrup**: Eliminates postprandial glucose spikes.\n- **High Sodium (>2,000mg/day)**: Protects against vascular stiffness given BP of ${bp}.\n- **Trans Fats & Seed Oils**: Prevents oxLDL endothelial injury.`;
      chronoWindow = `8-Hour Restricted Feeding Window (10:00 AM — 6:00 PM) to align with peak liver insulin sensitivity (BMAL1 gene activation).`;
      orthomolecularProtocol = `### Personalized Orthomolecular Protocol for ${name}\n- **Berberine HCl**: 500mg TID before meals (AMPK activation & blood glucose modulation).\n- **Magnesium Glycinate**: 400mg at bedtime (Vascular smooth muscle relaxation for BP ${bp}).\n- **Chromium Picolinate**: 500mcg daily (Insulin receptor phosphorylation).\n- **CoQ10 (Ubiquinol)**: 100mg daily (Endothelial mitochondrial bioenergetics).`;
    } else if (conds.some(c => c.includes('pain') || c.includes('opioid') || c.includes('spine') || c.includes('back') || c.includes('trauma') || c.includes('arthritis'))) {
      dietaryPattern = `### Neuro-Inflammatory & Pain Resolution Protocol\nPrimary focus for ${name}: High Specialized Pro-Resolving Mediators (SPMs), targeted bioflavonoids, and collagenous extracellular matrix substrates to accelerate musculoskeletal repair and quiet central sensitization.`;
      functionalFoods = `- **Wild Blueberry & Ashwagandha Compote**: Crosses BBB to modulate neuro-inflammation and support GABAergic tone.\n- **Grass-Fed Bone Broth**: Proline, Glycine, and Hydroxyproline for connective tissue and spinal disc repair.\n- **Fresh Turmeric Root & Piperine**: Curcuminoid NF-kB downregulation.`;
      avoidFoods = `- **Arachidonic Acid-Rich Foods**: Limit excessive corn-fed red meats to suppress inflammatory PGE2 prostaglandins.\n- **Nightshades (Solanaceae)**: Temporarily restrict if joint stiffness flares.\n- **Ultra-Processed Additives**: Avoid excitotoxic monosodium glutamate (MSG).`;
      chronoWindow = `10-Hour Circadian Feeding Window (08:30 AM — 06:30 PM) to ensure overnight 14-hour autophagic joint tissue repair.`;
      orthomolecularProtocol = `### Personalized Orthomolecular Protocol for ${name}\n- **Palmitoylethanolamide (PEA)**: 600mg BID (Endogenous endocannabinoid signaling for pain resolution).\n- **Curcumin Phytosome (Meriva)**: 500mg BID (Musculoskeletal inflammatory pathway regulation).\n- **Omega-3 Fish Oil (High EPA)**: 2,400mg daily (SPM precursor for tissue clearing).\n- **Vitamin D3 + K2 (MK-7)**: 5,000 IU daily (Bone matrix mineralization & immune balance).`;
    } else if (conds.some(c => c.includes('stomach') || c.includes('dyspepsia') || c.includes('ibs') || c.includes('fatigue') || c.includes('chagas') || c.includes('vat'))) {
      dietaryPattern = `### Warm Digestive Agni & Vata-Pacifying Restorative Pattern\nPrimary focus for ${name}: Warm, cooked, easily-assimilated nutrient-dense foods to soothe gastric motility, pacify Vata dryness, and kindle digestive Agni.`;
      functionalFoods = `- **Ayurvedic Mung Bean & Basmati Kitchari**: Cooked with Ghee, Ginger, Cumin, and Ajwain for effortless assimilation.\n- **Gingerol-Rich Lemongrass Decoction**: Stimulates gastric motility and disperses TCM Spleen Dampness.\n- **Warm Stewed Apples with Cinnamon**: Pectin substrate for gut mucosal barrier integrity.`;
      avoidFoods = `- **Raw Cold Salads & Ice Water**: Extinguishes digestive Agni and worsens gastric spasm.\n- **Coarse Raw Bran & Cruciferous Vegetables**: Causes abdominal distension and Vata aggravation.\n- **Fermented High-Histamine Foods**: Avoid during active gastric flare.`;
      chronoWindow = `Warm Light Evening Meal before 6:30 PM to avoid nocturnal gastric reflux and support parasympathetic sleep.`;
      orthomolecularProtocol = `### Personalized Orthomolecular Protocol for ${name}\n- **Deglycyrrhizinated Licorice (DGL)**: 400mg chewed 20 min before meals (Gastric mucosal barrier defense).\n- **CoQ10 (Ubiquinol)**: 200mg daily (Mitochondrial bioenergetics for smooth muscle fatigue).\n- **L-Glutamine**: 5g morning on empty stomach (Intestinal enterocyte repair).\n- **Zinc Carnosine**: 75mg BID (Gastric mucosal lining stabilization).`;
    } else {
      dietaryPattern = `### Anti-Inflammatory Longevity & Whole-Foods Pattern\nPrimary focus for ${name}: Mediterranean-Okinawan hybrid whole-foods pattern optimized for cellular resilience, DNA methylation stability, and autophagic clearance.`;
      functionalFoods = `- **Polyphenol Rich Extra Virgin Olive Oil**: Single-estate oleocanthal for COX enzyme inhibition.\n- **Wild Berries & Dark Leafy Greens**: Folate methyl donors and anthocyanin antioxidant protection.\n- **Fermented Foods (Kefir/Kimchi)**: Microbiome diversity & short-chain fatty acid (butyrate) production.`;
      avoidFoods = `- **Ultra-Processed Sugar & Refined Grains**: Preserves Horvath DNAm epigenetic clock stability.\n- **Industrial Seed Oils**: Mitigates linoleic acid peroxidation.`;
      chronoWindow = `12:12 Circadian Feeding Balance (08:00 AM — 08:00 PM) for optimal metabolic flexibility.`;
      orthomolecularProtocol = `### Personalized Orthomolecular Protocol for ${name}\n- **Magnesium L-Threonate**: 300mg at bedtime (Synaptic density & restorative sleep).\n- **Vitamin D3 + K2**: 2,000 IU daily (Immune homeostasis & arterial calcium clearance).\n- **Trans-Resveratrol + NMN**: 500mg morning (Sirtuin SIR1 activation & NAD+ boosting).`;
    }

    const nutritionText = `${dietaryPattern}\n\n### Key Functional Foods for ${name}\n${functionalFoods}\n\n### Dietary Restrictions & Contraindications\n${avoidFoods}\n\n### Circadian Feeding Window\n${chronoWindow}`;

    return {
      nutrition: nutritionText,
      precisionNutrients: orthomolecularProtocol
    };
  }

  private ensurePatientCompleteness(p: IPatient): IPatient {
    const pVitals = (p.vitals || {}) as Record<string, any>;
    const vitals = {
      bp: pVitals.bp ?? "",
      hr: pVitals.hr ?? "",
      temp: pVitals.temp ?? "",
      spO2: pVitals.spO2 ?? "",
      weight: pVitals.weight ?? "",
      height: pVitals.height ?? "",
      vitD3: pVitals.vitD3 ?? "",
      magnesium: pVitals.magnesium ?? "",
      b12: pVitals.b12 ?? "",
      zinc: pVitals.zinc ?? ""
    };

    const oxidativeStressMarkers = p.oxidativeStressMarkers || [];
    const antioxidantSources = p.antioxidantSources || [];
    const personalized = this.generatePersonalizedNutritionReport(p);

    const history: HistoryEntry[] = (p.history && p.history.length > 0) ? p.history.map(h => {
      if (h.type === 'AnalysisRun' && h.report) {
        return {
          ...h,
          report: {
            "Summary Overview": h.report["Summary Overview"] || `### Clinical Assessment\n${p.name} presents for evaluation.`,
            "Functional Protocols": h.report["Functional Protocols"] || `### Protocol Actions\n- Follow clinical guidance.`,
            "Nutrition": h.report["Nutrition"] || personalized.nutrition,
            "Monitoring & Follow-up": h.report["Monitoring & Follow-up"] || `### Tracking Schedule\n- Follow-up visit scheduled.`,
            "Patient Education": h.report["Patient Education"] || `### Patient Guidance\n- Focus on hydration and rest.`,
            "Precision Nutrients": h.report["Precision Nutrients"] || personalized.precisionNutrients,
            "PhysioNet Telemetry": h.report["PhysioNet Telemetry"] || `### PhysioNet Telemetry\n- Telemetry baseline recorded.`
          }
        };
      }
      return h;
    }) : [];

    return {
      ...p,
      vitals,
      oxidativeStressMarkers,
      antioxidantSources,
      history
    };
  }

  readonly patients = signal<IPatient[]>(MOCK_PATIENTS);
  readonly rosterLoaded = signal(false);
  readonly selectedPatientId: WritableSignal<string | null> = signal(
    MOCK_PATIENTS.find(p => p.id === 'p_default_patient')?.id || MOCK_PATIENTS.find(p => p.id === 'p012')?.id || MOCK_PATIENTS[0]?.id || null,
  );
  readonly selectedPatient = computed(() => {
    const id = this.selectedPatientId();
    const raw = id ? this.patients().find((p) => p.id === id) : null;
    return raw ? this.ensurePatientCompleteness(raw) : null;
  });

  private async initRoster() {
    if (typeof window !== 'undefined') {
        let loaded: any[] = [];
        try {
          const res = await listPatients(dataConnect);
          if (res.data && res.data.patients && res.data.patients.length > 0) {
            const dbPatients = res.data.patients.map((p: any) => ({
              id: p.id,
              name: `${p.firstName} ${p.lastName}`,
              age: 0,
              gender: "Other" as const,
              lastVisit: new Date(p.updatedAt).toISOString().split('T')[0].replace(/-/g, '.'),
              preexistingConditions: [],
              patientGoals: "",
              vitals: { bp: "", hr: "", temp: "", spO2: "", weight: "", height: "" },
              issues: {},
              history: [],
              bookmarks: []
            }));
            const merged: IPatient[] = [...dbPatients];
            for (const p of MOCK_PATIENTS) {
              if (!merged.some(item => item.id === p.id)) {
                merged.push(p);
              }
            }
            this.patients.set(merged);
            const defaultId = merged.find(p => p.id === 'p_mara_santos')?.id || merged.find(p => p.name === 'Alexander Vance')?.id || merged[0]?.id || null;
            const currentId = this.selectedPatientId();
            if (!currentId || !merged.some(p => p.id === currentId)) {
              this.selectedPatientId.set(defaultId);
            }
            this.rosterLoaded.set(true);
            return;
          }
        } catch (err) {
          console.log('[PatientManagementService] SQL Connect offline, initializing roster via backend HTTP & local cache');
        }

        try {
            const backendPatients = await firstValueFrom(this.http.get<any[]>('/api/patients'));
            if (backendPatients && backendPatients.length > 0) {
                loaded = backendPatients;
                for (const p of backendPatients) {
                    await this.storage.savePatient(p);
                }
            }
        } catch (e) {
            console.warn('[PatientManagementService] Failed to load from backend HTTP, trying local storage:', e);
        }

        if (loaded.length === 0) {
            loaded = await this.storage.loadPatients();
        }
        if (loaded && loaded.length > 0) {
            let updatedList = [...loaded];
            let modified = false;

            // Surgically clean up removed mock patients
            updatedList = updatedList.filter(item => {
              if (item.id === 'p_phil_gear') {
                this.storage.deletePatient('p_phil_gear');
                modified = true;
                return false;
              }
              if (item.id === 'p005' && item.name === 'Philip Verheyen') {
                this.storage.deletePatient('p005');
                modified = true;
                return false;
              }
              return true;
            });

            // Upsert / merge latest MOCK_PATIENTS definitions
            for (const p of MOCK_PATIENTS) {
                const existingIndex = updatedList.findIndex(item => item.id === p.id);
                if (existingIndex === -1) {
                    updatedList.push(p);
                    await this.storage.savePatient(p);
                    modified = true;
                } else {
                    // Update/override stored mock patients with latest definitions
                    const isOriginalMock = MOCK_PATIENTS.some(mp => mp.id === p.id);
                    if (isOriginalMock) {
                      updatedList[existingIndex] = p;
                      await this.storage.savePatient(p);
                      modified = true;
                    }
                }
            }
            this.patients.set(updatedList);
            const defaultId = updatedList.find(p => p.id === 'p_mara_santos')?.id || updatedList[0]?.id || null;
            const currentId = this.selectedPatientId();
            if (!currentId || !updatedList.some(p => p.id === currentId)) {
              this.selectedPatientId.set(defaultId);
            }
        } else {
            // Seed DB on first run
            for (const p of MOCK_PATIENTS) {
                await this.storage.savePatient(p);
            }
            this.patients.set(MOCK_PATIENTS);
            const defaultId = MOCK_PATIENTS.find(p => p.id === 'p_mara_santos')?.id || MOCK_PATIENTS[0]?.id || null;
            const currentId = this.selectedPatientId();
            if (!currentId || !MOCK_PATIENTS.some(p => p.id === currentId)) {
              this.selectedPatientId.set(defaultId);
            }
        }
        this.rosterLoaded.set(true);
    }
  }

  constructor() {
    this.initRoster();

    // Persist to IndexedDB whenever patients array changes
    effect(() => {
        const currentData = this.patients();
        untracked(() => {
            currentData.forEach(p => this.storage.savePatient(p));
        });
    });

    // Auto-save & cloud sync on state or summary changes
    effect(() => {
      // Monitor current state and summary changes
      this.patientState.getCurrentState();
      this.patientState.activePatientSummary();
      const patientId = this.selectedPatientId();
      untracked(() => {
        if (patientId) {
          this.autoSave$.next();
        }
      });
    });

    // Handle debouncing and sync outside of Angular change detection cycle (1s fast auto-save)
    this.autoSaveSub = this.autoSave$.pipe(
      debounceTime(1000)
    ).subscribe({
      next: async () => {
        const patientId = untracked(() => this.selectedPatientId());
        if (patientId) {
          this.saveCurrentPatientState();
          await this.syncToCloud();
        }
      }
    });

    // Auto-save on window unload/tab close
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        const patientId = untracked(() => this.selectedPatientId());
        if (patientId) {
          this.saveCurrentPatientState();
        }
      });
    }

    // This effect runs whenever the selected patient changes.
    // It's the central point for orchestrating app state updates.
    effect(() => {
      const patientId = this.selectedPatientId();
      const loaded = this.rosterLoaded(); // track roster loading completion to ensure selection effect runs when roster loads

      untracked(() => {
        if (patientId && loaded) {
          const patient = this.patients().find((p) => p.id === patientId);
          console.log('[PatientManagementService] patientId:', patientId, 'found:', !!patient, 'roster size:', this.patients().length);
          if (patient) {
            // Load the selected patient's data into the main state service
            this.patientState.loadState(patient);
            this.findAndLoadActivePatientSummary(patient.history);

            // Reset the AI analysis first, then load the selected patient's report
            this.geminiService.resetAIState();

            console.log('[PatientManagementService] selected patient:', patientId, 'history length:', patient.history.length);
            const latestAnalysis = patient.history.find(
              (entry) =>
                entry.type === "AnalysisRun" ||
                entry.type === "FinalizedPatientSummary",
            );
            console.log('[PatientManagementService] latestAnalysis:', latestAnalysis ? latestAnalysis.type : 'none');
            if (latestAnalysis && latestAnalysis.report) {
              this.geminiService.loadArchivedAnalysis(latestAnalysis.report);
            } else {
              const activePhilosophy = this.patientState.activePhilosophy() || 'western';
              const dynamicReport = (this.geminiService as any).generateDynamicMockReport(patient.name, activePhilosophy);
              this.geminiService.loadArchivedAnalysis(dynamicReport);
            }
          }
        } else if (!patientId) {
          // No patient is selected, so clear the state for a new entry
          this.patientState.clearState();
          this.geminiService.resetAIState();
        }
      });
    }); // Warning: direct signal writes in effects are discouraged but sometimes necessary for orchestration
  }

  private findAndLoadActivePatientSummary(history: HistoryEntry[]) {
    // Find the most recent patient summary update
    const latestSummary = history.find(
      (entry) => entry.type === "PatientSummaryUpdate",
    );
    if (latestSummary) {
      this.patientState.updateActivePatientSummary(latestSummary.summary);
    } else {
      this.patientState.updateActivePatientSummary(null);
    }
  }

  /** Selects a patient, saving the current one's state first. */
  selectPatient(id: string) {
    if (this.selectedPatientId() === id) return;
    this.saveCurrentPatientState();
    this.selectedPatientId.set(id);

    if (id === 'p_marie_curie') {
      this.themeService.setTheme('dark');
    }
  }

  /** Reloads the current patient's most up-to-date state. Used to exit "review mode". */
  reloadCurrentPatient() {
    const patientId = this.selectedPatientId();
    if (!patientId) return;
    const patient = this.patients().find((p) => p.id === patientId);
    if (patient) {
      this.patientState.loadState(patient);
      this.geminiService.resetAIState();

      // Reload the latest analysis so the panel isn't empty after exiting review mode
      const latestAnalysis = patient.history.find(
        (entry) =>
          entry.type === "AnalysisRun" ||
          entry.type === "FinalizedPatientSummary",
      );
      if (
        latestAnalysis &&
        (latestAnalysis.type === "AnalysisRun" ||
          latestAnalysis.type === "FinalizedPatientSummary")
      ) {
        this.geminiService.loadArchivedAnalysis(latestAnalysis.report);
      }
    }
  }

  /** Creates a new patient record and selects it. Returns the new patient's ID. */
  async createNewPatient(): Promise<string> {
    this.saveCurrentPatientState();

    const firstName = "New";
    const lastName = "Patient";
    const dob = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    let newPatientId = `p_local_${Date.now()}`;

    try {
      const res = await createPatient(dataConnect, {
        firstName,
        lastName,
        dateOfBirth: dob,
        gender: "Other",
        vitalsHeartRate: 0,
        vitalsSystolicBP: 0,
        vitalsDiastolicBP: 0,
        currentSymptoms: []
      });

      if (res.data && res.data.patient_insert) {
        newPatientId = res.data.patient_insert.id;
      }
    } catch (err) {
      console.warn('[PatientManagementService] Error creating patient in SQL Connect, falling back to local ID:', err);
    }

    const newPatient: IPatient = {
      id: newPatientId,
      name: `${firstName} ${lastName}`,
      age: 0,
      gender: "Other" as const,
      lastVisit: new Date().toISOString().split("T")[0].replace(/-/g, "."),
      patientGoals: "",
      preexistingConditions: [],
      vitals: { bp: "", hr: "", temp: "", spO2: "", weight: "", height: "" },
      issues: {},
      history: [],
      bookmarks: [],
    };

    // Add to the top of the list for immediate visibility
    this.patients.update((patients) => [newPatient, ...patients]);
    this.selectedPatientId.set(newPatientId);

    // Save locally to IndexedDB/storage
    await this.storage.savePatient(newPatient);

    return newPatientId;
  }

  /** Removes a patient record. */
  removePatient(id: string) {
    this.storage.deletePatient(id);
    const isActive = this.selectedPatientId() === id;

    this.patients.update((patients) => {
      const filtered = patients.filter((p) => p.id !== id);

      // If we removed the active patient, select the next available one or null
      if (isActive) {
        if (filtered.length > 0) {
          // Use setTimeout to avoid expression changed after checked and ensure safe state transition
          setTimeout(() => this.selectedPatientId.set(filtered[0].id));
        } else {
          setTimeout(() => this.selectedPatientId.set(null));
        }
      }

      return filtered;
    });
  }

  /** Imports a pre-built IPatient object (from JSON or FHIR import). */
  importPatient(patient: IPatient) {
    this.saveCurrentPatientState();
    this.patients.update((patients) => [patient, ...patients]);
    this.selectedPatientId.set(patient.id);
  }

  /** Updates the core demographic details of a patient. */
  updatePatientDetails(
    id: string,
    details: Partial<{
      name: string;
      age: number;
      gender: IPatient["gender"];
      patientGoals: string;
    }>,
  ) {
    this.patients.update((patients) =>
      patients.map((p) => (p.id === id ? { ...p, ...details } : p)),
    );
  }

  /** Adds a new entry to a patient's history. */
  addHistoryEntry(patientId: string, entry: HistoryEntry) {
    this.patients.update((patients) =>
      patients.map((p) => {
        if (p.id !== patientId) return p;

        const updatedHistory = [entry, ...p.history];

        if (patientId === this.selectedPatientId()) {
          this.patientState.patientHistory.set(updatedHistory);
        }

        if (entry.type === "Visit") {
          return { ...p, history: updatedHistory, lastVisit: entry.date };
        }

        return { ...p, history: updatedHistory };
      }),
    );
  }

  /** Updates an existing entry in a patient's history, or adds it if it doesn't exist. */
  updateHistoryEntry(
    patientId: string,
    entry: HistoryEntry,
    matchFn: (e: HistoryEntry) => boolean,
  ) {
    this.patients.update((patients) =>
      patients.map((p) => {
        if (p.id !== patientId) return p;

        const index = p.history.findIndex(matchFn);
        let updatedHistory: HistoryEntry[];
        if (index === -1) {
          // Add if not found
          updatedHistory = [entry, ...p.history];
        } else {
          // Update existing
          updatedHistory = [...p.history];
          updatedHistory[index] = entry;
        }

        if (patientId === this.selectedPatientId()) {
          this.patientState.patientHistory.set(updatedHistory);
        }

        if (index === -1 && entry.type === "Visit") {
          return { ...p, history: updatedHistory, lastVisit: entry.date };
        }
        return { ...p, history: updatedHistory };
      }),
    );
  }

  /** Adds a bookmark to the currently selected patient. */
  addBookmark(bookmark: IBookmark) {
    const patientId = this.selectedPatientId();
    if (!patientId) return;

    // Add the bookmark to the list
    this.patients.update((patients) =>
      patients.map((p) =>
        p.id === patientId
          ? { ...p, bookmarks: [...p.bookmarks, bookmark] }
          : p,
      ),
    );

    // Add a corresponding history entry
    const historyEntry: HistoryEntry = {
      type: "BookmarkAdded",
      date: new Date().toISOString().split("T")[0].replace(/-/g, "."),
      summary: bookmark.title,
      bookmark: bookmark,
    };
    this.addHistoryEntry(patientId, historyEntry);
  }

  /** Removes a bookmark from the currently selected patient. */
  removeBookmark(url: string) {
    const patientId = this.selectedPatientId();
    if (!patientId) return;

    this.patients.update((patients) =>
      patients.map((p) =>
        p.id === patientId
          ? { ...p, bookmarks: p.bookmarks.filter((b) => b.url !== url) }
          : p,
      ),
    );
  }

  /** Injects a new rasterized diagnostic scan (like 3D markup) into the Vault */
  addScan(scan: IDiagnosticScan) {
    const patientId = this.selectedPatientId();
    if (!patientId) return;

    this.patients.update((patients) =>
      patients.map((p) =>
        p.id === patientId
          ? { ...p, scans: p.scans ? [scan, ...p.scans] : [scan] }
          : p,
      ),
    );
  }

  /** Updates an existing bookmark's metadata. */
  updateBookmark(url: string, updates: Partial<IBookmark>) {
    const patientId = this.selectedPatientId();
    if (!patientId) return;

    this.patients.update((patients) =>
      patients.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          bookmarks: p.bookmarks.map((b) =>
            b.url === url ? { ...b, ...updates } : b,
          ),
        };
      }),
    );
  }

  deleteNoteAndHistory(noteEntry: HistoryEntry) {
    if (noteEntry.type !== "NoteCreated") return;

    const patientId = this.selectedPatientId();
    if (!patientId) return;

    this.patients.update((patients) =>
      patients.map((p) => {
        if (p.id !== patientId) return p;

        // Guard against prototype pollution / invalid keys
        const partId = noteEntry.partId;
        if (!partId || partId === '__proto__' || partId === 'constructor' || partId === 'prototype') {
          return p;
        }

        // Create a mutable copy of the patient
        const updatedPatient = { ...p, issues: { ...p.issues } };

        // 1. Remove note from issues
        const issuesForPart = updatedPatient.issues[partId] || [];
        const updatedIssuesForPart = issuesForPart.filter(
          (i) => i.noteId !== noteEntry.noteId,
        );

        if (updatedIssuesForPart.length > 0) {
          updatedPatient.issues[partId] = updatedIssuesForPart;
        } else {
          delete updatedPatient.issues[partId];
        }

        // 2. Remove entry from history
        updatedPatient.history = updatedPatient.history.filter((h) => {
          if (h.type === "NoteCreated" && h.noteId === noteEntry.noteId) {
            return false; // filter this one out
          }
          return true;
        });

        return updatedPatient;
      }),
    );
  }

  /** Loads the state from a past visit into the main app state for review. */
  loadArchivedVisit(
    patientId: string,
    visit: HistoryEntry,
    select?: { partId: string; noteId: string },
  ) {
    if (
      (visit.type !== "Visit" && visit.type !== "ChartArchived") ||
      !visit.state
    )
      return;

    this.saveCurrentPatientState();
    this.patientState.loadState(visit.state);
    this.geminiService.resetAIState();
    this.patientState.setViewingPastVisit(visit);

    // Load the analysis report associated with this visit's date (if one exists)
    const patient = this.patients().find((p) => p.id === patientId);
    if (patient) {
      const associatedAnalysis = patient.history.find(
        (entry) =>
          (entry.type === "AnalysisRun" ||
            entry.type === "FinalizedPatientSummary") &&
          entry.date === visit.date,
      );
      if (
        associatedAnalysis &&
        (associatedAnalysis.type === "AnalysisRun" ||
          associatedAnalysis.type === "FinalizedPatientSummary")
      ) {
        this.geminiService.loadArchivedAnalysis(associatedAnalysis.report);
      }
    }

    // After loading the historical state, select the specific note if requested.
    if (select) {
      this.patientState.selectPart(select.partId);
      this.patientState.selectNote(select.noteId);
    }
  }

  /** Loads the state from a past analysis into the main app state for review. */
  loadArchivedAnalysis(analysis: HistoryEntry) {
    if (analysis.type !== "AnalysisRun") return;
    this.saveCurrentPatientState();
    this.patientState.clearIssuesAndGoalsForReview();
    this.geminiService.loadArchivedAnalysis(analysis.report);
    this.patientState.setViewingPastVisit(analysis);
  }

  /** Ingests a standard SMART on FHIR R4 Bundle and maps it to the internal Patient list */
  ingestFhirBundle(bundle: any) {
    if (!bundle || bundle.resourceType !== 'Bundle' || !bundle.entry) return;

    let fhirPatientId = '';
    let fhirName = 'Epic Patient';
    let fhirAge = 0;
    let fhirGender = 'Unknown';

    // 1. Extract base demographics
    const patientResource = bundle.entry.find((e: any) => e.resource?.resourceType === 'Patient' || e.resource?.resourceType === 'Patient')?.resource;
    if (patientResource) {
        fhirPatientId = patientResource.id;
        if (patientResource.name?.[0]) {
            fhirName = `${patientResource.name[0].given?.join(' ') || ''} ${patientResource.name[0].family || ''}`.trim();
        }
        if (patientResource.birthDate) {
            const birthDate = new Date(patientResource.birthDate);
            const ageDifMs = Date.now() - birthDate.getTime();
            const ageDate = new Date(ageDifMs); 
            fhirAge = Math.abs(ageDate.getUTCFullYear() - 1970);
        }
        fhirGender = patientResource.gender ? patientResource.gender.charAt(0).toUpperCase() + patientResource.gender.slice(1) : 'Unknown';
    }

    const conditions: string[] = [];
    const vitals: any = { bp: '', hr: '', temp: '', spO2: '', weight: '', height: '' };
    const scans: any[] = [];
    const medications: any[] = [];

    bundle.entry.forEach((entry: any) => {
        const resource = entry.resource;
        if (!resource) return;

        // Conditions
        if (resource.resourceType === 'Condition' && resource.code?.text) {
           if (!conditions.includes(resource.code.text)) {
               conditions.push(resource.code.text);
           }
        }

        // Medications
        if (resource.resourceType === 'MedicationRequest' && resource.medicationCodeableConcept?.text) {
            medications.push({
                id: resource.id || `med_${Date.now()}_${Math.random()}`,
                name: resource.medicationCodeableConcept.text,
                value: 'Prescribed'
            });
        }

        // IVitals
        if (resource.resourceType === 'Observation' && resource.category?.[0]?.coding?.[0]?.code === 'vital-signs') {
            const value = resource.valueQuantity ? `${resource.valueQuantity.value} ${resource.valueQuantity.unit || ''}` : '';
            if (resource.code?.coding?.[0]?.code === '8310-5') vitals.temp = value; 
            if (resource.code?.coding?.[0]?.code === '8867-4') vitals.hr = value;   
            if (resource.code?.coding?.[0]?.code === '2708-6') vitals.spO2 = value; 
            
            if (resource.code?.coding?.[0]?.code === '85354-9' && resource.component) {
                const systolic = resource.component.find((c: any) => c.code?.coding?.[0]?.code === '8480-6')?.valueQuantity?.value;
                const diastolic = resource.component.find((c: any) => c.code?.coding?.[0]?.code === '8462-4')?.valueQuantity?.value;
                if (systolic && diastolic) vitals.bp = `${systolic}/${diastolic}`;
            }
        }

        // Diagnostic Reports
        if (resource.resourceType === 'DiagnosticReport') {
            scans.push({
                id: resource.id || `scan_${Math.random()}`,
                type: 'External FHIR Report',
                title: resource.code?.text || 'Diagnostic Report',
                date: resource.effectiveDateTime ? resource.effectiveDateTime.split('T')[0].replace(/-/g, '.') : new Date().toISOString().split('T')[0].replace(/-/g, '.'),
                bodyPartId: 'unknown',
                description: resource.presentedForm?.[0]?.data ? atob(resource.presentedForm[0].data) : 'Imported via SMART on FHIR',
                status: 'Reviewed'
            });
        }
    });

    const newPatient: IPatient = {
        id: `epic_${fhirPatientId || Date.now()}`,
        name: fhirName,
        age: fhirAge,
        gender: fhirGender as "Male" | "Female" | "Non-binary" | "Other",
        lastVisit: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
        preexistingConditions: conditions,
        patientGoals: "Imported via Epic MyChart Integration",
        vitals: vitals,
        oxidativeStressMarkers: [],
        antioxidantSources: [],
        medications: medications,
        issues: {},
        history: [{
           type: "Visit",
           date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
           summary: "SMART on FHIR Data Import",
           state: {} as any
        }],
        bookmarks: [],
        scans: scans
    };

    this.patients.update(list => [newPatient, ...list]);
    this.selectPatient(newPatient.id);
  }

  /** Synchronizes the current patient list with the Node.js backend. */
  async syncToCloud(): Promise<boolean> {
    if (this.patientState.isDemoMode()) {
        return true; // Skip cloud sync in demo mode to prevent parallel test workers interfering with each other
    }
    if (!this.network.isOnline()) {
        console.warn('[PatientManagementService] Cannot sync to cloud while offline. State is safely stored locally.');
        return false;
    }

    this.saveCurrentPatientState(); // Ensure the latest state is saved
    try {
      const patientsToSync = this.patients();
      // Include auth header if PATIENTS_SECRET was surfaced via /api/config or env
      const secret = (window as any).__PATIENTS_SECRET__ || '';
      const headers: Record<string, string> = secret
        ? { Authorization: `Bearer ${secret}` }
        : {};
      await firstValueFrom(this.http.post('/api/patients', patientsToSync, { headers }));
      console.log('[PatientManagementService] Successfully synced to cloud');
      return true;
    } catch (error: any) {
      console.warn('[PatientManagementService] Cloud sync unavailable (HTTP/Cloud):', error?.message || error);
      return false;
    }
  }

  private saveCarePlanDraft() {
    const patientId = this.selectedPatientId();
    if (!patientId) return;

    const draftText = this.patientState.activePatientSummary();
    if (!draftText) return;

    const currentPatients = this.patients();
    const patient = currentPatients.find(p => p.id === patientId);
    if (!patient) return;

    const lastEntry = patient.history[0];
    if (lastEntry && lastEntry.type === 'PatientSummaryUpdate' && lastEntry.summary === draftText) {
      return;
    }

    const newEntry = {
      type: 'PatientSummaryUpdate' as const,
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      summary: draftText
    };

    if (lastEntry && lastEntry.type === 'PatientSummaryUpdate') {
      const updatedHistory = [newEntry, ...patient.history.slice(1)];
      this.patients.update(list =>
        list.map(p => p.id === patientId ? { ...p, history: updatedHistory } : p)
      );
    } else {
      this.addHistoryEntry(patientId, newEntry);
    }
  }

  triggerImmediateSaveAndSync() {
    this.saveCurrentPatientState();
    this.syncToCloud().catch(err => console.error("Immediate sync failed", err));
  }

  /** Persists the current form state to the patient object in the list. */
  private saveCurrentPatientState() {
    const currentId = this.selectedPatientId();
    if (!currentId) return;

    this.saveCarePlanDraft();

    const currentState = this.patientState.getCurrentState();
    this.patients.update((patients) =>
      patients.map((p) => (p.id === currentId ? { ...p, ...currentState } : p)),
    );
  }

  ngOnDestroy() {
    if (this.autoSaveSub) {
      this.autoSaveSub.unsubscribe();
    }
  }
}
