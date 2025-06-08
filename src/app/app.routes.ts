import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing';
import { WishesPage } from './pages/wishes/wishes';
import { RsvpComponent } from './pages/rsvp/rsvp';
import { PhotosComponent } from './pages/photos/photos';

export const routes: Routes = [
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
  { path: 'landing', component: LandingComponent },
  { path: 'wishes', component: WishesPage },
  { path: 'rsvp', component: RsvpComponent },
  { path: 'photos', component: PhotosComponent },
  { path: '**', redirectTo: '/landing' }
];