import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/books', pathMatch: 'full' },

  // Auth routes (guest only)
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // Books routes
  {
    path: 'books',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/books/book-list/book-list.component').then(m => m.BookListComponent)
      },
      {
        path: 'new',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/books/book-form/book-form.component').then(m => m.BookFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/books/book-detail/book-detail.component').then(m => m.BookDetailComponent)
      },
      {
        path: ':id/edit',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/books/book-form/book-form.component').then(m => m.BookFormComponent)
      }
    ]
  },

  // Authors routes
  {
    path: 'authors',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/authors/author-list/author-list.component').then(m => m.AuthorListComponent)
      },
      {
        path: 'new',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/authors/author-form/author-form.component').then(m => m.AuthorFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/authors/author-detail/author-detail.component').then(m => m.AuthorDetailComponent)
      },
      {
        path: ':id/edit',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/authors/author-form/author-form.component').then(m => m.AuthorFormComponent)
      }
    ]
  },

  // Stores routes
  {
    path: 'stores',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/stores/store-list/store-list.component').then(m => m.StoreListComponent)
      },
      {
        path: 'new',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/stores/store-form/store-form.component').then(m => m.StoreFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/stores/store-detail/store-detail.component').then(m => m.StoreDetailComponent)
      },
      {
        path: ':id/edit',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/stores/store-form/store-form.component').then(m => m.StoreFormComponent)
      }
    ]
  },

  // Users routes (admin only)
  {
    path: 'users',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent)
      }
    ]
  },

  // Reports routes
  {
    path: 'reports',
    canActivate: [authGuard],
    loadComponent: () => import('./features/reports/report-generator/report-generator.component').then(m => m.ReportGeneratorComponent)
  },

  // Fallback
  { path: '**', redirectTo: '/books' }
];
