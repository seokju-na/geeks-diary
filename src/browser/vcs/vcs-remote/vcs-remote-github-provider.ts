import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { parseGitRemoteUrl } from '../../../core/git';
import {
    VcsAccount,
    VcsAuthenticateError,
    VcsAuthenticationInfo,
    VcsAuthenticationTypes,
    VcsError,
    VcsPrimaryEmailNotExistsError,
    VcsRemoteRepository,
    VcsRepositoryNotExistsError,
} from '../../../core/vcs';
import { makeBasicAuthorizationHeader, makeOauth2TokenAuthorizationHeader } from '../../../libs/authentication';
import { VcsRemoteProvider } from './vcs-remote-provider';


interface GithubUserResponse {
    avatar_url?: string;
    html_url: string;
    name: string;
    email: string | null;
}


interface GithubRepositoryResponse {
    name: string;
    html_url: string;
    url: string;
    git_url: string;
    ssh_url: string;
}


interface GithubUserEmailResponse {
    email: string;
    primary: boolean;
}


export const API_URL = 'https://api.github.com';
export const AUTH_API_URL = `${API_URL}/user`;
export const EMAILS_API_URL = `${API_URL}/user/emails`;
export const REPO_API_URL = (owner, repo) => `${API_URL}/repos/${owner}/${repo}`;


export class VcsRemoteGithubProvider extends VcsRemoteProvider {
    constructor(private http: HttpClient) {
        super('github', API_URL);
    }

    authorizeByBasic(username: string, password: string): Observable<VcsAccount> {
        const authorizationHeader = makeBasicAuthorizationHeader(username, password);
        const headers = { Authorization: authorizationHeader };

        return this.http
            .get<GithubUserResponse>(AUTH_API_URL, {
                headers: this.getHeadersWithDefaults(headers),
            })
            .pipe(
                map((response) => {
                    const authInfo: VcsAuthenticationInfo = {
                        type: VcsAuthenticationTypes.BASIC,
                        authorizationHeader,
                        providerName: this.name,
                        username,
                        password,
                    };

                    return {
                        name: response.name,
                        email: response.email,
                        authentication: authInfo,
                    } as VcsAccount;
                }),
                catchError(error => throwError(this.parseAuthorizeError(error))),
            );
    }

    authorizeByOauth2Token(token: string): Observable<VcsAccount> {
        const authorizationHeader = makeOauth2TokenAuthorizationHeader(token);
        const headers = { Authorization: authorizationHeader };

        return this.http
            .get<GithubUserResponse>(AUTH_API_URL, {
                headers: this.getHeadersWithDefaults(headers),
            })
            .pipe(
                map((response) => {
                    const authInfo: VcsAuthenticationInfo = {
                        type: VcsAuthenticationTypes.OAUTH2_TOKEN,
                        authorizationHeader,
                        providerName: this.name,
                        token,
                    };

                    return {
                        name: response.name,
                        email: response.email,
                        authentication: authInfo,
                    } as VcsAccount;
                }),
                catchError(error => throwError(this.parseAuthorizeError(error))),
            );
    }

    getPrimaryEmail(authInfo: VcsAuthenticationInfo): Observable<string> {
        const headers = { Authorization: authInfo.authorizationHeader };

        return this.http
            .get<GithubUserEmailResponse[]>(EMAILS_API_URL, {
                headers: this.getHeadersWithDefaults(headers),
            })
            .pipe(
                map((response) => {
                    const primaryEmail = response.find(result => result.primary);

                    if (!primaryEmail) {
                        throw new VcsPrimaryEmailNotExistsError();
                    }

                    return primaryEmail.email;
                }),
                catchError(error => throwError(this.parseGetPrimaryEmailError(error))),
            );
    }

    isRepositoryUrlValid(url: string): boolean {
        const result = parseGitRemoteUrl(url);

        if (!result) {
            return false;
        }

        return result.hostname === 'github.com'
            && result.owner !== ''
            && result.name !== '';
    }

    findRepository(url: string, authInfo?: VcsAuthenticationInfo): Observable<VcsRemoteRepository> {
        if (!this.isRepositoryUrlValid(url)) {
            throw new Error('Invalid repository url.');
        }

        const { owner, name } = parseGitRemoteUrl(url);
        const repoUrl = REPO_API_URL(owner, name);

        const headers = authInfo
            ? this.getHeadersWithAuthorization(authInfo)
            : this.getHeadersWithDefaults();

        return this.http
            .get<GithubRepositoryResponse>(repoUrl, { headers })
            .pipe(
                map(response => this.parseRepositoryResponse(response)),
                catchError(error => throwError(this.parseFindRepositoryError(error))),
            );
    }

    private parseRepositoryResponse(response: GithubRepositoryResponse): VcsRemoteRepository {
        return {
            url: response.html_url,
            apiUrl: response.url,
            name: response.name,
            gitUrl: response.git_url,
            sshUrl: response.ssh_url,
        };
    }

    private parseAuthorizeError(error: HttpErrorResponse): VcsError | Error {
        if (error.status === 401) {
            return new VcsAuthenticateError();
        }

        return error;
    }

    private parseGetPrimaryEmailError(error: HttpErrorResponse): VcsError | Error {
        // In this case 'user:email' scope is not provided.
        if (error.status === 404) {
            return new VcsPrimaryEmailNotExistsError();
        }

        return error;
    }

    private parseFindRepositoryError(error: HttpErrorResponse): VcsError | Error {
        if (error.status === 404) {
            return new VcsRepositoryNotExistsError();
        }

        return error;
    }

    private getHeadersWithAuthorization(
        authInfo: VcsAuthenticationInfo,
    ): { [header: string]: string | string[] } {

        return this.getHeadersWithDefaults({
            Authorization: authInfo.authorizationHeader,
        });
    }

    private getHeadersWithDefaults(
        headers: { [key: string]: string } = {},
    ): { [header: string]: string | string[] } {

        const defaults = {
            Accept: 'application/vnd.github.v3+json',
        };

        return { ...defaults, ...headers };
    }
}
