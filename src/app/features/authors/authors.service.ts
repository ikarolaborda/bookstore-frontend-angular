import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Author, AuthorRequest } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class AuthorsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/authors`;

  private authorsSignal = signal<Author[]>([]);
  private selectedAuthorSignal = signal<Author | null>(null);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly authors = this.authorsSignal.asReadonly();
  readonly selectedAuthor = this.selectedAuthorSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly authorsCount = computed(() => this.authorsSignal().length);

  loadAuthors(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.http.get<Author[]>(this.apiUrl).pipe(
      tap(authors => this.authorsSignal.set(authors)),
      finalize(() => this.loadingSignal.set(false))
    ).subscribe({
      error: (err) => this.errorSignal.set(err.error?.message || 'Failed to load authors')
    });
  }

  getById(id: number): Observable<Author> {
    this.loadingSignal.set(true);
    return this.http.get<Author>(`${this.apiUrl}/${id}`).pipe(
      tap(author => this.selectedAuthorSignal.set(author)),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  searchByName(name: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const params = new HttpParams().set('name', name);
    this.http.get<Author[]>(`${this.apiUrl}/search`, { params }).pipe(
      tap(authors => this.authorsSignal.set(authors)),
      finalize(() => this.loadingSignal.set(false))
    ).subscribe({
      error: (err) => this.errorSignal.set(err.error?.message || 'Search failed')
    });
  }

  create(request: AuthorRequest): Observable<Author> {
    this.loadingSignal.set(true);
    return this.http.post<Author>(this.apiUrl, request).pipe(
      tap(author => {
        this.authorsSignal.update(authors => [...authors, author]);
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  update(id: number, request: AuthorRequest): Observable<Author> {
    this.loadingSignal.set(true);
    return this.http.put<Author>(`${this.apiUrl}/${id}`, request).pipe(
      tap(updatedAuthor => {
        this.authorsSignal.update(authors =>
          authors.map(author => author.id === id ? updatedAuthor : author)
        );
        this.selectedAuthorSignal.set(updatedAuthor);
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  delete(id: number): Observable<void> {
    this.loadingSignal.set(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.authorsSignal.update(authors => authors.filter(author => author.id !== id));
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  clearSelectedAuthor(): void {
    this.selectedAuthorSignal.set(null);
  }
}
