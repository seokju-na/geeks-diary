import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { EOL } from 'os';
import { from, Observable } from 'rxjs';
import {
    GitCloneOptions,
    GitCommitOptions,
    GitFindRemoteOptions,
    GitGetHistoryOptions,
    GitGetHistoryResult,
    GitSyncWithRemoteOptions,
    GitSyncWithRemoteResult,
} from '../../core/git';
import { VcsAccount, VcsAuthenticationInfo, VcsFileChange } from '../../core/vcs';
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

    commit(
        workspaceDirPath: string,
        author: VcsAccount,
        message: {
            summary: string;
            description: string;
        },
        filesToAdd: string[],
    ): Observable<string> {
        const options: GitCommitOptions = {
            workspaceDirPath,
            author,
            message: `${message.summary}${EOL}${EOL}${message.description}`,
            filesToAdd,
        };

        const commitTask = this.ipcClient.performAction<GitCommitOptions, string>(
            'commit',
            options,
        );

        return from(commitTask);
    }

    getCommitHistory(options: GitGetHistoryOptions): Observable<GitGetHistoryResult> {
        return from(this.ipcClient.performAction<GitGetHistoryOptions, GitGetHistoryResult>(
            'getCommitHistory',
            options,
        ));
    }

    isRemoteExists(options: GitFindRemoteOptions): Observable<boolean> {
        return from(this.ipcClient.performAction<GitFindRemoteOptions, boolean>(
            'isRemoteExists',
            options,
        ));
    }

    syncWithRemote(options: GitSyncWithRemoteOptions): Observable<GitSyncWithRemoteResult> {
        return from(this.ipcClient.performAction<GitSyncWithRemoteOptions, GitSyncWithRemoteResult>(
            'syncWithRemote',
            options,
        ));
    }
}
