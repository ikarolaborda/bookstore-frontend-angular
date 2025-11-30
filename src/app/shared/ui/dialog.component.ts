import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('overlay', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void <=> *', animate('200ms ease-in-out')),
    ]),
    trigger('content', [
      state('void', style({ opacity: 0, transform: 'scale(0.95)' })),
      state('*', style({ opacity: 1, transform: 'scale(1)' })),
      transition('void <=> *', animate('200ms ease-in-out')),
    ]),
  ],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div
          [@overlay]
          class="fixed inset-0 bg-black/50 backdrop-blur-sm"
          (click)="onOverlayClick()"
        ></div>
        <div
          [@content]
          class="relative z-50 w-full max-w-lg mx-4"
        >
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class DialogComponent {
  open = input<boolean>(false);
  closeOnOverlayClick = input<boolean>(true);
  openChange = output<boolean>();

  onOverlayClick(): void {
    if (this.closeOnOverlayClick()) {
      this.openChange.emit(false);
    }
  }
}

@Component({
  selector: 'app-dialog-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-base p-6 shadow-lg">
      <ng-content />
    </div>
  `,
})
export class DialogContentComponent {}

@Component({
  selector: 'app-dialog-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
      <ng-content />
    </div>
  `,
})
export class DialogHeaderComponent {}

@Component({
  selector: 'app-dialog-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 class="text-lg font-semibold leading-none tracking-tight">
      <ng-content />
    </h2>
  `,
})
export class DialogTitleComponent {}

@Component({
  selector: 'app-dialog-description',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p class="text-sm text-muted-foreground">
      <ng-content />
    </p>
  `,
})
export class DialogDescriptionComponent {}

@Component({
  selector: 'app-dialog-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
      <ng-content />
    </div>
  `,
})
export class DialogFooterComponent {}

