import { Component, ChangeDetectionStrategy, input, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IDiagnosticScan } from '../services/patient.types';
import { ImageOptimizationService } from '../services/image-optimization.service';

@Component({
    selector: 'app-patient-scans',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      @for(scan of optimizedScans(); track scan.id) {
        <div class="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden flex flex-col hover:border-gray-300 dark:hover:border-zinc-700 transition-colors shadow-sm group">
            @if (scan.imageUrl && !failedImageIds().has(scan.id)) {
               <div class="h-40 bg-gray-100 dark:bg-zinc-950 relative overflow-hidden flex-shrink-0 border-b border-gray-100 dark:border-zinc-800">
                 <!-- Subtle zoom effect on hover -->
                 <img [src]="scan.imageUrl" [alt]="scan.title" referrerpolicy="no-referrer" (error)="handleImageError(scan.id)" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                 <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                 
                 <!-- View Fullscreen Button -->
                 <div class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button class="bg-white/90 dark:bg-black/90 backdrop-blur text-gray-800 dark:text-zinc-200 p-1.5 rounded shadow-sm hover:bg-white dark:hover:bg-black transition-colors cursor-pointer" title="View Scan">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                    </button>
                 </div>

                 <div class="absolute top-2 right-2 px-2 py-0.5 rounded text-[12px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border"
                   [class.bg-brand-green-50]="scan.status === 'Normal'" [class.text-brand-green-700]="scan.status === 'Normal'" [class.border-brand-green-200]="scan.status === 'Normal'" [class.dark:bg-brand-green-900/40]="scan.status === 'Normal'" [class.dark:text-brand-green-400]="scan.status === 'Normal'" [class.dark:border-brand-green-800/50]="scan.status === 'Normal'"
                   [class.bg-brand-red-50]="scan.status === 'Abnormal'" [class.text-brand-red-700]="scan.status === 'Abnormal'" [class.border-brand-red-200]="scan.status === 'Abnormal'" [class.dark:bg-brand-red-900/40]="scan.status === 'Abnormal'" [class.dark:text-brand-red-400]="scan.status === 'Abnormal'" [class.dark:border-brand-red-800/50]="scan.status === 'Abnormal'"
                   [class.bg-brand-amber-50]="scan.status === 'Pending'" [class.text-brand-amber-700]="scan.status === 'Pending'" [class.border-brand-amber-200]="scan.status === 'Pending'" [class.dark:bg-brand-amber-900/40]="scan.status === 'Pending'" [class.dark:text-brand-amber-400]="scan.status === 'Pending'" [class.dark:border-brand-amber-800/50]="scan.status === 'Pending'"
                   [class.bg-brand-blue-50]="scan.status === 'Reviewed'" [class.text-brand-blue-700]="scan.status === 'Reviewed'" [class.border-brand-blue-200]="scan.status === 'Reviewed'"
                 >
                   {{ scan.status }}
                 </div>
               </div>
            } @else {
               <div class="h-40 bg-gradient-to-br from-slate-100 to-indigo-50/50 dark:from-zinc-950 dark:to-zinc-900 flex flex-col items-center justify-center relative overflow-hidden flex-shrink-0 border-b border-gray-100 dark:border-zinc-800">
                 <div class="w-14 h-14 rounded-2xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur shadow-sm border border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-center mb-1">
                   <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                     <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                     <circle cx="8.5" cy="8.5" r="1.5"/>
                     <polyline points="21 15 16 10 5 21"/>
                   </svg>
                 </div>
                 <span class="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">{{ scan.type }} Diagnostic Scan</span>
                 <div class="absolute top-2 right-2 px-2 py-0.5 rounded text-[12px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border"
                   [class.bg-brand-green-50]="scan.status === 'Normal'" [class.text-brand-green-700]="scan.status === 'Normal'" [class.border-brand-green-200]="scan.status === 'Normal'" [class.dark:bg-brand-green-900/40]="scan.status === 'Normal'" [class.dark:text-brand-green-400]="scan.status === 'Normal'" [class.dark:border-brand-green-800/50]="scan.status === 'Normal'"
                   [class.bg-brand-red-50]="scan.status === 'Abnormal'" [class.text-brand-red-700]="scan.status === 'Abnormal'" [class.border-brand-red-200]="scan.status === 'Abnormal'" [class.dark:bg-brand-red-900/40]="scan.status === 'Abnormal'" [class.dark:text-brand-red-400]="scan.status === 'Abnormal'" [class.dark:border-brand-red-800/50]="scan.status === 'Abnormal'"
                   [class.bg-brand-amber-50]="scan.status === 'Pending'" [class.text-brand-amber-700]="scan.status === 'Pending'" [class.border-brand-amber-200]="scan.status === 'Pending'" [class.dark:bg-brand-amber-900/40]="scan.status === 'Pending'" [class.dark:text-brand-amber-400]="scan.status === 'Pending'" [class.dark:border-brand-amber-800/50]="scan.status === 'Pending'"
                   [class.bg-brand-blue-50]="scan.status === 'Reviewed'" [class.text-brand-blue-700]="scan.status === 'Reviewed'" [class.border-brand-blue-200]="scan.status === 'Reviewed'"
                 >
                   {{ scan.status }}
                 </div>
               </div>
            }
            
            <div class="p-4 flex flex-col flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="px-1.5 py-0.5 rounded text-[12px] font-bold bg-[#1C1C1C] dark:bg-zinc-100 text-white dark:text-[#09090b] uppercase tracking-[0.15em] shadow-sm">{{ scan.type }}</span>
                <span class="text-[12px] text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-widest">{{ scan.date }}</span>
              </div>
              <h4 class="text-sm font-bold text-[#1C1C1C] dark:text-zinc-100 leading-tight mb-2 uppercase tracking-wide">{{ scan.title }}</h4>
              <p class="text-xs text-gray-600 dark:text-zinc-400 line-clamp-3 leading-relaxed flex-1 font-light">{{ scan.description }}</p>
            </div>
          </div>
        } @empty {
          <div class="col-span-full py-12 flex flex-col items-center justify-center text-gray-500 dark:text-zinc-400 border border-dashed border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50/50 dark:bg-zinc-900/50">
             <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/></svg>
             <p class="text-xs font-bold uppercase tracking-[0.15em] text-gray-500 dark:text-zinc-400">No Scans or Diagnostics Available</p>
             <p class="text-[12px] uppercase tracking-widest text-gray-500 mt-1">Patient records empty</p>
          </div>
        }
      </div>
    `
})
export class PatientScansComponent {
    scans = input<IDiagnosticScan[]>([]);
    private imageOptimizer = inject(ImageOptimizationService);
    failedImageIds = signal<Set<string>>(new Set());

    optimizedScans = computed(() => {
        return this.scans().map(scan => ({
            ...scan,
            imageUrl: scan.imageUrl ? this.imageOptimizer.standardizeWikipediaUrl(scan.imageUrl, 500) : scan.imageUrl
        }));
    });

    handleImageError(scanId: string) {
        this.failedImageIds.update(set => {
            const next = new Set(set);
            next.add(scanId);
            return next;
        });
    }
}
