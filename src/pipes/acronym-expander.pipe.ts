import { Pipe, PipeTransform, inject } from '@angular/core';
import { AcronymExpanderService } from '../services/acronym-expander.service';

@Pipe({
  name: 'acronymExpander',
  standalone: true,
  pure: false // impure to react immediately to KSS signal state changes
})
export class AcronymExpanderPipe implements PipeTransform {
  private acronymService = inject(AcronymExpanderService);

  transform(value: string | null | undefined, forceExpand: boolean = false): string {
    if (!value) return '';
    return this.acronymService.expandText(value, forceExpand);
  }
}
