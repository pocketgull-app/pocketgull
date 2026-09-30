import { Component, ChangeDetectionStrategy, Input, ViewChild, ElementRef, OnChanges, SimpleChanges, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HistoryEntry, IPatientVitals } from '../services/patient.types';
import * as echarts from 'echarts';

@Component({
  selector: 'app-patient-vitals-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4">
      <h3 class="text-xs font-bold text-gray-800 uppercase tracking-widest mb-4">Longitudinal IVitals</h3>
      <div class="relative w-full h-48">
         <div #chartCanvas class="w-full h-full"></div>
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
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLDivElement>;

  private chart: echarts.ECharts | null = null;
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
      this.chart.dispose();
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
        this.chart.dispose();
        this.chart = null;
    }

    if (this.noData) return;

    const labels = validData.map(dp => dp.date);
    const weightData = validData.map(dp => dp.weight);
    const sysData = validData.map(dp => dp.sys);
    const diaData = validData.map(dp => dp.dia);

    const dom = this.chartCanvas.nativeElement;
    if (!dom) return;

    this.chart = echarts.init(dom, null, { renderer: 'svg' });

    const option = {
      tooltip: {
        trigger: 'axis',
        textStyle: { fontFamily: 'Inter' }
      },
      legend: {
        data: ['Weight (lbs)', 'Systolic BP', 'Diastolic BP'],
        textStyle: { fontFamily: 'Inter', fontSize: 10 },
        top: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: labels,
        axisLabel: { fontFamily: 'Inter', fontSize: 9 }
      },
      yAxis: [
        {
          type: 'value',
          position: 'left',
          axisLabel: { fontFamily: 'Inter', fontSize: 9, color: '#3b82f6' },
          splitLine: { lineStyle: { color: '#f3f4f6' } }
        },
        {
          type: 'value',
          position: 'right',
          axisLabel: { fontFamily: 'Inter', fontSize: 9, color: '#ef4444' },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'Weight (lbs)',
          type: 'line',
          yAxisIndex: 0,
          data: weightData,
          smooth: 0.3,
          itemStyle: { color: '#3b82f6' },
          lineStyle: { width: 2 }
        },
        {
          name: 'Systolic BP',
          type: 'line',
          yAxisIndex: 1,
          data: sysData,
          smooth: 0.3,
          itemStyle: { color: '#ef4444' },
          lineStyle: { width: 2 }
        },
        {
          name: 'Diastolic BP',
          type: 'line',
          yAxisIndex: 1,
          data: diaData,
          smooth: 0.3,
          itemStyle: { color: '#f87171' },
          lineStyle: { width: 2, type: 'dashed' }
        }
      ]
    };

    this.chart.setOption(option);
  }
}
