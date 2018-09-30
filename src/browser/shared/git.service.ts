import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { GitCloneOptions } from '../../core/git';
import { VcsAuthenticationInfo } from '../../core/vcs';
import { IpcClient } from '../../libs/ipc';


@Injectable()
export class GitService {
    private ipcClient = new IpcClient('git');

    cloneRepository(
        url: string,
        localPath: string,
        authentication?: VcsAuthenticationInfo,
    ): Observable<void> {

        const task = this.ipcClient.request<GitCloneOptions, void>(
            'cloneRepository',
            { url, localPath, authentication },
        );

        return from(task);
    }
}
