import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhotosFirebaseService, Photo } from '../../services/photos-firebase.service';

@Component({
  selector: 'app-photos-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="photos-container">
      <h2>Upload Photo</h2>
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
  `,
  styles: [`
    .photos-container { max-width: 600px; margin: 0 auto; padding: 20px; background: #fff; border-radius: 10px; }
    .upload-btn { margin: 20px auto; display: block; }
    .upload-form { margin: 20px 0; }
    .button-group { margin-top: 10px; }
    .photos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 20px; }
    .photo-item { border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1); aspect-ratio: 1; max-width: 150px; margin: 0 auto; }
    .photo-item img { width: 100%; height: 100%; object-fit: cover; }
    .photo-info { background: rgba(0,0,0,0.7); color: white; font-size: 10px; padding: 4px; text-align: center; }
    .loading { text-align: center; padding: 20px; font-size: 18px; color: #666; }
  `]
})
export class PhotosUploadComponent implements OnInit, OnDestroy {
  photos: Photo[] = [];
  isLoading = true;
  showUploadForm = false;
  selectedFile: File | null = null;
  isUploading = false;

  constructor(private photosService: PhotosFirebaseService) {}

  ngOnInit() {
    this.loadPhotos();
  }

  ngOnDestroy() {}

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
}
