import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvsTherapyComponent } from './components/avs-therapy.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AvsTherapyComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'avs-therapy';
}
