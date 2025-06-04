import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';


@Component({
  selector: 'app-splash',
  imports: [],
  templateUrl: './splash.html',
  styleUrl: './splash.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1.5s', style({ opacity: 1 }))  // Animation for fading in the text
      ]),
    ]),
    trigger('fadeOut', [
      transition(':leave', [
        style({ opacity: 1 }),
        animate('1s', style({ opacity: 0 }))  // Animation for fading out when transitioning
      ]),
    ])
  ]
})
export class Splash {
  constructor(private router: Router) {}

  navigateToLanding(): void {
    this.router.navigate(['/landing']);  // Navigate to the landing page
  }
}
