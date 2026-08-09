import { ClinicalIconComponent } from './clinical-icon.component';
import { ClinicalToolCardComponent } from './clinical-tool-card.component';
import { MetricCardComponent } from './metric-card.component';
import { PathwaysMoeBadgeComponent } from './pathways-moe-badge.component';
import { PocketGullBadgeComponent } from './pocket-gull-badge.component';
import { PocketGullButtonComponent } from './pocket-gull-button.component';
import { PocketGullCardComponent } from './pocket-gull-card.component';
import { PocketGullInputComponent } from './pocket-gull-input.component';
import { ThemeStudioDrawerComponent } from './theme-studio-drawer.component';
import { ZamecznikCanvasComponent } from './zamecznik-canvas.component';

export * from './clinical-icon.component';
export * from './clinical-tool-card.component';
export * from './metric-card.component';
export * from './pathways-moe-badge.component';
export * from './pocket-gull-badge.component';
export * from './pocket-gull-button.component';
export * from './pocket-gull-card.component';
export * from './pocket-gull-input.component';
export * from './theme-studio-drawer.component';
export * from './zamecznik-canvas.component';

/**
 * Shared Pocketgull UI components array.
 * Import directly into `@Component({ imports: [ ...SHARED_POCKETGULL_COMPONENTS ] })`.
 */
export const SHARED_POCKETGULL_COMPONENTS = [
  ClinicalIconComponent,
  ClinicalToolCardComponent,
  MetricCardComponent,
  PathwaysMoeBadgeComponent,
  PocketGullBadgeComponent,
  PocketGullButtonComponent,
  PocketGullCardComponent,
  PocketGullInputComponent,
  ThemeStudioDrawerComponent,
  ZamecznikCanvasComponent,
] as const;
