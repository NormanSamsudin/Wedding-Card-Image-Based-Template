import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottomNavigation } from '../../components/bottom-navigation/bottom-navigation';
import { Router } from '@angular/router';
import { RSVPFirebaseService, RSVPData } from '../../services/rsvp-firebase.service';
import { Timestamp } from 'firebase/firestore';

interface WishData {
    name: string;
    message: string;
    timestamp: Date;
}

@Component({
    selector: 'app-wishes',
    standalone: true,
    imports: [CommonModule, BottomNavigation],
    templateUrl: './wishes.html',
    styleUrl: './wishes.css'
})
export class WishesPage implements OnInit {
    wishes: WishData[] = [];
    isLoadingWishes = true;

    constructor(
        private router: Router,
        private rsvpService: RSVPFirebaseService
    ) { }

    ngOnInit() {
        this.loadWishes();
    }

    async loadWishes() {
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

    onNavigationClick(item: any) {
        switch (item.id) {
            case 'home':
                this.router.navigate(['/landing']);
                break;
            case 'calendar':
                this.router.navigate(['/calendar']);
                break;
            case 'rsvp':
                this.router.navigate(['/rsvp']);
                break;
        }
    }

    toggleMusic() {
        // Implement music toggle functionality
    }
} 