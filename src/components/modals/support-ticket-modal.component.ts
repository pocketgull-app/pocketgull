import { Component, signal, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicalSupportAgentService, ISupportTicket, SupportTicketCategory } from '../../services/clinical-support-agent.service';

@Component({
  selector: 'app-support-ticket-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" id="support-modal-backdrop">
      <div class="relative w-full max-w-3xl bg-zinc-900 border border-teal-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-semibold text-lg">
              📬
            </div>
            <div>
              <h2 class="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                PocketGull AI Support Agent
                <span class="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-normal">
                  support&#64;pocketgull.app
                </span>
              </h2>
              <p class="text-xs text-zinc-400">Autonomous Clinical Support, EHR SMART Launch & FDA 520(o) Guardrails</p>
            </div>
          </div>
          <button (click)="closeModal()" class="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors">
            ✕
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto space-y-6">
          
          <!-- Inquiry Form -->
          <div class="space-y-4 bg-zinc-950/40 p-4 rounded-xl border border-zinc-800">
            <h3 class="text-sm font-medium text-zinc-200">Submit a Support Ticket / Clinical Inquiry</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1">Your Email Address</label>
                <input 
                  type="email" 
                  [(ngModel)]="senderEmail"
                  placeholder="clinician@healthsystem.org" 
                  class="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-zinc-400 mb-1">Inquiry Category</label>
                <select 
                  [(ngModel)]="category"
                  class="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-teal-500 transition-colors"
                >
                  <option value="CLINICAL_QUERY">Clinical & Tri-Paradigm Query</option>
                  <option value="EHR_INTEGRATION">SMART-on-FHIR & EHR Integration</option>
                  <option value="PRIVACY_HIPAA">HIPAA §164.514 & Ephemeral Privacy</option>
                  <option value="BILLING_RPM">CMS CPT 99453/99454 RPM Billing</option>
                  <option value="TECHNICAL_SUPPORT">WebGL 3D Graphics & Voice Hardware</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-zinc-400 mb-1">Subject</label>
              <input 
                type="text" 
                [(ngModel)]="subject"
                placeholder="e.g. Epic Hyperspace PKCE launch code challenge configuration" 
                class="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-zinc-400 mb-1">Inquiry Details</label>
              <textarea 
                [(ngModel)]="body"
                rows="3"
                placeholder="Describe your technical, administrative, or clinical inquiry..." 
                class="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-teal-500 transition-colors resize-none"
              ></textarea>
            </div>

            <div class="flex items-center justify-between pt-2">
              <span class="text-xs text-zinc-500">Replies route automatically to support&#64;pocketgull.app</span>
              <button 
                (click)="submitInquiry()"
                [disabled]="isProcessing() || !senderEmail || !subject || !body"
                class="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-medium text-sm rounded-lg shadow-lg shadow-teal-900/30 transition-all flex items-center gap-2"
              >
                <span *ngIf="isProcessing()" class="animate-spin">⏳</span>
                <span>Send to Support AI</span>
              </button>
            </div>
          </div>

          <!-- Active Ticket Output -->
          <div *ngIf="activeTicket()" class="bg-zinc-950 border border-teal-500/40 rounded-xl p-5 space-y-4 animate-fade-in">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-teal-400 border border-zinc-700">
                  {{ activeTicket()?.id }}
                </span>
                <span [class]="getPriorityClass(activeTicket()?.priority)">
                  {{ activeTicket()?.priority }}
                </span>
                <span class="text-xs text-zinc-400">
                  Category: <strong class="text-zinc-200">{{ activeTicket()?.category }}</strong>
                </span>
              </div>
              <span class="text-xs text-emerald-400 font-medium">✓ Processed by Support AI</span>
            </div>

            <div class="text-sm text-zinc-300 bg-zinc-900/80 p-4 rounded-lg border border-zinc-800 whitespace-pre-wrap font-sans">
              {{ activeTicket()?.aiResponse }}
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="px-6 py-3 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-500">
          <span>Porkbun Domain MX: support&#64;pocketgull.app | leads&#64;pocketgull.app | dpo&#64;pocketgull.app</span>
          <button (click)="closeModal()" class="text-zinc-400 hover:text-white transition-colors">
            Close Portal
          </button>
        </div>

      </div>
    </div>
  `
})
export class SupportTicketModalComponent {
  readonly closed = output<void>();
  readonly supportAgent = inject(ClinicalSupportAgentService);

  senderEmail = 'dr.smith@metrohealth.org';
  category: SupportTicketCategory = 'EHR_INTEGRATION';
  subject = 'SMART-on-FHIR AthenaHealth & Epic OAuth2 Launch Verification';
  body = 'We are verifying our Client ID 0oa13r0te5ag3V2g9298 configuration for provider EHR embedded launches.';

  readonly isProcessing = signal<boolean>(false);
  readonly activeTicket = signal<ISupportTicket | null>(null);

  async submitInquiry() {
    this.isProcessing.set(true);
    try {
      const ticket = await this.supportAgent.submitSupportInquiry(
        this.senderEmail,
        this.subject,
        this.body
      );
      this.activeTicket.set(ticket);
    } finally {
      this.isProcessing.set(false);
    }
  }

  getPriorityClass(priority?: string): string {
    switch (priority) {
      case 'P1_CRITICAL':
        return 'text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold';
      case 'P2_HIGH':
        return 'text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium';
      default:
        return 'text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-medium';
    }
  }

  closeModal() {
    this.closed.emit();
  }
}
