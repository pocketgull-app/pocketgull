import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IDesktopAppRelease {
  platform: string;
  icon: string;
  version: string;
  fileSize: string;
  installerType: string;
  downloadUrl: string;
  status: string;
}

@Component({
  selector: 'app-pocketgull-desktop-suite',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-gradient-to-br from-slate-900 via-zinc-900 to-indigo-950 text-white rounded-2xl border border-indigo-800/40 shadow-2xl transition-all">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-indigo-800/40">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🖥️</span>
            <h2 class="text-xl font-bold text-gray-100">Pocket-Gull Desktop Suite (macOS & Windows 11)</h2>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Tauri v2 + Rust Core
            </span>
          </div>
          <p class="text-xs text-gray-400 mt-1">
            Ultra-lightweight (~8 MB RAM) desktop HUD with Menu Bar / System Tray biometrics & global EHR dictation hotkeys.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="toggleSystemTray()" class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md">
            <span>{{ isSystemTrayActive() ? '🟢 Tray Active' : '⚪ Launch Tray' }}</span>
          </button>
        </div>
      </div>

      <!-- Feature Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        <!-- Feature 1: Menu Bar / System Tray -->
        <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
          <div class="flex items-center gap-2 mb-2 text-indigo-400 font-bold text-xs">
            <span>📌</span> Menu Bar & System Tray Telemetry
          </div>
          <p class="text-xs text-gray-300 mb-3">
            Real-time biometric badges (HRV, SIBI, Glucose) live silently in the macOS Menu Bar and Windows Taskbar.
          </p>
          <div class="p-2.5 bg-black/50 rounded-lg border border-indigo-900/50 text-[11px] font-mono text-emerald-400 flex items-center justify-between">
            <span>SIBI: 62 (Optimal)</span>
            <span class="text-xs">⚡ 432Hz</span>
          </div>
        </div>

        <!-- Feature 2: Global EHR Dictation Hotkey -->
        <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
          <div class="flex items-center gap-2 mb-2 text-indigo-400 font-bold text-xs">
            <span>⌨️</span> Ambient EHR Dictation Hotkey
          </div>
          <p class="text-xs text-gray-300 mb-3">
            Press <code class="font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-amber-300">Option + Space</code> (Mac) or <code class="font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-amber-300">Win + Alt + P</code> (Windows) to stream formatted SOAP notes into Epic or Cerner.
          </p>
          <div class="text-[11px] text-gray-400 font-mono">Hotkey state: <span class="text-emerald-400">Registered</span></div>
        </div>

        <!-- Feature 3: On-Device NPU Acceleration -->
        <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
          <div class="flex items-center gap-2 mb-2 text-indigo-400 font-bold text-xs">
            <span>⚡</span> Metal & DirectML Hardware Acceleration
          </div>
          <p class="text-xs text-gray-300 mb-3">
            Executes local Gemma 2B inference directly on Apple Silicon Neural Engine (NPU) and Windows DirectML GPUs.
          </p>
          <div class="text-[11px] text-gray-400 font-mono">Hardware: <span class="text-indigo-300">Apple M-Series / DirectML Ready</span></div>
        </div>

      </div>

      <!-- Release Download Cards -->
      <h3 class="text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
        <span>📦</span> Native Desktop Installers
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (rel of desktopReleases(); track rel.platform) {
          <div class="p-4 bg-zinc-800/60 rounded-xl border border-zinc-700/60 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-3xl">{{ rel.icon }}</span>
              <div>
                <div class="text-xs font-bold text-gray-100">{{ rel.platform }}</div>
                <div class="text-[11px] text-gray-400">v{{ rel.version }} &bull; {{ rel.installerType }} &bull; {{ rel.fileSize }}</div>
                <div class="text-[10px] text-emerald-400 font-semibold mt-0.5">● {{ rel.status }}</div>
              </div>
            </div>

            <button (click)="downloadInstaller(rel)" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold transition cursor-pointer shadow-md">
              ⬇️ Download {{ rel.installerType }}
            </button>
          </div>
        }
      </div>

    </div>
  `
})
export class PocketgullDesktopSuiteComponent {
  readonly isSystemTrayActive = signal(true);

  readonly desktopReleases = signal<IDesktopAppRelease[]>([
    {
      platform: 'macOS (Universal M1-M4 / Intel)',
      icon: '🍎',
      version: '1.16.0',
      fileSize: '8.4 MB',
      installerType: 'Universal .dmg',
      downloadUrl: '/downloads/PocketGull-Desktop-macOS-v1.16.0.dmg',
      status: 'Ready to Install'
    },
    {
      platform: 'Windows 11 (x64 / ARM64)',
      icon: '🪟',
      version: '1.16.0',
      fileSize: '9.1 MB',
      installerType: 'MSI / EXE Installer',
      downloadUrl: '/downloads/PocketGull-Desktop-Windows-v1.16.0.msi',
      status: 'Ready to Install'
    },
    {
      platform: 'Linux (Ubuntu / Debian / Snap Store)',
      icon: '🐧',
      version: '1.16.0',
      fileSize: '12.4 MB',
      installerType: 'Snap Package (.snap)',
      downloadUrl: '/downloads/pocketgull-desktop_1.16.0_amd64.snap',
      status: 'Canonical Snapcraft Verified'
    },
    {
      platform: 'Linux Standalone (Universal AppImage)',
      icon: '📦',
      version: '1.16.0',
      fileSize: '11.8 MB',
      installerType: 'AppImage (.AppImage)',
      downloadUrl: '/downloads/PocketGull-Desktop-v1.16.0.AppImage',
      status: 'Ready to Execute'
    }
  ]);

  toggleSystemTray(): void {
    this.isSystemTrayActive.update(v => !v);
  }

  downloadInstaller(rel: IDesktopAppRelease): void {
    alert(`Downloading ${rel.platform} native desktop bundle (${rel.fileSize}). Installer package: ${rel.installerType}`);
  }
}
