import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthorsService } from '../authors.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-author-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, LoadingSpinnerComponent, ConfirmationDialogComponent],
  templateUrl: './author-detail.component.html'
})
export class AuthorDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  authorsService = inject(AuthorsService);
  authService = inject(AuthService);

  deleteDialogOpen = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.authorsService.getById(id).subscribe({
        error: () => this.router.navigate(['/authors'])
      });
    }
  }

  openDeleteDialog(): void {
    this.deleteDialogOpen.set(true);
  }

  confirmDelete(): void {
    const author = this.authorsService.selectedAuthor();
    if (author) {
      this.authorsService.delete(author.id).subscribe({
        next: () => this.router.navigate(['/authors'])
      });
    }
  }

  cancelDelete(): void {
    this.deleteDialogOpen.set(false);
  }
}
