import Dexie from 'dexie';
import { Database } from '../../libs/database';
import { WorkspaceInfo } from '../../models/workspace';
import { ThemeService } from './theme.service';


export const WORKSPACE_INFO_ID = 1;


export class WorkspaceDatabase extends Database {
    readonly info!: Dexie.Table<WorkspaceInfo, number>;
    cachedInfo: WorkspaceInfo;

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
                theme: ThemeService.defaultTheme,
            };

            await this.info.add(info);
        }

        // Make cache.
        this.cachedInfo = info;
    }
}


export const workspaceDatabase = new WorkspaceDatabase();
