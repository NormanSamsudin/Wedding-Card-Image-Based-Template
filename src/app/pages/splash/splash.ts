import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash.html',
  styleUrls: ['./splash.css']
})
export class SplashComponent implements OnInit {
  slideUp = false;

  constructor(private router: Router) { }

  ngOnInit() {
    // Preload landing images
    this.preloadImage('/akak/landing_top.jpg');
    this.preloadImage('/akak/landing_middle.jpg');

    setTimeout(() => {
      this.slideUp = true;
      setTimeout(() => {
        this.router.navigate(['/landing']);
      }, 4000); // animation duration (5s)
    }, 6000); // how long splash stays before animating (1s)
  }

  preloadImage(src: string) {
    const img = new window.Image();
    img.src = src;
  }
}
