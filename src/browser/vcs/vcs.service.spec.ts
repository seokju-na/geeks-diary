import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { fastTestSetup } from '../../../test/helpers';
import { VcsAuthenticationInfoDummy } from '../../core/dummies';
import { VcsAuthenticationInfo, VcsAuthenticationTypes, VcsRemoteRepository } from '../../core/vcs';
import { toPromise } from '../../libs/rx';
import { GitService, SharedModule } from '../shared';
import {
    VCS_AUTHENTICATION_DATABASE,
    VcsAuthenticationDatabase,
    VcsAuthenticationDatabaseProvider,
} from './vcs-authentication-database';
import { VcsRemoteModule, VcsRemoteProvider, VcsRemoteProviderFactory } from './vcs-remote';
import { VcsService } from './vcs.service';


class TestVcsRemoteProvider extends VcsRemoteProvider {
    constructor() {
        super('test', 'https://api.test.com');
    }

    authorizeByBasic(username: string, password: string): Observable<VcsAuthenticationInfo> {
        throw new Error('Please create spy.');
    }

    authorizeByOauth2Token(token: string): Observable<VcsAuthenticationInfo> {
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
    let authDB: VcsAuthenticationDatabase;
    let git: GitService;

    fastTestSetup();

    beforeAll(() => {
        TestBed.configureTestingModule({
            imports: [
                SharedModule,
                HttpClientTestingModule,
                VcsRemoteModule,
            ],
            providers: [
                VcsAuthenticationDatabaseProvider,
                VcsService,
            ],
        });
    });

    beforeEach(() => {
        vcs = TestBed.get(VcsService);
        removeProviderFactory = TestBed.get(VcsRemoteProviderFactory);
        authDB = TestBed.get(VCS_AUTHENTICATION_DATABASE);
        git = TestBed.get(GitService);

        spyOn(removeProviderFactory, 'create').and.returnValue(new TestVcsRemoteProvider());
        vcs.setRemoveProvider('test' as any);
    });

    describe('loginRemoteWithBasicAuthorization', () => {
        const username = 'username';
        const password = 'password';
        let callback: jasmine.Spy;
        let authInfo: VcsAuthenticationInfo;

        beforeEach(() => {
            callback = jasmine.createSpy('callback');
            authInfo = new VcsAuthenticationInfoDummy().create(VcsAuthenticationTypes.BASIC);
        });

        it('should authorize by basic and save authentication info in database ' +
            'after authorization.', fakeAsync(() => {
            spyOn(vcs._removeProvider, 'authorizeByBasic').and.returnValue(of(authInfo));
            spyOn(authDB.authentications, 'add').and.returnValue(Promise.resolve());

            const subscription = vcs.loginRemoteWithBasicAuthorization(username, password).subscribe(callback);
            flush();

            expect(callback).toHaveBeenCalledWith(authInfo);
            expect(vcs._removeProvider.authorizeByBasic).toHaveBeenCalledWith(username, password);
            expect(authDB.authentications.add).toHaveBeenCalledWith(authInfo);

            subscription.unsubscribe();
        }));

        it('should authorize by basic and skip save authentication info in ' +
            'database after authorization if instance login option is true.', fakeAsync(() => {
            spyOn(vcs._removeProvider, 'authorizeByBasic').and.returnValue(of(authInfo));
            spyOn(authDB.authentications, 'add').and.returnValue(Promise.resolve());

            const subscription = vcs
                .loginRemoteWithBasicAuthorization(username, password, { instanceLogin: true })
                .subscribe(callback);

            flush();

            expect(callback).toHaveBeenCalledWith(authInfo);
            expect(vcs._removeProvider.authorizeByBasic).toHaveBeenCalledWith(username, password);
            expect(authDB.authentications.add).not.toHaveBeenCalledWith(authInfo);

            subscription.unsubscribe();
        }));
    });

    describe('loginRemoteWithOauth2TokenAuthorization', () => {
        const token = 'token';
        let callback: jasmine.Spy;
        let authInfo: VcsAuthenticationInfo;

        beforeEach(() => {
            callback = jasmine.createSpy('callback');
            authInfo = new VcsAuthenticationInfoDummy().create(VcsAuthenticationTypes.OAUTH2_TOKEN);
        });

        it('should authorize by oauth2 token and save authentication info in database ' +
            'after authorization.', fakeAsync(() => {
            spyOn(vcs._removeProvider, 'authorizeByOauth2Token').and.returnValue(of(authInfo));
            spyOn(authDB.authentications, 'add').and.returnValue(Promise.resolve());

            const subscription = vcs.loginRemoteWithOauth2TokenAuthorization(token).subscribe(callback);
            flush();

            expect(callback).toHaveBeenCalledWith(authInfo);
            expect(vcs._removeProvider.authorizeByOauth2Token).toHaveBeenCalledWith(token);
            expect(authDB.authentications.add).toHaveBeenCalledWith(authInfo);

            subscription.unsubscribe();
        }));

        it('should authorize by oauth2 token and skip save authentication info in ' +
            'database after authorization if instance login option is true.', fakeAsync(() => {
            spyOn(vcs._removeProvider, 'authorizeByOauth2Token').and.returnValue(of(authInfo));
            spyOn(authDB.authentications, 'add').and.returnValue(Promise.resolve());

            const subscription = vcs
                .loginRemoteWithOauth2TokenAuthorization(token, { instanceLogin: true })
                .subscribe(callback);

            flush();

            expect(callback).toHaveBeenCalledWith(authInfo);
            expect(vcs._removeProvider.authorizeByOauth2Token).toHaveBeenCalledWith(token);
            expect(authDB.authentications.add).not.toHaveBeenCalledWith(authInfo);

            subscription.unsubscribe();
        }));
    });

    describe('cloneRepository', () => {
        afterEach(async () => {
            await authDB.authentications.clear();
        });

        it('should clone repository with latest authentication info if authentication info exists '
            + 'in database.', async () => {
            const dummy = new VcsAuthenticationInfoDummy();
            let latestAuthInfo: VcsAuthenticationInfo;

            await authDB.authentications.add(dummy.create());
            await authDB.authentications.add(dummy.create());

            latestAuthInfo = dummy.create();
            await authDB.authentications.add(latestAuthInfo);

            spyOn(git, 'cloneRepository').and.returnValue(of(null));

            await toPromise(vcs.cloneRepository('url', 'localPath'));

            expect(git.cloneRepository).toHaveBeenCalledWith('url', 'localPath', latestAuthInfo);
        });

        it('should clone repository with no authentication info if authentication info is not '
            + 'exists in database.', async () => {
            await authDB.authentications.clear();

            spyOn(git, 'cloneRepository').and.returnValue(of(null));
            await toPromise(vcs.cloneRepository('url', 'localPath'));

            expect(git.cloneRepository).toHaveBeenCalledWith('url', 'localPath', undefined);
        });
    });
});
