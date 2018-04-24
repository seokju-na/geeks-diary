import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
    accessAsObservable,
    ensureDirAsObservable,
    mkdirAsObservable,
    readdirAsObservable,
    readFileAsObservable,
    writeFileAsObservable,
} from '../../common/fs-helpers';


@Injectable()
export class FsService {
    access(path: string): Observable<void> {
        return accessAsObservable(path);
    }

    readFile(fileName: string, encoding = 'utf8'): Observable<Buffer> {
        return readFileAsObservable(fileName, encoding);
    }

    readDirectory(dirName: string): Observable<string[]> {
        return readdirAsObservable(dirName);
    }

    writeFile(fileName: string, value: string, encoding = 'utf8'): Observable<void> {
        return writeFileAsObservable(fileName, value, encoding);
    }

    makeDirectory(dirName: string): Observable<void> {
        return mkdirAsObservable(dirName);
    }

    ensureDirectory(dirName: string): Observable<void> {
        return ensureDirAsObservable(dirName);
    }
}
