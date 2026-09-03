import { TestBed } from '@angular/core/testing';
import { BiophilicVagalOdysseyHudComponent } from './biophilic-vagal-odyssey-hud.component';
import { OpticalInnovationsService } from '../services/optical-innovations.service';
import { OpticalChronoTrajectoryService } from '../services/optical-chrono-trajectory.service';
import { ContactlessRppgService } from '../services/contactless-rppg.service';

describe('BiophilicVagalOdysseyHudComponent Suite', () => {
  let component: BiophilicVagalOdysseyHudComponent;
  let optical: OpticalInnovationsService;
  let rppg: ContactlessRppgService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BiophilicVagalOdysseyHudComponent,
        OpticalInnovationsService,
        OpticalChronoTrajectoryService,
        ContactlessRppgService
      ]
    });
    component = TestBed.inject(BiophilicVagalOdysseyHudComponent);
    optical = TestBed.inject(OpticalInnovationsService);
    rppg = TestBed.inject(ContactlessRppgService);
  });

  afterEach(() => {
    optical.pausePbmSession();
  });

  it('1. Initializes 3 biophilic waypoints with optical and acoustic synergies', () => {
    expect(component.waypoints().length).toBe(3);
    expect(component.waypoints()[0].title).toContain('Canopy Immersion & 480nm ipRGC');
    expect(component.waypoints()[0].acousticHz).toBe(528);
    expect(component.waypoints()[1].title).toContain('Acoustic Grounding & 0.1Hz OKN/VOR');
    expect(component.waypoints()[1].acousticHz).toBe(432);
    expect(component.waypoints()[2].title).toContain('Sanctuary Cedar Bench & 3-Min 670nm Retinal PBM');
    expect(component.waypoints()[2].acousticHz).toBe(7.83);
  });

  it('2. Engages Waypoint 3 and launches 670nm Retinal PBM therapy session', () => {
    component.engageWaypoint(component.waypoints()[2]);
    expect(optical.activeMode()).toBe('photobiomodulation-670nm');
    expect(optical.pbmState().isActive).toBe(true);
  });

  it('3. Engages Waypoint 1 and launches CIE S 026 Dawn Alert ipRGC mode', () => {
    component.engageWaypoint(component.waypoints()[0]);
    expect(optical.activeMode()).toBe('melanopic-iprgc-circadian');
    expect(optical.melanopicState().phase).toBe('dawn-alert');
  });

  it('4. Measures vagal shift and updates rPPG biometrics and vagal balance', () => {
    const initHr = rppg.liveHeartRateBpm();
    const initHrv = rppg.hrvRmssdMs();

    component.measureVagalShift();

    expect(rppg.liveHeartRateBpm()).toBeLessThan(initHr);
    expect(rppg.hrvRmssdMs()).toBeGreaterThan(initHrv);
  });

  it('5. Toggles waypoint completion and tracks earned vagal points', () => {
    expect(component.earnedVagalPoints()).toBe(0);
    component.toggleWaypointComplete('odyssey-wp-1');
    expect(component.earnedVagalPoints()).toBe(40);
    expect(component.completedWaypointsCount()).toBe(1);

    component.toggleWaypointComplete('odyssey-wp-2');
    expect(component.earnedVagalPoints()).toBe(90);
    expect(component.completedWaypointsCount()).toBe(2);
  });

  it('6. Toggles clinical evidence drawer and provides grounded PMIDs', () => {
    expect(component.isEvidenceDrawerOpen()).toBe(false);
    component.isEvidenceDrawerOpen.set(true);
    expect(component.isEvidenceDrawerOpen()).toBe(true);

    expect(component.relevantCitations.length).toBeGreaterThanOrEqual(5);
    const pbmCite = component.relevantCitations.find(c => c.pmid === '32559297');
    expect(pbmCite).toBeDefined();
    expect(pbmCite?.title).toContain('Optically improved mitochondrial function');
    expect(pbmCite?.doiUrl).toContain('https://doi.org/');
  });
});
