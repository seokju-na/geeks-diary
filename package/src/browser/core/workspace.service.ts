import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { IpcHubClient } from '../../libs/ipc';


@Injectable({
    providedIn: 'root',
})
export class WorkspaceService {
    private ipcClient = new IpcHubClient('workspace');

    async createNewWorkspace(): Promise<void> {
        await this.ipcClient.request('createNewWorkspace');
    }

    cloneRemoteWorkspace(
        remoteUrl: string,
        authToken?: string,
    ): Observable<void> {

        const task = this.ipcClient.request<any, void>(
            'createNewWorkspace',
            { remoteUrl, authToken },
        );

        return fromPromise(task);
    }
}
