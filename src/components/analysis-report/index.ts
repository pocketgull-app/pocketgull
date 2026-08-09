import { AssessmentsLensTabComponent } from './assessments-lens-tab.component';
import { ChronobiologyMatrixLensTabComponent } from './chronobiology-matrix-lens-tab.component';
import { DiagnosticsLensTabComponent } from './diagnostics-lens-tab.component';
import { EmtHandoffLensTabComponent } from './emt-handoff-lens-tab.component';
import { EpigeneticLongevityLensTabComponent } from './epigenetic-longevity-lens-tab.component';
import { FunctionalCircadianSynergyBridgeComponent } from './functional-circadian-synergy-bridge.component';
import { FunctionalMedicineMatrixLensTabComponent } from './functional-medicine-matrix-lens-tab.component';
import { InterventionsLensTabComponent } from './interventions-lens-tab.component';
import { MaternalPostpartumLensTabComponent } from './maternal-postpartum-lens-tab.component';
import { NutritionalBypassLensTabComponent } from './nutritional-bypass-lens-tab.component';
import { PatientEducationLensTabComponent } from './patient-education-lens-tab.component';
import { SevenGenerationsStewardshipLensTabComponent } from './seven-generations-stewardship-lens-tab.component';
import { SocraticEpistemologyLensTabComponent } from './socratic-epistemology-lens-tab.component';
import { SummaryOverviewLensTabComponent } from './summary-overview-lens-tab.component';
import { TeledentistrySystemicLensComponent } from './teledentistry-systemic-lens.component';

export * from './assessments-lens-tab.component';
export * from './chronobiology-matrix-lens-tab.component';
export * from './diagnostics-lens-tab.component';
export * from './emt-handoff-lens-tab.component';
export * from './epigenetic-longevity-lens-tab.component';
export * from './functional-circadian-synergy-bridge.component';
export * from './functional-medicine-matrix-lens-tab.component';
export * from './interventions-lens-tab.component';
export * from './maternal-postpartum-lens-tab.component';
export * from './nutritional-bypass-lens-tab.component';
export * from './patient-education-lens-tab.component';
export * from './seven-generations-stewardship-lens-tab.component';
export * from './socratic-epistemology-lens-tab.component';
export * from './summary-overview-lens-tab.component';
export * from './teledentistry-systemic-lens.component';

/**
 * Composite array of all analysis report lens tab components.
 * Import this array directly into `@Component({ imports: [ ...ANALYSIS_LENS_TAB_COMPONENTS ] })`.
 */
export const ANALYSIS_LENS_TAB_COMPONENTS = [
  AssessmentsLensTabComponent,
  ChronobiologyMatrixLensTabComponent,
  DiagnosticsLensTabComponent,
  EmtHandoffLensTabComponent,
  EpigeneticLongevityLensTabComponent,
  FunctionalCircadianSynergyBridgeComponent,
  FunctionalMedicineMatrixLensTabComponent,
  InterventionsLensTabComponent,
  MaternalPostpartumLensTabComponent,
  NutritionalBypassLensTabComponent,
  PatientEducationLensTabComponent,
  SevenGenerationsStewardshipLensTabComponent,
  SocraticEpistemologyLensTabComponent,
  SummaryOverviewLensTabComponent,
  TeledentistrySystemicLensComponent,
] as const;
