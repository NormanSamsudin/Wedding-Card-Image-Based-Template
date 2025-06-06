// src/app/services/rsvp-firebase.service.ts
import { Injectable } from '@angular/core';
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

export interface RSVPData {
  name: string;
  email: string;
  numberOfGuests: number;
  attendanceStatus: 'Hadir' | 'Tidak Hadir';
  message: string;
  timestamp: Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class RSVPFirebaseService {
  private readonly COLLECTION_NAME = 'rsvps';
  isLoading = false;
  message: { text: string; type: 'success' | 'error' } | null = null;

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private messageSubject = new BehaviorSubject<{ type: 'success' | 'error', text: string } | null>(null);
  message$ = this.messageSubject.asObservable();

  constructor(private firestore: Firestore) { }

  async submitRSVP(data: Omit<RSVPData, 'timestamp'>): Promise<void> {
    try {
      this.isLoading = true;
      const docRef = await addDoc(collection(this.firestore, this.COLLECTION_NAME), {
        ...data,
        timestamp: Timestamp.now()
      });
      this.message = { text: 'RSVP berhasil dikirim!', type: 'success' };
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      this.message = { text: 'Gagal mengirim RSVP. Silakan coba lagi.', type: 'error' };
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async getRSVPs(): Promise<RSVPData[]> {
    try {
      const q = query(
        collection(this.firestore, this.COLLECTION_NAME),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        timestamp: doc.data()['timestamp']
      })) as RSVPData[];
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
      return [];
    }
  }

  clearMessage(): void {
    this.message = null;
  }

  async getTotalGuests(): Promise<number> {
    try {
      const rsvpRef = collection(this.firestore, 'rsvps');
      const snapshot = await getDocs(rsvpRef);
      return snapshot.docs.reduce((sum, doc) => {
        const rsvp = doc.data() as RSVPData;
        return sum + (rsvp.attendanceStatus === 'Hadir' ? rsvp.numberOfGuests : 0);
      }, 0);
    } catch (error) {
      console.error('Error getting total guests:', error);
      return 0;
    }
  }
}