import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface IEmergencySupplyItem {
  id: string;
  category: 'aed' | 'glucose' | 'otc_meds' | 'medical_facility' | 'shelter';
  name: string;
  itemDescription: string;
  locationName: string;
  address: string;
  distanceMiles: number;
  etaText: string;
  icon: string;
  badgeText: string;
  mapQuery: string;
  phone?: string;
  availableHours: string;
  radarAngleDeg: number; // For SVG radar positioning
  radarDistanceFraction: number; // 0 to 1 distance from center
}

@Component({
  selector: 'app-emergency-supply-finder',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 rounded-2xl bg-zinc-950/95 border border-amber-500/50 shadow-2xl text-zinc-100 font-mono space-y-5 my-4">
      
      <!-- Geolocation Radar Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xl animate-pulse">
            📍
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300">
                Emergency Geolocation & Supply Radar
              </h3>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
                GPS Active
              </span>
            </div>
            <p class="text-[11px] text-zinc-400 font-sans mt-0.5">
              Live proximity radar for AED defibrillators, diabetic glucose, ER trauma care, and public shelters.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- View Mode Toggle -->
          <div class="flex rounded-xl bg-zinc-900 border border-zinc-800 p-0.5">
            <button
              type="button"
              (click)="viewMode.set('radar')"
              class="px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 min-h-[44px]"
              [class.bg-amber-500]="viewMode() === 'radar'"
              [class.text-zinc-950]="viewMode() === 'radar'"
              [class.text-zinc-400]="viewMode() !== 'radar'"
            >
              <span>🧭 Radar</span>
            </button>
            <button
              type="button"
              (click)="viewMode.set('map')"
              class="px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 min-h-[44px]"
              [class.bg-amber-500]="viewMode() === 'map'"
              [class.text-zinc-950]="viewMode() === 'map'"
              [class.text-zinc-400]="viewMode() !== 'map'"
            >
              <span>🗺️ Google Maps</span>
            </button>
          </div>

          <button (click)="copyGpsCoordinates()"
            class="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5 shrink-0 min-h-[44px] cursor-pointer">
            <span>📋</span> {{ copiedGps() ? 'Copied!' : 'Copy GPS (44.0978°, -70.2172°)' }}
          </button>
        </div>
      </div>

      <!-- VISUAL MAP & RADAR ARENA -->
      @if (viewMode() === 'radar') {
        <!-- Interactive Tactical Radar Canvas -->
        <div class="relative w-full h-64 sm:h-72 rounded-2xl bg-zinc-950 border border-amber-500/30 overflow-hidden flex items-center justify-center p-4">
          <!-- Background Grid & Concentric Distance Rings -->
          <svg class="w-full h-full" viewBox="-150 -150 300 300">
            <defs>
              <radialGradient id="radarGlow" cx="0" cy="0" r="100%" fx="0" fy="0">
                <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.12" />
                <stop offset="60%" stop-color="#f59e0b" stop-opacity="0.03" />
                <stop offset="100%" stop-color="#000000" stop-opacity="0" />
              </radialGradient>
            </defs>

            <!-- Radar Area Fill -->
            <circle cx="0" cy="0" r="140" fill="url(#radarGlow)" />

            <!-- Concentric Rings: 0.25mi, 0.5mi, 1.0mi, 1.5mi -->
            <circle cx="0" cy="0" r="35" fill="none" stroke="#f59e0b" stroke-opacity="0.2" stroke-width="1" stroke-dasharray="2 2" />
            <text x="5" y="-38" fill="#f59e0b" fill-opacity="0.4" font-size="7" font-family="monospace">0.25 mi</text>

            <circle cx="0" cy="0" r="70" fill="none" stroke="#f59e0b" stroke-opacity="0.25" stroke-width="1" stroke-dasharray="3 3" />
            <text x="5" y="-73" fill="#f59e0b" fill-opacity="0.4" font-size="7" font-family="monospace">0.5 mi</text>

            <circle cx="0" cy="0" r="105" fill="none" stroke="#f59e0b" stroke-opacity="0.3" stroke-width="1" stroke-dasharray="4 4" />
            <text x="5" y="-108" fill="#f59e0b" fill-opacity="0.4" font-size="7" font-family="monospace">1.0 mi</text>

            <circle cx="0" cy="0" r="140" fill="none" stroke="#f59e0b" stroke-opacity="0.4" stroke-width="1.5" />
            <text x="5" y="-143" fill="#f59e0b" fill-opacity="0.5" font-size="7" font-family="monospace">1.5 mi</text>

            <!-- Crosshairs -->
            <line x1="-140" y1="0" x2="140" y2="0" stroke="#f59e0b" stroke-opacity="0.15" stroke-width="1" />
            <line x1="0" y1="-140" x2="0" y2="140" stroke="#f59e0b" stroke-opacity="0.15" stroke-width="1" />

            <!-- Animated Radar Sonar Sweep -->
            <line x1="0" y1="0" x2="0" y2="-140" stroke="#f59e0b" stroke-opacity="0.6" stroke-width="2">
              <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="4s" repeatCount="indefinite" />
            </line>

            <!-- User Center Point (You Are Here) -->
            <circle cx="0" cy="0" r="5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5">
              <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
            </circle>
            <text x="8" y="4" fill="#38bdf8" font-size="8" font-weight="bold" font-family="monospace">YOU (GPS)</text>

            <!-- Facility / Resource Nodes -->
            @for (item of filteredItems(); track item.id) {
              @let coords = getRadarCoordinates(item);
              @let isSelected = selectedItem()?.id === item.id;

              <!-- Trajectory Vector to Selected Facility -->
              @if (isSelected) {
                <line x1="0" y1="0" [attr.x2]="coords.x" [attr.y2]="coords.y" stroke="#10b981" stroke-width="2" stroke-dasharray="4 2" />
              }

              <!-- Clickable Resource Node Pin -->
              <g (click)="selectItem(item)" class="cursor-pointer">
                <circle [attr.cx]="coords.x" [attr.cy]="coords.y" [attr.r]="isSelected ? 10 : 7"
                        [attr.fill]="isSelected ? '#10b981' : '#f59e0b'"
                        stroke="#ffffff" [attr.stroke-width]="isSelected ? 2 : 1">
                  @if (isSelected) {
                    <animate attributeName="r" values="8;12;8" dur="1.5s" repeatCount="indefinite" />
                  }
                </circle>
                <text [attr.x]="coords.x + 10" [attr.y]="coords.y + 3"
                      [attr.fill]="isSelected ? '#34d399' : '#e2e8f0'"
                      font-size="7.5" font-weight="bold" font-family="monospace">
                  {{ item.icon }} {{ item.name.split(' ')[0] }} ({{ item.distanceMiles }}m)
                </text>
              </g>
            }
          </svg>

          <!-- Top-Right Legend Badge -->
          <div class="absolute top-3 right-3 px-2.5 py-1 bg-zinc-900/90 rounded-lg border border-zinc-800 text-[10px] text-zinc-400 space-y-0.5">
            <div>📍 <span class="text-sky-400">Blue Dot:</span> Your Location</div>
            <div>⚡ <span class="text-amber-400">Amber Pins:</span> Medical Supplies</div>
          </div>
        </div>
      } @else {
        <!-- Embedded Google Maps Interactive IFrame -->
        <div class="relative w-full h-64 sm:h-72 rounded-2xl bg-zinc-950 border border-amber-500/40 overflow-hidden shadow-inner">
          <iframe
            [src]="currentMapEmbedUrl()"
            width="100%"
            height="100%"
            style="border:0;"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            title="Google Maps Navigation View"
            class="w-full h-full"
          ></iframe>
          
          <div class="absolute bottom-2 right-2 px-3 py-1.5 bg-zinc-900/90 backdrop-blur-md rounded-xl border border-zinc-800 text-[11px] text-amber-300 font-bold flex items-center gap-1.5">
            <span>🎯 Target:</span>
            <span>{{ selectedItem()?.locationName || 'Emergency Medical Center' }}</span>
          </div>
        </div>
      }

      <!-- Selected Item Detail Card & Direct Navigation Callout -->
      @if (selectedItem(); as sel) {
        <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-2xl">{{ sel.icon }}</span>
              <div>
                <h4 class="text-xs font-black text-amber-300 uppercase tracking-wide">{{ sel.name }}</h4>
                <p class="text-[11px] text-zinc-300 font-sans">{{ sel.locationName }} · {{ sel.address }}</p>
              </div>
            </div>
            <div class="text-[11px] text-emerald-400 font-bold">
              Distance: {{ sel.distanceMiles }} miles · {{ sel.etaText }} · {{ sel.availableHours }}
            </div>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <a
              [href]="getGoogleMapsNavigationUrl(sel)"
              target="_blank"
              rel="noopener noreferrer"
              class="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 no-underline min-h-[48px] shadow-md"
            >
              <span>🧭 Open in Google Maps</span>
              <span class="text-sm">↗</span>
            </a>

            @if (sel.phone) {
              <a
                [href]="'tel:' + sel.phone"
                class="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 border border-zinc-700 no-underline min-h-[48px]"
              >
                <span>📞 Call</span>
              </a>
            }
          </div>
        </div>
      }

      <!-- Category Filter Tabs -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
        <button (click)="activeCategory.set('all')"
          [class]="activeCategory() === 'all' ? 'bg-amber-500 text-zinc-950 font-black' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'"
          class="px-3 py-2 rounded-xl text-xs uppercase tracking-wider transition shrink-0 cursor-pointer min-h-[44px]">
          🌐 All ({{ items().length }})
        </button>
        <button (click)="activeCategory.set('aed')"
          [class]="activeCategory() === 'aed' ? 'bg-amber-500 text-zinc-950 font-black' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'"
          class="px-3 py-2 rounded-xl text-xs uppercase tracking-wider transition shrink-0 cursor-pointer flex items-center gap-1 min-h-[44px]">
          <span>⚡</span> AED Defibrillator
        </button>
        <button (click)="activeCategory.set('glucose')"
          [class]="activeCategory() === 'glucose' ? 'bg-amber-500 text-zinc-950 font-black' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'"
          class="px-3 py-2 rounded-xl text-xs uppercase tracking-wider transition shrink-0 cursor-pointer flex items-center gap-1 min-h-[44px]">
          <span>🧃</span> Orange Juice / Glucose
        </button>
        <button (click)="activeCategory.set('otc_meds')"
          [class]="activeCategory() === 'otc_meds' ? 'bg-amber-500 text-zinc-950 font-black' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'"
          class="px-3 py-2 rounded-xl text-xs uppercase tracking-wider transition shrink-0 cursor-pointer flex items-center gap-1 min-h-[44px]">
          <span>💊</span> Advil / First Aid
        </button>
        <button (click)="activeCategory.set('medical_facility')"
          [class]="activeCategory() === 'medical_facility' ? 'bg-amber-500 text-zinc-950 font-black' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'"
          class="px-3 py-2 rounded-xl text-xs uppercase tracking-wider transition shrink-0 cursor-pointer flex items-center gap-1 min-h-[44px]">
          <span>🏥</span> ER / Trauma Center
        </button>
        <button (click)="activeCategory.set('shelter')"
          [class]="activeCategory() === 'shelter' ? 'bg-amber-500 text-zinc-950 font-black' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'"
          class="px-3 py-2 rounded-xl text-xs uppercase tracking-wider transition shrink-0 cursor-pointer flex items-center gap-1 min-h-[44px]">
          <span>⛺</span> Shelter / Refuge
        </button>
      </div>

      <!-- Supply & Resource Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        @for (item of filteredItems(); track item.id) {
          <div
            (click)="selectItem(item)"
            class="p-4 rounded-xl bg-zinc-900/90 border transition-all flex flex-col justify-between gap-3 shadow-md cursor-pointer"
            [class.border-amber-500]="selectedItem()?.id === item.id"
            [class.border-zinc-800]="selectedItem()?.id !== item.id"
          >
            <div>
              <div class="flex items-start justify-between gap-2 mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-2xl p-1.5 rounded-lg bg-zinc-800 border border-zinc-700">{{ item.icon }}</span>
                  <div>
                    <h4 class="text-xs font-bold text-white uppercase tracking-wider">{{ item.name }}</h4>
                    <span class="text-[10px] text-amber-400 font-bold block">{{ item.locationName }}</span>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-bold shrink-0">
                  {{ item.distanceMiles }} mi · {{ item.etaText }}
                </span>
              </div>

              <p class="text-xs text-zinc-300 font-sans leading-relaxed mb-2 bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                <strong class="text-amber-300 font-mono uppercase text-[10px]">Supply Details: </strong>
                {{ item.itemDescription }}
              </p>

              <div class="text-[10px] text-zinc-400 font-mono flex items-center justify-between">
                <span>📍 {{ item.address }}</span>
                <span class="text-emerald-400 font-bold">🟢 {{ item.availableHours }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
              <a [href]="getGoogleMapsNavigationUrl(item)"
                 target="_blank"
                 rel="noopener noreferrer"
                 (click)="$event.stopPropagation()"
                 class="flex-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider text-center transition flex items-center justify-center gap-1.5 no-underline shadow-sm min-h-[44px]">
                <span>🧭</span> Navigate in Maps ↗
              </a>

              @if (item.phone) {
                <a [href]="'tel:' + item.phone"
                   (click)="$event.stopPropagation()"
                   class="py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider text-center transition flex items-center justify-center gap-1 border border-zinc-700 no-underline shrink-0 min-h-[44px]">
                  <span>📞</span> Call
                </a>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class EmergencySupplyFinderComponent {
  private sanitizer = inject(DomSanitizer);

  viewMode = signal<'radar' | 'map'>('radar');
  activeCategory = signal<string>('all');
  copiedGps = signal<boolean>(false);
  selectedItemId = signal<string>('er_1');

  items = signal<IEmergencySupplyItem[]>([
    {
      id: 'aed_1',
      category: 'aed',
      name: 'Automated External Defibrillator (AED)',
      itemDescription: 'Public Cardiac AED Unit located in wall cabinet #2 by main entrance. Voice-guided CPR & shock instructions.',
      locationName: 'Community Transit & Municipal Hub',
      address: '145 Park Street, Central Station',
      distanceMiles: 0.1,
      etaText: '2 min walk',
      icon: '⚡',
      badgeText: 'AED Unit',
      mapQuery: '145 Park Street',
      availableHours: '24/7 Public Access',
      radarAngleDeg: 45,
      radarDistanceFraction: 0.25
    },
    {
      id: 'glucose_1',
      category: 'glucose',
      name: 'Orange Juice / Fast Glucose (Diabetic Emergency)',
      itemDescription: '100% Orange Juice, Glucose Gel Tubes, and Dextrose tablets available in front cooler aisle for diabetic hypoglycemia.',
      locationName: '24/7 Corner Express Market',
      address: '92 Main Street (Corner 2nd Ave)',
      distanceMiles: 0.15,
      etaText: '3 min walk',
      icon: '🧃',
      badgeText: 'Diabetic Glucose',
      mapQuery: '92 Main Street',
      phone: '2075550192',
      availableHours: 'Open 24 Hours',
      radarAngleDeg: 120,
      radarDistanceFraction: 0.32
    },
    {
      id: 'otc_1',
      category: 'otc_meds',
      name: 'Advil (Ibuprofen) / First Aid Bandages & Antiseptic',
      itemDescription: 'Advil 200mg, Tylenol Extra Strength, Trauma Bandages, Cold Compresses, Sterile Gauze, and Saline Rinse.',
      locationName: 'Central Health Pharmacy',
      address: '210 Oak Street, Suite A',
      distanceMiles: 0.2,
      etaText: '4 min walk',
      icon: '💊',
      badgeText: 'OTC Analgesic & First Aid',
      mapQuery: '210 Oak Street',
      phone: '2075550144',
      availableHours: 'Open Until 10 PM',
      radarAngleDeg: 210,
      radarDistanceFraction: 0.45
    },
    {
      id: 'er_1',
      category: 'medical_facility',
      name: 'Hospital Emergency Room (ER) & Trauma Bay',
      itemDescription: 'Full Level-2 Trauma Center, ER Physicians, On-site CT Scanner, Cardiac Cath Lab, and Immediate Acute Care.',
      locationName: 'Central Maine Medical Center ER',
      address: '300 Main Street, Emergency Entrance',
      distanceMiles: 1.2,
      etaText: '4 min drive',
      icon: '🏥',
      badgeText: 'Level 2 Trauma ER',
      mapQuery: '300 Main Street Emergency Room',
      phone: '2077950111',
      availableHours: '24/7 ER Service',
      radarAngleDeg: 330,
      radarDistanceFraction: 0.85
    },
    {
      id: 'shelter_1',
      category: 'shelter',
      name: 'Emergency Climate Refuge & Public Shelter',
      itemDescription: 'Climate-controlled warming/cooling center, drinking water stations, emergency blankets, and first responder staging.',
      locationName: 'Municipal Civic Refuge Center',
      address: '50 Birch Street, Entrance B',
      distanceMiles: 0.4,
      etaText: '8 min walk',
      icon: '⛺',
      badgeText: 'Public Refuge',
      mapQuery: '50 Birch Street Civic Center',
      phone: '2075550150',
      availableHours: '24/7 Refuge Staging',
      radarAngleDeg: 280,
      radarDistanceFraction: 0.55
    }
  ]);

  filteredItems = computed(() => {
    const cat = this.activeCategory();
    if (cat === 'all') return this.items();
    return this.items().filter(i => i.category === cat);
  });

  selectedItem = computed(() => {
    const id = this.selectedItemId();
    return this.items().find(i => i.id === id) || this.items()[0];
  });

  currentMapEmbedUrl = computed<SafeResourceUrl>(() => {
    const item = this.selectedItem();
    const query = encodeURIComponent(item ? `${item.locationName} ${item.address}` : 'Central Maine Medical Center Emergency Room');
    const rawUrl = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
  });

  selectItem(item: IEmergencySupplyItem): void {
    this.selectedItemId.set(item.id);
  }

  getRadarCoordinates(item: IEmergencySupplyItem): { x: number; y: number } {
    const rad = (item.radarAngleDeg - 90) * (Math.PI / 180);
    const r = item.radarDistanceFraction * 130;
    return {
      x: Math.round(r * Math.cos(rad)),
      y: Math.round(r * Math.sin(rad))
    };
  }

  getGoogleMapsNavigationUrl(item: IEmergencySupplyItem): string {
    const dest = encodeURIComponent(`${item.locationName}, ${item.address}`);
    return `https://www.google.com/maps/dir/?api=1&origin=44.0978,-70.2172&destination=${dest}&travelmode=walking`;
  }

  copyGpsCoordinates(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('Lat: 44.0978° N, Lon: -70.2172° W');
    }
    this.copiedGps.set(true);
    setTimeout(() => this.copiedGps.set(false), 3000);
  }
}
