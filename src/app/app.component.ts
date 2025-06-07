import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    styles: [`
        :host {
            display: block;
            width: 100%;
            overflow-x: hidden;
            position: relative;
        }
    `],
    imports: [RouterOutlet],
    standalone: true
})
export class AppComponent {
    title = 'wedding-invitation';
} 