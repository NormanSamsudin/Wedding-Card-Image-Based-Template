import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RSVPFirebaseService } from '../../services/rsvp-firebase.service';
import { Subscription } from 'rxjs';

interface RSVPForm {
  name: string;
  email: string;
  familyNumber: number;
  attending: boolean;
  dietaryRestrictions: string;
  message: string;
}

@Component({
  selector: 'app-rsvp',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './rsvp.html',
  styleUrl: './rsvp.css'
})
export class RSVP implements OnInit, OnDestroy {
  rsvpForm: RSVPForm = {
    name: '',
    email: '',
    familyNumber: 1,
    attending: true,
    dietaryRestrictions: '',
    message: ''
  };

  isSubmitted = false;
  isLoading = false;
  submitError = '';
  submitSuccess = false;

  // Audio properties
  audio: HTMLAudioElement | null = null;
  isPlaying = false;
  audioError = false;

  // Subscription management
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private rsvpService: RSVPFirebaseService
  ) { }

  ngOnInit() {
    this.initializeAudio();
  }

  ngOnDestroy() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }

    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initializeAudio() {
    try {
      // You can replace this with your own wedding song URL
      // For demo, using a free wedding music sample
      this.audio = new Audio('fimadina_low.mp3');

      // Or use a local file in your assets folder:
      // this.audio = new Audio('/assets/audio/wedding-song.mp3');

      this.audio.loop = true;
      this.audio.volume = 0.3; // Set to 30% volume

      // Handle audio events
      this.audio.addEventListener('loadeddata', () => {
        console.log('Audio loaded successfully');
      });

      this.audio.addEventListener('error', () => {
        console.warn('Audio failed to load');
        this.audioError = true;
      });

      this.audio.addEventListener('ended', () => {
        this.isPlaying = false;
      });

      // Auto-play with user interaction fallback
      this.attemptAutoPlay();
    } catch (error) {
      console.warn('Audio not supported or failed to initialize:', error);
      this.audioError = true;
    }
  }

  async attemptAutoPlay() {
    if (!this.audio) return;

    try {
      await this.audio.play();
      this.isPlaying = true;
    } catch (error) {
      // Auto-play failed (common in modern browsers)
      console.log('Auto-play prevented. User interaction required.');
      this.isPlaying = false;
    }
  }

  toggleAudio() {
    if (!this.audio || this.audioError) return;

    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
    } else {
      this.audio.play()
        .then(() => {
          this.isPlaying = true;
        })
        .catch((error) => {
          console.warn('Failed to play audio:', error);
          this.audioError = true;
        });
    }
  }

  onSubmit() {
    if (!this.isValidForm()) {
      this.submitError = 'Please fill in all required fields.';
      return;
    }

    this.isLoading = true;
    this.submitError = '';

    // Check if email already exists
    const emailCheckSub = this.rsvpService.checkEmailExists(this.rsvpForm.email).subscribe({
      next: (emailExists) => {
        if (emailExists) {
          this.submitError = 'An RSVP with this email already exists. Please use a different email or contact us if you need to update your RSVP.';
          this.isLoading = false;
          return;
        }

        // Email doesn't exist, proceed with submission
        this.submitRSVP();
      },
      error: (error) => {
        console.error('Error checking email:', error);
        this.submitError = 'Sorry, there was an error checking your email. Please try again.';
        this.isLoading = false;
      }
    });

    this.subscriptions.push(emailCheckSub);
  }

  private submitRSVP() {
    // Prepare data for Firebase
    const rsvpData = {
      name: this.rsvpForm.name.trim(),
      email: this.rsvpForm.email.trim().toLowerCase(),
      familyNumber: this.rsvpForm.familyNumber,
      attending: this.rsvpForm.attending,
      dietaryRestrictions: this.rsvpForm.dietaryRestrictions.trim(),
      message: this.rsvpForm.message.trim()
    };

    // Save to Firebase
    const submitSub = this.rsvpService.addRSVP(rsvpData).subscribe({
      next: (docId) => {
        console.log('RSVP successfully submitted with ID:', docId);

        this.isLoading = false;
        this.isSubmitted = true;
        this.submitSuccess = true;

        // Optional: Pause music on successful submission
        if (this.audio && this.isPlaying) {
          this.audio.pause();
          this.isPlaying = false;
        }
      },
      error: (error) => {
        console.error('Error submitting RSVP:', error);
        this.submitError = 'Sorry, there was an error submitting your RSVP. Please try again or contact us directly.';
        this.isLoading = false;
      }
    });

    this.subscriptions.push(submitSub);
  }

  isValidForm(): boolean {
    return this.rsvpForm.name.trim() !== '' &&
      this.rsvpForm.email.trim() !== '' &&
      this.rsvpForm.familyNumber > 0 &&
      this.isValidEmail(this.rsvpForm.email);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  goBackToInvitation() {
    // Pause audio when leaving
    if (this.audio && this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
    }
    this.router.navigate(['/']);
  }

  resetForm() {
    this.rsvpForm = {
      name: '',
      email: '',
      familyNumber: 1,
      attending: true,
      dietaryRestrictions: '',
      message: ''
    };
    this.isSubmitted = false;
    this.submitError = '';
    this.submitSuccess = false;

    // Restart audio
    this.attemptAutoPlay();
  }
}