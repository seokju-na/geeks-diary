import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthenticationInfo, AuthenticationTypes } from '../../../models/authentication-info';
import { AuthenticationInfoDummy } from '../../../models/dummies';
import { AUTHENTICATION_DATABASE, AuthenticationDatabase } from '../../core/authentication-database';
import { CoreModule } from '../../core/core.module';
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


describe('browser.vcs.VcsRemoteService', () => {
    let remote: VcsRemoteService;
    let factory: VcsRemoteProviderFactory;
    let db: AuthenticationDatabase;

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    CoreModule,
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
        factory = TestBed.get(VcsRemoteProviderFactory);
        db = TestBed.get(AUTHENTICATION_DATABASE);
    });

    beforeEach(() => {
        spyOn(factory, 'create').and.returnValue(new TestVcsRemoteProvider());

        remote.setProvider('test' as any);
    });

    describe('loginWithBasicAuthorization', () => {
        const username = 'username';
        const password = 'password';
        let callback: jasmine.Spy;
        let authInfo: AuthenticationInfo;

        beforeEach(() => {
            callback = jasmine.createSpy('callback');
            authInfo = new AuthenticationInfoDummy().create(AuthenticationTypes.BASIC);
        });

        it('should authorize by basic and save authentication info in database ' +
            'after authorization.', fakeAsync(() => {
            spyOn(remote._provider, 'authorizeByBasic').and.returnValue(of(authInfo));
            spyOn(db.authentications, 'add').and.returnValue(of(null));

            remote.loginWithBasicAuthorization(username, password).subscribe(callback);
            flush();

            expect(callback).toHaveBeenCalledWith(authInfo);
            expect(remote._provider.authorizeByBasic).toHaveBeenCalledWith(username, password);
            expect(db.authentications.add).toHaveBeenCalledWith(authInfo);
        }));

        it('should authorize by basic and skip save authentication info in ' +
            'database after authorization if instance login option is true.', fakeAsync(() => {
            spyOn(remote._provider, 'authorizeByBasic').and.returnValue(of(authInfo));
            spyOn(db.authentications, 'add').and.returnValue(of(null));

            remote
                .loginWithBasicAuthorization(username, password, { instanceLogin: true })
                .subscribe(callback);

            flush();

            expect(callback).toHaveBeenCalledWith(authInfo);
            expect(remote._provider.authorizeByBasic).toHaveBeenCalledWith(username, password);
            expect(db.authentications.add).not.toHaveBeenCalledWith(authInfo);
        }));
    });

    describe('loginWithOauth2TokenAuthorization', () => {
        const token = 'token';
        let callback: jasmine.Spy;
        let authInfo: AuthenticationInfo;

        beforeEach(() => {
            callback = jasmine.createSpy('callback');
            authInfo = new AuthenticationInfoDummy().create(AuthenticationTypes.OAUTH2_TOKEN);
        });

        it('should authorize by oauth2 token and save authentication info in database ' +
            'after authorization.', fakeAsync(() => {
            spyOn(remote._provider, 'authorizeByOauth2Token').and.returnValue(of(authInfo));
            spyOn(db.authentications, 'add').and.returnValue(of(null));

            remote.loginWithOauth2TokenAuthorization(token).subscribe(callback);
            flush();

            expect(callback).toHaveBeenCalledWith(authInfo);
            expect(remote._provider.authorizeByOauth2Token).toHaveBeenCalledWith(token);
            expect(db.authentications.add).toHaveBeenCalledWith(authInfo);
        }));

        it('should authorize by oauth2 token and skip save authentication info in ' +
            'database after authorization if instance login option is true.', fakeAsync(() => {
            spyOn(remote._provider, 'authorizeByOauth2Token').and.returnValue(of(authInfo));
            spyOn(db.authentications, 'add').and.returnValue(of(null));

            remote
                .loginWithOauth2TokenAuthorization(token, { instanceLogin: true })
                .subscribe(callback);

            flush();

            expect(callback).toHaveBeenCalledWith(authInfo);
            expect(remote._provider.authorizeByOauth2Token).toHaveBeenCalledWith(token);
            expect(db.authentications.add).not.toHaveBeenCalledWith(authInfo);
        }));
    });
});
