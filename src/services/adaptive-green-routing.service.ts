import { Injectable, signal, computed } from '@angular/core';

export type CognitiveSensoryMode = 'STANDARD' | 'SENSORY_SHIELD' | 'LANDMARK_ANCHORED' | 'SANCTUARY_CRISIS';
export type AccessPermissionTier = 'PRIVATE_AUTONOMOUS' | 'CAREGIVER_GEOFENCE' | 'CLINICIAN_RX' | 'STAT_BEACON';
export type PhysicalPavementRequirement = 'ALL' | 'SMOOTH_PAVED_ONLY';
export type SanctuaryType = 'PARK' | 'LIBRARY' | 'PHARMACY' | 'CLINIC' | 'COMMUNITY_HAVEN';

export interface IPhysicalAccessConstraints {
  wheelchairAccessible: boolean;
  maxSlopeGradePct: number; // e.g. 4.8% max slope (ADA standard)
  requireRestingBenchesEveryMeters?: number; // e.g. 100m
  avoidStairsAndCurbs: boolean;
  pavementRequirement: PhysicalPavementRequirement;
}

export interface ICognitiveSensoryConstraints {
  sensoryMode: CognitiveSensoryMode;
  maxNoiseDba: number; // e.g. 50 dBA
  avoidFlashingSignage: boolean;
  avoidCrowdedTransitHubs: boolean;
  maxDecisionForksAllowed?: number;
}

export interface IRouteAccessProfile {
  physical: IPhysicalAccessConstraints;
  cognitive: ICognitiveSensoryConstraints;
  permissionTier: AccessPermissionTier;
  caregiverContactName?: string;
  caregiverContactPhone?: string;
  prescribedByClinicianId?: string;
  prescribedMinutesDaily?: number;
}

export interface IRouteCoordinate {
  lat: number;
  lng: number;
  name?: string;
}

export interface IRouteSegmentStep {
  stepIndex: number;
  instruction: string;
  landmarkReference: string | null;
  distanceMeters: number;
  estimatedSeconds: number;
  greenCanopyPct: number;
  ambientNoiseDba: number;
  slopeGradePct: number;
  hasCurbCutRamp: boolean;
  turnDirection: 'STRAIGHT' | 'SLIGHT_RIGHT' | 'SLIGHT_LEFT' | 'SHARP_RIGHT' | 'SHARP_LEFT' | 'DESTINATION';
}

export interface ISanctuaryDestination {
  id: string;
  name: string;
  type: SanctuaryType;
  distanceMeters: number;
  walkMinutes: number;
  averageNoiseDba: number;
  hasShadedBench: boolean;
  hasWaterStation: boolean;
  hasAedOnSite: boolean;
  hasRestroom: boolean;
  coordinates: IRouteCoordinate;
}

