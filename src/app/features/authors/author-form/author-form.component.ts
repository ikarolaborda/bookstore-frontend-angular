import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthorsService } from '../authors.service';
import { AuthorRequest } from '../../../shared/models';

@Component({
  selector: 'app-author-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './author-form.component.html'
})
export class AuthorFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  authorsService = inject(AuthorsService);

  authorForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    biography: [''],
    birthDate: ['']
  });

  isEditMode = signal(false);
  authorId = signal<number | null>(null);
  errorMessage = signal<string | null>(null);
  isSubmitting = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.authorId.set(Number(id));
      this.authorsService.getById(Number(id)).subscribe({
        next: (author) => {
          this.authorForm.patchValue({
            name: author.name,
            biography: author.biography || '',
            birthDate: author.birthDate || ''
          });
        },
        error: () => this.router.navigate(['/authors'])
      });
    }
  }

  onSubmit(): void {
    if (this.authorForm.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);

      const formValue = this.authorForm.value;
      const request: AuthorRequest = {
        name: formValue.name,
        biography: formValue.biography || undefined,
        birthDate: formValue.birthDate || undefined
      };

      const operation = this.isEditMode()
        ? this.authorsService.update(this.authorId()!, request)
        : this.authorsService.create(request);

      operation.subscribe({
        next: (author) => {
          this.isSubmitting.set(false);
          this.router.navigate(['/authors', author.id]);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to save author');
        }
      });
    }
  }
}
