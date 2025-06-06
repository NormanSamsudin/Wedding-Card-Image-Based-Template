import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RSVPFirebaseService, RSVPData } from '../../services/rsvp-firebase.service';
import { Subscription } from 'rxjs';

interface RSVPForm {
  name: string;
  email: string;
  numberOfGuests: number;
  attendanceStatus: 'Hadir' | 'Tidak Hadir';
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
    numberOfGuests: 1,
    attendanceStatus: 'Hadir',
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
      this.audio = new Audio('fimadina_low.mp3');
      this.audio.loop = true;
      this.audio.volume = 0.3;

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
        .catch((error: unknown) => {
          console.warn('Failed to play audio:', error);
          this.audioError = true;
        });
    }
  }

  async onSubmit() {
    if (!this.isValidForm()) {
      this.submitError = 'Please fill in all required fields.';
      return;
    }

    this.isLoading = true;
    this.submitError = '';

    try {
      await this.rsvpService.submitRSVP(this.rsvpForm);
      this.isLoading = false;
      this.isSubmitted = true;
      this.submitSuccess = true;

      // Optional: Pause music on successful submission
      if (this.audio && this.isPlaying) {
        this.audio.pause();
        this.isPlaying = false;
      }
    } catch (error: unknown) {
      console.error('Error submitting RSVP:', error);
      this.submitError = 'Sorry, there was an error submitting your RSVP. Please try again or contact us directly.';
      this.isLoading = false;
    }
  }

  isValidForm(): boolean {
    return this.rsvpForm.name.trim() !== '' &&
      this.rsvpForm.email.trim() !== '' &&
      this.rsvpForm.numberOfGuests > 0 &&
      this.isValidEmail(this.rsvpForm.email);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  goBackToInvitation() {
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
      numberOfGuests: 1,
      attendanceStatus: 'Hadir',
      message: ''
    };
    this.isSubmitted = false;
    this.submitError = '';
    this.submitSuccess = false;

    this.attemptAutoPlay();
  }
}