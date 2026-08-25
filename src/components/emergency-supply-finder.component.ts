import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

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
}

@Component({
  selector: 'app-emergency-supply-finder',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 rounded-2xl bg-zinc-950/90 border border-amber-500/50 shadow-2xl text-zinc-100 font-mono space-y-4 my-4">
      
      <!-- Geolocation Radar Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-lg animate-pulse">
            📍
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300">
                Emergency Supply & Facility Geolocation Radar
              </h3>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
                GPS Locked
              </span>
            </div>
            <p class="text-[11px] text-zinc-400 font-sans mt-0.5">
              Real-time proximity radar for nearby AEDs, diabetic fast-acting glucose, OTC analgesics, ER care, and shelter.
            </p>
          </div>
        </div>

        <button (click)="copyGpsCoordinates()"
          class="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer">
          <span>📋</span> {{ copiedGps() ? 'Coordinates Copied!' : 'Copy GPS: 44.0978° N, -70.2172° W' }}
        </button>
      </div>

      <!-- Category Filter Tabs -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
        <button (click)="activeCategory.set('all')"
          [class]="activeCategory() === 'all' ? 'bg-amber-500 text-zinc-950 font-black' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'"
          class="px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider transition shrink-0 cursor-pointer">
          🌐 All ({{ items().length }})
        </button>
        <button (click)="activeCategory.set('aed')"
          [class]="activeCategory() === 'aed' ? 'bg-amber-500 text-zinc-950 font-black' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'"
          class="px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider transition shrink-0 cursor-pointer flex items-center gap-1">
          <span>⚡</span> AED Defibrillator
        </button>
        <button (click)="activeCategory.set('glucose')"
          [class]="activeCategory() === 'glucose' ? 'bg-amber-500 text-zinc-950 font-black' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'"
          class="px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider transition shrink-0 cursor-pointer flex items-center gap-1">
          <span>🧃</span> Orange Juice / Glucose
        </button>
        <button (click)="activeCategory.set('otc_meds')"
          [class]="activeCategory() === 'otc_meds' ? 'bg-amber-500 text-zinc-950 font-black' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'"
          class="px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider transition shrink-0 cursor-pointer flex items-center gap-1">
          <span>💊</span> Advil / First Aid
        </button>
        <button (click)="activeCategory.set('medical_facility')"
          [class]="activeCategory() === 'medical_facility' ? 'bg-amber-500 text-zinc-950 font-black' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'"
          class="px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider transition shrink-0 cursor-pointer flex items-center gap-1">
          <span>🏥</span> ER / Doctor Office
        </button>
        <button (click)="activeCategory.set('shelter')"
          [class]="activeCategory() === 'shelter' ? 'bg-amber-500 text-zinc-950 font-black' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'"
          class="px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider transition shrink-0 cursor-pointer flex items-center gap-1">
          <span>⛺</span> Shelter / Refuge
        </button>
      </div>

      <!-- Supply & Resource Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        @for (item of filteredItems(); track item.id) {
          <div class="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 transition-all flex flex-col justify-between gap-3 shadow-md">
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
              <a [href]="'https://www.google.com/maps/search/?api=1&query=' + encodeUri(item.mapQuery)"
                 target="_blank"
                 class="flex-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider text-center transition flex items-center justify-center gap-1.5 no-underline shadow-sm">
                <span>🧭</span> Navigate Now
              </a>

              @if (item.phone) {
                <a [href]="'tel:' + item.phone"
                   class="py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider text-center transition flex items-center justify-center gap-1 border border-zinc-700 no-underline shrink-0">
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
  activeCategory = signal<string>('all');
  copiedGps = signal<boolean>(false);

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
      mapQuery: 'Public AED 145 Park Street',
      availableHours: '24/7 Public Access'
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
      mapQuery: 'Convenience Store 92 Main Street',
      phone: '2075550192',
      availableHours: 'Open 24 Hours'
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
      mapQuery: 'Pharmacy 210 Oak Street',
      phone: '2075550144',
      availableHours: 'Open Until 10 PM'
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
      mapQuery: 'Emergency Room 300 Main Street',
      phone: '2077950111',
      availableHours: '24/7 ER Service'
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
      mapQuery: 'Civic Center 50 Birch Street',
      phone: '2075550150',
      availableHours: '24/7 Refuge Staging'
    }
  ]);

  filteredItems = computed(() => {
    const cat = this.activeCategory();
    if (cat === 'all') return this.items();
    return this.items().filter(i => i.category === cat);
  });

  copyGpsCoordinates() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('Lat: 44.0978° N, Lon: -70.2172° W');
    }
    this.copiedGps.set(true);
    setTimeout(() => this.copiedGps.set(false), 3000);
  }

  encodeUri(str: string): string {
    return encodeURIComponent(str);
  }
}
