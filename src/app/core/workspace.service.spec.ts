import { fakeAsync, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { MockFsService, MockGitService } from '../../testing/mock';
import { FsService } from './fs.service';
import { GitService } from './git.service';
import { userDataReducer } from './reducers';
import { WorkspaceService } from './workspace.service';


describe('WorkspaceService', () => {
    let workspaceService: WorkspaceService;

    let mockFsService: MockFsService;
    let mockGitService: MockGitService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot({
                    userData: userDataReducer,
                }),
            ],
            providers: [
                ...MockFsService.providersForTesting,
                ...MockGitService.providersForTesting,
                WorkspaceService,
            ],
        });
    });

    beforeEach(() => {
        workspaceService = TestBed.get(WorkspaceService);
        mockFsService = TestBed.get(FsService);
        mockGitService = TestBed.get(GitService);
    });

    afterEach(() => {
        mockFsService.verify();
        mockGitService.verify();
    });

    describe('isReady', () => {
        it('should return \'true\' as promise when repository is exists.', fakeAsync(() => {
            let result = null;

            workspaceService.isReady().then(value => result = value);
            mockGitService
                .expect({
                    methodName: 'isRepositoryExists',
                    args: [workspaceService.workspacePath],
                })
                .flush(true);

            expect(result).toBe(true);
        }));

        it('should return \'false\' as promise when repository is not exists.', fakeAsync(() => {
            let result = null;

            workspaceService.isReady().then(value => result = value);
            mockGitService
                .expect({
                    methodName: 'isRepositoryExists',
                    args: [workspaceService.workspacePath],
                })
                .flush(false);

            expect(result).toBe(false);
        }));
    });

    describe('createWorkspaceRepository', () => {
        it('should process the steps: ' +
            '1) Ensure workspace directory path, ' +
            '2) Ensure note storage directory path, ' +
            '3) Create repository at workspace directory.', fakeAsync(() => {

            workspaceService.createWorkspaceRepository().then();

            // (1) Ensure workspace directory path.
            mockFsService
                .expect({
                    methodName: 'ensureDirectory',
                    args: [workspaceService.workspacePath],
                })
                .flush(null);

            // (2) Ensure note storage directory path.
            mockFsService
                .expect({
                    methodName: 'ensureDirectory',
                    args: [workspaceService.noteStoragePath],
                })
                .flush(null);

            // (3) Create repository at workspace.
            mockGitService
                .expect({
                    methodName: 'createRepository',
                    args: [workspaceService.workspacePath],
                })
                .flush(null);
        }));
    });

    describe('cloneWorkspaceRepository', () => {
        it('should process the steps: ' +
            '1) Clone repository from remote url, ' +
            '2) Ensure note storage directory path, ', fakeAsync(() => {

            const remoteUrl = 'https://github.com/username/TIL';
            workspaceService.cloneRemoteRepository(remoteUrl).then();

            // (1) Clone repository from remote url.
            mockGitService
                .expect({
                    methodName: 'clone',
                    args: [remoteUrl, workspaceService.workspacePath],
                })
                .flush(null);

            // (2) Ensure note storage directory path.
            mockFsService
                .expect({
                    methodName: 'ensureDirectory',
                    args: [workspaceService.noteStoragePath],
                })
                .flush(null);
        }));
    });
});
