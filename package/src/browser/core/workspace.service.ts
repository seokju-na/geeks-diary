import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { from, Observable } from 'rxjs';
import { IpcHubClient } from '../../libs/ipc';
import { GEEKS_DIARY_DIR_PATH, NOTES_DIR_PATH, WORKSPACE_DIR_PATH } from '../../models/workspace';
import { CoreModule } from './core.module';


export class WorkspaceConfigs {
    rootDirPath?: string = WORKSPACE_DIR_PATH;
    geeksDiaryDirPath?: string = GEEKS_DIARY_DIR_PATH;
    notesDirPath?: string = NOTES_DIR_PATH;
}


export const WORKSPACE_CONFIGS = new InjectionToken<WorkspaceConfigs>('WorkspaceConfigs');


@Injectable({
    providedIn: CoreModule,
})
export class WorkspaceService {
    private ipcClient = new IpcHubClient('workspace');
    readonly configs: WorkspaceConfigs;

    constructor(
        @Optional() @Inject(WORKSPACE_CONFIGS) configs: WorkspaceConfigs,
    ) {

        this.configs = {
            ...(new WorkspaceConfigs()),
            ...configs,
        };
    }

    initWorkspace(): Observable<void> {
        return from(this.ipcClient.request('initWorkspace'));
    }
}
