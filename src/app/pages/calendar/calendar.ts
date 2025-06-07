import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottomNavigation } from '../../components/bottom-navigation/bottom-navigation';
import { Router } from '@angular/router';

@Component({
    selector: 'app-calendar',
    standalone: true,
    imports: [CommonModule, BottomNavigation],
    templateUrl: './calendar.html',
    styleUrl: './calendar.css'
})
export class CalendarComponent implements OnInit {
    constructor(private router: Router) { }

    ngOnInit() {
        // Initialize any calendar-specific logic here
    }

    onNavigationClick(item: any) {
        switch (item.id) {
            case 'home':
                this.router.navigate(['/landing']);
                break;
            case 'wishes':
                this.router.navigate(['/wishes']);
                break;
            case 'calendar':
                // Already on calendar page
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