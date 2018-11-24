import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { fastTestSetup } from '../../../test/helpers';
import { VcsAccountDummy } from '../../core/dummies';
import { VcsAccount, VcsAuthenticationInfo, VcsAuthenticationTypes, VcsRemoteRepository } from '../../core/vcs';
import { toPromise } from '../../libs/rx';
import { GitService, SharedModule } from '../shared';
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

    const accountDummy = new VcsAccountDummy();

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
            ],
        });
    });

    beforeEach(() => {
        vcs = TestBed.get(VcsService);
        removeProviderFactory = TestBed.get(VcsRemoteProviderFactory);
        accountDB = TestBed.get(VCS_ACCOUNT_DATABASE);
        git = TestBed.get(GitService);

        spyOn(removeProviderFactory, 'create').and.returnValue(new TestVcsRemoteProvider());
        vcs.setRemoveProvider('test' as any);
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
});
