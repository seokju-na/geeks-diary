import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { fastTestSetup } from '../../../test/helpers';
import { MockFsService } from '../../../test/mocks/browser';
import { VcsAccountDummy } from '../../core/dummies';
import {
    GitFindRemoteOptions,
    GitRemoteNotFoundError,
    GitSetRemoteOptions,
    GitSyncWithRemoteOptions,
} from '../../core/git';
import {
    VcsAccount,
    VcsAuthenticationInfo,
    VcsAuthenticationTypes,
    VcsFileChange,
    VcsFileChangeStatusTypes,
    VcsRemoteRepository,
} from '../../core/vcs';
import { toPromise } from '../../libs/rx';
import { FsService, GitService, SharedModule, WORKSPACE_DEFAULT_CONFIG, WorkspaceConfig } from '../shared';
import { VCS_ACCOUNT_DATABASE, VcsAccountDatabase, VcsAccountDatabaseProvider } from './vcs-account-database';
import { VcsRemoteModule, VcsRemoteProvider, VcsRemoteProviderFactory } from './vcs-remote';
import { VcsService } from './vcs.service';


class TestVcsRemoteProvider extends VcsRemoteProvider {
    constructor() {
        super('test', 'https://api.test.com');
    }

    authorizeByBasic(username: string, password: string): Observable<VcsAccount> {
        throw new Error('Please create spy.');
    }

    authorizeByOauth2Token(token: string): Observable<VcsAccount> {
        throw new Error('Please create spy.');
    }

    getPrimaryEmail(authInfo: VcsAuthenticationInfo): Observable<string> {
        throw new Error('Please create spy.');
    }

    isRepositoryUrlValid(url: string): boolean {
        throw new Error('Please create spy.');
    }

    findRepository(url: string, authInfo?: VcsAuthenticationInfo): Observable<VcsRemoteRepository> {
        throw new Error('Please create spy.');
    }
}


