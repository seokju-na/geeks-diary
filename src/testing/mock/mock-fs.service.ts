import { Injectable } from '@angular/core';
import { flush } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';
import { FsService } from '../../app/core/fs.service';


class FsStub<R> {
    constructor(readonly name: string,
                private readonly stream: Subject<R>,
                private mockFsService: MockFsService) {
    }

    flush(data?: R): void {
        this.stream.next(data);
        this.mockFsService._deleteStub(this.name);
        flush();
    }

    error(error: any): void {
        this.stream.error(error);
        this.mockFsService._deleteStub(this.name);
        flush();
    }
}


export interface FsMatchObject {
    methodName: string;
    args: string[];
}


@Injectable()
export class MockFsService extends FsService {
    static providersForTesting = [
        {
            provide: FsService,
            useClass: MockFsService,
        },
    ];

    private stubMap = new Map<string, Subject<any>>();

    expect<R = any>(matchObj: FsMatchObject): FsStub<R> {
        const stubName = this.getStubName(matchObj);

        if (!this.stubMap.has(stubName)) {
            throw new Error(`Cannot find matched stub: ${stubName}`);
        }

        return new FsStub<R>(stubName, this.stubMap.get(stubName), this);
    }

    expectMany<R = any>(matchObjList: FsMatchObject[]): FsStub<R>[] {
        return matchObjList.map(obj => this.expect<R>(obj));
    }

    spyOn(method: keyof this): jasmine.Spy {
        return spyOn(this, method);
    }

    verify(): void {
        if (this.stubMap.size > 0) {
            this.stubMap.clear();
            throw new Error(`${this.stubMap.size} not verified stubs left.`);
        }

        this.stubMap.clear();
        this.stubMap = null;
    }

    access(path: string): Observable<void> {
        return this.createStubItem<void>(
            'access',
            [path],
        );
    }

    readFile(fileName: string, encoding = 'utf8'): Observable<Buffer> {
        return this.createStubItem<Buffer>(
            'readFile',
            [fileName, encoding],
        );
    }

    readDirectory(dirName: string): Observable<string[]> {
        return this.createStubItem<string[]>(
            'readDirectory',
            [dirName],
        );
    }

    writeFile(fileName: string, value: string, encoding = 'utf8'): Observable<void> {
        return this.createStubItem<void>(
            'writeFile',
            [fileName, value, encoding],
        );
    }

    makeDirectory(dirName: string): Observable<void> {
        return this.createStubItem<void>(
            'makeDirectory',
            [dirName],
        );
    }

    ensureDirectory(dirName: string): Observable<void> {
        return this.createStubItem<void>(
            'ensureDirectory',
            [dirName],
        );
    }

    _deleteStub(stubName: string): void {
        if (!this.stubMap.has(stubName)) {
            return;
        }

        this.stubMap.get(stubName).complete();
        this.stubMap.delete(stubName);
    }

    private createStubItem<R>(methodName: string, args: string[]): Observable<R> {
        const matchObj: FsMatchObject = { methodName, args };
        const stubName = this.getStubName(matchObj);
        const stream = new Subject<R>();

        this.stubMap.set(stubName, stream);

        return stream.asObservable();
    }

    private getStubName(matchObj: FsMatchObject): string {
        return `${matchObj.methodName}-${JSON.stringify(matchObj.args)}`;
    }
}