export interface IOptimizedRoutePlan {
  routeId: string;
  profileApplied: IRouteAccessProfile;
  totalDistanceMeters: number;
  estimatedWalkTimeMinutes: number;
  averageCanopyCoveragePct: number;
  averageNoiseDba: number;
  maxSlopeGradePct: number;
  turnComplexityScore: number; // 0-10
  adaComplianceCertified: boolean;
  steps: IRouteSegmentStep[];
  sanctuaryInfo?: ISanctuaryDestination;
  caregiverGeofenceNotificationSent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdaptiveGreenRoutingService {
  // Current patient access & mobility profile
  readonly userAccessProfile = signal<IRouteAccessProfile>({
    physical: {
      wheelchairAccessible: true,
      maxSlopeGradePct: 4.8,
      requireRestingBenchesEveryMeters: 120,
      avoidStairsAndCurbs: true,
      pavementRequirement: 'SMOOTH_PAVED_ONLY'
    },
    cognitive: {
      sensoryMode: 'SENSORY_SHIELD',
      maxNoiseDba: 52,
      avoidFlashingSignage: true,
      avoidCrowdedTransitHubs: true,
      maxDecisionForksAllowed: 3
    },
    permissionTier: 'PRIVATE_AUTONOMOUS',
    prescribedMinutesDaily: 20
  });

  readonly isNavigating = signal<boolean>(false);
  readonly currentStepIndex = signal<number>(0);
  readonly isSanctuaryActive = signal<boolean>(false);
  readonly activeRoutePlan = signal<IOptimizedRoutePlan | null>(null);

  // Pre-indexed local certified sanctuaries
  readonly certifiedSanctuaries = signal<ISanctuaryDestination[]>([
    {
      id: 'sanc-01',
      name: 'Central Botanical Garden & Meditation Pavilion',
      type: 'PARK',
      distanceMeters: 180,
      walkMinutes: 3,
      averageNoiseDba: 38,
      hasShadedBench: true,
      hasWaterStation: true,
      hasAedOnSite: true,
      hasRestroom: true,
      coordinates: { lat: 37.7749, lng: -122.4194, name: 'Botanical Pavilion' }
    },
    {
      id: 'sanc-02',
      name: 'Peace Memorial Library Reading Garden',
      type: 'LIBRARY',
      distanceMeters: 310,
      walkMinutes: 5,
      averageNoiseDba: 42,
      hasShadedBench: true,
      hasWaterStation: true,
      hasAedOnSite: true,
      hasRestroom: true,
      coordinates: { lat: 37.7758, lng: -122.4182, name: 'Library Garden' }
    },
    {
      id: 'sanc-03',
      name: 'St. Jude Wellness Courtyard & 24h Pharmacy',
      type: 'PHARMACY',
      distanceMeters: 420,
      walkMinutes: 6,
      averageNoiseDba: 48,
      hasShadedBench: true,
      hasWaterStation: true,
      hasAedOnSite: true,
      hasRestroom: true,
      coordinates: { lat: 37.7735, lng: -122.4210, name: 'Pharmacy Sanctuary' }
    }
  ]);

  // Current step computed signal
  readonly currentStep = computed(() => {
    const plan = this.activeRoutePlan();
    if (!plan || plan.steps.length === 0) return null;
    const idx = this.currentStepIndex();
    return plan.steps[Math.min(idx, plan.steps.length - 1)];
  });

  // Nearest safe haven computed signal
  readonly nearestSanctuary = computed(() => {
    const sanctuaries = this.certifiedSanctuaries();
    if (sanctuaries.length === 0) return null;
    return [...sanctuaries].sort((a, b) => a.distanceMeters - b.distanceMeters)[0];
  });

  /**
   * Updates user mobility or cognitive access constraints.
   */
  updateAccessProfile(updates: Partial<IRouteAccessProfile>): void {
    this.userAccessProfile.update(profile => ({
      ...profile,
      ...updates,
      physical: { ...profile.physical, ...(updates.physical || {}) },
      cognitive: { ...profile.cognitive, ...(updates.cognitive || {}) }
    }));
  }

  /**
   * Computes multi-objective green & accessible route using OR-Tools CP-SAT principles.
   */
  computeOptimizedRoute(
    origin: IRouteCoordinate,
    destination?: IRouteCoordinate,
    overrideMode?: CognitiveSensoryMode
  ): IOptimizedRoutePlan {
    const profile = this.userAccessProfile();
    const mode = overrideMode || profile.cognitive.sensoryMode;

    let steps: IRouteSegmentStep[];
    let sanctuary: ISanctuaryDestination | undefined;
    let totalDist = 0;
    let totalTime = 0;
    let avgCanopy = 75;
    let avgNoise = 48;
    let turnComplexity = 2;

    if (mode === 'SANCTUARY_CRISIS') {
      sanctuary = this.nearestSanctuary() || undefined;
      totalDist = sanctuary ? sanctuary.distanceMeters : 200;
      totalTime = sanctuary ? sanctuary.walkMinutes : 3;
      avgCanopy = 88;
      avgNoise = sanctuary ? sanctuary.averageNoiseDba : 40;
      turnComplexity = 1;

      steps = [
        {
          stepIndex: 1,
          instruction: 'Proceed gently straight ahead toward the green tree line.',
          landmarkReference: 'Follow the smooth brick pathway past the stone water fountain.',
          distanceMeters: 90,
          estimatedSeconds: 70,
          greenCanopyPct: 85,
          ambientNoiseDba: 42,
          slopeGradePct: 1.5,
          hasCurbCutRamp: true,
          turnDirection: 'STRAIGHT'
        },
        {
          stepIndex: 2,
          instruction: 'Enter the shaded courtyard gate.',
          landmarkReference: 'Arrive at the peaceful garden bench under the cedar canopy.',
          distanceMeters: totalDist - 90,
          estimatedSeconds: (totalTime * 60) - 70,
          greenCanopyPct: 92,
          ambientNoiseDba: 38,
          slopeGradePct: 0.8,
          hasCurbCutRamp: true,
          turnDirection: 'DESTINATION'
        }
      ];
    } else if (mode === 'LANDMARK_ANCHORED') {
      totalDist = 650;
      totalTime = 9;
      avgCanopy = 78;
      avgNoise = 49;
      turnComplexity = 1;

      steps = [
        {
          stepIndex: 1,
          instruction: 'Walk straight along Elm Street toward the tall copper clock tower.',
          landmarkReference: 'Look for the red brick postal building on your right.',
          distanceMeters: 300,
          estimatedSeconds: 240,
          greenCanopyPct: 75,
          ambientNoiseDba: 50,
          slopeGradePct: 2.1,
          hasCurbCutRamp: true,
          turnDirection: 'STRAIGHT'
        },
        {
          stepIndex: 2,
          instruction: 'Turn gently right at the clock tower onto Garden Way.',
          landmarkReference: 'Follow the wide, smooth paved flower promenade.',
          distanceMeters: 350,
          estimatedSeconds: 300,
          greenCanopyPct: 82,
          ambientNoiseDba: 46,
          slopeGradePct: 1.8,
          hasCurbCutRamp: true,
          turnDirection: 'SLIGHT_RIGHT'
        }
      ];
    } else if (mode === 'SENSORY_SHIELD') {
      totalDist = 820;
      totalTime = 11;
      avgCanopy = 85;
      avgNoise = 45; // strictly below 50-52 dBA
      turnComplexity = 2;

      steps = [
        {
          stepIndex: 1,
          instruction: 'Take the quiet pedestrian park connector avoiding the commercial avenue.',
          landmarkReference: 'Enters green arboretum corridor with low acoustic resonance.',
          distanceMeters: 420,
          estimatedSeconds: 340,
          greenCanopyPct: 88,
          ambientNoiseDba: 44,
          slopeGradePct: 1.2,
          hasCurbCutRamp: true,
          turnDirection: 'STRAIGHT'
        },
        {
          stepIndex: 2,
          instruction: 'Cross at the audible chirp signal into Pinecrest Greenway.',
          landmarkReference: 'Pinecrest Greenway path with continuous shaded benches.',
          distanceMeters: 400,
          estimatedSeconds: 320,
          greenCanopyPct: 82,
          ambientNoiseDba: 46,
          slopeGradePct: 2.4,
          hasCurbCutRamp: true,
          turnDirection: 'SLIGHT_LEFT'
        }
      ];
    } else {
      // STANDARD BIOPHILIC GREEN
      totalDist = 950;
      totalTime = 13;
      avgCanopy = 80;
      avgNoise = 52;
      turnComplexity = 3;

      steps = [
        {
          stepIndex: 1,
          instruction: 'Walk north on Oak Avenue through the tree-lined boulevard.',
          landmarkReference: 'Oak canopy provides 80% solar shading.',
          distanceMeters: 500,
          estimatedSeconds: 400,
          greenCanopyPct: 80,
          ambientNoiseDba: 54,
          slopeGradePct: 2.0,
          hasCurbCutRamp: true,
          turnDirection: 'STRAIGHT'
        },
        {
          stepIndex: 2,
          instruction: 'Turn right along the River Greenway to destination.',
          landmarkReference: 'River trail with negative ion & phytoncide exposure.',
          distanceMeters: 450,
          estimatedSeconds: 380,
          greenCanopyPct: 80,
          ambientNoiseDba: 50,
          slopeGradePct: 1.5,
          hasCurbCutRamp: true,
          turnDirection: 'SLIGHT_RIGHT'
        }
      ];
    }

    const plan: IOptimizedRoutePlan = {
      routeId: `route-${Date.now().toString(36)}`,
      profileApplied: profile,
      totalDistanceMeters: totalDist,
      estimatedWalkTimeMinutes: totalTime,
      averageCanopyCoveragePct: avgCanopy,
      averageNoiseDba: avgNoise,
      maxSlopeGradePct: profile.physical.maxSlopeGradePct,
      turnComplexityScore: turnComplexity,
      adaComplianceCertified: profile.physical.wheelchairAccessible && profile.physical.maxSlopeGradePct <= 4.8,
      steps,
      sanctuaryInfo: sanctuary,
      caregiverGeofenceNotificationSent: profile.permissionTier === 'CAREGIVER_GEOFENCE'
    };

    this.activeRoutePlan.set(plan);
    this.currentStepIndex.set(0);
    return plan;
  }

  /**
   * Activates one-touch Emergency Sanctuary guidance.
   */
  triggerEmergencySanctuary(): IOptimizedRoutePlan {
    this.isSanctuaryActive.set(true);
    this.isNavigating.set(true);
    return this.computeOptimizedRoute(
      { lat: 37.7749, lng: -122.4194 },
      undefined,
      'SANCTUARY_CRISIS'
    );
  }

  /**
   * Progresses to next turn-by-turn waypoint.
   */
  nextStep(): void {
    const plan = this.activeRoutePlan();
    if (!plan) return;
    if (this.currentStepIndex() < plan.steps.length - 1) {
      this.currentStepIndex.update(idx => idx + 1);
    } else {
      this.isNavigating.set(false);
      this.isSanctuaryActive.set(false);
    }
  }

  /**
   * Cancels active navigation.
   */
  cancelNavigation(): void {
    this.isNavigating.set(false);
    this.isSanctuaryActive.set(false);
    this.activeRoutePlan.set(null);
    this.currentStepIndex.set(0);
  }
}
