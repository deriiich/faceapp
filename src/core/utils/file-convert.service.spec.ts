import { TestBed } from '@angular/core/testing';

import { FileConvertService } from './file-convert.service';

describe('FileConvertService', () => {
    let service: FileConvertService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FileConvertService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
