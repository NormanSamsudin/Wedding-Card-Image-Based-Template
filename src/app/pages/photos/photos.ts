import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
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
          <input type="file" accept="image/*" (change)="onFileSelected($event)" #fileInput multiple>
          <div class="preview-grid" *ngIf="previewUrls.length">
            <div class="preview-item" *ngFor="let url of previewUrls">
              <img [src]="url" alt="Preview" />
            </div>
          </div>
          <div class="button-group">
            <button (click)="uploadPhoto()" [disabled]="!selectedFiles.length || isUploading">
              {{ isUploading ? 'Uploading...' : 'Upload' }}
            </button>
            <button (click)="cancelUpload()">Cancel</button>
          </div>
        </div>

        <div class="photos-grid" *ngIf="!isLoading">
          <div class="photo-item" *ngFor="let photo of photos; let i = index" #photoItem>
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

    .preview-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 12px 0;
      justify-content: center;
    }

    .preview-item {
      width: 70px;
      height: 70px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .preview-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
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
      max-width: 320px;
      margin-left: auto;
      margin-right: auto;
    }

    .photo-item {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
      aspect-ratio: 1 / 1;
      width: 100px;
      height: 100px;
      max-width: 100px;
      max-height: 100px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
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
      .photo-item {
        width: 90px;
        height: 90px;
        max-width: 90px;
        max-height: 90px;
      }
      .photos-grid {
        max-width: 290px;
        gap: 8px;
        padding: 0 5px;
      }

      .photo-info {
        font-size: 8px;
        padding: 2px;
      }
    }
  `]
})
export class PhotosComponent implements OnInit, OnDestroy, AfterViewInit {
  photos: Photo[] = [];
  isLoading = true;
  showUploadForm = false;
  selectedFiles: File[] = [];
  isUploading = false;
  backgroundImage = 'bg.png';
  previewUrls: string[] = [];

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

  ngAfterViewInit() {
    setTimeout(() => this.observeImages(), 0);
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
      this.selectedFiles = Array.from(input.files);
      this.previewUrls = [];
      for (const file of this.selectedFiles) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      this.selectedFiles = [];
      this.previewUrls = [];
    }
  }

  async uploadPhoto() {
    if (!this.selectedFiles.length) return;

    try {
      this.isUploading = true;
      for (const file of this.selectedFiles) {
        await this.photosService.uploadPhoto(file);
      }
      this.showUploadForm = false;
      this.selectedFiles = [];
      await this.loadPhotos();
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      this.isUploading = false;
    }
  }

  cancelUpload() {
    this.showUploadForm = false;
    this.selectedFiles = [];
    this.previewUrls = [];
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

  observeImages() {
    const items = document.querySelectorAll('.photo-item');
    items.forEach((el, i) => {
      (el as HTMLElement).setAttribute('data-index', i.toString());
    });
  }
}