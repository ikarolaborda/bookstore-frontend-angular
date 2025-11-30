import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserRequest } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  private usersSignal = signal<User[]>([]);
  private selectedUserSignal = signal<User | null>(null);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly users = this.usersSignal.asReadonly();
  readonly selectedUser = this.selectedUserSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly usersCount = computed(() => this.usersSignal().length);

  loadUsers(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.http.get<User[]>(this.apiUrl).pipe(
      tap(users => this.usersSignal.set(users)),
      finalize(() => this.loadingSignal.set(false))
    ).subscribe({
      error: (err) => this.errorSignal.set(err.error?.message || 'Failed to load users')
    });
  }

  getById(id: number): Observable<User> {
    this.loadingSignal.set(true);
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      tap(user => this.selectedUserSignal.set(user)),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  create(request: UserRequest): Observable<User> {
    this.loadingSignal.set(true);
    return this.http.post<User>(this.apiUrl, request).pipe(
      tap(user => {
        this.usersSignal.update(users => [...users, user]);
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  update(id: number, request: UserRequest): Observable<User> {
    this.loadingSignal.set(true);
    return this.http.put<User>(`${this.apiUrl}/${id}`, request).pipe(
      tap(updatedUser => {
        this.usersSignal.update(users =>
          users.map(user => user.id === id ? updatedUser : user)
        );
        this.selectedUserSignal.set(updatedUser);
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  delete(id: number): Observable<void> {
    this.loadingSignal.set(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.usersSignal.update(users => users.filter(user => user.id !== id));
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  clearSelectedUser(): void {
    this.selectedUserSignal.set(null);
  }
}
