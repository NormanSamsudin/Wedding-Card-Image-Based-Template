import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  
  // Audio properties
  audio: HTMLAudioElement | null = null;
  isPlaying = false;
  audioError = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.initializeAudio();
  }

  ngOnDestroy() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
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
    if (this.isValidForm()) {
      this.isLoading = true;
      
      // Simulate form submission
      setTimeout(() => {
        console.log('RSVP Form Submitted:', this.rsvpForm);
        this.isLoading = false;
        this.isSubmitted = true;
        
        // Optional: Pause music on successful submission
        if (this.audio && this.isPlaying) {
          this.audio.pause();
          this.isPlaying = false;
        }
      }, 1500);
    }
  }

  isValidForm(): boolean {
    return this.rsvpForm.name.trim() !== '' && 
           this.rsvpForm.email.trim() !== '' && 
           this.rsvpForm.familyNumber > 0;
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
    
    // Restart audio
    this.attemptAutoPlay();
  }
}