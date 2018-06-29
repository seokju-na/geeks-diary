import { Injectable } from '@angular/core';
import { flush } from '@angular/core/testing';
import { Repository, StatusFile } from 'nodegit';
import { Observable, Subject } from 'rxjs';
import { GitService } from '../../app/core/git.service';


class GitServiceStub<R> {
    constructor(
        readonly name: string,
        private readonly stream: Subject<R>,
        private mockNodeGitService: MockGitService,
    ) {
    }

    flush(data?: R): void {
        this.stream.next(data);
        this.mockNodeGitService._deleteStub(this.name);
        flush();
    }

    error(error: any): void {
        this.stream.error(error);
        this.mockNodeGitService._deleteStub(this.name);
        flush();
    }
}


export interface GitServiceMatchObject {
    methodName: string;
    args: string[];
}


@Injectable()
export class MockGitService extends GitService {
    static providersForTesting = [
        { provide: GitService, useClass: MockGitService },
    ];

    private stubMap = new Map<string, Subject<any>>();

    expect<R = any>(matchObj: GitServiceMatchObject): GitServiceStub<R> {
        const stubName = this.getStubName(matchObj);

        if (!this.stubMap.has(stubName)) {
            throw new Error(`Cannot find matched stub: ${stubName}`);
        }

        return new GitServiceStub<R>(stubName, this.stubMap.get(stubName), this);
    }

    verify(): void {
        if (this.stubMap.size > 0) {
            this.stubMap.clear();
            throw new Error(`${this.stubMap.size} not verified stubs left.`);
        }

        this.stubMap.clear();
        this.stubMap = null;
    }

    isRepositoryExists(dirPath: string): Observable<boolean> {
        return this.createStub<boolean>('isRepositoryExists', [dirPath]);
    }

    createRepository(dirPath: string): Observable<Repository> {
        return this.createStub<Repository>('createRepository', [dirPath]);
    }

    openRepository(dirPath: string): Observable<Repository> {
        return this.createStub<Repository>('openRepository', [dirPath]);
    }

    clone(remoteUrl: string, dirPath: string): Observable<Repository> {
        return this.createStub<Repository>('clone', [remoteUrl, dirPath]);
    }

    getFileStatues(repository: Repository): Observable<StatusFile[]> {
        return this.createStub<StatusFile[]>('getFileStatues', [repository]);
    }

    _deleteStub(stubName: string): void {
        if (!this.stubMap.has(stubName)) {
            return;
        }

        this.stubMap.get(stubName).complete();
        this.stubMap.delete(stubName);
    }

    private createStub<R>(methodName: string, args: any[]): Observable<R> {
        const matchObj: GitServiceMatchObject = { methodName, args };
        const stubName = this.getStubName(matchObj);
        const stream = new Subject<R>();

        this.stubMap.set(stubName, stream);

        return stream.asObservable();
    }

    private getStubName(matchObj: GitServiceMatchObject): string {
        return `${matchObj.methodName}-${JSON.stringify(matchObj.args)}`;
    }
}
