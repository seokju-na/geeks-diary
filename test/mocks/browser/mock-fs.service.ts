import { Provider } from '@angular/core';
import { flush } from '@angular/core/testing';
import { CopyOptions } from 'fs-extra';
import { Observable, Subject } from 'rxjs';
import { FsService } from '../../../src/browser/shared';


export class FsStub<R> {
    constructor(
        readonly matchObj: FsMatchObject,
        private readonly stream: Subject<R>,
        private mockFsService: MockFsService,
    ) {
    }

    flush(data?: R): void {
        this.stream.next(data);
        this.mockFsService._deleteStub<R>(this);
        flush();
    }

    error(error: any): void {
        this.stream.error(error);
        this.mockFsService._deleteStub<R>(this);
        flush();
    }
}


export interface FsMatchObject {
    methodName: string;
    args: any[];
}


export enum FsMatchLiterals {
    ANY = '__ANY__',
}


interface FsStubAndStreamMap<R> {
    readonly matchObj: FsMatchObject;
    readonly stream: Subject<R>;
}


/**
 * Mock for fs service. (browser.core.fsService)
 **
 * @example
 * TestBed.configureTestingModule({
 *     providers: [...MockFsService.providersForTesting],
 * });
 *
 * @example
 * let mockFs: MockFsService;
 *
 * ...
 *
 * it('some spec', fakeAsync(() => {
 *     ...
 *     const stub = mockFs.expect({
 *         methodName: 'writeFile',
 *         args: ['a.json', someValue],
 *     });
 *
 *     stub.flush(); // This make flush in fake async zone.
 *
 *     ...
 * }));
 */
export class MockFsService extends FsService {
    private attachments: FsStubAndStreamMap<any>[] = [];

    static providers(): Provider[] {
        return [
            {
                provide: FsService,
                useClass: MockFsService,
            },
        ];
    }

    expect<R = any>(matchObj: FsMatchObject): FsStub<R> {
        const stub: FsStubAndStreamMap<R> = this.findAttachment(matchObj);

        if (!stub) {
            throw new Error(`Cannot find matched stub: ${matchObj.methodName}, ${matchObj.args}`);
        }

        return new FsStub<R>(stub.matchObj, stub.stream, this);
    }

    expectMany<R = any>(matchObjList: FsMatchObject[]): FsStub<R>[] {
        return matchObjList.map(obj => this.expect<R>(obj));
    }

    spyOn(method: keyof this): jasmine.Spy {
        return spyOn(this, method);
    }

    verify(): void {
        if (this.attachments.length > 0) {
            throw new Error(`${this.attachments.length} not verified stubs left.`);
        }

        this.attachments = [];
    }

    discardPeriodStubs(): void {
        this.attachments = [];
    }

    isPathExists(path: string): Observable<boolean> {
        return this.createAttachment<boolean>(
            'isPathExists',
            [path],
        );
    }

    readFile(fileName: string): Observable<string> {
        return this.createAttachment<string>(
            'readFile',
            [fileName],
        );
    }

    readJsonFile<T>(fileName: string): Observable<T | null> {
        return this.createAttachment<T | null>(
            'readJsonFile',
            [fileName],
        );
    }

    readDirectory(dirName: string): Observable<string[]> {
        return this.createAttachment<string[]>(
            'readDirectory',
            [dirName],
        );
    }

    writeFile(fileName: string, value: string): Observable<void> {
        return this.createAttachment<void>(
            'writeFile',
            [fileName, value],
        );
    }

    writeJsonFile<T>(fileName: string, value: T): Observable<void> {
        return this.createAttachment<void>(
            'writeJsonFile',
            [fileName, value],
        );
    }

    copyFile(src: string, dest: string, options?: CopyOptions): Observable<void> {
        return this.createAttachment<void>(
            'copyFile',
            [src, dest, options],
        );
    }

    ensureDirectory(dirName: string): Observable<void> {
        return this.createAttachment<void>(
            'ensureDirectory',
            [dirName],
        );
    }

    renameFile(oldFileName: string, newFileName: string): Observable<void> {
        return this.createAttachment<void>(
            'renameFile',
            [oldFileName, newFileName],
        );
    }

    removeFile(fileName: string): Observable<void> {
        return this.createAttachment<void>(
            'removeFile',
            [fileName],
        );
    }

    _deleteStub<R>(stub: FsStub<R>): void {
        const attach = this.findAttachment(stub.matchObj);

        if (attach) {
            attach.stream.complete();

            const index = this.attachments.indexOf(attach);

            if (index !== -1) {
                this.attachments.splice(index, 1);
            }
        }
    }

    private findAttachment<R>(matchObj: FsMatchObject): FsStubAndStreamMap<R> | null {
        const matchArgs = (source: FsMatchObject, dist: FsMatchObject): boolean => {
            let allMatched = true;

            for (let i = 0; i < source.args.length; i++) {
                if (dist.args[i] === FsMatchLiterals.ANY) {
                    continue;
                }

                if (source.args[i] !== dist.args[i]) {
                    allMatched = false;
                    break;
                }
            }

            return allMatched;
        };

        return this.attachments.find(stub =>
            stub.matchObj.methodName === matchObj.methodName
            && matchArgs(stub.matchObj, matchObj),
        ) || null;
    }

    private createAttachment<R>(methodName: string, args: any[]): Observable<R> {
        const matchObj: FsMatchObject = { methodName, args };
        const stream = new Subject<R>();

        this.attachments.push({ matchObj, stream });

        return stream.asObservable();
    }
}
