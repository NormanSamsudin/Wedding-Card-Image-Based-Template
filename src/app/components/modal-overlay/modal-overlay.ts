import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-modal-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-overlay.html',
  styleUrl: './modal-overlay.css',
  animations: [
    trigger('slideUp', [
      state('closed', style({
        transform: 'translateY(100%)',
        opacity: 0
      })),
      state('open', style({
        transform: 'translateY(0)',
        opacity: 1
      })),
      transition('closed => open', animate('300ms ease-out')),
      transition('open => closed', animate('250ms ease-in'))
    ]),
    trigger('backdrop', [
      state('closed', style({
        opacity: 0
      })),
      state('open', style({
        opacity: 1
      })),
      transition('closed => open', animate('300ms ease-out')),
      transition('open => closed', animate('250ms ease-in'))
    ])
  ],
})

export class ModalOverlay implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title = '';
  @Output() close = new EventEmitter<void>();

  ngOnInit() {
    if (this.isOpen) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  closeModal() {
    document.body.style.overflow = '';
    this.close.emit();
  }

  stopPropagation(event: Event) {
    event.stopPropagation();

  }
}

