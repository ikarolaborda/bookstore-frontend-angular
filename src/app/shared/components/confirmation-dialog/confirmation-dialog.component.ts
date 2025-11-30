import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DialogComponent,
  DialogContentComponent,
  DialogDescriptionComponent,
  DialogFooterComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  ButtonComponent,
} from '../../ui';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogComponent,
    DialogContentComponent,
    DialogDescriptionComponent,
    DialogFooterComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    ButtonComponent,
  ],
  template: `
    <app-dialog [open]="isOpen" (openChange)="onOpenChange($event)">
      <app-dialog-content>
        <div class="flex items-center justify-center w-12 h-12 mx-auto bg-destructive/10 rounded-full mb-4">
          <svg class="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <app-dialog-header>
          <app-dialog-title class="text-center">{{ title }}</app-dialog-title>
          <app-dialog-description class="text-center">
            {{ message }}
          </app-dialog-description>
        </app-dialog-header>
        
        <app-dialog-footer class="sm:justify-center gap-2 mt-6">
          <app-button variant="outline" (click)="onCancel()">
            {{ cancelText }}
          </app-button>
          <app-button variant="destructive" (click)="onConfirm()">
            {{ confirmText }}
          </app-button>
        </app-dialog-footer>
      </app-dialog-content>
    </app-dialog>
  `
})
export class ConfirmationDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onOpenChange(open: boolean): void {
    if (!open) {
      this.onCancel();
    }
  }
}
