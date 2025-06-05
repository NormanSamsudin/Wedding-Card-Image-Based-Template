import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
    selector: '[appScrollAnimation]',
    standalone: true
})
export class ScrollAnimationDirective implements OnInit {
    constructor(private el: ElementRef) { }

    ngOnInit() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    // Unobserve after animation is triggered
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1, // Trigger when 10% of the element is visible
            rootMargin: '0px'
        });

        observer.observe(this.el.nativeElement);
    }
} 