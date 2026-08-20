import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HobbyDomainCompanionService, IHobbyDomainCompanion, SNO10_CONDITIONS } from '../services/hobby-domain-companion.service';
import { PatientStateService } from '../services/patient-state.service';

@Component({
  selector: 'app-hobby-domain-companion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl space-y-6">
      
      <!-- Top Header & Mission Banner -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl shadow-xs">
            {{ activeBuddy().avatarEmoji }}
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-base sm:text-lg font-black tracking-wider text-white">
                SNO-10 Craft & Passion Confidant Studio
              </h3>
              <span class="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                SNO-10 Dual Coding
              </span>
            </div>
            <p class="text-xs text-zinc-400">
              Rekindle lifelong passions, consult with kindred domain companions, and translate SNO-10 clinical diagnoses into your craft dialect.
            </p>
          </div>
        </div>

        <button (click)="openCustomBuddyModal.set(true)"
                class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs font-mono uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-md">
          <span>🤝 Create Custom Confidant / Lost Buddy</span>
        </button>
      </div>

      <!-- Companion Selection Carousel / Pills -->
      <div class="space-y-2">
        <label class="text-xs font-mono font-bold uppercase text-zinc-400">Select Your Kindred Passion Buddy:</label>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          @for (buddy of allBuddies(); track buddy.id) {
            <button (click)="selectBuddy(buddy.id)"
                    class="p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2 relative overflow-hidden"
                    [class.bg-zinc-900]="activeBuddy().id === buddy.id"
                    [class.border-amber-500]="activeBuddy().id === buddy.id"
                    [class.shadow-amber-500/10]="activeBuddy().id === buddy.id"
                    [class.bg-zinc-950]="activeBuddy().id !== buddy.id"
                    [class.border-zinc-800]="activeBuddy().id !== buddy.id"
                    [class.hover:border-zinc-700]="activeBuddy().id !== buddy.id">
              <div class="flex items-center justify-between">
                <span class="text-2xl">{{ buddy.avatarEmoji }}</span>
                <span class="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {{ buddy.passionBadge }}
                </span>
              </div>
              <div>
                <h4 class="text-xs font-black text-white truncate">{{ buddy.name }}</h4>
                <p class="text-[10px] text-zinc-400 truncate">{{ buddy.domainTitle }}</p>
              </div>
            </button>
          }
        </div>
      </div>

      <!-- Active Companion Dossier Card -->
      <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
          <div class="flex items-center gap-3">
            <span class="text-3xl">{{ activeBuddy().avatarEmoji }}</span>
            <div>
              <h4 class="text-sm font-black text-white flex items-center gap-2">
                <span>{{ activeBuddy().name }}</span>
                <span class="text-xs font-mono text-amber-400 font-normal">({{ activeBuddy().domainTitle }})</span>
              </h4>
              <p class="text-xs text-zinc-400 italic">"{{ activeBuddy().tagline }}"</p>
            </div>
          </div>
          <span class="text-xs font-mono px-3 py-1 rounded-xl bg-zinc-800 text-zinc-300 border border-zinc-700">
            Dialect: <strong>{{ activeBuddy().craftDialect }}</strong>
          </span>
        </div>

        <p class="text-xs text-zinc-300 leading-relaxed">
          {{ activeBuddy().relationshipBio }}
        </p>

        <!-- SNO-10 Clinical Analogy Crosswalk Grid -->
        <div class="space-y-2 pt-2">
          <h5 class="text-xs font-mono font-black uppercase text-amber-400 flex items-center gap-1.5">
            <span>🧬 SNO-10 Craft Translation (SNOMED-CT + ICD-10)</span>
          </h5>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            @for (snoKey of objectKeys(activeBuddy().sno10Analogies); track snoKey) {
              @let item = activeBuddy().sno10Analogies[snoKey];
              @let snoRef = snoReference[snoKey];
              <div class="p-3.5 rounded-xl bg-zinc-950/80 border border-purple-500/30 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-black text-purple-300 font-mono">
                    {{ snoKey }} @if (snoRef) { / SNOMED {{ snoRef.snomedCode }} }
                  </span>
                  <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {{ item.metaphorName }}
                  </span>
                </div>
                <div class="text-[11px] text-zinc-300">
                  <strong>Craft Model:</strong> {{ item.craftExplanation }}
                </div>
                <div class="text-[11px] text-amber-300/90">
                  <strong>Clinical Translation:</strong> {{ item.systemAnalogy }}
                </div>
                <div class="text-[10px] font-mono text-cyan-400/90">
                  💡 <em>Maintenance: {{ item.maintenanceStep }}</em>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Workshop Adaptive Ergonomics Toolkit -->
        <div class="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2">
          <h5 class="text-xs font-mono font-black uppercase text-emerald-400 flex items-center gap-1.5">
            <span>🛠️ Workshop Adaptive Ergonomics (Get Back in the Craft)</span>
          </h5>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            @for (ergo of activeBuddy().workshopErgonomics; track ergo.toolName) {
              <div class="p-3 rounded-lg bg-zinc-900 border border-emerald-500/20 space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-lg">{{ ergo.icon }}</span>
                  <span class="text-xs font-bold text-emerald-300">{{ ergo.toolName }}</span>
                </div>
                <div class="text-[10px] font-mono text-zinc-400">{{ ergo.clinicalPurpose }}</div>
                <p class="text-[11px] text-zinc-300 leading-snug">{{ ergo.howItHelps }}</p>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Live Conversational Confidant Console -->
      <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
        <div class="flex items-center justify-between border-b border-zinc-800/80 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono font-black uppercase text-white flex items-center gap-1.5">
              <span>💬 Talk Shop with {{ activeBuddy().name }}</span>
            </span>
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <span class="text-[10px] font-mono text-zinc-400">Zero Surveillance • Ephemeral Edge Memory</span>
        </div>

        <!-- Chat History Stream -->
        <div class="h-64 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
          @for (msg of chatStream(); track msg.id) {
            <div class="flex flex-col space-y-1"
                 [class.items-end]="msg.sender === 'user'"
                 [class.items-start]="msg.sender === 'buddy'">
              <div class="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                <span>{{ msg.senderName }}</span>
                <span>{{ msg.timestamp }}</span>
              </div>
              <div class="p-3.5 rounded-2xl max-w-xl text-xs leading-relaxed space-y-2"
                   [class.bg-gradient-to-r]="msg.sender === 'user'"
                   [class.from-amber-500]="msg.sender === 'user'"
                   [class.to-amber-600]="msg.sender === 'user'"
                   [class.text-zinc-950]="msg.sender === 'user'"
                   [class.font-bold]="msg.sender === 'user'"
                   [class.bg-zinc-800]="msg.sender === 'buddy'"
                   [class.text-zinc-200]="msg.sender === 'buddy'"
                   [class.border]="msg.sender === 'buddy'"
                   [class.border-zinc-700]="msg.sender === 'buddy'">
                <p>{{ msg.text }}</p>
                @if (msg.snoBadge) {
                  <div class="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-200 border border-purple-500/30">
                    {{ msg.snoBadge }}
                  </div>
                }
                @if (msg.ergonomicTip) {
                  <div class="text-[10px] font-mono text-emerald-300 pt-1 border-t border-zinc-700/60">
                    🛠️ <em>Ergonomic Pearl: {{ msg.ergonomicTip }}</em>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <!-- Input Bar -->
        <div class="flex items-center gap-2 pt-2">
          <input type="text"
                 [(ngModel)]="userMessageInput"
                 (keyup.enter)="sendMessage()"
                 placeholder="Talk with {{ activeBuddy().name }} about your project, symptoms, or memories..."
                 class="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 transition">
          <button (click)="sendMessage()"
                  class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs font-mono uppercase tracking-wider transition cursor-pointer">
            Send 💬
          </button>
        </div>
      </div>

      <!-- Local Craft Gatherings & Social Prescribing Hub -->
      <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">🗺️</span>
            <div>
              <h4 class="text-sm font-black text-white">Local Craft Gatherings & Social Prescribing</h4>
              <p class="text-[11px] text-zinc-400">Discover local meetups, Men's Sheds, and guild open benches to reconnect with fellow makers.</p>
            </div>
          </div>

          <!-- Filter & Search Input -->
          <div class="flex items-center gap-2">
            <input type="text"
                   [(ngModel)]="eventSearchQuery"
                   placeholder="Filter by city, zip, or guild..."
                   class="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-500 font-mono">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          @for (evt of filteredEvents(); track evt.id) {
            <div class="p-4 rounded-xl bg-zinc-950/80 border border-amber-500/20 space-y-2 flex flex-col justify-between">
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-black text-amber-300 flex items-center gap-1">
                    <span>{{ evt.icon }}</span>
                    <span>{{ evt.title }}</span>
                  </span>
                  <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    {{ evt.communityType }}
                  </span>
                </div>
                <div class="text-[11px] text-zinc-400 font-sans">
                  📍 {{ evt.location }} • <strong class="text-zinc-300">{{ evt.scheduleDescription }}</strong>
                </div>
                <div class="text-[10px] font-mono text-emerald-400">
                  ♿ {{ evt.accessibilityRating }}
                </div>
                <p class="text-[11px] text-zinc-300 italic pt-1 border-t border-zinc-800/80">
                  "{{ evt.buddyEncouragement }}"
                </p>
              </div>

              <div class="pt-2 flex items-center justify-between border-t border-zinc-800 text-[10px] font-mono">
                <span class="text-zinc-400">{{ evt.organizer }}</span>
                <a [href]="evt.contactOrLink" target="_blank" rel="noopener noreferrer"
                   class="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold transition">
                  Details ↗
                </a>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Custom Confidant Creator Modal -->
      @if (openCustomBuddyModal()) {
        <div class="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div class="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h4 class="text-sm font-black text-white flex items-center gap-2">
                <span>🤝 Create Custom Confidant & Memorial Vault</span>
              </h4>
              <button (click)="openCustomBuddyModal.set(false)" class="text-zinc-400 hover:text-white text-xs cursor-pointer">
                ✕ Close
              </button>
            </div>

            <div class="space-y-3 text-xs">
              <div>
                <label class="font-mono text-zinc-400">Companion Name:</label>
                <input type="text" [(ngModel)]="customName" placeholder="e.g. Grandpa Joe, Dave, Helen"
                       class="w-full mt-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white">
              </div>
              <div>
                <label class="font-mono text-zinc-400">Hobby or Profession Domain:</label>
                <input type="text" [(ngModel)]="customDomain" placeholder="e.g. Steam Locomotive Engineering, Quilting, Fly Fishing"
                       class="w-full mt-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white">
              </div>
              <div>
                <label class="font-mono text-zinc-400">Old Text Messages / Signature Catchphrases:</label>
                <textarea rows="2" [(ngModel)]="customCatchphrases" placeholder="e.g. 'Hey Chief', 'Keep the shiny side up', 'Measure twice, cut once'..."
                          class="w-full mt-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white"></textarea>
              </div>
              <div>
                <label class="font-mono text-zinc-400">Relationship & Special Memories:</label>
                <textarea rows="3" [(ngModel)]="customMemories" placeholder="e.g. We spent 30 years building model train layouts and fly fishing the Madison River..."
                          class="w-full mt-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white"></textarea>
              </div>
              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <div class="flex items-center gap-2 text-amber-400 font-bold font-mono">
                  <span>📸 Memorial Memento Photo (100% Local Encrypted)</span>
                </div>
                <p class="text-[10px] text-zinc-400">Upload a photo from your workshop or garden. It stays 100% in your local browser and is never sent to the cloud.</p>
                <input type="file" accept="image/*" (change)="onPhotoSelected($event)"
                       class="text-[11px] text-zinc-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-zinc-950 hover:file:bg-amber-400 cursor-pointer">
                @if (selectedPhotoUrl()) {
                  <div class="mt-2 flex items-center gap-3">
                    <img [src]="selectedPhotoUrl()" class="w-14 h-14 rounded-lg object-cover border border-amber-500/40">
                    <span class="text-[10px] text-emerald-400 font-mono">✅ Photo loaded into Local Sovereign Vault</span>
                  </div>
                }
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
              <button (click)="openCustomBuddyModal.set(false)"
                      class="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-mono cursor-pointer">
                Cancel
              </button>
              <button (click)="saveCustomBuddy()"
                      [disabled]="!customName.trim() || !customDomain.trim()"
                      class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-black text-xs font-mono uppercase cursor-pointer">
                Create Confidant ✨
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class HobbyDomainCompanionComponent {
  private companionService = inject(HobbyDomainCompanionService);
  private patientState = inject(PatientStateService, { optional: true });

  readonly allBuddies = computed(() => this.companionService.allCompanions());
  readonly activeBuddy = computed<IHobbyDomainCompanion>(() => this.companionService.activeCompanion());
  readonly chatStream = computed(() => this.companionService.activeChat());

  readonly snoReference = SNO10_CONDITIONS;
  readonly objectKeys = Object.keys;

  userMessageInput = '';
  openCustomBuddyModal = signal(false);

  customName = '';
  customDomain = '';
  customCatchphrases = '';
  customMemories = '';
  selectedPhotoUrl = signal<string | null>(null);

  eventSearchQuery = '';
  readonly allEvents = computed(() => this.companionService.allCommunityEvents());
  readonly filteredEvents = computed(() => {
    return this.companionService.discoverLocalEvents('all', this.eventSearchQuery);
  });

  selectBuddy(id: string): void {
    this.companionService.selectCompanion(id);
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.selectedPhotoUrl.set(result);
      };
      reader.readAsDataURL(file);
    }
  }

  sendMessage(): void {
    if (!this.userMessageInput.trim()) return;
    const rawIssues = this.patientState ? this.patientState.issues() : [];
    const issues: string[] = Array.isArray(rawIssues) ? (rawIssues as any[]) : Object.keys(rawIssues);
    this.companionService.sendMessageToBuddy(this.userMessageInput, issues);
    this.userMessageInput = '';
  }

  saveCustomBuddy(): void {
    if (!this.customName.trim() || !this.customDomain.trim()) return;
    this.companionService.createCustomBuddy({
      name: this.customName,
      domainOrHobby: this.customDomain,
      relationshipContext: this.customMemories,
      specialMemories: this.customCatchphrases
    });
    this.customName = '';
    this.customDomain = '';
    this.customCatchphrases = '';
    this.customMemories = '';
    this.selectedPhotoUrl.set(null);
    this.openCustomBuddyModal.set(false);
  }
}
