import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface RSVPForm {
  name: string;
  email: string;
  familyNumber: number;
  attending: boolean;
  dietaryRestrictions: string;
  message: string;
}

@Component({
  selector: 'app-rsvp',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './rsvp.html',
  styleUrl: './rsvp.css'
})
export class RSVP {
  rsvpForm: RSVPForm = {
    name: '',
    email: '',
    familyNumber: 1,
    attending: true,
    dietaryRestrictions: '',
    message: ''
  };

  isSubmitted = false;
  isLoading = false;

  constructor(private router: Router) {}

  onSubmit() {
    if (this.isValidForm()) {
      this.isLoading = true;
      
      // Simulate form submission
      setTimeout(() => {
        console.log('RSVP Form Submitted:', this.rsvpForm);
        this.isLoading = false;
        this.isSubmitted = true;
      }, 1500);
    }
  }

  isValidForm(): boolean {
    return this.rsvpForm.name.trim() !== '' && 
           this.rsvpForm.email.trim() !== '' && 
           this.rsvpForm.familyNumber > 0;
  }

  goBackToInvitation() {
    this.router.navigate(['/']);
  }

  resetForm() {
    this.rsvpForm = {
      name: '',
      email: '',
      familyNumber: 1,
      attending: true,
      dietaryRestrictions: '',
      message: ''
    };
    this.isSubmitted = false;
  }
}