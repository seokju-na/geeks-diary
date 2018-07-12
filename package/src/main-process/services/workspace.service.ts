import { environment } from '../../environments/environment';
import { ensureDirAsPromise } from '../../libs/fs';
import { IpcActionHandler } from '../../libs/ipc';
import { GEEKS_DIARY_DIR_PATH, NOTES_DIR_PATH, WORKSPACE_DIR_PATH } from '../../models/workspace';
import { Service } from '../interfaces/service';
import { GitService } from './git.service';


/**
 * Workspace directory structure.
 *
 * @code
 * .
 * ├── .geeks-diary/             - Geeks diary workspace configurations.
 * |   ├── notes/                - Notes directory.
 * |   |   ├── {noteId}.json     - Note file.
 * |   |   └── ...other notes
 * |   ├── assets/               - Assets imported in note.
 * |   └── workspace.json        - Workspace configuration file.
 * └── ...other files
 */


const USER_DATA_PATH = environment.getPath('userData');


/**
 * Workspace service.
 */
export class WorkspaceService extends Service {
    private git: GitService;

    private _initialized = false;

    constructor() {
        super('workspace');
    }

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

    @IpcActionHandler('createNewWorkspace')
    async createNewWorkspace(): Promise<void> {
        await ensureDirAsPromise(WORKSPACE_DIR_PATH);
        await ensureDirAsPromise(GEEKS_DIARY_DIR_PATH);
        await ensureDirAsPromise(NOTES_DIR_PATH);

        await this.git.createRepository(WORKSPACE_DIR_PATH);
    }

    @IpcActionHandler('cloneRemoteWorkspace')
    async cloneRemoteWorkspace(): Promise<void> {
    }

    handleError(error: any): any {
    }
}
