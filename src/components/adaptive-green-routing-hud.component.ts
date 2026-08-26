import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  AdaptiveGreenRoutingService, 
  CognitiveSensoryMode, 
  AccessPermissionTier, 
  IRouteSegmentStep,
  ISanctuaryDestination 
} from '../services/adaptive-green-routing.service';

@Component({
  selector: 'app-adaptive-green-routing-hud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rounded-xl border border-zinc-800 bg-zinc-950/95 p-5 shadow-2xl backdrop-blur-md text-zinc-100 font-sans" role="region" aria-label="Adaptive Green Routing and Mental Health Wayfinding HUD">
      
      <!-- Top HUD Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-semibold tracking-wide text-zinc-100">Adaptive Green & Sensory Routing</h2>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                OR-Tools Engine
              </span>
              @if (activePlan()?.adaComplianceCertified) {
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-teal-950/80 text-teal-300 border border-teal-800/50">
                  ♿ ADA Certified
                </span>
              }
            </div>
            <p class="text-xs text-zinc-400">Multi-objective biophilic optimization for mental state & universal access</p>
          </div>
        </div>

        <!-- Emergency Sanctuary Button -->
        <button
          type="button"
          (click)="triggerEmergencySanctuary()"
          class="min-h-[44px] px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 text-xs font-semibold flex items-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-amber-400"
          aria-label="Emergency Sanctuary: Find nearest quiet haven immediately">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          🚨 Find Nearest Sanctuary
        </button>
      </div>

      <!-- Navigation Active Card -->
      @if (isNavigating() && activePlan()) {
        <div class="mt-4 rounded-xl border border-teal-800/60 bg-teal-950/30 p-4" [class.border-amber-700]="isSanctuaryActive()">
          
          <!-- Sanctuary Breathing Pacer (Crisis Mode Only) -->
          @if (isSanctuaryActive()) {
            <div class="mb-4 text-center bg-amber-950/40 p-4 rounded-lg border border-amber-800/50">
              <span class="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold block mb-1">
                Calm Haven Egress · 4-7-8 Breathing Guide
              </span>
              <div class="inline-flex items-center justify-center h-14 w-14 rounded-full border-2 border-amber-400/80 animate-pulse text-amber-200 text-xs font-mono font-bold my-1">
                Breathe
              </div>
              <p class="text-xs text-amber-200/90 max-w-md mx-auto mt-1">
                You are safe. Guided walk to <strong>{{ activePlan()?.sanctuaryInfo?.name }}</strong> ({{ activePlan()?.sanctuaryInfo?.walkMinutes }} min walk).
              </p>
            </div>
          }

          <!-- Current Turn-by-Turn Instruction -->
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-3">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 text-xl font-bold">
                @switch (currentStep()?.turnDirection) {
                  @case ('STRAIGHT') { ⬆️ }
                  @case ('SLIGHT_RIGHT') { ↗️ }
                  @case ('SLIGHT_LEFT') { ↖️ }
                  @case ('SHARP_RIGHT') { ➡️ }
                  @case ('SHARP_LEFT') { ⬅️ }
                  @default { 📍 }
                }
              </div>
              <div>
                <span class="text-xs font-mono text-teal-400 block font-semibold">
                  Step {{ (currentStepIndex() + 1) }} of {{ activePlan()?.steps?.length }} ({{ currentStep()?.distanceMeters }}m)
                </span>
                <h3 class="text-sm font-bold text-zinc-100 mt-0.5 leading-snug">
                  {{ currentStep()?.instruction }}
                </h3>
                @if (currentStep()?.landmarkReference) {
                  <p class="text-xs text-zinc-300 mt-1 flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1 rounded border border-zinc-800">
                    <span class="text-emerald-400">🏛️ Landmark:</span> {{ currentStep()?.landmarkReference }}
                  </p>
                }
              </div>
            </div>

            <!-- Route Metrics Chips -->
            <div class="text-right shrink-0 space-y-1">
              <div class="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                🌿 {{ currentStep()?.greenCanopyPct }}% Canopy
              </div>
              <div class="text-[11px] font-mono text-zinc-300 bg-zinc-900/60 px-2 py-0.5 rounded border border-zinc-800">
                🔇 {{ currentStep()?.ambientNoiseDba }} dBA
              </div>
              <div class="text-[11px] font-mono text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
                ♿ {{ currentStep()?.slopeGradePct }}% Slope
              </div>
            </div>
          </div>

          <!-- Navigation Controls -->
          <div class="mt-4 flex items-center justify-between border-t border-teal-800/40 pt-3">
            <span class="text-xs font-mono text-zinc-400">
              Total: {{ activePlan()?.totalDistanceMeters }}m · ~{{ activePlan()?.estimatedWalkTimeMinutes }} min
            </span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="cancelNavigation()"
                class="min-h-[44px] px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400">
                End Route
              </button>
              <button
                type="button"
                (click)="nextStep()"
                class="min-h-[44px] px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-teal-400">
                {{ (currentStepIndex() < (activePlan()?.steps?.length || 1) - 1) ? 'Next Step ➡️' : 'Arrived 🏁' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Routing Mode & Access Configuration -->
      <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        
        <!-- Column 1: Cognitive & Sensory Mode -->
        <div class="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3.5">
          <span class="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2 font-semibold">
            Cognitive & Sensory Mode
          </span>
          <div class="space-y-1.5">
            @for (mode of cognitiveModes; track mode.id) {
              <button
                type="button"
                (click)="selectCognitiveMode(mode.id)"
                [class.border-teal-500]="activeSensoryMode() === mode.id"
                [class.bg-teal-950/40]="activeSensoryMode() === mode.id"
                [class.text-white]="activeSensoryMode() === mode.id"
                [class.border-zinc-800]="activeSensoryMode() !== mode.id"
                [class.text-zinc-300]="activeSensoryMode() !== mode.id"
                class="w-full text-left p-2 rounded-md border text-xs transition-all hover:bg-zinc-800 min-h-[44px] flex items-center justify-between"
                [attr.aria-pressed]="activeSensoryMode() === mode.id">
                <div>
                  <span class="font-medium block">{{ mode.label }}</span>
                  <span class="text-[10px] text-zinc-400">{{ mode.description }}</span>
                </div>
                <span>{{ mode.emoji }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Column 2: Physical & ADA Accessibility -->
        <div class="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3.5">
          <span class="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2 font-semibold">
            Physical Access Tiers (ADA)
          </span>
          <div class="space-y-2 text-xs">
            <label class="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-zinc-800 min-h-[44px]">
              <input 
                type="checkbox" 
                [checked]="userProfile().physical.wheelchairAccessible"
                (change)="toggleWheelchair($event)"
                class="rounded border-zinc-700 bg-zinc-900 text-teal-500 focus:ring-teal-400 h-4 w-4">
              <div>
                <span class="font-medium text-zinc-200 block">♿ Wheelchair / Scooter Access</span>
                <span class="text-[10px] text-zinc-400">Zero stairs, 100% curb cut ramps</span>
              </div>
            </label>

            <label class="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-zinc-800 min-h-[44px]">
              <input 
                type="checkbox" 
                [checked]="userProfile().physical.pavementRequirement === 'SMOOTH_PAVED_ONLY'"
                (change)="togglePavement($event)"
                class="rounded border-zinc-700 bg-zinc-900 text-teal-500 focus:ring-teal-400 h-4 w-4">
              <div>
                <span class="font-medium text-zinc-200 block">🪵 Smooth Paved Substrates Only</span>
                <span class="text-[10px] text-zinc-400">No loose gravel, exposed roots, cobblestone</span>
              </div>
            </label>

            <div class="pt-1 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span>Max Slope Grade:</span>
              <span class="font-mono text-teal-400 font-bold">≤ {{ userProfile().physical.maxSlopeGradePct }}% (ADA 1:20)</span>
            </div>
          </div>
        </div>

        <!-- Column 3: Permission & Caregiver Shield -->
        <div class="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3.5">
          <span class="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2 font-semibold">
            Caregiver & Privacy Permissions
          </span>
          <div class="space-y-1.5">
            @for (tier of permissionTiers; track tier.id) {
              <button
                type="button"
                (click)="selectPermissionTier(tier.id)"
                [class.border-teal-500]="userProfile().permissionTier === tier.id"
                [class.bg-teal-950/40]="userProfile().permissionTier === tier.id"
                [class.text-white]="userProfile().permissionTier === tier.id"
                [class.border-zinc-800]="userProfile().permissionTier !== tier.id"
                [class.text-zinc-300]="userProfile().permissionTier !== tier.id"
                class="w-full text-left p-2 rounded-md border text-xs transition-all hover:bg-zinc-800 min-h-[44px]"
                [attr.aria-pressed]="userProfile().permissionTier === tier.id">
                <span class="font-medium block">{{ tier.label }}</span>
                <span class="text-[10px] text-zinc-400">{{ tier.description }}</span>
              </button>
            }
          </div>
        </div>

      </div>

      <!-- Action Plan Generation Trigger -->
      <div class="mt-4 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-xs text-zinc-400">
          <span>🌿 Prescribed Daily Target:</span>
          <span class="font-mono font-bold text-emerald-400">{{ userProfile().prescribedMinutesDaily }} min biophilic green exposure</span>
        </div>
        <button
          type="button"
          (click)="computeRoute()"
          class="min-h-[44px] px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400">
          Compute Optimized Route Plan
        </button>
      </div>

    </div>
  `
})
export class AdaptiveGreenRoutingHudComponent {
  private readonly routingService = inject(AdaptiveGreenRoutingService);

  readonly userProfile = this.routingService.userAccessProfile;
  readonly isNavigating = this.routingService.isNavigating;
  readonly isSanctuaryActive = this.routingService.isSanctuaryActive;
  readonly activePlan = this.routingService.activeRoutePlan;
  readonly currentStep = this.routingService.currentStep;
  readonly currentStepIndex = this.routingService.currentStepIndex;

  readonly activeSensoryMode = computed(() => this.userProfile().cognitive.sensoryMode);

  readonly cognitiveModes: { id: CognitiveSensoryMode; label: string; description: string; emoji: string }[] = [
    { id: 'STANDARD', label: 'Biophilic Green', description: 'Maximizes tree canopy & sunshine', emoji: '🌲' },
    { id: 'SENSORY_SHIELD', label: 'Sensory Shielded', description: 'Acoustic < 50 dBA & low crowd', emoji: '🧘' },
    { id: 'LANDMARK_ANCHORED', label: 'Landmark Anchored', description: 'Low turns & visual waypoints', emoji: '🧭' }
  ];

  readonly permissionTiers: { id: AccessPermissionTier; label: string; description: string }[] = [
    { id: 'PRIVATE_AUTONOMOUS', label: 'Private Autonomous', description: '100% On-device, zero remote location egress' },
    { id: 'CAREGIVER_GEOFENCE', label: 'Caregiver Geofence', description: 'Passive arrival notification to family' },
    { id: 'CLINICIAN_RX', label: 'Clinician Green Rx', description: 'Tracks prescribed outdoor minutes' }
  ];

  selectCognitiveMode(mode: CognitiveSensoryMode): void {
    this.routingService.updateAccessProfile({ cognitive: { ...this.userProfile().cognitive, sensoryMode: mode } });
  }

  selectPermissionTier(tier: AccessPermissionTier): void {
    this.routingService.updateAccessProfile({ permissionTier: tier });
  }

  toggleWheelchair(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.routingService.updateAccessProfile({ physical: { ...this.userProfile().physical, wheelchairAccessible: checked } });
  }

  togglePavement(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.routingService.updateAccessProfile({ physical: { ...this.userProfile().physical, pavementRequirement: checked ? 'SMOOTH_PAVED_ONLY' : 'ALL' } });
  }

  computeRoute(): void {
    this.routingService.computeOptimizedRoute(
      { lat: 37.7749, lng: -122.4194 },
      { lat: 37.7849, lng: -122.4094 }
    );
    this.routingService.isNavigating.set(true);
  }

  triggerEmergencySanctuary(): void {
    this.routingService.triggerEmergencySanctuary();
  }

  nextStep(): void {
    this.routingService.nextStep();
  }

  cancelNavigation(): void {
    this.routingService.cancelNavigation();
  }
}
