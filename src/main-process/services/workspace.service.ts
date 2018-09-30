import { ensureDir } from 'fs-extra';
import { GEEKS_DIARY_DIR_PATH, NOTES_DIR_PATH, WORKSPACE_DIR_PATH } from '../../core/workspace';
import { IpcActionHandler } from '../../libs/ipc';
import { GitService } from './git.service';
import { Service } from './service';


export enum WorkspaceEvents {
    CREATED = 'workspace.created',
}


/**
 * Workspace service.
 */
export class WorkspaceService extends Service {
    private git: GitService;

    constructor() {
        super('workspace');
    }

    private _initialized = false;

    get initialized(): boolean {
        return this._initialized;
    }

    async init(git: GitService): Promise<void> {
        this.git = git;

        if (await this.isWorkspaceExists()) {
            this._initialized = true;
        }
    }

    async isWorkspaceExists(): Promise<boolean> {
        return this.git.isRepositoryExists(WORKSPACE_DIR_PATH);
    }

    @IpcActionHandler('initWorkspace')
    async initWorkspace(): Promise<void> {
        await ensureDir(WORKSPACE_DIR_PATH);
        await ensureDir(GEEKS_DIARY_DIR_PATH);
        await ensureDir(NOTES_DIR_PATH);

        if (!await this.git.isRepositoryExists(WORKSPACE_DIR_PATH)) {
            await this.git.createRepository(WORKSPACE_DIR_PATH);
        }

        this._initialized = true;
        this.emit(WorkspaceEvents.CREATED);
    }

    handleError(error: any): any {
        // TODO: Handle error
        return error;
    }
}
