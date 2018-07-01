import * as fs from 'fs';
import { bindNodeCallback, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';


export const accessAsObservable = bindNodeCallback(fs.access);

export const readFileAsObservable = bindNodeCallback((
    filename: string,
    encoding: string,
    callback: (error: Error, buffer: Buffer) => void,
) => fs.readFile(filename, encoding, callback));


export const readdirAsObservable = bindNodeCallback((
    dirname: string,
    callback: (error: Error, files: string[]) => void,
) => fs.readdir(dirname, callback));


export const writeFileAsObservable = bindNodeCallback((
    filename: string,
    value: string,
    encoding: string,
    callback: (error: Error) => void,
) => fs.writeFile(filename, value, callback));


export const mkdirAsObservable = bindNodeCallback(fs.mkdir);


export function ensureDirAsObservable(dirname: string): Observable<void> {
    return accessAsObservable(dirname)
        .pipe(
            catchError(() => mkdirAsObservable(dirname)),
        );
}
