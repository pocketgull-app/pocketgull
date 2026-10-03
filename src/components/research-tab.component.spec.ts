import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResearchTabComponent, IProteinHit } from './research-tab.component';
import { AwsOpenDataService } from '../services/aws-open-data.service';
import { TriCloudConsensusService } from '../services/clinical-tri-cloud-consensus.service';

describe('ResearchTabComponent', () => {
  let fixture: ComponentFixture<ResearchTabComponent>;
  let component: ResearchTabComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResearchTabComponent],
      providers: [
        AwsOpenDataService,
        TriCloudConsensusService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResearchTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create and default to open-data subtab', () => {
    expect(component).toBeTruthy();
    expect(component.activeSubTab()).toBe('open-data');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Tri-Cloud Clinical Research & Open Data Hub');
    expect(el.textContent).toContain('Open Data Federation');
  });

  it('2. should switch active subtab to tri-cloud-consensus', () => {
    component.activeSubTab.set('tri-cloud-consensus');
    fixture.detectChanges();

    expect(component.activeSubTab()).toBe('tri-cloud-consensus');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Tri-Cloud Consensus');
  });

  it('3. should switch active subtab to structural and show empty state when hits is null', () => {
    component.activeSubTab.set('structural');
    fixture.detectChanges();

    expect(component.activeSubTab()).toBe('structural');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No active protein structural search requests');
  });

  it('4. should render protein hits table when hits are provided', () => {
    component.activeSubTab.set('structural');
    const mockHits: IProteinHit[] = [
      { id: 'P01308', name: 'Insulin (Human)', identity: '99.4%', evalue: '1.2e-45' },
      { id: 'P04637', name: 'Cellular tumor antigen p53', identity: '98.1%', evalue: '3.4e-60' }
    ];
    (component as any).hits = () => mockHits;
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('P01308');
    expect(el.textContent).toContain('Insulin (Human)');
    expect(el.textContent).toContain('99.4%');
    expect(el.textContent).toContain('P04637');
    expect(el.textContent).toContain('p53');
  });
});
