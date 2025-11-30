import { Component, input, output, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        @if (isLoading()) {
          <svg class="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        } @else {
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
      </div>
      <input
        type="text"
        [ngModel]="searchValue()"
        (ngModelChange)="onInput($event)"
        [placeholder]="placeholder()"
        class="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
      @if (searchValue()) {
        <button
          (click)="clear()"
          class="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <svg class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      }
    </div>
  `
})
export class SearchInputComponent implements OnDestroy {
  placeholder = input<string>('Search...');
  debounceMs = input<number>(300);
  isLoading = input<boolean>(false);
  initialValue = input<string>('');

  searchChange = output<string>();
  searchClear = output<void>();

  searchValue = signal('');
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor() {
    effect(() => {
      if (this.initialValue()) {
        this.searchValue.set(this.initialValue());
      }
    });

    this.searchSubject.pipe(
      debounceTime(this.debounceMs()),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.searchChange.emit(value);
    });
  }

  onInput(value: string): void {
    this.searchValue.set(value);
    this.searchSubject.next(value);
  }

  clear(): void {
    this.searchValue.set('');
    this.searchChange.emit('');
    this.searchClear.emit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
