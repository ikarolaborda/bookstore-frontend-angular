import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <ng-template #content>
      <ng-content></ng-content>
    </ng-template>
    @if (href()) {
      <a
        [routerLink]="href()"
        [class]="computedClass()"
        [attr.title]="title()"
      >
        <ng-container *ngTemplateOutlet="content"></ng-container>
      </a>
    } @else {
      <button
        [class]="computedClass()"
        [attr.type]="type()"
        [attr.title]="title()"
        [disabled]="disabled()"
      >
        <ng-container *ngTemplateOutlet="content"></ng-container>
      </button>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class ButtonComponent {
  variant = input<ButtonVariant>('default');
  size = input<ButtonSize>('default');
  disabled = input<boolean>(false);
  type = input<'button' | 'submit' | 'reset'>('button');
  href = input<string | any[]>();
  class = input<string>('');
  title = input<string>('');

  computedClass = computed(() => {
    const baseClasses = 'btn-base';

    const variantClasses: Record<ButtonVariant, string> = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
    };

    const sizeClasses: Record<ButtonSize, string> = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3 text-xs',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    };

    return `${baseClasses} ${variantClasses[this.variant()]} ${sizeClasses[this.size()]} ${this.class()}`;
  });
}
