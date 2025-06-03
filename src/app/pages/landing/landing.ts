import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Footer } from '../../components/footer/footer';


@Component({
  selector: 'app-landing',
  imports: [RouterLink, Footer],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing {
  constructor(private router: Router) {}

  navigateToRSVP() {
    // Navigate to RSVP page or open external form
    this.router.navigate(['/rsvp']);
  }
}
