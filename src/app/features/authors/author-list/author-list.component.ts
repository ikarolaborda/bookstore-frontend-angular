import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthorsService } from '../authors.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { Author } from '../../../shared/models';

@Component({
  selector: 'app-author-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent, ConfirmationDialogComponent],
  templateUrl: './author-list.component.html'
})
export class AuthorListComponent implements OnInit {
  authorsService = inject(AuthorsService);
  authService = inject(AuthService);

  searchQuery = signal('');
  deleteDialogOpen = signal(false);
  authorToDelete = signal<Author | null>(null);

  ngOnInit(): void {
    this.authorsService.loadAuthors();
  }

  onSearch(): void {
    const query = this.searchQuery();
    if (query.trim()) {
      this.authorsService.searchByName(query);
    } else {
      this.authorsService.loadAuthors();
    }
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.authorsService.loadAuthors();
  }

  openDeleteDialog(author: Author): void {
    this.authorToDelete.set(author);
    this.deleteDialogOpen.set(true);
  }

  confirmDelete(): void {
    const author = this.authorToDelete();
    if (author) {
      this.authorsService.delete(author.id).subscribe({
        next: () => {
          this.deleteDialogOpen.set(false);
          this.authorToDelete.set(null);
        }
      });
    }
  }

  cancelDelete(): void {
    this.deleteDialogOpen.set(false);
    this.authorToDelete.set(null);
  }
}
