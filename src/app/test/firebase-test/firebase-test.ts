import { Component, inject } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-firebase-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './firebase-test.html',
  styleUrls: ['./firebase-test.css']
})
export class FirebaseTestComponent {
  private firestore = inject(Firestore);
  
  connectionStatus = '';
  errorDetails = '';
  testing = false;

  async testConnection() {
    this.testing = true;
    this.connectionStatus = '';
    this.errorDetails = '';

    try {
      console.log('Testing Firebase connection...');
      
      // Test 1: Check if Firestore instance exists
      console.log('Firestore instance:', this.firestore);
      
      // Test 2: Try to access a collection
      const testCollection = collection(this.firestore, 'test-connection');
      console.log('Collection created:', testCollection);
      
      // Test 3: Try to read from Firestore
      const snapshot = await getDocs(testCollection);
      console.log('Query executed successfully. Documents count:', snapshot.size);
      
      this.connectionStatus = '✅ Firebase connected successfully!';
      console.log('Firebase connection test passed');
      
    } catch (error: any) {
      this.connectionStatus = '❌ Firebase connection failed';
      this.errorDetails = JSON.stringify(error, null, 2);
      console.error('Firebase connection error:', error);
    } finally {
      this.testing = false;
    }
  }

  clearResults() {
    this.connectionStatus = '';
    this.errorDetails = '';
  }
}