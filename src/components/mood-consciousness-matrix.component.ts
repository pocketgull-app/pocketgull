import { Component, ChangeDetectionStrategy, signal, computed, inject, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { ActuarialGleeAudioService } from '../services/actuarial-glee-audio.service';
import { FloatingWaterConsciousnessComponent } from './floating-water-consciousness.component';
import { SocialHealthGravitationComponent } from './social-health-gravitation.component';

export interface IConsciousnessState {
  id: 'focus' | 'calm' | 'sleep' | 'creativity' | 'grounding';
  name: string;
  subtitle: string;
  emoji: string;
  color: string;
  gradientBg: string;
  borderColor: string;
  glowColor: string;
  accentText: string;
  pillBg: string;
  targetEEG: string;
  targetNeurotransmitters: string[];
  prescribedMeal: {
    emoji: string;
    name: string;
    activeCompounds: string;
  };
  avsTarget: {
    frequencyHz: number;
    waveType: 'Gamma' | 'Beta' | 'Alpha' | 'Theta' | 'Delta';
    breathingRateBpm: number;
  };
  hawkinsCalibration: number;
  solfeggioHz: number;
  opticalWavelengthNm: number;
  tcmWuXingElement: string;
  ayurvedicChakra: string;
  clinicalRationale: string;
  tcmShenStatus: string;
  ayurvedicGuna: 'Sattva (Purity)' | 'Rajas (Action)' | 'Tamas (Rest)';
}

@Component({
  selector: 'app-mood-consciousness-matrix',
  standalone: true,
  imports: [
    CommonModule,
    FloatingWaterConsciousnessComponent,
    SocialHealthGravitationComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full mb-10 p-6 sm:p-10 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl font-sans relative overflow-hidden transition-all duration-700 pocket-gull-card">

      <!-- Dynamic Ambient Glow Backdrops -->
      <div [class]="'absolute -top-32 -right-32 w-[32rem] h-[32rem] rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-25 ' + stateTheme().glowBg"></div>
      <div [class]="'absolute -bottom-32 -left-32 w-[32rem] h-[32rem] rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-20 ' + stateTheme().glowSecondary"></div>
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100/40 via-zinc-900/20 to-transparent dark:from-zinc-900/40 dark:via-zinc-950/80 dark:to-zinc-950 pointer-events-none"></div>

      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-6 mb-8 relative z-10 font-mono">
        <div>
          <div class="flex flex-wrap items-center gap-3">
            <span [class]="'w-3.5 h-3.5 rounded-full shadow-lg animate-pulse transition-colors duration-500 ' + stateTheme().dotBg + ' ' + stateTheme().dotShadow"></span>
            <h2 class="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <span>🔮</span>
              <span>Neuro-Consciousness & Mood Optimization Matrix</span>
            </h2>
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-[#8B5CF6] text-white font-mono font-extrabold uppercase border border-[#1C1C1C] shadow-[1px_1px_0px_0px_rgba(28,28,28,0.9)]">
              Gulliver 🔭 AVS Guide
            </span>
            <span [class]="'text-xs font-extrabold px-3 py-1 rounded-full border uppercase tracking-wider transition-colors duration-500 ' + stateTheme().pillBg + ' ' + stateTheme().accentText + ' ' + stateTheme().borderColor">
              Multimodal Mind-State Engine
            </span>
          </div>
          <p class="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-2 font-sans max-w-3xl leading-relaxed">
            Calibrate AVS cortical entrainment, dietary micro-dosing, and neuro-biomarker pathways targeted for <strong class="text-zinc-900 dark:text-white font-extrabold uppercase">{{ activePatientName() }}</strong>.
          </p>
        </div>

        <div class="text-right text-xs sm:text-sm font-mono shrink-0">
          <span class="text-zinc-500 dark:text-zinc-400 block text-xs uppercase tracking-widest font-semibold">Active State Protocol</span>
          <span [class]="'text-base font-black uppercase tracking-wide transition-colors duration-500 ' + stateTheme().accentText">
            {{ selectedState().emoji }} {{ selectedState().name }}
          </span>
        </div>
      </div>

      <!-- State of Mind Spectrum Selector Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mb-8 relative z-10 font-mono">
        @for (state of states; track state.id) {
          @let isSelected = selectedState().id === state.id;
          <button (click)="selectState(state)"
            [class]="isSelected 
              ? 'p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col items-center text-center shadow-xl scale-[1.02] bg-white dark:bg-zinc-900/90 ' + state.borderColor + ' ' + state.glowColor 
              : 'p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300 cursor-pointer flex flex-col items-center text-center hover:scale-[1.01] active:scale-95 group sub-panel'"
            [attr.aria-pressed]="isSelected">
            
            <div [class]="isSelected ? 'text-3xl mb-2 transition-transform duration-300 scale-110 drop-shadow-md' : 'text-2xl mb-2 group-hover:scale-110 transition-transform duration-300'">
              {{ state.emoji }}
            </div>
            <span class="text-sm font-black text-zinc-900 dark:text-zinc-100 block uppercase tracking-tight">{{ state.name }}</span>
            <span class="text-xs text-zinc-600 dark:text-zinc-400 block mt-1 font-mono font-bold">{{ state.targetEEG }}</span>

            <!-- Active Selection Pill -->
            <span [class]="isSelected 
              ? 'mt-2.5 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider text-white shadow-sm ' + state.pillBg
              : 'mt-2.5 text-xs text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 font-mono uppercase tracking-wider font-bold'">
              {{ isSelected ? 'Active' : 'Select' }}
            </span>
          </button>
        }
      </div>

      <!-- Dedicated AI Mind-State Hero Prescription Card -->
      <div [class]="'mb-8 p-6 sm:p-8 rounded-3xl border shadow-2xl relative z-10 font-mono backdrop-blur-md transition-all duration-700 ' + stateTheme().cardBg + ' ' + stateTheme().borderColor + ' sub-panel'">
        
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-5 mb-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-3xl shadow-inner shrink-0">
              {{ selectedState().emoji }}
            </div>
            <div>
              <span [class]="'text-[10px] font-bold uppercase tracking-widest block ' + stateTheme().accentText">
                Dedicated AI Synthesis • {{ selectedState().avsTarget.waveType }} {{ selectedState().avsTarget.frequencyHz }} Hz
              </span>
              <h3 class="text-lg sm:text-xl font-extrabold uppercase tracking-wide text-zinc-900 dark:text-white mt-0.5">
                {{ selectedState().name }} — Mind-State Prescription
              </h3>
              <p class="text-xs text-zinc-600 dark:text-zinc-300 font-sans mt-0.5">
                {{ selectedState().subtitle }} • Custom Protocol for <strong class="text-orange-600 dark:text-cyan-300 font-semibold">{{ activePatientName() }}</strong>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <button (click)="generateDedicatedPrescription()"
              [class.animate-pulse]="isGeneratingPrescription()"
              class="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 cursor-pointer active:scale-95 border border-indigo-400/30">
              <span class="text-sm">⚡</span>
              <span>{{ isGeneratingPrescription() ? 'Synthesizing...' : 'Re-Synthesize AI Plan' }}</span>
            </button>
          </div>
        </div>

        <!-- EEG Frequency Oscilloscope Curve SVG -->
        <div class="mb-6 p-4 rounded-2xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-white/10 relative overflow-hidden sub-panel">
          <div class="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 font-mono">
            <span class="flex items-center gap-2">
              <span [class]="'w-2 h-2 rounded-full animate-ping ' + stateTheme().dotBg"></span>
              Live EEG Oscilloscope Target ({{ selectedState().avsTarget.waveType }} Wave • {{ selectedState().avsTarget.frequencyHz }} Hz)
            </span>
            <span class="text-zinc-700 dark:text-zinc-300 font-bold">Resonant Pace: {{ selectedState().avsTarget.breathingRateBpm }} BPM</span>
          </div>

          <div class="h-16 w-full relative flex items-center justify-center">
            <svg class="w-full h-full text-indigo-500 dark:text-indigo-400/80" viewBox="0 0 600 60" preserveAspectRatio="none">
              <path [attr.d]="eegWavePath()" 
                fill="none" 
                [attr.stroke]="stateTheme().strokeColor" 
                stroke-width="2.5" 
                stroke-linecap="round"
                class="transition-all duration-700 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            </svg>
          </div>

          <!-- Hawkins Scale & Tri-Paradigm Consciousness Synthesis Bar -->
          <div class="mt-3 pt-2.5 border-t border-zinc-200 dark:border-zinc-800/80 grid grid-cols-1 sm:grid-cols-4 gap-2 text-[10.5px] font-mono">
            <div class="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold truncate">
              📊 Hawkins Level: <strong>{{ selectedState().hawkinsCalibration }}</strong>
            </div>
            <div class="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold truncate">
              🎧 Solfeggio: <strong>{{ selectedState().solfeggioHz }} Hz</strong>
            </div>
            <div class="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold truncate">
              💡 Optical: <strong>{{ selectedState().opticalWavelengthNm }} nm</strong>
            </div>
            <div class="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold truncate">
              🧘 Chakra: <strong>{{ selectedState().ayurvedicChakra }}</strong>
            </div>
          </div>
        </div>

        @if (dedicatedPrescription(); as plan) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-sans">
            
            <!-- Column 1: Neuro profile -->
            <div class="p-5 rounded-2xl bg-white dark:bg-zinc-950/80 border border-indigo-200 dark:border-indigo-500/30 space-y-3 relative sub-panel">
              <div class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase font-mono text-xs">
                <span class="text-base">🧠</span> EEG & Neurotransmitter Profile
              </div>
              <p class="text-zinc-900 dark:text-white font-extrabold text-sm font-mono">{{ plan.targetEEG }}</p>
              <div class="text-zinc-700 dark:text-zinc-300 text-xs">
                <span class="text-zinc-500 dark:text-zinc-400 block text-[10px] font-mono uppercase tracking-wider">Target Neurotransmitters</span>
                <span class="text-indigo-600 dark:text-indigo-300 font-semibold font-mono">{{ plan.neurotransmitters }}</span>
              </div>
              <p class="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed border-t border-zinc-200 dark:border-zinc-800/80 pt-2.5">
                {{ plan.neuroRationale }}
              </p>
            </div>

            <!-- Column 2: Culinary prescription -->
            <div class="p-5 rounded-2xl bg-white dark:bg-zinc-950/80 border border-emerald-200 dark:border-emerald-500/30 space-y-3 flex flex-col justify-between sub-panel">
              <div class="space-y-3">
                <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold uppercase font-mono text-xs">
                  <span class="text-base">🥗</span> Nootropic Culinary Micro-dose
                </div>
                <p class="text-zinc-900 dark:text-white font-extrabold text-sm font-sans flex items-center gap-2">
                  <span>{{ plan.mealEmoji }}</span>
                  <span>{{ plan.mealName }}</span>
                </p>
                <div class="text-xs">
                  <span class="text-zinc-500 dark:text-zinc-400 block text-[10px] font-mono uppercase tracking-wider">Active Compounds</span>
                  <span class="text-emerald-600 dark:text-emerald-300 font-mono text-xs">{{ plan.mealActiveCompounds }}</span>
                </div>
              </div>

              <button (click)="prescribedMealState(selectedState())"
                class="w-full mt-3 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-700 dark:text-emerald-200 border border-emerald-500/40 text-xs font-bold font-mono uppercase tracking-wider transition cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-sm">
                <span>🥑</span> Prescribe Meal to Care Plan
              </button>
            </div>

            <!-- Column 3: Multi-Paradigm Shen & Guna -->
            <div class="p-5 rounded-2xl bg-white dark:bg-zinc-950/80 border border-amber-200 dark:border-amber-500/30 space-y-3 flex flex-col justify-between sub-panel">
              <div class="space-y-2.5 font-mono">
                <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold uppercase text-xs">
                  <span class="text-base">☯️</span> Multi-Paradigm Shen & Guna
                </div>
                <div class="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
                  <span class="text-zinc-500 text-[10px] uppercase tracking-widest block">TCM Shen Status</span>
                  <p class="text-emerald-600 dark:text-emerald-300 font-bold text-xs">{{ plan.tcmShen }}</p>
                </div>
                <div class="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
                  <span class="text-zinc-500 text-[10px] uppercase tracking-widest block">Ayurvedic Guna</span>
                  <p class="text-amber-600 dark:text-amber-300 font-bold text-xs">{{ plan.ayurvedaGuna }}</p>
                </div>
              </div>

              <button (click)="applyAvsState(selectedState())"
                class="w-full mt-3 py-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-700 dark:text-indigo-200 border border-indigo-500/40 text-xs font-bold font-mono uppercase tracking-wider transition cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-sm">
                <span>⚡</span> Activate AVS Target
              </button>
            </div>

          </div>
        }
      </div>

      <!-- Aquatic Consciousness & Floating City Archipelagos Component -->
      <div class="mb-8 relative z-10">
        <app-floating-water-consciousness></app-floating-water-consciousness>
      </div>

      <!-- Detailed Mind-State Optimization Intervention Cards -->
      @let active = selectedState();

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 font-sans mb-8">
        
        <!-- Left 7 Cols: Actionable Interventions -->
        <div class="lg:col-span-7 space-y-4">
          
          <!-- Card 1: AVS Entrainment & Resonant Breathing -->
          <div class="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 hover:border-indigo-500/40 transition-all duration-300 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sub-panel">
            <div class="space-y-1.5 flex-1">
              <div class="flex items-center gap-2.5">
                <span class="text-xl">🧠</span>
                <h4 class="text-xs font-extrabold uppercase font-mono text-indigo-600 dark:text-indigo-400 tracking-wider">
                  AVS Brainwave Entrainment & Resonant Breathing
                </h4>
              </div>
              <p class="text-sm font-bold text-zinc-900 dark:text-white">
                {{ active.avsTarget.waveType }} Wave ({{ active.avsTarget.frequencyHz }} Hz) • {{ active.avsTarget.breathingRateBpm }} BPM Vagal Resonant Breathing
              </p>
              <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                Synchronizes baroreflex vagal tone and entrains cortical oscillations into desired <strong class="text-indigo-600 dark:text-indigo-300 font-semibold">{{ active.name }}</strong> state.
              </p>
            </div>

            <button (click)="applyAvsState(active)"
              class="shrink-0 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-indigo-600/20 cursor-pointer active:scale-95 border border-indigo-400/30 flex items-center gap-2">
              <span>⚡</span>
              <span>Apply AVS State</span>
            </button>
          </div>

          <!-- Card 2: Culinary Micro-Dosing -->
          <div class="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 hover:border-emerald-500/40 transition-all duration-300 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sub-panel">
            <div class="space-y-1.5 flex-1">
              <div class="flex items-center gap-2.5">
                <span class="text-xl">{{ active.prescribedMeal.emoji }}</span>
                <h4 class="text-xs font-extrabold uppercase font-mono text-emerald-600 dark:text-emerald-400 tracking-wider">
                  Culinary Micro-Dosing Intervention
                </h4>
              </div>
              <p class="text-sm font-bold text-zinc-900 dark:text-white">
                {{ active.prescribedMeal.name }}
              </p>
              <p class="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                Active Compounds: <span class="text-emerald-600 dark:text-emerald-300 font-semibold">{{ active.prescribedMeal.activeCompounds }}</span>
              </p>
            </div>

            <button (click)="prescribedMealState(active)"
              class="shrink-0 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-emerald-600/20 cursor-pointer active:scale-95 border border-emerald-400/30 flex items-center gap-2">
              <span>🥑</span>
              <span>Prescribe Meal</span>
            </button>
          </div>

          <!-- Card 3: Multimodal Gemini Voice Consultation Mode -->
          <div class="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 hover:border-amber-500/40 transition-all duration-300 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sub-panel">
            <div class="space-y-1.5 flex-1">
              <div class="flex items-center gap-2.5">
                <span class="text-xl">🎙️</span>
                <h4 class="text-xs font-extrabold uppercase font-mono text-amber-600 dark:text-amber-400 tracking-wider">
                  Gemini Bi-Directional Voice Consultation
                </h4>
              </div>
              <p class="text-xs text-zinc-700 dark:text-zinc-300 font-sans leading-relaxed">
                Launch interactive AI voice guide tuned to facilitate <strong class="text-amber-600 dark:text-amber-300 font-semibold">{{ active.name }}</strong> consciousness state.
              </p>
            </div>

            <button (click)="triggerVoiceMode(active)"
              class="shrink-0 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-amber-600/20 cursor-pointer active:scale-95 border border-amber-400/30 flex items-center gap-2">
              <span>🎙️</span>
              <span>Launch Voice Guide</span>
            </button>
          </div>

        </div>

        <!-- Right 5 Cols: Neuro-Biomarker & Energetic Targets Summary -->
        <div class="lg:col-span-5 p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800/90 font-mono flex flex-col justify-between shadow-xl sub-panel">
          <div>
            <span class="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-4 tracking-widest flex items-center gap-2">
              <span>🧬</span>
              <span>Neuro-Biomarker & Energetic Targets</span>
            </span>

            <div class="space-y-3.5 text-xs mb-6 font-sans">
              <div class="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800/80 pb-3">
                <span class="text-zinc-500 dark:text-zinc-400 font-mono text-xs">Neurotransmitters:</span>
                <span class="text-indigo-600 dark:text-indigo-300 font-extrabold font-mono text-right text-xs">{{ active.targetNeurotransmitters.join(', ') }}</span>
              </div>
              <div class="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800/80 pb-3">
                <span class="text-zinc-500 dark:text-zinc-400 font-mono text-xs">TCM Shen Status:</span>
                <span class="text-emerald-600 dark:text-emerald-300 font-bold text-right text-xs">{{ active.tcmShenStatus }}</span>
              </div>
              <div class="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800/80 pb-3">
                <span class="text-zinc-500 dark:text-zinc-400 font-mono text-xs">Ayurvedic Guna:</span>
                <span class="text-amber-600 dark:text-amber-300 font-bold text-right text-xs">{{ active.ayurvedicGuna }}</span>
              </div>
            </div>

            <span class="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 block mb-2 tracking-widest font-mono">Clinical Rationale:</span>
            <p class="text-xs text-zinc-700 dark:text-zinc-300 font-sans leading-relaxed p-4 rounded-2xl bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80">
              {{ active.clinicalRationale }}
            </p>
          </div>

          <div class="pt-5 border-t border-zinc-200 dark:border-zinc-800/80 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
            <span>STATE ID: <strong class="text-zinc-700 dark:text-zinc-300 uppercase">{{ active.id }}</strong></span>
            <span class="text-indigo-600 dark:text-indigo-400 font-semibold">Physician Oversight Mandated</span>
          </div>
        </div>

      </div>

      <!-- Lyrica Generative Healing Jukebox Suite -->
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-100/80 via-white to-purple-50/80 dark:from-purple-950/40 dark:via-zinc-900/90 dark:to-slate-950/80 border border-purple-300 dark:border-purple-500/30 shadow-[0_0_35px_rgba(168,85,247,0.15)] relative z-10 font-mono overflow-hidden sub-panel">
        
        <!-- Jukebox Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-200 dark:border-zinc-800/80 pb-5 mb-6">
          <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-xl text-purple-700 dark:text-purple-300 shadow-md">
              📻
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2.5">
                <h3 class="text-base font-extrabold uppercase tracking-tight text-purple-900 dark:text-purple-200">
                  Lyrica Generative Healing Jukebox
                </h3>
                <span class="text-[9.5px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-500/40 uppercase tracking-wider">
                  Solfeggio & Binaural Synth
                </span>
              </div>
              <p class="text-xs text-zinc-600 dark:text-zinc-400 font-sans mt-0.5">
                Generates therapeutic ambient soundscapes, Solfeggio carrier waves, and spoken Lyrica healing affirmations tuned to <strong>{{ active.name }}</strong>.
              </p>
            </div>
          </div>

          <!-- Jukebox Controls -->
          <div class="flex items-center gap-2.5 shrink-0">
            <!-- Master Audio Mute Toggle Button -->
            <button (click)="audioService.toggleMute()"
              [class]="audioService.isMuted()
                ? 'px-3.5 py-2.5 rounded-2xl bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 text-xs font-bold font-mono transition cursor-pointer hover:bg-amber-500/30'
                : 'px-3.5 py-2.5 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30 text-xs font-bold font-mono transition cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-700'"
              [attr.aria-label]="audioService.isMuted() ? 'Unmute Audio' : 'Mute Audio'">
              <span>{{ audioService.isMuted() ? '🔇 Audio Muted' : '🔊 Sound On' }}</span>
            </button>

            @if (!isPlayingJukebox()) {
              <button (click)="toggleJukebox()"
                class="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer active:scale-95 border border-purple-400/30">
                <span>▶ Play Soundscape</span>
              </button>
            } @else {
              <button (click)="toggleJukebox()"
                class="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer active:scale-95 border border-rose-400/30">
                <span>⏸ Pause Jukebox</span>
              </button>
            }

            <button (click)="generateNewLyricaTrack()"
              class="px-4 py-2.5 rounded-2xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-200 text-xs font-bold uppercase tracking-wider transition cursor-pointer border border-zinc-300 dark:border-zinc-700 active:scale-95 flex items-center gap-1.5 shadow-md">
              <span>🎲 Next Track</span>
            </button>
          </div>
        </div>

        <!-- Jukebox Main Body -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          <!-- Column 1: Active Track Spec & Solfeggio Tuning -->
          <div class="md:col-span-5 space-y-4">
            <div class="p-5 rounded-2xl bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 shadow-inner space-y-2">
              <span class="text-[10px] text-purple-700 dark:text-purple-400 uppercase tracking-widest font-bold block">Now Playing Track Spec</span>
              <h4 class="text-sm font-bold text-zinc-900 dark:text-white font-sans leading-snug">
                {{ activeJukeboxTrack().title }}
              </h4>
              <div class="flex flex-wrap items-center gap-2 text-xs pt-1">
                <span class="text-purple-800 dark:text-purple-300 font-bold bg-purple-100 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-300 dark:border-purple-500/30">
                  🎵 {{ activeJukeboxTrack().solfeggioFreq }} Hz {{ activeJukeboxTrack().tuningName }}
                </span>
                <span class="text-indigo-800 dark:text-indigo-300 font-bold bg-indigo-100 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-300 dark:border-indigo-500/30">
                  🧠 {{ activeJukeboxTrack().binauralBeatHz }} Hz Binaural
                </span>
              </div>
            </div>

            <!-- Volume Control -->
            <div class="flex items-center gap-3 px-2 py-1">
              <label for="jukebox-volume-slider" class="text-xs text-zinc-600 dark:text-zinc-400 font-mono">🔊 Volume</label>
              <input id="jukebox-volume-slider" name="jukeboxVolume" aria-label="Jukebox Audio Volume Level" type="range" min="0" max="1" step="0.05" [value]="jukeboxVolume()" (input)="updateVolume($event)"
                class="w-full accent-purple-500 bg-zinc-200 dark:bg-zinc-800 rounded-lg h-2 cursor-pointer">
              <span class="text-xs text-purple-700 dark:text-purple-300 font-bold min-w-[40px] text-right font-mono">{{ Math.round(jukeboxVolume() * 100) }}%</span>
            </div>
          </div>

          <!-- Column 2: Audio Equalizer & Spoken Lyrica Ticker -->
          <div class="md:col-span-7 p-5 rounded-2xl bg-white dark:bg-zinc-950/90 border border-purple-200 dark:border-purple-500/20 relative overflow-hidden space-y-4 shadow-xl">
            
            <!-- Soundwave Equalizer Bars -->
            <div class="flex items-end justify-between gap-1.5 h-12 px-2">
              @for (bar of visualizerBars(); track $index) {
                <div class="w-full bg-gradient-to-t from-purple-600 via-indigo-500 to-emerald-400 rounded-t-md transition-all duration-300 shadow-sm"
                  [style.height.%]="isPlayingJukebox() ? bar : 15"></div>
              }
            </div>

            <!-- Spoken Lyrica Affirmation Ticker -->
            <div class="border-t border-zinc-200 dark:border-zinc-800/80 pt-3">
              <div class="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5">
                <span>Spoken Lyrica Affirmation</span>
                <span class="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-bold">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping"></span>
                  Healing Frequency Active
                </span>
              </div>
              <p class="text-xs italic text-purple-900 dark:text-purple-200 font-sans leading-relaxed">
                "{{ currentLyricaLyric() }}"
              </p>
            </div>

            <!-- Gemini Mind Mandala Visual Art Generator -->
            <div class="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5">
                <span class="text-base">🎨</span>
                <div>
                  <span class="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">Gemini Mind Mandala Art</span>
                  <span class="text-xs text-zinc-700 dark:text-zinc-300 font-sans">
                    Visual: {{ activeJukeboxTrack().artTheme }}
                  </span>
                </div>
              </div>
              <button (click)="synthesizeMindVisual()"
                class="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 border border-purple-400/50 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer active:scale-95 shrink-0 shadow-sm">
                ✨ Generate Art
              </button>
            </div>

          </div>

        </div>

      </div>



      <!-- Social Health & Local Event Gravitation Matrix -->
      <div class="mt-8 relative z-10">
        <app-social-health-gravitation></app-social-health-gravitation>
      </div>

      <!-- Interactive Gemini Mind Mandala Visual Art Modal -->
      @if (showMandalaModal()) {
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div class="w-full max-w-lg p-6 rounded-3xl bg-zinc-950/95 border border-purple-500/40 shadow-[0_0_60px_rgba(168,85,247,0.35)] font-mono text-zinc-100 relative flex flex-col items-center">
            
            <!-- Modal Header -->
            <div class="w-full flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
              <div class="flex items-center gap-3">
                <span class="text-2xl p-2 rounded-xl bg-purple-500/20 text-purple-300">✨</span>
                <div>
                  <h3 class="text-base font-extrabold text-white uppercase tracking-wider">Gemini Mind Mandala Art</h3>
                  <span class="text-xs text-purple-300 font-sans">Theme: {{ activeJukeboxTrack().artTheme }}</span>
                </div>
              </div>

              <button (click)="closeMandalaModal()" class="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold flex items-center justify-center transition cursor-pointer">
                ✕
              </button>
            </div>

            <!-- Mandala Canvas Container -->
            <div class="relative w-full aspect-square max-w-[380px] my-2 flex items-center justify-center rounded-2xl bg-zinc-950 border border-purple-900/60 shadow-inner overflow-hidden">
              <canvas #mandalaCanvas width="400" height="400" class="w-full h-full object-contain rounded-2xl"></canvas>
            </div>

            <!-- Modal Footer Controls -->
            <div class="w-full mt-4 pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <div class="text-[11px] text-zinc-400 font-sans">
                Resonant Frequency: <strong class="text-purple-300">{{ activeJukeboxTrack().solfeggioFreq }} Hz Solfeggio</strong>
              </div>

              <div class="flex items-center gap-2">
                <button (click)="downloadMandalaPng()" class="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md flex items-center gap-1.5">
                  💾 Export PNG
                </button>
                <button (click)="closeMandalaModal()" class="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-zinc-700">
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class MoodConsciousnessMatrixComponent implements OnDestroy {
  patientState = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);

  states: IConsciousnessState[] = [
    {
      id: 'focus',
      name: 'Hyper-Focus & Flow',
      subtitle: 'Peak Cognition & Executive Clarity',
      emoji: '⚡',
      color: 'indigo',
      gradientBg: 'from-indigo-950/80 via-zinc-900 to-cyan-950/80',
      borderColor: 'border-indigo-500/40',
      glowColor: 'shadow-[0_0_25px_rgba(99,102,241,0.25)]',
      accentText: 'text-indigo-400',
      pillBg: 'bg-indigo-600',
      targetEEG: '40 Hz Gamma',
      targetNeurotransmitters: ['Dopamine D2', 'Acetylcholine', 'Norepinephrine'],
      prescribedMeal: {
        emoji: '🍫',
        name: 'Dark Cacao & L-Theanine Nootropic Elixir',
        activeCompounds: 'Theobromine 150mg + L-Theanine 200mg + Bacopa 300mg'
      },
      avsTarget: {
        frequencyHz: 40,
        waveType: 'Gamma',
        breathingRateBpm: 6
      },
      hawkinsCalibration: 400,
      solfeggioHz: 741,
      opticalWavelengthNm: 470,
      tcmWuXingElement: 'Metal (Lung Qi Defense)',
      ayurvedicChakra: 'Ajna (Third Eye)',
      clinicalRationale: 'Enhances prefrontal cortex gamma band coherence, upregulates cholinergic synaptic transmission, and sharpens executive working memory.',
      tcmShenStatus: 'Shen Bright & Focused in Heart Channel',
      ayurvedicGuna: 'Rajas (Action)'
    },
    {
      id: 'calm',
      name: 'Meditative Calm',
      subtitle: 'Parasympathetic Vagal Relaxation',
      emoji: '🧘',
      color: 'emerald',
      gradientBg: 'from-emerald-950/80 via-zinc-900 to-teal-950/80',
      borderColor: 'border-emerald-500/40',
      glowColor: 'shadow-[0_0_25px_rgba(16,185,129,0.25)]',
      accentText: 'text-emerald-400',
      pillBg: 'bg-emerald-600',
      targetEEG: '10 Hz Alpha',
      targetNeurotransmitters: ['GABA-A', 'Glycine', 'Serotonin 5-HT1A'],
      prescribedMeal: {
        emoji: '🥑',
        name: 'Avocado & Ashwagandha KSM-66 Compote',
        activeCompounds: 'Withanolides 30mg + Oleic Acid 14g + Magnesium 400mg'
      },
      avsTarget: {
        frequencyHz: 10,
        waveType: 'Alpha',
        breathingRateBpm: 5
      },
      hawkinsCalibration: 500,
      solfeggioHz: 528,
      opticalWavelengthNm: 520,
      tcmWuXingElement: 'Wood (Liver Qi Unbinding)',
      ayurvedicChakra: 'Anahata (Heart)',
      clinicalRationale: 'Promotes alpha wave occipital dominance, blunts HPA axis cortisol hyper-secretion, and increases heart rate variability (HRV).',
      tcmShenStatus: 'Shen Tranquilized & Anchored',
      ayurvedicGuna: 'Sattva (Purity)'
    },
    {
      id: 'sleep',
      name: 'Deep Rest & Sleep',
      subtitle: 'Delta Glymphatic Clearance',
      emoji: '🌙',
      color: 'purple',
      gradientBg: 'from-purple-950/80 via-zinc-900 to-indigo-950/80',
      borderColor: 'border-purple-500/40',
      glowColor: 'shadow-[0_0_25px_rgba(168,85,247,0.25)]',
      accentText: 'text-purple-400',
      pillBg: 'bg-purple-600',
      targetEEG: '2 Hz Delta',
      targetNeurotransmitters: ['Melatonin', 'GABA-B', 'Adenosine'],
      prescribedMeal: {
        emoji: '🫐',
        name: 'Tart Cherry & Chamomile Apigenin Tonic',
        activeCompounds: 'Natural Melatonin 10mg + Apigenin 50mg + Glycine 3g'
      },
      avsTarget: {
        frequencyHz: 2,
        waveType: 'Delta',
        breathingRateBpm: 4
      },
      hawkinsCalibration: 200,
      solfeggioHz: 396,
      opticalWavelengthNm: 630,
      tcmWuXingElement: 'Water (Kidney Essence)',
      ayurvedicChakra: 'Muladhara (Root)',
      clinicalRationale: 'Facilitates slow-wave delta sleep entry, drives glymphatic metabolic waste clearance from brain parenchyma, and resets autonomic tone.',
      tcmShenStatus: 'Shen Preserved in Kidney Essence (Jing)',
      ayurvedicGuna: 'Tamas (Rest)'
    },
    {
      id: 'creativity',
      name: 'Creative Reverie',
      subtitle: 'Hypnagogic Insight & Association',
      emoji: '🎨',
      color: 'amber',
      gradientBg: 'from-amber-950/80 via-zinc-900 to-fuchsia-950/80',
      borderColor: 'border-amber-500/40',
      glowColor: 'shadow-[0_0_25px_rgba(245,158,11,0.25)]',
      accentText: 'text-amber-400',
      pillBg: 'bg-amber-600',
      targetEEG: '6 Hz Theta',
      targetNeurotransmitters: ['Anandamide', 'Dopamine D1', 'Acetylcholine'],
      prescribedMeal: {
        emoji: '🫖',
        name: 'Gotu Kola & Lion’s Mane Hericenones Brew',
        activeCompounds: 'Hericenones 50mg + Asiaticoside 20mg + Citral'
      },
      avsTarget: {
        frequencyHz: 6,
        waveType: 'Theta',
        breathingRateBpm: 6
      },
      hawkinsCalibration: 540,
      solfeggioHz: 639,
      opticalWavelengthNm: 420,
      tcmWuXingElement: 'Fire (Heart Shen Brightness)',
      ayurvedicChakra: 'Vishuddha (Throat)',
      clinicalRationale: 'Fosters theta band hippocampal-cortical crosstalk, allowing novel associative synthesis and fluid unconstrained cognitive ideation.',
      tcmShenStatus: 'Hun (Spiritual Soul) Floating Free',
      ayurvedicGuna: 'Sattva (Purity)'
    },
    {
      id: 'grounding',
      name: 'Anxiolytic Grounding',
      subtitle: 'Somatic Emotional Stability',
      emoji: '🛡️',
      color: 'rose',
      gradientBg: 'from-rose-950/80 via-zinc-900 to-orange-950/80',
      borderColor: 'border-rose-500/40',
      glowColor: 'shadow-[0_0_25px_rgba(244,63,94,0.25)]',
      accentText: 'text-rose-400',
      pillBg: 'bg-rose-600',
      targetEEG: '8 Hz Low Alpha',
      targetNeurotransmitters: ['Endorphins', 'Neuropeptide Y', 'GABA'],
      prescribedMeal: {
        emoji: '🍣',
        name: 'Wild Salmon & Reishi Lingzhi Soup',
        activeCompounds: 'Ganoderic Acids 40mg + Omega-3 EPA 1.8g + Zinc 15mg'
      },
      avsTarget: {
        frequencyHz: 8,
        waveType: 'Alpha',
        breathingRateBpm: 5.5
      },
      hawkinsCalibration: 310,
      solfeggioHz: 174,
      opticalWavelengthNm: 590,
      tcmWuXingElement: 'Earth (Spleen Digest)',
      ayurvedicChakra: 'Svadhishthana (Sacral)',
      clinicalRationale: 'Calms amygdala hyper-reactivity, tonifies TCM Spleen Qi and Heart Blood, and grounds somatic anxiety into equilibrium.',
      tcmShenStatus: 'Heart Blood Nourished & Shen Rooted',
      ayurvedicGuna: 'Sattva (Purity)'
    }
  ];

  audioService = inject(ActuarialGleeAudioService);
  selectedState = signal<IConsciousnessState>(this.states[0]);
  isGeneratingPrescription = signal<boolean>(false);
  dedicatedPrescription = signal<any | null>({
    targetEEG: '40 Hz Gamma Wave • 6 BPM Resonant Breathing',
    neurotransmitters: 'Dopamine D2, Acetylcholine, Norepinephrine',
    neuroRationale: 'Enhances prefrontal cortex gamma band coherence, upregulates cholinergic synaptic transmission, and sharpens executive working memory.',
    mealEmoji: '🍫',
    mealName: 'Dark Cacao & L-Theanine Nootropic Elixir',
    mealActiveCompounds: 'Theobromine 150mg + L-Theanine 200mg + Bacopa 300mg',
    tcmShen: 'Shen Bright & Focused in Heart Channel',
    ayurvedaGuna: 'Rajas (Action)'
  });

  activePatientName = computed(() => {
    const pId = this.patientManagement.selectedPatientId();
    if (!pId) return 'Charles Darwin';
    const patient = this.patientManagement.patients().find(p => p.id === pId);
    return patient ? patient.name : 'Charles Darwin';
  });

  stateTheme = computed(() => {
    return {
      glowBg: 'bg-orange-500/10',
      glowSecondary: 'bg-zinc-800',
      dotBg: 'bg-orange-500',
      dotShadow: 'shadow-[0_0_10px_rgba(249,115,22,0.6)]',
      accentText: 'text-orange-400',
      borderColor: 'border-orange-500/40',
      pillBg: 'bg-orange-500/20',
      strokeColor: '#f97316',
      cardBg: 'bg-zinc-900'
    };
  });

  eegWavePath = computed(() => {
    const hz = this.selectedState().avsTarget.frequencyHz;
    const cycles = Math.max(2, Math.min(24, Math.round(hz / 2)));
    const points: string[] = [];
    const width = 600;
    const height = 60;
    const midY = height / 2;
    const amp = 18;

    for (let x = 0; x <= width; x += 5) {
      const angle = (x / width) * cycles * 2 * Math.PI;
      const y = midY + Math.sin(angle) * amp;
      points.push(`${x},${y.toFixed(1)}`);
    }

    return `M 0,${midY} L ` + points.join(' L ');
  });

  selectState(state: IConsciousnessState) {
    this.selectedState.set(state);
    this.generateDedicatedPrescription();
  }

  generateDedicatedPrescription() {
    this.isGeneratingPrescription.set(true);
    setTimeout(() => {
      const state = this.selectedState();
      this.dedicatedPrescription.set({
        targetEEG: `${state.avsTarget.waveType} Wave (${state.avsTarget.frequencyHz} Hz) • ${state.avsTarget.breathingRateBpm} BPM Resonant Breathing`,
        neurotransmitters: state.targetNeurotransmitters.join(', '),
        neuroRationale: state.clinicalRationale,
        mealEmoji: state.prescribedMeal.emoji,
        mealName: state.prescribedMeal.name,
        mealActiveCompounds: state.prescribedMeal.activeCompounds,
        tcmShen: state.tcmShenStatus,
        ayurvedaGuna: state.ayurvedicGuna
      });
      this.isGeneratingPrescription.set(false);
    }, 400);
  }

  applyAvsState(state: IConsciousnessState) {
    this.patientState.avsBreathingRate.set(state.avsTarget.breathingRateBpm);
    this.patientState.avsBrainwaveFrequencyHz.set(state.avsTarget.frequencyHz);
    
    const waveLower = state.avsTarget.waveType.toLowerCase() as any;
    if (['theta', 'alpha', 'gamma', 'delta', 'beta'].includes(waveLower)) {
      this.patientState.avsBrainwaveFrequency.set(waveLower);
    }

    const noteText = `🔮 Applied AVS Mood State: ${state.emoji} ${state.name} (${state.avsTarget.waveType} ${state.avsTarget.frequencyHz} Hz, ${state.avsTarget.breathingRateBpm} BPM)`;
    this.patientState.addClinicalNote({
      id: `avs-mood-${state.id}-${Date.now()}`,
      text: noteText,
      sourceLens: 'Functional Protocols',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
  }

  prescribedMealState(state: IConsciousnessState) {
    const noteText = `🥑 Prescribed Mood Meal: ${state.prescribedMeal.emoji} ${state.prescribedMeal.name} (${state.prescribedMeal.activeCompounds})`;
    this.patientState.addClinicalNote({
      id: `mood-meal-${state.id}-${Date.now()}`,
      text: noteText,
      sourceLens: 'Nutrition',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
  }

  triggerVoiceMode(state: IConsciousnessState) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('voice-mode-change', { detail: 'avs' }));
    }
  }

  Math = Math;
  isPlayingJukebox = signal<boolean>(false);
  jukeboxVolume = signal<number>(0.5);
  visualizerBars = signal<number[]>([40, 65, 80, 50, 90, 70, 45, 85, 60, 95, 30, 75]);

  tracksSpec = [
    { title: '528 Hz Acoustic Relaxation Serenade', solfeggioFreq: 528, tuningName: 'Autonomic Relaxation & Down-Regulation', binauralBeatHz: 10, artTheme: 'Bioluminescent Indigo Lotus' },
    { title: '432 Hz Harmonic Relaxation Flow', solfeggioFreq: 432, tuningName: 'Subjective Stress Reduction', binauralBeatHz: 40, artTheme: 'Golden Neural Cortex Matrix' },
    { title: '639 Hz Mindful Coherence Meditation', solfeggioFreq: 639, tuningName: 'Mindful Somatic Grounding', binauralBeatHz: 8, artTheme: 'Rose Gold Heart Aura Mandala' },
    { title: '174 Hz Restorative Evening Lullaby', solfeggioFreq: 174, tuningName: 'Evening Sleep Relaxation Support', binauralBeatHz: 2, artTheme: 'Starlight Glymphatic Nebula' },
    { title: '852 Hz Mindful Introspection Soundscape', solfeggioFreq: 852, tuningName: 'Cognitive Relaxation & Focus', binauralBeatHz: 6, artTheme: 'Emerald Crystalline Prism' }
  ];

  activeJukeboxTrack = signal(this.tracksSpec[0]);

  lyricaAffirmations = [
    "Breathe in clarity; your prefrontal cortex resonates with pure 528 Hz transformation and vagal harmony.",
    "Every breath releases somatic tension. Cortisol recedes as 432 Hz natural harmonics restore equilibrium.",
    "Your heart rate variability expands. Shen is anchored softly within the heart channel.",
    "Slow-wave delta entry begins. Glymphatic metabolic clearance washes over brain parenchyma.",
    "Anandamide and alpha waves flow freely. You are grounded, safe, and profoundly restored."
  ];

  currentLyricaLyric = signal<string>(this.lyricaAffirmations[0]);

  showMandalaModal = signal(false);
  @ViewChild('mandalaCanvas') mandalaCanvasRef!: ElementRef<HTMLCanvasElement>;
  private mandalaAnimId: number | null = null;
  private mandalaRotation = 0;

  synthesizeMindVisual() {
    const track = this.activeJukeboxTrack();
    const noteText = `🎨 Synthesized Gemini Mood Visual Mandala: ${track.artTheme} (${track.solfeggioFreq} Hz Solfeggio, ${track.binauralBeatHz} Hz Binaural)`;
    this.patientState.addClinicalNote({
      id: `mood-visual-${Date.now()}`,
      text: noteText,
      sourceLens: 'Functional Protocols',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });

    this.showMandalaModal.set(true);
    setTimeout(() => this.startMandalaAnimation(), 50);
  }

  closeMandalaModal() {
    this.showMandalaModal.set(false);
    if (this.mandalaAnimId) {
      cancelAnimationFrame(this.mandalaAnimId);
      this.mandalaAnimId = null;
    }
  }

  downloadMandalaPng() {
    if (!this.mandalaCanvasRef) return;
    const canvas = this.mandalaCanvasRef.nativeElement;
    const link = document.createElement('a');
    link.download = `Gemini_Mind_Mandala_${this.activeJukeboxTrack().artTheme.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  private startMandalaAnimation() {
    if (!this.mandalaCanvasRef) return;
    const canvas = this.mandalaCanvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const track = this.activeJukeboxTrack();
    const isGold = track.artTheme.includes('Golden');
    const isRose = track.artTheme.includes('Rose');
    const isEmerald = track.artTheme.includes('Emerald');

    const primaryColor = isGold ? '#fbbf24' : (isRose ? '#f43f5e' : (isEmerald ? '#34d399' : '#818cf8'));
    const secondaryColor = isGold ? '#f59e0b' : (isRose ? '#ec4899' : (isEmerald ? '#10b981' : '#c084fc'));

    const render = () => {
      this.mandalaRotation += 0.008;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Radial background glow
      const bgGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, width / 2);
      bgGlow.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
      bgGlow.addColorStop(0.5, 'rgba(30, 27, 75, 0.85)');
      bgGlow.addColorStop(1, 'rgba(9, 9, 11, 0.98)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // Render 12-fold Petal Rings
      const petalRings = [120, 85, 55, 30];
      petalRings.forEach((radius, ringIdx) => {
        const petalCount = 12 + ringIdx * 4;
        const ringRotation = this.mandalaRotation * (ringIdx % 2 === 0 ? 1 : -1);

        for (let i = 0; i < petalCount; i++) {
          const angle = (i * 2 * Math.PI) / petalCount + ringRotation;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(radius / 2, radius / 2, 0, radius);
          ctx.quadraticCurveTo(-radius / 2, radius / 2, 0, 0);

          ctx.fillStyle = ringIdx % 2 === 0 ? primaryColor : secondaryColor;
          ctx.globalAlpha = 0.25 + 0.15 * Math.sin(this.mandalaRotation * 3 + ringIdx);
          ctx.fill();

          ctx.strokeStyle = ringIdx % 2 === 0 ? secondaryColor : primaryColor;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = 0.8;
          ctx.stroke();

          ctx.restore();
        }
      });

      // Central Pulsing Core
      const corePulse = 18 + 5 * Math.sin(this.mandalaRotation * 5);
      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, corePulse * 2);
      coreGlow.addColorStop(0, '#ffffff');
      coreGlow.addColorStop(0.4, primaryColor);
      coreGlow.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(cx, cy, corePulse, 0, 2 * Math.PI);
      ctx.fillStyle = coreGlow;
      ctx.globalAlpha = 0.9;
      ctx.fill();

      // Outer Sacred Geometry Circle
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, 2 * Math.PI);
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.4;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      this.mandalaAnimId = requestAnimationFrame(render);
    };

    if (this.mandalaAnimId) cancelAnimationFrame(this.mandalaAnimId);
    render();
  }

  ngOnDestroy() {
    this.closeMandalaModal();
    this.stopAudioSynth();
  }

  private audioCtx: AudioContext | null = null;
  private oscLeft: OscillatorNode | null = null;
  private oscRight: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private visualizerInterval: any = null;

  toggleJukebox() {
    if (this.isPlayingJukebox()) {
      this.stopAudioSynth();
    } else {
      this.startAudioSynth();
    }
  }

  generateNewLyricaTrack() {
    const nextIdx = (this.tracksSpec.indexOf(this.activeJukeboxTrack()) + 1) % this.tracksSpec.length;
    const newTrack = this.tracksSpec[nextIdx];
    this.activeJukeboxTrack.set(newTrack);
    this.currentLyricaLyric.set(this.lyricaAffirmations[nextIdx % this.lyricaAffirmations.length]);

    if (this.isPlayingJukebox()) {
      this.stopAudioSynth();
      this.startAudioSynth();
    }
  }

  updateVolume(event: Event) {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.jukeboxVolume.set(val);
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(val * 0.15, this.audioCtx?.currentTime || 0);
    }
  }

  private startAudioSynth() {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.audioCtx = new AudioCtx();

      const track = this.activeJukeboxTrack();
      const carrierFreq = track.solfeggioFreq;
      const beatFreq = track.binauralBeatHz;

      const pannerLeft = this.audioCtx.createStereoPanner ? this.audioCtx.createStereoPanner() : null;
      const pannerRight = this.audioCtx.createStereoPanner ? this.audioCtx.createStereoPanner() : null;

      if (pannerLeft) pannerLeft.pan.value = -0.8;
      if (pannerRight) pannerRight.pan.value = 0.8;

      this.oscLeft = this.audioCtx.createOscillator();
      this.oscRight = this.audioCtx.createOscillator();

      this.oscLeft.type = 'sine';
      this.oscRight.type = 'sine';

      this.oscLeft.frequency.setValueAtTime(carrierFreq, this.audioCtx.currentTime);
      this.oscRight.frequency.setValueAtTime(carrierFreq + beatFreq, this.audioCtx.currentTime);

      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(this.jukeboxVolume() * 0.15, this.audioCtx.currentTime);

      if (pannerLeft && pannerRight) {
        this.oscLeft.connect(pannerLeft);
        pannerLeft.connect(this.gainNode);
        this.oscRight.connect(pannerRight);
        pannerRight.connect(this.gainNode);
      } else {
        this.oscLeft.connect(this.gainNode);
        this.oscRight.connect(this.gainNode);
      }

      this.gainNode.connect(this.audioCtx.destination);

      this.oscLeft.start();
      this.oscRight.start();

      this.isPlayingJukebox.set(true);

      this.visualizerInterval = setInterval(() => {
        const newBars = Array.from({ length: 12 }, () => Math.floor(Math.random() * 70) + 30);
        this.visualizerBars.set(newBars);
      }, 300);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(this.currentLyricaLyric());
        utterance.rate = 0.85;
        utterance.pitch = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn('[Lyrica Jukebox Synth Error]', err);
    }
  }

  private stopAudioSynth() {
    try {
      if (this.oscLeft) { this.oscLeft.stop(); this.oscLeft.disconnect(); }
      if (this.oscRight) { this.oscRight.stop(); this.oscRight.disconnect(); }
      if (this.audioCtx) { this.audioCtx.close(); }
      if (this.visualizerInterval) { clearInterval(this.visualizerInterval); }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (err) {
      console.warn('[Lyrica Jukebox Stop Error]', err);
    } finally {
      this.isPlayingJukebox.set(false);
      this.oscLeft = null;
      this.oscRight = null;
    }
  }
}
