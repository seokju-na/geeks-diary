import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { fastTestSetup } from '../../../../test/helpers';
import { VcsAuthenticationInfoDummy } from '../../../core/dummies';
import { VcsAuthenticationInfo, VcsAuthenticationTypes } from '../../../core/vcs';
import { toPromise } from '../../../libs/rx';
import { AUTHENTICATION_DATABASE, AuthenticationDatabase, GitService, SharedModule } from '../../shared';
import { VcsRemoteProviderFactory } from './vcs-remote-provider-factory';
import { VcsRemoteService } from './vcs-remote.service';


class TestVcsRemoteProvider {
    readonly name = 'test';
    readonly apiUrl = 'https://api.test.com';

    authorizeByBasic(): void {
        throw new Error('Please create spy.');
    }

    authorizeByOauth2Token(): void {
        throw new Error('Please create spy.');
    }

    isRepositoryUrlValid(): void {
        throw new Error('Please create spy.');
    }

    findRepository(): void {
        throw new Error('Please create spy.');
    }
}


describe('browser.vcs.vcsRemote.VcsRemoteService', () => {
    let remote: VcsRemoteService;
    let remoteProviderFactory: VcsRemoteProviderFactory;
    let authDB: AuthenticationDatabase;
    let git: GitService;

    fastTestSetup();

    beforeAll(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    SharedModule,
                    HttpClientTestingModule,
                ],
                providers: [
                    VcsRemoteProviderFactory,
                    VcsRemoteService,
                ],
            });
    });

    beforeEach(() => {
        remote = TestBed.get(VcsRemoteService);
        remoteProviderFactory = TestBed.get(VcsRemoteProviderFactory);
        authDB = TestBed.get(AUTHENTICATION_DATABASE);
        git = TestBed.get(GitService);

        spyOn(remoteProviderFactory, 'create').and.returnValue(new TestVcsRemoteProvider());
        remote.setProvider('test' as any);
    });

    describe('loginWithBasicAuthorization', () => {
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
            spyOn(remote._provider, 'authorizeByBasic').and.returnValue(of(authInfo));
            spyOn(authDB.authentications, 'add').and.returnValue(of(null));

            const subscription = remote.loginWithBasicAuthorization(username, password).subscribe(callback);
            flush();

            expect(callback).toHaveBeenCalledWith(authInfo);
            expect(remote._provider.authorizeByBasic).toHaveBeenCalledWith(username, password);
            expect(authDB.authentications.add).toHaveBeenCalledWith(authInfo);

            subscription.unsubscribe();
        }));

        it('should authorize by basic and skip save authentication info in ' +
            'database after authorization if instance login option is true.', fakeAsync(() => {
            spyOn(remote._provider, 'authorizeByBasic').and.returnValue(of(authInfo));
            spyOn(authDB.authentications, 'add').and.returnValue(of(null));

            const subscription = remote
                .loginWithBasicAuthorization(username, password, { instanceLogin: true })
                .subscribe(callback);

            flush();

            expect(callback).toHaveBeenCalledWith(authInfo);
            expect(remote._provider.authorizeByBasic).toHaveBeenCalledWith(username, password);
            expect(authDB.authentications.add).not.toHaveBeenCalledWith(authInfo);

            subscription.unsubscribe();
        }));
    });

    describe('loginWithOauth2TokenAuthorization', () => {
        const token = 'token';
        let callback: jasmine.Spy;
        let authInfo: VcsAuthenticationInfo;

        beforeEach(() => {
            callback = jasmine.createSpy('callback');
            authInfo = new VcsAuthenticationInfoDummy().create(VcsAuthenticationTypes.OAUTH2_TOKEN);
        });

        it('should authorize by oauth2 token and save authentication info in database ' +
            'after authorization.', fakeAsync(() => {
            spyOn(remote._provider, 'authorizeByOauth2Token').and.returnValue(of(authInfo));
            spyOn(authDB.authentications, 'add').and.returnValue(of(null));

            const subscription = remote.loginWithOauth2TokenAuthorization(token).subscribe(callback);
            flush();

            expect(callback).toHaveBeenCalledWith(authInfo);
            expect(remote._provider.authorizeByOauth2Token).toHaveBeenCalledWith(token);
            expect(authDB.authentications.add).toHaveBeenCalledWith(authInfo);

            subscription.unsubscribe();
        }));

        it('should authorize by oauth2 token and skip save authentication info in ' +
            'database after authorization if instance login option is true.', fakeAsync(() => {
            spyOn(remote._provider, 'authorizeByOauth2Token').and.returnValue(of(authInfo));
            spyOn(authDB.authentications, 'add').and.returnValue(of(null));

            const subscription = remote
                .loginWithOauth2TokenAuthorization(token, { instanceLogin: true })
                .subscribe(callback);

            flush();

            expect(callback).toHaveBeenCalledWith(authInfo);
            expect(remote._provider.authorizeByOauth2Token).toHaveBeenCalledWith(token);
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

            await toPromise(remote.cloneRepository('url', 'localPath'));

            expect(git.cloneRepository).toHaveBeenCalledWith('url', 'localPath', latestAuthInfo);
        });

        it('should clone repository with no authentication info if authentication info is not '
            + 'exists in database.', async () => {
            await authDB.authentications.clear();

            spyOn(git, 'cloneRepository').and.returnValue(of(null));

            await toPromise(remote.cloneRepository('url', 'localPath'));

            expect(git.cloneRepository).toHaveBeenCalledWith('url', 'localPath', null);
        });
    });
});
