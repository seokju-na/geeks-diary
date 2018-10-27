import { Inject, Injectable, InjectionToken, OnDestroy, Optional } from '@angular/core';
import { from, Observable } from 'rxjs';
import { GEEKS_DIARY_DIR_PATH, NOTES_DIR_PATH, WORKSPACE_DIR_PATH } from '../../core/workspace';
import { IpcActionClient } from '../../libs/ipc';


export class WorkspaceConfig {
    rootDirPath?: string = WORKSPACE_DIR_PATH;
    geeksDiaryDirPath?: string = GEEKS_DIARY_DIR_PATH;
    notesDirPath?: string = NOTES_DIR_PATH;
}


export const WORKSPACE_DEFAULT_CONFIG = new InjectionToken<WorkspaceConfig>('WorkspaceConfig');


@Injectable()
export class WorkspaceService implements OnDestroy {
    readonly configs: WorkspaceConfig;
    private ipcClient = new IpcActionClient('workspace');

    constructor(
        @Optional() @Inject(WORKSPACE_DEFAULT_CONFIG) config: WorkspaceConfig,
    ) {

        this.configs = {
            ...(new WorkspaceConfig()),
            ...config,
        };
    }

    ngOnDestroy(): void {
        this.ipcClient.destroy();
    }

    initWorkspace(): Observable<void> {
        return from(this.ipcClient.performAction('initWorkspace'));
    }
}
