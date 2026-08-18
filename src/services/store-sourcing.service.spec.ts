import { StoreSourcingService } from './store-sourcing.service';

describe('StoreSourcingService', () => {
  let service: StoreSourcingService;

  beforeEach(() => {
    service = new StoreSourcingService();
  });

  it('should initialize with default affiliate parameters', () => {
    expect(service.amazonAffiliateTag()).toBe('pocketgull-20');
    expect(service.iherbAffiliateCode()).toBe('POCKETGULL');
  });

  it('should generate accurate Google Maps search URLs for local store categories', () => {
    const coopUrl = service.generateLocalMapsUrl('local_coop', 'Ashwagandha');
    expect(coopUrl).toContain('https://www.google.com/maps/search/?api=1');
    expect(coopUrl).toContain('independent');
    expect(coopUrl).toContain('Ashwagandha');

    const wfUrl = service.generateLocalMapsUrl('whole_foods', 'Organic Ginger');
    expect(wfUrl).toContain('Whole%20Foods%20Market');
    expect(wfUrl).toContain('Organic%20Ginger');

    const pharmUrl = service.generateLocalMapsUrl('pharmacy');
    expect(pharmUrl).toContain('CVS');
    expect(pharmUrl).toContain('Walgreens');
  });

  it('should generate Amazon Affiliate URLs with tag and optional HSA/FSA filtering', () => {
    const standardUrl = service.generateAmazonAffiliateUrl('Pulse Oximeter');
    expect(standardUrl).toBe('https://www.amazon.com/s?k=Pulse%20Oximeter&tag=pocketgull-20');

    const hsaUrl = service.generateAmazonAffiliateUrl('Blood Pressure Monitor', true);
    expect(hsaUrl).toBe('https://www.amazon.com/s?k=Blood%20Pressure%20Monitor%20HSA%20FSA%20eligible&tag=pocketgull-20');
  });

  it('should generate iHerb URLs with reward code', () => {
    const iherbUrl = service.generateIherbUrl('Ashwagandha KSM-66');
    expect(iherbUrl).toBe('https://www.iherb.com/search?kw=Ashwagandha%20KSM-66&rcode=POCKETGULL');
  });

  it('should return valid evidence-grounded tincture formulas', () => {
    const formulas = service.getTinctureFormulas();
    expect(formulas.length).toBeGreaterThanOrEqual(3);

    const shenCalm = formulas.find(f => f.id === 'formula-shen-calm');
    expect(shenCalm).toBeDefined();
    expect(shenCalm?.ingredients.length).toBe(5);
    
    // Check Emperor herb
    const emperor = shenCalm?.ingredients.find(i => i.actionRole === 'Chief / Emperor');
    expect(emperor?.name).toContain('Ashwagandha');
    expect(emperor?.percentage).toBe(30);

    // Sum of percentages must equal 100%
    const totalPercentage = shenCalm?.ingredients.reduce((sum, ing) => sum + ing.percentage, 0);
    expect(totalPercentage).toBe(100);
  });
});
