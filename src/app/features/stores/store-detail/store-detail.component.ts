import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StoresService } from '../stores.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-store-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, ConfirmationDialogComponent],
  templateUrl: './store-detail.component.html'
})
export class StoreDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  storesService = inject(StoresService);
  authService = inject(AuthService);

  deleteDialogOpen = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.storesService.getById(id).subscribe({
        error: () => this.router.navigate(['/stores'])
      });
    }
  }

  openDeleteDialog(): void {
    this.deleteDialogOpen.set(true);
  }

  confirmDelete(): void {
    const store = this.storesService.selectedStore();
    if (store) {
      this.storesService.delete(store.id).subscribe({
        next: () => this.router.navigate(['/stores'])
      });
    }
  }

  cancelDelete(): void {
    this.deleteDialogOpen.set(false);
  }
}
