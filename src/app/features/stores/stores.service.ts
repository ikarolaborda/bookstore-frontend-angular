import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Store, StoreRequest } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class StoresService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/stores`;

  private storesSignal = signal<Store[]>([]);
  private selectedStoreSignal = signal<Store | null>(null);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly stores = this.storesSignal.asReadonly();
  readonly selectedStore = this.selectedStoreSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly storesCount = computed(() => this.storesSignal().length);

  loadStores(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.http.get<Store[]>(this.apiUrl).pipe(
      tap(stores => this.storesSignal.set(stores)),
      finalize(() => this.loadingSignal.set(false))
    ).subscribe({
      error: (err) => this.errorSignal.set(err.error?.message || 'Failed to load stores')
    });
  }

  getById(id: number): Observable<Store> {
    this.loadingSignal.set(true);
    return this.http.get<Store>(`${this.apiUrl}/${id}`).pipe(
      tap(store => this.selectedStoreSignal.set(store)),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  searchByName(name: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const params = new HttpParams().set('name', name);
    this.http.get<Store[]>(`${this.apiUrl}/search`, { params }).pipe(
      tap(stores => this.storesSignal.set(stores)),
      finalize(() => this.loadingSignal.set(false))
    ).subscribe({
      error: (err) => this.errorSignal.set(err.error?.message || 'Search failed')
    });
  }

  create(request: StoreRequest): Observable<Store> {
    this.loadingSignal.set(true);
    return this.http.post<Store>(this.apiUrl, request).pipe(
      tap(store => {
        this.storesSignal.update(stores => [...stores, store]);
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  update(id: number, request: StoreRequest): Observable<Store> {
    this.loadingSignal.set(true);
    return this.http.put<Store>(`${this.apiUrl}/${id}`, request).pipe(
      tap(updatedStore => {
        this.storesSignal.update(stores =>
          stores.map(store => store.id === id ? updatedStore : store)
        );
        this.selectedStoreSignal.set(updatedStore);
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  delete(id: number): Observable<void> {
    this.loadingSignal.set(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.storesSignal.update(stores => stores.filter(store => store.id !== id));
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  clearSelectedStore(): void {
    this.selectedStoreSignal.set(null);
  }
}
