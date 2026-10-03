import { Injectable, computed, signal, Signal } from '@angular/core';
import { 
  IMicroScaleState, 
  IMesoScaleState, 
  IMacroScaleState, 
  IMultiscaleAssessment 
} from '../../models/multiscale.types';

@Injectable({
  providedIn: 'root'
})
export class MultiscalePatientStateService {
  // Encapsulated Signals matching the Three Acts
  private micro = signal<IMicroScaleState>({
    realTimeVitals: {},
    localizedInflammation: {},
    temporalWindow: 'minutes-to-hours'
  });

  private meso = signal<IMesoScaleState>({
    autonomicTone: 'unmeasured',
    sleepArchitecture: {},
    temporalWindow: 'days-to-weeks'
  });

  private macro = signal<IMacroScaleState>({
    systemicInflammatoryBurdenIndex: 0,
    hba1cTrajectory: 'unmeasured',
    allostaticLoadScore: 0,
    temporalWindow: 'months-to-decades'
  });

  // "Tell, Don't Ask" Domain Logic: The entity calculates its own multiscale cascade
  // Example: Local periodontal inflammation cascades to systemic CV risk
  public projectedCardiovascularRisk: Signal<string> = computed(() => {
    const microState = this.micro();
    const macroState = this.macro();
    
    // NECSI Principle: A micro perturbation + high macro allostatic load = Systemic vulnerability
    const probingDepth = microState.localizedInflammation.fdiTooth32ProbingDepthMm || 0;
    
    if (probingDepth >= 4 && macroState.systemicInflammatoryBurdenIndex > 7.5) {
      return 'HIGH_RISK_CASCADE_DETECTED';
    }
    
    if (probingDepth > 0 || macroState.systemicInflammatoryBurdenIndex > 5.0) {
      return 'ELEVATED_MONITORING_REQUIRED';
    }
    
    return 'STABLE';
  });

  // Multiscale View
  public getFullAssessment(): IMultiscaleAssessment {
    return {
      microScale: this.micro(),
      mesoScale: this.meso(),
      macroScale: this.macro()
    };
  }

  // Mutators (Tell)
  public updateMicroPerturbation(data: Partial<Omit<IMicroScaleState, 'temporalWindow'>>) {
    this.micro.update(current => ({ 
      ...current, 
      ...data, 
      realTimeVitals: { ...current.realTimeVitals, ...data.realTimeVitals },
      localizedInflammation: { ...current.localizedInflammation, ...data.localizedInflammation }
    }));
  }

  public updateMesoArchitecture(data: Partial<Omit<IMesoScaleState, 'temporalWindow'>>) {
    this.meso.update(current => ({ 
      ...current, 
      ...data,
      sleepArchitecture: { ...current.sleepArchitecture, ...data.sleepArchitecture }
    }));
  }

  public updateMacroTrajectory(data: Partial<Omit<IMacroScaleState, 'temporalWindow'>>) {
    this.macro.update(current => ({ ...current, ...data }));
  }
}
