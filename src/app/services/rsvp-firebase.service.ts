// src/app/services/rsvp-firebase.service.ts
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, deleteDoc, getDocs, query, where } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface RSVPData {
  id?: string;
  name: string;
  email: string;
  familyNumber: number;
  attending: boolean;
  dietaryRestrictions?: string;
  message?: string;
  submittedAt: Date;
  ipAddress?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RSVPFirebaseService {
  private firestore = inject(Firestore);
  private collectionName = 'rsvps';

  // Add new RSVP
  addRSVP(rsvpData: Omit<RSVPData, 'id' | 'submittedAt'>): Observable<string> {
    const rsvpCollection = collection(this.firestore, this.collectionName);
    
    const dataToSave: Omit<RSVPData, 'id'> = {
      ...rsvpData,
      submittedAt: new Date(),
      // You can add IP tracking if needed
      // ipAddress: this.getClientIP()
    };

    return from(addDoc(rsvpCollection, dataToSave)).pipe(
      map(docRef => {
        console.log('RSVP saved with ID:', docRef.id);
        return docRef.id;
      })
    );
  }

  // Get all RSVPs (for admin use)
  getAllRSVPs(): Observable<RSVPData[]> {
    const rsvpCollection = collection(this.firestore, this.collectionName);
    
    return from(getDocs(rsvpCollection)).pipe(
      map(querySnapshot => {
        const rsvps: RSVPData[] = [];
        querySnapshot.forEach(doc => {
          rsvps.push({
            id: doc.id,
            ...doc.data() as Omit<RSVPData, 'id'>
          });
        });
        return rsvps;
      })
    );
  }

  // Check if email already exists
  checkEmailExists(email: string): Observable<boolean> {
    const rsvpCollection = collection(this.firestore, this.collectionName);
    const emailQuery = query(rsvpCollection, where('email', '==', email));
    
    return from(getDocs(emailQuery)).pipe(
      map(querySnapshot => !querySnapshot.empty)
    );
  }

  // Update existing RSVP
  updateRSVP(id: string, updates: Partial<RSVPData>): Observable<void> {
    const rsvpDoc = doc(this.firestore, this.collectionName, id);
    return from(updateDoc(rsvpDoc, updates));
  }

  // Delete RSVP
  deleteRSVP(id: string): Observable<void> {
    const rsvpDoc = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(rsvpDoc));
  }

  // Get RSVP statistics
  getRSVPStats(): Observable<{attending: number, notAttending: number, totalPeople: number}> {
    return this.getAllRSVPs().pipe(
      map(rsvps => {
        const attending = rsvps.filter(rsvp => rsvp.attending).length;
        const notAttending = rsvps.filter(rsvp => !rsvp.attending).length;
        const totalPeople = rsvps.reduce((sum, rsvp) => 
          sum + (rsvp.attending ? rsvp.familyNumber : 0), 0);
        
        return { attending, notAttending, totalPeople };
      })
    );
  }
}