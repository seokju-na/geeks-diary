import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { GitCloneOptions } from '../../libs/git';
import { IpcHubClient } from '../../libs/ipc';
import { AuthenticationInfo } from '../../models/authentication-info';


@Injectable({
    providedIn: 'root',
})
export class GitService {
    private ipcClient = new IpcHubClient('git');

    cloneRepository(
        url: string,
        localPath: string,
        authentication?: AuthenticationInfo,
    ): Observable<void> {

        const task = this.ipcClient.request<GitCloneOptions, void>(
            'cloneRepository',
            { url, localPath, authentication },
        );

        return from(task);
    }
}
