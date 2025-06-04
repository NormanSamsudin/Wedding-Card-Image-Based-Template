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
}
