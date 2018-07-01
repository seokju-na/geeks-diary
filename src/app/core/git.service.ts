import { Injectable, NgZone } from '@angular/core';
import { remote } from 'electron';
import { Repository, StatusFile } from 'nodegit';
import { from as fromPromise, Observable, of } from 'rxjs';
import { catchError, mapTo } from 'rxjs/operators';
import { IpcChannelClient } from '../../common/ipc-channel';
import { enterZone } from '../../common/rx-helpers';


@Injectable()
export class GitService {
    private readonly nodeGit = remote.getGlobal('nodegit');
    private readonly ipc = new IpcChannelClient('git');

    constructor(private ngZone: NgZone) {
    }

    isRepositoryExists(dirPath: string): Observable<boolean> {
        return this.openRepository(dirPath).pipe(
            mapTo(true),
            catchError(() => of(false)),
        );
    }

    createRepository(dirPath: string): Observable<Repository> {
        return fromPromise(this.nodeGit.Repository.init(dirPath, 0))
            .pipe(enterZone<Repository>(this.ngZone));
    }

    openRepository(dirPath: string): Observable<Repository> {
        return fromPromise(this.nodeGit.Repository.open(dirPath))
            .pipe(enterZone<Repository>(this.ngZone));
    }

    clone(remoteUrl: string, dirPath: string): Observable<Repository> {
        return fromPromise(this.ipc.request('clone', { remoteUrl, dirPath }))
            .pipe(enterZone<Repository>(this.ngZone));
    }

    getFileStatues(repository: Repository): Observable<StatusFile[]> {
        return fromPromise(repository.getStatus()).pipe(enterZone<StatusFile[]>(this.ngZone));
    }
}
