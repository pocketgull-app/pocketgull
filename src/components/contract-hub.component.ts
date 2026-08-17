import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-contract-hub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 transition-all">
      <div class="mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Enterprise Contract Hub</h2>
        <p class="text-sm text-gray-500 mt-1">Generate customized B2B agreements from your LegalZoom templates.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Template Selection -->
        <div class="lg:col-span-1 space-y-3">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Select Template</h3>
          
          @if (templates().length === 0) {
            <div class="animate-pulse flex flex-col gap-3">
              <div class="h-20 bg-gray-200 dark:bg-zinc-800 rounded-xl"></div>
              <div class="h-20 bg-gray-200 dark:bg-zinc-800 rounded-xl"></div>
              <div class="h-20 bg-gray-200 dark:bg-zinc-800 rounded-xl"></div>
            </div>
          }

          @for (template of templates(); track template.id) {
            <button 
              (click)="selectedTemplate.set(template)"
              [class.ring-2]="selectedTemplate()?.id === template.id"
              [class.ring-brand-green]="selectedTemplate()?.id === template.id"
              class="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 transition-all">
              <div class="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">{{ template.name }}</div>
              <div class="text-xs text-gray-500 line-clamp-2">{{ template.description }}</div>
            </button>
          }
        </div>

        <!-- Data Entry & Generation -->
        <div class="lg:col-span-2">
          @if (selectedTemplate()) {
            <div class="p-5 border border-gray-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 shadow-sm">
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Prepare {{ selectedTemplate()?.name }}
              </h3>
              
              <form (submit)="$event.preventDefault(); generateContract()">
                <div class="space-y-4 mb-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Name</label>
                    <input type="text" [(ngModel)]="formData.CLIENT_NAME" name="clientName" required
                           class="w-full rounded-lg border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm shadow-sm focus:border-brand-green focus:ring-brand-green">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Effective Date</label>
                    <input type="date" [(ngModel)]="formData.EFFECTIVE_DATE" name="effectiveDate" required
                           class="w-full rounded-lg border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm shadow-sm focus:border-brand-green focus:ring-brand-green">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Compensation Amount (if applicable)</label>
                    <input type="text" [(ngModel)]="formData.COMPENSATION_AMOUNT" name="compensation" placeholder="e.g. $10,000 USD"
                           class="w-full rounded-lg border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm shadow-sm focus:border-brand-green focus:ring-brand-green">
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <button type="submit" [disabled]="isGenerating()"
                          class="px-5 py-2.5 bg-brand-green hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2">
                    @if (isGenerating()) {
                      <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating PDF...
                    } @else {
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    }
                  </button>
                  <button type="button" class="px-5 py-2.5 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors shadow-sm">
                    Preview HTML
                  </button>
                </div>
              </form>
            </div>
          } @else {
            <div class="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl text-center">
              <div class="w-16 h-16 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">No template selected</h3>
              <p class="text-sm text-gray-500 mt-1 max-w-sm">Select a LegalZoom template from the left to configure and generate a customized PDF contract.</p>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Hidden div to hold the HTML for rendering -->
    <div id="pdf-render-container" class="fixed top-[-9999px] left-[-9999px] w-[800px] bg-white text-black p-10 z-[-50]"></div>
  `
})
export class ContractHubComponent implements OnInit {
  templates = signal<TemplateMetadata[]>([]);
  selectedTemplate = signal<TemplateMetadata | null>(null);
  isGenerating = signal(false);

  formData = {
    CLIENT_NAME: '',
    EFFECTIVE_DATE: new Date().toISOString().split('T')[0],
    COMPENSATION_AMOUNT: ''
  };

  private http = inject(HttpClient);

  ngOnInit() {
    this.http.get<TemplateMetadata[]>('/api/contracts/templates').subscribe({
      next: (data) => this.templates.set(data),
      error: (err) => console.error('Failed to load templates', err)
    });
  }

  generateContract() {
    const template = this.selectedTemplate();
    if (!template) return;

    this.isGenerating.set(true);

    this.http.post<{ html: string }>('/api/contracts/prepare', {
      templateId: template.id,
      variables: this.formData
    }).subscribe({
      next: async (res) => {
        try {
          await this.renderPdf(res.html, template.name);
        } catch (err) {
          console.error('PDF rendering failed', err);
        } finally {
          this.isGenerating.set(false);
        }
      },
      error: (err) => {
        console.error('Failed to prepare contract', err);
        this.isGenerating.set(false);
      }
    });
  }

  private async renderPdf(htmlContent: string, fileName: string) {
    const container = document.getElementById('pdf-render-container');
    if (!container) throw new Error('Render container not found');

    container.innerHTML = htmlContent;

    // Wait for any potential images/fonts to render
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(container, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    
    // A4 dimensions in mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Clean up title for filename
    const safeFileName = fileName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + this.formData.CLIENT_NAME.replace(/[^a-zA-Z0-9]/g, '') + '.pdf';
    
    pdf.save(safeFileName);
    container.innerHTML = ''; // Cleanup
  }
}
