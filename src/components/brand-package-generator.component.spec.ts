import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrandPackageGeneratorComponent } from './brand-package-generator.component';
import { BrandPackageGeneratorService } from '../services/brand-package-generator.service';

describe('BrandPackageGeneratorComponent', () => {
  let component: BrandPackageGeneratorComponent;
  let fixture: ComponentFixture<BrandPackageGeneratorComponent>;
  let service: BrandPackageGeneratorService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandPackageGeneratorComponent],
      providers: [BrandPackageGeneratorService]
    }).compileComponents();

    fixture = TestBed.createComponent(BrandPackageGeneratorComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(BrandPackageGeneratorService);
    fixture.detectChanges();
  });

  it('should create and initialize default brand package', () => {
    expect(component).toBeTruthy();
    expect(component.brandName()).toBe('PocketGull Sanctuary');
    expect(component.selectedArchetype()).toBe('The Navigator');
    expect(component.activePackage()).toBeTruthy();
  });

  it('should switch tabs reactively', () => {
    expect(component.activeTab()).toBe('preview');

    component.activeTab.set('palette');
    expect(component.activeTab()).toBe('palette');

    component.activeTab.set('tokens');
    expect(component.activeTab()).toBe('tokens');
  });

  it('should re-generate kit when parameters change', async () => {
    component.brandName.set('Zenith Care');
    component.selectedArchetype.set('The Scholar');
    await component.generateKit();

    const current = component.activePackage();
    expect(current).toBeTruthy();
    expect(current?.brandName).toBe('Zenith Care');
    expect(current?.archetype).toBe('The Scholar');
  });

  it('should compute WCAG pass count correctly', () => {
    const count = component.wcagPassCount();
    expect(count).toBeGreaterThan(0);
  });

  it('should format CSS tokens for clipboard export', () => {
    const tokens = component.cssTokens();
    expect(tokens).toContain('--brand-color-primary:');
    expect(tokens).toContain('--font-display:');
  });
});
