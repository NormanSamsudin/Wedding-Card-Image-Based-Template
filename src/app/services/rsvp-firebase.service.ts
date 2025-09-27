// src/app/services/rsvp-firebase.service.ts
import { Injectable } from '@angular/core';
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
  private readonly API_URL = 'https://normansamsudin.duckdns.org/webhook/post-muazzshafiqah';
  isLoading = false;
  message: { text: string; type: 'success' | 'error' } | null = null;

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private messageSubject = new BehaviorSubject<{ type: 'success' | 'error', text: string } | null>(null);
  message$ = this.messageSubject.asObservable();

  constructor() { }

  async submitRSVP(data: any): Promise<void> {
    try {
      this.isLoading = true;
      this.loadingSubject.next(true);
      
      console.log('Raw input data:', data);
      
      // Properly map form data to API format
      const attendanceStatus = data.hadir ? 'Hadir' : (data.tidakHadir ? 'Tidak Hadir' : data.attendanceStatus || 'Hadir');
      const numberOfGuests = data.jumlahRombongan || data.numberOfGuests || 1;
      
        // Sanitize message to remove leading '='
        let message = String(data.message || '');
        if (message.startsWith('=')) {
          message = message.substring(1);
        }
        const requestBody = {
          name: String(data.name || ''),
          attendanceStatus: String(attendanceStatus),
          message,
          numberOfGuests: Number(numberOfGuests),
          timestamp: new Date().toISOString()
        };

      console.log('Request body before stringify:', requestBody);
      
      const jsonString = JSON.stringify(requestBody);
      console.log('JSON string to send:', jsonString);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonString
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('RSVP submission response:', result);
      
      this.message = { text: 'RSVP berhasil dikirim!', type: 'success' };
      this.messageSubject.next({ text: 'RSVP berhasil dikirim!', type: 'success' });
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      this.message = { text: 'Gagal mengirim RSVP. Silakan coba lagi.', type: 'error' };
      this.messageSubject.next({ text: 'Gagal mengirim RSVP. Silakan coba lagi.', type: 'error' });
      throw error;
    } finally {
      this.isLoading = false;
      this.loadingSubject.next(false);
    }
  }

  async getRSVPs(): Promise<RSVPData[]> {
    try {
      console.log('Fetching RSVPs from API...');
      const response = await fetch('https://normansamsudin.duckdns.org/webhook/get-muazzshafiqah');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiResponse = await response.json();
      console.log('Raw API response:', apiResponse);
      
      // Parse the new API response structure - it's now a direct object, not an array
      if (apiResponse && apiResponse.status === 'success' && apiResponse.data) {
        const rsvpData = apiResponse.data;
        console.log('RSVP data from API:', rsvpData);
        
        // Transform API data to match RSVPData interface
        const transformedData = rsvpData.map((item: any) => ({
          name: item.name || '',
          email: item.email || '',
          numberOfGuests: item.numberOfGuests || 0,
          attendanceStatus: item.attendanceStatus as 'Hadir' | 'Tidak Hadir',
          message: item.message || '',
          timestamp: item.timestamp ? new Date(item.timestamp) : new Date()
        })).filter((rsvp: any) => rsvp.name); // Filter out entries without names
        
        console.log('Transformed RSVP data:', transformedData);
        return transformedData;
      }
      
      console.log('No data found in API response');
      return [];
    } catch (error) {
      console.error('Error fetching RSVPs from API:', error);
      return [];
    }
  }

  clearMessage(): void {
    this.message = null;
    this.messageSubject.next(null);
  }

  async getTotalGuests(): Promise<number> {
    try {
      const rsvps = await this.getRSVPs();
      return rsvps.reduce((sum, rsvp) => {
        return sum + (rsvp.attendanceStatus === 'Hadir' ? rsvp.numberOfGuests : 0);
      }, 0);
    } catch (error) {
      console.error('Error getting total guests:', error);
      return 0;
    }
  }
}