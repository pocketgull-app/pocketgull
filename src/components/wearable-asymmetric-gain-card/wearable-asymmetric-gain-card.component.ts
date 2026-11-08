// SPDX-License-Identifier: Apache-2.0
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  WearableAsymmetricGainService,
  TWatchPlatform,
} from '../../services/wearable-asymmetric-gain.service';

@Component({
  selector: 'app-wearable-asymmetric-gain-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="shock-trooper-card"
      aria-labelledby="shock-trooper-title"
      role="region"
    >
      <header class="card-header">
        <div>
          <span class="eyebrow-badge">
            IEEE P2933™ TIPPSS • ASYMMETRIC CLINICAL GAIN
          </span>
          <h3 id="shock-trooper-title" class="card-title">
            Wearable Vanguard ("Shock Trooper") Readiness Loop
          </h3>
        </div>

        <div class="platform-toggle" role="group" aria-label="Watch Platform Selection">
          <button
            type="button"
            class="platform-btn"
            [class.active]="telemetry().watchPlatform === 'apple_watch_healthkit'"
            (click)="setPlatform('apple_watch_healthkit')"
          >
            Apple Watch (HealthKit)
          </button>
          <button
            type="button"
            class="platform-btn"
            [class.active]="telemetry().watchPlatform === 'android_wear_health_connect'"
            (click)="setPlatform('android_wear_health_connect')"
          >
            Android Wear OS (Health Connect)
          </button>
        </div>
      </header>

      <!-- Top Summary KPI Strip (4-Slot Working Memory Ceiling) -->
      <div class="kpi-grid">
        <article class="kpi-tile primary-dividend">
          <span class="kpi-label">Total Readiness Gain</span>
          <strong class="kpi-value" dir="ltr">
            +{{ evaluation().totalShockTrooperReadinessGain | number:'1.1-1' }}
            <small>pts</small>
          </strong>
          <span class="kpi-sub">
            <bdi dir="ltr">~{{ evaluation().estimatedPemCrashHoursSaved }}h</bdi>
            PEM Crash Shielded (72h)
          </span>
        </article>

        <article class="kpi-tile">
          <span class="kpi-label">1. What You Are Doing</span>
          <strong class="kpi-value" dir="ltr">
            +{{ evaluation().doingHormeticVagalGain | number:'1.1-1' }}%
          </strong>
          <span class="kpi-sub">
            {{ evaluation().pillarBreakdown.doingActionDividend }}
          </span>
        </article>

        <article class="kpi-tile">
          <span class="kpi-label">2. What You Are Feeling</span>
          <strong class="kpi-value" dir="ltr">
            +{{ evaluation().feelingInteroceptiveCalibrationGain | number:'1.1-1' }}%
          </strong>
          <span class="kpi-sub">
            {{ evaluation().pillarBreakdown.feelingInteroceptionRadar }}
          </span>
        </article>

        <article class="kpi-tile">
          <span class="kpi-label">3. What You Are NOT Doing</span>
          <strong class="kpi-value" dir="ltr">
            +{{ evaluation().notDoingRestraintPemShieldGain | number:'1.1-1' }}%
          </strong>
          <span class="kpi-sub">
            {{ evaluation().pillarBreakdown.notDoingRestraintShield }}
          </span>
        </article>
      </div>

      <!-- Interactive Pacing & Restraint Controls -->
      <div class="controls-row">
        <label class="control-item">
          <span>0.1 Hz Paced Breathing (min): <bdi dir="ltr">{{ telemetry().pacedBreathingMinutes }}m</bdi></span>
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            [value]="telemetry().pacedBreathingMinutes"
            (input)="onBreathingChange($event)"
          />
        </label>

        <label class="control-item">
          <span>Post-Meal Walk (min): <bdi dir="ltr">{{ telemetry().postMealWalkMinutes }}m</bdi></span>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            [value]="telemetry().postMealWalkMinutes"
            (input)="onWalkChange($event)"
          />
        </label>

        <label class="control-item">
          <span>Monk Skin Tone (MST 1–10): <bdi dir="ltr">MST-{{ telemetry().monkSkinToneScale }}</bdi></span>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            [value]="telemetry().monkSkinToneScale"
            (input)="onMstChange($event)"
          />
        </label>

        <button
          type="button"
          class="restraint-toggle"
          [class.shield-active]="telemetry().stoppedBeforeExhaustion"
          (click)="toggleRestraintStop()"
        >
          {{
            telemetry().stoppedBeforeExhaustion
              ? 'PEM Pacing Stop Honored (1.12x Gain)'
              : 'Pushed Past Exhaustion (0.85x Penalty)'
          }}
        </button>
      </div>

      <footer class="coaching-banner" role="status">
        <strong>Quiet Workshop Insight:</strong>
        {{ evaluation().seligman3pCoachingInsight }}
      </footer>
    </section>
  `,
  styles: [
    `
      .shock-trooper-card {
        box-sizing: border-box;
        max-width: 100%;
        overflow-wrap: anywhere;
        word-break: break-word;
        background: var(--surface-elevated, #141013);
        color: var(--text-primary, #ede3d2);
        border: 1px solid rgba(237, 227, 210, 0.16);
        border-radius: 12px;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .card-header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: flex-start;
        gap: 0.75rem;
      }
      .eyebrow-badge {
        display: inline-block;
        font-size: 0.75rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #a8d5ba;
        margin-bottom: 0.25rem;
      }
      .card-title {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 600;
      }
      .platform-toggle {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .platform-btn,
      .restraint-toggle {
        min-height: 44px;
        padding: 0.5rem 0.85rem;
        border-radius: 8px;
        border: 1px solid rgba(237, 227, 210, 0.24);
        background: rgba(255, 255, 255, 0.04);
        color: inherit;
        cursor: pointer;
        font-size: 0.85rem;
      }
      .platform-btn.active,
      .restraint-toggle.shield-active {
        background: rgba(168, 213, 186, 0.18);
        border-color: #a8d5ba;
        color: #ede3d2;
      }
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.75rem;
      }
      .kpi-tile {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(237, 227, 210, 0.12);
        border-radius: 10px;
        padding: 0.85rem;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      .kpi-tile.primary-dividend {
        border-color: rgba(168, 213, 186, 0.45);
        background: rgba(168, 213, 186, 0.08);
      }
      .kpi-label {
        font-size: 0.78rem;
        opacity: 0.85;
      }
      .kpi-value {
        font-size: 1.45rem;
        font-variant-numeric: tabular-nums slashed-zero;
        color: #a8d5ba;
      }
      .kpi-sub {
        font-size: 0.78rem;
        line-height: 1.35;
        opacity: 0.9;
      }
      .controls-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
        gap: 0.75rem;
        align-items: center;
      }
      .control-item {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        font-size: 0.82rem;
      }
      .coaching-banner {
        padding: 0.75rem 1rem;
        border-radius: 8px;
        background: rgba(237, 227, 210, 0.06);
        border-left: 3px solid #a8d5ba;
        font-size: 0.88rem;
        line-height: 1.45;
      }
    `,
  ],
})
export class WearableAsymmetricGainCardComponent {
  private readonly gainService = inject(WearableAsymmetricGainService);

  readonly telemetry = this.gainService.telemetry;
  readonly evaluation = this.gainService.gainEvaluation;

  setPlatform(platform: TWatchPlatform): void {
    this.gainService.switchWatchPlatform(platform);
  }

  onBreathingChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.gainService.updateTelemetry({ pacedBreathingMinutes: val });
  }

  onWalkChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.gainService.updateTelemetry({ postMealWalkMinutes: val });
  }

  onMstChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.gainService.updateTelemetry({ monkSkinToneScale: val });
  }

  toggleRestraintStop(): void {
    this.gainService.updateTelemetry({
      stoppedBeforeExhaustion: !this.telemetry().stoppedBeforeExhaustion,
    });
  }
}
