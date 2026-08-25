import { Component, ChangeDetectionStrategy, signal, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';

@Component({
  selector: 'app-lidar-scan-upload-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-mono">
      <div class="w-full max-w-xl bg-zinc-950 text-zinc-100 rounded-3xl border border-cyan-500/30 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div class="flex items-center gap-2">
            <span class="text-xl">📸</span>
            <div>
              <h3 class="text-base font-bold text-white uppercase tracking-wider">LiDAR & Photogrammetry Mesh Upload</h3>
              <p class="text-[11px] text-zinc-400 font-sans">Import 3D patient body scan (.glb / .gltf / .usdz)</p>
            </div>
          </div>
          <button (click)="closeModal.emit()" class="p-2 hover:bg-zinc-900 rounded-xl text-zinc-400 hover:text-white transition cursor-pointer">
            ✕
          </button>
        </div>

        <!-- Drag & Drop Zone -->
        <div (dragover)="onDragOver($event)" (drop)="onDrop($event)"
          class="p-8 border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/20 rounded-2xl text-center space-y-3 transition-all cursor-pointer">
          <div class="w-12 h-12 mx-auto rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-2xl">
            ☁️
          </div>
          <div class="space-y-1">
            <p class="text-xs font-bold text-cyan-200">Drag & Drop 3D Model Binary Here</p>
            <p class="text-[10px] text-zinc-400">Supports .glb, .gltf, .usdz (Max 50MB)</p>
          </div>
          <label class="inline-block px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer active:scale-95 shadow-md">
            Browse File
            <input type="file" (change)="onFileSelected($event)" accept=".glb,.gltf,.usdz" class="hidden" />
          </label>
        </div>

        <!-- Processing Status Feedback -->
        @if (uploadedFileName()) {
          <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-zinc-300 font-bold">Loaded: {{ uploadedFileName() }}</span>
              <span class="text-emerald-400 font-bold">Ready for Calibration</span>
            </div>
            <div class="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div class="h-full bg-cyan-400 animate-pulse w-full"></div>
            </div>
            <p class="text-[10px] text-zinc-400">Normalizing vertex bounds to 1.75m vertical frame & auto-anchoring acupoints...</p>
          </div>
        }

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <button (click)="closeModal.emit()" class="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider transition cursor-pointer">
            Cancel
          </button>
          <button (click)="applyScanMesh()" [disabled]="!uploadedFileName()"
            class="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer active:scale-95 shadow-lg flex items-center gap-2">
            <span>✨ Apply Patient Digital Twin</span>
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class LidarScanUploadModalComponent {
  private readonly patientState = inject(PatientStateService);

  readonly closeModal = output<void>();
  readonly uploadedFileName = signal<string | null>(null);

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.uploadedFileName.set(files[0].name);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadedFileName.set(input.files[0].name);
    }
  }

  applyScanMesh() {
    if (this.uploadedFileName()) {
      const mockUrl = `/assets/models/${this.uploadedFileName()}`;
      const profile = this.patientState.anatomicProfile();
      this.patientState.anatomicProfile.set({
        ...profile,
        customLiDARScanUrl: mockUrl
      });
      this.closeModal.emit();
    }
  }
}
