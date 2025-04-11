export interface FaceDetectionResult {
    rectangle: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    confidence: number;
    age: number;
    ageHigh: number;
    ageLow: number;
    gender: string;
}

export interface FaceDetectionApiResponse {
    results: FaceDetectionResult[];
    error?: string;
}