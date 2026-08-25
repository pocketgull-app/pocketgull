import { Pipe, PipeTransform, inject } from '@angular/core';
import { MedicalDecoderService } from '../services/medical-decoder.service';

@Pipe({
  name: 'medicalDecoder',
  standalone: true
})
export class MedicalDecoderPipe implements PipeTransform {
  private decoder = inject(MedicalDecoderService);

  transform(html: string): string {
    if (!html) return '';
    return this.decoder.annotateText(html);
  }
}
