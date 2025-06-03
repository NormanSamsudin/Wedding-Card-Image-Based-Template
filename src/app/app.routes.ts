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
  {
    path: 'rsvp',
    loadComponent: () => import('./pages/rsvp/rsvp').then(m => m.RSVP)
  },
  {
    path: '**',
    redirectTo: ''
  }
];