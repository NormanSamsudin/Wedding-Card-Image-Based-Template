import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BottomNavigation } from '../../components/bottom-navigation/bottom-navigation';
import { Router } from '@angular/router';
import { RSVPFirebaseService } from '../../services/rsvp-firebase.service';
import { MusicService } from '../../services/music.service';

interface RSVPForm {
    name: string;
    email: string;
    numberOfGuests: number;
    attendanceStatus: 'Hadir' | 'Tidak Hadir';
    message: string;
}

@Component({
    selector: 'app-rsvp',
    standalone: true,
    imports: [CommonModule, FormsModule, BottomNavigation],
    template: `
        <div class="rsvp-page">
            <div class="rsvp-container">
                <h2>RSVP</h2>
                <p>Please let us know if you can make it!</p>

                <!-- Loading Overlay -->
                <div class="loading-overlay" *ngIf="rsvpService.loading$ | async">
                    <div class="loading-spinner"></div>
                </div>

                <!-- Success/Error Message -->
                <div class="message-overlay" *ngIf="rsvpService.message$ | async as message"
                    [class.success]="message.type === 'success'" [class.error]="message.type === 'error'">
                    {{ message.text }}
                </div>

                <form class="rsvp-form" (ngSubmit)="submitRSVP()" #rsvpFormRef="ngForm">
                    <div class="form-group">
                        <input type="text" [(ngModel)]="rsvpForm.name" name="name" placeholder="Nama Penuh" required>
                    </div>
                    <div class="form-group">
                        <input type="email" [(ngModel)]="rsvpForm.email" name="email" placeholder="Emel" required>
                    </div>
                    <div class="form-group">
                        <div class="radio-group">
                            <label>
                                <input type="radio" name="attendanceStatus" value="Hadir"
                                    [(ngModel)]="rsvpForm.attendanceStatus">
                                Hadir
                            </label>
                            <label>
                                <input type="radio" name="attendanceStatus" value="Tidak Hadir"
                                    [(ngModel)]="rsvpForm.attendanceStatus">
                                Tidak Hadir
                            </label>
                        </div>
                    </div>
                    <div class="form-group" *ngIf="rsvpForm.attendanceStatus === 'Hadir'">
                        <select [(ngModel)]="rsvpForm.numberOfGuests" name="numberOfGuests" required>
                            <option value="1">1 Orang</option>
                            <option value="2">2 Orang</option>
                            <option value="3">3 Orang</option>
                            <option value="4">4 Orang</option>
                        </select>
                    </div>
                    <div class="form-group" *ngIf="rsvpForm.attendanceStatus === 'Hadir'">
                        <textarea [(ngModel)]="rsvpForm.message" name="message"
                            placeholder="Ucapan kepada pengantin"></textarea>
                    </div>
                    <button type="submit" class="submit-btn" [disabled]="rsvpService.loading$ | async">Hantar RSVP</button>
                </form>
            </div>

            <!-- Bottom Navigation -->
            <app-bottom-navigation (navigationClick)="onNavigationClick($event)" (musicToggle)="toggleMusic()">
            </app-bottom-navigation>
        </div>
    `,
    styles: [`
        .rsvp-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            background: #fff;
            padding: 20px;
            width: 100%;
            max-width: 100%;
            margin: 0;
            overflow-x: hidden;
            position: relative;
        }

        .rsvp-container {
            flex: 1;
            padding: 20px;
            background: #fff;
            border-radius: 0;
            box-shadow: none;
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
            box-sizing: border-box;
            overflow-x: hidden;
        }

        .rsvp-container h2 {
            font-size: 2em;
            color: #b76e79;
            text-align: center;
            margin-bottom: 10px;
            width: 100%;
        }

        .rsvp-container p {
            color: #666;
            text-align: center;
            margin-bottom: 30px;
            width: 100%;
        }

        .rsvp-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
            width: 100%;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 100%;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 1em;
            transition: border-color 0.3s ease;
            width: 100%;
            box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            border-color: #b76e79;
            outline: none;
        }

        .radio-group {
            display: flex;
            gap: 20px;
            width: 100%;
        }

        .radio-group label {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
        }

        .radio-group input[type="radio"] {
            width: 18px;
            height: 18px;
            accent-color: #b76e79;
        }

        textarea {
            min-height: 100px;
            resize: vertical;
        }

        .submit-btn {
            background: #b76e79;
            color: white;
            border: none;
            padding: 15px;
            border-radius: 8px;
            font-size: 1.1em;
            cursor: pointer;
            transition: background-color 0.3s ease;
            width: 100%;
        }

        .submit-btn:hover {
            background: #a55d67;
        }

        .submit-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }

        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #b76e79;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        .message-overlay {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 30px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideDown 0.3s ease-out;
        }

        .message-overlay.success {
            background: #4caf50;
        }

        .message-overlay.error {
            background: #f44336;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes slideDown {
            from { transform: translate(-50%, -100%); }
            to { transform: translate(-50%, 0); }
        }

        @media (max-width: 480px) {
            .rsvp-page {
                padding: 20px;
            }

            .rsvp-container {
                padding: 20px;
                max-width: 360px;
            }

            .radio-group {
                flex-direction: column;
                gap: 10px;
            }
        }
    `]
})
export class RsvpComponent implements OnInit {
    rsvpForm: RSVPForm = {
        name: '',
        email: '',
        numberOfGuests: 1,
        attendanceStatus: 'Hadir',
        message: ''
    };

    constructor(
        private router: Router,
        public rsvpService: RSVPFirebaseService,
        private musicService: MusicService
    ) { }

    ngOnInit() {
        // Initialize any RSVP-specific logic here
    }

    onNavigationClick(item: any) {
        switch (item.id) {
            case 'home':
                this.router.navigate(['/landing']);
                break;
            case 'wishes':
                this.router.navigate(['/wishes']);
                break;
            case 'photos':
                this.router.navigate(['/photos']);
                break;
            case 'rsvp':
                // Already on RSVP page
                break;
        }
    }

    toggleMusic() {
        this.musicService.toggle();
    }

    async submitRSVP() {
        try {
            await this.rsvpService.submitRSVP(this.rsvpForm);
            this.rsvpForm = {
                name: '',
                email: '',
                numberOfGuests: 1,
                attendanceStatus: 'Hadir',
                message: ''
            };
        } catch (error) {
            console.error('Error submitting RSVP:', error);
        }
    }
} 