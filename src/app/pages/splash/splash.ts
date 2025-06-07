import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.html',
  styleUrls: ['./splash.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1s ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('1s ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class SplashComponent implements OnInit, AfterViewInit {
  @ViewChild('backgroundVideo') videoElement!: ElementRef<HTMLVideoElement>;

  constructor(private router: Router) { }

  ngOnInit() { }

  ngAfterViewInit() {
    // Ensure video plays when component is initialized
    if (this.videoElement && this.videoElement.nativeElement) {
      const video = this.videoElement.nativeElement;
      video.play().catch(error => {
        console.log('Video autoplay failed:', error);
        // Try playing with user interaction
        video.muted = true;
        video.play().catch(err => console.log('Video play failed:', err));
      });
    }
  }

  navigateToLanding() {
    this.router.navigate(['/landing']);
  }
}
