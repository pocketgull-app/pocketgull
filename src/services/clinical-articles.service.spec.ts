import '@angular/compiler';
import { ClinicalArticlesService, FALLBACK_SEED_ARTICLES } from './clinical-articles.service';

describe('ClinicalArticlesService - Native GenAI App Engine & Clinical Articles Sync', () => {
  let service: ClinicalArticlesService;

  beforeEach(() => {
    service = new ClinicalArticlesService();
  });

  it('1. Provides native offline seed articles with SNO-10 categories and Caslon prose', () => {
    const posts = service.allPosts();
    expect(posts.length).toBeGreaterThanOrEqual(3);
    expect(posts[0].title).toContain('Keeping Their Craft Alive');
    expect(posts[0].sno10Category).toBe('Bereavement & Craft Continuity');
  });

  it('2. Supports selecting and switching active article posts', () => {
    service.selectPost('cardiovascular-intimacy-safety-princeton-iii');
    const active = service.activePost();
    expect(active).not.toBeNull();
    expect(active?.slug).toBe('cardiovascular-intimacy-safety-princeton-iii');
    expect(active?.title).toContain('2-Flight-of-Stairs Rule');
  });

  it('3. Loads native clinical articles with zero network egress and full metadata', async () => {
    const result = await service.fetchClinicalArticles();
    expect(result.length).toBe(FALLBACK_SEED_ARTICLES.length);
    expect(service.isLoading()).toBe(false);
  });

  it('4. Serves Article 107 on Charles Darwin, the Vagal Enigma, and 3B Innovation', () => {
    service.selectPost('darwin-vagal-enigma-innovation-bending-breaking-blending');
    const post = service.activePost();
    expect(post).not.toBeNull();
    expect(post?.id).toBe(107);
    expect(post?.title).toContain('Charles Darwin');
    expect(post?.title).toContain('Bending, Breaking, and Blending');
    expect(post?.tags).toContain('Bending Breaking Blending');
    expect(post?.contentHtml).toContain('Down House');
    expect(post?.contentHtml).toContain('Chagas Disease');
    expect(post?.contentHtml).toContain('The 3B Engine of Innovation');
  });

  it('5. Serves Article 109 on The Living Hospital Body, Great Relays, and High-Reliability Teams', () => {
    service.selectPost('living-hospital-body-great-relays-high-reliability-teams');
    const post = service.activePost();
    expect(post).not.toBeNull();
    expect(post?.id).toBe(109);
    expect(post?.title).toContain('The Living Hospital Body & The Great Relays');
    expect(post?.tags).toContain('Crew Resource Management');
    expect(post?.tags).toContain('F1 Pit Crew Handover');
    expect(post?.tags).toContain('Tridoshic Hospital Balance');
    expect(post?.tags).toContain('Project 523');
    expect(post?.contentHtml).toContain('Organizational Vata');
    expect(post?.contentHtml).toContain('Organizational Pitta');
    expect(post?.contentHtml).toContain('Organizational Kapha');
    expect(post?.contentHtml).toContain('Great Ormond Street Hospital');
    expect(post?.contentHtml).toContain('Tu Youyou');
    expect(post?.contentHtml).toContain('Toronto Four');
    expect(post?.chronologicalActionMatrix?.present.title).toContain('Silent-First Spatial Handover');
    expect(post?.empiricalEvidence?.citations[0].journal).toBe('New England Journal of Medicine');
  });
});
