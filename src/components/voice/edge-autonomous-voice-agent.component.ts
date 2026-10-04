// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  EdgeAutonomousVoiceAgentService,
  IQueuedOfflineFhirBundle,
  ISbarSynthesisResult,
  EdgeEngineType
} from '../../services/voice/edge-autonomous-voice-agent.service';

interface ISampleDialogue {
  title: string;
  badge: string;
  badgeClass: string;
  transcript: string;
}

@Component({
  selector: 'app-edge-autonomous-voice-agent',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full max-w-6xl mx-auto bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl p-6 sm:p-7 font-mono relative overflow-hidden"
         role="region"
         aria-label="Edge Autonomous Offline Voice Agent Console">
      <!-- Ambient Backlight -->
      <div class="absolute -top-32 -right-32 w-80 h-80 bg-teal-500/10 blur-3xl rounded-full pointer-events-none"></div>
      <div class="absolute -bottom-32 -left-32 w-80 h-80 bg-sky-500/10 blur-3xl rounded-full pointer-events-none"></div>

      <!-- Header Section -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-5 mb-6 relative z-10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center justify-center text-xl shadow-xs">
            🎙️
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="text-base font-black text-zinc-100 uppercase tracking-wider">
                Edge Autonomous Voice Agent
              </h2>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                100% Air-Gapped Local SLM
              </span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
                {{ engineDisplayName() }}
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-sans mt-0.5">
              Zero-Cloud Egress Voice Scribing • ISMP Medication Safety Intercept • Store-and-Forward FHIR R4 Bundle Queue
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Air Gap Network Blackout Switcher -->
          <button type="button"
                  (click)="toggleAirGap()"
                  [class.bg-red-500-20]="service.isAirGapped()"
                  [class.border-red-500-50]="service.isAirGapped()"
                  [class.text-red-300]="service.isAirGapped()"
                  [class.bg-zinc-900]="!service.isAirGapped()"
                  [class.border-zinc-700]="!service.isAirGapped()"
                  [class.text-zinc-300]="!service.isAirGapped()"
                  class="px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer min-h-[44px] flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400"
                  [attr.aria-pressed]="service.isAirGapped()"
                  aria-label="Toggle Simulated Air-Gap Wi-Fi Blackout">
            <span class="w-2.5 h-2.5 rounded-full"
                  [class.bg-red-400]="service.isAirGapped()"
                  [class.bg-emerald-400]="!service.isAirGapped()"
                  [class.animate-pulse]="service.isAirGapped()"></span>
            <span>{{ service.isAirGapped() ? 'AIR-GAP BLACKOUT (ACTIVE)' : 'WI-FI ONLINE' }}</span>
          </button>

          <!-- Close Modal Button -->
          <button type="button"
                  (click)="close.emit()"
                  aria-label="Close Edge Autonomous Voice Agent Console"
                  class="w-11 h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition min-h-[44px] min-w-[44px] focus-visible:ring-2 focus-visible:ring-teal-400">
            ✕
          </button>
        </div>
      </div>

      <!-- Telemetry Ribbon -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div class="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5">
          <div class="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Substrate Egress</div>
          <div class="text-xs font-bold text-emerald-300 mt-1 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            0 Cloud Packets (Safe Harbor)
          </div>
          <div class="text-[10px] text-zinc-500 font-sans mt-0.5">HIPAA §164.514 Air-Gapped</div>
        </div>

        <div class="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5">
          <div class="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Hardware Root of Trust</div>
          <div class="text-xs font-bold text-teal-300 mt-1 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-teal-400"></span>
            Titan M2 / Apple Enclave
          </div>
          <div class="text-[10px] text-zinc-500 font-sans mt-0.5">IEEE P2933™ TIPPSS Trust</div>
        </div>

        <div class="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5">
          <div class="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">ISMP Safety Intercept</div>
          <div class="text-xs font-bold text-sky-300 mt-1">Zero Naked / Trailing Decimals</div>
          <div class="text-[10px] text-zinc-500 font-sans mt-0.5">FDA High-Risk Med Guard</div>
        </div>

        <div class="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5">
          <div class="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Offline FHIR Cache</div>
          <div class="text-xs font-bold text-amber-300 mt-1">
            {{ service.pendingSyncCount() }} Bundles Queued
          </div>
          <div class="text-[10px] text-zinc-500 font-sans mt-0.5">Store &amp; Forward to Epic</div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-2 border-b border-zinc-800/80 pb-3 mb-6" role="tablist">
        <button type="button"
                role="tab"
                [attr.aria-selected]="activeTab() === 'SCRIBE'"
                (click)="activeTab.set('SCRIBE')"
                [class.bg-teal-600]="activeTab() === 'SCRIBE'"
                [class.text-white]="activeTab() === 'SCRIBE'"
                [class.bg-zinc-900]="activeTab() !== 'SCRIBE'"
                [class.text-zinc-400]="activeTab() !== 'SCRIBE'"
                class="px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer min-h-[44px] flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400">
          <span>🎙️</span>
          <span>Live Scribe &amp; Local SLM</span>
        </button>

        <button type="button"
                role="tab"
                [attr.aria-selected]="activeTab() === 'QUEUE'"
                (click)="activeTab.set('QUEUE')"
                [class.bg-teal-600]="activeTab() === 'QUEUE'"
                [class.text-white]="activeTab() === 'QUEUE'"
                [class.bg-zinc-900]="activeTab() !== 'QUEUE'"
                [class.text-zinc-400]="activeTab() !== 'QUEUE'"
                class="px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer min-h-[44px] flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400">
          <span>📦</span>
          <span>Offline FHIR Queue</span>
          @if (service.pendingSyncCount() > 0) {
            <span class="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500/20 text-amber-300 font-bold">
              {{ service.pendingSyncCount() }}
            </span>
          }
        </button>

        @if (selectedBundle()) {
          <button type="button"
                  role="tab"
                  [attr.aria-selected]="activeTab() === 'RAW_BUNDLE'"
                  (click)="activeTab.set('RAW_BUNDLE')"
                  [class.bg-teal-600]="activeTab() === 'RAW_BUNDLE'"
                  [class.text-white]="activeTab() === 'RAW_BUNDLE'"
                  [class.bg-zinc-900]="activeTab() !== 'RAW_BUNDLE'"
                  [class.text-zinc-400]="activeTab() !== 'RAW_BUNDLE'"
                  class="px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer min-h-[44px] flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400">
            <span>🔍</span>
            <span>Raw Bundle: {{ selectedBundle()?.id }}</span>
          </button>
        }
      </div>

      <!-- TAB 1: LIVE SCRIBE & SLM -->
      @if (activeTab() === 'SCRIBE') {
        <div class="space-y-6">
          <!-- Voice Recorder & Audio Visualizer VU Meter -->
          <div class="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
            <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div class="flex items-center gap-3">
                <button type="button"
                        (click)="toggleListening()"
                        [class.bg-red-600]="service.isListening()"
                        [class.hover:bg-red-500]="service.isListening()"
                        [class.bg-teal-600]="!service.isListening()"
                        [class.hover:bg-teal-500]="!service.isListening()"
                        class="px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-lg transition cursor-pointer min-h-[44px] flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400"
                        [attr.aria-pressed]="service.isListening()">
                  @if (service.isListening()) {
                    <span class="w-3 h-3 rounded-xs bg-white animate-pulse"></span>
                    <span>STOP RECORDING</span>
                  } @else {
                    <span class="w-3 h-3 rounded-full bg-red-400 animate-ping"></span>
                    <span>START EDGE SCRIBING</span>
                  }
                </button>

                <div class="text-xs text-zinc-400">
                  Status:
                  <span class="font-bold" [class.text-red-400]="service.isListening()" [class.text-zinc-500]="!service.isListening()">
                    {{ service.isListening() ? 'LISTENING (LOCAL AUDIO STREAM)' : 'STANDBY' }}
                  </span>
                </div>
              </div>

              <!-- VU Meter Audio Visualizer -->
              <div class="flex items-center gap-1.5 bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-800/80"
                   role="meter"
                   [attr.aria-valuenow]="service.liveAudioLevel()"
                   aria-valuemin="0"
                   aria-valuemax="100"
                   aria-label="Microphone Live Volume VU Meter">
                <span class="text-[10px] text-zinc-500 uppercase tracking-widest mr-1">VU</span>
                @for (bar of vuBars; track bar) {
                  <span class="w-1.5 h-6 rounded-xs transition-all duration-75"
                        [class.bg-zinc-800]="service.liveAudioLevel() < bar"
                        [class.bg-teal-400]="service.liveAudioLevel() >= bar && bar <= 60"
                        [class.bg-amber-400]="service.liveAudioLevel() >= bar && bar > 60 && bar <= 80"
                        [class.bg-red-400]="service.liveAudioLevel() >= bar && bar > 80"></span>
                }
                <span class="text-xs font-mono font-bold text-teal-300 ml-2 w-8 tabular-nums">
                  {{ service.liveAudioLevel() }}%
                </span>
              </div>
            </div>

            <!-- Quick Load Sample Clinical Dialogues -->
            <div class="border-t border-zinc-800/60 pt-4">
              <div class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Simulate Clinical Dialogue Presets (With ISMP Pitfalls)
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                @for (sample of sampleDialogues; track sample.title) {
                  <button type="button"
                          (click)="loadSample(sample.transcript)"
                          class="p-2.5 rounded-xl bg-zinc-950/70 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 text-left transition cursor-pointer min-h-[44px] flex flex-col justify-between group focus-visible:ring-2 focus-visible:ring-teal-400">
                    <div class="flex items-center justify-between gap-1 mb-1">
                      <span class="text-xs font-bold text-zinc-200 group-hover:text-teal-300">
                        {{ sample.title }}
                      </span>
                      <span class="text-[9px] font-bold px-1.5 py-0.2 rounded-full border"
                            [ngClass]="sample.badgeClass">
                        {{ sample.badge }}
                      </span>
                    </div>
                    <span class="text-[10px] text-zinc-500 font-sans line-clamp-1">
                      {{ sample.transcript }}
                    </span>
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- Transcript Stream & Synthesis Controls -->
          <div class="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Edge Clinical Transcript Buffer
                </span>
                <span class="text-[10px] text-zinc-500">
                  ({{ transcriptWordCount() }} words)
                </span>
              </div>

              <div class="flex items-center gap-2">
                <button type="button"
                        (click)="clearTranscript()"
                        [disabled]="!fullTranscriptText()"
                        class="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition min-h-[44px]">
                  Clear Buffer
                </button>

                <button type="button"
                        (click)="synthesizeSbar()"
                        [disabled]="!fullTranscriptText() || service.isProcessing()"
                        class="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md transition cursor-pointer min-h-[44px] flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400">
                  @if (service.isProcessing()) {
                    <span class="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    <span>Synthesizing at Edge...</span>
                  } @else {
                    <span>⚡ Synthesize SBAR &amp; Queue to FHIR</span>
                  }
                </button>
              </div>
            </div>

            <!-- Transcript Text Area / Stream Display -->
            <div class="relative">
              <textarea
                [ngModel]="fullTranscriptText()"
                (ngModelChange)="onTranscriptChange($event)"
                rows="4"
                placeholder="Spoken words will appear here in real-time without cloud egress... or choose a sample scenario above."
                aria-label="Clinical Transcript Stream"
                class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-teal-500 font-mono transition leading-relaxed"></textarea>
            </div>
          </div>

          <!-- Synthesized SBAR Note Card with ISMP Medication Intercept -->
          @if (service.lastSynthesis(); as sbar) {
            <div class="bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Synthesized SBAR Note
                  </span>
                  <span class="text-[10px] text-zinc-400 font-sans">
                    • Latency: {{ sbar.executionLatencyMs }}ms • Tokens: {{ sbar.tokensProcessed }}
                  </span>
                </div>

                <!-- ISMP Intercept Badge -->
                @if (sbar.ismpAudit.violationsCount > 0) {
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    🛡️ ISMP Guard Intercepted {{ sbar.ismpAudit.violationsCount }} High-Risk Decimals
                  </span>
                } @else {
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center gap-1">
                    ✓ ISMP Safety Verified (Zero Naked / Trailing Decimals)
                  </span>
                }
              </div>

              <!-- SBAR Quadrants -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div class="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80">
                  <div class="text-[10px] uppercase font-bold text-sky-400 tracking-wider mb-1">
                    [S] Situation
                  </div>
                  <div class="text-zinc-200 leading-relaxed font-sans">{{ sbar.situation }}</div>
                </div>

                <div class="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80">
                  <div class="text-[10px] uppercase font-bold text-teal-400 tracking-wider mb-1">
                    [B] Background
                  </div>
                  <div class="text-zinc-200 leading-relaxed font-sans">{{ sbar.background }}</div>
                </div>

                <div class="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80">
                  <div class="text-[10px] uppercase font-bold text-amber-400 tracking-wider mb-1">
                    [A] Assessment
                  </div>
                  <div class="text-zinc-200 leading-relaxed font-sans">{{ sbar.assessment }}</div>
                </div>

                <div class="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80">
                  <div class="text-[10px] uppercase font-bold text-emerald-400 tracking-wider mb-1">
                    [R] Recommendation
                  </div>
                  <div class="text-zinc-200 leading-relaxed font-sans">{{ sbar.recommendation }}</div>
                </div>
              </div>

              <!-- ISMP Corrections Detail (if any) -->
              @if (sbar.ismpAudit.violationsCount > 0) {
                <div class="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3 text-xs">
                  <div class="text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>ISMP Prohibited Decimals Sanitized Before FHIR Storing</span>
                  </div>
                  <div class="space-y-1">
                    @for (v of sbar.ismpAudit.violations; track v.original) {
                      <div class="flex items-center gap-2 text-[11px] font-mono text-zinc-300">
                        <span class="line-through text-red-400">{{ v.original }}</span>
                        <span class="text-zinc-500">→</span>
                        <span class="text-emerald-400 font-bold">{{ v.corrected }}</span>
                        <span class="text-zinc-500 text-[10px]">({{ v.rule }})</span>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- TAB 2: OFFLINE FHIR QUEUE (STORE & FORWARD) -->
      @if (activeTab() === 'QUEUE') {
        <div class="space-y-5">
          <!-- Queue Header & Flush Button -->
          <div class="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
            <div>
              <div class="text-sm font-bold text-zinc-100">
                Air-Gapped Store-and-Forward FHIR R4 Bundle Queue
              </div>
              <div class="text-xs text-zinc-400 font-sans mt-0.5">
                Bundles are sealed locally with SHA-256 and held until hospital network connection is restored.
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button type="button"
                      (click)="clearAllQueue()"
                      [disabled]="service.queuedBundles().length === 0"
                      class="px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition min-h-[44px]">
                Clear Local Queue
              </button>

              <button type="button"
                      (click)="flushQueueToEhr()"
                      [disabled]="service.pendingSyncCount() === 0 || isFlushing()"
                      class="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md transition cursor-pointer min-h-[44px] flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400">
                @if (isFlushing()) {
                  <span class="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  <span>Flushing to Epic/Cerner...</span>
                } @else {
                  <span>⚡ Flush &amp; Synchronize to EHR ({{ service.pendingSyncCount() }})</span>
                }
              </button>
            </div>
          </div>

          <!-- Feedback Alert -->
          @if (flushMessage()) {
            <div class="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-xl text-xs text-emerald-300 flex items-center justify-between"
                 role="alert"
                 aria-live="polite">
              <span>{{ flushMessage() }}</span>
              <button type="button"
                      (click)="flushMessage.set(null)"
                      class="text-emerald-400 hover:text-white cursor-pointer px-2 min-h-[30px]">
                ✕
              </button>
            </div>
          }

          <!-- Queued Bundles List -->
          @if (service.queuedBundles().length === 0) {
            <div class="p-8 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-2xl text-xs font-sans">
              No offline bundles in local storage. Start an edge voice scribing session to synthesize and queue FHIR notes.
            </div>
          } @else {
            <div class="space-y-3">
              @for (bundle of service.queuedBundles(); track bundle.id) {
                <div class="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 hover:border-zinc-700 transition">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-xs font-bold text-zinc-200">{{ bundle.id }}</span>
                      @if (bundle.status === 'QUEUED_FOR_EHR_RECONNECT') {
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          QUEUED OFFLINE
                        </span>
                      } @else if (bundle.status === 'SYNCED_TO_EHR') {
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          SYNCED TO EHR
                        </span>
                      } @else {
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                          FAILED
                        </span>
                      }
                      <span class="text-[10px] text-zinc-500">
                        {{ bundle.queuedAt | date:'mediumTime' }}
                      </span>
                    </div>

                    <div class="text-xs text-zinc-400 font-sans">
                      Patient: <span class="text-zinc-200 font-mono">{{ bundle.patientName }} ({{ bundle.patientMrn }})</span> •
                      Encounter: <span class="text-zinc-200 font-mono">{{ bundle.encounterId }}</span> •
                      Engine: <span class="text-teal-300">{{ bundle.engineUsed }}</span>
                    </div>

                    <div class="text-[11px] text-zinc-400 font-sans line-clamp-1 italic">
                      "{{ bundle.sbarText }}"
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <button type="button"
                            (click)="viewRawBundle(bundle)"
                            class="px-3 py-1.5 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-teal-300 border border-zinc-700 rounded-xl cursor-pointer transition min-h-[44px] focus-visible:ring-2 focus-visible:ring-teal-400">
                      Inspect Bundle
                    </button>

                    <button type="button"
                            (click)="deleteBundle(bundle.id)"
                            aria-label="Delete offline bundle"
                            class="w-10 h-10 rounded-xl bg-zinc-950 hover:bg-red-950/40 border border-zinc-800 hover:border-red-800/60 text-zinc-500 hover:text-red-400 flex items-center justify-center cursor-pointer transition min-h-[44px] min-w-[44px] focus-visible:ring-2 focus-visible:ring-red-400">
                      🗑️
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- TAB 3: RAW BUNDLE VIEWER -->
      @if (activeTab() === 'RAW_BUNDLE' && selectedBundle(); as bundle) {
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-zinc-200">
                USCDI v4 FHIR R4 Bundle ({{ bundle.id }})
              </span>
              <span class="text-[10px] text-zinc-400 font-mono">
                SHA-256: {{ bundle.sha256AttestationSeal }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <button type="button"
                      (click)="copyRawJson(bundle.bundle)"
                      class="px-3 py-1.5 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl cursor-pointer transition min-h-[44px] flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-400">
                <span>{{ copied() ? '✓ Copied!' : '📋 Copy JSON' }}</span>
              </button>
              <button type="button"
                      (click)="activeTab.set('QUEUE')"
                      class="px-3 py-1.5 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl cursor-pointer transition min-h-[44px]">
                Back to Queue
              </button>
            </div>
          </div>

          <pre class="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-[11px] text-teal-300 font-mono max-h-96 overflow-y-auto leading-relaxed select-all">
{{ rawJsonDisplay() }}
          </pre>
        </div>
      }
    </div>
  `
})
export class EdgeAutonomousVoiceAgentComponent {
  readonly service = inject(EdgeAutonomousVoiceAgentService);

  readonly close = output<void>();

  // State Signals
  readonly activeTab = signal<'SCRIBE' | 'QUEUE' | 'RAW_BUNDLE'>('SCRIBE');
  readonly selectedBundle = signal<IQueuedOfflineFhirBundle | null>(null);
  readonly flushMessage = signal<string | null>(null);
  readonly isFlushing = signal<boolean>(false);
  readonly copied = signal<boolean>(false);
  readonly manualTranscript = signal<string>('');

  // 12-segment VU Meter thresholds
  readonly vuBars = [8, 16, 25, 33, 41, 50, 58, 66, 75, 83, 91, 100];

  // Sample Dialogues
  readonly sampleDialogues: ISampleDialogue[] = [
    {
      title: 'ISMP Med Guard Demo',
      badge: 'Trailing Decimals',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      transcript: 'Patient presenting for type 2 diabetes and hypertension followup. Currently taking Metformin 500.0 mg PO BID and Lisinopril .5 mg daily. Reports occasional morning dizziness. Blood pressure today 138/84 mmHg, HR 72 bpm regular. Recommend continuing Metformin 500 mg BID, adjusting Lisinopril to 0.5 mg daily with hydration guidance.'
    },
    {
      title: 'Conformal Sepsis Escalation',
      badge: 'STAT Alert',
      badgeClass: 'bg-red-500/20 text-red-300 border-red-500/30',
      transcript: 'Bedside telemetry consult for post-operative patient in room 412. Tachycardic at 118 bpm, temperature 38.6 C, MAP 64 mmHg. Conformal sepsis risk interval computed at 88% to 94% probability. Suspected urosepsis. STAT blood cultures drawn, initiating 30 mL/kg crystalloid resuscitation and empiric broad-spectrum antibiotic coverage.'
    },
    {
      title: 'Geriatric Polypharmacy',
      badge: 'Fall Risk',
      badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      transcript: '78-year-old patient accompanied by daughter for medication reconciliation. Reviewing 8 active prescriptions including Zolpidem 10.0 mg QHS and Lorazepam .5 mg PRN anxiety. Patient experienced near-syncope yesterday. ISMP high-risk sedative review conducted. Recommend tapering Zolpidem to 5 mg and discontinuing daytime Lorazepam.'
    }
  ];

  readonly engineDisplayName = computed(() => {
    const engine = this.service.activeEngine();
    switch (engine) {
      case 'GEMMA_4_DEV_TRIAL':
        return 'Gemma 4 Dev Trial (Chrome Built-in AI)';
      case 'WEBGPU_SLM':
        return 'WebGPU SLM (On-Device Transformer)';
      case 'DETERMINISTIC_EDGE_PARSER':
      default:
        return 'Deterministic Edge Clinical Parser';
    }
  });

  readonly fullTranscriptText = computed(() => {
    if (this.manualTranscript()) {
      return this.manualTranscript();
    }
    const finalized = this.service.finalizedTranscript();
    const live = this.service.liveTranscript();
    return finalized ? `${finalized} ${live}`.trim() : live;
  });

  readonly transcriptWordCount = computed(() => {
    const text = this.fullTranscriptText().trim();
    return text ? text.split(/\s+/).length : 0;
  });

  readonly rawJsonDisplay = computed(() => {
    const bundle = this.selectedBundle();
    if (!bundle) return '';
    return JSON.stringify(bundle.bundle, null, 2);
  });

  public toggleListening(): void {
    if (this.service.isListening()) {
      this.service.stopVoiceSession();
    } else {
      this.service.startVoiceSession();
    }
  }

  public toggleAirGap(): void {
    this.service.toggleAirGapSimulation();
  }

  public loadSample(text: string): void {
    this.manualTranscript.set(text);
    this.service.clearTranscript();
    this.service.appendTranscript(text);
  }

  public clearTranscript(): void {
    this.manualTranscript.set('');
    this.service.clearTranscript();
  }

  public onTranscriptChange(val: string): void {
    this.manualTranscript.set(val);
  }

  public async synthesizeSbar(): Promise<void> {
    const text = this.fullTranscriptText();
    if (!text) return;
    try {
      await this.service.synthesizeSbarAndQueue(text);
    } catch (err: any) {
      console.error('[EdgeAutonomousVoiceAgentComponent] SBAR synthesis error:', err);
    }
  }

  public async flushQueueToEhr(): Promise<void> {
    this.isFlushing.set(true);
    this.flushMessage.set(null);
    try {
      const res = await this.service.flushQueueToEhr();
      this.flushMessage.set(
        `Successfully synchronized ${res.syncedCount} offline FHIR bundle(s) to EHR. (Failures: ${res.failedCount})`
      );
    } catch (err: any) {
      this.flushMessage.set(`EHR synchronization failed: ${err?.message || 'Unknown error'}`);
    } finally {
      this.isFlushing.set(false);
    }
  }

  public clearAllQueue(): void {
    this.service.clearOfflineQueue();
    this.selectedBundle.set(null);
    if (this.activeTab() === 'RAW_BUNDLE') {
      this.activeTab.set('QUEUE');
    }
  }

  public deleteBundle(id: string): void {
    this.service.removeQueuedBundle(id);
    if (this.selectedBundle()?.id === id) {
      this.selectedBundle.set(null);
      this.activeTab.set('QUEUE');
    }
  }

  public viewRawBundle(bundle: IQueuedOfflineFhirBundle): void {
    this.selectedBundle.set(bundle);
    this.activeTab.set('RAW_BUNDLE');
  }

  public copyRawJson(bundleObj: any): void {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(JSON.stringify(bundleObj, null, 2));
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      }
    } catch (e) {
      console.error('[EdgeAutonomousVoiceAgentComponent] Clipboard copy failed:', e);
    }
  }
}
