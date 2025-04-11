import { Component } from '@angular/core';
import { ImageInputComponent } from './image-input/image-input.component';

@Component({
    selector: 'app-root',
    imports: [ImageInputComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    title = 'faceapp';
}
