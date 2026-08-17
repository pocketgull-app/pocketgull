import { renderBusinessSiteHtml } from '../src/server/business-site';

describe('PocketGull Model MC-10 Lazy Susan Story Carousel', () => {
  it('should render the Dieter Rams MC-10 Lazy Susan chassis with PocketGull branding', () => {
    const html = renderBusinessSiteHtml();
    expect(html).toContain('POCKETGULL');
    expect(html).toContain('MODEL MC-10');
    expect(html).toContain('id="lazySusanDisc"');
    expect(html).toContain('id="rotaryKnobBtn"');
    expect(html).toContain('id="stageNumber"');
    expect(html).toContain('id="stageStory"');
    expect(html).toContain('ENGINE [01/05]');
    expect(html).toContain('Daily Energy &amp; Focus');
    expect(html).toContain('MITOCHONDRIA');
  });

  it('should include the 5-stage organelle story corpus in the client JavaScript engine', () => {
    const html = renderBusinessSiteHtml();
    expect(html).toContain('Daily Energy & Focus');
    expect(html).toContain('Cellular Youth & Aging');
    expect(html).toContain('Immunity & Inflammation');
    expect(html).toContain('Calm & Stress Resilience');
    expect(html).toContain('Natural Detox & Renewal');
    expect(html).toContain('updateLazySusanStage');
  });
});
