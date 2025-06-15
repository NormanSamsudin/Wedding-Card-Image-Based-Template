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
        animate('1.5s ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('1.5s ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class SplashComponent implements OnInit, AfterViewInit {
  @ViewChild('backgroundVideo') videoElement!: ElementRef<HTMLVideoElement>;

  constructor(private router: Router) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.setupVideo();
  }

  private setupVideo() {
    if (this.videoElement && this.videoElement.nativeElement) {
      const video = this.videoElement.nativeElement;
      video.playbackRate = 1;

      // Handle autoplay with sound muted
      video.play().catch(error => {
        console.log('Autoplay failed:', error);
        // Try to play with muted sound
        video.muted = true;
        video.play();
      });

      // Add event listener for video end
      video.addEventListener('ended', () => {
        this.navigateToLanding();
      });
    }
  }

  onVideoEnd() {
    this.navigateToLanding();
  }

  navigateToLanding() {
    this.router.navigate(['/landing']);
  }
}
