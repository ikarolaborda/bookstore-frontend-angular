import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="computedClass()">
      <ng-content />
    </div>
  `,
})
export class BadgeComponent {
  variant = input<BadgeVariant>('default');
  class = input<string>('');

  computedClass = computed(() => {
    const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
    
    const variantClasses: Record<BadgeVariant, string> = {
      default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
      secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
      outline: 'text-foreground',
      success: 'border-transparent bg-green-500 text-white hover:bg-green-600',
    };

    return `${baseClasses} ${variantClasses[this.variant()]} ${this.class()}`;
  });
}

