import { Component, AfterViewInit, ViewChild, ElementRef, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottomNavigation, NavigationItem } from '../../components/bottom-navigation/bottom-navigation';
import { ModalOverlay } from '../../components/modal-overlay/modal-overlay';
import { ScrollAnimationDirective } from '../../directives/scroll-animation.directive';
import { RSVPFirebaseService, RSVPData } from '../../services/rsvp-firebase.service';
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
}

interface Wish {
  name: string;
  message: string;
  timestamp: Date;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, BottomNavigation, ScrollAnimationDirective],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'],
  styles: [`
    :host {
      display: block;
      width: 100%;
      overflow-x: hidden;
      position: relative;
    }
  `]
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('backgroundMusic') backgroundMusic!: ElementRef<HTMLAudioElement>;
  activeModal: string | null = null;
  backgroundImage = 'bg.png';
  private map: any;
  private largeMap: any;
  private readonly VENUE_LAT = 3.079934;
  private readonly VENUE_LNG = 101.5669504;
  isMusicPlaying = true;
  private hasUserInteracted = false;
  isMapModalOpen = false;
  isClosing = false;
  wishes: Wish[] = [];
  isLoadingWishes = true;
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  daysLeft: number = 0;
  hoursLeft: number = 0;
  minutesLeft: number = 0;
  secondsLeft: number = 0;
  private countdownSubscription: any;

  // RSVP Form
  rsvpForm: RSVPForm = {
    name: '',
    email: '',
    numberOfGuests: 1,
    attendanceStatus: 'Hadir',
    message: ''
  };

  constructor(
    public rsvpService: RSVPFirebaseService,
    private router: Router,
    private musicService: MusicService
  ) {
    this.loadWishes();
    this.startCountdown();
  }

  ngOnInit() {
    // Optional: Set background dynamically
    document.body.style.backgroundImage = `url(${this.backgroundImage})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    this.startCountdown();
  }

  ngAfterViewInit() {
    // Initialize map after view is initialized
    setTimeout(() => {
      this.initMap();
    }, 1000); // Delay to ensure the map container is rendered

    // Start playing music when the page loads
    this.musicService.play();
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (!this.hasUserInteracted) {
      this.hasUserInteracted = true;
      this.musicService.unmute();
    }
  }

  toggleMusic() {
    this.musicService.toggle();
  }

  private initMap() {
    // Create map instance
    this.map = L.map('venue-map').setView([this.VENUE_LAT, this.VENUE_LNG], 15);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add marker for the venue
    L.marker([this.VENUE_LAT, this.VENUE_LNG])
      .addTo(this.map)
      .bindPopup('Kelab Impiana Kayangan Heights')
      .openPopup();
  }

  openMapModal() {
    this.isMapModalOpen = true;
    // Initialize large map after modal is opened
    setTimeout(() => {
      this.initLargeMap();
    }, 100);
  }

  closeMapModal() {
    if (this.isClosing) return; // Prevent multiple close attempts

    this.isClosing = true;
    // Wait for animation to complete before removing modal
    setTimeout(() => {
      this.isMapModalOpen = false;
      if (this.largeMap) {
        this.largeMap.remove();
        this.largeMap = null;
      }
      this.isClosing = false;
    }, 500); // Increased duration to ensure smooth animation
  }

  private initLargeMap() {
    if (this.largeMap) {
      this.largeMap.remove();
    }

    // Create large map instance
    this.largeMap = L.map('large-venue-map').setView([this.VENUE_LAT, this.VENUE_LNG], 15);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.largeMap);

    // Add marker for the venue
    L.marker([this.VENUE_LAT, this.VENUE_LNG])
      .addTo(this.largeMap)
      .bindPopup('Kelab Impiana Kayangan Heights')
      .openPopup();
  }

  onNavigationClick(item: NavigationItem) {
    switch (item.id) {
      case 'wishes':
        this.router.navigate(['/wishes']);
        break;
      case 'photos':
        this.router.navigate(['/photos']);
        break;
      case 'rsvp':
        this.router.navigate(['/rsvp']);
        break;
    }
  }

  closeModal() {
    if (this.isClosing) return; // Prevent multiple close attempts

    this.isClosing = true;
    // Wait for animation to complete before removing modal
    setTimeout(() => {
      this.activeModal = null;
      this.isClosing = false;
    }, 500); // Increased duration to ensure smooth animation
  }

  addToCalendar() {
    const calendarUrl = 'https://calendar.google.com/calendar/u/0/r/eventedit?text=The+Wedding+Of+Aliah+-+Harris&dates=20250512T030000Z/20250512T070000Z&details=The+Wedding+Of+Aliah++-++Harris&location=Kelab+Impiana+Kayangan+Heights&sprop&sprop=name:&pli=1';
    window.open(calendarUrl, '_blank');
  }

  makeCall(phoneNumber: string) {
    // Create tel: link to initiate phone call
    window.location.href = `tel:${phoneNumber}`;
  }

  openWhatsApp(phoneNumber: string) {
    // Create WhatsApp link (removes + and spaces from phone number)
    const cleanNumber = phoneNumber.replace(/[\s+()-]/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=Hi! I'm contacting you regarding Aliah & Harris's wedding.`;

    // Open WhatsApp in a new tab/window
    window.open(whatsappUrl, '_blank');
  }
  openGoogleMaps() {
    // Google Maps URL with coordinates
    const googleMapsUrl = 'https://www.google.com/maps/place/3.079934,101.5669504';

    // Open Google Maps in a new tab/window
    window.open(googleMapsUrl, '_blank');
  }

  openWaze() {
    // Waze URL with coordinates
    const wazeUrl = 'https://www.waze.com/live-map/directions?to=ll.3.079934%2C101.5669504';

    // Open Waze in a new tab/window
    window.open(wazeUrl, '_blank');
  }

  private showToastMessage(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  async submitRSVP() {
    try {
      await this.rsvpService.submitRSVP(this.rsvpForm);
      this.showToastMessage('Terima kasih! RSVP anda telah berjaya dihantar.', 'success');
      this.closeModal();

      // Reset form
      this.rsvpForm = {
        name: '',
        email: '',
        numberOfGuests: 1,
        attendanceStatus: 'Hadir',
        message: ''
      };

      // Reload wishes after a short delay
      setTimeout(() => {
        this.loadWishes();
      }, 1000);

    } catch (error) {
      console.error('Error submitting RSVP:', error);
      this.showToastMessage('Maaf, terdapat ralat. Sila cuba lagi.', 'error');
    }
  }

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

  ngOnDestroy() {
    if (this.largeMap) {
      this.largeMap.remove();
      this.largeMap = null;
    }
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  private startCountdown() {
    const weddingDate = new Date('2025-05-12T16:00:00'); // 4:00 PM on May 12, 2025

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
}
