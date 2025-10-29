import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MusicService {
    private audio: HTMLAudioElement;
    private isPlayingSubject = new BehaviorSubject<boolean>(false);
    isPlaying$ = this.isPlayingSubject.asObservable();
    private hasUserInteracted = false;
    private wasPlayingBeforeHidden = false; // Track if music was playing before page became hidden

    constructor() {
        this.audio = new Audio('selawat_haris.mp3');
        this.audio.loop = true;
        this.audio.muted = false; // Start unmuted for immediate autoplay attempt

        // Add event listeners to handle audio state
        this.audio.addEventListener('play', () => {
            this.isPlayingSubject.next(true);
        });

        this.audio.addEventListener('pause', () => {
            this.isPlayingSubject.next(false);
        });

        this.audio.addEventListener('ended', () => {
            this.audio.play().catch(() => {
                this.isPlayingSubject.next(false);
            });
        });

        // Handle errors
        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            this.isPlayingSubject.next(false);
        });

        // Add Page Visibility API listener to handle browser minimize/sleep
        this.setupVisibilityListener();
        
        // Try to start playing immediately
        this.attemptAutoplay();
    }

    private setupVisibilityListener() {
        // Listen for page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page is hidden (minimized, tab switched, phone sleep)
                if (this.isPlayingSubject.value) {
                    this.wasPlayingBeforeHidden = true;
                    this.pause();
                }
            } else {
                // Page is visible again
                // Optionally resume music if it was playing before
                // Comment out the next 3 lines if you don't want auto-resume
                if (this.wasPlayingBeforeHidden) {
                    this.play();
                    this.wasPlayingBeforeHidden = false;
                }
            }
        });
    }

    play() {
        if (!this.hasUserInteracted) {
            this.hasUserInteracted = true;
            this.audio.muted = false;
        }

        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error('Error playing music:', error);
                // If autoplay is blocked, try playing muted
                if (error.name === 'NotAllowedError') {
                    this.audio.muted = true;
                    this.audio.play().catch(e => console.error('Error playing muted:', e));
                }
            });
        }
    }

    pause() {
        this.audio.pause();
    }

    toggle() {
        if (this.isPlayingSubject.value) {
            this.pause();
        } else {
            this.play();
        }
    }

    // Call this when user first interacts with the page
    unmute() {
        if (!this.hasUserInteracted) {
            this.hasUserInteracted = true;
            this.audio.muted = false;
            // Try to play if not already playing
            if (!this.isPlayingSubject.value) {
                this.play();
            }
        }
    }

    // Reset the audio state
    reset() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlayingSubject.next(false);
    }

    // Attempt to start music automatically
    private attemptAutoplay() {
        // Try immediate autoplay first
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Music autoplay started successfully');
                this.hasUserInteracted = true;
            }).catch(error => {
                console.log('Autoplay blocked by browser, setting up interaction listeners:', error);
                // If autoplay fails, set up listeners for any user interaction
                this.setupAutoplayOnInteraction();
            });
        } else {
            // Fallback for older browsers
            this.setupAutoplayOnInteraction();
        }
    }

    private setupAutoplayOnInteraction() {
        const startMusicOnInteraction = () => {
            this.hasUserInteracted = true;
            this.audio.muted = false;
            const playPromise = this.audio.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('Music started after user interaction');
                }).catch(error => {
                    console.error('Failed to start music even after interaction:', error);
                });
            }
            
            // Remove all listeners after first interaction
            document.removeEventListener('click', startMusicOnInteraction);
            document.removeEventListener('touchstart', startMusicOnInteraction);
            document.removeEventListener('keydown', startMusicOnInteraction);
            document.removeEventListener('scroll', startMusicOnInteraction);
        };

        // Listen for various types of user interactions
        document.addEventListener('click', startMusicOnInteraction, { passive: true });
        document.addEventListener('touchstart', startMusicOnInteraction, { passive: true });
        document.addEventListener('keydown', startMusicOnInteraction, { passive: true });
        document.addEventListener('scroll', startMusicOnInteraction, { passive: true });
        
        console.log('Music will start on first user interaction (touch, click, scroll, or key press)');
    }
} 