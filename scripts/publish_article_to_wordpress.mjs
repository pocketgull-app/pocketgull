/**
 * scripts/publish_article_to_wordpress.mjs
 * Programmatic Node.js publishing script for WordPress REST API using Application Passwords.
 *
 * Usage:
 *   WP_API_URL="https://wordpress.pocketgull.com" \
 *   WP_USERNAME="phil" \
 *   WP_APP_PASSWORD="abcd 1234 efgh 5678 ijkl 9012" \
 *   node scripts/publish_article_to_wordpress.mjs
 */

import { SAMPLE_ARTICLES } from './seed_sample_articles.mjs';

/**
 * Publishes a single article to WordPress via REST API.
 * @param {Object} article 
 * @param {Object} config 
 */
export async function publishArticleToWordPress(article, config = {}) {
  const apiUrl = (config.apiUrl || process.env.WP_API_URL || 'https://wordpress.pocketgull.com').replace(/\/$/, '');
  const username = config.username || process.env.WP_USERNAME || 'phil';
  const appPassword = config.appPassword || process.env.WP_APP_PASSWORD;

  if (!appPassword) {
    console.warn(`⚠️ [WP-Publish] No WP_APP_PASSWORD provided. Set the environment variable to publish remotely.`);
    console.log(`[DRY-RUN] Prepared article: "${article.title}" for author "${article.author || 'Phil'}"`);
    return { success: false, mode: 'dry-run', articleTitle: article.title };
  }

  // Strip spaces from application password for HTTP Basic Auth header
  const sanitizedPassword = appPassword.replace(/\s+/g, '');
  const credentials = Buffer.from(`${username}:${sanitizedPassword}`).toString('base64');

  const endpoint = `${apiUrl}/wp-json/wp/v2/posts`;

  console.log(`🚀 [WP-Publish] Publishing "${article.title}" to ${endpoint}...`);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({
        title: article.title,
        content: article.bodyHtml,
        excerpt: article.takeaway || '',
        slug: article.slug,
        status: article.status || 'publish'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WordPress API returned HTTP ${response.status}: ${errorText}`);
    }

    const postData = await response.json();
    console.log(`✅ [WP-Publish] Published successfully! Post ID: ${postData.id}`);
    console.log(`🔗 Live URL: ${postData.link}`);
    return { success: true, post: postData };
  } catch (err) {
    console.error(`❌ [WP-Publish] Failed to publish article:`, err.message);
    throw err;
  }
}

// Direct CLI Execution
if (process.argv[1]?.includes('publish_article_to_wordpress')) {
  console.log(`📦 [WP-Publish] Starting publishing run with ${SAMPLE_ARTICLES.length} queued articles...`);
  
  for (const article of SAMPLE_ARTICLES) {
    await publishArticleToWordPress(article);
  }
}
