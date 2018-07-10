import * as path from 'path';
import { environment } from '../../environments/environment';
import { ensureDirAsPromise } from '../../libs/fs';
import { IpcActionHandler } from '../../libs/ipc';
import { Workspace } from '../../models/workspace';
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
    private workspace: Workspace | null = null;

    readonly workspaceDirPath = path.resolve(USER_DATA_PATH, 'workspace/');
    readonly geeksDiaryDirPath = path.resolve(this.workspaceDirPath, '.geeks-diary/');
    readonly notesDirPath = path.resolve(this.geeksDiaryDirPath, 'notes/');

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
            this.workspace = {
                workspaceDirPath: this.workspaceDirPath,
                geeksDiaryDirPath: this.geeksDiaryDirPath,
                notesDirPath: this.notesDirPath,
            };

            this._initialized = true;
        }
    }

    @IpcActionHandler('getWorkspace')
    getWorkspace(): Workspace {
        if (this._initialized) {
            return this.workspace;
        }

        return null;
    }

    async isWorkspaceExists(): Promise<boolean> {
        return this.git.isRepositoryExists(this.workspaceDirPath);
    }

    @IpcActionHandler('createNewWorkspace')
    async createNewWorkspace(): Promise<void> {
        await ensureDirAsPromise(this.workspaceDirPath);
        await ensureDirAsPromise(this.geeksDiaryDirPath);
        await ensureDirAsPromise(this.notesDirPath);

        await this.git.createRepository(this.workspaceDirPath);
    }

    @IpcActionHandler('cloneRemoteWorkspace')
    async cloneRemoteWorkspace(): Promise<void> {
    }

    handleError(error: any): any {
    }
}
