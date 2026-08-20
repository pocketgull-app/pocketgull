import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { CellularBiophysicsService } from './cellular-biophysics.service';

describe('CellularBiophysicsService', () => {
  let service: CellularBiophysicsService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [CellularBiophysicsService]
    });
    service = runInInjectionContext(injector, () => injector.get(CellularBiophysicsService));
  });

  it('should initialize with default organelle and biophysical parameters', () => {
    expect(service).toBeTruthy();
    expect(service.activeOrganelle().id).toBe('mitochondria');
    expect(service.organelleCatalog.length).toBe(4);
    expect(service.mitochondrialEfficiency()).toBe(85);
  });

  it('should compute real-time cellular telemetry', () => {
    const telemetry = service.cellularTelemetry();
    expect(telemetry.atpProductionRate).toBeGreaterThan(0);
    expect(telemetry.membranePotentialDeltaPsi).toBeLessThan(0); // nominal around -140mV
    expect(telemetry.glutathioneGshRatio).toBeGreaterThan(50);
    expect(telemetry.intracellularCalciumNanomolar).toBeGreaterThanOrEqual(100);
  });

  it('should adjust ATP production when mitochondrial efficiency changes', () => {
    const initialAtp = service.cellularTelemetry().atpProductionRate;
    service.mitochondrialEfficiency.set(45); // Dropped efficiency
    const reducedAtp = service.cellularTelemetry().atpProductionRate;
    expect(reducedAtp).toBeLessThan(initialAtp);
  });

  it('should switch active organelle and provide 4-way cytology data', () => {
    const nucleus = service.organelleCatalog.find(o => o.id === 'nucleus')!;
    service.selectOrganelle(nucleus);

    expect(service.activeOrganelle().id).toBe('nucleus');
    expect(service.activeOrganelle().allopathic.title).toContain('Genomic Architecture');
    expect(service.activeOrganelle().ayurvedic.sanskritTitle).toContain('बीज भाग');
    expect(service.activeOrganelle().tcm.hanziTitle).toContain('先天之精');
    expect(service.activeOrganelle().osteopathic.tensegrityMechanism).toContain('LINC Complex');
  });
});
