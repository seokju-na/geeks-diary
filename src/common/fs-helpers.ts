import * as fs from 'fs';
import { Observable } from 'rxjs/Observable';
import { bindNodeCallback } from 'rxjs/observable/bindNodeCallback';
import { catchError } from 'rxjs/operators';
import { promisify } from 'util';


export const accessAsObservable = bindNodeCallback(fs.access, () => null);
export const accessAsPromise = promisify(fs.access);

export const readFileAsObservable = bindNodeCallback((
    filename: string,
    encoding: string,
    callback: (error: Error, buffer: Buffer) => void,
) => fs.readFile(filename, encoding, callback));
export const readFileAsPromise = promisify(fs.readFile);


export const readdirAsObservable = bindNodeCallback((
    dirname: string,
    callback: (error: Error, files: string[]) => void,
) => fs.readdir(dirname, callback));


export const writeFileAsObservable = bindNodeCallback<void>((
    filename: string,
    value: string,
    encoding: string,
    callback: (error: Error) => void,
) => fs.writeFile(filename, value, callback));
export const writeFileAsPromise = promisify(fs.writeFile);


export const mkdirAsObservable = bindNodeCallback(fs.mkdir, () => null);


export function ensureDirAsObservable(dirname: string): Observable<void> {
    return accessAsObservable(dirname)
        .pipe(
            catchError(() => mkdirAsObservable(dirname)),
        );
}
