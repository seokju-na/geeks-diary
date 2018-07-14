import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { IpcHubClient } from '../../libs/ipc';


@Injectable({
    providedIn: 'root',
})
export class WorkspaceService {
    private ipcClient = new IpcHubClient('workspace');

    initWorkspace(): Observable<void> {
        return from(this.ipcClient.request('initWorkspace'));
    }
}
