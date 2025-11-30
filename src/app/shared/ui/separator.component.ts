import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-separator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="computedClass()"></div>
  `,
})
export class SeparatorComponent {
  orientation = input<'horizontal' | 'vertical'>('horizontal');
  decorative = input<boolean>(true);
  class = input<string>('');

  computedClass = computed(() => {
    const baseClasses = 'shrink-0 bg-border';
    const orientationClasses =
      this.orientation() === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]';
    
    return `${baseClasses} ${orientationClasses} ${this.class()}`;
  });
}

