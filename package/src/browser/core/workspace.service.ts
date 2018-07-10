import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { IpcHubClient } from '../../libs/ipc';
import { Workspace } from '../../models/workspace';
import { getWorkspace } from '../utils/after-workspace-init';


@Injectable({
    providedIn: 'root',
})
export class WorkspaceService implements OnDestroy {
    private ipcClient = new IpcHubClient('workspace');

    private _workspaceDirPath: string;
    private _geeksDiaryDirPath: string;
    private _notesDirPath: string;
    private _initialized: boolean = false;

    private _afterInitialized = new Subject<void>();

    get workspaceDirPath(): string {
        return this._workspaceDirPath;
    }

    get geeksDiaryDirPath(): string {
        return this._geeksDiaryDirPath;
    }

    get notesDirPath(): string {
        return this._notesDirPath;
    }

    get initialized(): boolean {
        return this._initialized;
    }

    constructor() {
        const workspace = getWorkspace();

        if (workspace) {
            this.init(workspace);
        }
    }

    afterInitialized(): Observable<void> {
        return this._afterInitialized.asObservable();
    }

    ngOnDestroy(): void {
        this._afterInitialized.complete();
    }

    async createNewWorkspace(): Promise<void> {
        const workspace = await this.ipcClient.request<void, Workspace>('createNewWorkspace');

        this.init(workspace);
    }

    async cloneRemoteWorkspace(
        remoteUrl: string,
        authToken?: string,
    ): Promise<void> {

        const workspace = await this.ipcClient.request<any, Workspace>(
            'createNewWorkspace',
            { remoteUrl, authToken },
        );

        this.init(workspace);
    }

    private init(workspace: Workspace): void {
        this._initialized = true;

        this._workspaceDirPath = workspace.workspaceDirPath;
        this._geeksDiaryDirPath = workspace.geeksDiaryDirPath;
        this._notesDirPath = workspace.notesDirPath;

        this._afterInitialized.next();
    }
}
