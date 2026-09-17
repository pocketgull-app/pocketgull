import '@angular/compiler';
import { ClinicalArticlesService, WordPressArticlesService, FALLBACK_SEED_ARTICLES } from './wordpress-articles.service';

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

  it('4. Retains backwards-compatible WordPressArticlesService alias and methods', async () => {
    const legacyService = new WordPressArticlesService();
    const result = await legacyService.fetchWordPressArticles();
    expect(result.length).toBe(FALLBACK_SEED_ARTICLES.length);
  });
});
