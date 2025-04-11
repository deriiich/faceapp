export type ImageState = {
    uploadPercent: number;
    isLoading: boolean;
    isProgressBarIndeterminate: boolean;
    isVerified: boolean;
    uploadPhase: 'browser' | 'verifying';
    _id: number;
    _file: File | null;
    _base64string: any;
    _verifiedImages: VerifiedImages[];
    _currentError: string | null;
    selectedImageId: number | null;
    showCanvas: boolean;
}

export type VerifiedImages = {
    id: number;
    base64string: string;
    file: File | null;
    results: Array<{
        rectangle: {
            left: number;
            top: number;
            right: number;
            bottom: number;
        };
        age: number;
        gender: string;
    }>;
    error?: string;
    isVerified: boolean;
}