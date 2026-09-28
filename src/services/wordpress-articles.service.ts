/**
 * @deprecated Legacy re-export. Please import directly from './clinical-articles.service'.
 * PocketGull operates on 100% zero-egress, sovereign clinical articles and does not call WordPress.
 */
export * from './clinical-articles.service';
export { ClinicalArticlesService as WordPressArticlesService } from './clinical-articles.service';
