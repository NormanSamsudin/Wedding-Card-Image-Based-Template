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
  @Output() musicToggle = new EventEmitter<void>();

  selectedItem: string | null = null;
  isMusicPlaying = false;

  navigationItems: NavigationItem[] = [
    { id: 'calendar', label: 'Calendar', icon: 'fa-regular fa-calendar' },
    { id: 'rsvp', label: 'RSVP', icon: 'fa-regular fa-envelope' }
  ];

  onNavClick(item: NavigationItem) {
    this.selectedItem = item.id;
    this.navigationClick.emit(item);
  }

  onMusicToggle() {
    this.isMusicPlaying = !this.isMusicPlaying;
    this.musicToggle.emit();
  }
}


