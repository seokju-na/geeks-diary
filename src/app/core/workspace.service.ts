import { Injectable } from '@angular/core';
import * as path from 'path';
import { toPromise } from '../../common/rx-helpers';
import { environment } from '../../environments/environment';
import { FsService } from './fs.service';
import { GitService } from './git.service';


@Injectable()
export class WorkspaceService {
    readonly workspacePath: string;
    readonly noteStoragePath: string;

    constructor(
        private fsService: FsService,
        private gitService: GitService,
    ) {

        this.workspacePath = path.resolve(environment.getPath('userData'), 'workspace/');
        this.noteStoragePath = path.resolve(this.workspacePath, 'notes/');
    }

    async isReady(): Promise<boolean> {
        return toPromise(this.gitService.isRepositoryExists(this.workspacePath));
    }

    async createWorkspaceRepository(): Promise<void> {
        // Make workspace directory.
        await toPromise(this.fsService.ensureDirectory(this.workspacePath));

        // Make note storage directory.
        await toPromise(this.fsService.ensureDirectory(this.noteStoragePath));

        // Create repository at workspace.
        await toPromise(this.gitService.createRepository(this.workspacePath));
    }

    async cloneRemoteRepository(remoteUrl: string): Promise<void> {
        // Clone repository.
        await toPromise(this.gitService.clone(remoteUrl, this.workspacePath));

        // Make note storage directory.
        await toPromise(this.fsService.ensureDirectory(this.noteStoragePath));
    }
}
