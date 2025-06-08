import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhotosFirebaseService, Photo } from '../../services/photos-firebase.service';
import { BottomNavigation } from '../../components/bottom-navigation/bottom-navigation';
import { Router } from '@angular/router';
import { MusicService } from '../../services/music.service';

@Component({
    selector: 'app-photos',
    standalone: true,
    imports: [CommonModule, FormsModule, BottomNavigation],
    template: `
    <div class="photos-page">
      <div class="photos-container">
        <h1>Wedding Photos</h1>
        
        <button class="upload-btn" (click)="showUploadForm = true" *ngIf="!showUploadForm">
          Upload Photo
        </button>

        <div class="upload-form" *ngIf="showUploadForm">
          <h3>Upload Photo</h3>
          <input type="file" accept="image/*" (change)="onFileSelected($event)" #fileInput>
          <div class="button-group">
            <button (click)="uploadPhoto()" [disabled]="!selectedFile || isUploading">
              {{ isUploading ? 'Uploading...' : 'Upload' }}
            </button>
            <button (click)="cancelUpload()">Cancel</button>
          </div>
        </div>

        <div class="photos-grid" *ngIf="!isLoading">
          <div class="photo-item" *ngFor="let photo of photos">
            <img [src]="photo.url" [alt]="photo.name">
            <div class="photo-info">
              <span>{{ photo.timestamp | date:'medium' }}</span>
            </div>
          </div>
        </div>

        <div class="loading" *ngIf="isLoading">
          Loading photos...
        </div>
      </div>

      <app-bottom-navigation (navigationClick)="onNavigationClick($event)" (musicToggle)="toggleMusic()">
      </app-bottom-navigation>
    </div>
  `,
    styles: [`
    :host {
      display: block;
      width: 100%;
      overflow-x: hidden;
      position: relative;
    }

    .photos-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .photos-container {
      flex: 1;
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      margin-top: 20px;
      margin-bottom: 20px;
    }

    h1 {
      text-align: center;
      margin-bottom: 30px;
      color: #b76e79;
    }

    .upload-btn {
      display: block;
      margin: 20px auto;
      padding: 10px 20px;
      background-color: #b76e79;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s ease;
    }

    .upload-btn:hover {
      background-color: #a55d67;
    }

    .upload-form {
      background-color: rgba(255, 255, 255, 0.95);
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .button-group {
      margin-top: 15px;
    }

    .button-group button {
      margin: 0 10px;
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .button-group button:first-child {
      background-color: #b76e79;
      color: white;
    }

    .button-group button:first-child:hover {
      background-color: #a55d67;
    }

    .button-group button:last-child {
      background-color: #f44336;
      color: white;
    }

    .button-group button:last-child:hover {
      background-color: #d32f2f;
    }

    .photos-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 20px;
      padding: 0 10px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .photo-item {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
      aspect-ratio: 1;
      max-width: 150px;
      margin: 0 auto;
    }

    .photo-item:hover {
      transform: scale(1.02);
    }

    .photo-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .photo-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 4px;
      font-size: 10px;
    }

    .loading {
      text-align: center;
      padding: 20px;
      font-size: 18px;
      color: #666;
    }

    @media (max-width: 480px) {
      .photos-grid {
        gap: 8px;
        padding: 0 5px;
      }

      .photo-item {
        max-width: 100px;
      }

      .photo-info {
        font-size: 8px;
        padding: 2px;
      }
    }
  `]
})
export class PhotosComponent implements OnInit, OnDestroy {
    photos: Photo[] = [];
    isLoading = true;
    showUploadForm = false;
    selectedFile: File | null = null;
    isUploading = false;
    backgroundImage = 'bg.png';

    constructor(
        private photosService: PhotosFirebaseService,
        private router: Router,
        private musicService: MusicService
    ) { }

    ngOnInit() {
        // Set background dynamically
        document.body.style.backgroundImage = `url(${this.backgroundImage})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
        this.loadPhotos();
    }

    ngOnDestroy() {
        // Clean up background when leaving the page
        document.body.style.backgroundImage = '';
        document.body.style.backgroundSize = '';
        document.body.style.backgroundPosition = '';
        document.body.style.backgroundAttachment = '';
    }

    async loadPhotos() {
        try {
            this.isLoading = true;
            this.photos = await this.photosService.getPhotos();
        } catch (error) {
            console.error('Error loading photos:', error);
        } finally {
            this.isLoading = false;
        }
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
        }
    }

    async uploadPhoto() {
        if (!this.selectedFile) return;

        try {
            this.isUploading = true;
            await this.photosService.uploadPhoto(this.selectedFile);
            this.showUploadForm = false;
            this.selectedFile = null;
            await this.loadPhotos();
        } catch (error) {
            console.error('Error uploading photo:', error);
        } finally {
            this.isUploading = false;
        }
    }

    cancelUpload() {
        this.showUploadForm = false;
        this.selectedFile = null;
    }

    onNavigationClick(item: any) {
        switch (item.id) {
            case 'home':
                this.router.navigate(['/landing']);
                break;
            case 'wishes':
                this.router.navigate(['/wishes']);
                break;
            case 'photos':
                // Already on photos page
                break;
            case 'rsvp':
                this.router.navigate(['/rsvp']);
                break;
        }
    }

    toggleMusic() {
        this.musicService.toggle();
    }
} 