import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/splash/splash').then(m => m.SplashComponent)
  },
  {
    path: 'landing',
    loadComponent: () => import('./pages/landing/landing').then(m => m.LandingComponent)
  },
  {
    path: 'rsvp',
    loadComponent: () => import('./pages/rsvp/rsvp').then(m => m.RsvpComponent)
  },
  // Remove individual routes since we'll handle them as modals
  {
    path: '**',
    redirectTo: ''
  }
];