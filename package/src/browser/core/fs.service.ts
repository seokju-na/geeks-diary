import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import {
    accessAsObservable,
    ensureDirAsObservable,
    mkdirAsObservable,
    readdirAsObservable,
    readFileAsObservable,
    writeFileAsObservable,
} from '../../libs/fs';
import { enterZone } from '../../libs/rx';


@Injectable({
    providedIn: 'root',
})
export class FsService {
    constructor(private ngZone: NgZone) {
    }

    access(path: string): Observable<void> {
        return accessAsObservable(path).pipe(
            mapTo(null),
            enterZone(this.ngZone),
        );
    }

    readFile(fileName: string): Observable<Buffer> {
        return readFileAsObservable(fileName, 'utf8').pipe(enterZone(this.ngZone));
    }

    readDirectory(dirName: string): Observable<string[]> {
        return readdirAsObservable(dirName).pipe(enterZone(this.ngZone));
    }

    writeFile(fileName: string, value: string): Observable<void> {
        return writeFileAsObservable(fileName, value, 'utf8').pipe(enterZone(this.ngZone));
    }

    makeDirectory(dirName: string): Observable<void> {
        return mkdirAsObservable(dirName).pipe(
            mapTo(null),
            enterZone(this.ngZone),
        );
    }

    ensureDirectory(dirName: string): Observable<void> {
        return ensureDirAsObservable(dirName).pipe(enterZone(this.ngZone));
    }
}
