import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
    accessAsObservable,
    ensureDirAsObservable,
    mkdirAsObservable,
    readdirAsObservable,
    readFileAsObservable,
    writeFileAsObservable,
} from '../../common/fs-helpers';
import { enterZone } from '../../common/rx-helpers';


@Injectable()
export class FsService {
    constructor(private ngZone: NgZone) {
    }

    access(path: string): Observable<void> {
        return accessAsObservable(path).pipe(enterZone(this.ngZone));
    }

    readFile(fileName: string, encoding = 'utf8'): Observable<Buffer> {
        return readFileAsObservable(fileName, encoding).pipe(enterZone(this.ngZone));
    }

    readDirectory(dirName: string): Observable<string[]> {
        return readdirAsObservable(dirName).pipe(enterZone(this.ngZone));
    }

    writeFile(fileName: string, value: string, encoding = 'utf8'): Observable<void> {
        return writeFileAsObservable(fileName, value, encoding).pipe(enterZone(this.ngZone));
    }

    makeDirectory(dirName: string): Observable<void> {
        return mkdirAsObservable(dirName).pipe(enterZone(this.ngZone));
    }

    ensureDirectory(dirName: string): Observable<void> {
        return ensureDirAsObservable(dirName).pipe(enterZone(this.ngZone));
    }
}
