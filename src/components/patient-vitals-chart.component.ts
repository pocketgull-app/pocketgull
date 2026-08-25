import { Component, ChangeDetectionStrategy, Input, ViewChild, ElementRef, OnChanges, SimpleChanges, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HistoryEntry, IPatientVitals } from '../services/patient.types';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-patient-vitals-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4">
      <h3 class="text-xs font-bold text-gray-800 uppercase tracking-widest mb-4">Longitudinal IVitals</h3>
      <div class="relative w-full h-48">
         <canvas #chartCanvas></canvas>
         @if (noData) {
            <div class="absolute inset-0 flex items-center justify-center text-gray-400 text-xs text-center bg-gray-50/80 rounded-lg">
                Not enough historical<br>vitals recorded.
            </div>
         }
      </div>
    </div>
  `
})
export class PatientVitalsChartComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) history!: HistoryEntry[];
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;
  private platformId = inject(PLATFORM_ID);
  noData = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['history'] && isPlatformBrowser(this.platformId)) {
        // Need to wait for view to render canvas if it was previously hidden via SSR or noData toggle
        setTimeout(() => this.updateChart(), 0);
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private updateChart() {
    if (!this.history || !this.chartCanvas) return;

    // 1. Extract and sort visits chronologically
    const visits = this.history
      .filter(h => h.type === 'Visit' || h.type === 'ChartArchived')
      .filter(h => 'state' in h && h.state && h.state.vitals)
      .sort((a, b) => new Date(a.date.replace(/\./g, '-')).getTime() - new Date(b.date.replace(/\./g, '-')).getTime());

    // 2. Parse vitals
    interface IChartDataPoint { date: string; sys: number | null; dia: number | null; weight: number | null; }
    
    const dataPoints: IChartDataPoint[] = visits.map(v => {
      const vitals = ('state' in v && v.state) ? v.state.vitals : null;
      let sys: number | null = null;
      let dia: number | null = null;
      let weight: number | null = null;

      if (vitals?.bp) {
        const parts = vitals.bp.split('/');
        if (parts.length === 2 && !isNaN(parseInt(parts[0])) && !isNaN(parseInt(parts[1]))) {
          sys = parseInt(parts[0]);
          dia = parseInt(parts[1]);
        }
      }

      if (vitals?.weight) {
        const parsed = parseFloat(vitals.weight.replace(/[^0-9.]/g, ''));
        if (!isNaN(parsed)) {
           weight = parsed;
        }
      }

      return { date: v.date.substring(5), sys, dia, weight }; // Use MM.DD formatting
    });

    const validData = dataPoints.filter(dp => dp.sys !== null || dp.weight !== null);
    
    this.noData = validData.length < 2;

    if (this.chart) {
        this.chart.destroy();
        this.chart = null;
    }

    if (this.noData) return;

    const labels = validData.map(dp => dp.date);
    const weightData = validData.map(dp => dp.weight);
    const sysData = validData.map(dp => dp.sys);
    const diaData = validData.map(dp => dp.dia);

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Weight (lbs)',
            data: weightData,
            borderColor: '#3b82f6', // Blueprint Blue
            backgroundColor: '#3b82f6',
            yAxisID: 'y',
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 3
          },
          {
            label: 'Systolic BP',
            data: sysData,
            borderColor: '#ef4444', // Red
            backgroundColor: '#ef4444',
            yAxisID: 'y1',
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 3
          },
          {
            label: 'Diastolic BP',
            data: diaData,
            borderColor: '#f87171', // Lighter Red
            backgroundColor: '#f87171',
            borderDash: [5, 5],
            yAxisID: 'y1',
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { 
              display: true, 
              position: 'top',
              labels: { boxWidth: 10, usePointStyle: true, font: { size: 10, family: 'Inter' } }
          },
          tooltip: {
               bodyFont: { family: 'Inter' },
               titleFont: { family: 'Inter' }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 9, family: 'Inter' } }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: false },
            grid: { color: '#f3f4f6' }, // Subtle grid
            ticks: { font: { size: 9, family: 'Inter' }, color: '#3b82f6' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: { drawOnChartArea: false }, // only draw once
            ticks: { font: { size: 9, family: 'Inter' }, color: '#ef4444' }
          }
        }
      }
    });

  }
}
