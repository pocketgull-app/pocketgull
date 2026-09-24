import { Pipe, PipeTransform, inject } from '@angular/core';
import { BionicReadingService } from '../services/bionic-reading.service';

/**
 * Pure Angular pipe for high-performance Morpheme-Aware Bionic Reading formatting.
 * Being pure, Angular memoizes this transform and executes only when the input string or
 * highlight class changes, completely eliminating template function re-computation jank.
 */
@Pipe({
  name: 'bionicFormat',
  standalone: true,
  pure: true
})
export class BionicFormatPipe implements PipeTransform {
  private readonly bionicReading = inject(BionicReadingService);

  transform(value: string | undefined | null, highlightClass?: string): string {
    if (!value) return '';
    if (!this.bionicReading.isBionicReadingEnabled()) return value;
    return this.bionicReading.formatToBionicHtml(value, highlightClass);
  }
}
