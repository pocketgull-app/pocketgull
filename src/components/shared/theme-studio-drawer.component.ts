import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, AppTheme } from '../../services/theme.service';

export interface IThemeOption {
  id: AppTheme;
  name: string;
  category: 'Clinical' | 'Tactile Paper' | 'Mineral & Organic' | 'Special Diagnostic';
  icon: string;
  bgHex: string;
  borderHex: string;
  textHex: string;
  accentHex: string;
  description: string;
}

@Component({
  selector: 'app-theme-studio-drawer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-4 font-mono space-y-4">
      
      <!-- Dieter Rams Studio Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-zinc-900 text-white border border-zinc-800">
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-sm bg-emerald-500 animate-pulse"></div>
          <div>
            <span class="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">Visual Comfort Protocol</span>
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <span>Dieter Rams Functional Theme Studio</span>
              <span class="text-[11px] text-zinc-400 font-normal">({{ themeService.currentTheme() }})</span>
            </h3>
          </div>
        </div>

        <!-- Fast Cycle Button (Double-Tap Alternative) -->
        <div class="flex items-center gap-2 text-xs">
          <button 
            (click)="cyclePrimaryTheme()"
            aria-label="Cycle primary themes"
            class="min-h-[44px] px-3.5 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition flex items-center gap-2 border border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
            <span>🔄 Fast Cycle Primary</span>
          </button>
        </div>
      </div>

      <!-- Theme Categories Grid (No Pills - Rectangular Precision Swatches) -->
      <div role="radiogroup" aria-label="Visual Theme Options" class="space-y-4">
        @for (cat of categories; track cat) {
          <div class="space-y-2">
            <h4 class="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-1">{{ cat }} Paradigms</h4>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              @for (t of getThemesByCategory(cat); track t.id) {
                <button
                  role="radio"
                  [attr.aria-checked]="themeService.currentTheme() === t.id"
                  (click)="selectTheme(t.id)"
                  (dblclick)="cyclePrimaryTheme()"
                  [class]="buttonCssClass(t.id)"
                  [title]="t.description">

                  <!-- Color Swatch Box (Braun Functional Aesthetic) -->
                  <div class="flex items-center justify-between w-full">
                    <div class="flex items-center gap-2">
                      <div 
                        class="w-6 h-6 rounded-md border flex items-center justify-center text-xs font-bold shadow-inner"
                        [style.backgroundColor]="t.bgHex"
                        [style.borderColor]="t.borderHex"
                        [style.color]="t.textHex">
                        {{ t.icon }}
                      </div>
                      <span class="text-xs font-bold truncate max-w-[130px]">{{ t.name }}</span>
                    </div>

                    <!-- Active Indicator Marker -->
                    @if (themeService.currentTheme() === t.id) {
                      <span class="text-emerald-500 font-extrabold text-xs">✓ Active</span>
                    }
                  </div>

                  <!-- Contrast Accent Bar -->
                  <div class="w-full h-1 rounded-full mt-2" [style.backgroundColor]="t.accentHex"></div>
                </button>
              }
            </div>
          </div>
        }
      </div>

      <!-- Reduced Motion & Accessibility Options Bar -->
      <div class="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          <span class="text-zinc-500 font-bold uppercase text-[10px]">ADA Comfort:</span>
          <button 
            (click)="themeService.setReduceMotion(!themeService.reduceMotion())"
            [class]="themeService.reduceMotion() ? 'min-h-[44px] px-3 py-2 rounded-md bg-emerald-600 text-white font-bold border border-emerald-500' : 'min-h-[44px] px-3 py-2 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold border border-zinc-300 dark:border-zinc-700'">
            ⚡ Reduced Motion: {{ themeService.reduceMotion() ? 'ON' : 'OFF' }}
          </button>
        </div>

        <div class="text-[11px] text-zinc-500 font-sans">
          <span>Single click to select theme • Double click to fast-cycle</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ThemeStudioDrawerComponent {
  public themeService = inject(ThemeService);

  categories: Array<'Clinical' | 'Tactile Paper' | 'Mineral & Organic' | 'Special Diagnostic'> = [
    'Clinical',
    'Tactile Paper',
    'Mineral & Organic',
    'Special Diagnostic'
  ];

  themeOptions: IThemeOption[] = [
    { id: 'light', name: 'Light Parchment', category: 'Clinical', icon: '☀️', bgHex: '#F8F8F8', borderHex: '#E5E5E5', textHex: '#1C1C1C', accentHex: '#0284c7', description: 'Standard clinical high-contrast light mode.' },
    { id: 'dark', name: 'Dark Obsidian', category: 'Clinical', icon: '🌙', bgHex: '#09090b', borderHex: '#27272a', textHex: '#fafafa', accentHex: '#10b981', description: 'Deep dark mode optimized for night shifts.' },
    { id: 'system', name: 'System OS Sync', category: 'Clinical', icon: '💻', bgHex: '#18181b', borderHex: '#3f3f46', textHex: '#e4e4e7', accentHex: '#a855f7', description: 'Automatically synchronizes with your device operating system theme.' },

    { id: 'papercraft', name: 'Papercraft Kraft', category: 'Tactile Paper', icon: '📜', bgHex: '#F9F3D9', borderHex: '#E5D6A7', textHex: '#3B2E1E', accentHex: '#b45309', description: 'Tactile natural kraft paper with soft warm fiber texture.' },
    { id: 'hemp', name: 'Hemp Fiber', category: 'Tactile Paper', icon: '🌿', bgHex: '#F2EFE6', borderHex: '#D8D3C3', textHex: '#2C3529', accentHex: '#15803d', description: 'Organic unbleached hemp linen paper texture.' },
    { id: 'rice', name: 'Washi Rice Paper', category: 'Tactile Paper', icon: '🌾', bgHex: '#FAF8F0', borderHex: '#EAE5D5', textHex: '#2A2723', accentHex: '#d97706', description: 'Translucent Japanese washi paper aesthetic.' },
    { id: 'construction', name: 'Construction High-Vis', category: 'Tactile Paper', icon: '👷', bgHex: '#FDF6E2', borderHex: '#F3D27B', textHex: '#1E1B13', accentHex: '#eab308', description: 'High-visibility industrial safety paper for daylight readability.' },

    { id: 'white-marble', name: 'Carrara White Marble', category: 'Mineral & Organic', icon: '🏛️', bgHex: '#FAF9F6', borderHex: '#E2E8F0', textHex: '#0F172A', accentHex: '#0ea5e9', description: 'Elegant Carrara white marble with gold/slate veins.' },
    { id: 'black-marble', name: 'Nero Marquina Marble', category: 'Mineral & Organic', icon: '🪨', bgHex: '#0D0D11', borderHex: '#1E1E26', textHex: '#F8FAFC', accentHex: '#eab308', description: 'Deep Spanish black marble with white and gold veins.' },
    { id: 'papyrus', name: 'Ancient Papyrus', category: 'Mineral & Organic', icon: '🏺', bgHex: '#13100C', borderHex: '#282119', textHex: '#F5E6D3', accentHex: '#d97706', description: 'Dark gilded Egyptian papyrus texture.' },

    { id: 'spark', name: 'Spark Emergency Glow', category: 'Special Diagnostic', icon: '✨', bgHex: '#0a0503', borderHex: '#2e1208', textHex: '#fb923c', accentHex: '#f97316', description: 'Ember glow high-contrast emergency diagnostic lens.' },
    { id: 'pool', name: 'Circadian Aquatic Pool', category: 'Special Diagnostic', icon: '🌊', bgHex: '#081F3D', borderHex: '#0E3A70', textHex: '#E0F2FE', accentHex: '#38bdf8', description: 'Deep ocean pool blue light filtering lens.' },
    { id: 'mandala', name: 'Sacred Mandala Violet', category: 'Special Diagnostic', icon: '🧘', bgHex: '#16112D', borderHex: '#2A2052', textHex: '#F5F3FF', accentHex: '#a855f7', description: 'Solfeggio 528Hz meditative violet lens.' },
    { id: 'curie', name: 'Curie Atomic Radium', category: 'Special Diagnostic', icon: '⚛️', bgHex: '#0F1416', borderHex: '#162025', textHex: '#E2F8EE', accentHex: '#00ff66', description: 'Madame Curie 1950s atomic lead-shielded green radium glow.' }
  ];

  getThemesByCategory(cat: string) {
    return this.themeOptions.filter(t => t.category === cat);
  }

  selectTheme(themeId: AppTheme) {
    this.themeService.currentTheme.set(themeId);
  }

  cyclePrimaryTheme() {
    const current = this.themeService.currentTheme();
    const sequence: AppTheme[] = ['light', 'dark', 'system', 'spark', 'papercraft', 'hemp', 'rice', 'white-marble', 'black-marble', 'papyrus', 'pool', 'mandala', 'curie'];
    const idx = sequence.indexOf(current);
    const next = sequence[(idx + 1) % sequence.length];
    this.themeService.currentTheme.set(next);
  }

  buttonCssClass(themeId: AppTheme) {
    const isActive = this.themeService.currentTheme() === themeId;
    let base = 'min-h-[44px] p-2.5 rounded-md border text-left flex flex-col justify-between transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ';
    if (isActive) {
      base += 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-emerald-500 font-bold shadow-md border-2';
    } else {
      base += 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600';
    }
    return base;
  }
}
