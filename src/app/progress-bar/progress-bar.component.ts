import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { ProgressBarConfig } from '../../core/models/progressBarConfig.model';
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-progress-bar',
    imports: [CommonModule, NgbProgressbarModule],
    templateUrl: './progress-bar.component.html',
    styleUrl: './progress-bar.component.scss'
})
export class ProgressBarComponent {
    progressBarConfig = input.required<Partial<ProgressBarConfig>>();

    text = computed(() => this.progressBarConfig().text);
    percent = computed(() => this.progressBarConfig().percent ?? 0);
    isIndeterminate = computed(() => this.progressBarConfig().isIndeterminate);

    constructor() {
    }
}
