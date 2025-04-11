import { CommonModule } from '@angular/common';
import { AfterViewChecked, AfterViewInit, Component, computed, effect, ElementRef, HostListener, inject, signal, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbAlertConfig, NgbAlertModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImageStore } from '../../store/image.store';
import { ListComponent } from '../list/list.component';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { VerifiedImages } from '../../core/models/imageStore.model';

@Component({
    selector: 'app-image-input',
    imports: [ProgressBarComponent, CommonModule, FormsModule, NgbAlertModule, ListComponent],
    templateUrl: './image-input.component.html',
    styleUrls: ['./image-input.component.scss'],
    standalone: true,
})
export class ImageInputComponent implements AfterViewInit {
    @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('history', { static: false }) historyRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('fileInput', { static: false }) fileInputRef!: ElementRef;

    store = inject(ImageStore);
    imageSrc = '';
    content!: TemplateRef<any>;
    imageAspectRatio: number = 1;
    disableVerify = false;
    error = this.store.getError();
    alertType = computed(() => this.error()?.toLowerCase().includes('multiple') ? 'warning' : 'danger');
    // fileSize = computed(() => {
    //     const file = this.store.getFile();
    //     const size = this.convertToMb(file!.size);
    //     const name = file!.name;

    //     return {
    //         size,
    //         name
    //     };
    // });

    progressBarConfig = computed(() => ({
        text: this.store.getProgressBarText(),
        isIndeterminate: this.store.isProgressBarIndeterminate(),
        percent: this.store.uploadPercent(),
    }));

    results = computed(() => {
        const verifiedImages = this.store.getVerifiedImages();

        const results = verifiedImages.at(-1)?.results ?? [];
        const base64string = verifiedImages.at(-1)?.base64string;

        const mappedResults = results.map((r) => ({
            rectangle: r.rectangle,
            age: r.age,
            gender: r.gender,
        }));

        const error = verifiedImages.at(-1)?.error ?? null;
        return { mappedResults, error, base64string };
    });


    constructor(alertConfig: NgbAlertConfig) {
        alertConfig.dismissible = false;

        effect(() => {
            const { mappedResults, base64string } = this.results();
            if (mappedResults.length > 0 && base64string) {
                // requestAnimationFrame(() => {
                //     this.drawCanvas(mappedResults, base64string);
                // });

            }
        });
    }


    // @HostListener('window:resize', ['$event'])
    // onResize(event: Event): void {
    //     if (this.canvasRef?.nativeElement) {
    //         this.updateCanvasSize();
    //         if (this.results().mappedResults.length > 0 && this.results().base64string) {
    //             this.drawCanvas(this.results().mappedResults, this.results().base64string);
    //         }
    //     }
    // }

    ngAfterViewInit(): void {
        // setTimeout(() => {
        //     if (this.canvasRef?.nativeElement) {
        //         this.updateCanvasSize();
        //     }
        // }, 1000);
    }

    triggerFileInput(): void {
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        fileInput?.click();
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];

        if (file) {
            const verifiedImages = this.store.getVerifiedImages();
            this.disableVerify = verifiedImages.some(x => x.file === file);

            this.store.onUploadImage(file);
            this.uploadFileProgress(file);
        }
    }

    uploadFileProgress(file: File): void {
        let percent = this.store.uploadPercent();
        const uploadInterval = setInterval(() => {
            if (percent < 100) {
                percent += 10;
                this.store.onUploadProgress(percent);

            } else {
                clearInterval(uploadInterval);
                if (this.isFileSizeLimit(file)) {
                    this.store.onUploadFailed();
                }
                this.previewImage(file);
            }
        }, 150);
    }

    previewImage(file: File): void {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.imageSrc = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    drawCanvas(results: any[], imageSrc?: string): void {

        if (!this.canvasRef.nativeElement) return;

        const canvas = this.canvasRef.nativeElement;
        const ctx = canvas.getContext('2d');
        if (!ctx || !this.imageSrc) return;

        const img = new Image();
        img.onload = () => {
            this.imageAspectRatio = img.naturalWidth / img.naturalHeight;
            this.updateCanvasSize();

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            results.forEach(({ rectangle, age, gender }) => {
                const x = rectangle.left * (canvas.width / img.naturalWidth);
                const y = rectangle.top * (canvas.height / img.naturalHeight);
                const width = (rectangle.right - rectangle.left) * (canvas.width / img.naturalWidth);
                const height = (rectangle.bottom - rectangle.top) * (canvas.height / img.naturalHeight);

                ctx.beginPath();
                ctx.rect(x, y, width, height);
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#00ff00';
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.font = '14px Arial';

                const ageText = `Age: ${age}`;
                const genderText: string = `Gender: ${gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase()}`;

                ctx.fillText(ageText, x, y - 30);
                ctx.fillText(genderText, x, y - 15);
            });
        };
        img.src = imageSrc!;
    }

    updateCanvasSize(): void {
        if (!this.canvasRef.nativeElement) return;

        const canvas = this.canvasRef.nativeElement;
        const parentElement = canvas.parentElement;

        if (!parentElement) return;

        const parentWidth = parentElement.clientWidth;
        const displayWidth = parentWidth;
        const displayHeight = displayWidth / this.imageAspectRatio;

        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;

        canvas.width = displayWidth;
        canvas.height = displayHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {

            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
    }

    verifyImage(content: TemplateRef<any>): void {
        this.content = content;
        if (this.error()) return;
        this.store.onVerifyImage();
    }

    onImageSelected(obj: VerifiedImages): void {
        if (!obj || obj.file === this.store.getFile()) {
            return;
        }

        this.store.setSelectedImage(obj);
        // this.imageSrc.set(obj.base64string);

        requestAnimationFrame(() => {
            this.drawCanvas(obj?.results, obj?.base64string);
        });
    }

    discard() {
        // this.imageSrc.set('');
        this.store.reInitialize();
        this.fileInputRef.nativeElement.value = '';
    }

    isFileSizeLimit(file: File) {
        return file.size > 150000;
    }

    convertToMb(fileSize: number): string {
        return fileSize < 1024 * 1024
            ? `${(fileSize / 1024).toFixed(2)} KB`
            : `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;
    }
}
