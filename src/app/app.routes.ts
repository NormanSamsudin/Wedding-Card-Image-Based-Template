import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing';

import { PhotosUploadComponent } from './pages/photos-upload/photos-upload';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'landing', component: LandingComponent },
  { path: 'gallery', component: PhotosUploadComponent },
  { path: '**', redirectTo: '' }
];