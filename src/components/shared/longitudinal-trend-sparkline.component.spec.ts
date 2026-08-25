import { Injector, runInInjectionContext } from '@angular/core';
import { LongitudinalTrendSparklineComponent, ILongitudinalDataPoint } from './longitudinal-trend-sparkline.component';

describe('LongitudinalTrendSparklineComponent', () => {
  const createComponent = () => {
    const injector = Injector.create({ providers: [] });
    return runInInjectionContext(injector, () => new LongitudinalTrendSparklineComponent());
  };

  it('1. Computes latest value, delta and improving direction correctly', () => {
    const comp = createComponent();
    const data: ILongitudinalDataPoint[] = [
      { date: '2026-01-10', value: 42.0 },
      { date: '2026-02-15', value: 48.5 },
      { date: '2026-03-20', value: 55.0 }
    ];

    (comp as any).dataPoints = () => data;
    (comp as any).metricTitle = () => 'Heart Rate Variability (rMSSD)';
    (comp as any).unit = () => 'ms';
    (comp as any).paradigm = () => 'western';
    (comp as any).targetRange = () => ({ min: 45, max: 70 });

    expect(comp.latestValue()).toBe(55.0);
    expect(comp.latestValueFormatted()).toBe('55.0');
    expect(comp.delta()).toBe(13.0);
    expect(comp.deltaFormatted()).toBe('+13.0 ms');
    expect(comp.trendDirection()).toBe('improving');
    expect(comp.trendLabel()).toContain('Improving');
  });

  it('2. Generates SVG polyline and area paths for sparkline visualization', () => {
    const comp = createComponent();
    const data: ILongitudinalDataPoint[] = [
      { date: '2026-01-01', value: 10 },
      { date: '2026-02-01', value: 20 },
      { date: '2026-03-01', value: 15 }
    ];

    (comp as any).dataPoints = () => data;
    (comp as any).metricTitle = () => 'TCM Kidney Yin Score';
    (comp as any).unit = () => '/10';
    (comp as any).paradigm = () => 'tcm';
    (comp as any).targetRange = () => null;

    const points = comp.svgPoints();
    expect(points.length).toBe(3);
    expect(points[0].x).toBeDefined();
    expect(points[0].y).toBeDefined();

    const strokePath = comp.sparklineStrokePath();
    expect(strokePath).toContain('M');
    expect(strokePath).toContain('L');

    const fillPath = comp.sparklineFillPath();
    expect(fillPath).toContain('Z');
  });

  it('3. Renders paradigm colors and icons for Ayurvedic and Osteopathic views', () => {
    const comp = createComponent();
    (comp as any).paradigm = () => 'ayurveda';
    expect(comp.getParadigmIcon()).toBe('🪷');
    expect(comp.getStrokeColor()).toBe('#d97706');

    (comp as any).paradigm = () => 'osteopathic';
    expect(comp.getParadigmIcon()).toBe('🦴');
    expect(comp.getStrokeColor()).toBe('#7c3aed');
  });
});
