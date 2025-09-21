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
import { Timestamp } from 'firebase/firestore';
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
  styleUrls: ['./landing.css'],
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
  wishes: Wish[] = [
    {
      name: 'Test User',
      message: 'Congratulations on your wedding! This is a test wish.',
      timestamp: new Date()
    },
    {
      name: 'Another User',
      message: 'Wishing you both a lifetime of happiness and love!',
      timestamp: new Date()
    }
  ];

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
    this.wishesModalOpen = true;
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
      const rsvps = await this.rsvpService.getRSVPs();
      this.wishes = rsvps
        .filter(rsvp => rsvp.message && rsvp.message.trim() !== '')
        .map(rsvp => ({
          name: rsvp.name,
          message: rsvp.message,
          timestamp: (rsvp.timestamp as Timestamp).toDate()
        }))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Error loading wishes:', error);
    } finally {
      this.isLoadingWishes = false;
    }
  }
}

