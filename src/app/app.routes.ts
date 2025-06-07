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
    path: 'wishes',
    loadComponent: () => import('./pages/wishes/wishes').then(m => m.WishesPage)
  },
  {
    path: 'calendar',
    loadComponent: () => import('./pages/calendar/calendar').then(m => m.CalendarComponent)
  },
  {
    path: 'rsvp',
    loadComponent: () => import('./pages/rsvp/rsvp').then(m => m.RsvpComponent)
  },
  {
    path: '**',
    redirectTo: 'landing'
  }
];