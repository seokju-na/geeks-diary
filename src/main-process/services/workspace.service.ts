import { ensureDir, ensureFile } from 'fs-extra';
import * as path from 'path';
import { VcsFileChangeStatusTypes } from '../../core/vcs';
import { ASSETS_DIR_PATH, GEEKS_DIARY_DIR_PATH, NOTES_DIR_PATH, WORKSPACE_DIR_PATH } from '../../core/workspace';
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
    private _initialized = false;

    get initialized(): boolean {
        return this._initialized;
    }

    constructor(private git: GitService) {
        super('workspace');
    }

    async init(): Promise<void> {
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

        if (!await this.isWorkspaceExists()) {
            await this.git.createRepository(WORKSPACE_DIR_PATH);

            // Keep notes directory with '.gitkeep'.
            // You cannot track the first Note File without this.
            await ensureFile(path.resolve(NOTES_DIR_PATH, '.gitkeep'));
            await ensureFile(path.resolve(ASSETS_DIR_PATH, '.gitkeep'));

            await this.git.commit({
                workspaceDirPath: WORKSPACE_DIR_PATH,
                message: 'Initial commit',
                fileChanges: [
                    {
                        workingDirectoryPath: WORKSPACE_DIR_PATH,
                        filePath: '.geeks-diary/notes/.gitkeep',
                        absoluteFilePath: path.resolve(NOTES_DIR_PATH, '.gitkeep'),
                        status: VcsFileChangeStatusTypes.NEW,
                    },
                    {
                        workingDirectoryPath: WORKSPACE_DIR_PATH,
                        filePath: '.geeks-diary/assets/.gitkeep',
                        absoluteFilePath: path.resolve(ASSETS_DIR_PATH, '.gitkeep'),
                        status: VcsFileChangeStatusTypes.NEW,
                    },
                ],
                author: {
                    name: 'Geeks Diary',
                    email: '(BLANK)',
                    authentication: null,
                },
            });
        }

        this._initialized = true;
        this.emit(WorkspaceEvents.CREATED);
    }

    handleError(error: any): any {
        // TODO: Handle error
        return error;
    }
}
