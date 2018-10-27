import { Injectable, OnDestroy } from '@angular/core';
import { from, Observable } from 'rxjs';
import { GitCloneOptions } from '../../core/git';
import { VcsAuthenticationInfo } from '../../core/vcs';
import { IpcActionClient } from '../../libs/ipc';


@Injectable()
export class GitService implements OnDestroy {
    private ipcClient = new IpcActionClient('git');

    ngOnDestroy(): void {
        this.ipcClient.destroy();
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
