import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottomNavigation, NavigationItem } from '../../components/bottom-navigation/bottom-navigation';
import { ModalOverlay } from '../../components/modal-overlay/modal-overlay';




@Component({
  selector: 'app-landing',
  imports: [CommonModule, BottomNavigation, ModalOverlay],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing {
  activeModal: string | null = null;

  backgroundImage = 'bg.png';

  ngOnInit() {
    // Optional: Set background dynamically
    document.body.style.backgroundImage = `url(${this.backgroundImage})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
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
}
