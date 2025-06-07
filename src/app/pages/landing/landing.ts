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
  templateUrl: './landing.html',
  styleUrl: './landing.css',
  standalone: true,
  imports: [CommonModule, FormsModule, BottomNavigation, ScrollAnimationDirective]
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

  // RSVP Form
  rsvpForm: RSVPForm = {
    name: '',
    email: '',
    numberOfGuests: 1,
    attendanceStatus: 'Hadir',
    message: ''
  };

  constructor(public rsvpService: RSVPFirebaseService, private router: Router) {
    this.loadWishes();
  }

  ngOnInit() {
    // Optional: Set background dynamically
    document.body.style.backgroundImage = `url(${this.backgroundImage})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  }

  ngAfterViewInit() {
    // Initialize map after view is initialized
    setTimeout(() => {
      this.initMap();
    }, 1000); // Delay to ensure the map container is rendered

    // Start playing music when the page loads
    this.playBackgroundMusic();
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (!this.hasUserInteracted && this.backgroundMusic && this.backgroundMusic.nativeElement) {
      this.hasUserInteracted = true;
      this.backgroundMusic.nativeElement.muted = false;
      this.playBackgroundMusic();
    }
  }

  playBackgroundMusic() {
    if (this.backgroundMusic && this.backgroundMusic.nativeElement) {
      // Try to play the music
      const playPromise = this.backgroundMusic.nativeElement.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isMusicPlaying = true;
          })
          .catch(error => {
            console.error('Error playing background music:', error);
            this.isMusicPlaying = true; // Keep music state as playing even if autoplay fails
          });
      }
    }
  }

  toggleMusic() {
    if (this.backgroundMusic && this.backgroundMusic.nativeElement) {
      if (this.isMusicPlaying) {
        this.backgroundMusic.nativeElement.pause();
      } else {
        this.backgroundMusic.nativeElement.play();
      }
      this.isMusicPlaying = !this.isMusicPlaying;
    }
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
      case 'calendar':
        this.router.navigate(['/calendar']);
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
    if (this.backgroundMusic) {
      this.backgroundMusic.nativeElement.pause();
      this.backgroundMusic.nativeElement.src = '';
    }
    if (this.largeMap) {
      this.largeMap.remove();
      this.largeMap = null;
    }
  }
}
