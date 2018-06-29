import { Injectable, OnDestroy } from '@angular/core';
import { Repository } from 'nodegit';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { map, switchMap, tap } from 'rxjs/operators';
import { GitService } from '../../core/git.service';
import { WorkspaceService } from '../../core/workspace.service';
import { VcsFileStatus } from './models';


@Injectable()
export class VcsRepositoryService implements OnDestroy {
    private workspaceRepository: Repository | null = null;

    constructor(
        private workspace: WorkspaceService,
        private git: GitService,
    ) {
    }

    ngOnDestroy(): void {
        if (this.workspaceRepository) {
            this.workspaceRepository.free();
        }
    }

    openWorkspaceRepository(openForce = false): Observable<Repository> {
        if (!openForce && this.workspaceRepository) {
            return of(this.workspaceRepository);
        }

        return this.git
            .openRepository(this.workspace.workspacePath)
            .pipe(tap((repo) => {
                // Cache repository instance.
                this.workspaceRepository = repo;
            }));
    }

    getFileStatues(): Observable<VcsFileStatus[]> {
        return this.openWorkspaceRepository().pipe(
            switchMap(repo => this.git.getFileStatues(repo)),
            map(statues => statues.map(status =>
                VcsFileStatus.createFromStatusFile(status))),
        );
    }
}
