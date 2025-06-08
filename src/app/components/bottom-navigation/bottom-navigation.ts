import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MusicService } from '../../services/music.service';

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  isMusicButton?: boolean;
}

@Component({
  selector: 'app-bottom-navigation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-navigation.html',
  styleUrl: './bottom-navigation.css'
})
export class BottomNavigation implements OnInit {
  @Output() navigationClick = new EventEmitter<NavigationItem>();
  @Output() musicToggle = new EventEmitter<void>();

  selectedItem: string | null = null;
  isMusicPlaying = false;

  navigationItems: NavigationItem[] = [
    { id: 'home', label: 'Home', icon: 'fa-solid fa-house' },
    { id: 'wishes', label: 'Wishes', icon: 'fa-solid fa-heart' },
    { id: 'music', label: 'Music', icon: 'fa-solid fa-volume-high', isMusicButton: true },
    { id: 'photos', label: 'Photos', icon: 'fa-solid fa-camera' },
    { id: 'rsvp', label: 'RSVP', icon: 'fa-regular fa-envelope' }
  ];

  constructor(
    private router: Router,
    private musicService: MusicService
  ) { }

  ngOnInit() {
    // Set initial selected item based on current route
    this.setSelectedItemFromRoute();

    // Subscribe to route changes to update selected item
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.setSelectedItemFromRoute();
    });

    // Subscribe to music playing state
    this.musicService.isPlaying$.subscribe(isPlaying => {
      this.isMusicPlaying = isPlaying;
    });
  }

  private setSelectedItemFromRoute() {
    const currentRoute = this.router.url.split('/')[1] || 'landing';
    this.selectedItem = currentRoute === 'landing' ? 'home' : currentRoute;
  }

  onNavClick(item: NavigationItem) {
    if (item.isMusicButton) {
      this.onMusicToggle();
    } else {
      this.selectedItem = item.id;
      this.navigationClick.emit(item);
    }
  }

  onMusicToggle() {
    this.musicService.toggle();
    this.musicToggle.emit();
  }
}


