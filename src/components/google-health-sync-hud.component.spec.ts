import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoogleHealthSyncHudComponent } from './google-health-sync-hud.component';
import { GoogleHealthApiService } from '../services/hardware/google-health-api.service';

describe('GoogleHealthSyncHudComponent', () => {
  let component: GoogleHealthSyncHudComponent;
  let fixture: ComponentFixture<GoogleHealthSyncHudComponent>;
  let healthService: GoogleHealthApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoogleHealthSyncHudComponent],
      providers: [GoogleHealthApiService]
    }).compileComponents();

    fixture = TestBed.createComponent(GoogleHealthSyncHudComponent);
    component = fixture.componentInstance;
    healthService = TestBed.inject(GoogleHealthApiService);
    fixture.detectChanges();
  });

  it('1. Initializes HUD with connected Google Health status and live metrics', () => {
    expect(component).toBeTruthy();
    expect(component.status().connected).toBe(true);
    expect(component.bio().restingHeartRateBpm).toBe(58);
  });

  it('2. Triggers biometric sync via UI', () => {
    component.syncNow();
    expect(healthService.isSyncing()).toBe(true);
  });

  it('3. Disconnects and erases telemetry from UI', () => {
    component.disconnect();
    expect(healthService.isConnected()).toBe(false);
  });
});
