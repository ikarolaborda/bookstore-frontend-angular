import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertVariant = 'default' | 'destructive' | 'success' | 'warning';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="computedClass()" role="alert">
      <ng-content />
    </div>
  `,
})
export class AlertComponent {
  variant = input<AlertVariant>('default');
  class = input<string>('');

  computedClass = computed(() => {
    const baseClasses = 'relative w-full rounded-lg border p-4';
    
    const variantClasses: Record<AlertVariant, string> = {
      default: 'bg-background text-foreground',
      destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
      success: 'border-green-500/50 text-green-700 bg-green-50 dark:border-green-500 [&>svg]:text-green-600',
      warning: 'border-yellow-500/50 text-yellow-700 bg-yellow-50 dark:border-yellow-500 [&>svg]:text-yellow-600',
    };

    return `${baseClasses} ${variantClasses[this.variant()]} ${this.class()}`;
  });
}

@Component({
  selector: 'app-alert-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h5 class="mb-1 font-medium leading-none tracking-tight">
      <ng-content />
    </h5>
  `,
})
export class AlertTitleComponent {}

@Component({
  selector: 'app-alert-description',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-sm [&_p]:leading-relaxed">
      <ng-content />
    </div>
  `,
})
export class AlertDescriptionComponent {}

