import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsersService } from '../users.service';
import { UserRequest } from '../../../shared/models';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  usersService = inject(UsersService);

  userForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6)]],
    role: ['USER', [Validators.required]],
    enabled: [true]
  });

  isEditMode = signal(false);
  userId = signal<number | null>(null);
  errorMessage = signal<string | null>(null);
  isSubmitting = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.userId.set(Number(id));
      this.usersService.getById(Number(id)).subscribe({
        next: (user) => {
          this.userForm.patchValue({
            name: user.name,
            email: user.email,
            role: user.role,
            enabled: user.enabled
          });
          this.userForm.get('password')?.clearValidators();
          this.userForm.get('password')?.updateValueAndValidity();
        },
        error: () => this.router.navigate(['/users'])
      });
    } else {
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);

      const formValue = this.userForm.value;
      const request: UserRequest = {
        name: formValue.name,
        email: formValue.email,
        role: formValue.role,
        enabled: formValue.enabled
      };

      if (formValue.password) {
        request.password = formValue.password;
      }

      const operation = this.isEditMode()
        ? this.usersService.update(this.userId()!, request)
        : this.usersService.create(request);

      operation.subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/users']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to save user');
        }
      });
    }
  }
}
