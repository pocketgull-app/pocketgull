import { renderBusinessSiteHtml } from '../src/server/business-site';

describe('Business Site 3D Flip Card Jargon-Buster System', () => {
  it('should generate valid business site HTML containing 3D flip card components', () => {
    const html = renderBusinessSiteHtml();
    expect(html).toBeDefined();
    expect(html).toContain('flip-card-container');
    expect(html).toContain('flip-card-inner');
    expect(html).toContain('flip-card-front');
    expect(html).toContain('flip-card-back');
  });

  it('should include Jargon Buster plain English translations for thinking strategies', () => {
    const html = renderBusinessSiteHtml();
    expect(html).toContain('Jargon Buster: "Guilty Until Proven Innocent"');
    expect(html).toContain('Jargon Buster: "The 360° Health Puzzle"');
    expect(html).toContain('Dbl-Click for Plain English');
  });

  it('should include Jargon Buster plain English translations for clinical trials', () => {
    const html = renderBusinessSiteHtml();
    expect(html).toContain('Jargon Buster: "Instant Matchmaker"');
    expect(html).toContain('Jargon Buster: "Fewer Sugar Pills"');
    expect(html).toContain('Jargon Buster: "Early Warning Bodyguard"');
  });

  it('should include client-side formal FlipCardStateMachine with double-click, touch double-tap, and keyboard access', () => {
    const html = renderBusinessSiteHtml();
    expect(html).toContain("FlipCardStateMachine");
    expect(html).toContain(".addEventListener('dblclick'");
    expect(html).toContain(".addEventListener('touchstart'");
    expect(html).toContain(".addEventListener('keydown'");
    expect(html).toContain(".is-flipped");
    expect(html).toContain("data-flip-state");
  });
});
