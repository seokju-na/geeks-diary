import { InjectionToken, Provider } from '@angular/core';
import Dexie from 'dexie';
import { Database } from '../../core/database';
import { WorkspaceInfo } from '../../core/workspace';
import { defaultTheme } from '../ui/style';


export const WORKSPACE_INFO_ID = 1;


export class WorkspaceDatabase extends Database {
    readonly info!: Dexie.Table<WorkspaceInfo, number>;

    cachedInfo: WorkspaceInfo;
    initialized: boolean = false;

    constructor() {
        super('Workspace');

        this.conditionalVersion(1, {
            info: 'id, theme',
        });
    }

    async init(): Promise<void> {
        let info = await this.info.get(WORKSPACE_INFO_ID);

        if (!info) {
            info = {
                id: WORKSPACE_INFO_ID,
                theme: defaultTheme,
            };

            await this.info.add(info);
        }

        // Make cache.
        this.cachedInfo = info;

        this.initialized = true;
    }

    async update(patch: Partial<WorkspaceInfo>): Promise<void> {
        if (!this.initialized) {
            await this.init();
        }

        await this.info.update(WORKSPACE_INFO_ID, patch);
    }
}


export const workspaceDatabase = new WorkspaceDatabase();


export const WORKSPACE_DATABASE = new InjectionToken<WorkspaceDatabase>('WorkspaceDatabase');


export const WorkspaceDatabaseProvider: Provider = {
    provide: WORKSPACE_DATABASE,
    useValue: workspaceDatabase,
};
