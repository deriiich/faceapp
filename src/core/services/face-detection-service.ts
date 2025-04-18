import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FaceDetectionApiResponse } from '../models/faceDetection.model';
import { environment } from '@environments/environment.prod';
@Injectable({
    providedIn: 'root',
})

export class FaceDetectionService {

    private readonly apiUrl: string = environment.apiUrl;

    constructor(private http: HttpClient) {
    }

    detectFaces(imageBase64: string): Observable<FaceDetectionApiResponse> {
        const requestBody = {
            sourceUrl: imageBase64,
        };
        const headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this.http.post<FaceDetectionApiResponse>(this.apiUrl, requestBody, { headers });
    }
}
