import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing').then(m => m.Landing)
  },
  {
    path: 'landing',
    loadComponent: () => import('./pages/landing/landing').then(m => m.Landing)
  },
  // Remove individual routes since we'll handle them as modals
  {
    path: '**',
    redirectTo: ''
  }
];