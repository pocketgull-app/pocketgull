import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { WordPressArticlesService, FALLBACK_SEED_ARTICLES } from './wordpress-articles.service';

describe('WordPressArticlesService - WordPress REST API & Offline Articles Sync', () => {
  let service: WordPressArticlesService;

  beforeEach(() => {
    service = new WordPressArticlesService();
  });

  it('1. Provides offline fallback seed articles with SNO-10 categories and Caslon prose', () => {
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

  it('3. Gracefully handles REST API network errors by retaining fallback seed articles', async () => {
    // Attempt fetch from non-existent endpoint
    const result = await service.fetchWordPressArticles('http://localhost:99999/invalid/wp-json');
    expect(result.length).toBe(FALLBACK_SEED_ARTICLES.length);
    expect(service.isLoading()).toBe(false);
  });
});
