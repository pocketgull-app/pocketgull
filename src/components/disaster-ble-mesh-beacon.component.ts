import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  DisasterBleMeshService, 
  IDisasterSupplyBeacon, 
  DisasterBeaconType, 
  DisasterSupplyCategory 
} from '../services/disaster-ble-mesh.service';

@Component({
  selector: 'app-disaster-ble-mesh-beacon',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 rounded-3xl border transition-all duration-300 font-sans shadow-2xl space-y-6"
         [class.bg-black]="meshService.isKioskMode()"
         [class.border-emerald-500]="meshService.isKioskMode()"
         [class.bg-zinc-950]="!meshService.isKioskMode()"
         [class.border-zinc-800]="!meshService.isKioskMode()"
         [class.text-gray-100]="true">

      <!-- 1. Header & Operational Status -->
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="text-2xl">📡</span>
            <h2 class="text-lg font-bold text-white tracking-tight">
              Decentralized BLE Disaster Mesh & Community Mutual-Aid Beacon
            </h2>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Zero-Grid Resilience
            </span>
            @if (meshService.isKioskMode()) {
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                ⚡ KIOSK MODE ACTIVE (72h Battery Preservation)
              </span>
            }
          </div>
          <p class="text-xs text-zinc-400 mt-1 max-w-2xl">
            Autonomous peer-to-peer Web Bluetooth (BLE 5.2) and local subnet mesh. Exchange life-saving emergency supplies and cold-chain capacity with neighboring devices with zero cellular signal or internet connection.
          </p>
        </div>

        <!-- Top Action Bar -->
        <div class="flex flex-wrap items-center gap-2 self-stretch lg:self-auto">
          <button 
            type="button"
            (click)="meshService.toggleKioskMode()"
            [class.bg-amber-600]="meshService.isKioskMode()"
            [class.text-white]="meshService.isKioskMode()"
            [class.bg-zinc-900]="!meshService.isKioskMode()"
            [class.text-amber-400]="!meshService.isKioskMode()"
            class="px-3 py-2 rounded-xl border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer">
            <span>⚡</span>
            <span>{{ meshService.isKioskMode() ? 'Exit Kiosk Mode' : 'Shelter Kiosk Mode' }}</span>
          </button>

          <button 
            type="button"
            (click)="showCreateModal.set(true)"
            class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer">
            <span>➕</span>
            <span>Post Supply / Need</span>
          </button>

          <button 
            type="button"
            (click)="showQrModal.set(true)"
            class="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-mono transition flex items-center gap-1.5 border border-zinc-700 cursor-pointer">
            <span>📲</span>
            <span>QR Sneakernet</span>
          </button>

          <button 
            type="button"
            (click)="meshService.scanForBlePeers()"
            [disabled]="meshService.isScanning()"
            class="px-3 py-2 bg-sky-900/40 hover:bg-sky-900/60 border border-sky-600/50 text-sky-200 rounded-xl text-xs font-mono transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
            <span>🔄</span>
            <span>{{ meshService.isScanning() ? 'Scanning...' : 'Scan BLE' }}</span>
          </button>
        </div>
      </div>

      <!-- 2. Mesh Telemetry HUD Bar -->
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <!-- Telemetry 1: Supply Offers -->
        <div class="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800">
          <span class="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Supply Offers</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-xl font-bold text-emerald-400">{{ meshService.offersCount() }}</span>
            <span class="text-[10px] text-zinc-500 font-mono">active</span>
          </div>
        </div>

        <!-- Telemetry 2: Urgent Needs / SOS -->
        <div class="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800">
          <span class="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Urgent SOS Needs</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-xl font-bold text-rose-400">{{ meshService.needsCount() }}</span>
            <span class="text-[10px] text-rose-500 font-mono">urgent</span>
          </div>
        </div>

        <!-- Telemetry 3: Shelter Resources -->
        <div class="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800">
          <span class="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Shelter Hubs</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-xl font-bold text-sky-400">{{ meshService.resourcesCount() }}</span>
            <span class="text-[10px] text-zinc-500 font-mono">verified</span>
          </div>
        </div>

        <!-- Telemetry 4: Discovered BLE Peers -->
        <div class="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800">
          <span class="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Mesh Peers</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-xl font-bold text-amber-400">{{ meshService.discoveredPeers().length }}</span>
            <span class="text-[10px] text-zinc-500 font-mono">relays</span>
          </div>
        </div>

        <!-- Telemetry 5: Battery Reserve -->
        <div class="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800">
          <span class="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Battery Reserve</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-xl font-bold text-white">{{ meshService.batteryTelemetry().levelPct }}%</span>
            <span class="text-[10px] text-emerald-400 font-mono">~{{ meshService.batteryTelemetry().estimatedHoursRemaining }}h</span>
          </div>
        </div>

        <!-- Telemetry 6: Transport Mode -->
        <div class="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800">
          <span class="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Transport</span>
          <div class="mt-0.5 truncate">
            <span class="text-xs font-mono font-bold text-sky-300">BLE 5.2 + Gossip</span>
          </div>
        </div>
      </div>

      <!-- 3. Category Filter Tabs -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
        <button 
          type="button"
          (click)="selectedCategoryFilter.set('ALL')"
          [class.bg-zinc-800]="selectedCategoryFilter() === 'ALL'"
          [class.text-white]="selectedCategoryFilter() === 'ALL'"
          [class.text-zinc-400]="selectedCategoryFilter() !== 'ALL'"
          class="px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer">
          All Beacons ({{ meshService.activeBeacons().length }})
        </button>
        <button 
          type="button"
          (click)="selectedCategoryFilter.set('INFANT_FORMULA')"
          [class.bg-zinc-800]="selectedCategoryFilter() === 'INFANT_FORMULA'"
          [class.text-white]="selectedCategoryFilter() === 'INFANT_FORMULA'"
          [class.text-zinc-400]="selectedCategoryFilter() !== 'INFANT_FORMULA'"
          class="px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1">
          <span>🍼</span><span>Infant Formula</span>
        </button>
        <button 
          type="button"
          (click)="selectedCategoryFilter.set('INSULIN_COLD_CHAIN')"
          [class.bg-zinc-800]="selectedCategoryFilter() === 'INSULIN_COLD_CHAIN'"
          [class.text-white]="selectedCategoryFilter() === 'INSULIN_COLD_CHAIN'"
          [class.text-zinc-400]="selectedCategoryFilter() !== 'INSULIN_COLD_CHAIN'"
          class="px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1">
          <span>❄️</span><span>Insulin Cold-Chain</span>
        </button>
        <button 
          type="button"
          (click)="selectedCategoryFilter.set('CLEAN_WATER')"
          [class.bg-zinc-800]="selectedCategoryFilter() === 'CLEAN_WATER'"
          [class.text-white]="selectedCategoryFilter() === 'CLEAN_WATER'"
          [class.text-zinc-400]="selectedCategoryFilter() !== 'CLEAN_WATER'"
          class="px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1">
          <span>💧</span><span>Clean Water</span>
        </button>
        <button 
          type="button"
          (click)="selectedCategoryFilter.set('SPECIALIZED_RX')"
          [class.bg-zinc-800]="selectedCategoryFilter() === 'SPECIALIZED_RX'"
          [class.text-white]="selectedCategoryFilter() === 'SPECIALIZED_RX'"
          [class.text-zinc-400]="selectedCategoryFilter() !== 'SPECIALIZED_RX'"
          class="px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1">
          <span>💊</span><span>Essential Meds</span>
        </button>
      </div>

      <!-- 4. Active Mutual-Aid Beacons Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (beacon of filteredBeacons(); track beacon.beaconId) {
          <div class="p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-lg"
               [class.bg-zinc-900]="!meshService.isKioskMode()"
               [class.bg-black]="meshService.isKioskMode()"
               [class.border-zinc-800]="beacon.beaconType === 'OFFER'"
               [class.border-rose-500/50]="beacon.beaconType === 'NEED_SOS'"
               [class.border-sky-500/40]="beacon.beaconType === 'SHELTER_RESOURCE'">

            <div class="space-y-2.5">
              <!-- Card Header Pill Tags -->
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider"
                        [class.bg-emerald-500/20]="beacon.beaconType === 'OFFER'"
                        [class.text-emerald-400]="beacon.beaconType === 'OFFER'"
                        [class.border-emerald-500/30]="beacon.beaconType === 'OFFER'"
                        [class.bg-rose-500/20]="beacon.beaconType === 'NEED_SOS'"
                        [class.text-rose-400]="beacon.beaconType === 'NEED_SOS'"
                        [class.border-rose-500/40]="beacon.beaconType === 'NEED_SOS'"
                        [class.bg-sky-500/20]="beacon.beaconType === 'SHELTER_RESOURCE'"
                        [class.text-sky-300]="beacon.beaconType === 'SHELTER_RESOURCE'"
                        [class.border-sky-500/30]="beacon.beaconType === 'SHELTER_RESOURCE'">
                    {{ beacon.beaconType }}
                  </span>

                  <span class="text-xs text-zinc-400 font-mono">
                    {{ getCategoryEmoji(beacon.category) }} {{ beacon.category }}
                  </span>
                </div>

                @if (beacon.rssiDbm) {
                  <span class="text-[10.5px] font-mono text-zinc-400 bg-black/40 px-2 py-0.5 rounded border border-zinc-800">
                    📶 {{ beacon.rssiDbm }} dBm (Hop {{ beacon.hopCount }})
                  </span>
                }
              </div>

              <!-- Title & Quantity -->
              <div>
                <h3 class="text-sm font-bold text-white tracking-wide">{{ beacon.title }}</h3>
                <div class="text-xs font-mono text-emerald-400 font-semibold mt-0.5">
                  Available: {{ beacon.quantity }}
                </div>
              </div>

              <!-- Details & Biophysical Notes -->
              <p class="text-xs text-zinc-300 leading-relaxed">
                {{ beacon.details }}
              </p>

              <!-- Safe Harbor Location Anchor -->
              <div class="p-2.5 bg-black/40 rounded-xl border border-zinc-800/80 text-[11px] font-mono space-y-1 text-zinc-300">
                <div class="flex items-center gap-1.5 text-amber-300">
                  <span>📍</span>
                  <span class="font-bold">{{ beacon.locationAnchor }}</span>
                </div>
                <div class="text-zinc-400">
                  Contact: <span class="text-zinc-200">{{ beacon.contactAnchor }}</span>
                </div>
              </div>

              @if (beacon.coordinationStatus === 'IN_COORDINATION') {
                <div class="p-2 bg-emerald-950/30 border border-emerald-500/40 rounded-lg text-[11px] font-mono text-emerald-300 flex items-center gap-1.5">
                  <span>🤝</span>
                  <span>Coordinating: {{ beacon.coordinatedByNote }}</span>
                </div>
              }
            </div>

            <!-- Card Footer: Actions & Tamper Seal -->
            <div class="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
              <span class="text-[10px] font-mono text-zinc-500 truncate" title="SHA-256: {{ beacon.sha256Seal }}">
                Seal: {{ beacon.sha256Seal.slice(0, 12) }}...
              </span>

              <div class="flex items-center gap-1.5 shrink-0">
                @if (beacon.coordinationStatus !== 'IN_COORDINATION') {
                  <button 
                    type="button"
                    (click)="coordinateAid(beacon)"
                    class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer">
                    Coordinate Aid
                  </button>
                }
                <button 
                  type="button"
                  (click)="meshService.removeBeacon(beacon.beaconId)"
                  class="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg text-[11px] font-mono transition cursor-pointer"
                  title="Dismiss or mark expired">
                  ✕
                </button>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- 5. Modal: Post Emergency Supply Offer or Need -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 font-sans text-gray-100">
            <div class="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div class="flex items-center gap-2">
                <span class="text-xl">📢</span>
                <h3 class="text-base font-bold text-white">Broadcast Emergency Supply Beacon</h3>
              </div>
              <button 
                type="button"
                (click)="showCreateModal.set(false)"
                class="text-zinc-400 hover:text-white text-xs font-mono px-2 py-1 bg-zinc-900 rounded-lg border border-zinc-800 cursor-pointer">
                ✕ Close
              </button>
            </div>

            <div class="space-y-3 text-xs">
              <!-- Type -->
              <div>
                <label class="block font-bold text-zinc-300 mb-1 font-mono">Beacon Type:</label>
                <div class="grid grid-cols-3 gap-2">
                  <button 
                    type="button"
                    (click)="newBeaconType = 'OFFER'"
                    [class.bg-emerald-600]="newBeaconType === 'OFFER'"
                    [class.text-white]="newBeaconType === 'OFFER'"
                    [class.bg-zinc-900]="newBeaconType !== 'OFFER'"
                    [class.text-zinc-400]="newBeaconType !== 'OFFER'"
                    class="py-2 rounded-xl border border-zinc-700 font-bold transition text-center cursor-pointer">
                    Offer Supply
                  </button>
                  <button 
                    type="button"
                    (click)="newBeaconType = 'NEED_SOS'"
                    [class.bg-rose-600]="newBeaconType === 'NEED_SOS'"
                    [class.text-white]="newBeaconType === 'NEED_SOS'"
                    [class.bg-zinc-900]="newBeaconType !== 'NEED_SOS'"
                    [class.text-zinc-400]="newBeaconType !== 'NEED_SOS'"
                    class="py-2 rounded-xl border border-zinc-700 font-bold transition text-center cursor-pointer">
                    Urgent SOS Need
                  </button>
                  <button 
                    type="button"
                    (click)="newBeaconType = 'SHELTER_RESOURCE'"
                    [class.bg-sky-600]="newBeaconType === 'SHELTER_RESOURCE'"
                    [class.text-white]="newBeaconType === 'SHELTER_RESOURCE'"
                    [class.bg-zinc-900]="newBeaconType !== 'SHELTER_RESOURCE'"
                    [class.text-zinc-400]="newBeaconType !== 'SHELTER_RESOURCE'"
                    class="py-2 rounded-xl border border-zinc-700 font-bold transition text-center cursor-pointer">
                    Shelter Resource
                  </button>
                </div>
              </div>

              <!-- Category -->
              <div>
                <label class="block font-bold text-zinc-300 mb-1 font-mono">Category:</label>
                <select 
                  [(ngModel)]="newBeaconCategory"
                  class="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-xs text-white font-mono focus:border-emerald-500 focus:outline-none">
                  <option value="INFANT_FORMULA">🍼 Infant Formula (Powder/Liquid)</option>
                  <option value="INSULIN_COLD_CHAIN">❄️ Insulin Cold-Chain Refrigeration</option>
                  <option value="CLEAN_WATER">💧 Clean Drinking Water / Filtration</option>
                  <option value="PORTABLE_POWER">⚡ Portable Power / Solar Charging</option>
                  <option value="FIRST_AID">🩹 First Aid / Trauma Supplies</option>
                  <option value="OXYGEN">🫁 Oxygen Concentrator / Tanks</option>
                  <option value="SHELTER_BED">🛏️ Shelter Bed / Warm Cot</option>
                  <option value="SPECIALIZED_RX">💊 Specialized Essential Prescription</option>
                </select>
              </div>

              <!-- Title -->
              <div>
                <label class="block font-bold text-zinc-300 mb-1 font-mono">Title:</label>
                <input 
                  type="text" 
                  [(ngModel)]="newBeaconTitle"
                  placeholder="e.g. Infant Formula Available (Enfamil)"
                  class="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-xs text-white font-sans focus:border-emerald-500 focus:outline-none">
              </div>

              <!-- Quantity -->
              <div>
                <label class="block font-bold text-zinc-300 mb-1 font-mono">Quantity:</label>
                <input 
                  type="text" 
                  [(ngModel)]="newBeaconQuantity"
                  placeholder="e.g. 2 unopened cans"
                  class="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-xs text-white font-sans focus:border-emerald-500 focus:outline-none">
              </div>

              <!-- Location Anchor -->
              <div>
                <label class="block font-bold text-zinc-300 mb-1 font-mono">Location Anchor (Safe Harbor):</label>
                <input 
                  type="text" 
                  [(ngModel)]="newBeaconLocation"
                  placeholder="e.g. Apt 3B (2nd Floor North Stairwell)"
                  class="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-xs text-white font-sans focus:border-emerald-500 focus:outline-none">
              </div>

              <!-- Details -->
              <div>
                <label class="block font-bold text-zinc-300 mb-1 font-mono">Details & Instructions:</label>
                <textarea 
                  [(ngModel)]="newBeaconDetails"
                  rows="3"
                  placeholder="Add specific instructions for neighbors or responders..."
                  class="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-xs text-white font-sans focus:border-emerald-500 focus:outline-none"></textarea>
              </div>
            </div>

            <!-- Submit -->
            <div class="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
              <button 
                type="button"
                (click)="showCreateModal.set(false)"
                class="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-mono transition cursor-pointer">
                Cancel
              </button>
              <button 
                type="button"
                (click)="submitNewBeacon()"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg cursor-pointer">
                <span>📡</span>
                <span>Broadcast over BLE Mesh</span>
              </button>
            </div>
          </div>
        </div>
      }

      <!-- 6. Modal: Optical QR Visual Mesh Sneakernet -->
      @if (showQrModal()) {
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 font-sans text-gray-100">
            <div class="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div class="flex items-center gap-2">
                <span class="text-xl">📲</span>
                <h3 class="text-base font-bold text-white">Optical QR Mesh Sneakernet</h3>
              </div>
              <button 
                type="button"
                (click)="showQrModal.set(false)"
                class="text-zinc-400 hover:text-white text-xs font-mono px-2 py-1 bg-zinc-900 rounded-lg border border-zinc-800 cursor-pointer">
                ✕ Close
              </button>
            </div>

            <p class="text-xs text-zinc-300">
              When Bluetooth is disabled or restricted, exchange active mutual-aid supply beacons between devices optically.
            </p>

            <!-- Export Payload -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>Active Mesh QR String:</span>
                <button 
                  type="button"
                  (click)="copyQrString()"
                  class="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 cursor-pointer">
                  {{ copiedQr() ? '✓ Copied' : 'Copy' }}
                </button>
              </div>
              <div class="p-3 bg-black rounded-xl border border-zinc-800 font-mono text-[10px] text-zinc-400 max-h-24 overflow-y-auto break-all">
                {{ currentQrPayload() }}
              </div>
            </div>

            <!-- Import Payload -->
            <div class="space-y-2 pt-2 border-t border-zinc-800">
              <label class="block text-xs font-mono font-bold text-zinc-300">Import Scanned Mesh String:</label>
              <input 
                type="text" 
                [(ngModel)]="incomingQrInput"
                placeholder="Paste optical QR string from neighbor..."
                class="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-xs text-white font-mono focus:border-emerald-500 focus:outline-none">
              
              <button 
                type="button"
                (click)="importQrPayload()"
                class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer">
                <span>📥</span>
                <span>Ingest Beacons into Local Mesh</span>
              </button>

              @if (qrImportFeedback()) {
                <div class="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-mono text-center">
                  {{ qrImportFeedback() }}
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class DisasterBleMeshBeaconComponent {
  readonly meshService = inject(DisasterBleMeshService);

  readonly selectedCategoryFilter = signal<string>('ALL');
  readonly showCreateModal = signal<boolean>(false);
  readonly showQrModal = signal<boolean>(false);
  readonly copiedQr = signal<boolean>(false);
  readonly qrImportFeedback = signal<string | null>(null);

  // Form Model
  newBeaconType: DisasterBeaconType = 'OFFER';
  newBeaconCategory: DisasterSupplyCategory = 'INFANT_FORMULA';
  newBeaconTitle = '';
  newBeaconQuantity = '';
  newBeaconLocation = '';
  newBeaconDetails = '';
  incomingQrInput = '';

  readonly currentQrPayload = computed(() => this.meshService.exportVisualMeshQrPayload());

  readonly filteredBeacons = computed(() => {
    const list = this.meshService.activeBeacons();
    const filter = this.selectedCategoryFilter();
    if (filter === 'ALL') return list;
    return list.filter(b => b.category === filter);
  });

  getCategoryEmoji(category: DisasterSupplyCategory): string {
    switch (category) {
      case 'INFANT_FORMULA': return '🍼';
      case 'INSULIN_COLD_CHAIN': return '❄️';
      case 'CLEAN_WATER': return '💧';
      case 'PORTABLE_POWER': return '⚡';
      case 'FIRST_AID': return '🩹';
      case 'OXYGEN': return '🫁';
      case 'SHELTER_BED': return '🛏️';
      case 'SPECIALIZED_RX': return '💊';
      default: return '📦';
    }
  }

  coordinateAid(beacon: IDisasterSupplyBeacon): void {
    const note = `Coordinating via responder node at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    this.meshService.acknowledgeOrCoordinateAid(beacon.beaconId, note);
  }

  submitNewBeacon(): void {
    if (!this.newBeaconTitle.trim()) return;

    this.meshService.broadcastSupplyBeacon({
      beaconType: this.newBeaconType,
      category: this.newBeaconCategory,
      title: this.newBeaconTitle,
      details: this.newBeaconDetails || 'Community mutual-aid supply beacon.',
      quantity: this.newBeaconQuantity || 'Available upon contact',
      locationAnchor: this.newBeaconLocation || 'Field Mutual-Aid Anchor',
      contactAnchor: 'Field Responder',
      ttlHours: 48
    });

    this.showCreateModal.set(false);
    this.newBeaconTitle = '';
    this.newBeaconQuantity = '';
    this.newBeaconLocation = '';
    this.newBeaconDetails = '';
  }

  copyQrString(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.currentQrPayload()).catch(() => {});
    }
    this.copiedQr.set(true);
    setTimeout(() => this.copiedQr.set(false), 2000);
  }

  importQrPayload(): void {
    if (!this.incomingQrInput.trim()) return;
    const result = this.meshService.importVisualMeshQrPayload(this.incomingQrInput.trim());
    if (result.success) {
      this.qrImportFeedback.set(`✓ Ingested ${result.importedCount} beacons into mesh!`);
      this.incomingQrInput = '';
      setTimeout(() => this.qrImportFeedback.set(null), 3000);
    } else {
      this.qrImportFeedback.set(`❌ Invalid optical mesh string.`);
    }
  }
}
