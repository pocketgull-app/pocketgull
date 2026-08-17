import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdobeEnterpriseSuiteService, ISubstance3dMaterial } from '../services/adobe-enterprise-suite.service';

@Component({
  selector: 'app-adobe-substance-material-gallery',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-zinc-950 rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl font-mono text-zinc-100 relative overflow-hidden my-6">
      <!-- Ambient background glow -->
      <div class="absolute -top-32 -right-32 w-80 h-80 bg-purple-500/10 blur-3xl rounded-full pointer-events-none"></div>

      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5 mb-6 relative z-10">
        <div>
          <div class="flex items-center gap-3">
            <span class="text-xl">💎</span>
            <h3 class="text-base sm:text-lg font-black text-zinc-100 uppercase tracking-wider">
              Adobe Substance 3D Biophysical PBR Material Inspector
            </h3>
            <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 uppercase">
              Substance Designer (.sbsar)
            </span>
          </div>
          <p class="text-xs text-zinc-400 mt-1 font-sans">
            Parametric procedural tissue shaders grounded in Edwin Smith Surgical Codex biophysical descriptions.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <a href="https://www.adobe.com/products/substance3d.html" target="_blank" rel="noopener noreferrer"
             class="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
            <span>🎨</span> Substance 3D Hub
          </a>
        </div>
      </div>

      <!-- Main Material Grid & Inspector -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 font-sans">
        
        <!-- Material Select List -->
        <div class="space-y-3">
          <h4 class="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
            Select Biophysical Substrate
          </h4>

          @for (mat of materials(); track mat.id) {
            <button (click)="selectMaterial(mat)" type="button"
                    class="w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3"
                    [ngClass]="{
                      'bg-purple-500/10 border-purple-500/60 shadow-lg': selectedMaterial().id === mat.id,
                      'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700': selectedMaterial().id !== mat.id
                    }">
              <div class="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 text-base"
                   [style.background-color]="mat.pbr.albedoHex"
                   [style.border-color]="mat.pbr.emissiveHex">
                <span class="drop-shadow">✨</span>
              </div>
              <div class="min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <h5 class="text-xs font-bold text-zinc-100 truncate">{{ mat.name }}</h5>
                  <span class="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    {{ mat.category }}
                  </span>
                </div>
                <p class="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{{ mat.description }}</p>
              </div>
            </button>
          }
        </div>

        <!-- Material PBR Parameters & 3D Shader Preview -->
        <div class="lg:col-span-2 bg-zinc-900/80 rounded-2xl p-6 border border-zinc-800 flex flex-col justify-between">
          <div>
            <!-- Active Material Title & Category -->
            <div class="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
              <div>
                <span class="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-bold">
                  {{ selectedMaterial().category }} Substrate
                </span>
                <h4 class="text-base font-bold text-zinc-100 mt-0.5">{{ selectedMaterial().name }}</h4>
              </div>
              <span class="text-xs font-mono text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
                ID: {{ selectedMaterial().id }}
              </span>
            </div>

            <!-- Description & Edwin Smith Codex Citation -->
            <div class="space-y-3 mb-6">
              <p class="text-xs text-zinc-300 leading-relaxed">{{ selectedMaterial().description }}</p>
              <div class="p-3 bg-zinc-950 rounded-xl border border-amber-500/20 text-amber-300 text-xs font-mono">
                <span class="font-bold">Codex Source:</span> {{ selectedMaterial().codexReference }}
              </div>
            </div>

            <!-- Interactive PBR Sliders & Values -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span class="text-[10px] text-zinc-500 uppercase block mb-1">Roughness</span>
                <span class="text-sm font-bold text-zinc-100">{{ selectedMaterial().pbr.roughness }}</span>
              </div>
              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span class="text-[10px] text-zinc-500 uppercase block mb-1">Metalness</span>
                <span class="text-sm font-bold text-zinc-100">{{ selectedMaterial().pbr.metalness }}</span>
              </div>
              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span class="text-[10px] text-zinc-500 uppercase block mb-1">Clearcoat</span>
                <span class="text-sm font-bold text-zinc-100">{{ selectedMaterial().pbr.clearcoat }}</span>
              </div>
              <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span class="text-[10px] text-zinc-500 uppercase block mb-1">Emissive</span>
                <span class="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-full inline-block border border-zinc-700" [style.background-color]="selectedMaterial().pbr.emissiveHex"></span>
                  {{ selectedMaterial().pbr.emissiveHex }}
                </span>
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="mt-6 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 font-mono">
            <span class="text-[11px] text-zinc-500 truncate">
              Graph: {{ selectedMaterial().substanceDesignerGraph }}
            </span>
            <button (click)="applyToWebGLViewer()" type="button"
                    class="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-lg">
              <span>⚡</span> Apply to Three.js Anatomy Mesh
            </button>
          </div>
        </div>
      </div>

      <!-- Action Confirmation Toast -->
      @if (appliedNotice()) {
        <div class="mt-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono flex items-center justify-between animate-fade-in">
          <span>{{ appliedNotice() }}</span>
          <button (click)="appliedNotice.set('')" class="text-zinc-400 hover:text-zinc-200">✕</button>
        </div>
      }
    </div>
  `
})
export class AdobeSubstanceMaterialGalleryComponent {
  readonly adobeSuite = inject(AdobeEnterpriseSuiteService);

  readonly materials = computed(() => this.adobeSuite.substanceMaterials());
  readonly selectedMaterial = signal<ISubstance3dMaterial>(this.adobeSuite.substanceMaterials()[0]);
  readonly appliedNotice = signal<string>('');

  selectMaterial(mat: ISubstance3dMaterial) {
    this.selectedMaterial.set(mat);
  }

  applyToWebGLViewer() {
    const mat = this.selectedMaterial();
    this.appliedNotice.set(`Applied ${mat.name} PBR substrate (Roughness: ${mat.pbr.roughness}, Emissive: ${mat.pbr.emissiveHex}) to Three.js WebGL rendering pipeline.`);
  }
}
