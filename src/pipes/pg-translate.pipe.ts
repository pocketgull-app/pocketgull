// SPDX-License-Identifier: Apache-2.0
import { Pipe, PipeTransform, inject } from '@angular/core';
import { UiI18nService } from '../services/ui-i18n.service';
import { translateUiKey } from '../services/ui-i18n-catalog';

/**
 * Signal-reactive pipe for translating application chrome labels inline.
 * Usage: `{{ 'Chart' | pgT:'nav.chart' }}`
 */
@Pipe({
  name: 'pgT',
  standalone: true,
  pure: false
})
export class PgTranslatePipe implements PipeTransform {
  private readonly uiI18n = inject(UiI18nService, { optional: true });

  transform(englishFallback: string, key: string): string {
    if (this.uiI18n) {
      return this.uiI18n.t(key, englishFallback);
    }
    return translateUiKey('en', key, englishFallback);
  }
}
