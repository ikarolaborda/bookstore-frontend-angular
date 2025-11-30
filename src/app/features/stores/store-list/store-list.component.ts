import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StoresService } from '../stores.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { Store } from '../../../shared/models';

@Component({
  selector: 'app-store-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoadingSpinnerComponent,
    ConfirmationDialogComponent,
    PaginationComponent,
    SearchInputComponent
  ],
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

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    if (query.trim()) {
      this.storesService.searchByName(query, 0, this.storesService.pageSize());
    } else {
      this.storesService.loadStores(0, this.storesService.pageSize());
    }
  }

  onSearchClear(): void {
    this.searchQuery.set('');
    this.storesService.loadStores(0, this.storesService.pageSize());
  }

  onPageChange(page: number): void {
    const query = this.searchQuery();
    if (query.trim()) {
      this.storesService.searchByName(query, page, this.storesService.pageSize());
    } else {
      this.storesService.loadStores(page, this.storesService.pageSize());
    }
  }

  onPageSizeChange(size: number): void {
    const query = this.searchQuery();
    if (query.trim()) {
      this.storesService.searchByName(query, 0, size);
    } else {
      this.storesService.loadStores(0, size);
    }
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
          this.storesService.refreshCurrentPage();
        }
      });
    }
  }

  cancelDelete(): void {
    this.deleteDialogOpen.set(false);
    this.storeToDelete.set(null);
  }
}
