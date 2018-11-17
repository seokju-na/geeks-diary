import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { from, Observable } from 'rxjs';
import { GitCloneOptions } from '../../core/git';
import { VcsAuthenticationInfo, VcsFileChange } from '../../core/vcs';
import { IpcActionClient } from '../../libs/ipc';
import { enterZone } from '../../libs/rx';


@Injectable()
export class GitService implements OnDestroy {
    private ipcClient = new IpcActionClient('git');

    constructor(private ngZone: NgZone) {
    }

    ngOnDestroy(): void {
        this.ipcClient.destroy();
    }

    getFileChanges(dirPath: string): Observable<VcsFileChange[]> {
        return from(this.ipcClient.performAction<string, VcsFileChange[]>(
            'getFileChanges',
            dirPath,
        )).pipe(enterZone(this.ngZone));
    }

    cloneRepository(
        url: string,
        localPath: string,
        authentication?: VcsAuthenticationInfo,
    ): Observable<void> {

        const task = this.ipcClient.performAction<GitCloneOptions, void>(
            'cloneRepository',
            { url, localPath, authentication },
        );

        return from(task);
    }
}
