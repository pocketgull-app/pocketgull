import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientManagementService } from '../services/patient-management.service';
import { IPatient } from '../services/patient.types';

@Component({
  selector: 'app-patient-directory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 bg-[#EEEEEE] dark:bg-zinc-950 z-[60] overflow-y-auto w-full h-full flex flex-col no-print font-sans transition-colors duration-300">
      
      <!-- New Patient Modal -->
      @if (showNewPatientModal()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div class="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-gray-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Create New Patient</h2>
            
            <form (ngSubmit)="saveNewPatient()" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Full Name</label>
                <input type="text" [(ngModel)]="newPatientForm.name" name="name" required
                       class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none transition-all">
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Age</label>
                  <input type="number" [(ngModel)]="newPatientForm.age" name="age" required min="1" max="150"
                         class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none transition-all">
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Gender</label>
                  <select [(ngModel)]="newPatientForm.gender" name="gender" required
                          class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none transition-all">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Primary Complaint / Goals</label>
                <textarea [(ngModel)]="newPatientForm.goals" name="goals" rows="3"
                          placeholder="What is the primary reason for the visit today?"
                          class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent outline-none transition-all resize-none"></textarea>
              </div>

              <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800 mt-6">
                <button type="button" (click)="showNewPatientModal.set(false)"
                        class="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" [disabled]="!newPatientForm.name || !newPatientForm.age"
                        class="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-bold shadow-sm hover:shadow hover:bg-black dark:hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95">
                  Create Chart
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Header -->
      <div class="sticky top-0 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 p-6 flex items-center justify-between z-10">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Clinical Roster</h1>
          <p class="text-sm text-gray-500 dark:text-zinc-400 mt-1">Select an active chart to continue.</p>
        </div>

        <button (click)="openNewPatientModal()" 
                class="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded shadow-sm hover:shadow active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-black dark:hover:bg-gray-100 focus:ring-gray-900 dark:focus:ring-white">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          <span class="text-sm font-semibold tracking-wide">New Patient</span>
        </button>
      </div>

      <!-- Content Grid -->
      <div class="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <!-- Search -->
        <div class="mb-8 relative max-w-xl">
          <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input type="text"
                 [(ngModel)]="searchQuery"
                 placeholder="Search by name or ID..."
                 class="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1C1C1C] border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-shadow">
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (patient of filteredPatients(); track patient.id) {
            <div (click)="selectChart(patient.id)"
                 class="group relative bg-white dark:bg-[#1C1C1C] rounded-xl p-6 border shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-[0.98]"
                 [class.border-amber-300]="isSentinelCase(patient)"
                 [class.dark:border-amber-900]="isSentinelCase(patient)"
                 [class.border-gray-200]="!isSentinelCase(patient)"
                 [class.dark:border-zinc-800]="!isSentinelCase(patient)"
                 [class.hover:border-amber-500]="isSentinelCase(patient)"
                 [class.dark:hover:border-amber-700]="isSentinelCase(patient)"
                 [class.hover:border-gray-300]="!isSentinelCase(patient)"
                 [class.dark:hover:border-zinc-700]="!isSentinelCase(patient)">
              <!-- Active Indicator Line -->
              <div class="absolute left-0 top-6 bottom-6 w-1 rounded-r opacity-0 group-hover:opacity-100 transition-opacity"
                   [class.bg-amber-500]="isSentinelCase(patient)"
                   [class.bg-green-500]="!isSentinelCase(patient)"></div>
              
              <div class="flex justify-between items-start mb-4">
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ patient.name }}</h3>
                    @if (isSentinelCase(patient)) {
                      <span class="px-2 py-0.5 text-[12px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 rounded-sm uppercase tracking-wider">🔦 Sentinel</span>
                    }
                  </div>
                  <div class="text-xs font-mono text-gray-500 dark:text-zinc-500 mt-0.5">ID: {{ patient.id }}</div>
                </div>
                <div class="w-10 h-10 rounded-full text-sm font-bold shadow-inner flex items-center justify-center"
                     [class.bg-amber-100]="isSentinelCase(patient)"
                     [class.dark:bg-amber-950/40]="isSentinelCase(patient)"
                     [class.text-amber-800]="isSentinelCase(patient)"
                     [class.dark:text-amber-300]="isSentinelCase(patient)"
                     [class.bg-gray-100]="!isSentinelCase(patient)"
                     [class.dark:bg-zinc-800]="!isSentinelCase(patient)"
                     [class.text-gray-600]="!isSentinelCase(patient)"
                     [class.dark:text-zinc-300]="!isSentinelCase(patient)">
                  {{ patient.name.charAt(0) }}
                </div>
              </div>

              <div class="space-y-2 text-sm border-t border-gray-100 dark:border-zinc-800/50 pt-4">
                <div class="flex justify-between">
                  <span class="text-gray-500 dark:text-zinc-400">Age:</span>
                  <span class="font-medium text-gray-900 dark:text-zinc-200">{{ patient.age }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500 dark:text-zinc-400">IVitals:</span>
                  <span class="font-medium text-gray-900 dark:text-zinc-200">{{ patient.vitals?.bp || '--/--' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500 dark:text-zinc-400">Last Visit:</span>
                  <span class="font-medium text-gray-900 dark:text-zinc-200">{{ patient.lastVisit || 'N/A' }}</span>
                </div>
              </div>
            </div>
          }

          @if (filteredPatients().length === 0) {
            <div class="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 dark:text-zinc-600 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-900/20">
              <svg class="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              <h3 class="text-lg font-medium text-gray-900 dark:text-zinc-300">No patients found</h3>
              <p class="text-sm mt-1">Try adjusting your search or add a new patient.</p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class PatientDirectoryComponent {
  private patientService = inject(PatientManagementService);

  isSentinelCase(patient: any): boolean {
    return !!patient && (patient.name.toLowerCase().includes('sentinel') || ['p004', 'p005', 'p006', 'p007'].includes(patient.id));
  }
  
  // Local state
  searchQuery = signal<string>('');
  showNewPatientModal = signal<boolean>(false);
  
  newPatientForm = {
    name: '',
    age: 35,
    gender: 'Other' as IPatient['gender'],
    goals: ''
  };
  
  // Computed projection of the roster
  filteredPatients = computed(() => {
    const rawData = this.patientService.patients();
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return rawData;
    
    return rawData.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.id.toLowerCase().includes(query)
    );
  });

  selectChart(id: string) {
    this.patientService.selectPatient(id);
    // Note: The root app component will auto-close this directory overlay since selectedPatientId becomes truthy
  }

  openNewPatientModal() {
    this.newPatientForm = { name: '', age: 35, gender: 'Other', goals: '' };
    this.showNewPatientModal.set(true);
  }

  async saveNewPatient() {
    if (!this.newPatientForm.name || !this.newPatientForm.age) return;
    
    // Create via service and capture the auto-generated ID
    const newId = await this.patientService.createNewPatient();
    
    if (newId) {
      this.patientService.updatePatientDetails(newId, {
        name: this.newPatientForm.name,
        age: this.newPatientForm.age,
        gender: this.newPatientForm.gender,
        patientGoals: this.newPatientForm.goals
      });
    }
    
    this.showNewPatientModal.set(false);
  }
}
