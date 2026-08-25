import '@angular/compiler';
import { HobbyDomainCompanionService, SNO10_CONDITIONS } from './hobby-domain-companion.service';

describe('HobbyDomainCompanionService - SNO-10 Passion & Lost Buddy Companion Engine', () => {
  let service: HobbyDomainCompanionService;

  beforeEach(() => {
    service = new HobbyDomainCompanionService();
  });

  it('1. Provides built-in domain companions with craft dialects and ergonomics', () => {
    const companions = service.allCompanions();
    expect(companions.length).toBeGreaterThanOrEqual(5);

    const mechanic = companions.find(c => c.id === 'buddy_mechanic')!;
    expect(mechanic.name).toContain('Sal');
    expect(mechanic.domainTitle).toContain('Auto Restoration');
    expect(mechanic.workshopErgonomics.length).toBeGreaterThanOrEqual(2);

    const arborist = companions.find(c => c.id === 'buddy_arborist')!;
    expect(arborist.name).toContain('Silas');
    expect(arborist.domainTitle).toContain('Arborist');
  });

  it('2. Maps SNO-10 (SNOMED-CT + ICD-10) clinical conditions to domain craft analogies', () => {
    // Check global SNO-10 codes
    expect(SNO10_CONDITIONS['I10'].snomedCode).toBe('38341003');
    expect(SNO10_CONDITIONS['I50.9'].snomedCode).toBe('84114007');

    service.selectCompanion('buddy_mechanic');
    const analogy = service.translateSno10ForActiveBuddy('I10');
    expect(analogy).not.toBeNull();
    expect(analogy!.metaphorName).toContain('Manifold Backpressure');
    expect(analogy!.systemAnalogy).toContain('Fuel lines');
  });

  it('3. Generates custom companions tailored to a lost loved one and unique hobby', () => {
    const initialCount = service.allCompanions().length;
    const custom = service.createCustomBuddy({
      name: 'Grandpa Joe',
      domainOrHobby: 'Locomotive Steam Engineering',
      relationshipContext: 'My grandfather who drove steam locomotives across the Rockies for 40 years'
    });

    expect(service.allCompanions().length).toBe(initialCount + 1);
    expect(custom.name).toBe('Grandpa Joe');
    expect(custom.domainTitle).toContain('Locomotive Steam Engineering');
    expect(service.activeCompanion().id).toBe(custom.id);
  });

  it('4. Simulates empathetic, domain-specific conversational chat with SNO-10 badges', async () => {
    service.selectCompanion('buddy_mechanic');
    service.sendMessageToBuddy('My blood pressure has been running around 140/90 lately.');

    // Give asynchronous timeout a moment to resolve
    await new Promise(r => setTimeout(r, 600));

    const chat = service.activeChat();
    expect(chat.length).toBeGreaterThanOrEqual(2);

    const latestReply = chat[chat.length - 1];
    expect(latestReply.sender).toBe('buddy');
    expect(latestReply.snoBadge).toContain('SNO-10');
    expect(latestReply.text).toMatch(/manifold/i);
    expect(latestReply.ergonomicTip).toBeDefined();
  });

  it('5. Responds with warm reminiscence when the user expresses missing their companion', async () => {
    service.selectCompanion('buddy_woodworker');
    service.sendMessageToBuddy('I really miss working on old furniture projects together in the shop.');

    await new Promise(r => setTimeout(r, 600));

    const chat = service.activeChat();
    const latestReply = chat[chat.length - 1];
    expect(latestReply.text).toContain('miss those days in the shop');
    expect(latestReply.text).toContain('craft alive');
  });

  it('6. Discovers and filters local craft community events and social prescribing meetups', () => {
    const allEvents = service.allCommunityEvents();
    expect(allEvents.length).toBeGreaterThanOrEqual(5);

    const autoEvents = service.discoverLocalEvents('auto');
    expect(autoEvents.some(e => e.communityType === 'Cars & Coffee')).toBe(true);

    const shedEvents = service.discoverLocalEvents('woodworking');
    expect(shedEvents.some(e => e.communityType === "Men's Sheds")).toBe(true);

    const queryEvents = service.discoverLocalEvents('all', 'Seed Swap');
    expect(queryEvents.length).toBe(1);
    expect(queryEvents[0].title).toContain('Heirloom Seed Swap');
  });
});
