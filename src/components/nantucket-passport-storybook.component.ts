import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NantucketTickRadarService } from '../services/nantucket-tick-radar.service';
import { BioHapticFeedbackService } from '../services/hardware/bio-haptic-feedback.service';

export interface IStorybookStampZone {
  id: string;
  badgeTitle: string;
  floraFaunaName: string;
  botanicalLatin: string;
  anatomicArea: string;
  tipStory: string;
  stampIcon: string;
  accentColor: string; // e.g. 'cranberry', 'oceanTeal', 'heatherViolet'
  stampDate?: string;
}

export const STORYBOOK_STAMP_ZONES: IStorybookStampZone[] = [
  {
    id: 'zone_head',
    badgeTitle: 'The Behind-the-Ear Bayberry Watch',
    floraFaunaName: 'Sweet Bayberry & Coastal Wren',
    botanicalLatin: 'Myrica caroliniensis',
    anatomicArea: 'Head & Scalp',
    tipStory: 'Part your hair gently like moving sweet bayberry branches after a morning beach walk. Ticks love warm, hidden scalp spots!',
    stampIcon: '🌿',
    accentColor: 'border-emerald-600/40 bg-emerald-950/20 text-emerald-300'
  },
  {
    id: 'zone_neck',
    badgeTitle: 'The Neckline Meadowlark Lookout',
    floraFaunaName: 'Eastern Meadowlark & Sea Oats',
    botanicalLatin: 'Sturnella magna',
    anatomicArea: 'Neckline & Collar',
    tipStory: 'Feel along your collar and the back of your neck like a meadowlark checking its feathers for tiny seeds.',
    stampIcon: '🌾',
    accentColor: 'border-amber-600/40 bg-amber-950/20 text-amber-300'
  },
  {
    id: 'zone_armpits',
    badgeTitle: 'The Underarm Cedar Grove Patrol',
    floraFaunaName: 'Atlantic White Cedar & Pine Warbler',
    botanicalLatin: 'Chamaecyparis thyoides',
    anatomicArea: 'Underarms & Axillae',
    tipStory: 'Raise your arms high like tall cedar trees in the wind and have a buddy or parent check the soft warm pockets.',
    stampIcon: '🌲',
    accentColor: 'border-teal-600/40 bg-teal-950/20 text-teal-300'
  },
  {
    id: 'zone_waist',
    badgeTitle: 'The Waistband Heather Haven',
    floraFaunaName: 'Nantucket Heather & Bramble',
    botanicalLatin: 'Calluna vulgaris',
    anatomicArea: 'Waistband & Beltline',
    tipStory: 'Ticks hitch a ride on shorts and stop at the snug waistband. Look closely around buttons and belt loops!',
    stampIcon: '🌸',
    accentColor: 'border-purple-600/40 bg-purple-950/20 text-purple-300'
  },
  {
    id: 'zone_knees',
    badgeTitle: 'The Behind-the-Knee Fern Fort',
    floraFaunaName: 'Bracken Fern & Cottontail Hare',
    botanicalLatin: 'Pteridium aquilinum',
    anatomicArea: 'Back of the Knees',
    tipStory: 'Sit down, bend your knees, and check the warm crease behind your joints where the grass brushes past.',
    stampIcon: '🐇',
    accentColor: 'border-rose-600/40 bg-rose-950/20 text-rose-300'
  },
  {
    id: 'zone_ankles',
    badgeTitle: 'The Ankle-Socks Gull Patrol',
    floraFaunaName: 'Nantucket Herring Gull & Cranberry Bog',
    botanicalLatin: 'Larus argentatus smithsonianus',
    anatomicArea: 'Ankles & Sock Lines',
    tipStory: 'Roll down your white socks! Nymph ticks climb upward from trailing ground-brush and stop at the sock elastic.',
    stampIcon: '🪶',
    accentColor: 'border-sky-600/40 bg-sky-950/20 text-sky-300'
  },
  {
    id: 'zone_toes',
    badgeTitle: 'The Sandy Shoals Foot Search',
    floraFaunaName: 'Beach Plum & Fiddler Crab',
    botanicalLatin: 'Prunus maritima',
    anatomicArea: 'Feet & Between Toes',
    tipStory: 'Wiggle your toes and inspect between each one after running barefoot through the dune trails.',
    stampIcon: '🐚',
    accentColor: 'border-amber-600/40 bg-amber-950/20 text-amber-200'
  }
];

