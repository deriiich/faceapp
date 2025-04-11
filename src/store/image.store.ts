import { computed, effect, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { getState, patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { catchError, of, tap } from 'rxjs';
import { FaceDetectionApiResponse } from '../core/models/faceDetection.model';
import { ImageState, VerifiedImages } from '../core/models/imageStore.model';
import { FaceDetectionService } from '../core/services/face-detection-service';
import { FileConvertService } from '../core/utils/file-convert.service';

const initialState: ImageState = {
    uploadPercent: 0,
    isLoading: false,
    isProgressBarIndeterminate: false,
    isVerified: false,
    uploadPhase: 'browser',
    _id: 1,
    _file: null,
    _base64string: '',
    _verifiedImages: [],
    _currentError: null,
    selectedImageId: 1,
    showCanvas: false
}

export const ImageStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withProps((store, faceDetectionService = inject(FaceDetectionService)) => {
        return {
            _verifiedImage: rxResource<FaceDetectionApiResponse, string>({
                request: store._base64string,
                loader: (params) => {
                    const { request: req } = params;

                    if (!store._file()) return of({ results: [] });

                    return faceDetectionService.detectFaces(req).pipe(
                        tap((response) => {

                            if (response.results.length === 0) {
                                patchState(store, {
                                    isLoading: false,
                                    _currentError: 'No Face Detected'
                                })

                                return;
                            }
                            patchState(store, {
                                isLoading: false,
                                showCanvas: true,
                                isVerified: response.results.length > 0,
                                _verifiedImages: [
                                    ...store._verifiedImages(),
                                    {
                                        id: store._id(),
                                        file: store._file(),
                                        base64string: store._base64string(),
                                        results: response.results.map(result => ({
                                            rectangle: result.rectangle,
                                            age: result.age,
                                            gender: result.gender
                                        })),
                                        error: response.results.length > 1 ? 'Multiple Face Detected' : '',
                                        isVerified: response.results?.length > 0,
                                    }
                                ],
                                _id: store._id() + 1,
                                _currentError: response.results.length > 1 ? 'Multiple Face Detected' : null
                            });
                        }),
                        catchError((error) => {
                            let errorMessage: string = '';

                            switch (error.status) {
                                case 404: {
                                    errorMessage = '404 Error during face verification.';
                                } break;

                                case 401: {
                                    errorMessage = '401 Error during face verification.';
                                } break;

                                case 422: {
                                    errorMessage = '422 No Face Detected.';
                                } break;

                                default: {
                                    errorMessage = 'Something went wrong with the verification';
                                } break;
                            }

                            patchState(store, {
                                isLoading: false,
                                _currentError: errorMessage,
                                uploadPercent: 0,
                                uploadPhase: 'browser',
                                _base64string: ''
                            });
                            return of({ results: [] });
                        })
                    );
                }
            })
        };
    }),

    withComputed((store) => ({
        getFile: computed(() => store._file()),
        getProgressBarText: computed(() => {
            const percent = store.uploadPercent();
            const phase = store.uploadPhase();

            return phase === 'browser' ? `Uploading ${percent}%` : 'Verifying';
        }),
        getVerifiedImages: computed(() => store._verifiedImages()),
        isVerifying: computed(() => store.uploadPhase() === 'verifying'),
        getError: computed(() => store._currentError),
        getSelectedImage: computed(() => store._verifiedImages().filter(images => images.id === store.selectedImageId())),
    })),

    withMethods((store, fileConvertService = inject(FileConvertService)) => ({
        onUploadImage(file: File) {
            this.reInitialize();
            patchState(store, {
                _file: file,
                isLoading: true,
                uploadPercent: 0,
                uploadPhase: 'browser',
                _currentError: null,
            });
        },

        onUploadProgress(uploadPercent: number) {
            patchState(store, {
                uploadPercent,
                isLoading: uploadPercent < 100,
                isProgressBarIndeterminate: false,
            })
        },

        async onVerifyImage() {
            const file = store._file()
            if (file && !store.isVerifying()) {
                const base64string = await fileConvertService.convertToBase64(file);

                patchState(store, {
                    uploadPhase: 'verifying',
                    isLoading: true,
                    _base64string: base64string
                });
            }
        },

        onUploadFailed() {
            patchState(store, {
                isLoading: false,
                _currentError: 'Maximum Size Reached'
            });
        },

        reInitialize() {
            patchState(store, {
                uploadPercent: 0,
                isLoading: false,
                isProgressBarIndeterminate: false,
                uploadPhase: 'browser',
                _file: null,
                _currentError: null,
                isVerified: false,
                showCanvas: false,
                selectedImageId: 1,
            })
        },

        setSelectedImage(selectedImage: VerifiedImages) {
            patchState(store, {
                selectedImageId: selectedImage.id,
                _file: selectedImage.file,
                _currentError: selectedImage.error,
                isLoading: true
            })

            setTimeout(() => {
                patchState(store, {
                    isLoading: false,
                    showCanvas: true
                })
            }, 500);
        }
    })),

    withHooks({
        onInit(store) {
            effect(() => {
                const state = getState(store);
                console.log('STORE EFFECT', state);
            })
        },
    })
);
