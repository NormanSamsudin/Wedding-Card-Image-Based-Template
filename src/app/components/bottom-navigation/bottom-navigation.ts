import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-bottom-navigation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-navigation.html',
  styleUrl: './bottom-navigation.css'
})
export class BottomNavigation {
  @Output() navigationClick = new EventEmitter<NavigationItem>();

  navigationItems: NavigationItem[] = [
    { id: 'calendar', label: 'Calendar', icon: 'fas fa-calendar-alt' },
    { id: 'contact', label: 'Contact', icon: 'fas fa-phone' },
    { id: 'location', label: 'Location', icon: 'fas fa-map-marker-alt' },
    { id: 'rsvp', label: 'RSVP', icon: 'fas fa-envelope' },
    // { id: 'song', label: 'Song', icon: 'fas fa-music' }
  ];

  onNavClick(item: NavigationItem) {
    this.navigationClick.emit(item);
  }
}


