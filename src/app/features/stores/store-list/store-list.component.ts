import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StoresService } from '../stores.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { Store } from '../../../shared/models';

@Component({
  selector: 'app-store-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent, ConfirmationDialogComponent],
  templateUrl: './store-list.component.html'
})
export class StoreListComponent implements OnInit {
  storesService = inject(StoresService);
  authService = inject(AuthService);

  searchQuery = signal('');
  deleteDialogOpen = signal(false);
  storeToDelete = signal<Store | null>(null);

  ngOnInit(): void {
    this.storesService.loadStores();
  }

  onSearch(): void {
    const query = this.searchQuery();
    if (query.trim()) {
      this.storesService.searchByName(query);
    } else {
      this.storesService.loadStores();
    }
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.storesService.loadStores();
  }

  openDeleteDialog(store: Store): void {
    this.storeToDelete.set(store);
    this.deleteDialogOpen.set(true);
  }

  confirmDelete(): void {
    const store = this.storeToDelete();
    if (store) {
      this.storesService.delete(store.id).subscribe({
        next: () => {
          this.deleteDialogOpen.set(false);
          this.storeToDelete.set(null);
        }
      });
    }
  }

  cancelDelete(): void {
    this.deleteDialogOpen.set(false);
    this.storeToDelete.set(null);
  }
}
