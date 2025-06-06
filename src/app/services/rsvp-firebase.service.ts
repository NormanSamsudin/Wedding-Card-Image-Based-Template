// src/app/services/rsvp-firebase.service.ts
import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

export interface RSVPData {
  name: string;
  email: string;
  numberOfGuests: number;
  attendanceStatus: 'Hadir' | 'Tidak Hadir';
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class RSVPFirebaseService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private messageSubject = new BehaviorSubject<{ type: 'success' | 'error', text: string } | null>(null);
  message$ = this.messageSubject.asObservable();

  constructor(private firestore: Firestore) { }

  async submitRSVP(data: Omit<RSVPData, 'timestamp'>) {
    try {
      this.loadingSubject.next(true);

      const rsvpData: RSVPData = {
        ...data,
        timestamp: new Date()
      };

      const rsvpRef = collection(this.firestore, 'rsvps');
      await addDoc(rsvpRef, rsvpData);

      this.messageSubject.next({
        type: 'success',
        text: 'Terima kasih! RSVP anda telah berjaya dihantar.'
      });
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      this.messageSubject.next({
        type: 'error',
        text: 'Maaf, terdapat ralat. Sila cuba lagi.'
      });
    } finally {
      this.loadingSubject.next(false);
    }
  }

  clearMessage() {
    this.messageSubject.next(null);
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