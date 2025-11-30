import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsersService } from '../users.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { User } from '../../../shared/models';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, ConfirmationDialogComponent],
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  usersService = inject(UsersService);

  deleteDialogOpen = signal(false);
  userToDelete = signal<User | null>(null);

  ngOnInit(): void {
    this.usersService.loadUsers();
  }

  openDeleteDialog(user: User): void {
    this.userToDelete.set(user);
    this.deleteDialogOpen.set(true);
  }

  confirmDelete(): void {
    const user = this.userToDelete();
    if (user) {
      this.usersService.delete(user.id).subscribe({
        next: () => {
          this.deleteDialogOpen.set(false);
          this.userToDelete.set(null);
        }
      });
    }
  }

  cancelDelete(): void {
    this.deleteDialogOpen.set(false);
    this.userToDelete.set(null);
  }
}
