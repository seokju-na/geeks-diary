import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { fastTestSetup, httpRequestMatch } from '../../../../test/helpers';
import {
    VcsAccount,
    VcsAuthenticateError,
    VcsAuthenticationTypes,
    VcsRemoteRepository,
    VcsRepositoryNotExistsError,
} from '../../../core/vcs';
import { AUTH_API_URL, REPO_API_URL, VcsRemoteGithubProvider } from './vcs-remote-github-provider';


describe('browser.vcs.vcsRemote.VcsRemoteGithubProvider', () => {
    let provider: VcsRemoteGithubProvider;
    let mockHttp: HttpTestingController;
    let callback: jasmine.Spy;

    fastTestSetup();

    beforeAll(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
    });

    beforeEach(() => {
        mockHttp = TestBed.get(HttpTestingController);
        provider = new VcsRemoteGithubProvider(TestBed.get(HttpClient));
        callback = jasmine.createSpy('callback');
    });

    afterEach(() => {
        mockHttp.verify();
    });

    describe('authorizeByBasic', () => {
        const username = 'user';
        const password = 'password';
        const authorizationHeader = 'Basic dXNlcjpwYXNzd29yZA==';

        it('should return authentication info after request when authorize success.', fakeAsync(() => {
            const response = {
                html_url: 'https://github.com/user',
                name: 'user',
                email: 'user@test.com',
            };

            provider.authorizeByBasic(username, password).subscribe(callback);
            mockHttp
                .expectOne(httpRequestMatch({
                    url: AUTH_API_URL,
                    method: 'GET',
                    headers: {
                        Authorization: authorizationHeader,
                    },
                }))
                .flush(response);

            const expected: VcsAccount = {
                name: 'user',
                email: 'user@test.com',
                authentication: {
                    type: VcsAuthenticationTypes.BASIC,
                    authorizationHeader,
                    providerName: 'github',
                    username: 'user',
                    password: 'password',
                },
            };

            expect(callback).toHaveBeenCalledWith(expected);
        }));

        it('should return \'AUTHENTICATE_ERROR\' error  after request ' +
            'when authorize failed with 401 error code.', fakeAsync(() => {
            provider.authorizeByBasic(username, password).subscribe(
                () => {
                },
                callback,
            );

            mockHttp
                .expectOne(httpRequestMatch({
                    url: AUTH_API_URL,
                    method: 'GET',
                    headers: {
                        Authorization: authorizationHeader,
                    },
                }))
                .flush(null, { status: 401, statusText: 'Unauthorized' });

            expect(callback).toHaveBeenCalledWith(new VcsAuthenticateError());
        }));
    });

    describe('authorizeByOauth2Token', () => {
        const token = 'this_is_token';
        const authorizationHeader = 'token this_is_token';

        it('should return authentication info after request when success.', fakeAsync(() => {
            const response = {
                html_url: 'https://github.com/user',
                name: 'user',
                email: 'user@test.com',
            };

            provider.authorizeByOauth2Token(token).subscribe(callback);
            mockHttp
                .expectOne(httpRequestMatch({
                    url: AUTH_API_URL,
                    method: 'GET',
                    headers: {
                        Authorization: authorizationHeader,
                    },
                }))
                .flush(response);

            const expected: VcsAccount = {
                name: 'user',
                email: 'user@test.com',
                authentication: {
                    type: VcsAuthenticationTypes.OAUTH2_TOKEN,
                    authorizationHeader,
                    providerName: 'github',
                    token: 'this_is_token',
                },
            };

            expect(callback).toHaveBeenCalledWith(expected);
        }));

        it('should return \'AUTHENTICATE_ERROR\' error after request ' +
            'when authorize failed with 401 error code.', fakeAsync(() => {
            provider.authorizeByOauth2Token(token).subscribe(
                () => {
                },
                callback,
            );

            mockHttp
                .expectOne(httpRequestMatch({
                    url: AUTH_API_URL,
                    method: 'GET',
                    headers: {
                        Authorization: authorizationHeader,
                    },
                }))
                .flush(null, { status: 401, statusText: 'Unauthorized' });

            expect(callback).toHaveBeenCalledWith(new VcsAuthenticateError());
        }));
    });

    describe('isRepositoryUrlValid', () => {
        it('should return true when url is \'https://github.com/user/repo\'.', () => {
            expect(provider.isRepositoryUrlValid('https://github.com/user/repo')).toBe(true);
        });

        it('should return true when url is \'https://github.com/user/repo/\'.', () => {
            expect(provider.isRepositoryUrlValid('https://github.com/user/repo/')).toBe(true);
        });

        it('should return true when url is \'git@github.com:user/repo.git\'.', () => {
            expect(provider.isRepositoryUrlValid('git@github.com:user/repo.git')).toBe(true);
        });

        it('should return false when url is \'user/repo\'.', () => {
            expect(provider.isRepositoryUrlValid('user/repo')).toBe(false);
        });

        it('should return false when url is \'http://other-domain.com/user/repo\'.', () => {
            expect(provider.isRepositoryUrlValid('http://other-domain.com/user/repo')).toBe(false);
        });
    });

    describe('findRepository', () => {
        const url = 'https://github.com/user/repo';
        const repoApiUrl = REPO_API_URL('user', 'repo');

        const response = {
            name: 'repo',
            html_url: url,
            url: repoApiUrl,
            git_url: 'git://github.com/user/repo.git',
            ssh_url: 'ssh://github.com/user/repo',
        };

        const successExpected: VcsRemoteRepository = {
            url,
            name: 'repo',
            apiUrl: repoApiUrl,
            gitUrl: 'git://github.com/user/repo.git',
            sshUrl: 'ssh://github.com/user/repo',
        };

        it('should throw error if url is not valid', () => {
            spyOn(provider, 'isRepositoryUrlValid').and.returnValue(false);

            expect(() => provider.findRepository(url)).toThrowError();
        });

        it('should return vcs remote repository after request when success.', fakeAsync(() => {
            provider.findRepository(url).subscribe(callback);
            mockHttp
                .expectOne(httpRequestMatch({
                    url: repoApiUrl,
                    method: 'GET',
                }))
                .flush(response);

            expect(callback).toHaveBeenCalledWith(successExpected);
        }));

        it('should request with authentication info when it is provided.', fakeAsync(() => {
            const authorizationHeader = 'Some authorization header';
            const authInfo = { authorizationHeader };

            provider.findRepository(url, authInfo as any).subscribe(callback);
            mockHttp
                .expectOne(httpRequestMatch({
                    url: repoApiUrl,
                    method: 'GET',
                    headers: {
                        Authorization: authorizationHeader,
                    },
                }))
                .flush(response);
        }));

        it('should return \'REPOSITORY_NOT_EXISTS\' error after request ' +
            'when request failed with 404 error code.', fakeAsync(() => {
            provider.findRepository(url).subscribe(
                () => {
                },
                callback,
            );

            mockHttp
                .expectOne(httpRequestMatch({
                    url: repoApiUrl,
                    method: 'GET',
                }))
                .flush(null, { status: 404, statusText: 'Not found' });

            expect(callback).toHaveBeenCalledWith(new VcsRepositoryNotExistsError());
        }));
    });
});
