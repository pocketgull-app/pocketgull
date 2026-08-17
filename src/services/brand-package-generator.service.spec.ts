import { TestBed } from '@angular/core/testing';
import { BrandPackageGeneratorService, IBrandGenerationRequest } from './brand-package-generator.service';

describe('BrandPackageGeneratorService (Google SWE Book & Zero-Waste Architecture)', () => {
  let service: BrandPackageGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BrandPackageGeneratorService]
    });
    service = TestBed.inject(BrandPackageGeneratorService);
  });

  it('should initialize with null active package and empty error', () => {
    expect(service.currentPackage()).toBeNull();
    expect(service.isLoading()).toBe(false);
    expect(service.errorMessage()).toBeNull();
  });

  it('should generate a complete brand package deterministically', async () => {
    const req: IBrandGenerationRequest = {
      brandName: 'PocketGull Sanctuary',
      industry: 'Pediatric Art Therapy & Clinical Design',
      archetype: 'The Scholar',
      primaryColorHex: '#7E22CE'
    };

    const result = await service.generateBrandPackage(req);

    expect(result).toBeDefined();
    expect(result.brandName).toBe('PocketGull Sanctuary');
    expect(result.archetype).toBe('The Scholar');
    expect(result.colors.length).toBeGreaterThanOrEqual(4);
    expect(result.typography.length).toBe(4);
    expect(result.assets.length).toBe(3);
    expect(result.source).toBe('deterministic_engine');
    expect(result.cacheHit).toBe(false);

    // Verify signal state update
    expect(service.currentPackage()?.id).toBe(result.id);
  });

  it('should compute WCAG 2.2 contrast ratios accurately', () => {
    // Pure Black on Pure White is 21:1
    const blackOnWhite = service.calculateContrastRatio('#000000', '#FFFFFF');
    expect(blackOnWhite).toBeCloseTo(21, 0);

    // Pure White on Pure White is 1:1
    const whiteOnWhite = service.calculateContrastRatio('#FFFFFF', '#FFFFFF');
    expect(whiteOnWhite).toBeCloseTo(1, 0);

    // Charcoal Slate #0F172A on White #FFFFFF
    const slateOnWhite = service.calculateContrastRatio('#0F172A', '#FFFFFF');
    expect(slateOnWhite).toBeGreaterThan(15.0);
  });

  it('should serve subsequent duplicate requests from cache (Zero-Waste Billing)', async () => {
    const req: IBrandGenerationRequest = {
      brandName: 'Apex Health',
      industry: 'Cardiology Informatics',
      archetype: 'The Navigator'
    };

    const firstRun = await service.generateBrandPackage(req);
    expect(firstRun.cacheHit).toBe(false);

    const secondRun = await service.generateBrandPackage(req);
    expect(secondRun.cacheHit).toBe(true);
    expect(secondRun.id).toBe(firstRun.id);
  });

  it('should infer appropriate archetypes from industry keywords', () => {
    const statsPkg = service.buildDeterministicBrandPackage({
      brandName: 'EvidenceBio',
      industry: 'Statistical Epidemiology & Clinical Trials'
    });
    expect(statsPkg.archetype).toBe('The Statistician');

    const spatialPkg = service.buildDeterministicBrandPackage({
      brandName: 'VoxelMed',
      industry: '3D Spatial Anatomy & Surgical Vision'
    });
    expect(spatialPkg.archetype).toBe('The Explorer');

    const circadianPkg = service.buildDeterministicBrandPackage({
      brandName: 'ChronoCare',
      industry: 'Circadian Rhythm Time-Series Monitoring'
    });
    expect(circadianPkg.archetype).toBe('The Chronicler');
  });

  it('should export CSS Custom Property design tokens correctly', () => {
    const pkg = service.buildDeterministicBrandPackage({
      brandName: 'Understory Health',
      archetype: 'The Navigator'
    });

    const css = service.exportCssTokens(pkg);

    expect(css).toContain('/* Understory Health - AI Design System Tokens */');
    expect(css).toContain(':root {');
    expect(css).toContain('--brand-color-primary:');
    expect(css).toContain('--font-display:');
    expect(css).toContain('--font-mono:');
  });

  it('should escape XML entities in generated SVG assets to prevent XSS', () => {
    const pkg = service.buildDeterministicBrandPackage({
      brandName: 'Health <&> Security "App"',
      archetype: 'The Scholar'
    });

    const wordmark = pkg.assets.find(a => a.type === 'wordmark');
    expect(wordmark).toBeDefined();
    expect(wordmark?.svgContent).toContain('Health &lt;&amp;&gt; Security &quot;App&quot;');
    expect(wordmark?.svgContent).not.toContain('Health <&> Security "App"');
  });
});
