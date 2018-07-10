import * as fs from 'fs';
import { bindNodeCallback, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { promisify } from 'util';


export const accessAsObservable = bindNodeCallback(fs.access);
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
export const readdirAsPromise = promisify(fs.readdir);


export const writeFileAsObservable = bindNodeCallback((
    filename: string,
    value: string,
    encoding: string,
    callback: (error: Error) => void,
) => fs.writeFile(filename, value, callback));
export const writeFileAsPromise = promisify(fs.writeFile);


export const mkdirAsObservable = bindNodeCallback(fs.mkdir);
export const mkdirAsPromise = promisify(fs.mkdir);


export function ensureDirAsObservable(dirname: string): Observable<void> {
    return accessAsObservable(dirname)
        .pipe(
            catchError(() => mkdirAsObservable(dirname)),
        );
}
export async function ensureDirAsPromise(dirname: string): Promise<void> {
    try {
        await accessAsPromise(dirname);
    } catch (error) {
        await mkdirAsPromise(dirname);
    }
}
