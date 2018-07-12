import { Injectable } from '@angular/core';
import { IpcHubClient } from '../../libs/ipc';


@Injectable({
    providedIn: 'root',
})
export class GitService {
    private ipcClient = new IpcHubClient('git');
}
