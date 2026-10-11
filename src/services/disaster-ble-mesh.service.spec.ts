import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DisasterBleMeshService, IDisasterSupplyBeacon } from './disaster-ble-mesh.service';

describe('DisasterBleMeshService Unit Suite', () => {
  let service: DisasterBleMeshService;

  beforeEach(() => {
    const injector = Injector.create({ providers: [] });
    service = runInInjectionContext(injector, () => new DisasterBleMeshService());
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('1. Initializes with seeded mutual-aid beacons and peer relays', () => {
    const beacons = service.activeBeacons();
    expect(beacons.length).toBeGreaterThanOrEqual(4);

    const formula = beacons.find(b => b.category === 'INFANT_FORMULA');
    expect(formula).toBeDefined();
    expect(formula?.locationAnchor).toContain('Apt 3B');
    expect(formula?.beaconType).toBe('OFFER');

    const insulin = beacons.find(b => b.category === 'INSULIN_COLD_CHAIN');
    expect(insulin).toBeDefined();
    expect(insulin?.title).toContain('Insulin');
    expect(insulin?.beaconType).toBe('SHELTER_RESOURCE');

    expect(service.offersCount()).toBeGreaterThanOrEqual(2);
    expect(service.needsCount()).toBeGreaterThanOrEqual(1);
    expect(service.resourcesCount()).toBeGreaterThanOrEqual(1);
    expect(service.discoveredPeers().length).toBeGreaterThanOrEqual(2);
  });

  it('2. Broadcasts new emergency supply offer with cryptographic SHA-256 seal', () => {
    const newBeacon = service.broadcastSupplyBeacon({
      beaconType: 'OFFER',
      category: 'PORTABLE_POWER',
      title: 'Solar Inverter 110V AC Power Available for Nebulizers',
      details: 'Solar generator fully charged, open for medical device charging.',
      quantity: '4 AC outlets available',
      locationAnchor: 'Community Center Tent 4',
      contactAnchor: 'Radio Operator Gary',
      ttlHours: 36
    });

    expect(newBeacon.beaconId).toContain('bcn_portable_power');
    expect(newBeacon.sha256Seal.length).toBe(64);
    expect(newBeacon.hopCount).toBe(0);
    expect(newBeacon.verified).toBe(true);

    const found = service.activeBeacons().find(b => b.beaconId === newBeacon.beaconId);
    expect(found).toBeDefined();
  });

  it('3. Ingests incoming peer beacon with hop-count increment and suppresses duplicates', () => {
    const remoteBeacon: IDisasterSupplyBeacon = {
      beaconId: 'bcn_water_remote_001',
      beaconType: 'OFFER',
      category: 'CLEAN_WATER',
      title: 'Water Cistern Available',
      details: 'Deep well water filtered through sand/charcoal.',
      quantity: '50 Gallons',
      locationAnchor: 'North Church Courtyard',
      contactAnchor: 'Caretaker Jim',
      timestampIso: new Date().toISOString(),
      ttlHours: 48,
      hopCount: 1,
      verified: true,
      sha256Seal: '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff'
    };

    const firstIngest = service.ingestIncomingBeacon(remoteBeacon);
    expect(firstIngest).toBe(true);

    const stored = service.activeBeacons().find(b => b.beaconId === remoteBeacon.beaconId);
    expect(stored?.hopCount).toBe(2);

    // Duplicate ingestion should return false
    const duplicateIngest = service.ingestIncomingBeacon(remoteBeacon);
    expect(duplicateIngest).toBe(false);
  });

  it('4. Coordinates aid and updates beacon status', () => {
    const success = service.acknowledgeOrCoordinateAid('bcn_formula_apt3b', 'Picked up 1 can for Infant at Cot 12');
    expect(success).toBe(true);

    const updated = service.activeBeacons().find(b => b.beaconId === 'bcn_formula_apt3b');
    expect(updated?.coordinationStatus).toBe('IN_COORDINATION');
    expect(updated?.coordinatedByNote).toContain('Infant at Cot 12');
  });

  it('5. Toggles Low-Power Shelter Kiosk Mode and prolongs battery estimate', () => {
    expect(service.isKioskMode()).toBe(false);
    const initialHours = service.batteryTelemetry().estimatedHoursRemaining;

    service.toggleKioskMode();
    expect(service.isKioskMode()).toBe(true);
    expect(service.batteryTelemetry().estimatedHoursRemaining).toBeGreaterThan(initialHours);

    service.toggleKioskMode();
    expect(service.isKioskMode()).toBe(false);
  });

  it('6. Exports and imports Optical QR Visual Mesh Sneakernet payloads', () => {
    const qrPayload = service.exportVisualMeshQrPayload();
    expect(typeof qrPayload).toBe('string');
    expect(qrPayload.length).toBeGreaterThan(50);

    // Create fresh service instance to test optical import
    const newService = new DisasterBleMeshService();
    // Clear initial beacons to verify pure import
    (newService as any).activeBeacons.set([]);

    const result = newService.importVisualMeshQrPayload(qrPayload);
    expect(result.success).toBe(true);
    expect(result.importedCount).toBeGreaterThanOrEqual(4);
    expect(newService.activeBeacons().length).toBeGreaterThanOrEqual(4);

    newService.ngOnDestroy();
  });

  it('7. Scans for BLE peers with graceful simulation fallback', async () => {
    const scanPromise = service.scanForBlePeers();
    expect(service.isScanning()).toBe(true);

    await scanPromise;
    await new Promise(resolve => setTimeout(resolve, 500));

    expect(service.isScanning()).toBe(false);
    expect(service.discoveredPeers().length).toBeGreaterThanOrEqual(2);
  });
});