@Component({
  selector: 'app-nantucket-passport-storybook',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-[#0f1115] text-[#ece7de] rounded-xl border border-stone-800 shadow-2xl space-y-6 max-w-5xl mx-auto font-serif print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
      
      <!-- Top Storybook Header with Beatrix Potter Watercolor Banner -->
      <div class="border-b border-stone-800 pb-5 space-y-3 text-center print:border-black print:pb-3">
        <div class="w-full max-h-48 rounded-xs overflow-hidden border border-stone-800/80 shadow-md relative group print:max-h-36">
          <img
            src="/images/nantucket-storybook-header.jpg"
            alt="Beatrix Potter Coastal Naturalist Flora & Fauna of Nantucket"
            class="w-full h-48 object-cover object-center transform transition duration-500 group-hover:scale-105 print:h-36"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-transparent to-transparent opacity-80 print:hidden"></div>
        </div>

        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-rose-950/40 text-rose-300 border border-rose-800/50 text-[11px] font-mono tracking-widest uppercase print:border-black print:text-black">
          <span>🌊 Coastal Naturalist Storybook Series</span>
        </div>
        
        <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#fbf8f3] font-pocketgull-handwritten print:text-black">
          The Junior Island Detective Field Passport
        </h2>
        
        <p class="text-xs text-stone-400 max-w-2xl mx-auto italic font-sans print:text-stone-700">
          "A gentle Nantucket field guide inspired by Beatrix Potter’s coastal flora &amp; fauna. Check each secret spot after outdoor adventures to earn your Junior Naturalist Badge!"
        </p>

        <!-- Action Bar: Print, Reset, and Progress -->
        <div class="pt-3 flex flex-wrap items-center justify-center gap-3 font-sans">
          <button
            type="button"
            (click)="printPassport()"
            class="px-4 py-1.5 rounded-xs bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs print:hidden"
          >
            <span>🖨️ Print Storybook Passport (8.5x11)</span>
          </button>
          
          <button
            type="button"
            (click)="stampAllZones()"
            class="px-3.5 py-1.5 rounded-xs bg-teal-950/50 hover:bg-teal-900/60 text-teal-300 border border-teal-800/60 text-xs font-mono font-bold transition cursor-pointer print:hidden"
          >
            <span>✨ Complete All 7 Checks</span>
          </button>

          <button
            type="button"
            (click)="resetPassport()"
            class="px-3 py-1.5 rounded-xs bg-stone-900 hover:bg-stone-800 text-stone-400 border border-stone-800 text-xs font-mono transition cursor-pointer print:hidden"
          >
            <span>↺ Reset Stamps</span>
          </button>
        </div>
      </div>

      <!-- Child Explorer Name & Date Input Banner (Printable) -->
      <div class="p-4 rounded-xs bg-[#16191f] border border-stone-800 text-xs font-sans flex flex-wrap items-center justify-between gap-4 print:bg-stone-100 print:border-black">
        <div class="flex items-center gap-2">
          <span class="text-stone-400 font-mono">Junior Detective Name:</span>
          <input
            type="text"
            [(ngModel)]="detectiveName"
            placeholder="e.g. Scout or Barnaby"
            class="px-2.5 py-1 rounded-xs bg-stone-950 border border-stone-700 text-stone-100 font-serif font-bold text-xs focus:border-teal-400 outline-none print:border-b print:border-stone-400 print:bg-transparent print:text-black"
          />
        </div>

        <div class="flex items-center gap-2">
          <span class="text-stone-400 font-mono">Exploration Trail:</span>
          <select
            [(ngModel)]="selectedTrail"
            class="px-2.5 py-1 rounded-xs bg-stone-950 border border-stone-700 text-stone-200 font-sans text-xs focus:border-teal-400 outline-none print:border-b print:bg-transparent print:text-black"
          >
            <option value="Sanford Farm & Ram Pasture">Sanford Farm &amp; Ram Pasture</option>
            <option value="Squam Farm Cranberry Moors">Squam Farm Cranberry Moors</option>
            <option value="Coskata-Coatue Sand Dunes">Coskata-Coatue Sand Dunes</option>
            <option value="Middle Moors Huckleberry Path">Middle Moors Huckleberry Path</option>
            <option value="Siasconset Bluff & Rose Path">'Sconset Bluff &amp; Rose Path</option>
          </select>
        </div>

        <div class="font-mono text-xs text-teal-400 font-bold print:text-black">
          {{ completedStampsCount() }} of 7 Stamps Collected
        </div>
      </div>

      <!-- 7 Storybook Stamp Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (zone of stampZones(); track zone.id) {
          <div
            (click)="toggleStamp(zone.id)"
            [class.border-teal-500]="isStamped(zone.id)"
            [class.bg-[#141b18]]="isStamped(zone.id)"
            [class.border-stone-800]="!isStamped(zone.id)"
            [class.bg-[#13151a]]="!isStamped(zone.id)"
            class="p-4 rounded-xs border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between hover:border-stone-600 print:bg-white print:border-stone-400 print:p-2"
          >
            <!-- Top Flora Badge & Stamp Icon -->
            <div>
              <div class="flex items-start justify-between gap-2">
                <div>
                  <span class="text-[10px] font-mono uppercase tracking-widest text-stone-400 block print:text-stone-600">
                    {{ zone.anatomicArea }}
                  </span>
                  <h3 class="text-sm font-bold text-[#fbf8f3] font-serif mt-0.5 print:text-black">
                    {{ zone.badgeTitle }}
                  </h3>
                </div>
                
                <!-- Physical Stamp Stamp-Box -->
                <div
                  [class.scale-110]="isStamped(zone.id)"
                  [class.rotate-6]="isStamped(zone.id)"
                  class="w-9 h-9 rounded-xs border-2 flex items-center justify-center text-lg transition-transform font-mono shadow-xs"
                  [ngClass]="isStamped(zone.id) ? 'border-teal-400 bg-teal-950/60 text-teal-300 print:border-black print:text-black' : 'border-stone-700 bg-stone-900/60 text-stone-500 print:border-stone-300'"
                >
                  @if (isStamped(zone.id)) {
                    <span>{{ zone.stampIcon }}</span>
                  } @else {
                    <span class="text-[10px] font-sans text-stone-500">STAMP</span>
                  }
                </div>
              </div>

              <!-- Botanical Flora & Fauna Species -->
              <div class="mt-2 text-[11px] font-mono text-stone-300 italic flex items-center gap-1.5 print:text-stone-700">
                <span>{{ zone.floraFaunaName }}</span>
                <span class="text-stone-500 text-[10px]">({{ zone.botanicalLatin }})</span>
              </div>

              <!-- Potter-style Storybook Tale Tip -->
              <p class="text-xs text-stone-400 font-sans leading-relaxed mt-2 print:text-stone-800">
                {{ zone.tipStory }}
              </p>
            </div>

            <!-- Bottom Stamped Footer Attestation -->
            <div class="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-mono text-stone-500 print:border-stone-300">
              <span>{{ isStamped(zone.id) ? '✓ Inspected & Clear' : '⚪ Tap to Stamp' }}</span>
              <span class="text-teal-400 font-bold" *ngIf="isStamped(zone.id)">OFFICIAL STAMP</span>
            </div>
          </div>
        }

        <!-- 8th Completion Trophy Certificate Box -->
        <div
          [class.border-amber-400]="isFullyCompleted()"
          [class.bg-amber-950\/20]="isFullyCompleted()"
          [class.border-stone-800]="!isFullyCompleted()"
          [class.bg-[#13151a]]="!isFullyCompleted()"
          class="p-4 rounded-xs border flex flex-col justify-between text-center relative print:border-black print:bg-stone-50"
        >
          <div>
            <span class="text-2xl block mb-1">{{ isFullyCompleted() ? '🏅' : '📜' }}</span>
            <h3 class="text-sm font-bold text-[#fbf8f3] font-serif print:text-black">
              Official Junior Naturalist Seal
            </h3>
            <p class="text-xs text-stone-400 font-sans mt-2 leading-relaxed print:text-stone-700">
              @if (isFullyCompleted()) {
                Hurrah! Detective <strong>{{ detectiveName() || 'Naturalist' }}</strong> has completed all 7 island checks for {{ selectedTrail() }}!
              } @else {
                Check all 7 hidden spots to unlock the official Nantucket Wildlife Conservation seal!
              }
            </p>
          </div>

          <div class="mt-4 pt-2 border-t border-stone-800 text-[11px] font-mono text-amber-300 font-bold print:text-black">
            {{ isFullyCompleted() ? '★ CERTIFIED ISLAND EXPLORER ★' : (7 - completedStampsCount()) + ' Checks Remaining' }}
          </div>
        </div>
      </div>

      <!-- Whimsical Botanical Flora Reference Footer -->
      <div class="p-4 rounded-xs bg-[#14161c] border border-stone-800 text-xs font-sans space-y-2 print:border-black print:bg-white">
        <div class="flex items-center gap-2 font-mono font-bold text-stone-300 uppercase tracking-wider text-[11px] print:text-black">
          <span>🌿 Nantucket Naturalist Botanical Field Notes</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-stone-400 text-[11px] print:text-stone-800">
          <div class="p-2 rounded-xs bg-stone-900/60 border border-stone-800 print:bg-transparent print:border-stone-300">
            <strong class="text-stone-200 block print:text-black">Beach Plum (Prunus maritima)</strong>
            <span>Coastal dunes, dry sand. Low nymph tick density.</span>
          </div>
          <div class="p-2 rounded-xs bg-stone-900/60 border border-stone-800 print:bg-transparent print:border-stone-300">
            <strong class="text-stone-200 block print:text-black">Sweet Bayberry (Myrica)</strong>
            <span>Aromatic wax berries. Light to moderate brush habitat.</span>
          </div>
          <div class="p-2 rounded-xs bg-stone-900/60 border border-stone-800 print:bg-transparent print:border-stone-300">
            <strong class="text-stone-200 block print:text-black">Black Huckleberry</strong>
            <span>Low dense shrubland in Middle Moors. High tick habitat.</span>
          </div>
          <div class="p-2 rounded-xs bg-stone-900/60 border border-stone-800 print:bg-transparent print:border-stone-300">
            <strong class="text-stone-200 block print:text-black">Scrub Oak Acorns</strong>
            <span>White-footed mice forage here. Autumn seed mast locus.</span>
          </div>
        </div>
      </div>

    </div>
  `
})
export class NantucketPassportStorybookComponent {
  radarService = inject(NantucketTickRadarService);
  haptic = inject(BioHapticFeedbackService, { optional: true });

  detectiveName = signal<string>('Barnaby');
  selectedTrail = signal<string>('Squam Farm Cranberry Moors');
  
  stampZones = signal<IStorybookStampZone[]>(STORYBOOK_STAMP_ZONES);
  stampedZoneIds = signal<Set<string>>(new Set<string>());

  completedStampsCount = computed(() => this.stampedZoneIds().size);
  isFullyCompleted = computed(() => this.stampedZoneIds().size === this.stampZones().length);

  isStamped(zoneId: string): boolean {
    return this.stampedZoneIds().has(zoneId);
  }

  toggleStamp(zoneId: string): void {
    const next = new Set(this.stampedZoneIds());
    if (next.has(zoneId)) {
      next.delete(zoneId);
      this.haptic?.triggerHapticPulse('exhale');
    } else {
      next.add(zoneId);
      this.haptic?.playSolfeggioTone(528, 400);
      
      // Also check the corresponding zone in the radar clinical checklist
      this.syncWithClinicalRadar(zoneId, true);
    }
    this.stampedZoneIds.set(next);
  }

  stampAllZones(): void {
    const all = new Set(this.stampZones().map(z => z.id));
    this.stampedZoneIds.set(all);
    this.haptic?.playSolfeggioTone(639, 600);
    this.stampZones().forEach(z => this.syncWithClinicalRadar(z.id, true));
  }

  resetPassport(): void {
    this.stampedZoneIds.set(new Set());
    this.haptic?.triggerHapticPulse('exhale');
    this.stampZones().forEach(z => this.syncWithClinicalRadar(z.id, false));
  }

  printPassport(): void {
    window.print();
  }

  private syncWithClinicalRadar(zoneId: string, isInspected: boolean): void {
    const radarZones = this.radarService.inspectionZones();
    const match = radarZones.find(z => z.id === zoneId || z.zoneName.toLowerCase().includes(zoneId.replace('zone_', '')));
    if (match && match.isInspected !== isInspected) {
      this.radarService.toggleInspectionZone(match.id);
    }
  }
}
