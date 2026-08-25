import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunityTestimonialsService, ICommunityTestimonial } from '../../services/community-testimonials.service';
import { PocketGullAiSocialCardComponent } from '../shared/pocketgull-ai-social-card.component';

@Component({
  selector: 'app-community-testimonial-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, PocketGullAiSocialCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div class="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col p-6 sm:p-8 text-zinc-100 relative">
        
        <!-- Close Button -->
        <button 
          type="button"
          (click)="close.emit()"
          class="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 p-2 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
          aria-label="Close testimonials modal">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        <!-- Header -->
        <div class="text-center max-w-2xl mx-auto mb-6">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <span>💬 Community Voices &amp; Practitioner Quotes</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-zinc-50 tracking-tight">
            Share Your Experience with PocketGull
          </h2>
          <p class="text-sm text-zinc-400 mt-1">
            Read verified clinical testimonials from rural clinics and solo practices, or write in your own quote below.
          </p>

          <!-- Mode Toggle -->
          <div class="inline-flex bg-zinc-950 border border-zinc-800 rounded-lg p-1 mt-4 gap-1 flex-wrap justify-center">
            <button 
              type="button"
              (click)="viewMode.set('read')"
              class="px-4 py-1.5 rounded-md text-xs font-bold transition cursor-pointer"
              [class.bg-teal-500]="viewMode() === 'read'"
              [class.text-zinc-950]="viewMode() === 'read'"
              [class.text-zinc-400]="viewMode() !== 'read'">
              📖 Read Testimonials ({{ testimonialsService.testimonials().length }})
            </button>
            <button 
              type="button"
              (click)="viewMode.set('write')"
              class="px-4 py-1.5 rounded-md text-xs font-bold transition cursor-pointer"
              [class.bg-teal-500]="viewMode() === 'write'"
              [class.text-zinc-950]="viewMode() === 'write'"
              [class.text-zinc-400]="viewMode() !== 'write'">
              ✍️ Write a Testimonial
            </button>
            <button 
              type="button"
              (click)="viewMode.set('card')"
              class="px-4 py-1.5 rounded-md text-xs font-bold transition cursor-pointer"
              [class.bg-teal-500]="viewMode() === 'card'"
              [class.text-zinc-950]="viewMode() === 'card'"
              [class.text-zinc-400]="viewMode() !== 'card'">
              🪪 PocketGull AI Social Card
            </button>
          </div>
        </div>

        <!-- Mode 1: Read Testimonials List -->
        @if (viewMode() === 'read') {
          <div class="space-y-4 mb-6">
            @for (item of testimonialsService.testimonials(); track item.id) {
              <div class="bg-zinc-950/80 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition flex flex-col md:flex-row items-start justify-between gap-4">
                <div class="flex-1 space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">{{ item.avatarIcon || '🩺' }}</span>
                    <div>
                      <div class="font-bold text-sm text-zinc-100">{{ item.authorName }}</div>
                      <div class="text-xs text-zinc-400">{{ item.roleOrAffiliation }} &bull; <span class="text-zinc-500">{{ item.location }}</span></div>
                    </div>
                  </div>

                  <blockquote class="text-xs text-zinc-300 italic border-l-2 border-teal-500/60 pl-3 py-1 font-serif leading-relaxed">
                    "{{ item.quoteText }}"
                  </blockquote>
                </div>

                @if (item.impactMetric) {
                  <div class="shrink-0 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg text-center min-w-[120px]">
                    <div class="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Reported Impact</div>
                    <div class="text-xs font-extrabold text-teal-400 mt-0.5">{{ item.impactMetric }}</div>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Mode 2: Write a Testimonial Form -->
        @if (viewMode() === 'write') {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            <!-- Left: Input Form -->
            <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
              <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>📝 Your Details &amp; Quote</span>
              </h3>

              <div>
                <label class="block text-xs font-semibold text-zinc-400 mb-1">Your Full Name &amp; Credentials *</label>
                <input 
                  type="text" 
                  [(ngModel)]="authorName" 
                  placeholder="e.g. Dr. Jane Smith, MD or Mark K."
                  class="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-teal-400" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-zinc-400 mb-1">Role or Specialty</label>
                  <input 
                    type="text" 
                    [(ngModel)]="roleOrAffiliation" 
                    placeholder="e.g. Integrative Primary Care"
                    class="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-teal-400" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-zinc-400 mb-1">Location / Island / Clinic</label>
                  <input 
                    type="text" 
                    [(ngModel)]="location" 
                    placeholder="e.g. Nantucket, MA or Portland, OR"
                    class="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-teal-400" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-zinc-400 mb-1">Practice Category</label>
                <select 
                  [(ngModel)]="selectedCategory"
                  class="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-teal-400">
                  <option value="island_rural_health">🌲 Island &amp; Rural Community Health (e.g. Vector Triage)</option>
                  <option value="integrative_practice">🌿 Integrative &amp; Functional Medicine</option>
                  <option value="burnout_reduction">⚡ Charting Efficiency &amp; Burnout Reduction</option>
                  <option value="privacy_sovereignty">🔒 Privacy &amp; 100% On-Device Offline Scribing</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-zinc-400 mb-1">Your Quote or Story *</label>
                <textarea 
                  [(ngModel)]="quoteText" 
                  rows="4"
                  placeholder="How has PocketGull helped your clinical workflow, diagnostic triage, or patient communication?"
                  class="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-teal-400 leading-relaxed"></textarea>
              </div>

              <div>
                <label class="block text-xs font-semibold text-zinc-400 mb-1">Measurable Impact (Optional)</label>
                <input 
                  type="text" 
                  [(ngModel)]="impactMetric" 
                  placeholder="e.g. Saved 1.5 hrs daily, Flagged Babesiosis in field"
                  class="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-teal-400" />
              </div>

              <button 
                type="button"
                (click)="onSubmitTestimonial()"
                class="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-lg transition cursor-pointer">
                Submit Testimonial
              </button>

              @if (submissionMessage()) {
                <div class="text-xs font-mono px-3 py-2 rounded border bg-emerald-950 border-emerald-800 text-emerald-300">
                  {{ submissionMessage() }}
                </div>
              }
            </div>

            <!-- Right: Live Typography Preview Card -->
            <div class="flex flex-col justify-center">
              <div class="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">Live Preview Card:</div>
              
              <div class="bg-zinc-950 border-2 border-teal-500/40 rounded-xl p-6 shadow-xl space-y-4 relative">
                <div class="absolute -top-3 right-6 bg-teal-500 text-zinc-950 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase">
                  Preview
                </div>

                <div class="flex items-center gap-3">
                  <span class="text-2xl">{{ selectedCategory === 'island_rural_health' ? '🌲' : selectedCategory === 'burnout_reduction' ? '⚡' : '🌿' }}</span>
                  <div>
                    <div class="font-bold text-sm text-zinc-100">{{ authorName || 'Your Name, MD / NP' }}</div>
                    <div class="text-xs text-zinc-400">{{ roleOrAffiliation || 'Your Specialty' }} &bull; <span class="text-zinc-500">{{ location || 'Your Location' }}</span></div>
                  </div>
                </div>

                <blockquote class="text-sm text-zinc-200 italic border-l-2 border-teal-400 pl-4 py-1 font-serif leading-relaxed">
                  "{{ quoteText || 'Type your testimonial on the left to preview how your quote will be displayed in Caslon clinical typography across our portal...' }}"
                </blockquote>

                @if (impactMetric) {
                  <div class="inline-flex items-center gap-2 px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-teal-400 font-bold">
                    <span>⚡ Impact:</span>
                    <span>{{ impactMetric }}</span>
                  </div>
                }
              </div>
            </div>

          </div>
        }

        <!-- Mode 3: Official PocketGull AI Social Card -->
        @if (viewMode() === 'card') {
          <div class="p-4 flex flex-col items-center justify-center space-y-4 mb-6">
            <app-pocketgull-ai-social-card></app-pocketgull-ai-social-card>
            <p class="text-xs text-zinc-400 text-center max-w-sm">
              Scan this card to share PocketGull's sovereign clinical AI co-pilot with fellow clinicians, practitioners, and clinical research teams.
            </p>
          </div>
        }

        <!-- Footer -->
        <div class="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <div>
            PocketGull Community Stewardship &bull; Oregon Registry: 258869891
          </div>
          <button (click)="close.emit()" class="text-zinc-400 hover:text-zinc-200 font-semibold cursor-pointer">
            Close
          </button>
        </div>

      </div>
    </div>
  `
})
export class CommunityTestimonialModalComponent {
  testimonialsService = inject(CommunityTestimonialsService);

  viewMode = signal<'read' | 'write' | 'card'>('read');
  authorName = '';
  roleOrAffiliation = '';
  location = '';
  selectedCategory: 'island_rural_health' | 'integrative_practice' | 'burnout_reduction' | 'privacy_sovereignty' = 'island_rural_health';
  quoteText = '';
  impactMetric = '';
  submissionMessage = signal<string>('');

  close = output<void>();

  onSubmitTestimonial() {
    const result = this.testimonialsService.submitTestimonial({
      authorName: this.authorName,
      roleOrAffiliation: this.roleOrAffiliation,
      location: this.location,
      quoteText: this.quoteText,
      category: this.selectedCategory,
      impactMetric: this.impactMetric
    });

    if (result.success) {
      this.submissionMessage.set(result.message);
      setTimeout(() => {
        this.viewMode.set('read');
        this.authorName = '';
        this.quoteText = '';
        this.submissionMessage.set('');
      }, 1200);
    } else {
      this.submissionMessage.set(result.message);
    }
  }
}
