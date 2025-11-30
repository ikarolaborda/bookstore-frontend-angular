import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StoresService } from '../stores.service';
import { StoreRequest } from '../../../shared/models';

@Component({
  selector: 'app-store-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './store-form.component.html'
})
export class StoreFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  storesService = inject(StoresService);

  storeForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    address: [''],
    city: [''],
    country: ['']
  });

  isEditMode = signal(false);
  storeId = signal<number | null>(null);
  errorMessage = signal<string | null>(null);
  isSubmitting = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.storeId.set(Number(id));
      this.storesService.getById(Number(id)).subscribe({
        next: (store) => {
          this.storeForm.patchValue({
            name: store.name,
            address: store.address || '',
            city: store.city || '',
            country: store.country || ''
          });
        },
        error: () => this.router.navigate(['/stores'])
      });
    }
  }

  onSubmit(): void {
    if (this.storeForm.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);

      const formValue = this.storeForm.value;
      const request: StoreRequest = {
        name: formValue.name,
        address: formValue.address || undefined,
        city: formValue.city || undefined,
        country: formValue.country || undefined
      };

      const operation = this.isEditMode()
        ? this.storesService.update(this.storeId()!, request)
        : this.storesService.create(request);

      operation.subscribe({
        next: (store) => {
          this.isSubmitting.set(false);
          this.router.navigate(['/stores', store.id]);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to save store');
        }
      });
    }
  }
}
