import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-label',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label [class]="'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ' + class()">
      <ng-content />
    </label>
  `,
})
export class LabelComponent {
  class = input<string>('');
}

