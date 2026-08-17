import { PubGemmaProvider } from './pubgemma.provider';

describe('PubGemmaProvider', () => {
  const provider = new PubGemmaProvider();

  it('1. Generates PubGemma literature-grounded streaming report', async () => {
    const stream = provider.generateReportStream$('Patient Vitals: HR 72', 'Functional Protocols', 'Act as doctor.');
    const chunks: string[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const reportText = chunks.join('');
    expect(reportText).toContain('PUBGEMMA');
    expect(reportText).toContain('PubMed MeSH Verified Clinical Strategy');
  });

  it('2. Responds to chat messages with PubMed grounding', async () => {
    const res = await provider.sendMessage('What is vagal tone?');
    expect(res).toContain('PubGemma Medical Assistant');
    expect(res).toContain('PubMed literature grounding');
  });
});