describe('browser.vcs.VcsService', () => {
    let vcs: VcsService;
    let removeProviderFactory: VcsRemoteProviderFactory;
    let accountDB: VcsAccountDatabase;
    let git: GitService;
    let mockFs: MockFsService;

    const accountDummy = new VcsAccountDummy();
    const workspaceConfig: WorkspaceConfig = {
        rootDirPath: '/test/workspace',
    };

    fastTestSetup();

    beforeAll(() => {
        TestBed.configureTestingModule({
            imports: [
                SharedModule,
                HttpClientTestingModule,
                VcsRemoteModule,
            ],
            providers: [
                VcsAccountDatabaseProvider,
                VcsService,
                { provide: WORKSPACE_DEFAULT_CONFIG, useValue: workspaceConfig },
                ...MockFsService.providers(),
            ],
        });
    });

    beforeEach(() => {
        vcs = TestBed.get(VcsService);
        removeProviderFactory = TestBed.get(VcsRemoteProviderFactory);
        accountDB = TestBed.get(VCS_ACCOUNT_DATABASE);
        git = TestBed.get(GitService);
        mockFs = TestBed.get(FsService);

        spyOn(removeProviderFactory, 'create').and.returnValue(new TestVcsRemoteProvider());
        vcs.setRemoveProvider('test' as any);
    });

    afterEach(async () => {
        await accountDB.accounts.clear();
        await accountDB.metadata.clear();

        mockFs.verify();
    });

    describe('loginRemoteWithBasicAuthorization', () => {
        const username = 'username';
        const password = 'password';
        let callback: jasmine.Spy;
        let account: VcsAccount;

        beforeEach(() => {
            callback = jasmine.createSpy('callback');
            account = accountDummy.create(VcsAuthenticationTypes.BASIC);
        });

        it('should authorize by basic and save authentication info in database ' +
            'after authorization.', fakeAsync(() => {
            spyOn(vcs._removeProvider, 'authorizeByBasic').and.returnValue(of(account));
            spyOn(accountDB.accounts, 'add').and.returnValue(Promise.resolve());

            const subscription = vcs.loginRemoteWithBasicAuthorization(username, password).subscribe(callback);
            flush();

            expect(callback).toHaveBeenCalledWith(account);
            expect(vcs._removeProvider.authorizeByBasic).toHaveBeenCalledWith(username, password);
            expect(accountDB.accounts.add).toHaveBeenCalledWith(account);

            subscription.unsubscribe();
        }));

        it('should authorize by basic and skip save authentication info in ' +
            'database after authorization if instance login option is true.', fakeAsync(() => {
            spyOn(vcs._removeProvider, 'authorizeByBasic').and.returnValue(of(account));
            spyOn(accountDB.accounts, 'add').and.returnValue(Promise.resolve());

            const subscription = vcs
                .loginRemoteWithBasicAuthorization(username, password, { instanceLogin: true })
                .subscribe(callback);

            flush();

            expect(callback).toHaveBeenCalledWith(account);
            expect(vcs._removeProvider.authorizeByBasic).toHaveBeenCalledWith(username, password);
            expect(accountDB.accounts.add).not.toHaveBeenCalledWith(account);

            subscription.unsubscribe();
        }));
    });

    describe('loginRemoteWithOauth2TokenAuthorization', () => {
        const token = 'token';
        let callback: jasmine.Spy;
        let account: VcsAccount;

        beforeEach(() => {
            callback = jasmine.createSpy('callback');
            account = accountDummy.create(VcsAuthenticationTypes.OAUTH2_TOKEN);
        });

        it('should authorize by oauth2 token and save authentication info in database ' +
            'after authorization.', fakeAsync(() => {
            spyOn(vcs._removeProvider, 'authorizeByOauth2Token').and.returnValue(of(account));
            spyOn(accountDB.accounts, 'add').and.returnValue(Promise.resolve());

            const subscription = vcs.loginRemoteWithOauth2TokenAuthorization(token).subscribe(callback);
            flush();

            expect(callback).toHaveBeenCalledWith(account);
            expect(vcs._removeProvider.authorizeByOauth2Token).toHaveBeenCalledWith(token);
            expect(accountDB.accounts.add).toHaveBeenCalledWith(account);

            subscription.unsubscribe();
        }));

        it('should authorize by oauth2 token and skip save authentication info in ' +
            'database after authorization if instance login option is true.', fakeAsync(() => {
            spyOn(vcs._removeProvider, 'authorizeByOauth2Token').and.returnValue(of(account));
            spyOn(accountDB.accounts, 'add').and.returnValue(Promise.resolve());

            const subscription = vcs
                .loginRemoteWithOauth2TokenAuthorization(token, { instanceLogin: true })
                .subscribe(callback);

            flush();

            expect(callback).toHaveBeenCalledWith(account);
            expect(vcs._removeProvider.authorizeByOauth2Token).toHaveBeenCalledWith(token);
            expect(accountDB.accounts.add).not.toHaveBeenCalledWith(account);

            subscription.unsubscribe();
        }));
    });

    describe('getPrimaryEmailFromRemote', () => {
        let callback: jasmine.Spy;
        let account: VcsAccount;

        beforeEach(() => {
            callback = jasmine.createSpy('callback');
            account = accountDummy.create();
        });

        it('should get primary email from remote.', fakeAsync(() => {
            spyOn(vcs, 'getPrimaryEmailFromRemote').and.returnValue(of('abc@test.com'));

            const subscription = vcs.getPrimaryEmailFromRemote(account).subscribe(callback);

            expect(callback).toHaveBeenCalledWith('abc@test.com');
            subscription.unsubscribe();
        }));
    });

    describe('cloneRepository', () => {
        afterEach(async () => {
            await accountDB.accounts.clear();
        });

        it('should clone repository with latest authentication info if authentication info exists '
            + 'in database.', async () => {
            let latestAccount: VcsAccount;

            await accountDB.accounts.add(accountDummy.create());
            await accountDB.accounts.add(accountDummy.create());

            latestAccount = accountDummy.create();
            await accountDB.accounts.add(latestAccount);

            spyOn(git, 'cloneRepository').and.returnValue(of(null));

            await toPromise(vcs.cloneRepository('url', 'localPath'));

            expect(git.cloneRepository).toHaveBeenCalledWith('url', 'localPath', latestAccount.authentication);
        });

        it('should clone repository with no authentication info if authentication info is not '
            + 'exists in database.', async () => {
            await accountDB.accounts.clear();

            spyOn(git, 'cloneRepository').and.returnValue(of(null));
            await toPromise(vcs.cloneRepository('url', 'localPath'));

            expect(git.cloneRepository).toHaveBeenCalledWith('url', 'localPath', undefined);
        });
    });

    describe('fetchCommitHistory', () => {
        it('should reset next fetching options.', () => {
        });
    });

    describe('fetchMoreCommitHistory', () => {
    });

    describe('keepDirectory', () => {
        it('should do nothing if keep file already exists.', fakeAsync(() => {
            spyOn(git, 'commit');

            vcs.keepDirectory('/test/workspace/label').then();

            mockFs
                .expect({
                    methodName: 'isPathExists',
                    args: ['/test/workspace/label/.gitkeep'],
                })
                .flush(true);

            expect(git.commit).not.toHaveBeenCalled();
        }));

        it('should create keep file and commit if keep file is not exists.', fakeAsync(() => {
            const keepFilePath = '/test/workspace/label/.gitkeep';

            spyOn(git, 'commit').and.returnValue(of(null));

            vcs.keepDirectory('/test/workspace/label').then();

            mockFs
                .expect({
                    methodName: 'isPathExists',
                    args: [keepFilePath],
                })
                .flush(false);

            mockFs
                .expect({
                    methodName: 'writeFile',
                    args: [keepFilePath, ''],
                })
                .flush(null);

            expect(git.commit).toHaveBeenCalledWith(
                '/test/workspace',
                {
                    name: 'Geeks Diary',
                    email: '(BLANK)',
                    authentication: null,
                } as VcsAccount,
                { summary: 'Keep Directory', description: '' },
                [
                    {
                        status: VcsFileChangeStatusTypes.NEW,
                        filePath: 'label/.gitkeep',
                        absoluteFilePath: keepFilePath,
                        workingDirectoryPath: '/test/workspace',
                    },
                ] as VcsFileChange[],
            );
        }));
    });

    describe('canSyncRepository', () => {
        it('should return true if fetch account and remote exists.', async () => {
            const fetchAccount = accountDummy.create();
            await accountDB.addNewAccount(fetchAccount);
            await accountDB.setRepositoryFetchAccountAs(fetchAccount);

            spyOn(git, 'isRemoteExists').and.returnValue(of(true));

            const result = await vcs.canSyncRepository();

            expect(result).toBe(true);
            expect(git.isRemoteExists).toHaveBeenCalledWith({
                workspaceDirPath: workspaceConfig.rootDirPath,
                remoteName: 'origin',
            } as GitFindRemoteOptions);
        });

        it('should return false if fetch account not exists.', async () => {
            await accountDB.metadata.clear();
            spyOn(git, 'isRemoteExists').and.returnValue(of(true));

            const result = await vcs.canSyncRepository();
            expect(result).toBe(false);
        });

        it('should return false if remote is not exists.', async () => {
            const fetchAccount = accountDummy.create();
            await accountDB.addNewAccount(fetchAccount);
            await accountDB.setRepositoryFetchAccountAs(fetchAccount);

            spyOn(git, 'isRemoteExists').and.returnValue(of(false));

            const result = await vcs.canSyncRepository();
            expect(result).toBe(false);
        });
    });

    describe('getRepositoryFetchAccount', () => {
        it('should return fetch account if its exists.', fakeAsync(() => {
            const fetchAccount = accountDummy.create();
            spyOn(accountDB, 'getRepositoryFetchAccount').and.callFake(() => Promise.resolve(fetchAccount));

            const callback = jasmine.createSpy('get repository fetch account callback');
            const subscription = vcs.getRepositoryFetchAccount().subscribe(callback);
            flush();

            expect(callback).toHaveBeenCalledWith(fetchAccount);
            subscription.unsubscribe();
        }));

        it('should return null if fetch account is not exists.', fakeAsync(() => {
            spyOn(accountDB, 'getRepositoryFetchAccount').and.callFake(() => Promise.resolve(undefined));

            const callback = jasmine.createSpy('get repository fetch account callback');
            const subscription = vcs.getRepositoryFetchAccount().subscribe(callback);
            flush();

            expect(callback).toHaveBeenCalledWith(null);
            subscription.unsubscribe();
        }));
    });

    describe('getRemoteRepositoryUrl', () => {
        it('should return null if remote not found.', () => {
            spyOn(git, 'getRemoteUrl').and.returnValue(throwError(new GitRemoteNotFoundError()));

            const callback = jasmine.createSpy('get remote repository url callback');
            const subscription = vcs.getRemoteRepositoryUrl().subscribe(callback);

            expect(git.getRemoteUrl).toHaveBeenCalledWith({
                workspaceDirPath: workspaceConfig.rootDirPath,
                remoteName: 'origin',
            } as GitFindRemoteOptions);
            expect(callback).toHaveBeenCalledWith(null);

            subscription.unsubscribe();
        });

        it('should return remote url.', () => {
            spyOn(git, 'getRemoteUrl').and.returnValue(of('remote_repository_url'));

            const callback = jasmine.createSpy('get remote repository url callback');
            const subscription = vcs.getRemoteRepositoryUrl().subscribe(callback);

            expect(git.getRemoteUrl).toHaveBeenCalledWith({
                workspaceDirPath: workspaceConfig.rootDirPath,
                remoteName: 'origin',
            } as GitFindRemoteOptions);
            expect(callback).toHaveBeenCalledWith('remote_repository_url');

            subscription.unsubscribe();
        });
    });

    describe('setRemoteRepository', () => {
        it('should save fetch account to account database and call set remote method '
            + 'from git service.', fakeAsync(() => {
            const fetchAccount = accountDummy.create();
            const remoteUrl = 'https://github.com/seokju-na/geeks-diary.git';

            spyOn(accountDB, 'setRepositoryFetchAccountAs').and.callFake(() => Promise.resolve(null));
            spyOn(git, 'setRemote').and.returnValue(of(null));

            const callback = jasmine.createSpy('set remote repository');
            const subscription = vcs.setRemoteRepository(fetchAccount, remoteUrl).subscribe(callback);

            flush();

            expect(accountDB.setRepositoryFetchAccountAs).toHaveBeenCalledWith(fetchAccount);
            expect(git.setRemote).toHaveBeenCalledWith({
                workspaceDirPath: workspaceConfig.rootDirPath,
                remoteName: 'origin',
                remoteUrl,
            } as GitSetRemoteOptions);

            subscription.unsubscribe();
        }));
    });

    describe('syncRepository', () => {
        it('should call sync method with fetch account.', () => {
            const fetchAccount = accountDummy.create();

            spyOn(accountDB, 'getRepositoryFetchAccount').and.returnValue(of(fetchAccount));
            spyOn(git, 'syncWithRemote').and.returnValue(of(null));

            const callback = jasmine.createSpy('sync repository callback');
            const subscription = vcs.syncRepository().subscribe(callback);

            expect(git.syncWithRemote).toHaveBeenCalledWith({
                workspaceDirPath: workspaceConfig.rootDirPath,
                remoteName: 'origin',
                authentication: fetchAccount.authentication,
                author: fetchAccount,
            } as GitSyncWithRemoteOptions);
            subscription.unsubscribe();
        });
    });
});
