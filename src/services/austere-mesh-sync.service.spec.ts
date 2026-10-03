import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AustereMeshSyncService, IMeshSyncPacket, IMeshColdChainAlert, IMeshTriageItem } from './austere-mesh-sync.service';
import { WhoEssentialDiagnosticsService } from './who-essential-diagnostics.service';

describe('AustereMeshSyncService (Local-First Offline Multi-Node Mesh Sync)', () => {
  let service: AustereMeshSyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AustereMeshSyncService, WhoEssentialDiagnosticsService]
    });
    service = TestBed.inject(AustereMeshSyncService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should initialize with active mesh connection and pre-configured nodes', () => {
    expect(service.connectionStatus()).toBe('MESH_CONNECTED');
    expect(service.peerNodes().length).toBeGreaterThanOrEqual(3);
    expect(service.activePeerCount()).toBeGreaterThanOrEqual(3);
    expect(service.localNode().role).toBe('field_chw');
    expect(service.meshSsid()).toBe('MSF_AUSTERE_MESH_5G');
  });

  it('should broadcast and track critical cold-chain emergency alerts across mesh', () => {
    const alert = service.broadcastColdChainAlert({
      fridgeUnit: 'Vaccine Depot Refrig #2',
      temperatureCelsius: -1.8,
      statusTier: 'FREEZE_HAZARD',
      alertMessage: 'CRITICAL FREEZE HAZARD: HepB / DTP vials at risk of irreversible denaturation!'
    });

    expect(alert.alertId).toContain('cca_');
    expect(alert.statusTier).toBe('FREEZE_HAZARD');
    expect(alert.temperatureCelsius).toBe(-1.8);
    expect(alert.acknowledged).toBe(false);

    expect(service.activeColdChainAlerts().length).toBe(1);
    expect(service.activeEmergencyAlertCount()).toBe(1);
    expect(service.packetsTransmittedCount()).toBeGreaterThan(12);
  });

  it('should acknowledge active cold-chain alerts and update active count', () => {
    const alert = service.broadcastColdChainAlert({
      fridgeUnit: 'Solar Fridge #1',
      temperatureCelsius: 12.4,
      statusTier: 'HEAT_EXCURSION',
      alertMessage: 'Heat excursion above 8°C'
    });

    expect(service.activeEmergencyAlertCount()).toBe(1);

    service.acknowledgeColdChainAlert(alert.alertId);
    expect(service.activeEmergencyAlertCount()).toBe(0);

    const updated = service.activeColdChainAlerts().find(a => a.alertId === alert.alertId);
    expect(updated?.acknowledged).toBe(true);
    expect(updated?.acknowledgedByNodeId).toBe(service.localNode().nodeId);
  });

  it('should enqueue a new patient onto the austere mesh triage queue', () => {
    const initialCount = service.triageQueue().length;

    const patient = service.enqueueTriagePatient({
      patientToken: 'Patient #104 (Infant F, 6m)',
      ageMonths: 6,
      weightKg: 5.8,
      gender: 'FEMALE',
      muacMm: 110,
      acuityTier: 'RED',
      chiefComplaint: 'Bilateral pedal edema, severe lethargy',
      clinicalCategory: 'Kwashiorkor / SAM'
    });

    expect(patient.ticketId).toContain('tkt_');
    expect(patient.status).toBe('WAITING');
    expect(service.triageQueue().length).toBe(initialCount + 1);
    expect(service.waitingTriageCount()).toBeGreaterThanOrEqual(3);
  });

  it('should transition patient triage status and stamp completion timestamp', () => {
    const ticketId = 'tkt_002_pneu';

    service.updateTriageStatus(ticketId, 'IN_CONSULT', 'Dr. Sarah (MSF)');
    let item = service.triageQueue().find(t => t.ticketId === ticketId);
    expect(item?.status).toBe('IN_CONSULT');
    expect(item?.assignedClinician).toBe('Dr. Sarah (MSF)');

    service.updateTriageStatus(ticketId, 'DISCHARGED');
    item = service.triageQueue().find(t => t.ticketId === ticketId);
    expect(item?.status).toBe('DISCHARGED');
    expect(item?.completedIso).toBeDefined();
  });

  it('should process incoming mesh packets from remote peer nodes', () => {
    const incomingAlert: IMeshColdChainAlert = {
      alertId: 'cca_peer_remote_99',
      fridgeUnit: 'Mobile Field Cooler 3',
      temperatureCelsius: 14.5,
      statusTier: 'HEAT_EXCURSION',
      alertMessage: 'Ice packs melted in transit',
      reportedByNodeId: 'node_peer_chw_remote',
      timestampIso: new Date().toISOString(),
      acknowledged: false
    };

    const packet: IMeshSyncPacket<IMeshColdChainAlert> = {
      packetId: 'pkt_incoming_123',
      sequenceNumber: 42,
      senderNodeId: 'node_peer_chw_remote',
      senderRole: 'field_chw',
      type: 'COLD_CHAIN_ALERT',
      payload: incomingAlert,
      timestampIso: new Date().toISOString(),
      integrityDigestSha256: 'sha256_mock'
    };

    service.handleIncomingMeshPacket(packet);

    expect(service.activeColdChainAlerts().some(a => a.alertId === 'cca_peer_remote_99')).toBe(true);
    expect(service.packetsReceivedCount()).toBeGreaterThan(29);
  });

  it('should ignore self-originated broadcast loopback packets', () => {
    const currentReceived = service.packetsReceivedCount();

    const selfPacket: IMeshSyncPacket = {
      packetId: 'pkt_self_1',
      sequenceNumber: 1,
      senderNodeId: service.localNode().nodeId,
      senderRole: service.localNode().role,
      type: 'NODE_HEARTBEAT',
      payload: service.localNode(),
      timestampIso: new Date().toISOString(),
      integrityDigestSha256: 'sha256_mock'
    };

    service.handleIncomingMeshPacket(selfPacket);
    expect(service.packetsReceivedCount()).toBe(currentReceived); // Not incremented
  });

  it('should add simulated peer node and send local heartbeats', () => {
    const newPeer = service.addSimulatedPeerNode({
      nodeName: 'Maternity Ward Tablet #3',
      role: 'triage_nurse',
      ipAddress: '192.168.4.33'
    });

    expect(service.peerNodes().some(p => p.nodeId === newPeer.nodeId)).toBe(true);

    const prevTransmit = service.packetsTransmittedCount();
    service.sendHeartbeat();
    expect(service.packetsTransmittedCount()).toBe(prevTransmit + 1);
  });
});
