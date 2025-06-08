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

    constructor() {
        this.audio = new Audio('qalbi_fi_madina.mov');
        this.audio.loop = true;
        this.audio.muted = true; // Start muted to comply with autoplay policies

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
} 