import { Pipe, PipeTransform, inject } from '@angular/core';
import { BionicReadingService } from '../services/bionic-reading.service';

@Pipe({
  name: 'bionic',
  standalone: true,
  pure: false
})
export class BionicReadingPipe implements PipeTransform {
  private bionicService = inject(BionicReadingService);

  transform(value: string | null | undefined, highlightClass?: string): string {
    if (!value) return '';
    if (!this.bionicService.isBionicReadingEnabled()) {
      return value;
    }
    return this.bionicService.formatToBionicHtml(value, highlightClass);
  }
}
