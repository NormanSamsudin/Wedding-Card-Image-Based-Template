import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing';
import { WishesPage } from './pages/wishes/wishes';
// import { RsvpComponent } from './pages/rsvp/rsvp';
// import { PhotosComponent } from './pages/photos/photos';

import { SplashComponent } from './pages/splash/splash';
import { PhotosUploadComponent } from './pages/photos-upload/photos-upload';

export const routes: Routes = [
  { path: '', component: SplashComponent },
  { path: 'landing', component: LandingComponent },
  { path: 'wishes', component: WishesPage },
  { path: 'photos-upload', component: PhotosUploadComponent },
  { path: '**', redirectTo: '/landing' }
];