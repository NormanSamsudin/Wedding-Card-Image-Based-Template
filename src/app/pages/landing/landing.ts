import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottomNavigation, NavigationItem } from '../../components/bottom-navigation/bottom-navigation';
import { ModalOverlay } from '../../components/modal-overlay/modal-overlay';

declare let L: any;

@Component({
  selector: 'app-landing',
  imports: [CommonModule, BottomNavigation, ModalOverlay],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing implements AfterViewInit {
  activeModal: string | null = null;
  backgroundImage = 'bg.png';
  private map: any;
  private readonly VENUE_LAT = 3.079934;
  private readonly VENUE_LNG = 101.5669504;

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

  onNavigationClick(item: NavigationItem) {
    this.activeModal = item.id;
  }

  closeModal() {
    this.activeModal = null;
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
}
