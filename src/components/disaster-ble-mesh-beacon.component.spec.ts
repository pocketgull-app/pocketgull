import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisasterBleMeshBeaconComponent } from './disaster-ble-mesh-beacon.component';
import { DisasterBleMeshService } from '../services/disaster-ble-mesh.service';

describe('DisasterBleMeshBeaconComponent', () => {
  let component: DisasterBleMeshBeaconComponent;
  let fixture: ComponentFixture<DisasterBleMeshBeaconComponent>;
  let meshService: DisasterBleMeshService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisasterBleMeshBeaconComponent],
      providers: [DisasterBleMeshService]
    }).compileComponents();

    fixture = TestBed.createComponent(DisasterBleMeshBeaconComponent);
    component = fixture.componentInstance;
    meshService = TestBed.inject(DisasterBleMeshService);
    fixture.detectChanges();
  });

  afterEach(() => {
    meshService.ngOnDestroy();
  });

  it('1. should create the disaster BLE mesh component', () => {
    expect(component).toBeTruthy();
    expect(component.meshService).toBeTruthy();
  });

  it('2. should render header and seeded mutual-aid beacons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Decentralized BLE Disaster Mesh');
    expect(compiled.textContent).toContain('Zero-Grid Resilience');

    const beacons = component.meshService.activeBeacons();
    expect(beacons.length).toBeGreaterThanOrEqual(2);

    const text = compiled.textContent || '';
    expect(text).toContain('Infant Formula');
    expect(text).toContain('Solar Generic Insulin');
  });

  it('3. should filter beacons by supply category', () => {
    expect(component.filteredBeacons().length).toBeGreaterThanOrEqual(2);

    component.selectedCategoryFilter.set('INFANT_FORMULA');
    fixture.detectChanges();

    const infantFiltered = component.filteredBeacons();
    expect(infantFiltered.every(b => b.category === 'INFANT_FORMULA')).toBe(true);

    component.selectedCategoryFilter.set('INSULIN_COLD_CHAIN');
    fixture.detectChanges();

    const insulinFiltered = component.filteredBeacons();
    expect(insulinFiltered.every(b => b.category === 'INSULIN_COLD_CHAIN')).toBe(true);

    component.selectedCategoryFilter.set('ALL');
    fixture.detectChanges();
    expect(component.filteredBeacons().length).toBeGreaterThanOrEqual(2);
  });

  it('4. should toggle shelter kiosk mode for 72h battery preservation', () => {
    expect(meshService.isKioskMode()).toBe(false);

    meshService.toggleKioskMode();
    fixture.detectChanges();

    expect(meshService.isKioskMode()).toBe(true);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('KIOSK MODE ACTIVE');

    meshService.toggleKioskMode();
    fixture.detectChanges();
    expect(meshService.isKioskMode()).toBe(false);
  });

  it('5. should submit a new supply beacon and close create modal', () => {
    component.showCreateModal.set(true);
    fixture.detectChanges();

    component.newBeaconType = 'OFFER';
    component.newBeaconCategory = 'FIRST_AID';
    component.newBeaconTitle = 'Sterile Saline IV Bags & Tourniquets';
    component.newBeaconQuantity = '8x 500mL 0.9% NaCl';
    component.newBeaconLocation = 'Cot 14, East Gym Shelter';
    component.newBeaconDetails = 'Unopened factory sealed units.';

    component.submitNewBeacon();
    fixture.detectChanges();

    expect(component.showCreateModal()).toBe(false);
    const active = meshService.activeBeacons();
    const created = active.find(b => b.title === 'Sterile Saline IV Bags & Tourniquets');
    expect(created).toBeDefined();
    expect(created?.category).toBe('FIRST_AID');
    expect(created?.locationAnchor).toBe('Cot 14, East Gym Shelter');
    expect(created?.sha256Seal).toBeDefined();
  });

  it('6. should export and import optical QR sneakernet payloads', () => {
    const payload = component.currentQrPayload();
    expect(typeof payload).toBe('string');
    expect(payload.length).toBeGreaterThan(50);

    component.incomingQrInput = payload;
    component.importQrPayload();
    fixture.detectChanges();

    expect(component.qrImportFeedback()).toContain('Ingested');
  });

  it('7. should coordinate aid on a beacon and update status', () => {
    const beacon = component.meshService.activeBeacons()[0];

    component.coordinateAid(beacon);
    fixture.detectChanges();

    const updated = component.meshService.activeBeacons().find(b => b.beaconId === beacon.beaconId);
    expect(updated?.coordinationStatus).toBe('IN_COORDINATION');
    expect(updated?.coordinatedByNote).toContain('Coordinating via responder');
  });

  it('8. should return accurate category emojis', () => {
    expect(component.getCategoryEmoji('INFANT_FORMULA')).toBe('🍼');
    expect(component.getCategoryEmoji('INSULIN_COLD_CHAIN')).toBe('❄️');
    expect(component.getCategoryEmoji('CLEAN_WATER')).toBe('💧');
    expect(component.getCategoryEmoji('PORTABLE_POWER')).toBe('⚡');
    expect(component.getCategoryEmoji('FIRST_AID')).toBe('🩹');
  });
});
