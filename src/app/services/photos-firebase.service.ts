import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, listAll } from '@angular/fire/storage';
import { Observable, from } from 'rxjs';

export interface Photo {
    url: string;
    name: string;
    timestamp: Date;
}

@Injectable({
    providedIn: 'root'
})
export class PhotosFirebaseService {
    constructor(private storage: Storage) { }

    async uploadPhoto(file: File): Promise<string> {
        const timestamp = new Date().getTime();
        const filePath = `photos/${timestamp}_${file.name}`;
        const storageRef = ref(this.storage, filePath);

        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading photo:', error);
            throw error;
        }
    }

    async getPhotos(): Promise<Photo[]> {
        try {
            const photosRef = ref(this.storage, 'photos');
            const result = await listAll(photosRef);

            const photos: Photo[] = [];

            for (const itemRef of result.items) {
                const url = await getDownloadURL(itemRef);
                const name = itemRef.name;
                const timestamp = new Date(parseInt(name.split('_')[0]));

                photos.push({
                    url,
                    name,
                    timestamp
                });
            }

            return photos.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        } catch (error) {
            console.error('Error getting photos:', error);
            throw error;
        }
    }
} 