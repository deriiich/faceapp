import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FaceDetectionApiResponse } from '../models/faceDetection.model';
@Injectable({
    providedIn: 'root',
})

export class FaceDetectionService {

    private readonly apiUrl: string = '';

    constructor(private http: HttpClient) {
        const isLocal = window.location.hostname === 'localhost';
        this.apiUrl = isLocal ? '/api/detect' : 'https://faceapi-2snbrq2o3a-ue.a.run.app';
    }

    detectFaces(imageBase64: string): Observable<FaceDetectionApiResponse> {
        const requestBody = {
            sourceUrl: imageBase64,
        };
        const headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.post<FaceDetectionApiResponse>(this.apiUrl, requestBody, { headers });
    }
}
