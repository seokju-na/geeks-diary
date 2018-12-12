import { Injectable, NgZone } from '@angular/core';
import {
    copy,
    CopyOptions,
    ensureDir,
    pathExists,
    readdir,
    readFile,
    readJson,
    rename,
    writeFile,
    writeJson,
} from 'fs-extra';
import { from, Observable } from 'rxjs';
import { enterZone } from '../../libs/rx';


@Injectable()
export class FsService {
    constructor(private ngZone: NgZone) {
    }

    isPathExists(path: string): Observable<boolean> {
        return from(pathExists(path)).pipe(enterZone(this.ngZone));
    }

    readFile(fileName: string): Observable<string> {
        return from(readFile(fileName, 'utf8'))
            .pipe(enterZone(this.ngZone));
    }

    /**
     * Read json file and parse it to generic type.
     * If fail with parsing JSON, 'null' value will be out.
     * @param {string} fileName
     */
    readJsonFile<T>(fileName: string): Observable<T | null> {
        return from(readJson(fileName, { throws: false }))
            .pipe(enterZone(this.ngZone));
    }

    readDirectory(dirName: string): Observable<string[]> {
        return from(readdir(dirName)).pipe(enterZone(this.ngZone));
    }

    writeFile(fileName: string, value: string): Observable<void> {
        return from(writeFile(fileName, value, 'utf8'))
            .pipe(enterZone(this.ngZone));
    }

    writeJsonFile<T>(fileName: string, value: T): Observable<void> {
        return from(writeJson(fileName, value)).pipe(enterZone(this.ngZone));
    }

    copyFile(src: string, dest: string, options?: CopyOptions): Observable<void> {
        return from(copy(src, dest, options)).pipe(enterZone(this.ngZone));
    }

    ensureDirectory(dirName: string): Observable<void> {
        return from(ensureDir(dirName)).pipe(enterZone(this.ngZone));
    }

    renameFile(oldFileName: string, newFileName: string): Observable<void> {
        return from(rename(oldFileName, newFileName)).pipe(enterZone(this.ngZone));
    }
}
