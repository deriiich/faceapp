import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { VerifiedImages } from '../../core/models/imageStore.model';

@Component({
    selector: 'app-list',
    imports: [CommonModule],
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss'
})
export class ListComponent {
    verifiedImages = input.required<VerifiedImages[]>();
    onImageClick = output<VerifiedImages>();
}
