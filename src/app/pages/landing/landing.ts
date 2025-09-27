import { Component, AfterViewInit, ViewChild, ElementRef, HostListener, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottomNavigation, NavigationItem } from '../../components/bottom-navigation/bottom-navigation';
import { ModalOverlay } from '../../components/modal-overlay/modal-overlay';
import { ScrollAnimationDirective } from '../../directives/scroll-animation.directive';
import { RSVPFirebaseService, RSVPData } from '../../services/rsvp-firebase.service';
import { PhotosFirebaseService, Photo } from '../../services/photos-firebase.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Howl } from 'howler';
import { Router } from '@angular/router';
import { MusicService } from '../../services/music.service';
import { interval } from 'rxjs';

declare let L: any;

interface RSVPForm {
  name: string;
  email: string;
  numberOfGuests: number;
  attendanceStatus: 'Hadir' | 'Tidak Hadir';
  message: string;
  hadir?: boolean;
  tidakHadir?: boolean;
  rating?: number;
  jumlahRombongan?: number;
}

interface Wish {
  name: string;
  message: string;
  timestamp: Date;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, BottomNavigation],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css', './landing_text.css'],
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {

  ngDoCheck() {
    if (this.wishesModalOpen) {
      document.body.classList.add('wishes-modal-open');
    } else {
      document.body.classList.remove('wishes-modal-open');
    }
  }
  // View Elements
  @ViewChild('backgroundMusic') backgroundMusic!: ElementRef<HTMLAudioElement>;
  @ViewChild('backgroundVideo') backgroundVideo!: ElementRef<HTMLVideoElement>;

  // Constants
  private readonly VENUE_LAT = 3.079934;
  private readonly VENUE_LNG = 101.5669504;
  backgroundImage = 'bg.png';

  // State Variables
  activeModal: string | null = null;
  isMusicPlaying = true;
  private hasUserInteracted = false;
  isMapModalOpen = false;
  isClosing = false;
  isLoadingWishes = true;
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  splashHidden = false;

  // Video State Variables
  videoLoading = true;
  videoError = false;
  videoPausedNearEnd = false;
  videoDelayActive = false;
  private videoInitialized = false;
  private videoPauseSequenceStarted = false;
  private videoMonitoringInterval: any;

  // Carousel Variables for Modal
  currentWishIndex = 0;
  private wishCarouselInterval: any;

  // Countdown Variables
  daysLeft: number = 0;
  hoursLeft: number = 0;
  minutesLeft: number = 0;
  secondsLeft: number = 0;
  private countdownSubscription: any;

  // Map Variables
  private map: any;
  private largeMap: any;

  // Data Collections
  wishes: Wish[] = [];

  // Form Data
  rsvpForm: RSVPForm = {
    name: '',
    email: '',
    numberOfGuests: 1,
    attendanceStatus: 'Hadir',
    message: '',
    hadir: false,
    tidakHadir: false,
    rating: 0,
    jumlahRombongan: 1
  };

  // RSVP Modal State
  rsvpModalOpen = false;

  constructor(
    public rsvpService: RSVPFirebaseService,
    private photosService: PhotosFirebaseService,
    private router: Router,
    private musicService: MusicService,
    private cdr: ChangeDetectorRef
  ) {
    this.loadWishes();
    this.startCountdown();
  }

  // Lifecycle Hooks
  ngOnInit() {
    document.body.style.backgroundImage = `url(${this.backgroundImage})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    this.startCountdown();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
    }, 1000);
    
    // Start splash animation
    setTimeout(() => {
      this.splashHidden = true;
      // Wait for splash fade-out animation to complete before starting video
      setTimeout(() => {
        this.initializeVideoBackground();
      }, 1000); // Wait 1 second after splash is hidden for animation to complete
    }, 3000); // Show splash for 3 seconds
    
    // Do not auto-play music here; wait for user interaction (see onDocumentClick)
  }

  ngOnDestroy() {
    if (this.largeMap) {
      this.largeMap.remove();
      this.largeMap = null;
    }
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    if (this.wishCarouselInterval) {
      clearInterval(this.wishCarouselInterval);
    }
    if (this.videoMonitoringInterval) {
      clearInterval(this.videoMonitoringInterval);
    }
  }

  // Event Listeners
  @HostListener('document:click')
  onDocumentClick() {
    if (!this.hasUserInteracted) {
      this.hasUserInteracted = true;
      this.musicService.play(); // Start music on first user interaction
    }
  }

  // Navigation Handlers

  wishesModalOpen = false;
  locationModalOpen = false;
  contactModalOpen = false;
  closeContactModal() {
    this.contactModalOpen = false;
  }

  onNavigationClick(item: NavigationItem) {
    // First, close all modals before opening a new one
    this.closeAllModals();
    
    switch (item.id) {
      case 'wishes':
        this.openWishesModal();
        break;
      case 'home':
        this.router.navigate(['/landing']);
        break;
      case 'rsvp':
        this.openRSVPModal();
        break;
      case 'location':
        this.openLocationModal();
        break;
      case 'contact':
        this.openContactModal();
        break;
    }
  }

  // Helper method to close all modals
  closeAllModals() {
    this.rsvpModalOpen = false;
    this.locationModalOpen = false;
    this.contactModalOpen = false;
    this.wishesModalOpen = false;
    
    // Stop any running carousel if wishes modal was open
    this.stopWishCarousel();
  }

  // Modal opening methods for consistency
  openLocationModal() {
    this.locationModalOpen = true;
  }

  openContactModal() {
    this.contactModalOpen = true;
  }

  openWishesModal() {
    console.log('Opening wishes modal, current wishes count:', this.wishes.length);
    this.wishesModalOpen = true;
    
    // Reload wishes when modal is opened to ensure fresh data
    this.loadWishes();
    
    if (this.wishes.length > 1) {
      this.startWishCarousel();
    }
  }

  closeWishesModal() {
    this.wishesModalOpen = false;
    this.stopWishCarousel();
    document.body.classList.remove('wishes-modal-open');
  }

  private startWishCarousel() {
    if (this.wishes.length <= 1) return;
    
    this.currentWishIndex = 0;
    this.cdr.detectChanges(); // Update the active class
    
    this.wishCarouselInterval = setInterval(() => {
      this.currentWishIndex = (this.currentWishIndex + 1) % this.wishes.length;
      this.cdr.detectChanges(); // Update the active class
    }, 3000); // Change every 3 seconds
  }

  closeLocationModal() {
    this.locationModalOpen = false;
  }

  private stopWishCarousel() {
    if (this.wishCarouselInterval) {
      clearInterval(this.wishCarouselInterval);
      this.wishCarouselInterval = null;
    }
  }

  openRSVPModal() {
    this.rsvpModalOpen = true;
  }

  closeRSVPModal() {
    this.rsvpModalOpen = false;
  }

  // Music Controls
  toggleMusic() {
    this.musicService.toggle();
  }

  // Countdown Timer
  private startCountdown() {
    const weddingDate = new Date('2025-05-12T16:00:00');

    this.countdownSubscription = interval(1000).subscribe(() => {
      const now = new Date();
      const diff = weddingDate.getTime() - now.getTime();

      if (diff > 0) {
        this.daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));
        this.hoursLeft = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        this.minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        this.secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);
      } else {
        this.daysLeft = 0;
        this.hoursLeft = 0;
        this.minutesLeft = 0;
        this.secondsLeft = 0;
        if (this.countdownSubscription) {
          this.countdownSubscription.unsubscribe();
        }
      }
    });
  }

  // Calendar Functions
  addToCalendar() {
    const calendarUrl = 'https://calendar.google.com/calendar/u/0/r/eventedit?text=The+Wedding+Of+Aliah+-+Harris&dates=20250512T030000Z/20250512T070000Z&details=The+Wedding+Of+Aliah++-++Harris&location=Kelab+Impiana+Kayangan+Heights&sprop&sprop=name:&pli=1';
    window.open(calendarUrl, '_blank');
  }

  // Contact Functions
  makeCall(phoneNumber: string) {
    window.location.href = `tel:${phoneNumber}`;
  }

  openWhatsApp(phoneNumber: string) {
    const cleanNumber = phoneNumber.replace(/[\s+()-]/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=Hi! I'm contacting you regarding Aliah & Harris's wedding.`;
    window.open(whatsappUrl, '_blank');
  }

  // Map Functions
  private initMap() {
    // Check if the map container exists before initializing
    const mapContainer = document.getElementById('venue-map');
    if (!mapContainer) {
      console.log('Map container not found, skipping map initialization');
      return;
    }
    
    this.map = L.map('venue-map').setView([this.VENUE_LAT, this.VENUE_LNG], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    L.marker([this.VENUE_LAT, this.VENUE_LNG])
      .addTo(this.map)
      .bindPopup('Kelab Impiana Kayangan Heights')
      .openPopup();
  }

  private initLargeMap() {
    if (this.largeMap) {
      this.largeMap.remove();
    }
    this.largeMap = L.map('large-venue-map').setView([this.VENUE_LAT, this.VENUE_LNG], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.largeMap);
    L.marker([this.VENUE_LAT, this.VENUE_LNG])
      .addTo(this.largeMap)
      .bindPopup('Kelab Impiana Kayangan Heights')
      .openPopup();
  }

  openMapModal() {
    this.isMapModalOpen = true;
    setTimeout(() => {
      this.initLargeMap();
    }, 100);
  }

  closeMapModal() {
    if (this.isClosing) return;
    this.isClosing = true;
    setTimeout(() => {
      this.isMapModalOpen = false;
      if (this.largeMap) {
        this.largeMap.remove();
        this.largeMap = null;
      }
      this.isClosing = false;
    }, 500);
  }

  openGoogleMaps() {
    const googleMapsUrl = 'https://www.google.com/maps/place/3.079934,101.5669504';
    window.open(googleMapsUrl, '_blank');
  }

  openWaze() {
    const wazeUrl = 'https://www.waze.com/live-map/directions?to=ll.3.079934%2C101.5669504';
    window.open(wazeUrl, '_blank');
  }

  // Modal Functions
  closeModal() {
    if (this.isClosing) return;
    this.isClosing = true;
    setTimeout(() => {
      this.activeModal = null;
      this.isClosing = false;
    }, 500);
  }

  // Toast Functions
  private showToastMessage(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  // RSVP Functions
  rsvpPopupMessage: string | null = null;
  rsvpPopupType: 'error' | 'success' | null = null;

  async submitRSVP() {
    // Validate all required fields
    if (!this.rsvpForm.name || !this.rsvpForm.jumlahRombongan || !this.rsvpForm.message || (!this.rsvpForm.hadir && !this.rsvpForm.tidakHadir)) {
      this.rsvpPopupMessage = 'Sila lengkapkan semua maklumat RSVP.';
      this.rsvpPopupType = 'error';
      return;
    }
    try {
      await this.rsvpService.submitRSVP(this.rsvpForm);
      this.rsvpPopupMessage = 'Terima kasih! RSVP anda telah berjaya dihantar.';
      this.rsvpPopupType = 'success';
      this.rsvpForm = {
        name: '',
        email: '',
        numberOfGuests: 1,
        attendanceStatus: 'Hadir',
        message: '',
        hadir: false,
        tidakHadir: false,
        rating: 0,
        jumlahRombongan: 1
      };
      setTimeout(() => {
        this.loadWishes();
      }, 1000);
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      this.rsvpPopupMessage = 'Maaf, terdapat ralat. Sila cuba lagi.';
      this.rsvpPopupType = 'error';
    }
  }

  closeRSVPPopup() {
    this.rsvpPopupMessage = null;
    this.rsvpPopupType = null;
    if (this.rsvpPopupType === 'success') {
      this.closeModal();
    }
  }

  // Wishes Functions
  private async loadWishes() {
    try {
      this.isLoadingWishes = true;
      console.log('Loading wishes...');
      const rsvps = await this.rsvpService.getRSVPs();
      console.log('RSVP data received:', rsvps);
      this.wishes = rsvps
        .filter(rsvp => rsvp.message && rsvp.message.trim() !== '')
        .map(rsvp => ({
          name: rsvp.name,
          message: rsvp.message,
          timestamp: rsvp.timestamp instanceof Date ? rsvp.timestamp : new Date(rsvp.timestamp)
        }))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      console.log('Filtered wishes:', this.wishes);
      console.log('Wishes count after loading:', this.wishes.length);
      
      // Trigger change detection
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading wishes:', error);
    } finally {
      this.isLoadingWishes = false;
      console.log('isLoadingWishes set to false');
      // Trigger change detection again
      this.cdr.detectChanges();
    }
  }

  // Video handling methods
  initializeVideoBackground() {
    if (this.backgroundVideo?.nativeElement && !this.videoInitialized) {
      const video = this.backgroundVideo.nativeElement;
      
      // Mark as initialized to prevent multiple calls
      this.videoInitialized = true;
      
      // Set video properties for background video
      video.muted = true;
      video.autoplay = false; // Manual control of playback
      video.loop = false;
      video.playsInline = true;
      video.preload = 'auto';
      video.playbackRate = 0.5; // Set video speed to 50% (0.5x slower)
      
      // Start precise video monitoring (but don't start playing yet)
      this.startVideoMonitoring();
      
      // Only start video playback after ensuring splash is completely hidden
      if (this.splashHidden) {
        console.log('Starting video playback sequence (splash animation completed) at 0.5x speed');
        this.startVideoWithPauseSequence();
      }
    }
  }

  private startVideoWithPauseSequence() {
    if (this.backgroundVideo?.nativeElement && !this.videoPauseSequenceStarted) {
      const video = this.backgroundVideo.nativeElement;
      
      // Mark sequence as started to prevent multiple calls
      this.videoPauseSequenceStarted = true;
      
      // Start playing the video
      this.attemptVideoPlay();
      
      // Pause after 1 millisecond
      setTimeout(() => {
        video.pause();
        console.log('Video paused after 1ms');
        
        // Resume playing after 2 seconds
        setTimeout(() => {
          console.log('Resuming video playback after 2 second pause');
          this.attemptVideoPlay();
        }, 2000);
      }, 1);
    }
  }

  private startVideoMonitoring() {
    // Clear any existing interval
    if (this.videoMonitoringInterval) {
      clearInterval(this.videoMonitoringInterval);
    }
    
    // Check video time every 100ms for precise control
    this.videoMonitoringInterval = setInterval(() => {
      if (this.backgroundVideo?.nativeElement && !this.videoPausedNearEnd) {
        const video = this.backgroundVideo.nativeElement;
        
        if (video.duration && video.currentTime) {
          const timeRemaining = video.duration - video.currentTime;
          
          // Log progress every 5 seconds
          if (Math.floor(video.currentTime) % 5 === 0 && video.currentTime % 1 < 0.1) {
            console.log(`Video: ${video.currentTime.toFixed(1)}s / ${video.duration.toFixed(1)}s`);
          }
          
          // Pause when 0.1 seconds remaining
          if (timeRemaining <= 0.1) {
            video.pause();
            this.videoPausedNearEnd = true;
            console.log('Video paused before end (interval method)');
            clearInterval(this.videoMonitoringInterval);
          }
        }
      }
    }, 100); // Check every 100ms
  }

  onVideoLoaded() {
    console.log('Video loaded successfully');
    this.videoLoading = false;
    this.videoError = false;
    // Don't auto-play here, let the pause sequence handle it
  }

  onVideoError(event: any) {
    console.error('Video failed to load:', event);
    this.videoLoading = false;
    this.videoError = true;
    // Don't auto-retry here, let the pause sequence handle it
  }

  onVideoCanPlay() {
    console.log('Video can start playing');
    this.videoLoading = false;
    // Don't auto-play here, let the pause sequence handle it
  }

  onVideoTimeUpdate(event: any) {
    const video = event.target as HTMLVideoElement;
    
    // Debug: Basic logging every few seconds
    if (Math.floor(video.currentTime) % 5 === 0 && video.currentTime % 1 < 0.1) {
      console.log(`Video playing: ${video.currentTime.toFixed(1)}s / ${video.duration.toFixed(1)}s`);
    }
    
    // Check if we're very close to the end
    if (video.duration && video.currentTime && !this.videoPausedNearEnd) {
      const timeRemaining = video.duration - video.currentTime;
      
      // Debug logging when close to end
      if (timeRemaining < 1) {
        console.log(`Time remaining: ${timeRemaining.toFixed(3)}s`);
      }
      
      // Pause when there's 0.1 seconds or less remaining (more reliable than 1ms)
      if (timeRemaining <= 0.1) {
        video.pause();
        this.videoPausedNearEnd = true;
        console.log('Video paused before end to prevent looping');
      }
    }
  }

  private attemptVideoPlay() {
    if (this.backgroundVideo?.nativeElement && !this.videoError) {
      const video = this.backgroundVideo.nativeElement;
      
      // Ensure video properties are set correctly
      video.muted = true;
      video.loop = false;
      video.playsInline = true;
      
      // Multiple play attempts for better compatibility
      const playVideo = () => {
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Video is playing successfully');
              this.videoLoading = false;
              this.videoError = false;
            })
            .catch(error => {
              console.warn('Auto-play failed, trying again:', error);
              // Try again after user interaction
              this.retryVideoPlay();
            });
        }
      };

      // Initial play attempt
      playVideo();
      
      // Additional attempts if needed
      setTimeout(playVideo, 500);
      setTimeout(playVideo, 1000);
    }
  }

  private retryVideoPlay() {
    // Set up click listener to play video on user interaction
    const playOnInteraction = () => {
      if (this.backgroundVideo?.nativeElement) {
        this.backgroundVideo.nativeElement.play()
          .then(() => {
            console.log('Video playing after user interaction');
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
          })
          .catch(err => console.warn('Video play failed even after interaction:', err));
      }
    };

    document.addEventListener('click', playOnInteraction, { once: true });
    document.addEventListener('touchstart', playOnInteraction, { once: true });
  }
}

